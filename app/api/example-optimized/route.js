// HOC를 사용한 예시 API
import { NextResponse } from "next/server";
import { withOptimizedAuth } from "@/lib/optimized-auth";
import { prisma } from "@/lib/prisma";

// 원래 핸들러 함수 (인증 로직 없이 비즈니스 로직만)
async function handleGet(request, context, authResult) {
  const { user, profile } = authResult;

  // 비즈니스 로직만 집중
  const data = await prisma.someTable.findMany({
    where: { userId: user.id }
  });

  return NextResponse.json({
    success: true,
    data: data,
    user: user.email
  });
}

async function handlePost(request, context, authResult) {
  const { user } = authResult;
  const body = await request.json();

  // 비즈니스 로직
  const result = await prisma.someTable.create({
    data: {
      userId: user.id,
      ...body
    }
  });

  return NextResponse.json({
    success: true,
    result: result
  });
}

// HOC로 래핑하여 자동 인증 처리
export const GET = withOptimizedAuth(handleGet, {
  requireAuth: true,
  includeProfile: true,
  skipCache: false
});

export const POST = withOptimizedAuth(handlePost, {
  requireAuth: true,
  requireAdmin: false,
  skipCache: false
});