type TelegramNotification = {
  title: string;
  lines: string[];
};

export async function sendTelegramNotification(
  notification: TelegramNotification,
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram notifications are not configured.");
    return;
  }

  const message = [notification.title, "", ...notification.lines].join("\n");

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          disable_web_page_preview: true,
        }),
        signal: AbortSignal.timeout(3000),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error(
        "Telegram notification failed with HTTP status:",
        response.status,
      );
    }
  } catch (error) {
    console.error(
      "Telegram notification could not be delivered:",
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}
