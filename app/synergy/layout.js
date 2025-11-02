export const metadata = {
  title: "무료 궁합 테스트 - MBTI와 팔자 궁합 보기 | 성격팔자",
  description: "나와 상대방의 MBTI, 팔자유형 궁합을 무료로 확인하세요. 연인, 친구, 동료와의 궁합 점수와 상세 분석을 제공합니다.",
  keywords: "궁합 테스트, MBTI 궁합, 사주 궁합, 팔자 궁합, 무료 궁합, 연애 궁합, 친구 궁합",
  openGraph: {
    title: "무료 궁합 테스트 - 우리의 궁합은?",
    description: "MBTI와 팔자유형으로 보는 궁합 분석. 나와 상대방의 궁합 점수를 확인해보세요!",
    type: "website",
    locale: "ko_KR",
    images: [
      {
        url: "/assets/images/service-2.png",
        width: 800,
        height: 600,
        alt: "궁합 테스트",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "무료 궁합 테스트 - 우리의 궁합은?",
    description: "MBTI와 팔자유형으로 보는 궁합 분석",
    images: ["/assets/images/service-2.png"],
  },
};

export default function SynergyLayout({ children }) {
  return children;
}