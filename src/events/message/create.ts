import { Message } from 'discord.js';
import { setUserEligible } from '../../functions/setUserEligible';
import { channels } from '../../guild';
import Event from '../../structures/Event';
import messages from '../../messages';
import { sendHackathonAnnouncement } from '../../functions/sendHackathonAnnouncement';

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

		if (
			message.channel.id === channels.builderhacks &&
			message.content === '!builderhacks'
		) {
			sendHackathonAnnouncement(message);
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
