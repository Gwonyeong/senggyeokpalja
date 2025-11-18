export const metadata = {
  title: "무료 팔자유형 테스트 - 성격유형과 사주의 만남 | 성격팔자",
  description:
    "무료로 나의 팔자유형을 알아보세요. 성격유형과 사주팔자를 결합한 새로운 성격 분석. 16가지 유형 중 당신은 어떤 타입일까요?",
  keywords:
    "무료 사주, 팔자유형 테스트, 성격유형 사주, 무료 성격테스트, 사주 성격유형, 팔자 분석",
  openGraph: {
    title: "무료 팔자유형 테스트 - 나는 어떤 팔자?",
    description:
      "성격유형과 사주팔자를 결합한 무료 성격 분석. 지금 바로 당신의 팔자유형을 확인해보세요!",
    type: "website",
    locale: "ko_KR",
    images: [
      {
        url: "/assets/images/service-1.png",
        width: 800,
        height: 600,
        alt: "팔자유형 테스트",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "무료 팔자유형 테스트 - 나는 어떤 팔자?",
    description: "성격유형과 사주팔자를 결합한 무료 성격 분석",
    images: ["/assets/images/service-1.png"],
  },
};

export default function AnalyzeLayout({ children }) {
  return children;
}
