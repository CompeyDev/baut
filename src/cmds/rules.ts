import { config, Command } from '@mammot/core';
import {
	CommandInteraction,
	MessageActionRow,
	MessageAttachment,
	MessageButton,
	MessageEmbed,
} from 'discord.js';
import { embedMessages, media } from '../constants';
import { channels } from '../guild';

@config('rules', {
	description: 'Send the server rules',
	// inhibitors: [verifyAdmin(), checkMember()],
})
export class RulesCommand extends Command {
	public async run(interaction: CommandInteraction) {
		const { rules, thankYou } = embedMessages;

		// Check if the channel is the rules channel
		if (interaction.channel.id !== channels.rules) {
			// Direct users to the rules channel
			await interaction.reply({
				content: `Please go to <#${channels.rules}> to view the server rules.`,
				ephemeral: true,
			});

			return;
		}

		// Create the welcome embed
		const welcomeEmbed = new MessageEmbed()
			.setColor('#FFFFFF')
			.setTitle('Welcome To Buildergroop!')
			.setDescription(
				'We are a diverse and open community of ambitious gen-z builders, striving to build a better future.'
			);

		// Create the rules embed
		const rulesEmbed = new MessageEmbed()
			.setColor('#40B9FD')
			.setTitle('Our Community Rules')
			.setDescription(rules);

		// Create the rules embed
		const infoEmbed = new MessageEmbed()
			.setColor('#C930FF')
			.setTitle('Thanks for joining!')
			.setDescription(thankYou);

		// Create the social action row
		const socialRow = new MessageActionRow().addComponents(
			new MessageButton()
				.setLabel('Twitter')
				.setStyle('LINK')
				.setURL('https://twitter.com/buildergroop')
				.setEmoji('🐦'),
			new MessageButton()
				.setLabel('GitHub')
				.setStyle('LINK')
				.setURL('https://github.com/buildergroop')
				.setEmoji('👨‍💻'),
			new MessageButton()
				.setLabel('Linkedin')
				.setStyle('LINK')
				.setURL('https://linkedin.com/company/buildergroop')
				.setEmoji('💼'),
			new MessageButton()
				.setLabel('Website')
				.setStyle('LINK')
				.setURL('https://buildergroop.com')
				.setEmoji('🌐')
		);

		// create the header image attachment
		const headerImage = new MessageAttachment(media.rulesHeaderImage);

		// Send the embeds and social row
		await interaction.channel.send({
			files: [headerImage],
			embeds: [welcomeEmbed, rulesEmbed, infoEmbed],
			components: [socialRow],
		});
		await interaction.reply({
			content: 'Rules posted!',
			ephemeral: true,
		});
	}
}
