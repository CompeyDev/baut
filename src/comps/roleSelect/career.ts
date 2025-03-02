import { GuildMember } from 'discord.js';
import { multi_select } from '../../util/editRoles';
import Component from '../../structures/Component';
import { roles } from '../../guild';

export default new Component('career', false, async (client, interaction) => {
	// Check for component type
	if (!interaction.isSelectMenu()) return;

	// Check if the type of user is a member
	if (!(interaction.member instanceof GuildMember)) {
		// Get the member
		interaction.member = interaction.guild.members.cache.get(
			interaction.user.id
		);
	}

	// Get the select menu options
	const options = interaction.values;

	// Update the roles
	await multi_select(interaction.member, roles.career, options).catch(
		console.error
	);

	// Send the confirmation message
	await interaction.editReply({
		content: 'Your roles have been updated.',
	});
});
