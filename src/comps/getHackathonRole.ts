import { GuildMemberRoleManager } from 'discord.js';
import { roles } from '../guild';
import Component from '../structures/Component';

export default new Component(
	'getHackathonRole',
	false,
	async (client, interaction) => {
		if (!(interaction.member.roles instanceof GuildMemberRoleManager)) {
			await interaction.editReply('Internal Error.');
			return;
		}

		if (interaction.member.roles.cache.has(roles.builderhacksParticipant)) {
			await interaction.editReply(
				'You already have the BuilderHacks participant role!'
			);
			return;
		}

		await interaction.member.roles.add(roles.builderhacksParticipant);

		const role =
			interaction.guild.roles.cache.get(roles.builderhacksParticipant) ||
			(await interaction.guild.roles.fetch(
				roles.builderhacksParticipant
			));

		await interaction.editReply(
			`You were given the \`${role.name}\` role! Make sure to tell all your friends about builderhacks!`
		);
	},
	true
);
