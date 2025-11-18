// ======================================================================
// 사주팔자 관련 유틸리티 함수들
// ======================================================================

// 24절기 데이터 (원본에서 이식)
const SOLAR_TERMS_DATA = { 1940:{"입춘":194002051301,"경칩":194003060721,"청명":194004051019,"입하":194005060931,"망종":194006061439,"소서":194007072005,"입추":194008080512,"백로":194009080709,"한로":194010082301,"입동":194011080209,"대설":194012072003,"소한":194101060644},1950:{"입춘":195002042210,"경칩":195003061633,"청명":195004051930,"입하":195005061845,"망종":195006062356,"소서":195007080131,"입추":195008081048,"백로":195009081249,"한로":195010090443,"입동":195011080756,"대설":195012080546,"소한":195101061226},1960:{"입춘":196002050921,"경칩":196003060341,"청명":196004050635,"입하":196005060548,"망종":196006061102,"소서":196007071629,"입추":196008072141,"백로":196009080000,"한로":196010081549,"입동":196011071858,"대설":196012071746,"소한":196101060022},1970:{"입춘":197002041444,"경칩":197003060901,"청명":197004051201,"입하":197005061122,"망종":197006061634,"소서":197007072154,"입추":197008080315,"백로":197009080545,"한로":197010082138,"입동":197011080049,"대설":197012072338,"소한":197101060614},1980:{"입춘":198002050010,"경칩":198003051821,"청명":198004042123,"입하":198005051644,"망종":198006052159,"소서":198007070321,"입추":198008070851,"백로":198009071113,"한로":198010080303,"입동":198011070621,"대설":198012070513,"소한":198101051154},1990:{"입춘":199002040519,"경칩":199003052328,"청명":199004050317,"입하":199005052209,"망종":199006060329,"소서":199007070851,"입추":199008071428,"백로":199009071658,"한로":199010080845,"입동":199011071207,"대설":199012071058,"소한":199101051744},2000:{"입춘":200002041421,"경칩":200003050833,"청명":200004041136,"입하":200005050949,"망종":200006051401,"소서":200007070020,"입추":200008070550,"백로":200009070817,"한로":200010080030,"입동":200011070351,"대설":200012062243,"소한":200101050531},2010:{"입춘":201002040748,"경칩":201003060147,"청명":201004050530,"입하":201005052310,"망종":201006060829,"소서":201007071243,"입추":201008071749,"백로":201009071945,"한로":201010081230,"입동":201011072043,"대설":201012071839,"소한":201101060027},2020:{"입춘":202002041803,"경칩":202003051257,"청명":202004041638,"입하":202005050951,"망종":202006051958,"소서":202007070014,"입추":202008070432,"백로":202009070708,"한로":202010080056,"입동":202011070814,"대설":202012070609,"소한":202101051223},2030:{"입춘":203002032341,"경칩":203003051731,"청명":203004042120,"입하":203005051431,"망종":203006051900,"소서":203007062335,"입추":203008070340,"백로":203009070624,"한로":203010072359,"입동":203011070719,"대설":203012070509,"소한":203101051111},2040:{"입춘":204002041113,"경칩":204003050511,"청명":204004040854,"입하":204005050215,"망종":204006050637,"소서":204007061708,"입추":204008062121,"백로":204009070007,"한로":204010071746,"입동":204011070104,"대설":204012061853,"소한":204101050502}};

// 기본 데이터
const cheonGan = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const jiJi = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const jiJiMonth = {"寅":1, "卯":2, "辰":3, "巳":4, "午":5, "未":6, "申":7, "酉":8, "戌":9, "亥":10, "子":11, "丑":12};

