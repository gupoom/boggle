// js/ads.js - 하이브리드 광고 관리자 (앱: AdMob / 웹: 가상 웹광고)

import { AdMob, AdOptions, AdLoadInfo, InterstitialAdPluginEvents, RewardAdPluginEvents } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

const AdManager = {
    isAdRemoved: false,
    isApp: false,

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
            } catch (e) { console.error("AdMob 초기화 실패:", e); }
        }
    },

    // 전면 광고 (카운트다운 전)
    showInterstitial: async function(callback) {
        if (this.isAdRemoved) {
            if (callback) callback();
            return;
        }

        if (this.isApp) {
            try {
                // [수정] 광고가 닫혀야만(Dismissed) 게임 시작 콜백 실행
                const onDismiss = AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
                    if (callback) callback();
                    onDismiss.remove(); 
                });

                const adOptions = {
                    adId: 'ca-app-pub-3940256099942544/1033173712', // 테스트 ID
                    isTesting: true
                };
                await AdMob.prepareInterstitial(adOptions);
                await AdMob.showInterstitial();
            } catch (e) {
                // 에러 나면 바로 게임 시작
                if (callback) callback();
            }
        } else {
            // [웹] 시뮬레이션
            alert("웹 전면 광고 시뮬레이션\n(닫으면 게임 시작)");
            if (callback) callback();
        }
    },

    // 보상형 광고 (힌트)
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

    // [신규] 배너 보이기 (레이아웃 조정 포함)
    showBanner: async function() {
        // 배너 광고 OFF
        return;

        if (this.isAdRemoved) return;
        
        // 1. 화면 레이아웃 조정 (CSS 클래스 추가)
        document.body.classList.add('ads-active');

        if (this.isApp) {
            try {
                const options = {
                    adId: 'ca-app-pub-3940256099942544/6300978111', // 배너 ID
                    isTesting: true,
                    position: 'BOTTOM',
                    margin: 0
                };
                await AdMob.showBanner(options);
            } catch (e) { console.error(e); }
        } else {
            console.log("웹 배너 시뮬레이션 (하단 공간 확보됨)");
        }
    },

    // [신규] 배너 숨기기 (구매 시 등)
    hideBanner: async function() {
        // 1. 화면 레이아웃 복구
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
            
            // 즉시 배너 숨김 처리
            this.hideBanner();
            
            alert("구매 완료! 광고가 제거되었습니다.");
            // 깔끔한 적용을 위해 리로드
            window.location.reload();
        }
    }
};

window.AdManager = AdManager;
window.addEventListener('DOMContentLoaded', () => { setTimeout(() => AdManager.init(), 500); });