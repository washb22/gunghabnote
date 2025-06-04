// api/auth/kakao.js
export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: '인증 코드가 필요합니다' });
    }

    // 카카오 앱 정보
    const REST_API_KEY = 'd7e1a7e4eb292ffc1fbda3edc8bf9d07';
    const CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET || ''; // Vercel 환경변수에 설정
    const REDIRECT_URI = req.headers.origin 
      ? `${req.headers.origin}/auth/kakao/callback`
      : 'https://gunghabnote.com/auth/kakao/callback';

    console.log('카카오 토큰 요청 시작:', { code, REDIRECT_URI });

    // 1. 액세스 토큰 받기
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: REST_API_KEY,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code,
      }).toString(),
    });

    const tokenData = await tokenResponse.json();
    console.log('토큰 응답:', tokenData);

    if (tokenData.error) {
      console.error('토큰 에러:', tokenData);
      return res.status(400).json({ 
        error: '토큰 획득 실패', 
        details: tokenData.error_description 
      });
    }

    const { access_token } = tokenData;

    // 2. 사용자 정보 받기
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    });

    const userData = await userResponse.json();
    console.log('사용자 정보:', userData);

    if (!userResponse.ok) {
      return res.status(400).json({ 
        error: '사용자 정보 조회 실패',
        details: userData 
      });
    }

    // 3. 필요한 사용자 정보 추출
    const userInfo = {
      id: userData.id.toString(),
      email: userData.kakao_account?.email || `kakao_${userData.id}@kakao.com`,
      name: userData.properties?.nickname || 
            userData.kakao_account?.profile?.nickname || 
            '카카오 사용자',
      picture: userData.properties?.profile_image || 
               userData.kakao_account?.profile?.profile_image_url || 
               '',
      provider: 'kakao',
      // 추가 정보
      ageRange: userData.kakao_account?.age_range,
      birthday: userData.kakao_account?.birthday,
      gender: userData.kakao_account?.gender,
    };

    console.log('최종 사용자 정보:', userInfo);

    res.status(200).json({
      success: true,
      user: userInfo,
      access_token: access_token // 필요시 프론트엔드에서 사용
    });

  } catch (error) {
    console.error('카카오 로그인 에러:', error);
    res.status(500).json({
      error: '카카오 로그인 처리 중 오류가 발생했습니다',
      details: error.message
    });
  }
}