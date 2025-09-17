// 공유 데이터를 저장하는 간단한 인메모리 저장소
// 실제 운영환경에서는 데이터베이스나 Redis를 사용해야 합니다.

const shareDataStore = new Map();

// 팔자 유형별 고정 데이터 (데이터베이스와 일치하도록)
const paljaTypeData = {
  WSIJ: { alias: "달빛예술가", description: "창의적이고 감성적인 예술가 타입", imageUrl: "/images/WSIJ.png" },
  WSIY: { alias: "자유로운영혼", description: "자유롭고 독창적인 영혼", imageUrl: "/images/WSIY.png" },
  WSHJ: { alias: "열정리더", description: "카리스마 넘치는 리더", imageUrl: "/images/WSHJ.png" },
  WSHY: { alias: "모험가", description: "새로운 도전을 즐기는 모험가", imageUrl: "/images/WSHY.png" },
  WGIJ: { alias: "철학자", description: "깊이 있게 사고하는 철학자", imageUrl: "/images/WGIJ.png" },
  WGIY: { alias: "혁신가", description: "세상을 바꾸는 혁신가", imageUrl: "/images/WGIY.png" },
  WGHJ: { alias: "멘토", description: "지혜로운 조언자이자 멘토", imageUrl: "/images/WGHJ.png" },
  WGHY: { alias: "비전리더", description: "미래를 그리는 비전리더", imageUrl: "/images/WGHY.png" },
  NSIJ: { alias: "완벽주의자", description: "세심하고 완벽을 추구하는 타입", imageUrl: "/images/NSIJ.png" },
  NSIY: { alias: "탐험가", description: "호기심 많은 탐험가", imageUrl: "/images/NSIY.png" },
  NSHJ: { alias: "조화로운리더", description: "사람들과 조화를 이루는 리더", imageUrl: "/images/NSHJ.png" },
  NSHY: { alias: "자유혼", description: "자유로운 영혼의 소유자", imageUrl: "/images/NSHY.png" },
  NGIJ: { alias: "현자", description: "지혜로운 현자", imageUrl: "/images/NGIJ.png" },
  NGIY: { alias: "개척자", description: "새로운 길을 개척하는 타입", imageUrl: "/images/NGIY.png" },
  NGHJ: { alias: "수호자", description: "사람들을 보호하는 수호자", imageUrl: "/images/NGHJ.png" },
  NGHY: { alias: "꿈꾸는자", description: "꿈을 현실로 만드는 타입", imageUrl: "/images/NGHY.png" }
};

export function createShareData(personalityType) {
  const typeData = paljaTypeData[personalityType];
  if (!typeData) {
    throw new Error(`Unknown personality type: ${personalityType}`);
  }

  // 간단한 해시 생성 (타임스탬프 + 랜덤)
  const shareId = Math.random().toString(36).substring(2, 15);

  const shareData = {
    type: personalityType,
    alias: typeData.alias,
    description: typeData.description,
    image: typeData.imageUrl,
    createdAt: Date.now()
  };

  shareDataStore.set(shareId, shareData);

  // 30분 후 자동 삭제
  setTimeout(() => {
    shareDataStore.delete(shareId);
  }, 30 * 60 * 1000);

  return shareId;
}

export function getShareData(shareId) {
  return shareDataStore.get(shareId) || null;
}

// 서버 시작 시 주기적으로 오래된 데이터 정리
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [id, data] of shareDataStore.entries()) {
      if (now - data.createdAt > 30 * 60 * 1000) { // 30분 후 삭제
        shareDataStore.delete(id);
      }
    }
  }, 10 * 60 * 1000); // 10분마다 정리
}