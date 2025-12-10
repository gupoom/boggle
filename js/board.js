import { CONSTANTS, decomposeWordToTiles } from './rules.js';

export const WordBoard = {
    ROWS: 5,
    COLS: 5,
    boardGrid: [],

    /**
     * 보드 생성 함수
     * @param {string} hiddenWord - 숨길 단어
     * @param {number} size - 보드 크기
     * @returns {object} { grid: 1차원 배열, path: 히든 단어 인덱스 배열 }
     */
    generateBoard: function(hiddenWord, size = 5) {
        this.ROWS = size;
        this.COLS = size;

        let success = false;
        let attempts = 0;
        const MAX_ATTEMPTS = 100;
        
        let finalPath = []; // [NEW] 히든 단어의 위치를 저장할 변수

        while (!success && attempts < MAX_ATTEMPTS) {
            attempts++;
            
            // 1. 보드 초기화
            this.boardGrid = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(null));
            
            // 2. 타일 주머니(Deck) 준비
            const distMap = CONSTANTS.TILE_DISTRIBUTION; 
            let tileBag = [];
            for (const [char, count] of Object.entries(distMap)) {
                for (let i = 0; i < count; i++) { tileBag.push(char); }
            }
            this.shuffleArray(tileBag);

            // 3. 히든 단어 배치 (지렁이 방식)
            if (hiddenWord) {
                // 자소 분리 (예: 학교 -> ㅎ,ㅏ,ㄱ,ㄱ,ㅛ)
                // rules.js에 이 함수가 있다고 가정 (기존 코드 유지)
                let decomposedTiles = [];
                if (typeof decomposeWordToTiles === 'function') {
                    decomposedTiles = decomposeWordToTiles(hiddenWord);
                } else {
                    // 없으면 그냥 글자 단위로 (비상용)
                    decomposedTiles = hiddenWord.split('');
                }
                
                // 사용된 타일 제거
                for (const char of decomposedTiles) {
                    const idx = tileBag.indexOf(char);
                    if (idx > -1) tileBag.splice(idx, 1);
                }

                // [중요] 배치 시도 후 '경로(Path)'를 받아옴
                const placedPath = this.placeWordSnake(decomposedTiles);
                
                if (!placedPath) {
                    continue; // 배치 실패 시 재시도
                }
                finalPath = placedPath; // 경로 저장!
            }

            // 4. 나머지 빈칸 채우기 (밸런스 로직 유지)
            this.fillEmptySpaces(tileBag);
            
            success = true;
        }

        if (!success) {
            console.error(`[Board] 생성 실패. 빈칸을 랜덤으로 채웁니다.`);
            this.fillEmptySpaces([]); 
            finalPath = []; 
        }

        // [중요] 그리드와 경로를 함께 반환
        return {
            grid: this.boardGrid.flat(),
            path: finalPath
        };
    },

    // 지렁이 배치: 성공 시 경로(Array) 반환, 실패 시 null
    placeWordSnake: function(tiles) {
        let positions = [];
        for(let r=0; r<this.ROWS; r++) {
            for(let c=0; c<this.COLS; c++) {
                positions.push({r, c});
            }
        }
        this.shuffleArray(positions);

        for (let pos of positions) {
            // DFS로 경로 탐색
            const path = this.dfsPlace(tiles, 0, pos.r, pos.c, []);
            if (path) return path; // 경로 찾으면 즉시 반환
        }
        return null;
    },

    // DFS 재귀 함수: 경로(index 배열) 반환하도록 수정
    dfsPlace: function(tiles, idx, r, c, visited) {
        // 범위 및 빈칸 체크
        if (r < 0 || r >= this.ROWS || c < 0 || c >= this.COLS) return null;
        if (this.boardGrid[r][c] !== null && this.boardGrid[r][c] !== tiles[idx]) return null;
        if (visited.some(v => v.r === r && v.c === c)) return null;

        // 임시 배치
        const originalChar = this.boardGrid[r][c];
        this.boardGrid[r][c] = tiles[idx];
        
        // 현재 위치 기록
        visited.push({r, c});

        // 성공 조건 (마지막 글자까지 배치됨)
        if (idx === tiles.length - 1) {
            // 좌표({r,c})를 인덱스(0~24)로 변환하여 반환
            return visited.map(v => v.r * this.COLS + v.c);
        }

        // 8방향 셔플
        const directions = [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]];
        this.shuffleArray(directions); 

        for (let [dr, dc] of directions) {
            const resultPath = this.dfsPlace(tiles, idx + 1, r + dr, c + dc, visited);
            if (resultPath) return resultPath; // 경로 찾았으면 상위로 전달
        }

        // 실패 시 백트래킹 (원상복구)
        this.boardGrid[r][c] = originalChar;
        visited.pop();
        return null;
    },

    // (기존 로직 유지) 빈칸 채우기
    fillEmptySpaces: function(tileBag) {
        const backupChars = ['ㄱ','ㄴ','ㄹ','ㅁ','ㅅ','ㅇ','ㅏ','ㅣ','ㅗ','ㅜ'];
        
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                if (this.boardGrid[r][c] === null) {
                    let bestChar = null;
                    let attempts = 0;
                    
                    while (attempts < 5) {
                        let candidate = (tileBag && tileBag.length > 0) 
                            ? tileBag.pop() 
                            : backupChars[Math.floor(Math.random() * backupChars.length)];

                        if (this.isCrowded(r, c, candidate) || !this.isBalanced(r, c, candidate)) {
                            if (tileBag.length > 0) {
                                const randomIdx = Math.floor(Math.random() * tileBag.length);
                                tileBag.splice(randomIdx, 0, candidate);
                            }
                            attempts++;
                        } else {
                            bestChar = candidate;
                            break;
                        }
                    }
                    if (!bestChar) {
                        bestChar = (tileBag && tileBag.length > 0) 
                            ? tileBag.pop() 
                            : backupChars[Math.floor(Math.random() * backupChars.length)];
                    }
                    this.boardGrid[r][c] = bestChar;
                }
            }
        }
    },

    // (기존 로직 유지) 글자 뭉침 확인
    isCrowded: function(r, c, char) {
        const checks = [[-1, 0], [0, -1], [-1, -1], [-1, 1], [1, 0], [0, 1], [1, -1], [1, 1]];
        for (let [dr, dc] of checks) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < this.ROWS && nc >= 0 && nc < this.COLS) {
                if (this.boardGrid[nr][nc] === char) return true;
            }
        }
        return false;
    },

    // (기존 로직 유지) 자모 밸런스 확인
    isBalanced: function(r, c, char) {
        const isConsonant = CONSTANTS.CHOSUNG.includes(char) || CONSTANTS.JONGSUNG.includes(char);
        const checks = [[-1, 0], [0, -1], [-1, -1], [-1, 1], [1, 0], [0, 1], [1, -1], [1, 1]];
        let neighborConsonants = 0;
        let neighborVowels = 0;
        let validNeighbors = 0;

        for (let [dr, dc] of checks) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < this.ROWS && nc >= 0 && nc < this.COLS) {
                const neighborChar = this.boardGrid[nr][nc];
                if (neighborChar !== null) { 
                    validNeighbors++;
                    if (CONSTANTS.CHOSUNG.includes(neighborChar) || CONSTANTS.JONGSUNG.includes(neighborChar)) {
                        neighborConsonants++;
                    } else {
                        neighborVowels++;
                    }
                }
            }
        }
        if (validNeighbors === 0) return true;
        if (isConsonant) { 
            if (neighborVowels === 0) return false; 
        } else { 
            if (neighborConsonants === 0) return false; 
        }
        return true; 
    },

    shuffleArray: function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
};