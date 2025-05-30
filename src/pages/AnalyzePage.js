import React, { useState } from 'react';
import { Heart, Sparkles, ArrowRight, Star, AlertCircle, ChevronDown } from 'lucide-react';

// 커스텀 시간 선택기 컴포넌트
const CustomTimePicker = ({ value, onChange, name, optional = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');

  // 24시간 형식에서 12시간 형식으로 변환
  React.useEffect(() => {
    if (value) {
      const [hour, minute] = value.split(':');
      const hourNum = parseInt(hour);
      if (hourNum === 0) {
        setSelectedHour('12');
        setSelectedPeriod('AM');
      } else if (hourNum <= 12) {
        setSelectedHour(hourNum.toString());
        setSelectedPeriod(hourNum === 12 ? 'PM' : 'AM');
      } else {
        setSelectedHour((hourNum - 12).toString());
        setSelectedPeriod('PM');
      }
      setSelectedMinute(minute);
    }
  }, [value]);

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const handleTimeSelect = (hour, minute, period) => {
    // 12시간 형식을 24시간 형식으로 변환
    let hour24;
    if (period === 'AM') {
      hour24 = hour === '12' ? '00' : hour.padStart(2, '0');
    } else {
      hour24 = hour === '12' ? '12' : (parseInt(hour) + 12).toString();
    }
    
    const timeValue = `${hour24}:${minute.padStart(2, '0')}`;
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setSelectedPeriod(period);
    onChange({
      target: {
        name,
        value: timeValue
      }
    });
    setIsOpen(false);
  };

  const displayTime = selectedHour && selectedMinute ? 
    `${selectedPeriod} ${selectedHour}:${selectedMinute.padStart(2, '0')}` : 
    optional ? '시간 선택 (선택사항)' : '시간 선택';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white backdrop-blur-sm flex items-center justify-between hover:bg-white/25 transition-colors"
      >
        <span className={selectedHour && selectedMinute ? 'text-white' : 'text-white/50'}>
          {displayTime}
        </span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="fixed top-0 left-0 w-full h-full bg-black/70 flex items-center justify-center p-4" 
          style={{ zIndex: 9999 }}
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="text-center mb-6">
              <h3 className="text-gray-800 font-bold text-xl mb-2">⏰ 시간 선택</h3>
              <p className="text-gray-600 text-sm">{optional ? '선택사항입니다' : '정확한 시간을 선택해주세요'}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* AM/PM 선택 */}
              <div>
                <h4 className="text-gray-700 text-sm font-medium mb-3 text-center">오전/오후</h4>
                <div className="space-y-2">
                  {['AM', 'PM'].map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => {
                        setSelectedPeriod(period);
                        if (selectedHour && selectedMinute) {
                          handleTimeSelect(selectedHour, selectedMinute, period);
                        }
                      }}
                      className={`w-full px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                        selectedPeriod === period
                          ? period === 'AM' 
                            ? 'bg-orange-500 text-white border-2 border-orange-400 shadow-lg'
                            : 'bg-indigo-500 text-white border-2 border-indigo-400 shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      {period === 'AM' ? '🌅 오전' : '🌙 오후'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 시간 선택 (1-12) */}
              <div>
                <h4 className="text-gray-700 text-sm font-medium mb-3 text-center">시</h4>
                <div 
                  className="max-h-48 overflow-y-auto space-y-1 pr-1"
                  style={{
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none'
                  }}
                >
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => {
                        setSelectedHour(hour);
                        if (selectedMinute) {
                          handleTimeSelect(hour, selectedMinute, selectedPeriod);
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedHour === hour
                          ? 'bg-pink-500 text-white border border-pink-400 shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {hour}시
                    </button>
                  ))}
                </div>
              </div>

              {/* 분 선택 (00-59) */}
              <div>
                <h4 className="text-gray-700 text-sm font-medium mb-3 text-center">분</h4>
                <div 
                  className="max-h-48 overflow-y-auto space-y-1 pr-1"
                  style={{
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none'
                  }}
                >
                  {minutes.map((minute) => (
                    <button
                      key={minute}
                      type="button"
                      onClick={() => {
                        setSelectedMinute(minute);
                        if (selectedHour) {
                          handleTimeSelect(selectedHour, minute, selectedPeriod);
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedMinute === minute
                          ? 'bg-purple-500 text-white border border-purple-400 shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {minute}분
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 현재 선택된 시간 미리보기 */}
            {selectedHour && selectedMinute && (
              <div className="bg-gray-100 rounded-2xl p-4 mb-6 text-center border border-gray-200">
                <p className="text-gray-600 text-sm mb-1">선택된 시간</p>
                <p className="text-gray-800 text-lg font-bold">
                  {selectedPeriod === 'AM' ? '🌅' : '🌙'} {selectedPeriod} {selectedHour}:{selectedMinute.padStart(2, '0')}
                </p>
              </div>
            )}

            {/* 버튼들 */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors border border-gray-300"
              >
                취소
              </button>
              {optional && (
                <button
                  type="button"
                  onClick={() => {
                    onChange({
                      target: { name, value: '' }
                    });
                    setIsOpen(false);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-400 text-white rounded-xl hover:bg-gray-500 transition-colors"
                >
                  건너뛰기
                </button>
              )}
              {selectedHour && selectedMinute && (
                <button
                  type="button"
                  onClick={() => handleTimeSelect(selectedHour, selectedMinute, selectedPeriod)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  ✓ 선택
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 메인 App 컴포넌트
const AnalyzePage = () => {
  const [formData, setFormData] = useState({
    myName: '',
    myBirthDate: '',
    myGender: '',
    myBirthTime: '',
    partnerName: '',
    partnerBirthDate: '',
    partnerGender: '',
    partnerBirthTime: ''
  });
  const [result, setResult] = useState({ percentage: 0, message: '', ctaMessage: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState('');

  // 퍼센티지별 색상 스타일 함수
  const getPercentageStyles = (percentage) => {
    if (percentage >= 90) {
      return {
        textColor: 'text-emerald-400',
        gradient: 'bg-gradient-to-r from-emerald-400 to-green-500'
      };
    }
    if (percentage >= 80) {
      return {
        textColor: 'text-green-400',
        gradient: 'bg-gradient-to-r from-green-400 to-emerald-500'
      };
    }
    if (percentage >= 70) {
      return {
        textColor: 'text-yellow-400',
        gradient: 'bg-gradient-to-r from-yellow-400 to-amber-500'
      };
    }
    if (percentage >= 60) {
      return {
        textColor: 'text-orange-400',
        gradient: 'bg-gradient-to-r from-orange-400 to-yellow-500'
      };
    }
    if (percentage >= 50) {
      return {
        textColor: 'text-red-400',
        gradient: 'bg-gradient-to-r from-red-400 to-pink-500'
      };
    }
    return {
      textColor: 'text-purple-400',
      gradient: 'bg-gradient-to-r from-purple-400 to-pink-500'
    };
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // 에러 상태 초기화
    if (error) setError('');
  };


const handleSubmit = async () => {
  if (!isFormValid) return;
  
  setIsLoading(true);
  setError('');
  
  try {
    console.log('API 호출 시작...');
    
    const response = await fetch('/api/analyze-love-style', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    console.log('응답 상태:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('받은 데이터:', data);

    if (data.success && data.loveStyle) {
      // AI 응답 전체를 그대로 사용
      const aiResponse = data.loveStyle.trim();
      console.log('AI 전체 응답:', aiResponse);
      
      // "궁합 XX% - " 패턴으로 분리
      const match = aiResponse.match(/궁합\s*(\d+)%\s*-\s*(.+)/);
      
      let percentage = 70; // 기본값
      let message = aiResponse; // 전체 응답을 기본으로
      
      if (match) {
        percentage = parseInt(match[1]); // 퍼센트 추출
        message = match[2].trim(); // "- " 뒤의 실제 AI 메시지
        console.log('파싱 성공:', { percentage, message });
      } else {
        // 매칭 실패 시 전체 메시지 사용
        const percentMatch = aiResponse.match(/(\d+)%/);
        if (percentMatch) {
          percentage = parseInt(percentMatch[1]);
        }
        console.log('매칭 실패, 전체 사용:', { percentage, message });
      }
      
      // 퍼센트 범위 조정
      percentage = Math.max(60, Math.min(100, percentage));
      
      // CTA 메시지 설정
      let ctaMessage = '';
      if (percentage < 80) {
        if (percentage >= 70) {
          ctaMessage = "지금 관계가 더 가까워지려면, 자세한 궁합에따른 접근이 필요합니다.";
        } else if (percentage >= 60) {
          ctaMessage = "인연을 이어가는 방법은 사주에 맞는 접근부터 시작돼요.";
        } else {
          ctaMessage = "상대사주에 맞는 접근법만 알아도, 완전히 달라질 수 있어요.";
        }
      }

      console.log('최종 설정:', { percentage, message, ctaMessage });
      
      // 결과 설정 - AI가 생성한 실제 메시지 사용
      setResult({ 
        percentage: percentage, 
        message: message, // AI가 실제로 생성한 개인화된 메시지
        ctaMessage: ctaMessage 
      });
      setShowResult(true);
      
    } else {
      console.error('응답 데이터 문제:', data);
      throw new Error('Invalid response data');
    }
    
  } catch (error) {
    console.error('에러 발생:', error);
    
    // 에러 시에도 개인화된 폴백
    const fallbackResults = [
      { percentage: 68, message: `${formData.myName}님과 ${formData.partnerName}님은 끌림은 있지만, 서로를 이해하는 방식이 조금 다를 수 있어요 💕`, ctaMessage: "타이밍과 표현법을 더 알고 싶지 않으세요?" },
      { percentage: 72, message: `두 분의 관계는 호기심으로 시작되지만 감정적 교감을 위해서는 시간이 필요해요 ✨`, ctaMessage: "지금 관계가 더 가까워지려면, 흐름을 아는 게 중요해요." }
    ];
    
    const randomResult = fallbackResults[Math.floor(Math.random() * fallbackResults.length)];
    setResult(randomResult);
    setShowResult(true);
    
  } finally {
    setIsLoading(false);
  }
};
  const isFormValid = formData.myName && formData.myBirthDate && formData.myGender && 
                     formData.partnerName && formData.partnerBirthDate && formData.partnerGender;

  const resetForm = () => {
    setShowResult(false);
    setFormData({
      myName: '', myBirthDate: '', myGender: '', myBirthTime: '',
      partnerName: '', partnerBirthDate: '', partnerGender: '', partnerBirthTime: ''
    });
    setResult({ percentage: 0, message: '', ctaMessage: '' });
    setError('');
  };

  if (showResult) {
    const percentageStyles = getPercentageStyles(result.percentage);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="mb-8">
              <div className="flex justify-center items-center space-x-2 mb-4">
                <Heart className="w-12 h-12 text-pink-400 animate-pulse" />
                <span className="text-4xl">💕</span>
                <Heart className="w-12 h-12 text-purple-400 animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {formData.myName} ✕ {formData.partnerName}
              </h2>
              <p className="text-white/70 text-lg">두 사람의 사주 궁합</p>
            </div>
            
            {/* 퍼센트 원형 표시 */}
            <div className="mb-8">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className={`absolute inset-0 rounded-full ${percentageStyles.gradient} p-1`}>
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
                    <span className={`text-3xl font-bold ${percentageStyles.textColor}`}>
                      {result.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl p-6 mb-8 border border-pink-300/30">
              <p className="text-xl text-white leading-relaxed font-medium">
                {result.message}
              </p>
            </div>

            <div className="space-y-4">
              {result.ctaMessage && (
                <>
                  <p className="text-white/80 text-lg">
                    {result.ctaMessage}
                  </p>
                  
                  <button 
                    onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSdPSrx-M-MdwdBlQ3Q1fILrNjerlFTgt7E0CAFwppnaBzc6rw/viewform?usp=header', '_blank')}
                    className="group w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <span className="text-2xl">💌</span>
                      <div className="text-left">
                        <div className="text-lg">이 사람과 정말 잘 될 수 있을까요?</div>
                        <div className="text-sm opacity-90">연애사주 리포트에서 자세히 알려드릴게요</div>
                      </div>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </>
              )}

              {!result.ctaMessage && result.percentage >= 80 && (
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-300/30">
                  <p className="text-white/90 text-lg font-medium">
                    🎉 정말 좋은 궁합이네요! 서로를 소중히 여기며 좋은 관계를 이어가세요 ✨
                  </p>
                </div>
              )}

              <button 
                onClick={resetForm}
                className="mt-6 text-white/60 hover:text-white transition-colors text-sm underline"
              >
                다른 사람과 궁합 보기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Heart className="w-12 h-12 text-pink-400 animate-pulse" />
              <Star className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-spin" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            짝남/짝녀와의 궁합
          </h1>
          <p className="text-white/70 text-lg">
            두 사람의 사주로 알아보는 특별한 인연
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/50 rounded-xl flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-8">
            {/* 내 정보 섹션 */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center">
                <span className="w-2 h-2 bg-pink-400 rounded-full mr-2"></span>
                내 정보
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    이름
                  </label>
                  <input
                    type="text"
                    name="myName"
                    value={formData.myName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent backdrop-blur-sm"
                    placeholder="내 이름을 입력해주세요"
                  />
                </div>

                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    생년월일
                  </label>
                  <input
                    type="date"
                    name="myBirthDate"
                    value={formData.myBirthDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    성별
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, myGender: '남자'})}
                      className={`py-3 px-4 rounded-xl border transition-all ${
                        formData.myGender === '남자' 
                          ? 'bg-blue-500/50 border-blue-400 text-white' 
                          : 'bg-white/10 border-white/30 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      남자
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, myGender: '여자'})}
                      className={`py-3 px-4 rounded-xl border transition-all ${
                        formData.myGender === '여자' 
                          ? 'bg-pink-500/50 border-pink-400 text-white' 
                          : 'bg-white/10 border-white/30 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      여자
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    태어난 시간
                  </label>
                  <CustomTimePicker
                    value={formData.myBirthTime}
                    onChange={handleInputChange}
                    name="myBirthTime"
                  />
                </div>
              </div>
            </div>

            {/* 상대 정보 섹션 */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                상대방 정보
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    상대 이름
                  </label>
                  <input
                    type="text"
                    name="partnerName"
                    value={formData.partnerName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm"
                    placeholder="상대방 이름을 입력해주세요"
                  />
                </div>

                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    상대 생년월일
                  </label>
                  <input
                    type="date"
                    name="partnerBirthDate"
                    value={formData.partnerBirthDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    상대 성별
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, partnerGender: '남자'})}
                      className={`py-3 px-4 rounded-xl border transition-all ${
                        formData.partnerGender === '남자' 
                          ? 'bg-blue-500/50 border-blue-400 text-white' 
                          : 'bg-white/10 border-white/30 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      남자
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, partnerGender: '여자'})}
                      className={`py-3 px-4 rounded-xl border transition-all ${
                        formData.partnerGender === '여자' 
                          ? 'bg-pink-500/50 border-pink-400 text-white' 
                          : 'bg-white/10 border-white/30 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      여자
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    상대 태어난 시간
                  </label>
                  <CustomTimePicker
                    value={formData.partnerBirthTime}
                    onChange={handleInputChange}
                    name="partnerBirthTime"
                    optional={true}
                  />
                  <p className="text-white/50 text-xs mt-1">
                    상대의 태어난 시간을 모르시면 입력하지 않으셔도 좋습니다.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isFormValid || isLoading}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                isFormValid && !isLoading
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white hover:scale-105 shadow-lg'
                  : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>두 사람의 궁합을 분석중...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl">💕</span>
                  <span>우리 궁합 분석하기</span>
                </div>
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-white/50 text-xs">
              무료 체험 • 1분만에 결과 확인
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyzePage;