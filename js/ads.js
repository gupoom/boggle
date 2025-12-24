// js/ads.js - 하이브리드 광고 관리자 (최적화 버전)

import { AdMob, InterstitialAdPluginEvents } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

const AdManager = {
    isAdRemoved: false,
    isApp: false,
    isInterstitialReady: false, // 광고가 준비되었는지 체크하는 깃발

    init: async function() {
        const savedStatus = localStorage.getItem('ad_removed');
        if (savedStatus === 'true') {
            this.isAdRemoved = true;
            return;
        }

        this.isApp = Capacitor.isNativePlatform();

        if (this.isApp) {
            try {
                await AdMob.initialize({
                    requestTrackingAuthorization: true,
                    initializeForTesting: true, 
                });
                
                // [최적화] 앱 켜자마자 전면 광고 한 장 미리 로딩!
                this.preloadInterstitial();

            } catch (e) { console.error("AdMob 초기화 실패:", e); }
        }
    },

    // [신규] 전면 광고 미리 준비하기 (내부용)
    preloadInterstitial: async function() {
        if (this.isAdRemoved || !this.isApp) return;

        try {
            const adOptions = {
                adId: 'ca-app-pub-3940256099942544/1033173712', // 테스트 ID
                isTesting: true
            };
            await AdMob.prepareInterstitial(adOptions);
            this.isInterstitialReady = true;
            console.log("[Ads] 전면 광고 장전 완료");
        } catch (e) {
            console.error("[Ads] 광고 로딩 실패:", e);
            this.isInterstitialReady = false;
        }
    },

    // 전면 광고 보이기
    showInterstitial: async function(callback) {
        // 광고 제거 사용자는 즉시 콜백
        if (this.isAdRemoved) {
            if (callback) callback();
            return;
        }

        if (this.isApp) {
            // 광고가 준비되어 있으면 바로 보여줌
            if (this.isInterstitialReady) {
                try {
                    // 1. 광고 닫힘 리스너 등록
                    const onDismiss = AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
                        // 광고 닫히면 게임 시작
                        if (callback) callback();
                        onDismiss.remove();
                        
                        // [최적화] 다음 광고를 위해 미리 로딩해둠 (다음 판 준비)
                        this.isInterstitialReady = false;
                        this.preloadInterstitial(); 
                    });

                    // 2. 광고 송출
                    await AdMob.showInterstitial();
                } catch (e) {
                    // 에러 나면 게임 바로 시작
                    console.error(e);
                    if (callback) callback();
                    // 혹시 모르니 다시 로딩 시도
                    this.preloadInterstitial();
                }
            } else {
                // 광고가 아직 준비 안 됐으면, 그냥 게임 시작 (딜레이 방지)
                console.log("[Ads] 광고가 아직 준비 안 됨 -> 스킵");
                if (callback) callback();
                // 그리고 다시 로딩 시도
                this.preloadInterstitial();
            }
        } else {
            // [웹] 시뮬레이션
            alert("웹 전면 광고 시뮬레이션\n(닫으면 게임 시작)");
            if (callback) callback();
        }
    },

    // 보상형 광고 (힌트) - 기존 유지
    showReward: async function(onSuccess, onFail) {
        if (this.isAdRemoved) { if (onSuccess) onSuccess(); return; }

        if (this.isApp) {
            try {
                const adOptions = {
                    adId: 'ca-app-pub-3940256099942544/5224354917', // 테스트 ID
                    isTesting: true
                };
                await AdMob.prepareRewardVideoAd(adOptions);
                await AdMob.showRewardVideoAd();
                if (onSuccess) onSuccess();
            } catch (e) { if (onFail) onFail(); }
        } else {
            if (confirm("웹 보상형 광고 시뮬레이션\n(확인=성공, 취소=실패)")) onSuccess();
            else onFail();
        }
    },

    // 배너 보이기
    showBanner: async function() {
        // 배너 광고 OFF 상태라면 return; (필요시 주석 해제)
        return; 

        /* 배너 코드 활성화 시 주석 해제
        if (this.isAdRemoved) return;
        document.body.classList.add('ads-active');
        if (this.isApp) {
            try {
                const options = {
                    adId: 'ca-app-pub-3940256099942544/6300978111', 
                    isTesting: true,
                    position: 'BOTTOM',
                    margin: 0
                };
                await AdMob.showBanner(options);
            } catch (e) { console.error(e); }
        } else {
            console.log("웹 배너 시뮬레이션");
        }
        */
    },

    hideBanner: async function() {
        document.body.classList.remove('ads-active');
        if (this.isApp) {
            try { await AdMob.hideBanner(); } catch(e) {}
        }
    },

    purchaseRemoveAds: function() {
        const confirmBuy = confirm("광고 제거(프리미엄)를 구매하시겠습니까? (테스트)");
        if (confirmBuy) {
            this.isAdRemoved = true;
            localStorage.setItem('ad_removed', 'true');
            this.hideBanner();
            alert("구매 완료! 광고가 제거되었습니다.");
            window.location.reload();
        }
    }
};

window.AdManager = AdManager;
window.addEventListener('DOMContentLoaded', () => { setTimeout(() => AdManager.init(), 500); });