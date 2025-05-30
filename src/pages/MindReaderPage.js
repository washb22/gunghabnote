import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, ArrowLeft, Eye, Moon, Star, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';

const MindReaderPage = () => {
  const [formData, setFormData] = useState({
    partnerName: '',
    relationship: '',
    todaySituation: ''
  });
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUsedToday, setHasUsedToday] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkDailyUsage();
  }, []);

  const checkDailyUsage = () => {
    const today = new Date().toDateString();
    const usageDate = localStorage.getItem('mindReaderUsageDate');
    
    if (usageDate === today) {
      setHasUsedToday(true);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.partnerName.trim()) {
      setError('상대방 이름을 입력해주세요');
      return false;
    }
    if (!formData.relationship) {
      setError('관계를 선택해주세요');
      return false;
    }
    if (!formData.todaySituation.trim()) {
      setError('오늘의 상황을 입력해주세요');
      return false;
    }
    return true;
  };

  const analyzeMind = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      const sampleResults = [
        {
          prediction: "지금 당신을 많이 생각하고 있어요 💕",
          detail: "최근 당신과의 시간들이 계속 머릿속에 맴돌고 있어요. 특히 오늘 있었던 일로 인해 당신에 대한 관심이 더욱 커졌답니다.",
          advice: "이런 때일수록 자연스럽게 연락해보세요. 작은 관심 표현이 큰 변화를 만들 수 있어요.",
          percentage: 78
        },
        {
          prediction: "친구로서의 감정이 조금씩 변화하고 있어요 🌙",
          detail: "아직 확실하지 않지만, 당신을 바라보는 시선이 예전과는 다르다는 걸 스스로도 느끼고 있어요. 혼란스럽지만 나쁘지 않은 감정이에요.",
          advice: "급하게 서두르지 마세요. 자연스러운 만남을 늘려가면서 서로를 더 알아가는 시간이 필요해요.",
          percentage: 65
        },
        {
          prediction: "지금은 다른 일에 집중하고 있어서 연애 생각이 별로 없어요 💼",
          detail: "개인적인 목표나 일에 몰두하고 있는 시기예요. 당신이 나쁘다는 게 아니라, 지금은 자신에게 집중하고 싶은 마음이 더 큰 상태랍니다.",
          advice: "지금은 거리를 두고 응원하는 마음으로 지켜봐 주세요. 때로는 기다림이 가장 큰 사랑이에요.",
          percentage: 42
        },
        {
          prediction: "당신에 대한 호감을 느끼지만 표현을 망설이고 있어요 ✨",
          detail: "마음은 있지만 거절당할까봐, 지금의 관계가 깨질까봐 걱정하고 있어요. 신중한 성격이라 더욱 신경쓰이는 것 같아요.",
          advice: "먼저 편안한 분위기를 만들어주세요. 부담스럽지 않은 선에서 관심을 표현해보는 것이 좋겠어요.",
          percentage: 71
        },
        {
          prediction: "아직 마음의 준비가 안 된 것 같아요 🤍",
          detail: "과거의 상처나 개인적인 이유로 새로운 관계에 대해 조심스러워하고 있어요. 당신을 싫어하는 게 아니라 자신을 보호하려는 마음이 커요.",
          advice: "서두르지 말고 좋은 친구로 먼저 자리잡아 보세요. 신뢰가 쌓이면 마음도 천천히 열릴 거예요.",
          percentage: 38
        }
      ];

      const randomResult = sampleResults[Math.floor(Math.random() * sampleResults.length)];
      setResult(randomResult);

      const today = new Date().toDateString();
      localStorage.setItem('mindReaderUsageDate', today);
      localStorage.setItem('mindReaderLastUsed', Date.now().toString());
      setHasUsedToday(true);

    } catch (error) {
      setError('분석 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setFormData({
      partnerName: '',
      relationship: '',
      todaySituation: ''
    });
    setError('');
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 70) return 'text-pink-500';
    if (percentage >= 50) return 'text-amber-500';
    return 'text-gray-500';
  };

  const navigateToHome = () => {
    navigate('/');
  };

  const navigateToAnalyze = () => {
    navigate('/analyze');
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50">
        <header className="relative z-50 bg-white/50 backdrop-blur-sm border-b border-pink-100">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
            <button 
              onClick={resetForm}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              다시 보기
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-lg font-bold text-gray-800">오늘의 속마음</h1>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-4">
              <div className="relative">
                <Heart className="w-16 h-16 text-pink-400 animate-pulse" />
                <Sparkles className="w-6 h-6 text-amber-400 absolute -top-1 -right-1 animate-spin" style={{animationDuration: '3s'}} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {formData.partnerName}님의 마음
            </h2>
            <div className={`text-4xl font-bold mb-2 ${getPercentageColor(result.percentage)}`}>
              {result.percentage}%
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-rose-100 shadow-lg">
              <div className="flex items-center mb-4">
                <Eye className="w-6 h-6 text-pink-500 mr-3" />
                <h3 className="text-xl font-bold text-gray-800">지금 이 순간</h3>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                {result.prediction}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {result.detail}
              </p>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 backdrop-blur-lg rounded-3xl p-8 border border-amber-100 shadow-lg">
              <div className="flex items-center mb-4">
                <Star className="w-6 h-6 text-amber-500 mr-3" />
                <h3 className="text-xl font-bold text-gray-800">마음의 조언</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {result.advice}
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-center text-gray-600">
                <Moon className="w-5 h-5 mr-2" />
                <span className="text-sm">오늘의 속마음 보기가 완료되었습니다. 내일 다시 만나요!</span>
              </div>
            </div>

            {/* 궁합 분석 추천 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur-lg rounded-3xl p-8 border border-blue-100 shadow-lg">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {formData.partnerName}님과의 더 자세한 궁합도 보실래요?
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  생년월일시로 알아보는 정확한 사주 궁합 분석으로
                  <br />
                  두 사람의 인연을 더 깊이 들여다보세요
                </p>
                <button 
                  onClick={navigateToAnalyze}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2 mx-auto"
                >
                  <Heart className="w-5 h-5" />
                  <span>무료 궁합 분석하기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-center pt-4">
              <button 
                onClick={navigateToHome}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50">
      <header className="relative z-50 bg-white/50 backdrop-blur-sm border-b border-pink-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <button 
            onClick={navigateToHome}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            뒤로가기
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-gray-800">오늘의 속마음</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-200 to-rose-300 rounded-full flex items-center justify-center animate-pulse">
                <Eye className="w-12 h-12 text-white" />
              </div>
              <Sparkles className="w-6 h-6 text-amber-400 absolute -top-1 -right-1 animate-spin" style={{animationDuration: '3s'}} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            오늘의 속마음
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            {user?.name}님, 그 사람의 진짜 마음을 들여다볼까요?
            <br />
            <span className="text-sm text-gray-500">하루에 한 번, 특별한 순간</span>
          </p>
        </div>

        {hasUsedToday ? (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-gray-200 shadow-lg text-center">
            <Moon className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">오늘은 이미 확인했어요</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              하루에 한 번만 볼 수 있는 특별한 기능이에요.
              <br />
              내일 다시 그 사람의 마음을 들여다보러 오세요!
            </p>
            <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl p-4 border border-gray-200">
              <p className="text-gray-500 text-sm">
                🌙 자정이 지나면 다시 이용하실 수 있어요
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-rose-100 shadow-lg">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-3">
                  궁금한 그 사람의 이름은?
                </label>
                <input
                  type="text"
                  name="partnerName"
                  value={formData.partnerName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-white/50 border border-rose-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent backdrop-blur-sm text-lg"
                  placeholder="예: 김민수"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-3">
                  둘 사이의 관계는?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'crush', label: '짝사랑', emoji: '💕' },
                    { value: 'friend', label: '친구', emoji: '😊' },
                    { value: 'dating', label: '썸/연인', emoji: '💖' },
                    { value: 'complicated', label: '복잡한 사이', emoji: '🤔' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({...formData, relationship: option.value})}
                      className={`py-4 px-4 rounded-xl border transition-all text-left ${
                        formData.relationship === option.value
                          ? 'bg-rose-500/20 border-rose-400 text-rose-700'
                          : 'bg-white/50 border-gray-200 text-gray-600 hover:bg-white/80'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-xl mr-3">{option.emoji}</span>
                        <span className="font-medium">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-3">
                  오늘 어떤 일이 있었나요?
                </label>
                <textarea
                  name="todaySituation"
                  value={formData.todaySituation}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-4 bg-white/50 border border-rose-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent backdrop-blur-sm resize-none"
                  placeholder="예: 오늘 우연히 마주쳤는데 평소보다 오래 이야기했어요. 헤어질 때 아쉬워하는 것 같았고..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  구체적으로 적을수록 더 정확한 분석이 가능해요
                </p>
              </div>

              <button
                onClick={analyzeMind}
                disabled={isLoading}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                  isLoading
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white hover:scale-105 shadow-lg'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>마음을 들여다보는 중...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Eye className="w-6 h-6" />
                    <span>마음 들여다보기</span>
                    <Sparkles className="w-5 h-5" />
                  </div>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm leading-relaxed">
            💡 속마음 예측은 하루에 한 번만 가능해요
            <br />
            더 정확한 분석을 위해 솔직하게 작성해주세요
          </p>
        </div>
      </div>
    </div>
  );
};

export default MindReaderPage;