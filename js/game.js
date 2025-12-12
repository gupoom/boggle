import { WordBoard } from './board.js';
import { assembleHangul } from './rules.js';
import { GAME_CONFIG } from './config.js';

// --- [추가] 효과음 생성기 (SoundManager) ---
const SoundManager = {
    ctx: null,
    isMuted: false, // 기본값: 소리 켜짐 (설정과 연동 필요)

    init: function() {
        if (!this.ctx) {
            // 브라우저 오디오 객체 생성
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    // 1. 타일 선택 소리 (뽁!)
    playTap: function() {
        if (this.isMuted || !this.ctx) return;
        this.playTone(800, 'sine', 0.1); 
    },

    // 2. 정답 소리 (띠링!)
    playSuccess: function() {
        if (this.isMuted || !this.ctx) return;
        // 화음 효과 (도-미)
        this.playTone(523.25, 'sine', 0.2); // 도
        setTimeout(() => this.playTone(659.25, 'sine', 0.3), 100); // 미
    },

    // 3. 오답/이미 찾음 소리 (뿝...)
    playFail: function() {
        if (this.isMuted || !this.ctx) return;
        this.playTone(150, 'sawtooth', 0.3); // 낮은 톱니파
    },

    // 4. 레벨업/보너스 소리 (샤라랑~)
    playBonus: function() {
        if (this.isMuted || !this.ctx) return;
        this.playTone(523.25, 'sine', 0.1);
        setTimeout(() => this.playTone(659.25, 'sine', 0.1), 80);
        setTimeout(() => this.playTone(783.99, 'sine', 0.2), 160);
        setTimeout(() => this.playTone(1046.50, 'sine', 0.4), 240);
    },

    // 소리 합성 함수 (주파수, 파형, 지속시간)
    playTone: function(freq, type, duration) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type; 
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        // 볼륨이 자연스럽게 줄어들도록 (페이드 아웃)
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }
};

let gridData = [];
let selectedIndices = [];
let foundWords = new Set();
let possibleWords = new Map(); 
let isDragging = false;

let currentMode = 'practice';
let currentScore = 0;
let timerInterval = null;
let timeLeft = GAME_CONFIG.CHALLENGE_TIME;
let timeElapsed = 0;
let currentGridSize = 4;
let currentLevel = 'all';

let totalWordCount = 0;
let currentHiddenWord = "";
let currentHiddenCategory = "";

let hiddenWordPath = [];
let currentHintStep = 0;
let lastActionTime = Date.now();

// [추가] 설정 변수
let isVibrationOn = true;

const COMBINED_DICTIONARY = new Set(); 
const LEVEL_DICTIONARY = new Set();

const gridElement = document.getElementById('grid');
const wordDisplay = document.getElementById('currentWord');
const wordListElement = document.getElementById('wordList');

const statScoreGroup = document.getElementById('statScoreGroup');
const statWordGroup = document.getElementById('statWordGroup');
const foundCountEl = document.getElementById('foundCount');
const totalCountEl = document.getElementById('totalCount');
const btnHint = document.getElementById('btnHint');

const scoreElement = document.getElementById('score');
const targetScoreElement = document.getElementById('targetScoreDisplay');
const timerElement = document.getElementById('timer');
const resultModal = document.getElementById('resultModal');
const optionModal = document.getElementById('optionModal');
// [추가] 설정 모달 참조
const settingsModal = document.getElementById('settingsModal');
const introScreen = document.getElementById('introScreen');

const hintBar = document.getElementById('hintBar');
const hintText = document.getElementById('hintText');
const hintScore = document.getElementById('hintScore');
const hintTooltip = document.getElementById('hintTooltip');

const countdownOverlay = document.getElementById('countdownOverlay');
const countdownText = document.getElementById('countdownText');
const countdownCard = document.getElementById('countdownCard');

if (targetScoreElement) {
    targetScoreElement.textContent = `/ ${GAME_CONFIG.TARGET_SCORE}`;
}

document.getElementById('hintBar').addEventListener('click', showHint);

// --- [추가/수정] 기능 함수들 ---

// 1. 세로 화면 잠금 시도 함수
async function lockPortrait() {
    try {
        if (screen.orientation && screen.orientation.lock) {
            await screen.orientation.lock("portrait");
        } else if (screen.lockOrientation) {
             screen.lockOrientation("portrait");
        }
    } catch (e) {
        console.log("세로 모드 고정 실패 (지원하지 않는 브라우저일 수 있음):", e);
    }
}

// 2. 진동 토글 함수
window.toggleVibration = function(checkbox) {
    isVibrationOn = checkbox.checked;
    if (isVibrationOn) triggerHaptic('tap');
}

window.toggleSound = function(checkbox) {
    SoundManager.isMuted = !checkbox.checked;
    if (!SoundManager.isMuted) {
        SoundManager.init(); // 소리를 켜면 오디오 시스템 준비
        SoundManager.playSuccess(); // 테스트 소리
    }
}

// 3. 설정 모달 열기/닫기
window.openSettingsModal = function() {
    triggerHaptic('tap');
    settingsModal.classList.add('active');
}
window.closeSettingsModal = function() {
    triggerHaptic('tap');
    settingsModal.classList.remove('active');
}

window.useHint = function() {
    triggerHaptic('tap');
    showIdleHint();
}

function enterFullScreen() {
    const doc = window.document;
    const docEl = doc.documentElement;
    const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    
    if (requestFullScreen) {
        requestFullScreen.call(docEl).catch(err => {
            console.log("풀스크린 모드 진입 실패:", err);
        });
    }
}

// ----------------------------------------------------
// [중요] 게임 시작 로직 분리
// ----------------------------------------------------

// Case A: 인트로에서 처음 시작할 때 (광고 X, 카운트다운 X)
window.startFromIntro = function() {

    // 2. 인트로 숨기기
    introScreen.classList.add('hidden');
    
    // 3. 즉시 게임 초기화 (카운트다운/광고 없음)
    triggerHaptic('tap');
    initGame();
};

// Case B: 실제 게임(카운트다운) 시퀀스 (광고 후 콜백용)
function runCountdownSequence() {
    resultModal.classList.remove('active');
    countdownOverlay.classList.add('active');
    
    triggerHaptic('tap'); 

    let count = 3;
    updateCount(count);

    const countInterval = setInterval(() => {
        count--;
        if (count > 0) {
            updateCount(count);
        } else {
            clearInterval(countInterval);
            countdownOverlay.classList.remove('active');
            initGame();
        }
    }, 900);
}

// Case C: [새 게임] 버튼 눌렀을 때 (광고 O -> 카운트다운 O)
window.startWithCountdown = function() {

    // 광고 로직: 광고 매니저가 있고 + 광고 제거를 안 했다면?
    if (typeof AdManager !== 'undefined' && !AdManager.isAdRemoved) {
        console.log("광고를 표시하고, 닫히면 게임을 시작합니다.");
        AdManager.showInterstitial(runCountdownSequence);
    } else {
        console.log("광고 없이 카운트다운 시작");
        runCountdownSequence();
    }
};

// 기존 함수에 적용
window.startFromIntro = function() {
    // enterFullScreen();  <-- 이건 지우셨죠? (OK)
    
    introScreen.classList.add('hidden');
    triggerHaptic('tap');
    initGame();
};

window.startWithCountdown = function() {
    // enterFullScreen(); <-- 이것도 지우셨죠? (OK)

    if (typeof AdManager !== 'undefined' && !AdManager.isAdRemoved) {
        AdManager.showInterstitial(runCountdownSequence);
    } else {
        runCountdownSequence();
    }
};

// ----------------------------------------------------

function isMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /android|ipad|iphone|ipod/i.test(userAgent);
}

