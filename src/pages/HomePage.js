import React, { useState } from 'react';
import { Heart, Sparkles, ArrowRight, Star, MessageCircle, Menu, X, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';

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
          setFormData({
            email: '',
            password: '',
            name: '',
            birthDate: '',
            confirmPassword: ''
          });
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
          setFormData({
            email: '',
            password: '',
            name: '',
            birthDate: '',
            confirmPassword: ''
          });
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

  // 소셜 로그인 핸들러들 - 로그인 후 모달 자동 닫기
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
    // 카카오는 페이지 리다이렉트 방식이므로 모달 닫기 불필요
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

          {/* 구분선 */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">또는</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* 구글 로그인 버튼 */}
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

          {/* 카카오 로그인 버튼 */}
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
      {/* Header */}
      <header className="relative z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Heart className="w-8 h-8 text-rose-500" />
                <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1" />
              </div>
              <span className="text-2xl font-bold text-gray-800">궁합노트</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-800 transition-colors font-medium">기능소개</a>
              <a href="#reviews" className="text-gray-600 hover:text-gray-800 transition-colors font-medium">후기</a>
              <button onClick={navigateToAnalyze} className="text-gray-600 hover:text-gray-800 transition-colors font-medium">궁합보기</button>
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 font-medium">안녕하세요, {user.name}님!</span>
                  <button 
                    onClick={logout}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-full transition-all font-medium"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => openAuthModal('login')}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-full transition-all font-medium shadow-lg"
                >
                  로그인
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden text-gray-800"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <a href="#features" className="block text-gray-600 hover:text-gray-800 transition-colors py-2 font-medium">기능소개</a>
              <a href="#reviews" className="block text-gray-600 hover:text-gray-800 transition-colors py-2 font-medium">후기</a>
              <button onClick={navigateToAnalyze} className="block text-gray-600 hover:text-gray-800 transition-colors py-2 font-medium w-full text-left">궁합보기</button>
              
              {user ? (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-gray-700 font-medium mb-3">안녕하세요, {user.name}님!</p>
                  <button 
                    onClick={logout}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full transition-all font-medium"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => openAuthModal('login')}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-full transition-all font-medium shadow-lg"
                >
                  로그인
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto text-center">
          {/* Floating Elements */}
          <div className="absolute top-10 left-10 opacity-20">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-200 to-rose-300 rounded-full animate-pulse"></div>
          </div>
          <div className="absolute top-20 right-20 opacity-30">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-200 to-yellow-300 rounded-2xl animate-spin" style={{animationDuration: '8s'}}></div>
          </div>
          <div className="absolute bottom-10 left-20 opacity-15">
            <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-pink-200 rounded-full animate-bounce" style={{animationDuration: '3s'}}></div>
          </div>
          <div className="absolute top-1/2 right-10 opacity-25">
            <div className="w-20 h-20 bg-gradient-to-br from-rose-200 to-pink-300 rounded-full"></div>
          </div>

          <div className="relative z-10">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
              내 마음을 이해하는
              <br />
              <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                특별한 공간
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              연애 감정을 기록하고, 공유하며, 소중히 보관하는 곳
              <br />
              혼자가 아닌 감정 여정을 함께 시작해보세요
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center mb-12">
              <button 
                onClick={navigateToAnalyze}
                className="group bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center space-x-2 mb-4"
              >
                <Heart className="w-6 h-6" />
                <span>무료 궁합 보러가기</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <p className="text-gray-500 text-sm">
                {user ? '로그인된 상태에서 더 많은 기능을 이용하실 수 있어요' : '더 많은 기능은 로그인 후 이용하실 수 있어요'}
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 border border-rose-100 shadow-lg">
                <div className="text-2xl font-bold text-gray-800">50,000+</div>
                <div className="text-gray-600 text-sm">궁합 분석</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 border border-rose-100 shadow-lg">
                <div className="text-2xl font-bold text-gray-800">12,000+</div>
                <div className="text-gray-600 text-sm">감정 기록</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 border border-rose-100 shadow-lg">
                <div className="text-2xl font-bold text-gray-800">95%</div>
                <div className="text-gray-600 text-sm">만족도</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              로그인 후 이용 가능한 기능
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              회원가입하시면 더 특별한 연애 기능들을 이용하실 수 있어요
            </p>
          </div>

          <div className="space-y-8">
            {/* 상단 2개 가로 배치 */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* 속마음 예측 */}
              <div 
                onClick={navigateToMindReader}
                className="group bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-rose-100 hover:bg-white/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
              >
                <div className="bg-gradient-to-r from-rose-400 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">오늘의 속마음</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  하루 한 번, 그 사람의 진짜 마음을 엿볼 수 있어요. 
                  사주가 분석해주는 오늘의 감정 상태를 확인해보세요.
                </p>
                <div className="flex items-center text-rose-500 font-medium">
                  <span>매일 무료</span>
                  {!user && <span className="ml-2 text-xs bg-rose-100 text-rose-600 px-2 py-1 rounded-full">로그인 필요</span>}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* 궁합 분석 */}
              <div 
                onClick={navigateToAnalyze}
                className="group bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-amber-100 hover:bg-white/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
              >
                <div className="bg-gradient-to-r from-amber-400 to-yellow-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">궁합 분석</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  두 사람의 생년월일시로 알아보는 특별한 인연. 
                  사주 기반의 정확한 궁합 분석을 받아보세요.
                </p>
                <div className="flex items-center text-amber-600 font-medium">
                  <span>무제한 이용</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* 하단 1개 */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-start-2">
                <div 
                  onClick={navigateToCommunity}
                  className="group bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-orange-100 hover:bg-white/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
                >
                  <div className="bg-gradient-to-r from-orange-400 to-rose-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">감정 기록</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    소중한 순간들을 기록하고 보관하세요. 
                    나만의 연애 히스토리가 차곡차곡 쌓여갑니다.
                  </p>
                  <div className="flex items-center text-orange-600 font-medium">
                    <span>영구 보관</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 px-4 sm:px-6 lg:px-8">
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
                rating: 5
              },
              {
                name: "이준호", 
                age: "29세",
                content: "궁합 분석 결과가 놀라울 정도로 정확했어요. 지금 연인과 더 깊이 이해하게 됐습니다 ✨",
                rating: 5
              },
              {
                name: "박민지",
                age: "24세", 
                content: "감정 기록 기능 덕분에 내 마음을 정리할 수 있게 됐어요. 소중한 순간들을 놓치지 않아서 좋아요 🌙",
                rating: 5
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

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 backdrop-blur-lg rounded-3xl p-12 border border-rose-200 shadow-lg">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              지금 시작해보세요
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              당신의 특별한 연애 여정이 여기서 시작됩니다
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={navigateToAnalyze}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                무료 궁합 보러가기
              </button>
              <button className="bg-white border-2 border-rose-200 hover:border-rose-300 text-gray-700 hover:text-gray-800 font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl">
                더 알아보기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="w-6 h-6 text-rose-500" />
                <span className="text-xl font-bold text-gray-800">궁합노트</span>
              </div>
              <p className="text-gray-600 mb-4 max-w-md">
                내 마음을 이해하는 특별한 공간에서 
                소중한 감정들을 기록하고 공유해보세요.
              </p>
              <div className="text-gray-400 text-sm">
                © 2024 궁합노트. All rights reserved.
              </div>
            </div>
            
            <div>
              <h3 className="text-gray-800 font-semibold mb-4">서비스</h3>
              <ul className="space-y-2 text-gray-600">
                <li><button onClick={navigateToAnalyze} className="hover:text-gray-800 transition-colors">궁합 분석</button></li>
                <li><button onClick={navigateToMindReader} className="hover:text-gray-800 transition-colors">속마음 예측</button></li>
                <li><button onClick={navigateToCommunity} className="hover:text-gray-800 transition-colors">감정 기록</button></li>
                <li><a href="#" className="hover:text-gray-800 transition-colors">연애 리포트</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-gray-800 font-semibold mb-4">고객지원</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-gray-800 transition-colors">이용약관</a></li>
                <li><a href="#" className="hover:text-gray-800 transition-colors">개인정보처리방침</a></li>
                <li><a href="#" className="hover:text-gray-800 transition-colors">문의하기</a></li>
                <li><a href="#" className="hover:text-gray-800 transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* 인증 모달 */}
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