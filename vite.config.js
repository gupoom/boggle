// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  // 이 부분이 핵심입니다. 
  // 인터넷 주소(https://...)가 아니라 내 폰 내부 경로('./')를 쓰게 만듭니다.
  base: './', 
  build: {
    outDir: 'dist', // 결과물이 저장될 폴더 이름
    assetsDir: 'assets', // 이미지나 자바스크립트가 들어갈 폴더
  }
});