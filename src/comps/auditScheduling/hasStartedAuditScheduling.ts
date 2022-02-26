import Component from '../../structures/Component';
import { hasTeam } from '../../functions/scheduleAudits';

export default new Component(
	'hasStartedAuditScheduling',
	true,
	async (client, interaction) => {
		interaction.component.disabled = true;

		// ask the very first question
		await hasTeam(interaction);
	},
	false
);
