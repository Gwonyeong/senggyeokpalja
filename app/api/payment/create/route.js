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

    // 결제 정보를 미리 저장 (PENDING 상태)
    const paymentResult = await prisma.paymentResult.create({
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