import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import './App.css';

// 컴포넌트들을 Lazy Loading으로 변경
const HomePage = React.lazy(() => import('./pages/HomePage'));
const AnalyzePage = React.lazy(() => import('./pages/AnalyzePage'));
const MindReaderPage = React.lazy(() => import('./pages/MindReaderPage'));
const CommunityPage = React.lazy(() => import('./pages/CommunityPage'));
const KakaoCallback = React.lazy(() => import('./pages/KakaoCallback'));

// Loading 컴포넌트
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">로딩중...</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <React.Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/analyze" element={<AnalyzePage />} />
              <Route path="/mind-reader" element={<MindReaderPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/auth/kakao/callback" element={<KakaoCallback />} />
              {/* 404 페이지 추가 */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                    <p className="text-gray-600 mb-6">페이지를 찾을 수 없습니다</p>
                    <a href="/" className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-xl">
                      홈으로 돌아가기
                    </a>
                  </div>
                </div>
              } />
            </Routes>
          </React.Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;