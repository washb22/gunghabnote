import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';

const KakaoCallback = () => {
  const navigate = useNavigate();
  const { handleKakaoCallback } = useAuth();

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
          
          // 임시 카카오 사용자 정보 생성
          const kakaoUser = {
            id: 'kakao_' + Date.now(),
            email: `kakao_${Date.now()}@kakao.com`,
            name: '카카오 사용자',
            picture: '',
            provider: 'kakao'
          };
          
          // AuthProvider의 handleKakaoCallback 호출
          const result = await handleKakaoCallback(kakaoUser);
          
          if (result.success) {
            navigate('/');
          } else {
            alert('카카오 로그인 처리 중 오류가 발생했습니다.');
            navigate('/');
          }
        } else {
          console.error('인증 코드가 없습니다.');
          navigate('/');
        }
      } catch (error) {
        console.error('카카오 콜백 처리 오류:', error);
        alert('로그인 처리 중 오류가 발생했습니다.');
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