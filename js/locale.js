// js/locale.js

// 1. 사용자 언어 감지
const userLang = navigator.language.includes('ko') ? 'ko' : 'en';

// 2. 텍스트 데이터 팩
const MESSAGES = {
    ko: {
        ui: {
            newGame: "↻ 새 게임",
            practice: "연습",
            challenge: "챌린지",
            hintBtn: "💡 힌트 보기",
            hintTooltip: "눌러서 힌트 보기!",
            hintTitle: "힌트",
            settingsTitle: "설정",
            vibration: "📳 진동 효과",
            sound: "🔊 효과음",
            removeAds: "🚫 광고 제거 (프리미엄)",
            close: "닫기",
            levelLabel: "랜덤",
            gridLabel: "4x4",
            wordStats: "단어 (찾은것/전체)",
            // [추가] 사전 검색 버튼
            naverSearch: "📖 네이버 사전 검색"
        },
        game: {
            start: "시작",
            hintHidden: "찾아라! ",
            hintFound: "히든 단어 발견!",
            alreadyFound: "이미 찾음!",
            tooShort: "3칸 이상이어야 해요",
            noWords: "더 이상 찾을 단어가 없어요!",
            successTitle: "성공!",
            successDesc: "만에 100점 달성!",
            failTitle: "시간 초과!",
            failDesc: "아쉽네요. 점수는: ",
            perfectTitle: "PERFECT!",
            perfectDesc: "와우! 모든 단어를 찾았습니다!",
            retry: "다시 도전",
            newGameBtn: "새 게임 시작",
            noDef: "영어 뜻 데이터가 없습니다.",
            optTitleGrid: "보드 크기 선택",
            optTitleLevel: "숨은 단어 난이도",
            lvNames: {
                'all': '랜덤',
                '1': '1단계 (3글자)',
                '2': '2단계 (4글자)',
                '3': '3단계 (5글자+)',
                'special': '신조어'
            },
            categories: {
                "가수": "가수", "관광지": "관광지", "음식": "음식", "동물": "동물",
                "자연": "자연", "식물": "식물", "탈것": "탈것", "가전": "가전",
                "악기": "악기", "장소": "장소", "예능": "예능", "국가": "국가",
                "사자성어": "Idiom", "드라마": "Drama", "사회": "Society", "신조어": "Slang",
                "기본": "Basic"
            }
        }
    },
    en: {
        ui: {
            newGame: "↻ New Game",
            practice: "Practice",
            challenge: "Challenge",
            hintBtn: "💡 Get Hint",
            hintTooltip: "Tap for Hint!",
            hintTitle: "Hint",
            settingsTitle: "Settings",
            vibration: "📳 Vibration",
            sound: "🔊 Sound FX",
            removeAds: "🚫 Remove Ads (Premium)",
            close: "Close",
            levelLabel: "Random",
            gridLabel: "4x4",
            wordStats: "Found", // 짧고 명확하게!
            naverSearch: "📖 Open Dictionary" // Naver 몰라도 이해 가능하게
        },
        game: {
            start: "START",
            hintHidden: "Find! ",
            hintFound: "Hidden Word Found!",
            alreadyFound: "Found already!",
            tooShort: "3+ letters required",
            noWords: "No more words to find!",
            successTitle: "Success!",
            successDesc: "to reach 100 points!",
            failTitle: "Time's Up!",
            failDesc: "Nice try. Your score: ",
            perfectTitle: "PERFECT!",
            perfectDesc: "Wow! You found all words!",
            retry: "Try Again",
            newGameBtn: "New Game",
            noDef: "No definition available.",
            optTitleGrid: "Select Board Size",
            optTitleLevel: "Select Difficulty",
            lvNames: {
                'all': 'Random',
                '1': 'Lv.1 (3 Letters)',
                '2': 'Lv.2 (4 Letters)',
                '3': 'Lv.3 (5+ Letters)',
                'special': 'Slang/Meme'
            },
            categories: {
                "가수": "Singer", "관광지": "Place", "음식": "Food", "동물": "Animal",
                "자연": "Nature", "식물": "Plant", "탈것": "Vehicle", "가전": "Appliance",
                "악기": "Instrument", "장소": "Place", "예능": "TV Show", "국가": "Country",
                "사자성어": "Idiom", "드라마": "Drama", "사회": "Society", "신조어": "Slang",
                "기본": "Basic"
            }
        }
    }
};

// 3. 내보내기
export const T = MESSAGES[userLang].game; 
const UI_TEXTS = MESSAGES[userLang].ui;   

// 4. UI 텍스트 적용 함수
export function initLocaleUI() {
    const set = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    // 메인 화면
    set('uiNewGame', UI_TEXTS.newGame);
    set('btnPractice', UI_TEXTS.practice);
    set('btnChallenge', UI_TEXTS.challenge);
    set('btnHint', UI_TEXTS.hintBtn);
    set('hintTooltip', UI_TEXTS.hintTooltip);
    set('hintText', UI_TEXTS.hintTitle);
    set('txtLevel', UI_TEXTS.levelLabel);
    set('uiStatWordLabel', UI_TEXTS.wordStats);
    
    // 설정 모달
    set('uiSettingsTitle', UI_TEXTS.settingsTitle);
    set('uiVibration', UI_TEXTS.vibration);
    set('uiSound', UI_TEXTS.sound);
    set('btnRemoveAdsInSetting', UI_TEXTS.removeAds);
    set('uiCloseSettings', UI_TEXTS.close);
    
    // [추가] 옵션 모달 닫기 버튼
    set('uiCloseOption', UI_TEXTS.close);

    // [추가] 단어 뜻 시트 (네이버 버튼, 닫기 버튼)
    set('btnNaver', UI_TEXTS.naverSearch);
    set('uiCloseSheet', UI_TEXTS.close);
}