function updateCount(num) {
    countdownText.textContent = num;
    countdownCard.classList.remove('card-flip-action');
    void countdownCard.offsetWidth; 
    countdownCard.classList.add('card-flip-action');
    triggerHaptic('tap'); 
}

window.startGame = function() {
    window.startWithCountdown();
};

// [수정] 진동 설정(isVibrationOn) 반영
function triggerHaptic(type) {
    if (!isVibrationOn) return; // 꺼져있으면 리턴

    if (window.navigator && window.navigator.vibrate) {
        if (type === 'tap') window.navigator.vibrate(40); 
        else if (type === 'success') window.navigator.vibrate([50, 50, 50]); 
        else if (type === 'fail') window.navigator.vibrate(300); 
    }
}

function solveBoard(grid, size) {
    const found = new Map();
    const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

    function search(idx, path) {
        if (path.length >= 3) {
            const chars = path.map(p => grid[p]);
            const word = assembleHangul(chars, COMBINED_DICTIONARY);
            if (COMBINED_DICTIONARY.has(word) && !found.has(word)) {
                found.set(word, path[0]);
            }
        }
        if (path.length >= 7) return;

        const r = Math.floor(idx / size);
        const c = idx % size;

        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            const nIndex = nr * size + nc;
            
            if (nr >= 0 && nr < size && nc >= 0 && nc < size && !path.includes(nIndex)) {
                search(nIndex, [...path, nIndex]);
            }
        }
    }
    
    for (let i = 0; i < size * size; i++) {
        search(i, [i]);
    }
    return found;
}