const ganInfo = {
    "甲":{han:"甲",ohaeng:"木",eumYang:"陽"},
    "乙":{han:"乙",ohaeng:"木",eumYang:"陰"},
    "丙":{han:"丙",ohaeng:"火",eumYang:"陽"},
    "丁":{han:"丁",ohaeng:"火",eumYang:"陰"},
    "戊":{han:"戊",ohaeng:"土",eumYang:"陽"},
    "己":{han:"己",ohaeng:"土",eumYang:"陰"},
    "庚":{han:"庚",ohaeng:"金",eumYang:"陽"},
    "辛":{han:"辛",ohaeng:"金",eumYang:"陰"},
    "壬":{han:"壬",ohaeng:"水",eumYang:"陽"},
    "癸":{han:"癸",ohaeng:"水",eumYang:"陰"}
};

const jiInfo = {
    "子":{han:"子",ohaeng:"수",eumYang:"陽"},
    "丑":{han:"丑",ohaeng:"토",eumYang:"陰"},
    "寅":{han:"寅",ohaeng:"木",eumYang:"陽"},
    "卯":{han:"卯",ohaeng:"木",eumYang:"陰"},
    "辰":{han:"辰",ohaeng:"토",eumYang:"陽"},
    "巳":{han:"巳",ohaeng:"火",eumYang:"陽"},
    "午":{han:"午",ohaeng:"火",eumYang:"陰"},
    "未":{han:"未",ohaeng:"토",eumYang:"陰"},
    "申":{han:"申",ohaeng:"金",eumYang:"陽"},
    "酉":{han:"酉",ohaeng:"金",eumYang:"陰"},
    "戌":{han:"戌",ohaeng:"토",eumYang:"陽"},
    "亥":{han:"亥",ohaeng:"수",eumYang:"陰"}
};

const ohaengSaeng = { '水': '木', '木': '火', '火': '土', '土': '金', '金': '水' };
const ohaengGeuk = { '水': '火', '火': '金', '金': '木', '木': '土', '土': '水' };

// 사주 월 정보 찾기
function findSajuMonthInfo(date) {
    const year = date.getFullYear();
    const dateInt = parseInt(('' + year) + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + date.getDate()).slice(-2));
    const terms = SOLAR_TERMS_DATA[Math.floor(year / 10) * 10];

    if (!terms || !terms["입춘"]) {
        return { sajuYear: year, sajuMonth: (date.getMonth() + 3) % 12, termsAvailable: false };
    }

    let sajuYear = year;
    const ipchunInt = parseInt(String(terms["입춘"]).substring(0, 8));

    if (dateInt < ipchunInt) {
        sajuYear = year - 1;
        const prevTerms = SOLAR_TERMS_DATA[Math.floor(sajuYear / 10) * 10];
        if (!prevTerms) return { sajuYear: sajuYear, sajuMonth: 12, termsAvailable: false };
    }

    const TERM_ORDER = ["입춘", "경칩", "청명", "입하", "망종", "소서", "입추", "백로", "한로", "입동", "대설", "소한"];
    let sajuMonth = 0;

    for (let i = 0; i < TERM_ORDER.length; i++) {
        const termName = TERM_ORDER[i];
        const nextTermName = (i + 1 < TERM_ORDER.length) ? TERM_ORDER[i + 1] : "입춘";
        let termDateInt = parseInt(String(terms[termName]).substring(0, 8));
        let nextTermDateInt;

        if (nextTermName === "입춘") {
            const nextYearTerms = SOLAR_TERMS_DATA[Math.floor((sajuYear + 1) / 10) * 10];
            if (!nextYearTerms || !nextYearTerms[nextTermName]) return { sajuYear: sajuYear, sajuMonth: 12, termsAvailable: true };
            nextTermDateInt = parseInt(String(nextYearTerms[nextTermName]).substring(0, 8));
        } else {
            nextTermDateInt = parseInt(String(terms[nextTermName]).substring(0, 8));
        }

        if (dateInt >= termDateInt && dateInt < nextTermDateInt) {
            sajuMonth = jiJiMonth[jiJi[i + 2]];
            break;
        }
    }

    if (sajuMonth === 0) sajuMonth = 12;
    return { sajuYear: sajuYear, sajuMonth: sajuMonth, termsAvailable: true };
}

