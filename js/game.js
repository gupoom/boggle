import { WordBoard } from './board.js';
import { assembleHangul } from './rules.js';
import { GAME_CONFIG } from './config.js';
// [삭제] import { GAME_DICTIONARY } from './dictionary.js'; -> HTML에서 로드함

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
let currentGridSize = 5;
let currentLevel = 'all';

let currentHiddenWord = "";
let currentHiddenCategory = "";

let hiddenWordPath = [];
let currentHintStep = 0;
let lastActionTime = Date.now();

// [수정] GAME_DICTIONARY는 전역 변수로 이미 로드됨 (Set 형태)
const COMBINED_DICTIONARY = new Set();
const LEVEL_DICTIONARY = new Set();

const gridElement = document.getElementById('grid');
const wordDisplay = document.getElementById('currentWord');
const wordListElement = document.getElementById('wordList');
const scoreElement = document.getElementById('score');
const targetScoreElement = document.getElementById('targetScoreDisplay');
const timerElement = document.getElementById('timer');
const resultModal = document.getElementById('resultModal');
const optionModal = document.getElementById('optionModal');
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

// [삭제] getWordInfo 함수 (더 이상 로컬에 뜻풀이가 없으므로 불필요)

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

function solveBoard(grid, size) {
    const found = new Map();
    const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

    function search(idx, path) {
        if (path.length >= 3) {
            const chars = path.map(p => grid[p]);
            const word = assembleHangul(chars, COMBINED_DICTIONARY);
            // [수정] Set.has() 사용
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

window.startWithCountdown = function() {
    enterFullScreen();
    
    introScreen.classList.add('hidden');
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
};

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

function triggerHaptic(type) {
    if (window.navigator && window.navigator.vibrate) {
        if (type === 'tap') window.navigator.vibrate(40); 
        else if (type === 'success') window.navigator.vibrate([50, 50, 50]); 
        else if (type === 'fail') window.navigator.vibrate(300); 
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
    // [수정] GAME_DICTIONARY는 이제 Set이므로 forEach 사용
    if (typeof GAME_DICTIONARY !== 'undefined') {
        GAME_DICTIONARY.forEach(word => COMBINED_DICTIONARY.add(word));
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
    if (possibleWords.size === 0) return;
    const keys = Array.from(possibleWords.keys());
    const randomWord = keys[Math.floor(Math.random() * keys.length)];
    const startIdx = possibleWords.get(randomWord);

    const tile = document.querySelector(`.tile[data-index="${startIdx}"]`);
    if (tile) {
        tile.classList.remove('idle-hint');
        void tile.offsetWidth;
        tile.classList.add('idle-hint');
        setTimeout(() => { tile.classList.remove('idle-hint'); }, 2000);
    }
    lastActionTime = Date.now(); 
}

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
        if(targetScoreElement) targetScoreElement.style.visibility = 'visible';
        timeLeft = GAME_CONFIG.CHALLENGE_TIME;
        timerElement.textContent = formatTime(timeLeft);
        timerElement.style.color = "white"; 
    } else {
        if(targetScoreElement) targetScoreElement.style.visibility = 'hidden';
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
    console.log("찾을 수 있는 단어 수:", possibleWords.size);

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

function getTileFromEvent(e) {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    if (el.classList.contains('tile')) {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const safeRadius = (rect.width / 2) * 0.7; 
        if (Math.hypot(x - centerX, y - centerY) < safeRadius) return el;
    }
    return null;
}

function startDrag(e) {
    if(resultModal.classList.contains('active') || optionModal.classList.contains('active')) return;
    
    lastActionTime = Date.now();
    hintTooltip.classList.remove('show');
    document.querySelectorAll('.tile.idle-hint').forEach(t => t.classList.remove('idle-hint'));

    const startTile = getTileFromEvent(e);
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
    const tile = getTileFromEvent(e);
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
        setTimeout(() => wordDisplay.classList.remove('anim-fail', 'shake'), 500); 
        return; 
    }

    if (selectedIndices.length < 3) {
        wordDisplay.classList.add('anim-fail', 'shake');
        triggerHaptic('fail');
        showToast(word, "3칸 이상만 점수로 인정돼요");
        setTimeout(() => wordDisplay.classList.remove('anim-fail', 'shake'), 500);
        return;
    }

    let levelEntry = null;
    if (typeof LEVEL_WORDS !== 'undefined') {
        for (const level in LEVEL_WORDS) {
            const found = LEVEL_WORDS[level].find(item => item.word === word);
            if (found) {
                levelEntry = found;
                break;
            }
        }
    }

    // [수정] 사전 존재 여부 확인 (Set.has)
    const inGameDic = GAME_DICTIONARY.has(word);
    const inLevelDic = LEVEL_DICTIONARY.has(word);

    if (inGameDic || inLevelDic) {
        foundWords.add(word);
        if (possibleWords.has(word)) {
            possibleWords.delete(word);
        }

        const tileCount = selectedIndices.length;
        let pts = calculateScorePoints(tileCount);
        
        let isHiddenFound = false;
        if (word === currentHiddenWord) {
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
            icon.textContent = "🏆"; 
            title.textContent = "PERFECT!";
            desc.textContent = "와우! 이 보드의 모든 단어를 찾으셨습니다!";
            btn.className = "btn-full bg-green"; 
            btn.textContent = "새 게임 시작";
            resultModal.classList.add('active');
        }

        // [수정] 뜻풀이 로직 제거 -> 단순 알림
        let descText = "사전에 등록된 단어입니다.";
        if (levelEntry && levelEntry.desc) {
            descText = levelEntry.desc; // 레벨별 단어(히든 단어 등)는 뜻이 있다면 표시
        }
        showToast(word, descText);

        addWordTag(word, pts, isHiddenFound); 
        wordDisplay.classList.add('anim-success'); 
        setTimeout(() => wordDisplay.classList.remove('anim-success'), 500);
    } else {
        wordDisplay.classList.add('anim-fail', 'shake'); 
        triggerHaptic('fail');
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
    
    // [수정] 뜻풀이 요소 초기화
    const elEng = document.getElementById('sheetEng');
    const elEngDesc = document.getElementById('sheetEngDesc');
    const elDesc = document.getElementById('sheetDesc');
    
    title.textContent = word; 
    
    // [수정] 로컬 뜻풀이 조회 제거, 기본 메시지 표시
    elDesc.textContent = "네이버 사전에서 뜻을 확인하세요.";
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

        if (currentMode === 'practice' && GAME_CONFIG.ENABLE_AUTO_HINT) {
            if (now - lastActionTime > GAME_CONFIG.AUTO_HINT_DELAY) {
                showIdleHint();
            }
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