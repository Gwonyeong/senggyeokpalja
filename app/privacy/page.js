'use client';

export default function Privacy() {
  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{
        background: 'var(--charcoal-gray)',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        marginBottom: '40px'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontFamily: 'var(--heading-font)',
          color: 'var(--starlight-orange)',
          textAlign: 'center',
          marginBottom: '40px'
        }}>개인정보처리방침</h1>

        <div style={{
          color: 'var(--text-color)',
          lineHeight: '1.8',
          fontSize: '1rem'
        }}>
          <section style={{
            marginBottom: '40px',
            padding: '25px',
            background: 'var(--dark-brown)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
          }}>
            <p style={{ marginBottom: '0', fontSize: '1.1rem' }}>
              성격팔자(이하 "회사")는 서비스 이용을 위해 입력한 정보주체의 개인정보 보호를 매우 중요시하며, "개인정보보호법"을 준수하고 있습니다.
            </p>
            <br />
            <p style={{ marginBottom: '0' }}>
              회사는 개인정보처리방침을 통해 이용자가 공개한 개인정보가 어떠한 용도와 방식으로 이용되고 있는지, 그리고 개인정보 보호를 위해 어떠한 조치가 취해지고 있는지 구체적으로 알려드립니다. 본 개인정보처리방침은 관계법령의 변경 및 회사가 제공하는 서비스의 내용 변경에 따라 변경될 수 있으므로 사이트 방문 시 수시로 확인하시기 바랍니다.
            </p>
            <br />
            <p style={{
              marginBottom: '0',
              color: 'var(--starlight-orange)',
              fontWeight: 'bold'
            }}>
              본 개인정보처리방침은 성격팔자가 서비스하는 성격팔자 <strong>(운세서비스)</strong>에만 해당합니다.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              color: 'var(--starlight-orange)',
              fontSize: '1.8rem',
              marginBottom: '25px',
              borderBottom: '3px solid var(--starlight-orange)',
              paddingBottom: '15px'
            }}>1. 개인정보의 이용(처리) 목적</h2>

            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ color: 'var(--starlight-orange)', marginBottom: '15px' }}>수집하는 개인정보 항목</h4>
              <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '12px' }}>
                  <strong style={{ color: 'var(--starlight-orange)' }}>무료 운세서비스</strong> - 이름, 생년월일, 성별, 출생시분 (서비스에 따라 수집 항목이 일부 달라질 수 있음)
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <strong style={{ color: 'var(--starlight-orange)' }}>유료 운세서비스</strong> - 휴대폰번호, 비밀번호 (운세 다시보기 서비스 이용 시 필요)
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <strong style={{ color: 'var(--starlight-orange)' }}>오류 문의</strong> - 구매자명(필수), 휴대폰번호(선택), 이메일주소(필수) (오류문의 작성 및 회신 시 필요)
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <strong style={{ color: 'var(--starlight-orange)' }}>일반/타사 로그인(구글 등)</strong> - 이름, 생년월일, 성별, 전화번호 (사주 정보 제공 및 알림 발송)
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <strong style={{ color: 'var(--starlight-orange)' }}>카카오 로그인</strong> - 이름, 닉네임, 카카오계정(이메일), 카카오계정(전화번호), 성별, 생일, 연령대, 출생연도, 카카오톡 채널 추가 상태 및 내역 (사주 정보 제공, 알림톡 및 채널 운영)
                </li>
              </ul>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ color: 'var(--starlight-orange)', marginBottom: '15px' }}>개인정보 이용 목적</h4>
              <p style={{ marginBottom: '15px' }}>회사는 아래와 같은 안내 및 알림을 위해 개인정보를 이용할 수 있습니다.</p>
              <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '8px' }}>서비스의 제공, 소멸 등에 대한 일반적인 알림</li>
                <li style={{ marginBottom: '8px' }}>서비스 소멸 및 유료 사주 컨텐츠 서비스 자동 삭제에 대한 알림</li>
                <li style={{ marginBottom: '8px' }}>쿠폰 발급 및 소멸에 대한 알림</li>
              </ul>
            </div>

            <div style={{
              padding: '20px',
              background: 'var(--charcoal-gray)',
              borderRadius: '8px',
              borderLeft: '4px solid var(--starlight-orange)'
            }}>
              <p style={{ marginBottom: '0', color: 'var(--text-muted-color)' }}>
                또한, 이용자의 <strong style={{ color: 'var(--starlight-orange)' }}>별도 동의</strong>가 있는 경우 카카오톡 채널·문자·이메일 등을 통해 광고·마케팅 정보를 발송할 수 있습니다. 동의를 거부하셔도 서비스 기본 이용에는 제한이 없습니다.
              </p>
            </div>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              color: 'var(--starlight-orange)',
              fontSize: '1.8rem',
              marginBottom: '25px',
              borderBottom: '3px solid var(--starlight-orange)',
              paddingBottom: '15px'
            }}>2. 개인정보 처리 및 보유기간</h2>

            <p style={{ marginBottom: '20px' }}>
              회사는 유료서비스의 경우 결과 다시보기를 위해 필요한 기간 동안 개인정보를 보유하며, 그 외의 경우에는 목적 달성 시 지체 없이 파기합니다. 단, 관련 법령에 따라 아래와 같이 보관할 수 있습니다.
            </p>

            <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
              <li style={{ marginBottom: '12px' }}>
                <strong>계약·대금결제·재화 등의 공급에 관한 기록:</strong> <span style={{ color: 'var(--starlight-orange)', fontWeight: 'bold' }}>5년</span>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>소비자 불만 또는 분쟁처리에 관한 기록:</strong> <span style={{ color: 'var(--starlight-orange)', fontWeight: 'bold' }}>3년</span>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>표시·광고에 관한 기록:</strong> <span style={{ color: 'var(--starlight-orange)', fontWeight: 'bold' }}>6개월</span>
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              color: 'var(--starlight-orange)',
              fontSize: '1.8rem',
              marginBottom: '25px',
              borderBottom: '3px solid var(--starlight-orange)',
              paddingBottom: '15px'
            }}>3. 개인정보의 제3자 제공</h2>

            <p style={{ marginBottom: '20px' }}>
              회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 법령에 근거가 있거나 이용자가 사전에 명시적으로 동의한 경우에 한하여 최소한의 범위에서 제공할 수 있습니다.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              color: 'var(--starlight-orange)',
              fontSize: '1.8rem',
              marginBottom: '25px',
              borderBottom: '3px solid var(--starlight-orange)',
              paddingBottom: '15px'
            }}>4. 개인정보의 위탁</h2>

            <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
              <li style={{ marginBottom: '12px' }}>
                <strong>Google LLC (Google Analytics):</strong> 웹/앱 사용성 분석
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>Clarity:</strong> 웹/앱 사용성 분석
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              color: 'var(--starlight-orange)',
              fontSize: '1.8rem',
              marginBottom: '25px',
              borderBottom: '3px solid var(--starlight-orange)',
              paddingBottom: '15px'
            }}>5-1. 제3자가 수집하는 행태정보에 관한 사항</h2>

            <p style={{ marginBottom: '20px' }}>
              회사는 효율적 서비스 제공 및 광고를 위해 쿠키·SDK·픽셀 등을 이용하여 제3자가 행태정보를 수집하도록 허용할 수 있습니다.
            </p>

            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              margin: '20px 0',
              background: 'var(--dark-brown)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--starlight-orange)' }}>
                  <th style={{ border: '1px solid var(--border-color)', padding: '12px', color: '#000' }}>수집 도구 명칭</th>
                  <th style={{ border: '1px solid var(--border-color)', padding: '12px', color: '#000' }}>수집 업체</th>
                  <th style={{ border: '1px solid var(--border-color)', padding: '12px', color: '#000' }}>도구 종류</th>
                  <th style={{ border: '1px solid var(--border-color)', padding: '12px', color: '#000' }}>수집 정보</th>
                  <th style={{ border: '1px solid var(--border-color)', padding: '12px', color: '#000' }}>수집 목적</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid var(--border-color)', padding: '12px' }}>Google Analytics</td>
                  <td style={{ border: '1px solid var(--border-color)', padding: '12px' }}>Google LLC</td>
                  <td style={{ border: '1px solid var(--border-color)', padding: '12px' }}>SDK(스크립트)</td>
                  <td style={{ border: '1px solid var(--border-color)', padding: '12px' }}>방문/이용 내역, Cookie ID, IP(일부 익명화), 브라우저·기기 정보, 이벤트 데이터</td>
                  <td style={{ border: '1px solid var(--border-color)', padding: '12px' }}>사용성 분석 및 서비스 개선</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid var(--border-color)', padding: '12px' }}>Clarity</td>
                  <td style={{ border: '1px solid var(--border-color)', padding: '12px' }}>Microsoft</td>
                  <td style={{ border: '1px solid var(--border-color)', padding: '12px' }}>SDK(스크립트)</td>
                  <td style={{ border: '1px solid var(--border-color)', padding: '12px' }}>방문/이용 내역, Cookie ID, IP(일부 익명화), 브라우저·기기 정보, 이벤트 데이터</td>
                  <td style={{ border: '1px solid var(--border-color)', padding: '12px' }}>사용성 분석 및 서비스 개선</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              color: 'var(--starlight-orange)',
              fontSize: '1.8rem',
              marginBottom: '25px',
              borderBottom: '3px solid var(--starlight-orange)',
              paddingBottom: '15px'
            }}>5-2. 제3자 수집 행태정보의 허용/차단 방법</h2>

            <p style={{ marginBottom: '20px' }}>
              이용자는 웹 브라우저 또는 모바일 기기 설정을 통해 제3자가 수집하는 행태정보의 수집을 허용하거나 차단할 수 있습니다. 구체적인 방법은 각 브라우저나 기기의 설정 메뉴를 참조하십시오.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              color: 'var(--starlight-orange)',
              fontSize: '1.8rem',
              marginBottom: '25px',
              borderBottom: '3px solid var(--starlight-orange)',
              paddingBottom: '15px'
            }}>6. 개인정보 파기절차 및 방법</h2>

            <p style={{ marginBottom: '20px' }}>
              이용자가 서비스 탈퇴(회원 탈퇴)를 요청하는 경우, 회사는 지체 없이 이용자의 개인정보를 파기합니다. 다만, 관련 법령에 따라 일정 기간 보관이 필요한 정보(계약 및 결제 기록, 소비자 분쟁 처리 기록 등)는 법정 기간 동안 보관 후 즉시 파기합니다.
            </p>

            <p style={{ marginBottom: '20px' }}>
              탈퇴는 서비스 내 [설정 &gt; 회원 탈퇴] 메뉴 또는 고객센터(카카오 채널, 이메일, 전화)를 통해 신청할 수 있으며, 탈퇴 완료 시에는 복구가 불가능합니다. 탈퇴 시에는 구매한 유료 컨텐츠 또한 삭제됩니다.
            </p>

            <div style={{ marginBottom: '25px' }}>
              <h3 style={{
                color: 'var(--starlight-orange)',
                fontSize: '1.4rem',
                marginBottom: '15px'
              }}>(1) 파기절차</h3>
              <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '12px' }}>
                  정보주체가 서비스 이용 등을 위해 입력한 정보는 목적이 달성된 후 무료서비스의 경우 즉시 파기하며, 유료서비스의 경우 별도의 DB로 옮겨져(종이의 경우 별도의 서류함) 다시보기 기간 및 기타 관련 법령에 의한 정보보호 사유에 따라 일정 기간 저장된 후 파기됩니다.
                </li>
                <li style={{ marginBottom: '12px' }}>
                  동 개인정보는 법률에 의한 경우가 아니고서는 보유 이외의 다른 목적으로 이용되지 않습니다.
                </li>
              </ul>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h3 style={{
                color: 'var(--starlight-orange)',
                fontSize: '1.4rem',
                marginBottom: '15px'
              }}>(2) 파기방법</h3>
              <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '12px' }}>
                  종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.
                </li>
                <li style={{ marginBottom: '12px' }}>
                  전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.
                </li>
              </ul>
            </div>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              color: 'var(--starlight-orange)',
              fontSize: '1.8rem',
              marginBottom: '25px',
              borderBottom: '3px solid var(--starlight-orange)',
              paddingBottom: '15px'
            }}>7. 개인정보의 안전성 확보 조치에 관한 사항</h2>

            <div style={{ marginBottom: '25px' }}>
              <h3 style={{
                color: 'var(--starlight-orange)',
                fontSize: '1.4rem',
                marginBottom: '15px'
              }}>(1) 비밀번호 암호화</h3>
              <p style={{ marginBottom: '15px' }}>
                이용자의 개인정보는 비밀번호에 의해 보호되고 있습니다.
              </p>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h3 style={{
                color: 'var(--starlight-orange)',
                fontSize: '1.4rem',
                marginBottom: '15px'
              }}>(2) 개인 아이디와 비밀번호 관리</h3>
              <p style={{ marginBottom: '15px' }}>
                이용자 계정의 비밀번호는 본인만 알 수 있으며, 이를 절대 타인에게 알려주면 안 됩니다. 특히 공용PC 사용 뒤 반드시 로그아웃을 하시기 바랍니다.
              </p>
              <p style={{ marginBottom: '15px' }}>
                회사는 이용자 부주의로 인한 개인정보 유출 및 인터넷의 구조적 특성에 따른 해킹 등에 대한 책임을 지지 않습니다.
              </p>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h3 style={{
                color: 'var(--starlight-orange)',
                fontSize: '1.4rem',
                marginBottom: '15px'
              }}>(3) 해킹 등에 대비한 대책</h3>
              <p style={{ marginBottom: '15px' }}>
                외부 침입을 차단하기 위한 장치를 이용하여 공격, 해킹 등을 방지하며, 침입탐지시스템을 설치하여 24시간 감시하고 있습니다.
              </p>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h3 style={{
                color: 'var(--starlight-orange)',
                fontSize: '1.4rem',
                marginBottom: '15px'
              }}>(4) 개인정보 처리 직원의 최소화 및 교육</h3>
              <p style={{ marginBottom: '15px' }}>
                회사의 개인정보 관련 처리 직원은 담당자 및 책임자 등으로 한정하여 별도의 비밀번호를 부여하고 정기적으로 갱신·교육을 시행하고 있습니다.
              </p>
            </div>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              color: 'var(--starlight-orange)',
              fontSize: '1.8rem',
              marginBottom: '25px',
              borderBottom: '3px solid var(--starlight-orange)',
              paddingBottom: '15px'
            }}>8. 개인정보 보호책임자에 관한 사항</h2>

            <p style={{ marginBottom: '20px' }}>
              회사는 이용자의 개인정보를 보호하고 그와 관련된 불만을 처리하기 위하여 아래와 같이 개인정보 보호책임자 및 담당자를 지정하고 있습니다.
            </p>

            <div style={{
              padding: '25px',
              background: 'var(--dark-brown)',
              borderRadius: '8px',
              border: '2px solid var(--starlight-orange)'
            }}>
              <h3 style={{
                color: 'var(--starlight-orange)',
                fontSize: '1.4rem',
                marginBottom: '15px',
                textAlign: 'center'
              }}>개인정보 보호책임자</h3>
              <ul style={{ listStyle: 'none', padding: '0', textAlign: 'center' }}>
                <li style={{ marginBottom: '10px' }}><strong>이름:</strong> 김용현</li>
                <li style={{ marginBottom: '10px' }}><strong>소속:</strong> CS팀</li>
                <li style={{ marginBottom: '10px' }}><strong>전화번호:</strong> 010-2546-8979</li>
                <li style={{ marginBottom: '0' }}><strong>전자우편:</strong> regend0726@gmail.com</li>
              </ul>
            </div>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              color: 'var(--starlight-orange)',
              fontSize: '1.8rem',
              marginBottom: '25px',
              borderBottom: '3px solid var(--starlight-orange)',
              paddingBottom: '15px'
            }}>9. 개인정보 열람청구를 접수·처리하는 부서</h2>

            <p style={{ marginBottom: '20px' }}>
              정보주체는 「개인정보 보호법」 제35조에 따른 개인정보 열람청구를 아래의 부서에 할 수 있습니다. 회사는 정보주체의 개인정보 열람 청구가 신속하게 처리되도록 노력하겠습니다.
            </p>

            <div style={{
              padding: '25px',
              background: 'var(--dark-brown)',
              borderRadius: '8px',
              border: '2px solid var(--starlight-orange)'
            }}>
              <h3 style={{
                color: 'var(--starlight-orange)',
                fontSize: '1.4rem',
                marginBottom: '15px',
                textAlign: 'center'
              }}>개인정보 열람청구 접수·처리 담당자</h3>
              <ul style={{ listStyle: 'none', padding: '0', textAlign: 'center' }}>
                <li style={{ marginBottom: '10px' }}><strong>이름:</strong> 김용현</li>
                <li style={{ marginBottom: '10px' }}><strong>소속:</strong> CS팀</li>
                <li style={{ marginBottom: '10px' }}><strong>전화번호:</strong> 010-2546-8979</li>
                <li style={{ marginBottom: '0' }}><strong>전자우편:</strong> regend0726@gmail.com</li>
              </ul>
            </div>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              color: 'var(--starlight-orange)',
              fontSize: '1.8rem',
              marginBottom: '25px',
              borderBottom: '3px solid var(--starlight-orange)',
              paddingBottom: '15px'
            }}>10. 개인정보침해 관련 상담 및 신고</h2>

            <p style={{ marginBottom: '20px' }}>
              개인정보침해에 대한 신고 또는 상담이 필요하신 경우에는 아래 기관으로 문의하시기 바랍니다.
            </p>

            <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
              <li style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'var(--starlight-orange)' }}>개인정보침해신고센터</strong> (국번 없이 118)<br />
                URL: <a href="http://privacy.kisa.or.kr" style={{ color: 'var(--starlight-orange)' }}>http://privacy.kisa.or.kr</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'var(--starlight-orange)' }}>대검찰청 사이버범죄수사과</strong> (국번 없이 1301)<br />
                URL: <a href="http://www.spo.go.kr" style={{ color: 'var(--starlight-orange)' }}>http://www.spo.go.kr</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'var(--starlight-orange)' }}>경찰청 사이버수사국</strong> (국번 없이 182)<br />
                URL: <a href="http://cyberbureau.police.go.kr" style={{ color: 'var(--starlight-orange)' }}>http://cyberbureau.police.go.kr</a>
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              color: 'var(--starlight-orange)',
              fontSize: '1.8rem',
              marginBottom: '25px',
              borderBottom: '3px solid var(--starlight-orange)',
              paddingBottom: '15px'
            }}>11. 개인정보의 국외이전</h2>

            <p style={{ marginBottom: '20px' }}>
              회사는 개인정보를 국외의 다른 사업자에게 별도로 판매·제공하지 않습니다. 다만, 정보통신서비스 제공 및 이용자 편의 증진을 위하여 아래와 같이 국외에서 개인정보 처리 업무가 수행될 수 있습니다.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                padding: '20px',
                background: 'var(--dark-brown)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <h4 style={{ color: 'var(--starlight-orange)', marginBottom: '15px' }}>Google LLC / 미국</h4>
                <ul style={{ listStyle: 'none', padding: '0' }}>
                  <li style={{ marginBottom: '8px' }}><strong>목적:</strong> 웹/앱 사용성 분석 및 개선, 이용자 식별(익명화/가명처리 포함 가능)</li>
                  <li style={{ marginBottom: '8px' }}><strong>항목:</strong> 방문일시, 서비스 이용기록, Cookie ID, 브라우저·기기 정보, 이벤트 데이터, IP(일부 익명화)</li>
                  <li style={{ marginBottom: '8px' }}><strong>방법:</strong> 웹사이트/앱에 삽입된 스크립트를 통한 자동 수집</li>
                  <li style={{ marginBottom: '0' }}><strong>보유기간:</strong> 계약 종료일 또는 수집일부터 최대 5년 중 먼저 도달하는 날</li>
                </ul>
              </div>

              <div style={{
                padding: '20px',
                background: 'var(--dark-brown)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <h4 style={{ color: 'var(--starlight-orange)', marginBottom: '15px' }}>Microsoft / 미국</h4>
                <ul style={{ listStyle: 'none', padding: '0' }}>
                  <li style={{ marginBottom: '8px' }}><strong>목적:</strong> 웹/앱 사용성 분석 및 개선, 이용자 식별(익명화/가명처리 포함 가능)</li>
                  <li style={{ marginBottom: '8px' }}><strong>항목:</strong> 방문일시, 서비스 이용기록, Cookie ID, 브라우저·기기 정보, 이벤트 데이터, IP(일부 익명화)</li>
                  <li style={{ marginBottom: '8px' }}><strong>방법:</strong> 웹사이트/앱에 삽입된 스크립트를 통한 자동 수집</li>
                  <li style={{ marginBottom: '0' }}><strong>보유기간:</strong> 계약 종료일 또는 수집일부터 최대 5년 중 먼저 도달하는 날</li>
                </ul>
              </div>
            </div>
          </section>

          <section style={{
            marginTop: '50px',
            padding: '30px',
            background: 'var(--dark-brown)',
            borderRadius: '8px',
            border: '2px solid var(--starlight-orange)'
          }}>
            <h2 style={{
              color: 'var(--starlight-orange)',
              fontSize: '1.8rem',
              marginBottom: '20px',
              textAlign: 'center'
            }}>12. 개인정보 처리방침 변경에 관한 사항</h2>

            <p style={{ marginBottom: '15px', textAlign: 'center' }}>
              본 개인정보처리방침은 <strong>2025년 9월 16일</strong>에 업데이트되었으며, 변경되는 경우 최소 7일 전부터 홈페이지 '공지사항'을 통해 고지할 것입니다.
            </p>

            <p style={{ textAlign: 'center', color: 'var(--text-muted-color)' }}>
              <strong>시행일자:</strong> 2025년 9월 16일
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}