function showFloatingText(x, y, text) {
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y - 50}px`; 
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
}

function triggerConfetti() {
    if (typeof confetti === 'function') {
        requestAnimationFrame(() => {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, zIndex: 20000 });
        });
    }
}

function initLevelDictionary() {
    if (typeof LEVEL_WORDS !== 'undefined') {
        Object.values(LEVEL_WORDS).forEach(wordList => {
            if (Array.isArray(wordList)) {
                wordList.forEach(item => {
                    const word = (typeof item === 'string') ? item : item.word;
                    LEVEL_DICTIONARY.add(word);
                    COMBINED_DICTIONARY.add(word); 
                });
            }
        });
    }
    
    if (typeof GAME_DICTIONARY !== 'undefined') {
        Object.keys(GAME_DICTIONARY).forEach(word => {
            COMBINED_DICTIONARY.add(word);
        });
    }
}
initLevelDictionary();

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

window.setMode = function(mode) {
    currentMode = mode;
    document.getElementById('btnPractice').className = mode === 'practice' ? 'mode-btn active' : 'mode-btn';
    document.getElementById('btnChallenge').className = mode === 'challenge' ? 'mode-btn active' : 'mode-btn';
    triggerHaptic('tap'); 
    startWithCountdown();
}

function updateStatsUI() {
    if (currentMode === 'practice') {
        if(statScoreGroup) statScoreGroup.style.display = 'none';
        if(statWordGroup) statWordGroup.style.display = 'flex';
        if(btnHint) btnHint.classList.remove('hidden');
        if(targetScoreElement) targetScoreElement.style.visibility = 'hidden';
    } else { 
        if(statScoreGroup) statScoreGroup.style.display = 'flex';
        if(statWordGroup) statWordGroup.style.display = 'flex'; 
        if(btnHint) btnHint.classList.add('hidden');
        if(targetScoreElement) targetScoreElement.style.visibility = 'visible';
    }
}

window.openOptionModal = function(type) {
    triggerHaptic('tap'); 
    const list = document.getElementById('optList');
    const title = document.getElementById('optTitle');
    list.innerHTML = '';
    
    list.classList.remove('grid-options', 'level-options');

    if (type === 'grid') {
        title.textContent = "보드 크기 선택";
        list.classList.add('grid-options'); 
        
        const sizes = [4, 5, 6];
        sizes.forEach(s => {
            const btn = document.createElement('button');
            btn.className = `option-btn ${currentGridSize == s ? 'selected' : ''}`;
            btn.innerHTML = `<span style="font-size:24px;">${s}x${s}</span>`;
            btn.onclick = () => {
                currentGridSize = s;
                document.getElementById('txtGridSize').textContent = `${s}x${s}`;
                closeOptionModal();
                startWithCountdown();
            };
            list.appendChild(btn);
        });
    } else if (type === 'level') {
        title.textContent = "숨은 단어 난이도";
        list.classList.add('level-options');
        
        const levels = [
            {id:'all', name:'랜덤'},
            {id:'1', name:'1단계 (3글자)'},
            {id:'2', name:'2단계 (4글자)'},
            {id:'3', name:'3단계 (5글자+)'},
            {id:'special', name:'신조어'}
        ];
        levels.forEach(lv => {
            const btn = document.createElement('button');
            btn.className = `option-btn ${currentLevel == lv.id ? 'selected' : ''}`;
            btn.textContent = lv.name;
            btn.onclick = () => {
                currentLevel = lv.id;
                document.getElementById('txtLevel').textContent = lv.name.split(' ')[0]; 
                closeOptionModal();
                startWithCountdown();
            };
            list.appendChild(btn);
        });
    }
    optionModal.classList.add('active');
}

window.closeOptionModal = function() {
    triggerHaptic('tap');
    optionModal.classList.remove('active');
}

let toastTimer = null;
function showToast(word, desc) {
    const toast = document.getElementById('toast');
    const tDesc = document.getElementById('toastDesc');
    const tWord = document.getElementById('toastWord'); 

    tDesc.textContent = desc;

    if (toastTimer) clearTimeout(toastTimer);
    toast.classList.remove('hidden');
    requestAnimationFrame(() => { toast.classList.add('show'); });
    toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 3000); 
}

function showHint() {
    if (!hiddenWordPath || hiddenWordPath.length === 0) return;
    hintTooltip.classList.remove('show');
    lastActionTime = Date.now();

    currentHintStep++;
    document.querySelectorAll('.tile').forEach(t => t.classList.remove('hint-highlight'));

    let indicesToShow = [];
    if (currentHintStep === 1) {
        indicesToShow.push(hiddenWordPath[0]);
    } else {
        indicesToShow.push(hiddenWordPath[0]);
        if (hiddenWordPath.length > 1) indicesToShow.push(hiddenWordPath[1]);
        if (currentHintStep > 2) currentHintStep = 2; 
    }
    triggerHaptic('tap');

    indicesToShow.forEach(idx => {
        const tile = document.querySelector(`.tile[data-index="${idx}"]`);
        if (tile) {
            tile.classList.add('hint-highlight');
            setTimeout(() => { tile.classList.remove('hint-highlight'); }, 1500);
        }
    });
}

function showIdleHint() {
    if (possibleWords.size === 0) {
        showToast("힌트", "더 이상 찾을 단어가 없어요!");
        return;
    }
    const keys = Array.from(possibleWords.keys());
    const randomWord = keys[Math.floor(Math.random() * keys.length)];
    const startIdx = possibleWords.get(randomWord);

    const tile = document.querySelector(`.tile[data-index="${startIdx}"]`);
    if (tile) {
        tile.classList.remove('hint-highlight');
        void tile.offsetWidth; 
        tile.classList.add('hint-highlight');
        setTimeout(() => { tile.classList.remove('hint-highlight'); }, 1500);
    }
    lastActionTime = Date.now(); 
}

function initGame() {
    SoundManager.init();
    stopTimer();
    resultModal.classList.remove('active');
    currentScore = 0;
    scoreElement.textContent = "0";
    
    currentHintStep = 0;
    hiddenWordPath = [];
    possibleWords.clear(); 
    foundWords.clear();
    lastActionTime = Date.now();
    
    updateStatsUI();

    document.querySelectorAll('.tile').forEach(t => t.classList.remove('idle-hint'));
    
    if (hintBar) {
        hintBar.classList.remove('success'); 
        hintBar.classList.add('hidden');
        const iconSpan = hintBar.querySelector('.mission-icon');
        if(iconSpan) iconSpan.textContent = "🎁"; 
    }

    gridElement.style.setProperty('--col-count', currentGridSize);
    const fontSize = currentGridSize === 6 ? '18px' : (currentGridSize === 4 ? '24px' : '22px');
    
    if (currentMode === 'challenge') {
        timeLeft = GAME_CONFIG.CHALLENGE_TIME;
        timerElement.textContent = formatTime(timeLeft);
        timerElement.style.color = "white"; 
    } else {
        timeElapsed = 0;
        timerElement.textContent = formatTime(0);
        timerElement.style.color = "#f59e0b"; 
    }
    
    let candidateWords = [];
    if (typeof LEVEL_WORDS !== 'undefined') {
        if (currentLevel === 'all') {
            Object.values(LEVEL_WORDS).forEach(list => {
                if(Array.isArray(list)) candidateWords = candidateWords.concat(list);
            });
        } else {
            if (LEVEL_WORDS[currentLevel]) candidateWords = LEVEL_WORDS[currentLevel];
        }
    }
    if (candidateWords.length === 0) candidateWords = [{word: "비상구", category: "기본"}]; 

    const hiddenData = candidateWords[Math.floor(Math.random() * candidateWords.length)];
    const hiddenWord = (typeof hiddenData === 'string') ? hiddenData : hiddenData.word;
    const category = (typeof hiddenData === 'string') ? '' : hiddenData.category;

    currentHiddenWord = hiddenWord;
    console.log(`[${currentMode}/${currentGridSize}x${currentGridSize}] 히든: ${hiddenWord} (${category})`);

    if (category) {
        hintText.textContent = `찾아라! ${category}`;
        hintScore.textContent = `+${GAME_CONFIG.HIDDEN_BONUS_SCORE}`;
        hintBar.classList.remove('hidden');
        hintTooltip.classList.add('show');
        setTimeout(() => { hintTooltip.classList.remove('show'); }, 3000);
    }

    const gameData = WordBoard.generateBoard(hiddenWord || "비상구", currentGridSize);
    gridData = gameData.grid;
    hiddenWordPath = gameData.path; 
    
    possibleWords = solveBoard(gridData, currentGridSize);
    totalWordCount = possibleWords.size;
    if(foundCountEl) foundCountEl.textContent = "0";
    if(totalCountEl) totalCountEl.textContent = `/ ${totalWordCount}`;
    console.log("찾을 수 있는 단어 수:", totalWordCount);

    selectedIndices = [];
    isDragging = false;
    gridElement.innerHTML = '';
    wordListElement.innerHTML = '';
    wordDisplay.textContent = "시작";
    wordDisplay.style.fontSize = "32px";
    wordDisplay.classList.remove('anim-success', 'anim-fail', 'shake');

    const totalTiles = currentGridSize * currentGridSize;
    for (let i = 0; i < totalTiles; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.textContent = gridData[i];
        tile.dataset.index = i;
        tile.style.fontSize = fontSize; 
        
        tile.addEventListener('mousedown', startDrag);
        tile.addEventListener('touchstart', (e) => { 
            if(e.cancelable) e.preventDefault(); 
            startDrag(e); 
        }, {passive: false});
        
        gridElement.appendChild(tile);
    }
    startTimer();
}

// [수정] game.js의 getTileFromEvent 함수
function getTileFromEvent(e, isStart = false) {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    
    // 현재 좌표에 있는 요소 가져오기
    const el = document.elementFromPoint(x, y);
    
    if (!el) return null;
    
    // 요소가 타일(tile)인 경우
    if (el.classList.contains('tile')) {
        // [핵심 변경]
        // 1. 드래그 시작(isStart === true)일 경우:
        //    거리 계산 없이 그냥 타일 위에만 있으면 무조건 OK (100% 영역)
        if (isStart) {
            return el;
        }

        // 2. 드래그 중(Move)일 경우:
        //    대각선 오입력을 방지하기 위해 타일 중심부만 인식 (영역 제한)
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // * 영역 비율 설정 *
        // 0.6 = 60%, 0.7 = 70% 
        // 좁다고 느끼셨으니 0.75(75%) 정도로 늘려보았습니다.
        // 필요하면 이 숫자를 0.6이나 0.8로 조절하세요.
        const sensitivity = 0.75; 
        
        const safeRadius = (rect.width / 2) * sensitivity; 
        
        // 중심점과의 거리가 안전 반경 이내일 때만 인정
        if (Math.hypot(x - centerX, y - centerY) < safeRadius) {
            return el;
        }
    }
    return null;
}

function startDrag(e) {
    if(resultModal.classList.contains('active') || optionModal.classList.contains('active') || settingsModal.classList.contains('active')) return;
    
    lastActionTime = Date.now();
    hintTooltip.classList.remove('show');
    document.querySelectorAll('.tile.idle-hint').forEach(t => t.classList.remove('idle-hint'));

    // [수정] 뒤에 true를 붙여줍니다 (여기는 시작이니까 100% 인식!)
    const startTile = getTileFromEvent(e, true);
    if (!startTile) return;

    isDragging = true; selectedIndices = []; clearSelection();
    processTile(startTile);
    triggerHaptic('tap'); 

    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('touchmove', moveDrag, {passive: false});
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
}

function moveDrag(e) {
    if (!isDragging) return; 
    if(e.touches && e.cancelable) e.preventDefault(); 
    // [수정] 여기는 그냥 두거나 false를 넣습니다 (이동 중엔 엄격하게!)
    const tile = getTileFromEvent(e, false);
    if (tile) processTile(tile);
}

function processTile(tile) {
    const index = parseInt(tile.dataset.index);
    if (selectedIndices.includes(index)) return;
    if (selectedIndices.length === 0 || isAdjacent(selectedIndices[selectedIndices.length-1], index)) {
        selectedIndices.push(index); 
        tile.classList.add('selected'); 
        tile.classList.remove('pop');
        void tile.offsetWidth;
        tile.classList.add('pop');
        triggerHaptic('tap'); 
        SoundManager.playTap(); // [추가] 뽁! 소리
        document.querySelectorAll('.tile').forEach(t => t.classList.remove('last-selected'));
        tile.classList.add('last-selected');
        updateCurrentWord();
    }
}

function isAdjacent(prev, curr) {
    const size = currentGridSize;
    const pR = Math.floor(prev / size), pC = prev % size;
    const cR = Math.floor(curr / size), cC = curr % size;
    return Math.abs(pR - cR) <= 1 && Math.abs(pC - cC) <= 1;
}

function updateCurrentWord() {
    const chars = selectedIndices.map(i => gridData[i]);
    wordDisplay.textContent = assembleHangul(chars, COMBINED_DICTIONARY);
}

function clearSelection() { 
    document.querySelectorAll('.tile').forEach(t => {
        t.classList.remove('selected');
        t.classList.remove('last-selected'); 
    }); 
}

function endDrag() {
    if (!isDragging) return; isDragging = false;
    document.removeEventListener('mousemove', moveDrag); document.removeEventListener('touchmove', moveDrag);
    
    lastActionTime = Date.now();

    const word = wordDisplay.textContent; 
    if (word === "시작" || word.trim() === "") {
        clearSelection();
        return;
    }

    let lastTileRect = null;
    const lastTile = document.querySelector('.tile.last-selected');
    if (lastTile) {
        lastTileRect = lastTile.getBoundingClientRect();
    }

    checkWord(word, lastTileRect); 
    clearSelection();
    setTimeout(() => { 
        if(selectedIndices.length === 0) wordDisplay.textContent = "시작"; 
    }, 800);
}

function calculateScorePoints(tileCount) {
    if (tileCount >= 7) return GAME_CONFIG.POINTS[7];
    return GAME_CONFIG.POINTS[tileCount] || 0;
}

function checkWord(word, rect) {
    if (foundWords.has(word)) { 
        wordDisplay.textContent = "이미 찾음!"; 
        wordDisplay.classList.add('anim-fail', 'shake'); 
        triggerHaptic('fail');
        SoundManager.playFail(); // [추가] 이미 찾음 (뿝...)
        setTimeout(() => wordDisplay.classList.remove('anim-fail', 'shake'), 500); 
        return; 
    }

    if (selectedIndices.length < 3) {
        wordDisplay.classList.add('anim-fail', 'shake');
        triggerHaptic('fail');
        SoundManager.playFail(); // [추가] 너무 짧음 (뿝...)
        showToast(word, "3칸 이상만 점수로 인정돼요");
        setTimeout(() => wordDisplay.classList.remove('anim-fail', 'shake'), 500);
        return;
    }

    const inGameDic = COMBINED_DICTIONARY.has(word);
    
    let levelEntry = null;
    if (typeof LEVEL_WORDS !== 'undefined') {
        for (const level in LEVEL_WORDS) {
            const found = LEVEL_WORDS[level].find(item => item.word === word);
            if (found) { levelEntry = found; break; }
        }
    }

    if (inGameDic) {
        foundWords.add(word);
        if (possibleWords.has(word)) {
            possibleWords.delete(word);
        }

        if(foundCountEl) foundCountEl.textContent = foundWords.size;

        const tileCount = selectedIndices.length;
        let pts = calculateScorePoints(tileCount);
        
        let isHiddenFound = false;
        if (word === currentHiddenWord) {
            SoundManager.playBonus(); // [추가] 히든 단어 찾음 (샤라랑~)
            isHiddenFound = true;
            pts += GAME_CONFIG.HIDDEN_BONUS_SCORE;
            triggerConfetti(); 
            if (hintBar) {
                hintBar.classList.add('success'); 
                const iconSpan = hintBar.querySelector('.mission-icon');
                if(iconSpan) iconSpan.textContent = "👑"; 
                hintText.textContent = "히든 단어 발견!";
                hintTooltip.classList.remove('show');
            }
        }

        if (rect) showFloatingText(rect.left + rect.width/2, rect.top, `+${pts}`);
        triggerHaptic('success');
        SoundManager.playSuccess(); // [추가] 일반 정답 (띠링!)

        if (pts > 0) {
            currentScore += pts;
            const scoreEl = document.getElementById('score');
            scoreEl.classList.remove('bump');
            void scoreEl.offsetWidth;
            scoreEl.classList.add('bump');
            scoreEl.textContent = currentScore;
            
            if (currentMode === 'challenge' && currentScore >= GAME_CONFIG.TARGET_SCORE) {
                stopTimer();
                gameOver(true);
            }
        }

        if (possibleWords.size === 0) {
            stopTimer();
            const icon = document.getElementById('resIcon');
            const title = document.getElementById('resTitle');
            const desc = document.getElementById('resDesc');
            const btn = document.getElementById('resBtn');

            triggerConfetti();
            triggerHaptic('success');
            SoundManager.playBonus(); // [추가] 히든 단어 찾음 (샤라랑~)
            icon.textContent = "🏆"; 
            title.textContent = "PERFECT!";
            desc.textContent = "와우! 이 보드의 모든 단어를 찾으셨습니다!";
            btn.className = "btn-full bg-green"; 
            btn.textContent = "새 게임 시작";
            resultModal.classList.add('active');
        }

        let engMeaning = "";
        if (typeof GAME_DICTIONARY !== 'undefined') {
            engMeaning = GAME_DICTIONARY[word] || "";
        }
        
        let toastMsg = engMeaning;
        if (!toastMsg) toastMsg = "영어 뜻 데이터가 없습니다.";
        
        showToast(word, toastMsg);

        addWordTag(word, pts, isHiddenFound); 
        wordDisplay.classList.add('anim-success'); 
        setTimeout(() => wordDisplay.classList.remove('anim-success'), 500);
    } else {
        wordDisplay.classList.add('anim-fail', 'shake'); 
        triggerHaptic('fail');
        SoundManager.playFail(); // [추가] 없는 단어 (뿝...)
        setTimeout(() => wordDisplay.classList.remove('anim-fail', 'shake'), 500);
    }
}

function addWordTag(word, pts, isHidden = false) {
    const tag = document.createElement('div'); tag.className = 'found-tag';
    if (isHidden) tag.classList.add('special');
    if (word.length === 1) tag.classList.add('one-letter');
    tag.textContent = `${word} (${pts})`; 
    tag.onclick = () => openSheet(word);
    wordListElement.insertBefore(tag, wordListElement.firstChild);
}

window.openSheet = function(word) {
    triggerHaptic('tap');
    const overlay = document.getElementById('sheetOverlay'); 
    const title = document.getElementById('sheetWord'); 
    const elEng = document.getElementById('sheetEng'); 
    const elEngDesc = document.getElementById('sheetEngDesc');
    const elDesc = document.getElementById('sheetDesc'); 
    
    title.textContent = word; 
    
    let definition = "";
    if (typeof GAME_DICTIONARY !== 'undefined') {
        definition = GAME_DICTIONARY[word] || "영어 뜻 데이터가 없습니다.";
    }

    elDesc.textContent = definition;
    elEng.textContent = "";
    elEngDesc.textContent = "";

    const btnNaver = document.getElementById('btnNaver');
    btnNaver.href = `https://ko.dict.naver.com/#/search?query=${encodeURIComponent(word)}`; 
    overlay.classList.add('active');
}

