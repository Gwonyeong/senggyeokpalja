import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lunYear = searchParams.get("lunYear");
    const lunMonth = searchParams.get("lunMonth");
    const lunDay = searchParams.get("lunDay");
    const lunIl = searchParams.get("lunIl") || "0"; // 윤달 구분 (0: 평달, 1: 윤달)

    if (!lunYear || !lunMonth || !lunDay) {
      return NextResponse.json(
        {
          error: "필수 파라미터가 누락되었습니다. (lunYear, lunMonth, lunDay)",
        },
        { status: 400 }
      );
    }

    // 공공데이터포털 API 키
    const serviceKey = process.env.PUBLIC_DATA_API_KEY;

    if (!serviceKey) {
      return NextResponse.json(
        { error: "API 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // 한국천문연구원 음력→양력 변환 API
    const apiUrl = `http://apis.data.go.kr/B090041/openapi/service/LrsrCldInfoService/getSolCalInfo?lunYear=${lunYear}&lunMonth=${lunMonth.padStart(
      2,
      "0"
    )}&lunDay=${lunDay.padStart(
      2,
      "0"
    )}&lunIl=${lunIl}&ServiceKey=${serviceKey}&_type=json`;

    const response = await fetch(apiUrl);

    const data = await response.json();

    if (data.response.header.resultCode !== "00") {
      return NextResponse.json(
        { error: data.response.header.resultMsg },
        { status: 400 }
      );
    }

    const body = data.response.body;
    if (!body || !body.items || !body.items.item) {
      return NextResponse.json(
        { error: "유효하지 않은 날짜입니다." },
        { status: 400 }
      );
    }

    const item = body.items.item;

    return NextResponse.json({
      success: true,
      solarYear: item.solYear,
      solarMonth: item.solMonth,
      solarDay: item.solDay,
      originalLunar: {
        year: lunYear,
        month: lunMonth,
        day: lunDay,
        isLeap: lunIl === "1",
      },
    });
  } catch (error) {
    console.error("Calendar conversion error:", error);
    return NextResponse.json(
      {
        error: "날짜 변환 중 서버에서 오류가 발생했습니다.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
