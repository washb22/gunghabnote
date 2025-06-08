import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';

const KakaoCallback = () => {
  const navigate = useNavigate();
  const { handleKakaoCallback } = useAuth(); // AuthProvider에서 실제 카카오 유저 데이터를 처리하는 로직은 그대로 사용

  useEffect(() => {
    const processCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const error = params.get('error');

        if (error) {
          console.error('카카오 로그인 에러:', error);
          alert('카카오 로그인이 취소되었습니다.');
          navigate('/');
          return;
        }

        if (code) {
          console.log('인증 코드 받음:', code);

          // 1. Vercel 서버리스 함수 (api/auth/kakao.js) 호출
          const apiResponse = await fetch('/api/auth/kakao', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          const apiData = await apiResponse.json();

          if (!apiResponse.ok || apiData.error) {
            console.error('카카오 API 서버리스 함수 오류:', apiData.details || apiData.error);
            alert(`카카오 로그인 처리 중 오류가 발생했습니다: ${apiData.details || apiData.error}`);
            navigate('/');
            return;
          }

          // 2. 서버리스 함수에서 받은 실제 카카오 사용자 정보 사용
          const kakaoUser = apiData.user;
          console.log('서버리스 함수에서 받은 카카오 유저:', kakaoUser);

          // 3. AuthProvider의 handleKakaoCallback 호출하여 Firebase 연동
          const firebaseAuthResult = await handleKakaoCallback(kakaoUser);
          
          if (firebaseAuthResult.success) {
            navigate('/');
          } else {
            alert(`Firebase 연동 중 오류가 발생했습니다: ${firebaseAuthResult.error}`);
            navigate('/');
          }
        } else {
          console.error('인증 코드가 없습니다.');
          navigate('/');
        }
      } catch (error) {
        console.error('최종 카카오 콜백 처리 오류:', error);
        alert('로그인 처리 중 예상치 못한 오류가 발생했습니다.');
        navigate('/');
      }
    };

    processCallback();
  }, [handleKakaoCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-yellow-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">카카오 로그인 처리 중...</p>
        <p className="text-xs text-gray-500 mt-2">잠시만 기다려주세요</p>
      </div>
    </div>
  );
};

export default KakaoCallback;