// 팔자 계산
export function calculateSaju(birth, time) {
    if (isNaN(birth.getTime())) {
        throw new Error("유효하지 않은 날짜 객체가 전달되었습니다.");
    }

    const timeMap = [23, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21];
    const hour = timeMap[time];
    const paljaDate = new Date(birth.getTime());

    if (hour >= 23) {
        paljaDate.setDate(paljaDate.getDate() + 1);
    }

    const monthInfo = findSajuMonthInfo(paljaDate);
    const sajuYear = monthInfo.sajuYear;
    const sajuMonth = monthInfo.sajuMonth;

    // 년주 계산
    const yeonGanIndex = (sajuYear - 4 + 60) % 10;
    const yeonJiIndex = (sajuYear - 4 + 60) % 12;

    // 월주 계산
    const wolGanMap = [2, 4, 6, 8, 0];
    const startWolGanIndex = wolGanMap[yeonGanIndex % 5];
    const wolGanIndex = (startWolGanIndex + sajuMonth - 1) % 10;
    const wolJiIndex = (sajuMonth + 1) % 12;

    // 일주 계산
    const dayEpoch = Math.floor(paljaDate.getTime() / 86400000);
    const dayOffset = Math.floor(new Date('1900/01/01 00:00:00 UTC').getTime() / 86400000);
    const dayIndex = (dayEpoch - dayOffset) % 60;
    const ilGanIndex = dayIndex % 10;
    const ilJiIndex = dayIndex % 12;

    // 시주 계산
    let hourIndex = Math.floor((hour + 1) / 2) % 12;
    if (hour >= 23) hourIndex = 0;
    const siGanIndex = (ilGanIndex * 2 + hourIndex) % 10;

    const palja = {
        yeonju: { gan: ganInfo[cheonGan[yeonGanIndex]], ji: jiInfo[jiJi[yeonJiIndex]] },
        wolju: { gan: ganInfo[cheonGan[wolGanIndex]], ji: jiInfo[jiJi[wolJiIndex]] },
        ilju: { gan: ganInfo[cheonGan[ilGanIndex]], ji: jiInfo[jiJi[ilJiIndex]] },
        siju: { gan: ganInfo[cheonGan[siGanIndex]], ji: jiInfo[jiJi[hourIndex]] }
    };

    // 오행 개수 계산
    const ohaengCount = {};
    for (const ju in palja) {
        if(palja[ju].gan) {
            ohaengCount[palja[ju].gan.ohaeng] = (ohaengCount[palja[ju].gan.ohaeng] || 0) + 1;
        }
        if(palja[ju].ji) {
            ohaengCount[palja[ju].ji.ohaeng] = (ohaengCount[palja[ju].ji.ohaeng] || 0) + 1;
        }
    }

    // 십신 계산
    const ilgan = palja.ilju.gan;
    const sibsinCount = {};
    const sibsinTable = {
        "비견": function(target){ return target.ohaeng === ilgan.ohaeng && target.eumYang === ilgan.eumYang;},
        "겁재": function(target){ return target.ohaeng === ilgan.ohaeng && target.eumYang !== ilgan.eumYang;},
        "식신": function(target){ return ohaengSaeng[ilgan.ohaeng] === target.ohaeng && target.eumYang === ilgan.eumYang;},
        "상관": function(target){ return ohaengSaeng[ilgan.ohaeng] === target.ohaeng && target.eumYang !== ilgan.eumYang;},
        "편재": function(target){ return ohaengGeuk[ilgan.ohaeng] === target.ohaeng && target.eumYang === ilgan.eumYang;},
        "정재": function(target){ return ohaengGeuk[ilgan.ohaeng] === target.ohaeng && target.eumYang !== ilgan.eumYang;},
        "편관": function(target){ return ohaengGeuk[target.ohaeng] === ilgan.ohaeng && target.eumYang === ilgan.eumYang;},
        "정관": function(target){ return ohaengGeuk[target.ohaeng] === ilgan.ohaeng && target.eumYang !== ilgan.eumYang;},
        "편인": function(target){ return ohaengSaeng[target.ohaeng] === ilgan.ohaeng && target.eumYang === ilgan.eumYang;},
        "정인": function(target){ return ohaengSaeng[target.ohaeng] === ilgan.ohaeng && target.eumYang !== ilgan.eumYang;}
    };

    for (const ju in palja) {
        for (const sin in sibsinTable) {
            if (palja[ju].gan && palja[ju].gan.han !== ilgan.han) {
                if (sibsinTable[sin](palja[ju].gan)) {
                    sibsinCount[sin] = (sibsinCount[sin] || 0) + 1;
                }
            } else if (palja[ju].gan && ju !== 'ilju') {
                if (sibsinTable["비견"](palja[ju].gan)) {
                    sibsinCount["비견"] = (sibsinCount["비견"] || 0) + 1;
                }
            }
            if (palja[ju].ji && sibsinTable[sin](palja[ju].ji)) {
                sibsinCount[sin] = (sibsinCount[sin] || 0) + 1;
            }
        }
    }

    return {
        palja,
        ilgan,
        wolji: palja.wolju.ji,
        ohaeng: ohaengCount,
        sibsin: sibsinCount
    };
}

