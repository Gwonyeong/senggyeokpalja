import "./globals.css";
import Navigation from "./components/Navigation";

export const metadata = {
  title: "성격팔자 - 내 인생, 합법적 스포일러",
  description:
    "MBTI와 팔자유형을 결합한 새로운 성격 분석. 토리와 함께 당신의 진짜 모습을 발견해보세요.",
  keywords: "성격팔자, MBTI, 사주팔자, 성격분석, 토리, 팔자유형",
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "성격팔자 - 내 인생, 합법적 스포일러",
    description:
      "MBTI와 팔자유형을 결합한 새로운 성격 분석. 토리와 함께 당신의 진짜 모습을 발견해보세요.",
    type: "website",
    locale: "ko_KR",
    siteName: "성격팔자",
    images: [
      {
        url: "/assets/images/logo.png",
        width: 800,
        height: 600,
        alt: "성격팔자 로고",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "성격팔자 - 내 인생, 합법적 스포일러",
    description:
      "MBTI와 팔자유형을 결합한 새로운 성격 분석. 토리와 함께 당신의 진짜 모습을 발견해보세요.",
    images: ["/assets/images/logo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <script src="https://developers.kakao.com/sdk/js/kakao.js" async />
      </head>
      <body>
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  );
}
