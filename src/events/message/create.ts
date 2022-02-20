import { Message } from 'discord.js';
import { setUserEligible } from '../../functions/setUserEligible';
import { channels } from '../../guild';
import Event from '../../structures/Event';
import messages from '../../messages';

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

		// SALVAGE_LIKES_TO_SCREAM
		switch (message.channel.id) {
			case channels.wins:
				message.startThread({
					name: 'Win Thread',
					autoArchiveDuration: 1440,
					reason: `[Baut AutoThread] Thread created for ${message.author.tag}`,
				});
				break;
			case channels.help:
				message.startThread({
					name: 'Help Thread',
					autoArchiveDuration: 1440,
					reason: `[Baut AutoThread] Thread created for ${message.author.tag}`,
				});
				break;
			case channels.resources:
				message.startThread({
					name: 'Resource Thread',
					autoArchiveDuration: 1440,
					reason: `[Baut AutoThread] Thread created for ${message.author.tag}`,
				});
				break;
			case channels.jobs:
				message.startThread({
					name: 'Job Thread',
					autoArchiveDuration: 1440,
					reason: `[Baut AutoThread] Thread created for ${message.author.tag}`,
				});
				break;
			case channels.showcase:
				message.startThread({
					name: 'Showcase Thread',
					autoArchiveDuration: 1440,
					reason: `[Baut AutoThread] Thread created for ${message.author.tag}`,
				});
				break;
		}
	}
);
