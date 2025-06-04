// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyDPgnZ65UpVrUvgsw6UbzLJxxpx-4UPR4s",
  authDomain: "gunghabnote.firebaseapp.com",
  projectId: "gunghabnote",
  storageBucket: "gunghabnote.firebasestorage.app",
  messagingSenderId: "326295807676",
  appId: "1:326295807676:web:cca29b80fdc267ad5a52b9",
  measurementId: "G-FV50ME949G"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 서비스 내보내기
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// 로그인 프로바이더
export const googleProvider = new GoogleAuthProvider();

// 카카오 로그인은 커스텀 프로바이더로 처리
export const signInWithKakao = async () => {
  // 기존 카카오 OAuth 플로우 사용
  const REST_API_KEY = 'd7e1a7e4eb292ffc1fbda3edc8bf9d07';
  const REDIRECT_URI = window.location.origin + '/auth/kakao/callback';
  window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
};

// 구글 로그인
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google 로그인 에러:', error);
    throw error;
  }
};

// 로그아웃
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('로그아웃 에러:', error);
    throw error;
  }
};

// 로그인 상태 변경 감지
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};