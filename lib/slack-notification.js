/**
 * 슬랙 웹훅을 통한 알림 전송 유틸리티
 */

/**
 * 슬랙으로 메시지 전송
 * @param {string} webhookUrl - 슬랙 웹훅 URL
 * @param {object} message - 전송할 메시지 객체
 */
async function sendSlackMessage(webhookUrl, message) {
  if (!webhookUrl) {
    console.warn("Slack webhook URL not configured");
    return false;
  }

  try {
    // 환경에 따라 메시지 수정
    const modifiedMessage = {
      ...message,
      text: `${
        process.env.NODE_ENV === "production" ? "" : "🔴 테스트 메세지입니다."
      } - ${message.text}`,
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(modifiedMessage),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Failed to send Slack message:",
        response.status,
        errorText
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending Slack message:", error);
    return false;
  }
}

/**
 * 결제 성공 알림
 */
export async function sendPaymentSuccessNotification(paymentData) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  const message = {
    text: "💳 결제 성공 알림",
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text:
            "✅ 결제가 성공적으로 완료되었습니다" +
            (process.env.NODE_ENV === "production" ? "🟢 라이브" : "🔴 테스트"),
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*결제 키:*\n${paymentData.paymentKey}`,
          },
          {
            type: "mrkdwn",
            text: `*주문 ID:*\n${paymentData.orderId}`,
          },
          {
            type: "mrkdwn",
            text: `*결제 금액:*\n₩${paymentData.amount?.toLocaleString() || 0}`,
          },
          {
            type: "mrkdwn",
            text: `*결제 수단:*\n${paymentData.method || "알 수 없음"}`,
          },
          {
            type: "mrkdwn",
            text: `*고객명:*\n${paymentData.customerName || "알 수 없음"}`,
          },
          {
            type: "mrkdwn",
            text: `*고객 이메일:*\n${
              paymentData.customerEmail || "알 수 없음"
            }`,
          },
        ],
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*상품명:*\n${paymentData.productName || "알 수 없음"}`,
          },
          {
            type: "mrkdwn",
            text: `*결제 시각:*\n${
              paymentData.approvedAt
                ? new Date(paymentData.approvedAt).toLocaleString("ko-KR", {
                    timeZone: "Asia/Seoul",
                  })
                : new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })
            }`,
          },
        ],
      },
    ],
    attachments: [
      {
        color: "good",
        footer: "성격팔자 결제 시스템",
        footer_icon:
          "https://platform.slack-edge.com/img/default_application_icon.png",
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  // 카드 정보가 있는 경우 추가
  if (paymentData.cardCompany) {
    message.blocks.push({
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*카드사:*\n${paymentData.cardCompany}`,
        },
        {
          type: "mrkdwn",
          text: `*카드 번호:*\n${paymentData.cardNumber || "****"}`,
        },
      ],
    });
  }

  return sendSlackMessage(webhookUrl, message);
}

/**
 * 결제 실패 알림
 */
export async function sendPaymentFailureNotification(failureData) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  const message = {
    text: "💳 결제 실패 알림",
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text:
            "❌ 결제가 실패했습니다" +
            (process.env.NODE_ENV === "production"
              ? "🟢 라이브"
              : "🔴 테스트 메세지입니다."),
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*결제 키:*\n${failureData.paymentKey || "알 수 없음"}`,
          },
          {
            type: "mrkdwn",
            text: `*주문 ID:*\n${failureData.orderId || "알 수 없음"}`,
          },
          {
            type: "mrkdwn",
            text: `*시도 금액:*\n₩${failureData.amount?.toLocaleString() || 0}`,
          },
          {
            type: "mrkdwn",
            text: `*실패 코드:*\n${failureData.failureCode || "UNKNOWN_ERROR"}`,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*실패 메시지:*\n\`\`\`${
            failureData.failureMessage || "결제에 실패했습니다"
          }\`\`\``,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*사용자 ID:*\n${failureData.userId || "비로그인"}`,
          },
          {
            type: "mrkdwn",
            text: `*실패 시각:*\n${new Date().toLocaleString("ko-KR", {
              timeZone: "Asia/Seoul",
            })}`,
          },
        ],
      },
    ],
    attachments: [
      {
        color: "danger",
        footer: "성격팔자 결제 시스템",
        footer_icon:
          "https://platform.slack-edge.com/img/default_application_icon.png",
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  return sendSlackMessage(webhookUrl, message);
}

/**
 * 결제 관련 일반 알림
 */
export async function sendPaymentNotification(
  title,
  message,
  color = "warning"
) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  const slackMessage = {
    text: title,
    attachments: [
      {
        color: color,
        text: message,
        footer: "성격팔자 결제 시스템",
        footer_icon:
          "https://platform.slack-edge.com/img/default_application_icon.png",
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  return sendSlackMessage(webhookUrl, slackMessage);
}
