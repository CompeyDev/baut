import { Message } from 'discord.js';
import { setUserEligible } from '../../functions/setUserEligible';
import { channels } from '../../guild';
import Event from '../../structures/Event';
import messages from '../../messages';
import { sendHackathonAnnouncement } from '../../functions/sendHackathonAnnouncement';
import { scheduleAudits } from '../../functions/scheduleAudits';
import { executeOrFail } from '../../util/executeOrFail';

export default new Event(
	{
		name: 'messageCreate',
	},
	async (mammot, message: Message) => {
		// Ignore bots
		if (message.author.bot) return;

		if (message.channelId === channels.chat) {
			messages.add(message);
		}

		// Introductions channel only
		if (message.channel.id === channels.intros) {
			try {
				await setUserEligible(message.member);
			} catch (error) {
				console.error(error);
			}
		}

		if (message.content === '!builderhacks') {
			console.log('[builderhacks command triggered]');
			sendHackathonAnnouncement(message);
		}

		if (message.content === '!schedule_audits') {
			console.log('[audit command triggered]');
			await executeOrFail(
				async () => {
					scheduleAudits(message);
				},
				async () =>
					await message.channel.send(
						'We ran into an error. Please Contact a Server Admin.'
					)
			);
		}

		switch (message.channel.id) {
			case channels.wins:
				message.startThread({
					name: `Win - ${message.content.slice(0, 20)}`,
					autoArchiveDuration: 1440,
					reason: `[Baut AutoThread] Thread created for ${message.author.tag}`,
				});
				break;
			case channels.help:
				message.startThread({
					name: `Help - ${message.content.slice(0, 20)}`,
					autoArchiveDuration: 1440,
					reason: `[Baut AutoThread] Thread created for ${message.author.tag}`,
				});
				break;
			case channels.resources:
				message.startThread({
					name: `Resource - ${message.content.slice(0, 20)}`,
					autoArchiveDuration: 1440,
					reason: `[Baut AutoThread] Thread created for ${message.author.tag}`,
				});
				break;
			case channels.jobs:
				message.startThread({
					name: `Job - ${message.content.slice(0, 20)}`,
					autoArchiveDuration: 1440,
					reason: `[Baut AutoThread] Thread created for ${message.author.tag}`,
				});
				break;
			case channels.showcase:
				message.startThread({
					name: `Showcase - ${message.content.slice(0, 20)}`,
					autoArchiveDuration: 1440,
					reason: `[Baut AutoThread] Thread created for ${message.author.tag}`,
				});

				message.react('👍');
				message.react('👎');

				break;
		}
	}
);
