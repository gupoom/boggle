// js/rules.js

export const CONSTANTS = {
    ROWS: 5,
    COLS: 5,
    CHOSUNG: ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"],
    JUNGSUNG: ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"],
    JONGSUNG: ["","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"],
    
    // 타일 생성 비율
    TILE_DISTRIBUTION: {
        'ㄱ': 10, 'ㄴ': 8,  'ㄹ': 8,  'ㅇ': 8,  'ㅁ': 6, 
        'ㅅ': 7,  'ㅂ': 6,  'ㅈ': 5,  'ㄷ': 5,  'ㅎ': 3, 
        'ㅊ': 2,  'ㅋ': 1,  'ㅌ': 1,  'ㅍ': 1, 
        'ㅏ': 14, 'ㅣ': 14, 'ㅗ': 10, 'ㅜ': 10, 'ㅓ': 11, 
        'ㅡ': 7,  'ㅕ': 4,  'ㅑ': 4,  'ㅛ': 2,  'ㅠ': 3
    },

    DECOMPOSE_MAP: {
        'ㅐ': ['ㅏ','ㅣ'], 'ㅔ': ['ㅓ','ㅣ'], 'ㅒ': ['ㅑ','ㅣ'], 'ㅖ': ['ㅕ','ㅣ'],
        'ㅘ': ['ㅗ','ㅏ'], 'ㅙ': ['ㅗ','ㅏ','ㅣ'], 'ㅚ': ['ㅗ','ㅣ'],
        'ㅝ': ['ㅜ','ㅓ'], 'ㅞ': ['ㅜ','ㅓ','ㅣ'], 'ㅟ': ['ㅜ','ㅣ'], 'ㅢ': ['ㅡ','ㅣ'],
        'ㄲ': ['ㄱ','ㄱ'], 'ㄸ': ['ㄷ','ㄷ'], 'ㅃ': ['ㅂ','ㅂ'], 'ㅆ': ['ㅅ','ㅅ'], 'ㅉ': ['ㅈ','ㅈ'],
        'ㄳ': ['ㄱ','ㅅ'], 'ㄵ': ['ㄴ','ㅈ'], 'ㄶ': ['ㄴ','ㅎ'], 'ㄺ': ['ㄹ','ㄱ'],
        'ㄻ': ['ㄹ','ㅁ'], 'ㄼ': ['ㄹ','ㅂ'], 'ㄽ': ['ㄹ','ㅅ'], 'ㄾ': ['ㄹ','ㅌ'],
        'ㄿ': ['ㄹ','ㅍ'], 'ㅀ': ['ㄹ','ㅎ'], 'ㅄ': ['ㅂ','ㅅ']
    },

    COMPOUND_VOWELS: {
        0:  { 20: 1 }, 4:  { 20: 5 }, 8:  { 0: 9, 1: 10, 20: 11 },
        13: { 4: 14, 5: 15, 20: 16 }, 18: { 20: 19 }, 6:  { 20: 7 },
        2:  { 20: 3 }, 9:  { 20: 10 }, 14: { 20: 15 }
    },
    DOUBLE_CONSONANT_MAP: { 'ㄱ': 'ㄲ', 'ㄷ': 'ㄸ', 'ㅂ': 'ㅃ', 'ㅅ': 'ㅆ', 'ㅈ': 'ㅉ' },
    JONG_COMBINATIONS: {
        'ㄱ': { 'ㄱ': 'ㄲ', 'ㅅ': 'ㄳ' },
        'ㄴ': { 'ㅈ': 'ㄵ', 'ㅎ': 'ㄶ' },
        'ㄹ': { 'ㄱ': 'ㄺ', 'ㅁ': 'ㄻ', 'ㅂ': 'ㄼ', 'ㅅ': 'ㄽ', 'ㅌ': 'ㄾ', 'ㅍ': 'ㄿ', 'ㅎ': 'ㅀ' },
        'ㅂ': { 'ㅅ': 'ㅄ' },
        'ㅅ': { 'ㅅ': 'ㅆ' } 
    },
    COMPLEX_JONG_UNPACK: {
        'ㄳ': ['ㄱ', 'ㅅ'], 'ㄵ': ['ㄴ', 'ㅈ'], 'ㄶ': ['ㄴ', 'ㅎ'],
        'ㄺ': ['ㄹ', 'ㄱ'], 'ㄻ': ['ㄹ', 'ㅁ'], 'ㄼ': ['ㄹ', 'ㅂ'],
        'ㄽ': ['ㄹ', 'ㅅ'], 'ㄾ': ['ㄹ', 'ㅌ'], 'ㄿ': ['ㄹ', 'ㅍ'],
        'ㅀ': ['ㄹ', 'ㅎ'], 'ㅄ': ['ㅂ', 'ㅅ'],
        'ㅆ': ['ㅅ', 'ㅅ'], 'ㄲ': ['ㄱ', 'ㄱ'] 
    }
};

export function decomposeWordToTiles(word) {
    let tiles = [];
    if (typeof word !== 'string') return tiles;

    for (let char of word) {
        const code = char.charCodeAt(0) - 0xAC00;
        if (code < 0 || code > 11171) { tiles.push(char); continue; }
        
        const cho = Math.floor(code / 588);
        const jung = Math.floor((code % 588) / 28);
        const jong = code % 28;

        const choChar = CONSTANTS.CHOSUNG[cho];
        if (CONSTANTS.DECOMPOSE_MAP[choChar]) tiles.push(...CONSTANTS.DECOMPOSE_MAP[choChar]);
        else tiles.push(choChar);

        const jungChar = CONSTANTS.JUNGSUNG[jung];
        if (CONSTANTS.DECOMPOSE_MAP[jungChar]) tiles.push(...CONSTANTS.DECOMPOSE_MAP[jungChar]);
        else tiles.push(jungChar);

        if (jong !== 0) {
            const jongChar = CONSTANTS.JONGSUNG[jong];
            if (CONSTANTS.DECOMPOSE_MAP[jongChar]) tiles.push(...CONSTANTS.DECOMPOSE_MAP[jongChar]);
            else tiles.push(jongChar);
        }
    }
    return tiles;
}

