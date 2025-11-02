export const metadata = {
  title: "2026년 신년운세 상담 - 토리의 인생 스포일러 | 성격팔자",
  description: "토리와 함께하는 2026년 신년운세 상담. 사주팔자, 십신, 오행 분석을 통한 상세한 인생 가이드. 9,900원으로 당신의 운명을 미리 확인하세요.",
  keywords: "2026년 운세, 신년운세, 사주상담, 토리 상담, 인생스포일러, 사주팔자 상담, 십신 분석, 오행 분석",
  openGraph: {
    title: "2026년 신년운세 상담 - 토리의 인생 스포일러",
    description: "사주팔자 전문가 토리가 들려주는 2026년 당신의 운세. 상세한 분석과 조언으로 새해를 준비하세요.",
    type: "website",
    locale: "ko_KR",
    images: [
      {
        url: "/assets/images/service-3.png",
        width: 800,
        height: 600,
        alt: "토리의 상담 서비스",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "2026년 신년운세 상담 - 토리의 인생 스포일러",
    description: "사주팔자 전문가 토리가 들려주는 2026년 당신의 운세",
    images: ["/assets/images/service-3.png"],
  },
};

export default function ConsultationLayout({ children }) {
  return children;
}