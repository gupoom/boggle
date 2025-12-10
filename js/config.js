// js/config.js

export const GAME_CONFIG = {
    // 1. 목표 점수
    TARGET_SCORE: 100,

    // 2. 챌린지 모드 제한 시간 (초)
    CHALLENGE_TIME: 300,

    // 3. [추가] 히든 단어 발견 시 보너스 점수
    HIDDEN_BONUS_SCORE: 10,

    // [신규] 힌트 및 알림 설정
    ENABLE_AUTO_HINT: true,    // 연습 모드에서 자동 힌트 켜기/끄기
    AUTO_HINT_DELAY: 10000,    // 몇 초 동안 입력이 없으면 힌트를 줄까요? (ms 단위, 10000 = 10초)

    // 4. 타일 수별 점수 배점
    POINTS: {
        3: 2,   // 3타일
        4: 4,   // 4타일
        5: 7,   // 5타일
        6: 10,  // 6타일
        7: 15,  // 7타일 이상
    }
};