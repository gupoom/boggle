import { WordBoard } from './board.js';
import { assembleHangul } from './rules.js';
import { GAME_CONFIG } from './config.js';
// [추가] 다국어 지원 모듈 가져오기
import { T, initLocaleUI } from './locale.js';

// --- 전역 변수 ---
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

// [추가] 미리 계산된 게임 데이터를 저장할 변수
let precomputedData = null;

// 설정 변수
let isVibrationOn = true;

// 사전 데이터 저장소
const COMBINED_DICTIONARY = new Set(); 
const LEVEL_DICTIONARY = new Set();
const WORD_DETAILS = {}; 

// DOM 요소 참조
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

// 힌트바 클릭 이벤트
document.getElementById('hintBar').addEventListener('click', showHint);


// --- [기능 1] 효과음 관리자 ---
const SoundManager = {
    ctx: null,
    isMuted: false, 

    init: function() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    playTap: function() {
        if (this.isMuted || !this.ctx) return;
        this.playTone(800, 'sine', 0.1); 
    },

    playSuccess: function() {
        if (this.isMuted || !this.ctx) return;
        this.playTone(523.25, 'sine', 0.2); 
        setTimeout(() => this.playTone(659.25, 'sine', 0.3), 100); 
    },

    playFail: function() {
        if (this.isMuted || !this.ctx) return;
        this.playTone(150, 'sawtooth', 0.3); 
    },

    playBonus: function() {
        if (this.isMuted || !this.ctx) return;
        this.playTone(523.25, 'sine', 0.1);
        setTimeout(() => this.playTone(659.25, 'sine', 0.1), 80);
        setTimeout(() => this.playTone(783.99, 'sine', 0.2), 160);
        setTimeout(() => this.playTone(1046.50, 'sine', 0.4), 240);
    },

    playTone: function(freq, type, duration) {
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type; 
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch(e) { console.log(e); }
    }
};


// --- [기능 2] 시스템 설정 및 유틸리티 ---

window.toggleVibration = function(checkbox) {
    isVibrationOn = checkbox.checked;
    if (isVibrationOn) triggerHaptic('tap');
}

window.toggleSound = function(checkbox) {
    SoundManager.isMuted = !checkbox.checked;
    if (!SoundManager.isMuted) {
        SoundManager.init();
        SoundManager.playSuccess();
    }
}

function triggerHaptic(type) {
    if (!isVibrationOn) return;
    if (window.navigator && window.navigator.vibrate) {
        if (type === 'tap') window.navigator.vibrate(40); 
        else if (type === 'success') window.navigator.vibrate([50, 50, 50]); 
        else if (type === 'fail') window.navigator.vibrate(300); 
    }
}

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

// --- [기능 3] 게임 시작 및 제어 로직 ---

window.startFromIntro = function() {
    introScreen.classList.add('hidden');
    SoundManager.init();
    triggerHaptic('tap');
    initGame();
};

