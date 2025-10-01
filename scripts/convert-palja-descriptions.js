const fs = require('fs');
const path = require('path');

// 팔자유형 설명 파일들을 JSON으로 변환하는 스크립트
function convertPaljaDescriptions() {
  const sourceDir = path.join(__dirname, '../public/documents/팔자유형 상세 설명');
  const targetDir = path.join(__dirname, '../public/documents');

  // 소스 디렉토리 존재 확인
  if (!fs.existsSync(sourceDir)) {
    console.error('소스 디렉토리를 찾을 수 없습니다:', sourceDir);
    return;
  }

  // txt 파일들 읽기
  const files = fs.readdirSync(sourceDir).filter(file => file.endsWith('.txt'));
  console.log(`총 ${files.length}개의 txt 파일을 찾았습니다.`);

  const allDescriptions = {};

  files.forEach(filename => {
    try {
      console.log(`처리 중: ${filename}`);

      // 파일명에서 유형 코드와 별명 추출
      const nameWithoutExt = filename.replace('.txt', '');
      const [typeCode, ...aliasParts] = nameWithoutExt.split(' ');
      const alias = aliasParts.join(' ');

      // 파일 내용 읽기
      const filePath = path.join(sourceDir, filename);
      const content = fs.readFileSync(filePath, 'utf-8');

      // 내용 파싱
      const parsed = parseContent(content, typeCode, alias);
      allDescriptions[typeCode] = parsed;

      console.log(`✓ ${typeCode} (${alias}) 변환 완료`);
    } catch (error) {
      console.error(`❌ ${filename} 처리 중 오류:`, error.message);
    }
  });

  // JSON 파일로 저장
  const outputPath = path.join(targetDir, '팔자유형_상세설명.json');
  fs.writeFileSync(outputPath, JSON.stringify(allDescriptions, null, 2), 'utf-8');

  console.log(`\n✅ 변환 완료! ${Object.keys(allDescriptions).length}개 유형이 ${outputPath}에 저장되었습니다.`);

  // 변환된 유형 목록 출력
  console.log('\n변환된 유형들:');
  Object.keys(allDescriptions).forEach(typeCode => {
    console.log(`- ${typeCode}: ${allDescriptions[typeCode].alias}`);
  });
}

function parseContent(content, typeCode, alias) {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  const result = {
    typeCode,
    alias,
    본질: "",
    빛: {
      핵심강점: {
        제목: "",
        설명: ""
      },
      최고의무대: "",
      강점활용비급: ""
    },
    그림자: {
      근원적약점: {
        제목: "",
        설명: ""
      },
      함정에빠지는순간: "",
      토리의처방전: ""
    }
  };

  let currentSection = null;
  let currentSubSection = null;
  let contentBuffer = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 메인 섹션 구분
    if (line.includes('[1] 당신의 본질: 심층 해설')) {
      saveCurrentContent();
      currentSection = '본질';
      currentSubSection = null;
      contentBuffer = [];
      continue;
    }

    if (line.includes('[2] 당신의 빛: 강점 사용 설명서')) {
      saveCurrentContent();
      currentSection = '빛';
      currentSubSection = null;
      contentBuffer = [];
      continue;
    }

    if (line.includes('[3] 당신의 그림자: 약점 보완 처방전')) {
      saveCurrentContent();
      currentSection = '그림자';
      currentSubSection = null;
      contentBuffer = [];
      continue;
    }

    // 빛 섹션의 서브섹션
    if (currentSection === '빛') {
      if (line.includes('핵심 강점:')) {
        saveCurrentContent();
        currentSubSection = '핵심강점';
        contentBuffer = [];
        // 콜론 뒤의 내용을 제목으로 처리
        const afterColon = line.split('핵심 강점:')[1];
        if (afterColon && afterColon.trim()) {
          // 제목 부분 (따옴표로 감싸진 부분)
          const titleMatch = afterColon.trim().match(/[''](.+?)['']/);
          if (titleMatch) {
            result.빛.핵심강점.제목 = titleMatch[1];
          }
        }
        continue;
      }

      if (line.includes('최고의 무대:')) {
        saveCurrentContent();
        currentSubSection = '최고의무대';
        contentBuffer = [];
        continue;
      }

      if (line.includes('강점 활용 비급:')) {
        saveCurrentContent();
        currentSubSection = '강점활용비급';
        contentBuffer = [];
        continue;
      }
    }

    // 그림자 섹션의 서브섹션
    if (currentSection === '그림자') {
      if (line.includes('근원적 약점:')) {
        saveCurrentContent();
        currentSubSection = '근원적약점';
        contentBuffer = [];
        // 콜론 뒤의 내용을 제목으로 처리
        const afterColon = line.split('근원적 약점:')[1];
        if (afterColon && afterColon.trim()) {
          // 제목 부분 (따옴표로 감싸진 부분)
          const titleMatch = afterColon.trim().match(/[''](.+?)['']/);
          if (titleMatch) {
            result.그림자.근원적약점.제목 = titleMatch[1];
          }
        }
        continue;
      }

      if (line.includes('함정에 빠지는 순간:')) {
        saveCurrentContent();
        currentSubSection = '함정에빠지는순간';
        contentBuffer = [];
        continue;
      }

      if (line.includes('토리의 처방전:')) {
        saveCurrentContent();
        currentSubSection = '토리의처방전';
        contentBuffer = [];
        continue;
      }
    }

    // 일반 텍스트 라인 추가
    if (currentSection) {
      contentBuffer.push(line);
    }
  }

  // 마지막 내용 저장
  saveCurrentContent();

  function saveCurrentContent() {
    if (!currentSection || contentBuffer.length === 0) return;

    const content = contentBuffer.join('\n\n').trim();

    if (currentSection === '본질') {
      result.본질 = content;
    } else if (currentSection === '빛' && currentSubSection) {
      if (currentSubSection === '핵심강점') {
        result.빛.핵심강점.설명 = content;
      } else {
        result.빛[currentSubSection] = content;
      }
    } else if (currentSection === '그림자' && currentSubSection) {
      if (currentSubSection === '근원적약점') {
        result.그림자.근원적약점.설명 = content;
      } else {
        result.그림자[currentSubSection] = content;
      }
    }
  }

  return result;
}

// 스크립트 실행
if (require.main === module) {
  convertPaljaDescriptions();
}

module.exports = { convertPaljaDescriptions };