// js/rank.js
import { T, UI_TEXTS } from './locale.js';

// 1. 시간 포맷 함수
function formatTime(seconds) {
    if (!seconds) return "00:00"; // 안전장치
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    if (h > 0) return `${h}:${m}:${s}`;
    return `${m}:${s}`;
}

// 2. 국가 코드를 국기 이모지로 변환하는 함수
function getFlagEmoji() {
    try {
        const locale = navigator.language || navigator.userLanguage || 'en-US';
        let region = locale.split('-')[1];
        if (!region) {
            const lang = locale.split('-')[0].toLowerCase();
            const langMap = { 'ko': 'KR', 'en': 'US', 'ja': 'JP', 'zh': 'CN', 'fr': 'FR', 'de': 'DE', 'es': 'ES' };
            region = langMap[lang] || 'UN';
        }
        if (region.length === 2) {
            const codePoints = region.toUpperCase().split('').map(c => 127462 + c.charCodeAt(0) - 'A'.charCodeAt(0));
            return String.fromCodePoint(...codePoints);
        }
    } catch (e) {
        return "🌍";
    }
    return "🌍";
}

export const RankManager = {
    onHaptic: null,
    currentRankType: 'score', 

    openModal: function(currentSize, isHex, gameMode) {
        if (this.onHaptic) this.onHaptic();
        const modal = document.getElementById('rankingModal');
        if (modal) modal.classList.add('active');

        // 모드에 따라 탭 자동 선택
        let targetType = 'time';
        if (gameMode === 'challenge') targetType = 'score';
        
        this.switchMode(targetType);
    },

    closeModal: function() {
        if (this.onHaptic) this.onHaptic();
        const modal = document.getElementById('rankingModal');
        if (modal) modal.classList.remove('active');
    },

    switchMode: function(mode) {
        this.currentRankType = mode;
        const btnScore = document.getElementById('btnRankScore');
        const btnTime = document.getElementById('btnRankTime');
        
        if(btnScore) btnScore.classList.toggle('active', mode === 'score');
        if(btnTime) btnTime.classList.toggle('active', mode === 'time');
        
        this.loadIntegratedRanking();
    },

    // [핵심] 통합 랭킹 로드 (데이터 호환성 강화 버전)
    loadIntegratedRanking: function() {
        const list = document.getElementById('rankingList');
        if (!list) return;
        list.innerHTML = '';

        // 여기에 정의된 label('4x4', '4x5')을 화면에 보여줄 겁니다.
        const boardTypes = [
            { id: '4', label: '4x4', badgeClass: 'badge-4' },
            { id: '5', label: '5x5', badgeClass: 'badge-5' },
            { id: '5_hex', label: '4x5', badgeClass: 'badge-hex' } 
        ];

        let records = [];

        boardTypes.forEach(type => {
            const key = `best_${this.currentRankType}_${type.id}`;
            const raw = localStorage.getItem(key);
            
            if (raw) {
                let data = { 
                    value: 0, 
                    found: 0, 
                    total: 0, 
                    board: type.label 
                };
                
                try {
                    const parsed = JSON.parse(raw);
                    if (typeof parsed === 'object' && parsed !== null) {
                        data = { ...data, ...parsed };
                    } else {
                        data.value = parseInt(raw) || 0;
                    }
                } catch(e) {
                    data.value = parseInt(raw) || 0;
                }

                if (data.value > 0) {
                    // [수정] 저장된 데이터가 '4'나 'hex'여도, 
                    // 무조건 위에서 정의한 label('4x4', '4x5')로 덮어씌웁니다.
                    data.board = type.label; 
                    
                    records.push({ ...data, badgeClass: type.badgeClass });
                }
            }
        });

        // 정렬 (점수는 내림차순, 시간은 오름차순)
        if (this.currentRankType === 'score') {
            records.sort((a, b) => b.value - a.value);
        } else {
            records.sort((a, b) => a.value - b.value);
        }

        // UI 그리기
        if (records.length > 0) {
            const myFlag = getFlagEmoji();
            
            let myName = localStorage.getItem('user_nickname');
            if (!myName) {
                myName = (UI_TEXTS && UI_TEXTS.myRecord) ? UI_TEXTS.myRecord : "Me";
            }

            records.forEach((rec, index) => {
                const rank = index + 1;
                const isTop = rank <= 3 ? `top-${rank}` : '';
                
                const displayVal = this.currentRankType === 'score' 
                                   ? rec.value.toLocaleString()
                                   : formatTime(rec.value);

                let subInfoText = '';
                if (rec.total > 0) {
                    subInfoText = `${rec.found}/${rec.total} Words`;
                }

                // 4단 레이아웃
                const html = `
                    <div class="rank-item ${isTop}">
                        <div class="rank-col-rank">
                            <span class="rank-num">${rank}</span>
                        </div>

                        <div class="rank-col-badge">
                            <div class="board-badge ${rec.badgeClass}">${rec.board}</div>
                        </div>

                        <div class="rank-col-profile">
                            <div class="rank-flag">${myFlag}</div>
                            <div class="rank-name">${myName}</div>
                        </div>

                        <div class="rank-col-stat">
                            <div class="rank-main-val">${displayVal}</div>
                            <div class="rank-sub-info">${subInfoText}</div>
                        </div>
                    </div>
                `;
                list.innerHTML += html;
            });
            
            const msg = (UI_TEXTS && UI_TEXTS.localRecordMsg) ? UI_TEXTS.localRecordMsg : "Local Best Records";
            list.innerHTML += `<div style="text-align:center; color:#64748b; font-size:12px; margin-top:20px;">${msg}</div>`;

        } else {
            // 기록 없음
            let noRec = (UI_TEXTS && UI_TEXTS.rankNoRecord) ? UI_TEXTS.rankNoRecord : "No Record";
            noRec = noRec.replace(/\n/g, '<br>');
            list.innerHTML = `
                <div class="rank-loading">
                    <div style="font-size:40px; margin-bottom:10px;">🎮</div>
                    ${noRec}
                </div>
            `;
        }
    }
};