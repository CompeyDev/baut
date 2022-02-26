import {
	closing,
	proposeAuditTimings,
} from '../../../functions/scheduleAudits';
import Component from '../../../structures/Component';

export default new Component(
	'doesntHaveTeam',
	true,
	async (client, interaction) => {
		// create the hackathon team
		await prisma.hackathonTeam.create({
			data: {
				name: interaction.user.username + "'s Team",
				creator: { connect: { id: interaction.user.id } },
				members: { connect: [{ id: interaction.user.id }] },
				isOnePersonTeam: true,
			},
		});

		// non-team related questions
		await proposeAuditTimings(client, interaction);
		await closing(client, interaction);
	},
	false
);
