import React, { useState } from 'react';
import { Heart, Sparkles, ArrowRight, Star, MessageCircle, Menu, X, User, Eye, EyeOff, Check, Shield, Clock } from 'lucide-react';
// import { useAuth } from '../components/AuthProvider';
// import { useNavigate } from 'react-router-dom';

// Mock hooks for demonstration
const useAuth = () => ({
  user: null,
  login: async () => ({ success: true }),
  signup: async () => ({ success: true }),
  googleLogin: async () => {},
  kakaoLogin: () => {},
  logout: () => {}
});

const useNavigate = () => (path) => console.log('Navigate to:', path);

// 로그인/회원가입 모달 컴포넌트
const AuthModal = ({ isOpen, onClose, mode, onSwitchMode }) => {
  const { login, signup, googleLogin, kakaoLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    birthDate: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다';
    }

    if (mode === 'signup') {
      if (!formData.name) {
        newErrors.name = '이름을 입력해주세요';
      }
      if (!formData.birthDate) {
        newErrors.birthDate = '생년월일을 입력해주세요';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          setFormData({ email: '', password: '', name: '', birthDate: '', confirmPassword: '' });
          onClose();
        } else {
          setErrors({ general: result.error });
        }
      } else {
        const result = await signup({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          birthDate: formData.birthDate
        });
        if (result.success) {
          setFormData({ email: '', password: '', name: '', birthDate: '', confirmPassword: '' });
          onClose();
        } else {
          setErrors({ general: result.error });
        }
      }
    } catch (error) {
      setErrors({ general: '오류가 발생했습니다. 다시 시도해주세요.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
      onClose();
    } catch (error) {
      console.error('구글 로그인 오류:', error);
    }
  };

  const handleKakaoLogin = () => {
    kakaoLogin();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === 'login' ? '로그인' : '회원가입'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        <div className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">이름</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="이름을 입력해주세요"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">생년월일</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                    errors.birthDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
              </div>
            </>
          )}

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">이메일</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="이메일을 입력해주세요"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">비밀번호</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 pr-12 ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="비밀번호를 입력해주세요"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">비밀번호 확인</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="비밀번호를 다시 입력해주세요"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 transform hover:scale-105'
            }`}
          >
            {isLoading ? '처리중...' : mode === 'login' ? '로그인' : '회원가입'}
          </button>

          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">또는</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium mb-3"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 {mode === 'login' ? '로그인' : '회원가입'}
          </button>

          <button
            type="button"
            onClick={handleKakaoLogin}
            className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 transition-all duration-200 text-gray-900 font-medium mb-3"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
            </svg>
            카카오로 {mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            {mode === 'login' ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
            <button
              onClick={() => onSwitchMode(mode === 'login' ? 'signup' : 'login')}
              className="text-rose-500 hover:text-rose-600 font-medium ml-2"
            >
              {mode === 'login' ? '회원가입' : '로그인'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const openAuthModal = (mode) => {
    setAuthModal({ isOpen: true, mode });
    setIsMenuOpen(false);
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: 'login' });
  };

  const switchAuthMode = (mode) => {
    setAuthModal({ isOpen: true, mode });
  };

  const navigateToMindReader = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    navigate('/mind-reader');
  };

  const navigateToAnalyze = () => {
    navigate('/analyze');
  };

  const navigateToCommunity = () => {
    navigate('/community');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50">
      {/* Enhanced Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-pink-100 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Heart className="w-10 h-10 text-rose-500" />
                <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1 -right-1" />
              </div>
              <span className="text-3xl font-bold text-gray-800">궁합노트</span>
            </div>

            {/* Desktop Navigation - Enhanced */}
            <div className="hidden lg:flex items-center space-x-8">
              <button 
                onClick={navigateToAnalyze}
                className="group flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-rose-600 font-medium transition-all duration-200 hover:bg-rose-50 rounded-xl"
              >
                <Heart className="w-5 h-5" />
                <span>궁합분석</span>
              </button>

              <button 
                onClick={navigateToMindReader}
                className="group flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition-all duration-200 hover:bg-purple-50 rounded-xl"
              >
                <Sparkles className="w-5 h-5" />
                <span>오늘의속마음</span>
                {!user && <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>}
              </button>

              <button 
                onClick={navigateToCommunity}
                className="group flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-amber-600 font-medium transition-all duration-200 hover:bg-amber-50 rounded-xl"
              >
                <MessageCircle className="w-5 h-5" />
                <span>감정기록</span>
              </button>

              {user ? (
                <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">{user.name}님</span>
                  </div>
                  <button
                    onClick={logout}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl transition-all font-medium"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    로그인
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    회원가입
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden text-gray-800"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <button 
                onClick={() => { navigateToAnalyze(); setIsMenuOpen(false); }}
                className="flex items-center space-x-3 w-full p-3 text-gray-700 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <Heart className="w-5 h-5 text-rose-500" />
                <span className="font-medium">궁합분석</span>
              </button>

              <button 
                onClick={() => { navigateToMindReader(); setIsMenuOpen(false); }}
                className="flex items-center space-x-3 w-full p-3 text-gray-700 hover:bg-purple-50 rounded-xl transition-colors"
              >
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span className="font-medium">오늘의속마음</span>
                {!user && <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>}
              </button>

              <button 
                onClick={() => { navigateToCommunity(); setIsMenuOpen(false); }}
                className="flex items-center space-x-3 w-full p-3 text-gray-700 hover:bg-amber-50 rounded-xl transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-amber-500" />
                <span className="font-medium">감정기록</span>
              </button>

              {user ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">{user.name}님</span>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-all font-medium"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl transition-all font-medium"
                  >
                    로그인
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl transition-all font-medium shadow-lg"
                  >
                    회원가입
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Banner Section - Fixed Mobile */}
      <section className="w-full px-4 sm:px-6 lg:px-8 mb-8">
        <div className="relative w-full max-w-7xl mx-auto rounded-2xl overflow-hidden shadow-md">
          <img 
            src="/images/main-banner.jpg"
            alt="궁합노트 메인 배너" 
            className="w-full h-auto"
            style={{ 
              display: 'block',
              maxWidth: '100%',
              height: 'auto'
            }}
          />
        </div>
      </section>

      {/* Hero Section - Brand Introduction */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="max-w-6xl mx-auto text-center">
          <div className="relative z-10">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
              사랑의 시작은 서로의 생각을 정확히
              <br />
              <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                파악하는 것 부터 시작합니다.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              그 사람과의 궁합은 몇%인지 간단하게 확인하고 결정하세요.
            </p>

            {/* Main CTA */}
            <div className="flex justify-center">
              <button
                onClick={() => openAuthModal('signup')}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2"
              >
                <Heart className="w-6 h-6" />
                <span>지금 시작하기</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              우리가 하는 일
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              전통 사주학과 현대 기술을 결합하여 당신만의 특별한 연애 여정을 함께합니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-rose-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="bg-gradient-to-r from-rose-400 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">사주 기반 궁합 분석</h3>
              <p className="text-gray-600 leading-relaxed">
                두 사람의 생년월일시를 바탕으로 정확한 인연 분석을 제공합니다. 
                전통 사주학의 깊이 있는 해석으로 특별한 관계를 발견해보세요.
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="bg-gradient-to-r from-purple-400 to-indigo-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">일일 감정 예측</h3>
              <p className="text-gray-600 leading-relaxed">
                매일 변화하는 그 사람의 마음 상태를 섬세하게 분석해드립니다. 
                하루 한 번의 특별한 순간으로 더 깊은 이해를 경험하세요.
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-amber-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">감정 기록 보관</h3>
              <p className="text-gray-600 leading-relaxed">
                소중한 연애 순간들을 안전하게 저장하고 관리할 수 있습니다. 
                당신만의 연애 히스토리가 시간이 지날수록 더욱 값진 자산이 됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* Why Choose Us Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              왜 궁합노트인가요?
            </h2>
            <p className="text-xl text-gray-600">
              다른 서비스와는 차별화된 특별함을 경험해보세요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-green-100 shadow-lg">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">정확성</h3>
              <p className="text-gray-600 leading-relaxed">
                수천 년 전통의 사주학을 바탕으로 한 체계적인 분석 시스템으로 
                신뢰할 수 있는 결과를 제공합니다.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-blue-100 shadow-lg">
              <div className="bg-gradient-to-r from-blue-400 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">프라이버시</h3>
              <p className="text-gray-600 leading-relaxed">
                안전한 개인정보 보호와 익명 기능으로 
                마음 편히 감정을 기록하고 공유할 수 있습니다.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-purple-100 shadow-lg">
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">개인화</h3>
              <p className="text-gray-600 leading-relaxed">
                당신만을 위한 맞춤형 연애 가이드와 
                개인별 특성을 반영한 섬세한 분석을 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              실제 이용자 후기
            </h2>
            <p className="text-xl text-gray-600">
              많은 분들이 궁합노트와 함께 특별한 인연을 만들어가고 있어요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "김수진",
                age: "26세",
                content: "속마음 예측이 정말 신기해요! 매일 확인하는 게 루틴이 됐어요. 덕분에 마음의 여유를 찾았답니다 💕",
                rating: 5,
                feature: "속마음 예측"
              },
              {
                name: "이준호", 
                age: "29세",
                content: "궁합 분석 결과가 놀라울 정도로 정확했어요. 지금 연인과 더 깊이 이해하게 됐습니다 ✨",
                rating: 5,
                feature: "궁합 분석"
              },
              {
                name: "박민지",
                age: "24세", 
                content: "감정 기록 기능 덕분에 내 마음을 정리할 수 있게 됐어요. 소중한 순간들을 놓치지 않아서 좋아요 🌙",
                rating: 5,
                feature: "감정 기록"
              }
            ].map((review, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-rose-100 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center mr-4">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-gray-800 font-medium">{review.name}</div>
                    <div className="text-gray-500 text-sm">{review.age}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="inline-block bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-sm font-medium">
                    {review.feature}
                  </span>
                </div>

                <div className="flex mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                  ))}
                </div>

                <p className="text-gray-600 leading-relaxed">
                  {review.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 backdrop-blur-lg rounded-3xl p-12 border border-rose-200 shadow-lg">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              지금 시작해보세요
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              당신의 특별한 연애 여정이 여기서 시작됩니다.
              <br />
              소중한 감정들을 안전하게 기록하고 관리해보세요.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => openAuthModal('signup')}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2"
              >
                <Heart className="w-6 h-6" />
                <span>무료 회원가입</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={navigateToAnalyze}
                className="bg-white border-2 border-rose-200 hover:border-rose-300 text-gray-700 hover:text-gray-800 font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                먼저 체험해보기
              </button>
            </div>

            <p className="text-gray-500 text-sm mt-6">
              ✨ 회원가입 시 모든 기능을 무료로 체험하실 수 있습니다
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Heart className="w-8 h-8 text-rose-500" />
                <span className="text-2xl font-bold text-gray-800">궁합노트</span>
              </div>
              <p className="text-gray-600 mb-4 max-w-md leading-relaxed">
                연애 감정을 기록하고, 공유하며, 소중히 보관하는 특별한 공간에서
                당신만의 감정 여정을 시작해보세요.
              </p>
              <div className="text-gray-400 text-sm">
                © 2024 궁합노트. All rights reserved.
              </div>
            </div>

            <div>
              <h3 className="text-gray-800 font-semibold mb-4">서비스</h3>
              <ul className="space-y-3 text-gray-600">
                <li><button onClick={navigateToAnalyze} className="hover:text-gray-800 transition-colors">궁합 분석</button></li>
                <li><button onClick={navigateToMindReader} className="hover:text-gray-800 transition-colors">속마음 예측</button></li>
                <li><button onClick={navigateToCommunity} className="hover:text-gray-800 transition-colors">감정 기록</button></li>
                <li><a href="#" className="hover:text-gray-800 transition-colors">연애 리포트</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-gray-800 font-semibold mb-4">고객지원</h3>
              <ul className="space-y-3 text-gray-600">
                <li><a href="#" className="hover:text-gray-800 transition-colors">이용약관</a></li>
                <li><a href="#" className="hover:text-gray-800 transition-colors">개인정보처리방침</a></li>
                <li><a href="#" className="hover:text-gray-800 transition-colors">문의하기</a></li>
                <li><a href="#" className="hover:text-gray-800 transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        mode={authModal.mode}
        onSwitchMode={switchAuthMode}
      />
    </div>
  );
};

export default HomePage;