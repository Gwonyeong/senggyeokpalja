import { notFound, redirect } from 'next/navigation';
import { getShareData } from '../../../lib/share-data';

// 메타데이터를 동적으로 생성
export async function generateMetadata({ params }) {
  const { id } = params;

  const shareData = getShareData(id);

  if (!shareData) {
    return {
      title: '성격팔자 - 토리의 찻집',
      description: 'MBTI와 팔자유형을 결합한 새로운 성격 분석',
      openGraph: {
        title: '성격팔자 - 토리의 찻집',
        description: 'MBTI와 팔자유형을 결합한 새로운 성격 분석',
        type: 'website',
        locale: 'ko_KR',
        siteName: '성격팔자',
        images: ['/assets/images/logo.png'],
      },
    };
  }

  const { type: typeCode, alias, description, image: imageUrl } = shareData;

  return {
    title: `나는 ${alias}! - 성격팔자`,
    description: `내 팔자 유형: ${typeCode}. ${description}`,
    openGraph: {
      title: `나는 ${alias}! - 성격팔자`,
      description: `내 팔자 유형: ${typeCode}. ${description}`,
      type: 'website',
      locale: 'ko_KR',
      siteName: '성격팔자',
      images: imageUrl ? [{
        url: imageUrl,
        width: 800,
        height: 600,
        alt: `${alias} 팔자유형 이미지`
      }] : ['/assets/images/logo.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `나는 ${alias}! - 성격팔자`,
      description: `내 팔자 유형: ${typeCode}. ${description}`,
      images: imageUrl ? [imageUrl] : ['/assets/images/logo.png'],
    },
  };
}

export default function SharePage({ params }) {
  const { id } = params;

  const shareData = getShareData(id);

  // 데이터가 없으면 분석 페이지로 리다이렉트
  if (!shareData) {
    redirect('/analyze');
  }

  const { type, alias, description, image } = shareData;

  return (
    <div className="share-page">
      <div className="container">
        <div className="share-result-card">
          <div className="card result-card">
            {image && (
              <img
                className="main-result-image"
                src={image}
                alt="팔자유형 이미지"
              />
            )}
            <p className="result-type-code">{type}</p>
            <h2 className="card-title">{alias}</h2>
            <p>{description}</p>

            <div className="share-actions">
              <p>나도 내 팔자 유형이 궁금하다면?</p>
              <a href="/analyze" className="cta-button">
                내 팔자 분석하러 가기
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}