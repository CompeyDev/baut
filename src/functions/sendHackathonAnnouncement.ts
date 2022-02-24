import { Message, MessageActionRow, MessageButton } from 'discord.js';
import { channels } from '../guild';

export const sendHackathonAnnouncement = async (message: Message) => {
	const arrowEmoji = message.client.emojis.cache.find(
		(e) => e.name === 'arrow'
	);
	const bhackswinterEmoji = message.client.emojis.cache.find(
		(e) => e.name === 'builderhacks_winter'
	);

	// Create category buttons
	const buttons = new MessageActionRow().addComponents(
		new MessageButton()
			.setLabel('Get BuilderHacks Role')
			.setEmoji('🎉')
			.setStyle('PRIMARY')
			.setCustomId('getHackathonRole'),
		new MessageButton()
			.setLabel('Register')
			.setEmoji('✍🏻')
			.setStyle('LINK')
			.setURL('https://buildergroop.com/forms/hacks'),
		new MessageButton()
			.setLabel('Website')
			.setEmoji('🌐')
			.setStyle('LINK')
			.setURL('https://hacks.buildergroop.com/')
	);

	await message.channel.send({
		content: `
${bhackswinterEmoji} **Do you want the chance to win an M1 MacBook? Join BuilderHacks.**

> Have you registered for Buildergroop's very first hackathon in collaboration with <https://lambdatest.com> ? We offer a prize pool worth **$5000 USD**,  loads of workshops on the most vital technologies required to create amazing digital experiences, and a constant schedule of fun networking activities throughout the event.

**—** The hackathon will start at <t:1645842600:F> and go on for 36 hours.
**—** Check out <#${channels.builderhacksFindATeammateThread}> if you're looking for a teammate
**—** Click the Register Button to Register
**—** Click the \`Get BuilderHacks Role\` Button to be notified of all important updates during the hackathon
**—** Got Questions? Don't hesitate to put them in <#${channels.builderhacksS1Thread}> thread.
__
__
		`,
		components: [buttons],
		files: [
			'https://cdn.discordapp.com/attachments/878195994293075968/946507101679796274/unknown.png',
		],
	});
};