// 성격 유형 결정 (개선된 알고리즘 적용)
export function determinePaljaType(sajuData) {
    const ilganOhaengTable = { '甲':'木', '乙':'木', '丙':'火', '丁':'火', '戊':'土', '己':'土', '庚':'金', '辛':'金', '壬':'수', '癸':'수' };
    const ohaengSaengTable = { '水':'木', '木':'火', '火':'土', '土':'金', '金':'水' };

    const axis1 = determineEnergy(sajuData, ilganOhaengTable, ohaengSaengTable);
    const axis2 = determinePerception(sajuData.sibsin);
    const axis3 = determineJudgement(sajuData.sibsin);
    const axis4 = determineLifestyle(sajuData.ohaeng, sajuData.sibsin);

    return axis1 + axis2 + axis3 + axis4;
}

function determineEnergy(sajuData, ilganOhaengTable, ohaengSaengTable) {
    let energyScore = 0;
    const sibsin = sajuData.sibsin;

    if (!sajuData.wolji) return 'N';

    const woljiOhaeng = sajuData.wolji.ohaeng;
    const ilganOhaeng = ilganOhaengTable[sajuData.ilgan.han];
    const supportingOhaengKey = Object.keys(ohaengSaengTable).find(key => ohaengSaengTable[key] === ilganOhaeng);

    // 1. 월지 지원 점수 (세분화)
    if (woljiOhaeng === ilganOhaeng) {
        energyScore += 2.5;  // 같은 오행이면 강한 지원
    } else if (woljiOhaeng === supportingOhaengKey) {
        energyScore += 2.0;  // 인성으로 지원
    }

    // 2. 비겁 점수 (자기 강화)
    const bigeopCount = (sibsin['비견'] || 0) + (sibsin['겁재'] || 0);
    energyScore += bigeopCount * 1.2;

    // 3. 인성 점수 (에너지 공급)
    const inseongCount = (sibsin['정인'] || 0) + (sibsin['편인'] || 0);
    energyScore += inseongCount * 1.0;

    // 4. 관성 견제 효과 (에너지 약화)
    const gwanseongCount = (sibsin['정관'] || 0) + (sibsin['편관'] || 0);
    energyScore -= gwanseongCount * 0.5;

    // 5. 식상 소모 효과 (에너지 소모)
    const siksangCount = (sibsin['식신'] || 0) + (sibsin['상관'] || 0);
    energyScore -= siksangCount * 0.3;

    // 임계값을 3.0으로 조정하여 40-60% 분포 목표
    return energyScore >= 3.0 ? 'W' : 'N';
}

