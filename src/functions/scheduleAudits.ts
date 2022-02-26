import { Client, Message, MessageActionRow, MessageButton } from 'discord.js';
import { InteractionType } from '../types';
import { prisma } from '../providers/prisma';
import { auditsWebhookClient } from '../webhookClients';

export async function scheduleAudits(message: Message) {
	// make sure they arent already in a team
	const doesUserHaveTeam = await prisma.hackathonTeam.findFirst({
		where: {
			members: {
				some: {
					AND: {
						id: message.author.id,
						finishedAuditScheduling: true,
					},
				},
			},
		},
	});
	if (doesUserHaveTeam) {
		await message.channel.send(
			`<@${message.author.id}> you are already in team ${doesUserHaveTeam.name} by <@${doesUserHaveTeam.creatorId}>!`
		);
	} else {
		await message.channel.send(
			`Audit scheduling requested by <@${message.author.id}>. Please check your DMs!`
		);
	}

	const dmChannel =
		message.author.dmChannel || (await message.author.createDM());

	// create the participant
	await prisma.participant.create({
		data: {
			id: message.author.id,
		},
	});

	const startActionRow = new MessageActionRow().addComponents(
		new MessageButton()
			.setLabel(`Let's Go!`)
			.setStyle('PRIMARY')
			.setCustomId('hasStartedAuditScheduling')
	);

	dmChannel.send({
		embeds: [
			{
				title: 'Audit Scheduling',
				description:
					"Audits are critical to your team if you want your submission to be judged. I'm going to walk you through a simple process which will let you schedule your audits.",
				footer: {
					text: 'Only one member from your team has to fill this out ',
				},
				color: 'BLURPLE',
			},
		],
		components: [startActionRow],
	});
}

export async function hasTeam(interaction: InteractionType) {
	const hasTeamActionRow = new MessageActionRow().addComponents(
		new MessageButton()
			.setLabel(`Yes`)
			.setStyle('SECONDARY')
			.setCustomId('doesHaveTeam'),
		new MessageButton()
			.setLabel(`No`)
			.setStyle('SECONDARY')
			.setCustomId('doesntHaveTeam')
	);

	await interaction.channel.send({
		content: '_ _',
		embeds: [
			{
				title: 'Do you have a Team?',
				description:
					'If you happen to be competing alongside one other person, click `Yes`. If you are competing solo, click `No`.',
				color: 'LIGHT_GREY',
			},
		],
		components: [hasTeamActionRow],
	});
}

export async function askForTeamName(
	client: Client,
	interaction: InteractionType
) {
	await interaction.channel.send({
		content: '_ _',
		embeds: [
			{
				title: 'What is the name of your team?',
				description: 'Please enter the exact name of your team.',
				footer: {
					text: 'Teamwork makes the dream work :)',
				},
				color: 'LIGHT_GREY',
			},
		],
	});

	const collected = await interaction.channel.awaitMessages({ max: 1 });
	const teamName = collected.first().content;

	// create the hackathon team
	await prisma.hackathonTeam.create({
		data: {
			name: teamName,
			creator: { connect: { id: interaction.user.id } },
			members: { connect: [{ id: interaction.user.id }] },
			isOnePersonTeam: true,
		},
	});

	if (!teamName) {
		await interaction.channel.send('Invalid Discord Tag Provided.');
		return;
	}
}

export async function askForTeammate(
	client: Client,
	interaction: InteractionType
) {
	await interaction.channel.send({
		content: '_ _',
		embeds: [
			{
				title: 'What is your teammates Discord ID?',
				description: `Please enter your teammates Discord ID. This can be retrieved by right clicking on their avatar and then clicking "Copy ID". If you don't see that option, you will need to go into settings and enable "Developer Mode" under the advanced tab.`,
				footer: {
					text: 'Any issues? DM one of the admins.',
				},
				color: 'LIGHT_GREY',
			},
		],
		files: [
			'https://cdn.discordapp.com/attachments/944240553153945710/947172824425062430/Epoch_Demo.mp4',
		],
	});

	const collected = await interaction.channel.awaitMessages({ max: 1 });
	const teammateDiscordId = collected.first().content;

	if (!teammateDiscordId) {
		await interaction.channel.send('Invalid Discord ID Provided.');
		return;
	}

	// make sure they arent already in a team
	const doesUserHaveTeam = await prisma.hackathonTeam.findFirst({
		where: {
			members: {
				some: {
					id: teammateDiscordId,
				},
			},
		},
	});
	if (doesUserHaveTeam) {
		await interaction.channel.send(
			`<@${teammateDiscordId}> is already in a team!`
		);
	} else {
		// update the hackathon team
		await prisma.hackathonTeam.update({
			where: {
				creatorId: interaction.user.id,
			},
			data: {
				isOnePersonTeam: false,
				members: {
					connectOrCreate: {
						create: {
							id: teammateDiscordId,
						},
						where: {
							id: teammateDiscordId,
						},
					},
				},
			},
		});
	}
}

