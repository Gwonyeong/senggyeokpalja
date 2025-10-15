import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { DEFAULT_TRANSACTION_OPTIONS } from "@/lib/db-config";

export async function DELETE() {
  try {
    // Supabase 클라이언트 생성 및 인증 확인
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 사용자 프로필 및 관련 데이터를 트랜잭션으로 안전하게 삭제
    const deletionResult = await prisma.$transaction(async (tx) => {
      // 1. 사용자 존재 확인
      const existingProfile = await tx.profile.findUnique({
        where: { id: user.id },
        include: {
          analysisResults: true,
          consultationResults: true,
          synergyAnalysis: true,
          savedResults: true,
        },
      });

      if (!existingProfile) {
        throw new Error("사용자 프로필을 찾을 수 없습니다.");
      }

      // 2. 관련 데이터 수 확인 (로깅용)
      const dataCount = {
        analysisResults: existingProfile.analysisResults.length,
        consultationResults: existingProfile.consultationResults.length,
        synergyAnalysis: existingProfile.synergyAnalysis.length,
        savedResults: existingProfile.savedResults.length,
      };

      // 3. 명시적으로 관련 데이터 삭제 (cascade 설정 확인용)
      await tx.savedResults.deleteMany({
        where: { userId: user.id },
      });

      await tx.synergyAnalysis.deleteMany({
        where: {
          OR: [{ userId: user.id }, { targetUserId: user.id }],
        },
      });

      await tx.consultationResult.deleteMany({
        where: { userId: user.id },
      });

      await tx.analysisResult.deleteMany({
        where: { userId: user.id },
      });

      // 4. 마지막으로 프로필 삭제
      await tx.profile.delete({
        where: { id: user.id },
      });

      return {
        deletedProfile: existingProfile,
        dataCount: dataCount,
        deletedAt: new Date(),
      };
    }, DEFAULT_TRANSACTION_OPTIONS);

    return NextResponse.json({
      success: true,
      message: "Profile deleted successfully",
      deletedData: deletionResult.dataCount,
    });
  } catch (error) {
    console.error("Error deleting account:", error);

    // 에러 유형에 따른 구체적인 메시지 제공
    let errorMessage = "계정 삭제 중 오류가 발생했습니다.";
    let statusCode = 500;

    if (error.message?.includes("사용자 프로필을 찾을 수 없습니다")) {
      errorMessage = "삭제할 사용자 프로필을 찾을 수 없습니다.";
      statusCode = 404;
    } else if (error.code === "P2025") {
      errorMessage = "이미 삭제된 계정이거나 존재하지 않습니다.";
      statusCode = 404;
    } else if (error.code === "P2003") {
      errorMessage =
        "관련 데이터가 있어 삭제할 수 없습니다. 관리자에게 문의하세요.";
      statusCode = 409;
    } else if (error.message?.includes("timeout")) {
      errorMessage = "삭제 처리 시간이 초과되었습니다. 다시 시도해주세요.";
      statusCode = 408;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: statusCode }
    );
  }
}
