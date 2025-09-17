import { NextResponse } from 'next/server';
import { createShareData } from '../../../lib/share-data';

export async function POST(request) {
  try {
    const { type } = await request.json();

    if (!type) {
      return NextResponse.json(
        { error: '팔자 유형이 필요합니다.' },
        { status: 400 }
      );
    }

    const shareId = createShareData(type);

    return NextResponse.json({ shareId });
  } catch (error) {
    console.error('공유 데이터 생성 오류:', error);
    return NextResponse.json(
      { error: '공유 데이터 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}