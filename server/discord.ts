
import fetch from 'node-fetch';
import { storage } from './storage';

export async function sendLogToDiscord(userId: number, message: string) {
  try {
    const settings = await storage.getSettings(userId);
    if (!settings?.discordWebhookUrl) return;

    await fetch(settings.discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: `\`\`\`\n${message}\n\`\`\``,
      }),
    });
  } catch (error) {
    console.error('Failed to send log to Discord:', error);
  }
}
