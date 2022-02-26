import Component from '../../../structures/Component';
import {
	askForTeammate,
	askForTeamName,
	closing,
	proposeAuditTimings,
} from '../../../functions/scheduleAudits';

export default new Component(
	'doesHaveTeam',
	true,
	async (client, interaction) => {
		await askForTeamName(client, interaction);
		await askForTeammate(client, interaction);

		// non-team related questions
		await proposeAuditTimings(client, interaction);
		await closing(client, interaction);
	},
	false
);