window.closeSheet = function() {
    triggerHaptic('tap');
    document.getElementById('sheetOverlay').classList.remove('active'); 
}

function startTimer() {
    stopTimer(); 
    timerInterval = setInterval(() => {
        const now = Date.now();

        if (now - lastActionTime > 3000 && !hintTooltip.classList.contains('show') && !hintBar.classList.contains('hidden') && !hintBar.classList.contains('success')) {
            hintTooltip.classList.add('show');
        }

        if (currentMode === 'challenge') {
            timeLeft--;
            timerElement.textContent = formatTime(timeLeft);
            if (timeLeft <= 10) timerElement.style.color = "#ef4444";
            else timerElement.style.color = "white";
            if (timeLeft <= 0) { stopTimer(); gameOver(false); }
        } else {
            timeElapsed++;
            timerElement.textContent = formatTime(timeElapsed);
            timerElement.style.color = "#f59e0b"; 
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
}

function gameOver(isSuccess) {
    const icon = document.getElementById('resIcon');
    const title = document.getElementById('resTitle');
    const desc = document.getElementById('resDesc');
    const btn = document.getElementById('resBtn');

    if (isSuccess) {
        triggerConfetti();
        triggerHaptic('success');
        icon.textContent = "🎉"; title.textContent = "성공!";
        desc.textContent = `${formatTime(GAME_CONFIG.CHALLENGE_TIME - timeLeft)} 만에 100점 달성!`;
        btn.className = "btn-full bg-green"; btn.textContent = "새 게임 시작";
    } else {
        triggerHaptic('fail');
        icon.textContent = "⏰"; title.textContent = "시간 초과!";
        desc.textContent = `아쉽네요. ${currentScore}점에 그쳤습니다.`;
        btn.className = "btn-full bg-red"; btn.textContent = "다시 도전";
    }

    resultModal.classList.add('active');
}

window.initGame = initGame;
window.closeSheet = closeSheet;
window.startGame = startGame;