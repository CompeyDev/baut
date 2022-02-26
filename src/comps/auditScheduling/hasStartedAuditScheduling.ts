import Component from '../../structures/Component';
import { hasTeam } from '../../functions/scheduleAudits';

export default new Component(
	'hasStartedAuditScheduling',
	true,
	async (client, interaction) => {
		// ask the very first question
		await hasTeam(interaction);
	},
	false
);