export async function proposeAuditTimings(
	client: Client,
	interaction: InteractionType
) {
	await interaction.channel.send({
		embeds: [
			{
				title: 'Enter at what time you would like to have your first and second audit (Must be seperated by minimum 4 hour interval!) using comma seperated epoch timestamps.',
				description: `
				The epoch format is a **universal representation** for any certain date and time. https://unixtimestamp.com/ is a great resource that allows you to enter any date & time in your local timezone and get the epoch timestamp for it.
				
				You need to **enter the epoch timestamps in the following order**: \`{first audit timestamp}, {second audit timestamp}\' excluding the brackets.
				`,
				footer: {
					text: 'If you have any questions at all, please dont hesitate to contact one of the admins.',
				},
				color: 'LIGHT_GREY',
			},
		],
		files: [
			'https://cdn.discordapp.com/attachments/947152774414614638/947169297032175696/Epoch_Demo.mp4',
		],
	});

	const collected = await interaction.channel.awaitMessages({ max: 1 });

	const epochTimestampsString = collected.first().content;
	const epochTimestamps = epochTimestampsString
		.split(',')
		.map((e) => e.trim());

	if (epochTimestamps.length !== 2) {
		await interaction.channel.send('Invalid Epoch Timestamps Given.');
		return;
	}

	const auditOneTimestamp = epochTimestamps[0];
	const auditTwoTimestamp = epochTimestamps[1];

	// fetch the hackathon
	const hackathon = await prisma.hackathonTeam.findFirst({
		where: { creatorId: interaction.user.id },
	});

	// create the audits
	await prisma.hackathonAudit.createMany({
		data: [
			{
				version: 'FIRST',
				hackathonTeamId: hackathon.id,
				epoch: auditOneTimestamp,
			},
			{
				version: 'SECOND',
				hackathonTeamId: hackathon.id,
				epoch: auditTwoTimestamp,
			},
		],
	});
}

export async function closing(client: Client, interaction: InteractionType) {
	// fetch the hackathon team
	const hackathonTeam = await prisma.hackathonTeam.findFirst({
		where: { creatorId: interaction.user.id },
		include: { audits: true, members: true },
	});

	// fetch the teammate
	const teammate = (
		await prisma.hackathonTeam.findFirst({
			where: { creatorId: interaction.user.id },
			include: {
				members: true,
			},
		})
	).members.filter((m) => m.id !== interaction.user.id)?.[0];
	console.log(teammate);

	// update the team members
	await prisma.participant.update({
		where: { id: interaction.user.id },
		data: { finishedAuditScheduling: true },
	});

	teammate &&
		(await prisma.participant.update({
			where: { id: teammate.id },
			data: { finishedAuditScheduling: true },
		}));

	// notify webhook
	await auditsWebhookClient.send({
		embeds: [
			{
				title: `${interaction.user.username}#${interaction.user.discriminator} has finished scheduling both audits for the team ${hackathonTeam.name}`,
				fields: [
					{ name: 'Team ID', value: hackathonTeam.id },
					{ name: 'Team Name', value: hackathonTeam.name },
					{
						name: 'Team Members',
						value:
							hackathonTeam.members.length === 1
								? `<@${hackathonTeam.members[0].id}>`
								: `<@${hackathonTeam.members[0].id}> and <@${hackathonTeam.members[1].id}>`,
					},
					{
						name: 'Audit One',
						value: `
**Timing**: <t:${hackathonTeam.audits[0].epoch}:f>
**Conductors**: ${hackathonTeam.audits[0].conductors
							?.map((conductor) => `<@${conductor}>`)
							.join(', ')}

						`,
					},
					{
						name: 'Audit Two',
						value: `
**Timing**: <t:${hackathonTeam.audits[1].epoch}:f>
**Conductors**: ${hackathonTeam.audits[1].conductors
							?.map((conductor) => `<@${conductor}>`)
							.join(', ')}`,
					},
				],
			},
		],
	});

	await interaction.channel.send({
		embeds: [
			{
				title: 'Thank you for participating in the Hackathon!',
				description: `
					Your response has been recorded. You will be notified shortly when an audit conducter is assigned to your audits. Please keep a close lookout for pings in the BuilderGroop Discord server as it is how we plan on reaching you when it's time to conduct your audit.
				`,
				footer: {
					text: 'Good luck!',
				},
				color: 'BLURPLE',
			},
		],
	});
	return;
}
