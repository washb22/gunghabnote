import React, { useState, createContext, useContext, useEffect } from 'react';

// 구글 로그인 설정
const GOOGLE_CLIENT_ID = "650126003972-avtocjtvoulidndb804qkj99shrmhplp.apps.googleusercontent.com";

// 카카오 로그인 설정
const KAKAO_JAVASCRIPT_KEY = "2e68d33888951bdd02e23318f6a07fa9";

// 네이버 로그인 설정
const NAVER_CLIENT_ID = "lbtu0lsHqLobBaipjuFW";

// 인증 컨텍스트 생성
const AuthContext = createContext();

// 인증 프로바이더 컴포넌트
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    return null;
  });

  const [users, setUsers] = useState([]);

  // 구글 SDK 로드
  useEffect(() => {
    const loadGoogleScript = () => {
      if (window.google) return;
      
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleLogin,
        });
      };
      document.head.appendChild(script);
    };

    const loadKakaoScript = () => {
      if (window.Kakao) return;
      
      const script = document.createElement('script');
      script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
      script.integrity = 'sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4';
      script.crossOrigin = 'anonymous';
      script.async = true;
      script.onload = () => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
          window.Kakao.init(KAKAO_JAVASCRIPT_KEY);
        }
      };
      document.head.appendChild(script);
    };

    const loadNaverScript = () => {
      if (window.naver) return;
      
      const script = document.createElement('script');
      script.src = 'https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js';
      script.async = true;
      script.onload = () => {
        const naverLogin = new window.naver.LoginWithNaverId({
          clientId: NAVER_CLIENT_ID,
          callbackUrl: `${window.location.origin}/auth/naver/callback`,
          isPopup: false,
          loginButton: {color: "green", type: 3, height: 60}
        });
        window.naverLogin = naverLogin;
        naverLogin.init();
      };
      document.head.appendChild(script);
    };

    loadGoogleScript();
    loadKakaoScript();
    loadNaverScript();
  }, []);

  const handleNaverLogin = (response) => {
    try {
      const naverUser = {
        id: response.id,
        email: response.email || '',
        name: response.name || '',
        picture: response.profile_image || '',
        gender: response.gender || '',
        age: response.age || '',
        provider: 'naver'
      };

      login(naverUser);
    } catch (error) {
      console.error('Naver login error:', error);
    }
  };

  const handleKakaoLogin = (response) => {
    try {
      const kakaoUser = {
        id: response.id,
        email: response.kakao_account?.email || '',
        name: response.kakao_account?.profile?.nickname || '',
        picture: response.kakao_account?.profile?.profile_image_url || '',
        provider: 'kakao'
      };

      login(kakaoUser);
    } catch (error) {
      console.error('Kakao login error:', error);
    }
  };

  const handleGoogleLogin = (response) => {
    try {
      // JWT 토큰 디코딩 (간단한 방식)
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      const googleUser = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        provider: 'google'
      };

      login(googleUser);
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    // 구글 로그아웃
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
    // 카카오 로그아웃
    if (window.Kakao?.Auth) {
      window.Kakao.Auth.logout();
    }
    // 네이버 로그아웃
    if (window.naverLogin) {
      window.naverLogin.logout();
    }
  };

  const signup = (userData) => {
    const newUser = { ...userData, id: Date.now() };
    setUsers(prev => [...prev, newUser]);
    login(newUser);
  };

  const findUser = (email, password) => {
    return users.find(u => u.email === email && u.password === password);
  };

  const checkEmailExists = (email) => {
    return users.find(u => u.email === email);
  };

  const googleLogin = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  };

  const naverLogin = () => {
    if (window.naverLogin) {
      window.naverLogin.getLoginStatus((status) => {
        if (status) {
          const userData = window.naverLogin.user;
          handleNaverLogin(userData);
        } else {
          // 팝업으로 네이버 로그인
          const naverLoginUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/naver/callback')}&state=${Math.random().toString(36).substr(2, 11)}`;
          
          const popup = window.open(naverLoginUrl, 'naverLogin', 'width=500,height=600');
          
          // 팝업에서 로그인 완료 확인
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              // 로그인 상태 다시 확인
              setTimeout(() => {
                if (window.naverLogin) {
                  window.naverLogin.getLoginStatus((status) => {
                    if (status) {
                      const userData = window.naverLogin.user;
                      handleNaverLogin(userData);
                    }
                  });
                }
              }, 1000);
            }
          }, 1000);
        }
      });
    }
  };

  const kakaoLogin = () => {
    if (window.Kakao?.Auth) {
      window.Kakao.Auth.login({
        success: function(response) {
          // 사용자 정보 가져오기
          window.Kakao.API.request({
            url: '/v2/user/me',
            success: function(userResponse) {
              handleKakaoLogin(userResponse);
            },
            fail: function(error) {
              console.error('Kakao user info error:', error);
            }
          });
        },
        fail: function(error) {
          console.error('Kakao login error:', error);
        }
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      signup, 
      findUser, 
      checkEmailExists,
      googleLogin,
      kakaoLogin,
      naverLogin,
      handleGoogleLogin,
      handleKakaoLogin,
      handleNaverLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// 인증 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};