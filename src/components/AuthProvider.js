import React, { useState, createContext, useContext, useEffect } from 'react';

// 구글 로그인 설정
const GOOGLE_CLIENT_ID = "650126003972-avtocjtvoulidndb804qkj99shrrhplp.apps.googleusercontent.com";

// 카카오 로그인 설정
const KAKAO_JAVASCRIPT_KEY = "2e68d33888951bdd02e23318f6a07fa9";

// 네이버 로그인 설정
const NAVER_CLIENT_ID = "lbtu0lsHqLobBaipjuFW";

// 인증 컨텍스트 생성
const AuthContext = createContext();

// 인증 프로바이더 컴포넌트
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // SDK 로드 및 초기화
  useEffect(() => {
    const loadGoogleScript = () => {
      if (window.google) {
        initializeGoogle();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeGoogle();
      };
      script.onerror = () => {
        console.error('Google OAuth 스크립트 로딩 실패');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    };

    const initializeGoogle = () => {
      try {
        if (window.google && window.google.accounts) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleLogin,
            auto_select: false,
            cancel_on_tap_outside: true,
            ux_mode: 'popup'
          });
        }
      } catch (error) {
        console.error('Google OAuth 초기화 오류:', error);
      }
    };

    const loadKakaoScript = () => {
      if (window.Kakao) {
        initializeKakao();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
      script.integrity = 'sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4';
      script.crossOrigin = 'anonymous';
      script.async = true;
      script.onload = () => {
        initializeKakao();
      };
      script.onerror = () => {
        console.error('Kakao SDK 로딩 실패');
      };
      document.head.appendChild(script);
    };

    const initializeKakao = () => {
      try {
        if (window.Kakao && !window.Kakao.isInitialized()) {
          window.Kakao.init(KAKAO_JAVASCRIPT_KEY);
        }
      } catch (error) {
        console.error('Kakao 초기화 오류:', error);
      }
    };

    const loadNaverScript = () => {
      if (window.naver) return;
      
      const script = document.createElement('script');
      script.src = 'https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js';
      script.async = true;
      script.onload = () => {
        try {
          const naverLogin = new window.naver.LoginWithNaverId({
            clientId: NAVER_CLIENT_ID,
            callbackUrl: `${window.location.origin}/auth/naver/callback`,
            isPopup: false,
            loginButton: {color: "green", type: 3, height: 60}
          });
          window.naverLogin = naverLogin;
          naverLogin.init();
        } catch (error) {
          console.error('Naver 초기화 오류:', error);
        }
      };
      document.head.appendChild(script);
    };

    // 모든 스크립트 로드
    loadGoogleScript();
    loadKakaoScript();
    loadNaverScript();

    // 로딩 완료
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  const handleGoogleLogin = (response) => {
    try {
      if (!response.credential) {
        throw new Error('Google credential not found');
      }

      // JWT 토큰 디코딩
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
      // 에러 시 사용자에게 알림
      alert('구글 로그인에 실패했습니다. 다시 시도해주세요.');
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
      alert('카카오 로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

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
      alert('네이버 로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const login = (userData) => {
    if (userData) {
      setUser(userData);
      // 로그인 성공 알림
      setTimeout(() => {
        alert(`환영합니다, ${userData.name}님! 🎉`);
      }, 100);
    }
  };

  const logout = () => {
    setUser(null);
    // 각 서비스별 로그아웃
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
    if (window.Kakao?.Auth) {
      window.Kakao.Auth.logout();
    }
    if (window.naverLogin) {
      window.naverLogin.logout();
    }
    alert('로그아웃되었습니다.');
  };

  const signup = (userData) => {
    try {
      if (userData) {
        const newUser = { ...userData, id: Date.now() };
        setUsers(prev => [...prev, newUser]);
        login(newUser);
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const findUser = (email, password) => {
    try {
      return users.find(u => u && u.email === email && u.password === password);
    } catch (error) {
      console.error('Find user error:', error);
      return null;
    }
  };

  const checkEmailExists = (email) => {
    try {
      return users.find(u => u && u.email === email);
    } catch (error) {
      console.error('Check email error:', error);
      return null;
    }
  };

  const googleLogin = () => {
    try {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // One Tap이 표시되지 않는 경우 대체 방법
            console.log('One Tap not available, trying alternative method');
            
            // 개발 환경에서는 테스트 사용자 생성
            if (window.location.hostname === 'localhost') {
              const testUser = {
                id: 'test_google_' + Date.now(),
                email: 'test@gmail.com',
                name: '구글 테스트 사용자',
                picture: '',
                provider: 'google'
              };
              login(testUser);
            } else {
              alert('구글 로그인을 사용할 수 없습니다. 페이지를 새로고침 후 다시 시도해주세요.');
            }
          }
        });
      } else {
        // Google SDK가 로드되지 않은 경우
        alert('구글 로그인 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Google login error:', error);
      
      // 개발 환경에서는 테스트 사용자 제공
      if (window.location.hostname === 'localhost') {
        const testUser = {
          id: 'fallback_google_' + Date.now(),
          email: 'test@gmail.com',
          name: '구글 사용자 (테스트)',
          picture: '',
          provider: 'google'
        };
        login(testUser);
      } else {
        alert('구글 로그인에 문제가 발생했습니다.');
      }
    }
  };

  const kakaoLogin = () => {
    try {
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
                alert('카카오 사용자 정보를 가져오는데 실패했습니다.');
              }
            });
          },
          fail: function(error) {
            console.error('Kakao login error:', error);
            
            // 개발 환경에서는 테스트 사용자 제공
            if (window.location.hostname === 'localhost') {
              const testUser = {
                id: 'test_kakao_' + Date.now(),
                email: 'test@kakao.com',
                name: '카카오 테스트 사용자',
                picture: '',
                provider: 'kakao'
              };
              login(testUser);
            } else {
              alert('카카오 로그인에 실패했습니다.');
            }
          }
        });
      } else {
        alert('카카오 로그인 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        
        // 개발 환경에서는 테스트 사용자 제공
        if (window.location.hostname === 'localhost') {
          const testUser = {
            id: 'fallback_kakao_' + Date.now(),
            email: 'test@kakao.com',
            name: '카카오 사용자 (테스트)',
            picture: '',
            provider: 'kakao'
          };
          login(testUser);
        }
      }
    } catch (error) {
      console.error('Kakao login error:', error);
      alert('카카오 로그인에 문제가 발생했습니다.');
    }
  };

  const naverLogin = () => {
    try {
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
                      } else {
                        // 개발 환경에서는 테스트 사용자 제공
                        if (window.location.hostname === 'localhost') {
                          const testUser = {
                            id: 'test_naver_' + Date.now(),
                            email: 'test@naver.com',
                            name: '네이버 테스트 사용자',
                            picture: '',
                            provider: 'naver'
                          };
                          login(testUser);
                        }
                      }
                    });
                  }
                }, 1000);
              }
            }, 1000);
          }
        });
      } else {
        alert('네이버 로그인 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        
        // 개발 환경에서는 테스트 사용자 제공
        if (window.location.hostname === 'localhost') {
          const testUser = {
            id: 'fallback_naver_' + Date.now(),
            email: 'test@naver.com',
            name: '네이버 사용자 (테스트)',
            picture: '',
            provider: 'naver'
          };
          login(testUser);
        }
      }
    } catch (error) {
      console.error('Naver login error:', error);
      alert('네이버 로그인에 문제가 발생했습니다.');
    }
  };

  // 로딩 중일 때 로딩 화면
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">궁합노트 로딩 중...</p>
        </div>
      </div>
    );
  }

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