function determinePerception(sibsin) {
    // 실용적 십신 (재물, 식상) - 현실감각
    const practicalScore =
        ((sibsin['식신']||0) * 1.0) +     // 재능 활용
        ((sibsin['상관']||0) * 1.1) +     // 표현력
        ((sibsin['정재']||0) * 1.2) +     // 안정적 재물
        ((sibsin['편재']||0) * 1.0);      // 투자/사업

    // 이상적 십신 (인성, 관성 일부) - 정신세계
    const idealScore =
        ((sibsin['정인']||0) * 1.5) +     // 학문, 지혜
        ((sibsin['편인']||0) * 1.3) +     // 예술, 종교
        ((sibsin['정관']||0) * 0.3);      // 명예, 이상

    // 임계값을 조정하여 45-55% 분포 목표
    return idealScore >= practicalScore * 0.8 ? 'G' : 'S';
}

function determineJudgement(sibsin) {
    // 논리/규칙 기반 십신
    const logicScore =
        ((sibsin['정관']||0) * 1.3) +     // 체계, 질서
        ((sibsin['편관']||0) * 1.1) +     // 추진력, 결단
        ((sibsin['정재']||0) * 0.4);      // 계획성

    // 조화/감정 기반 십신
    const harmonyScore =
        ((sibsin['식신']||0) * 1.1) +     // 자연스러운 표현
        ((sibsin['상관']||0) * 1.0) +     // 감정 표현
        ((sibsin['비견']||0) * 0.8) +     // 동료애
        ((sibsin['겁재']||0) * 0.6) +     // 경쟁 의식
        ((sibsin['편재']||0) * 0.3);      // 융통성

    // 임계값 조정으로 40-60% 분포 목표
    return logicScore >= harmonyScore * 0.9 ? 'I' : 'H';
}

function determineLifestyle(ohaeng, sibsin = {}) {
    if (!ohaeng || Object.keys(ohaeng).length === 0) return 'Y';

    let structureScore = 0;

    // 1. 오행 다양성 점수 (점진적 점수 시스템)
    const ohaengTypes = Object.keys(ohaeng).length;
    if (ohaengTypes >= 5) {  // 5가지면 완벽 점수
        structureScore += 2;
    } else if (ohaengTypes >= 4) {  // 4가지면 중간 점수
        structureScore += 1.5;
    } else if (ohaengTypes >= 3) {  // 3가지면 약간 점수
        structureScore += 0.8;
    }

    // 2. 오행 균형도 점수 (균형도를 더 정교하게 측정)
    const maxCount = Math.max(...Object.values(ohaeng));
    const totalCount = Object.values(ohaeng).reduce((sum, count) => sum + count, 0);
    const concentration = maxCount / totalCount;

    if (concentration <= 0.35) {  // 매우 균형 잡힌 경우
        structureScore += 1.5;
    } else if (concentration <= 0.5) {  // 적당히 균형 잡힌 경우
        structureScore += 1.0;
    } else if (concentration <= 0.6) {  // 약간 집중된 경우
        structureScore += 0.5;
    }

    // 3. 십신 안정성 점수 (가중치 적용)
    const stabilityGods = (sibsin['정관'] || 0) * 1.2 + (sibsin['정재'] || 0) * 1.0 + (sibsin['정인'] || 0) * 1.1;
    const changeGods = (sibsin['편관'] || 0) * 1.0 + (sibsin['편재'] || 0) * 0.8 + (sibsin['상관'] || 0) * 1.0;

    const stabilityRatio = totalCount > 0 ? stabilityGods / (stabilityGods + changeGods) : 0;
    if (stabilityRatio >= 0.6) {  // 안정성이 높으면
        structureScore += 1.2;
    } else if (stabilityRatio >= 0.4) {  // 보통이면
        structureScore += 0.6;
    }

    // 4. 오행 상생 체인 점수 (새로 추가 - 오행이 서로 생성하는 관계인지 확인)
    const ohaengSaeng = { '水':'木', '木':'火', '火':'土', '土':'金', '金':'水' };
    let chainScore = 0;
    const presentOhaeng = Object.keys(ohaeng).filter(oh => ohaeng[oh] > 0);

    presentOhaeng.forEach(oh1 => {
        if (presentOhaeng.includes(ohaengSaeng[oh1])) {
            chainScore += 0.3;
        }
    });
    structureScore += chainScore;

    // 임계값을 4.2로 설정하여 30-35% 정도의 J형 분포 목표
    return structureScore >= 4.2 ? 'J' : 'Y';
}

