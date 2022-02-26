import { channels } from '../guild';
import { InteractionType } from '../types';

export async function collectFirstMessage(
	interaction: InteractionType,
	filter?: () => any
) {
	try {
		const collected = await interaction.channel.awaitMessages({
			filter: filter || null,
		});
		console.log(collected);

		return collected.first().content;
	} catch (err) {
		console.log(`time ended`);
		interaction.followUp(
			`Nothing was entered. Please rerun the \`!schedule_audit\` command in <#${channels.requestAuditChannel}>.`
		);
		return;
	}
}
