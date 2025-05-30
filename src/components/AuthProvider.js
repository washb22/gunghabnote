import React, { useState, createContext, useContext, useEffect } from 'react';

// 인증 컨텍스트 생성
const AuthContext = createContext();

// 인증 프로바이더 컴포넌트
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 안전하게 초기화
  useEffect(() => {
    try {
      // 여기서는 간단하게 초기화만
      setIsLoading(false);
    } catch (error) {
      console.error('Auth initialization error:', error);
      setIsLoading(false);
    }
  }, []);

  const login = (userData) => {
    if (userData) {
      setUser(userData);
    }
  };

  const logout = () => {
    setUser(null);
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

  // 간단한 소셜 로그인 (에러 방지)
  const googleLogin = () => {
    try {
      const tempUser = {
        id: 'google_' + Date.now(),
        email: 'test@gmail.com',
        name: '구글 사용자',
        picture: '',
        provider: 'google'
      };
      login(tempUser);
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const kakaoLogin = () => {
    try {
      const tempUser = {
        id: 'kakao_' + Date.now(),
        email: 'test@kakao.com',
        name: '카카오 사용자',
        picture: '',
        provider: 'kakao'
      };
      login(tempUser);
    } catch (error) {
      console.error('Kakao login error:', error);
    }
  };

  const naverLogin = () => {
    try {
      const tempUser = {
        id: 'naver_' + Date.now(),
        email: 'test@naver.com',
        name: '네이버 사용자',
        picture: '',
        provider: 'naver'
      };
      login(tempUser);
    } catch (error) {
      console.error('Naver login error:', error);
    }
  };

  // 로딩 중일 때는 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
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
      naverLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// 인증 훅 (에러 방지)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};