// ======================================================================
// 신살(神殺) 계산 함수들
// ======================================================================

// 일간별 신살 대응표
const SINSAL_MAP = {
  // 도화살 (매력과 인기) - 가장 유명한 신살
  도화: {
    "甲": ["卯"], "乙": ["卯"], // 인묘진 → 도화는 卯
    "丙": ["午"], "丁": ["午"], // 사오미 → 도화는 午
    "戊": ["午"], "己": ["午"], // 사오미 → 도화는 午
    "庚": ["酉"], "辛": ["酉"], // 신유술 → 도화는 酉
    "壬": ["子"], "癸": ["子"]  // 해자축 → 도화는 子
  },

  // 천을귀인 (귀인의 도움) - 가장 중요한 길신
  천을귀인: {
    "甲": ["丑", "未"], "乙": ["子", "申"],
    "丙": ["酉", "亥"], "丁": ["酉", "亥"],
    "戊": ["丑", "未"], "己": ["子", "申"],
    "庚": ["丑", "寅"], "辛": ["午", "寅"],
    "壬": ["卯", "巳"], "癸": ["卯", "巳"]
  },

  // 역마살 (이동과 변화) - 현대적으로 매우 중요
  역마: {
    "甲": ["申", "寅"], "乙": ["申", "寅"],
    "丙": ["亥", "巳"], "丁": ["亥", "巳"],
    "戊": ["申", "寅"], "己": ["申", "寅"],
    "庚": ["亥", "巳"], "辛": ["亥", "巳"],
    "壬": ["申", "寅"], "癸": ["申", "寅"]
  },

  // 장성살 (권위와 리더십) - 리더십 관련 중요 신살
  장성: {
    "甲": ["戌"], "乙": ["酉"],
    "丙": ["未"], "丁": ["申"],
    "戊": ["未"], "己": ["申"],
    "庚": ["辰"], "辛": ["卯"],
    "壬": ["丑"], "癸": ["寅"]
  },

  // 홍염살 (강렬한 사랑) - 연애 관련 중요 신살
  홍염: {
    "甲": ["午"], "乙": ["申"],
    "丙": ["寅"], "丁": ["酉"],
    "戊": ["午"], "己": ["申"],
    "庚": ["寅"], "辛": ["卯"],
    "壬": ["子"], "癸": ["酉"]
  },

  // 백호살 (사고와 위험) - 주의해야 할 중요 흉신
  백호: {
    "甲": ["申"], "乙": ["酉"],
    "丙": ["戌"], "丁": ["亥"],
    "戊": ["戌"], "己": ["亥"],
    "庚": ["子"], "辛": ["丑"],
    "壬": ["寅"], "癸": ["卯"]
  },

  // 문창살 (학문과 지혜) - 학업/지적 성취
  문창: {
    "甲": ["巳"], "乙": ["午"],
    "丙": ["申"], "丁": ["酉"],
    "戊": ["申"], "己": ["酉"],
    "庚": ["亥"], "辛": ["子"],
    "壬": ["寅"], "癸": ["卯"]
  },

  // 복성살 (행운과 보호) - 중요한 길신
  복성: {
    "甲": ["寅"], "乙": ["卯"],
    "丙": ["巳"], "丁": ["午"],
    "戊": ["巳"], "己": ["午"],
    "庚": ["申"], "辛": ["酉"],
    "壬": ["亥"], "癸": ["子"]
  },

  // 화개살 (철학과 예술) - 정신세계 관련
  화개: {
    "甲": ["戌"], "乙": ["未"],
    "丙": ["丑"], "丁": ["戌"],
    "戊": ["丑"], "己": ["戌"],
    "庚": ["辰"], "辛": ["丑"],
    "壬": ["未"], "癸": ["辰"]
  },

  // 천희살 (경사와 결혼) - 길사 관련
  천희: {
    "甲": ["酉"], "乙": ["申"],
    "丙": ["亥"], "丁": ["戌"],
    "戊": ["亥"], "己": ["戌"],
    "庚": ["丑"], "辛": ["子"],
    "壬": ["卯"], "癸": ["寅"]
  }
};

