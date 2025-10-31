import "./globals.css";
import Navigation from "./components/Navigation";
import { Toaster } from "sonner";
import { Suspense } from "react";
import { GoogleAnalytics } from "../components/GoogleAnalytics";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: "성격팔자 - 내 인생, 합법적 스포일러",
  description:
    "MBTI와 팔자유형을 결합한 새로운 성격 분석. 토리와 함께 당신의 진짜 모습을 발견해보세요.",
  keywords: "성격팔자, MBTI, 사주팔자, 성격분석, 토리, 팔자유형",
  robots: "index, follow",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "성격팔자",
    startupImage: [
      "/assets/images/icon-192x192.png",
    ],
  },
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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <script src="https://developers.kakao.com/sdk/js/kakao.js" async />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "tykgmkidie");
            `,
          }}
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        </Suspense>
        <Navigation />
        <main>{children}</main>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#131316",
              color: "#FCA311",
              border: "1px solid #FCA311",
            },
          }}
        />
      </body>
    </html>
  );
}
