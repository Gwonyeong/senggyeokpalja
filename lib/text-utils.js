/**
 * 텍스트를 문장 단위로 분리하여 한 줄씩 띄워서 반환하는 유틸리티 함수
 * @param {string} text - 처리할 텍스트
 * @returns {string} 문장 단위로 한 줄씩 띄워진 텍스트
 */
export function formatTextWithSentenceBreaks(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // 문장 끝 표시 (마침표, 느낌표, 물음표) 다음에 줄바꿈 추가
  // 단, 숫자 뒤의 마침표나 줄임표(...) 등은 제외
  return text
    .replace(/([.!?])\s+/g, '$1\n\n') // 문장 끝 + 공백을 줄바꿈으로 변경
    .replace(/([.!?])([가-힣A-Za-z])/g, '$1\n\n$2') // 문장 끝 바로 다음에 문자가 오는 경우
    .replace(/\n{3,}/g, '\n\n') // 3개 이상의 연속 줄바꿈을 2개로 제한
    .trim(); // 앞뒤 공백 제거
}

/**
 * 텍스트를 React에서 사용할 수 있도록 JSX 엘리먼트로 변환
 * @param {string} text - 처리할 텍스트
 * @returns {React.ReactElement[]} JSX 엘리먼트 배열
 */
export function formatTextToJSX(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const formattedText = formatTextWithSentenceBreaks(text);

  return formattedText.split('\n').map((line, index) => {
    if (line.trim() === '') {
      return <br key={index} />;
    }
    return (
      <span key={index} style={{ display: 'block', marginBottom: '0.5em' }}>
        {line}
      </span>
    );
  });
}