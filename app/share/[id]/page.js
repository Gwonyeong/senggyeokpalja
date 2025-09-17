import { notFound, redirect } from 'next/navigation';

// 메타데이터를 동적으로 생성
export async function generateMetadata({ params, searchParams }) {
  const { id } = params;
  const { type: typeCode, alias, description, image: imageUrl } = searchParams;

  if (!typeCode || !alias) {
    return {
      title: '성격팔자 - 토리의 찻집',
      description: 'MBTI와 팔자유형을 결합한 새로운 성격 분석',
    };
  }

  return {
    title: `나는 ${alias}! - 성격팔자`,
    description: `내 팔자 유형: ${typeCode}. ${description || '나만의 특별한 팔자 유형을 확인해보세요!'}`,
    openGraph: {
      title: `나는 ${alias}! - 성격팔자`,
      description: `내 팔자 유형: ${typeCode}. ${description || '나만의 특별한 팔자 유형을 확인해보세요!'}`,
      type: 'website',
      locale: 'ko_KR',
      siteName: '성격팔자',
      images: imageUrl ? [{ url: imageUrl, width: 800, height: 600 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `나는 ${alias}! - 성격팔자`,
      description: `내 팔자 유형: ${typeCode}. ${description || '나만의 특별한 팔자 유형을 확인해보세요!'}`,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default function SharePage({ params, searchParams }) {
  const { id } = params;
  const { type, alias, description, image } = searchParams;

  // 파라미터가 없으면 메인 페이지로 리다이렉트
  if (!type || !alias) {
    redirect('/analyze');
  }

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