function runCountdownSequence() {
    resultModal.classList.remove('active');
    countdownOverlay.classList.add('active');
    triggerHaptic('tap'); 

    // [추가] 카운트다운 시작과 동시에 데이터 생성 시작!
    prepareGameInBackground();
    
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

window.startWithCountdown = function() {
    if (typeof AdManager !== 'undefined' && !AdManager.isAdRemoved) {
        AdManager.showInterstitial(runCountdownSequence);
    } else {
        runCountdownSequence();
    }
};

function updateCount(num) {
    countdownText.textContent = num;
    countdownCard.classList.remove('card-flip-action');
    void countdownCard.offsetWidth; 
    countdownCard.classList.add('card-flip-action');
    triggerHaptic('tap'); 
    SoundManager.playTap();
}

window.startGame = function() {
    window.startWithCountdown();
};


// --- [기능 4] 사전 데이터 초기화 ---

function initLevelDictionary() {
    // [추가] 언어 설정에 따라 UI 텍스트 초기화
    initLocaleUI();

    if (typeof window.LEVEL_WORDS !== 'undefined') {
        Object.values(window.LEVEL_WORDS).forEach(wordList => {
            if (Array.isArray(wordList)) {
                wordList.forEach(item => {
                    const word = (typeof item === 'string') ? item : item.word;
                    LEVEL_DICTIONARY.add(word);
                    COMBINED_DICTIONARY.add(word); 

                    if (typeof item !== 'string') {
                        const englishMeaning = item.eng_desc || item.eng || "";
                        if (englishMeaning) {
                            WORD_DETAILS[word] = englishMeaning;
                        }
                    }
                });
            }
        });
    }
    
    if (typeof GAME_DICTIONARY !== 'undefined') {
        Object.keys(GAME_DICTIONARY).forEach(word => {
            COMBINED_DICTIONARY.add(word);
            if (!WORD_DETAILS[word]) {
                WORD_DETAILS[word] = GAME_DICTIONARY[word];
            }
        });
    }
}
initLevelDictionary();

// [추가] 카운트다운 동안 게임 데이터를 미리 만듭니다.
function prepareGameInBackground() {
    // 1. 후보 단어 선정
    let candidateWords = [];
    if (typeof window.LEVEL_WORDS !== 'undefined') {
        if (currentLevel === 'all') {
            Object.values(window.LEVEL_WORDS).forEach(list => {
                if(Array.isArray(list)) candidateWords = candidateWords.concat(list);
            });
        } else {
            if (window.LEVEL_WORDS[currentLevel]) candidateWords = window.LEVEL_WORDS[currentLevel];
        }
    }
    
    // [수정] 비상시 '사과' (사용자가 수정한 내용 반영)
    if (candidateWords.length === 0) candidateWords = [{word: "사과", category: "음식"}];

    // 2. 히든 단어 선택
    const hiddenData = candidateWords[Math.floor(Math.random() * candidateWords.length)];
    const hiddenWord = (typeof hiddenData === 'string') ? hiddenData : hiddenData.word;
    const category = (typeof hiddenData === 'string') ? '' : hiddenData.category;
    
    // 3. 보드 생성 (이게 가장 오래 걸림)
    const gameData = WordBoard.generateBoard(hiddenWord, currentGridSize);
    
    // 4. 정답 미리 찾기 (이것도 오래 걸림)
    const possibleWordsMap = solveBoard(gameData.grid, currentGridSize);

    // 5. 결과 저장
    precomputedData = {
        grid: gameData.grid,
        path: gameData.path,
        hiddenWord: hiddenWord,
        category: category,
        possibleWords: possibleWordsMap
    };
    
    console.log("[System] 게임 데이터 백그라운드 생성 완료");
}

// --- [기능 5] 게임 로직 (보드, 타이머) ---

function initGame() {
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
    
    // ============================================================
    // [수정] 미리 계산된 데이터(precomputedData)가 있는지 확인
    // ============================================================
    let category = "";

    if (precomputedData) {
        // 1. 미리 계산된 데이터 사용 (딜레이 없음!)
        gridData = precomputedData.grid;
        hiddenWordPath = precomputedData.path;
        currentHiddenWord = precomputedData.hiddenWord;
        possibleWords = precomputedData.possibleWords;
        category = precomputedData.category;
        
        // 사용 후 초기화
        precomputedData = null; 
        console.log(`[FastLoad] 미리 계산된 데이터 사용: ${currentHiddenWord}`);
    } 
    else {
        // 2. 데이터가 없으면 직접 계산 (기존 로직 - 폴백)
        // (새 게임 버튼을 광클하거나, 카운트다운 없이 시작할 경우를 대비)
        let candidateWords = [];
        if (typeof window.LEVEL_WORDS !== 'undefined') {
            if (currentLevel === 'all') {
                Object.values(window.LEVEL_WORDS).forEach(list => {
                    if(Array.isArray(list)) candidateWords = candidateWords.concat(list);
                });
            } else {
                if (window.LEVEL_WORDS[currentLevel]) candidateWords = window.LEVEL_WORDS[currentLevel];
            }
        }
        if (candidateWords.length === 0) candidateWords = [{word: "사과", category: "음식"}]; 

        const hiddenData = candidateWords[Math.floor(Math.random() * candidateWords.length)];
        const hiddenWord = (typeof hiddenData === 'string') ? hiddenData : hiddenData.word;
        category = (typeof hiddenData === 'string') ? '' : hiddenData.category;

        currentHiddenWord = hiddenWord;
        
        const gameData = WordBoard.generateBoard(hiddenWord, currentGridSize);
        gridData = gameData.grid;
        hiddenWordPath = gameData.path; 
        possibleWords = solveBoard(gridData, currentGridSize);
    }
    
    // --- 공통 UI 처리 (힌트 텍스트 등) ---
    console.log(`[${currentMode}/${currentGridSize}x${currentGridSize}] 히든: ${currentHiddenWord}`);

    if (category) {
        const translatedCategory = T.categories[category] || category;
        hintText.textContent = `${T.hintHidden}${translatedCategory}`;
        hintScore.textContent = `+${GAME_CONFIG.HIDDEN_BONUS_SCORE}`;
        hintBar.classList.remove('hidden');
        hintTooltip.classList.add('show');
        setTimeout(() => { hintTooltip.classList.remove('show'); }, 3000);
    }

    totalWordCount = possibleWords.size;
    if(foundCountEl) foundCountEl.textContent = "0";
    if(totalCountEl) totalCountEl.textContent = `/ ${totalWordCount}`;

    selectedIndices = [];
    isDragging = false;
    gridElement.innerHTML = '';
    wordListElement.innerHTML = '';
    
    wordDisplay.textContent = T.start;
    wordDisplay.classList.remove('anim-success', 'anim-fail', 'shake');

    const totalTiles = currentGridSize * currentGridSize;
    for (let i = 0; i < totalTiles; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.textContent = gridData[i];
        tile.dataset.index = i;
        tile.style.fontSize = fontSize; 
        
        tile.addEventListener('mousedown', (e) => startDrag(e));
        tile.addEventListener('touchstart', (e) => { 
            if(e.cancelable) e.preventDefault(); 
            startDrag(e); 
        }, {passive: false});
        
        gridElement.appendChild(tile);
    }
    startTimer();
}

function getTileFromEvent(e, isStart = false) {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const el = document.elementFromPoint(x, y);
    
    if (!el) return null;
    if (el.classList.contains('tile')) {
        if (isStart) return el;

        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const sensitivity = 0.75; 
        const safeRadius = (rect.width / 2) * sensitivity; 
        
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

    const startTile = getTileFromEvent(e, true);
    if (!startTile) return;

    isDragging = true; selectedIndices = []; clearSelection();
    processTile(startTile);
    
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('touchmove', moveDrag, {passive: false});
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
}

function moveDrag(e) {
    if (!isDragging) return; 
    if(e.touches && e.cancelable) e.preventDefault(); 
    
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
        SoundManager.playTap(); 
        
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
    if (word === T.start || word.trim() === "") {
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
        // [수정] 다국어 변수 사용
        if(selectedIndices.length === 0) wordDisplay.textContent = T.start; 
    }, 800);
}

function checkWord(word, rect) {
    if (foundWords.has(word)) { 
        // [수정] 다국어 변수 사용
        wordDisplay.textContent = T.alreadyFound; 
        wordDisplay.classList.add('anim-fail', 'shake'); 
        triggerHaptic('fail');
        SoundManager.playFail();
        setTimeout(() => wordDisplay.classList.remove('anim-fail', 'shake'), 500); 
        return; 
    }

    if (selectedIndices.length < 3) {
        wordDisplay.classList.add('anim-fail', 'shake');
        triggerHaptic('fail');
        SoundManager.playFail();
        // [수정] 다국어 변수 사용
        showToast(word, T.tooShort);
        setTimeout(() => wordDisplay.classList.remove('anim-fail', 'shake'), 500);
        return;
    }

    const inGameDic = COMBINED_DICTIONARY.has(word);
    
    if (inGameDic) {
        foundWords.add(word);
        if (possibleWords.has(word)) {
            possibleWords.delete(word);
        }

        if(foundCountEl) foundCountEl.textContent = foundWords.size;

        const tileCount = selectedIndices.length;
        let pts = GAME_CONFIG.POINTS[tileCount] || GAME_CONFIG.POINTS[7] || 10;
        if (tileCount >= 7) pts = GAME_CONFIG.POINTS[7];
        
        let isHiddenFound = false;
        if (word === currentHiddenWord) {
            isHiddenFound = true;
            pts += GAME_CONFIG.HIDDEN_BONUS_SCORE;
            triggerConfetti(); 
            if (hintBar) {
                hintBar.classList.add('success'); 
                const iconSpan = hintBar.querySelector('.mission-icon');
                if(iconSpan) iconSpan.textContent = "👑"; 
                // [수정] 다국어 변수 사용
                hintText.textContent = T.hintFound;
                hintTooltip.classList.remove('show');
            }
            SoundManager.playBonus(); 
        } else {
            SoundManager.playSuccess(); 
        }

        if (rect) showFloatingText(rect.left + rect.width/2, rect.top, `+${pts}`);
        triggerHaptic('success');

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
            // [수정] 다국어 변수 사용
            showResultModal("🏆", T.perfectTitle, T.perfectDesc, true);
        }

        let toastMsg = WORD_DETAILS[word] || T.noDef;
        showToast(word, toastMsg);

        addWordTag(word, pts, isHiddenFound); 
        wordDisplay.classList.add('anim-success'); 
        setTimeout(() => wordDisplay.classList.remove('anim-success'), 500);
    } 
    else {
        wordDisplay.classList.add('anim-fail', 'shake'); 
        triggerHaptic('fail');
        SoundManager.playFail();
        setTimeout(() => wordDisplay.classList.remove('anim-fail', 'shake'), 500);
    }
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
        // [수정] "보드 크기 선택" -> T.optTitleGrid
        title.textContent = T.optTitleGrid;
        list.classList.add('grid-options'); 
        [4, 5, 6].forEach(s => {
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
        // [수정] "숨은 단어 난이도" -> T.optTitleLevel
        title.textContent = T.optTitleLevel;
        list.classList.add('level-options');
        
        // [수정] 난이도 목록을 locale.js에서 가져옴
        const levels = [
            {id:'all', name: T.lvNames['all']},
            {id:'1', name: T.lvNames['1']},
            {id:'2', name: T.lvNames['2']},
            {id:'3', name: T.lvNames['3']},
            {id:'special', name: T.lvNames['special']}
        ];
        
        levels.forEach(lv => {
            const btn = document.createElement('button');
            btn.className = `option-btn ${currentLevel == lv.id ? 'selected' : ''}`;
            btn.textContent = lv.name;
            btn.onclick = () => {
                currentLevel = lv.id;
                // 버튼 텍스트 업데이트 (공백 앞부분만 따서 짧게 표시)
                // 영어일 경우 "Lv.1" 처럼 짧게, 한글은 "1단계" 처럼 표시됨
                document.getElementById('txtLevel').textContent = lv.name.split(' (')[0]; 
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
    if (currentHintStep === 1) indicesToShow.push(hiddenWordPath[0]);
    else {
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
        // [수정] 다국어 변수 사용
        showToast(T.hintTitle, T.noWords);
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

window.openSheet = function(word) {
    triggerHaptic('tap');
    const overlay = document.getElementById('sheetOverlay'); 
    const title = document.getElementById('sheetWord'); 
    const elDesc = document.getElementById('sheetDesc'); 
    const elEng = document.getElementById('sheetEng'); 
    const elEngDesc = document.getElementById('sheetEngDesc');
    
    if(elEng) elEng.textContent = "";
    if(elEngDesc) elEngDesc.textContent = "";

    title.textContent = word; 
    
    let definition = T.noDef;
    if (WORD_DETAILS[word]) definition = WORD_DETAILS[word];
    
    elDesc.textContent = definition;
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
    // [수정] 다국어 변수 사용
    if (isSuccess) {
        const timeStr = formatTime(GAME_CONFIG.CHALLENGE_TIME - timeLeft);
        showResultModal("🎉", T.successTitle, `${timeStr} ${T.successDesc}`, true);
    } else {
        showResultModal("⏰", T.failTitle, `${T.failDesc}${currentScore}`, false);
    }
}

function showResultModal(iconText, titleText, descText, isSuccess) {
    const icon = document.getElementById('resIcon');
    const title = document.getElementById('resTitle');
    const desc = document.getElementById('resDesc');
    const btn = document.getElementById('resBtn');

    icon.textContent = iconText; 
    title.textContent = titleText;
    desc.textContent = descText;

    if (isSuccess) {
        triggerConfetti();
        triggerHaptic('success');
        btn.className = "btn-full bg-green"; 
        // [수정] 다국어 변수 사용
        btn.textContent = T.newGameBtn;
    } else {
        triggerHaptic('fail');
        btn.className = "btn-full bg-red"; 
        // [수정] 다국어 변수 사용
        btn.textContent = T.retry;
    }
    resultModal.classList.add('active');
}

function addWordTag(word, pts, isHidden = false) {
    const tag = document.createElement('div'); tag.className = 'found-tag';
    if (isHidden) tag.classList.add('special');
    if (word.length === 1) tag.classList.add('one-letter');
    tag.textContent = `${word} (${pts})`; 
    tag.onclick = () => openSheet(word);
    wordListElement.insertBefore(tag, wordListElement.firstChild);
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
        const r = Math.floor(idx / size), c = idx % size;
        for (const [dr, dc] of directions) {
            const nr = r + dr, nc = c + dc;
            const nIndex = nr * size + nc;
            if (nr >= 0 && nr < size && nc >= 0 && nc < size && !path.includes(nIndex)) {
                search(nIndex, [...path, nIndex]);
            }
        }
    }
    for (let i = 0; i < size * size; i++) search(i, [i]);
    return found;
}

window.initGame = initGame;
window.closeSheet = closeSheet;
window.startGame = startGame;