// [내부용] 조립 코어
function _assembleCore(jamoList, preferMerge) {
    let result = [];
    let state = { cho: -1, jung: -1, jong: -1 };
    const { CHOSUNG, JUNGSUNG, JONGSUNG, COMPOUND_VOWELS, DOUBLE_CONSONANT_MAP, JONG_COMBINATIONS, COMPLEX_JONG_UNPACK } = CONSTANTS;

    const FLUSH = () => {
        if (state.cho !== -1 && state.jung !== -1) {
            let t = (state.jong !== -1) ? state.jong : 0;
            let code = 0xAC00 + (state.cho * 21 + state.jung) * 28 + t;
            result.push(String.fromCharCode(code));
        } else if (state.cho !== -1) { result.push(CHOSUNG[state.cho]); }
        else if (state.jung !== -1) { result.push(JUNGSUNG[state.jung]); }
        state = { cho: -1, jung: -1, jong: -1 };
    };

    for (let char of jamoList) {
        let idxCho = CHOSUNG.indexOf(char);
        let idxJung = JUNGSUNG.indexOf(char);

        if (idxJung !== -1) { // 모음
            if (state.cho !== -1 && state.jung === -1) {
                state.jung = idxJung;
            } 
            else if (state.cho !== -1 && state.jung !== -1 && state.jong === -1) {
                if (COMPOUND_VOWELS[state.jung] && COMPOUND_VOWELS[state.jung][idxJung]) {
                    state.jung = COMPOUND_VOWELS[state.jung][idxJung]; 
                } else {
                    FLUSH(); result.push(char);
                }
            }
            else if (state.cho !== -1 && state.jung !== -1 && state.jong !== -1) {
                let prevJong = state.jong;
                let prevJongChar = JONGSUNG[prevJong];
                
                if (COMPLEX_JONG_UNPACK[prevJongChar]) {
                    const [keepJong, moveCho] = COMPLEX_JONG_UNPACK[prevJongChar];
                    state.jong = JONGSUNG.indexOf(keepJong);
                    FLUSH(); 
                    state.cho = CHOSUNG.indexOf(moveCho);
                    state.jung = idxJung;
                } 
                else {
                    state.jong = -1; FLUSH(); 
                    if (CHOSUNG.indexOf(prevJongChar) !== -1) state.cho = CHOSUNG.indexOf(prevJongChar);
                    else state.cho = -1;
                    state.jung = idxJung;
                }
            } else {
                FLUSH(); result.push(char);
            }
        } 
        else if (idxCho !== -1) { // 자음
            if (state.cho !== -1 && state.jung === -1 && CHOSUNG[state.cho] === char) {
                 if (DOUBLE_CONSONANT_MAP[char]) {
                     state.cho = CHOSUNG.indexOf(DOUBLE_CONSONANT_MAP[char]);
                     continue; 
                 }
            }
            
            if (state.cho !== -1 && state.jung !== -1) {
                if (state.jong === -1) {
                    let idxJong = JONGSUNG.indexOf(char);
                    if (idxJong !== -1 && idxJong !== 0) {
                        state.jong = idxJong;
                    } else {
                        FLUSH(); state.cho = idxCho;
                    }
                } else {
                    let currentJongChar = JONGSUNG[state.jong];
                    const isDoublePossible = (currentJongChar === char && DOUBLE_CONSONANT_MAP[char]);
                    
                    if (preferMerge && isDoublePossible) {
                        const newDoubleChar = DOUBLE_CONSONANT_MAP[char];
                        if (!JONGSUNG.includes(newDoubleChar)) {
                            state.jong = -1; FLUSH(); state.cho = CHOSUNG.indexOf(newDoubleChar);
                        } else {
                            state.jong = -1; FLUSH(); state.cho = CHOSUNG.indexOf(newDoubleChar);
                        }
                    }
                    else if (COMPLEX_JONG_UNPACK[currentJongChar]) {
                        const [first, second] = COMPLEX_JONG_UNPACK[currentJongChar];
                        if (second === char && DOUBLE_CONSONANT_MAP[char]) {
                            state.jong = JONGSUNG.indexOf(first);
                            FLUSH(); 
                            state.cho = CHOSUNG.indexOf(DOUBLE_CONSONANT_MAP[char]);
                        } else {
                            FLUSH(); state.cho = idxCho;
                        }
                    }
                    else if (JONG_COMBINATIONS[currentJongChar] && JONG_COMBINATIONS[currentJongChar][char]) {
                        let newJongChar = JONG_COMBINATIONS[currentJongChar][char];
                        state.jong = JONGSUNG.indexOf(newJongChar);
                    } else {
                        FLUSH(); state.cho = idxCho;
                    }
                }
            } 
            else if (state.cho === -1) {
                state.cho = idxCho;
            } else {
                FLUSH(); state.cho = idxCho;
            }
        } else {
            FLUSH(); result.push(char);
        }
    }
    FLUSH(); 
    return result.join("");
}

// [메인] 스마트 조립 함수
export function assembleHangul(jamoList, dictSet = null) {
    const word1 = _assembleCore(jamoList, true); // 된소리 선호 (금사빠)
    if (!dictSet || dictSet.has(word1)) return word1;

    const word2 = _assembleCore(jamoList, false); // 분리 선호 (삽바)
    if (dictSet.has(word2)) return word2;

    return word1; // 기본값
}