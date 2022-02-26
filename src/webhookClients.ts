import { WebhookClient } from 'discord.js';

export const congratulatorWebhookClient = new WebhookClient({
	url: process.env.THOUSANDTH_MEMBER_WEBHOOK,
});

export const memberWebhookClient = new WebhookClient({
	url: process.env.MEMBERS_WEBHOOK,
});

export const auditsWebhookClient = new WebhookClient({
	url: process.env.AUDITS_WEBHOOK,
});
