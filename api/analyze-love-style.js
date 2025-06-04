// api/analyze-love-style.js - 다정하고 간단한 버전
export default async function handler(req, res) {
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
    const { 
      myName, myBirthDate, myGender, myBirthTime,
      partnerName, partnerBirthDate, partnerGender, partnerBirthTime 
    } = req.body;

    if (!myName || !myBirthDate || !myGender || !partnerName || !partnerBirthDate || !partnerGender) {
      return res.status(400).json({ error: '필수 정보를 모두 입력해주세요.' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not found');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `당신은 연애사주 상담사입니다.  
두 사람의 생년월일을 바탕으로 궁합을 분석해주세요.

🎯 핵심 규칙:
1. 2~3줄 메시지로 간단하게 작성할 것
2. 두 사람의 궁합을 현실적이게 전달할것
3. **전문 용어 없이, 누구나 이해할 수 있는 표현 사용**
4. **구체적인 생년월일 정보를 반영한 개인화된 분석**
5. **이 관계가 궁금해질 수 있도록, 말미에 자연스럽게 흐름을 암시해줄 것**
6. 이모지는 1~2개 정도 자연스럽게 사용

**퍼센트별 톤 가이드:**
- 30-50%: 솔직하지만 희망적인 톤 (현실적으로)
- 51-69%: 관심은 있지만 확신이 서지 않는 톤 (더 알고 싶게)
- 70-79%: 좋지만 뭔가 아쉬운 톤 (더 깊이 알고 싶게)  
- 80-89%: 긍정적이고 좋은 톤
- 90%+: 매우 긍정적인 톤 (드물게)

🎯 퍼센트 가이드:
- 30~50% : 사주에 따른 가이드를 보고 행해야 이뤄질수 있는 궁합
- 50~69%: 서로 다른 점이 많아 알아가는 데 노력이 필요한 궁합 
- 70~79%: 끌림은 분명하지만, 진짜 마음을 알려면 체계적인 가이드 필요할 것 같아요 🤔
- 80~89%: 잘 통하고 편안한 좋은 인연 (거의 사용하지 않음)
- 90% 이상: 매우 드문 천생연분 (거의 사용하지 않음 완벽한 천생연분)

**분포 가이드:** 다양한 퍼센트 구간을 골고루 사용하세요
- 30-50%: 35% 비율
- 51-69%: 45% 비율  
- 70-79%: 10% 비율
- 80%+: 5% 비율

📌 답변 형식 (반드시 따라야 함):
"궁합 XX% - [퍼센트에 따른 현실적인 메세지. 말 끝에 이어지려면 사주에 맞는 움직임이 필요하다고 조언]"`
          },
          {
            role: 'user',
            content: `다음 두 사람의 궁합을 분석해주세요:

${myName} (${myGender}, ${myBirthDate}생)
${partnerName} (${partnerGender}, ${partnerBirthDate}생)

이 두 사람의 생년월일을 바탕으로 개인화된 궁합을 분석하여, 한 줄로 답변해주세요.
전문 용어 없이 누구나 이해할 수 있는 따뜻한 말로 해주세요.

형식: "궁합 XX% - [한 줄 메시지]"`
          }
        ],
        max_tokens: 150, // 2-3줄을 위해 조금 늘림
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const loveStyle = data.choices[0].message.content.trim();

    console.log('Sweet AI Response:', loveStyle);

    res.status(200).json({
      success: true,
      loveStyle: loveStyle,
      myName: myName,
      partnerName: partnerName
    });

  } catch (error) {
    console.error('Error:', error);
    
    // 에러 시 새로운 분포에 맞는 폴백 메시지들
    const newDistributionFallbacks = [
      // 30-50% 구간 (30% 비율 - 9개)
      "궁합 43% - 지금은 힘들어 보이지만 서로 이해하려 노력한다면 달라질 수 있어요. 구체적인 방법을 알면 어떨까요? 🌱",
      "궁합 38% - 솔직히 쉽지 않은 조합이지만, 사주 가이드를 따르면 변화가 있을 수 있어요 🤷‍♀️",
      "궁합 47% - 현재로선 어려워 보이지만 올바른 접근법을 안다면 또 모르는 일이에요 ⏰",
      "궁합 41% - 지금 상황은 복잡하지만, 정확한 타이밍을 안다면 기회가 있을 거예요 💫",
      "궁합 35% - 쉽지 않은 관계지만 사주에서 보여주는 길을 따르면 달라질 수 있어요 🗺️",
      "궁합 49% - 현실적으로 어렵지만 서로의 마음을 제대로 안다면 가능성이 보여요 💭",
      "궁합 44% - 지금은 거리가 있지만 올바른 방향을 안다면 가까워질 수 있을 거예요 🎯",
      "궁합 36% - 많은 노력이 필요하지만 정확한 가이드가 있다면 희망이 있어요 ✨",
      "궁합 46% - 어려운 조합이지만 서로의 진짜 마음을 알면 변화가 생길 수 있어요 💝",
      
      // 51-69% 구간 (35% 비율 - 10개)
      "궁합 56% - 뭔가 끌리긴 하는데 확신이 서지 않아서 더 알아봐야겠어요 🤔",
      "궁합 62% - 관심은 있지만 진짜 마음은 아직 확실하지 않은 것 같아요 💭",
      "궁합 58% - 첫인상은 나쁘지 않지만 깊은 마음은 좀 더 봐야 할듯해요 👀",
      "궁합 65% - 서로 다른 점이 많아서 알아가는 데 시간과 노력이 필요할 것 같아요 ⏳",
      "궁합 53% - 호기심은 있지만 실제 궁합이 어떨지 좀 더 자세히 봐야겠어요 🔍",
      "궁합 67% - 끌림은 있는데 서로 맞는 부분과 다른 부분을 더 알고 싶어요 ⚖️",
      "궁합 59% - 관심은 분명한데 진짜 잘 맞을지는 더 깊이 들여다봐야 할 것 같아요 🌊",
      "궁합 64% - 나쁘지 않은 인연이지만 중요한 포인트들을 더 확인해보고 싶어요 📍",
      "궁합 61% - 뭔가 특별한 게 있는 것 같은데, 정확히 뭔지 더 알아보고 싶네요 🎪",
      "궁합 68% - 관심은 있지만 앞으로의 흐름이 어떨지 더 자세히 보고 싶어요 🌙",
      
      // 70-79% 구간 (30% 비율 - 9개)
      "궁합 72% - 끌림은 있지만 진짜 마음을 알려면 더 깊이 들여다봐야 할 것 같아요 🤔",
      "궁합 75% - 좋은 인연이지만 중요한 포인트들을 더 확인해볼 필요가 있어요 ✨",
      "궁합 77% - 나쁘지 않지만 진짜 운명인지 더 정확히 알고 싶지 않으세요? 🌙",
      "궁합 73% - 분명 끌림이 있는데, 이 관계가 어디로 향할지 더 알아보고 싶어요 🗺️",
      "궁합 76% - 좋은 느낌이지만 정말 잘 될 수 있을지 가이드가 필요할 것 같아요 🎯",
      "궁합 74% - 끌리는 건 확실한데 진짜 마음과 앞으로의 흐름을 더 알고 싶어요 💫",
      "궁합 78% - 나쁘지 않은 궁합이지만 완벽하게 이어지려면 뭔가 더 필요할 것 같아요 🔗",
      "궁합 71% - 관심이 있는 건 분명한데, 이 감정이 진짜인지 더 확인하고 싶어요 💝",
      "궁합 79% - 좋은 인연 같은데 정말 잘 풀릴 수 있을지 더 자세히 보고 싶네요 🌸"
    ];
    
    const randomMessage = newDistributionFallbacks[Math.floor(Math.random() * newDistributionFallbacks.length)];
    
    res.status(200).json({
      success: true,
      loveStyle: randomMessage,
      myName: req.body.myName || '익명',
      partnerName: req.body.partnerName || '익명',
      fallback: true
    });
  }
}