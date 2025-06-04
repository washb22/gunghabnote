import React, { useState, useEffect, createContext, useContext } from 'react';
import {
    auth,
    signInWithGoogle,
    signInWithKakao,
    logout as firebaseLogout,
    onAuthChange,
    db
} from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export const useAuth = () => { // useAuth는 named export로 유지
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// AuthProvider 컴포넌트 선언 시 'export' 키워드를 제거합니다.
const AuthProvider = ({ children }) => { // <--- 이 부분에서 'export' 제거
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Firebase Auth 상태 감지
    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            if (firebaseUser) {
                // Firestore에서 추가 사용자 정보 가져오기
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                const userData = userDoc.data();

                setUser({
                    id: firebaseUser.uid,
                    email: firebaseUser.email,
                    name: firebaseUser.displayName || userData?.name || '사용자',
                    picture: firebaseUser.photoURL || userData?.picture || '',
                    provider: userData?.provider || 'email',
                    ...userData
                });
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Firestore에 사용자 정보 저장
    const saveUserToFirestore = async (user, additionalData = {}) => {
        try {
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                name: user.displayName || additionalData.name,
                picture: user.photoURL || '',
                provider: additionalData.provider || 'email',
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                ...additionalData
            }, { merge: true });
        } catch (error) {
            console.error('Firestore 저장 오류:', error);
        }
    };

    // 이메일 회원가입
    const signup = async (userData) => {
        try {
            // Firebase Auth에 사용자 생성
            const { user } = await createUserWithEmailAndPassword(
                auth,
                userData.email,
                userData.password
            );

            // 프로필 업데이트
            await updateProfile(user, {
                displayName: userData.name
            });

            // Firestore에 저장
            await saveUserToFirestore(user, {
                name: userData.name,
                birthDate: userData.birthDate,
                provider: 'email'
            });

            return { success: true };
        } catch (error) {
            console.error('회원가입 오류:', error);
            let errorMessage = '회원가입에 실패했습니다.';

            if (error.code === 'auth/email-already-in-use') {
                errorMessage = '이미 사용 중인 이메일입니다.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = '비밀번호는 6자 이상이어야 합니다.';
            }

            return { success: false, error: errorMessage };
        }
    };

    // 이메일 로그인
    const login = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (error) {
            console.error('로그인 오류:', error);
            let errorMessage = '로그인에 실패했습니다.';

            if (error.code === 'auth/user-not-found') {
                errorMessage = '존재하지 않는 계정입니다.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = '비밀번호가 올바르지 않습니다.';
            }

            return { success: false, error: errorMessage };
        }
    };

    // 구글 로그인
    const googleLogin = async () => {
        try {
            const result = await signInWithGoogle();
            if (result) {
                await saveUserToFirestore(result, { provider: 'google' });
                return { success: true };
            }
            return { success: false, error: '구글 로그인 실패' };
        } catch (error) {
            console.error('구글 로그인 오류:', error);

            // 에러 메시지 상세 처리
            let errorMessage = '구글 로그인에 실패했습니다.';
            if (error.code === 'auth/unauthorized-domain') {
                errorMessage = '승인되지 않은 도메인입니다. Firebase 콘솔에서 도메인을 추가해주세요.';
            } else if (error.code === 'auth/popup-blocked') {
                errorMessage = '팝업이 차단되었습니다. 팝업 차단을 해제해주세요.';
            } else if (error.code === 'auth/cancelled-popup-request') {
                errorMessage = '로그인이 취소되었습니다.';
            }

            return { success: false, error: errorMessage };
        }
    };

    // 카카오 로그인
    const kakaoLogin = () => {
        signInWithKakao();
    };

    // 카카오 로그인 콜백 처리
    const handleKakaoCallback = async (kakaoUser) => {
        try {
            const uniqueId = Date.now();
            const email = `kakao_${uniqueId}@kakao.com`;
            const password = `kakao_${uniqueId}_password`;

            try {
                const { user } = await createUserWithEmailAndPassword(auth, email, password);

                await updateProfile(user, {
                    displayName: kakaoUser.name || '카카오 사용자',
                    photoURL: kakaoUser.picture || ''
                });

                await saveUserToFirestore(user, {
                    name: kakaoUser.name || '카카오 사용자',
                    picture: kakaoUser.picture || '',
                    provider: 'kakao',
                    kakaoId: kakaoUser.id,
                    originalEmail: kakaoUser.email
                });

                return { success: true };
            } catch (error) {
                console.error('카카오 계정 생성 실패:', error);

                if (error.code === 'auth/email-already-in-use') {
                    try {
                        await signInWithEmailAndPassword(auth, email, password);
                        return { success: true };
                    } catch (loginError) {
                        console.error('카카오 로그인 실패:', loginError);
                    }
                }

                return { success: false, error: error.message };
            }
        } catch (error) {
            console.error('카카오 콜백 처리 오류:', error);
            return { success: false, error: '카카오 로그인 처리에 실패했습니다.' };
        }
    };

    // 네이버 로그인 (미구현)
    const naverLogin = async () => {
        alert('네이버 로그인은 준비 중입니다.');
        return { success: false };
    };

    // 로그아웃
    const logout = async () => {
        try {
            await firebaseLogout();
            setUser(null);
        } catch (error) {
            console.error('로그아웃 오류:', error);
        }
    };

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
            googleLogin,
            kakaoLogin,
            naverLogin,
            handleKakaoCallback,
            findUser: () => null,
            checkEmailExists: () => null
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider; // <-- 여기에 세미콜론(;) 추가