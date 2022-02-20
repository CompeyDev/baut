import { ApiErrors, Inhibitor, MammotError } from '@mammot/core';
import { CacheType, CommandInteraction, GuildMember } from 'discord.js';

/** Verify that the user is an administrator in the guild */
export function verifyAdmin(): Inhibitor {
	return (interaction) => {
		if (
			!(interaction.member as GuildMember).permissions.has(
				'ADMINISTRATOR'
			)
		) {
			throw new MammotError(ApiErrors.NO_PERMISSION);
		}
	};
}
