// js/config.js

export const GAME_CONFIG = {
    // 1. 목표 점수
    TARGET_SCORE: 100,

    // 2. 챌린지 모드 제한 시간 (초)
    CHALLENGE_TIME: 300,

    // 3. [추가] 히든 단어 발견 시 보너스 점수
    HIDDEN_BONUS_SCORE: 50,

    // [신규] 힌트 및 알림 설정
    ENABLE_AUTO_HINT: true,    // 연습 모드에서 자동 힌트 켜기/끄기
    AUTO_HINT_DELAY: 10000,    // 몇 초 동안 입력이 없으면 힌트를 줄까요? (ms 단위, 10000 = 10초)

    // 4. 타일 수별 점수 배점
    POINTS: {
        3: 2,   // 3타일
        4: 2,   // 4타일
        5: 4,   // 5타일
        6: 6,  // 6타일
        7: 8,  // 7타일
        8: 10,
        9: 12,
        10: 14,
        11: 16,
        12: 18,
        13: 20,
        14: 22, // 14타일 이상
    },
    // [신규] 스피드런(올클리어) 모드 설정
    SPEED_RUN_GOAL_PERCENT: 10,   // 목표 달성률 (90%)
    SPEED_RUN_HINT_PENALTY: 10    // 힌트 사용 시 시간 페널티 (10초)
};