/**
 * 일간을 기준으로 신살을 계산하는 함수
 * @param {string} ilgan - 일간 (천간)
 * @param {Array} jijis - 사주의 모든 지지 [년지, 월지, 일지, 시지]
 * @returns {Object} 계산된 신살 정보
 */
export function calculateSinsal(ilgan, jijis) {
  if (!ilgan || !jijis || jijis.length !== 4) {
    return {};
  }

  const result = {};

  // 각 신살에 대해 계산
  Object.keys(SINSAL_MAP).forEach(sinsalName => {
    const sinsalJijis = SINSAL_MAP[sinsalName][ilgan];
    if (sinsalJijis) {
      const foundJijis = [];

      // 사주의 각 지지를 확인
      jijis.forEach((jiji, index) => {
        if (sinsalJijis.includes(jiji)) {
          foundJijis.push({
            jiji: jiji,
            position: ['년지', '월지', '일지', '시지'][index]
          });
        }
      });

      if (foundJijis.length > 0) {
        result[sinsalName] = foundJijis;
      }
    }
  });

  return result;
}

/**
 * 신살 정보에 상세 설명을 추가하는 함수 (JSON에 있는 신살만 반환)
 * @param {Object} sinsalData - calculateSinsal의 결과
 * @param {Array} sinsalJsonData - 신살_풀패키지.json 데이터
 * @returns {Object} 상세 설명이 추가된 신살 정보 (JSON에 있는 것만)
 */
export function enrichSinsalData(sinsalData, sinsalJsonData = []) {
  const enriched = {};

  Object.keys(sinsalData).forEach(sinsalName => {
    // JSON 데이터에서 해당 신살 찾기 (더 정확한 매칭)
    const sinsalInfo = sinsalJsonData.find(item => {
      const itemName = item.name_kr;
      const searchName = sinsalName.replace('살', '');

      // 정확한 이름 매치 우선
      if (itemName === sinsalName) return true;
      if (itemName === searchName) return true;

      // 부분 매치 (신살 이름이 포함되는 경우)
      if (itemName.includes(searchName) || searchName.includes(itemName)) return true;

      return false;
    });

    // JSON에 있는 신살만 결과에 포함
    if (sinsalInfo) {
      enriched[sinsalName] = {
        positions: sinsalData[sinsalName],
        info: sinsalInfo
      };
    }
  });

  return enriched;
}

/**
 * ConsultationResult 데이터로부터 신살을 계산하는 헬퍼 함수
 * @param {Object} consultation - ConsultationResult 객체
 * @returns {Object} 계산된 신살 정보
 */
export function calculateSinsalFromConsultation(consultation) {
  if (!consultation) return {};

  const ilgan = consultation.dayStem; // 일간
  const jijis = [
    consultation.yearBranch,  // 년지
    consultation.monthBranch, // 월지
    consultation.dayBranch,   // 일지
    consultation.timeBranch   // 시지
  ].filter(Boolean); // null/undefined 제거

  return calculateSinsal(ilgan, jijis);
}