import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const {
      orderId,
      paymentKey,
      amount,
      customerName,
      customerEmail,
      productName,
      userId,
      consultationId
    } = await request.json();

    // 기존 결제 정보 확인
    const existingPayment = await prisma.paymentResult.findUnique({
      where: { paymentKey }
    });

    let paymentResult;

    if (existingPayment) {
      // 기존 결제가 있다면 업데이트
      paymentResult = await prisma.paymentResult.update({
        where: { paymentKey },
        data: {
          orderId,
          amount,
          status: 'PENDING',
          customerName,
          customerEmail,
          productName,
          userId,
          requestedAt: new Date(),
          metadata: consultationId ? { consultationId } : null,
        },
      });
    } else {
      // 새 결제 정보 생성
      paymentResult = await prisma.paymentResult.create({
        data: {
          paymentKey,
          orderId,
          amount,
          currency: 'KRW',
          status: 'PENDING',
          customerName,
          customerEmail,
          productName,
          userId,
          requestedAt: new Date(),
          metadata: consultationId ? { consultationId } : null,
        },
      });
    }

    return Response.json({
      success: true,
      paymentId: paymentResult.id
    });
  } catch (error) {
    console.error('결제 정보 저장 실패:', error);
    return Response.json(
      { error: '결제 정보 저장에 실패했습니다.' },
      { status: 500 }
    );
  }
}