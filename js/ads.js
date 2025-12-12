// js/ads.js

const AdManager = {
    isAdRemoved: false, // 광고 제거 구매 여부

    // 초기화
    init: function() {
        // 이전에 구매한 기록이 있는지 확인 (로컬 저장소)
        const savedStatus = localStorage.getItem('ad_removed');
        if (savedStatus === 'true') {
            this.isAdRemoved = true;
            console.log("💎 프리미엄 유저입니다. 광고를 표시하지 않습니다.");
        } else {
            console.log("👤 일반 유저입니다. 배너 광고를 준비합니다.");
            this.showBanner();
        }
    },

    // 하단 배너 광고 표시
    showBanner: function() {
        if (this.isAdRemoved) return;
        // 나중에 여기에 실제 AdMob 배너 코드가 들어갑니다.
        console.log("[광고 시스템] 하단 배너 광고가 표시되었습니다.");
        
        // (테스트용) 화면 하단에 가짜 배너 영역 만들기
        let banner = document.getElementById('mock-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'mock-banner';
            banner.style.position = 'fixed';
            banner.style.bottom = '0';
            banner.style.left = '0';
            banner.style.width = '100%';
            banner.style.height = '50px';
            banner.style.background = '#333';
            banner.style.color = '#fff';
            banner.style.display = 'flex';
            banner.style.justifyContent = 'center';
            banner.style.alignItems = 'center';
            banner.style.zIndex = '9999';
            banner.style.fontSize = '12px';
            banner.innerHTML = '📢 여기는 광고 배너 영역입니다 (결제 시 사라짐)';
            document.body.appendChild(banner);
            
            // 배너만큼 게임 화면 위로 올리기 (가려짐 방지)
            document.body.style.paddingBottom = '50px';
        }
    },

    // 배너 광고 숨기기 (결제 성공 시 호출)
    hideBanner: function() {
        console.log("[광고 시스템] 배너 광고를 제거합니다.");
        const banner = document.getElementById('mock-banner');
        if (banner) banner.remove();
        document.body.style.paddingBottom = '0';
    },

    // 전면 광고 표시 (게임 시작 전 호출)
    // [수정] 괄호 안에 callback(다음에 할 일)을 받도록 수정
    showInterstitial: function(callback) {
        if (this.isAdRemoved) {
            // 광고 제거 상태면 바로 다음 할 일(게임 시작) 실행
            if (callback) callback();
            return;
        }
        
        console.log("[광고 시스템] 전면 광고가 떴습니다!");
        
        // (테스트용) alert 창을 띄웁니다.
        // setTimeout을 쓰는 이유: 브라우저가 화면을 그릴 시간을 조금 주기 위함
        setTimeout(() => {
            alert("📢 [전면광고]\n\n재미있는 게임을 추천합니다!\n(확인을 누르면 게임이 시작됩니다)");
            
            // [핵심] 사용자가 확인 버튼을 누르면(광고가 닫히면) -> 그때 게임 시작 함수를 실행!
            if (callback) callback();
        }, 100);
    },

    // 광고 제거 상품 구매 시도
    purchaseRemoveAds: function() {
        // 실제 앱에서는 여기서 구글/애플 결제창을 띄웁니다.
        // 지금은 테스트를 위해 confirm 창으로 대체합니다.
        
        const userWantToBuy = confirm("☕ 광고 제거 패키지 (3,300원)\n\n평생 광고 없이 쾌적하게 게임을 즐기시겠습니까?\n(테스트: '확인' 누르면 결제 성공 처리)");

        if (userWantToBuy) {
            this.handlePurchaseSuccess();
        }
    },

    // 결제 성공 처리
    handlePurchaseSuccess: function() {
        alert("감사합니다! 광고가 제거되었습니다. 💎");
        this.isAdRemoved = true;
        localStorage.setItem('ad_removed', 'true'); // 저장
        this.hideBanner(); // 즉시 배너 삭제
        
        // UI 업데이트 (버튼 숨기기 등)
        const btn = document.getElementById('btnRemoveAds');
        if(btn) btn.style.display = 'none';
    }
};

// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', () => {
    AdManager.init();
});