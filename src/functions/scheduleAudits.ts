import {
	Client,
	Message,
	MessageActionRow,
	MessageButton,
	MessagePayload,
	TextChannel,
	WebhookMessageOptions,
} from 'discord.js';
import { InteractionType } from '../types';
import { prisma } from '../providers/prisma';
import { auditsWebhookClient } from '../webhookClients';
import { channels } from '../guild';
import { HackathonAudit, HackathonTeam, Participant } from '@prisma/client';
import { roles } from '../guild';

export async function scheduleAudits(message: Message) {
	try {
		// make sure they dont exist yet
		const doesUserExist = await prisma.participant.findFirst({
			where: { id: message.author.id },
		});

		if (doesUserExist) {
			await message.channel.send(
				`<@${message.author.id}> you have already attempted the audit scheduling process. Please contact an admin if there are any issues.`
			);
			return;
		}

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
				`<@${message.author.id}> you are already in team ${doesUserHaveTeam.name} by <@${doesUserHaveTeam.creatorId}>! If you think this is a mistake, contact an admin right away.`
			);
		} else {
			await message.reply({
				content: `Please check your DMs!`,
			});
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

		await dmChannel.send({
			embeds: [
				{
					title: 'Audit Scheduling',
					description:
						"Audits are critical to your team if you want your submission to be judged. I'm going to walk you through a simple process which will let you schedule your audits.",
					footer: {
						text: 'Only one member from your team has to fill this out',
					},
					color: 'BLURPLE',
				},
			],
			components: [startActionRow],
		});
	} catch (err) {
		console.error(err);
		await message.channel.send('Internal Error ● ' + err);
	}
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
	try {
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
			await interaction.channel.send('No Team Name. Re-Asking Question.');
			await askForTeamName(client, interaction);
		}
	} catch (err) {
		console.error(err);
		await interaction.channel.send('Internal Error ● ' + err);
	}
}

export async function askForTeammate(
	client: Client,
	interaction: InteractionType
) {
	try {
		await interaction.channel.send({
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
				`<@${teammateDiscordId}> is already in a team! Re-Asking Question.`
			);
			await askForTeammate(client, interaction);
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
	} catch (err) {
		console.error(err);
		await interaction.channel.send('Internal Error ● ' + err);
	}
}

export async function proposeAuditTimings(
	client: Client,
	interaction: InteractionType
) {
	try {
		await interaction.channel.send({
			content: '_ _',
			embeds: [
				{
					title: 'Enter at what times you would like to have your first and second audit, using comma seperated epoch timestamps.',
					description: `
				The epoch format is a **universal representation** for any certain date and time. https://unixtimestamp.com/ is a great resource that allows you to enter any date & time in your local timezone and get the epoch timestamp for it.
				
				You need to **enter the epoch timestamps in the following order**: \`{first_audit_timestamp}, {second_audit_timestamp}\' excluding the brackets.

				**PLEASE NOTE!!** The intervals between your audits have to be a minimum of four hours.
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
			interaction.channel.send(
				'Invalid Epoch Timestamps Given. Re-Asking Question.'
			);
			await proposeAuditTimings(client, interaction);
			return;
		}

		const auditOneTimestamp = Number(epochTimestamps[0]);
		const auditTwoTimestamp = Number(epochTimestamps[1]);

		if ((auditOneTimestamp || auditTwoTimestamp) < 10) {
			interaction.channel.send(
				'Invalid Epoch Timestamp Format. Re-Asking Question.'
			);
			await proposeAuditTimings(client, interaction);
			return;
		}

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
	} catch (err) {
		console.error(err);
		await interaction.channel.send('Internal Error ● ' + err);
	}
}

async function remindFiveMinutesBeforeAudit(
	client: Client,
	interaction: InteractionType,
	hackathonTeam: HackathonTeam & {
		audits: HackathonAudit[];
		members: Participant[];
	}
) {
	const channel = (await interaction.client.channels.fetch(
		channels.auditReminders
	)) as TextChannel;
	const firstReminder = async () => {
		await channel.send({
			content: `<@!${hackathonTeam.members[0].id}> ${
				hackathonTeam.members[1] && `<@!${hackathonTeam.members[1].id}>`
			} <@&${roles.bhacksTeam}>`,
			embeds: [
				{
					title: 'Audit Reminder!',
					description: `The first audit for team "${hackathonTeam.name}" will begin in 5 minutes, at <t:${hackathonTeam.audits[0].epoch}:f>. Join the <#${channels.pool}> VC right away and we'll be with you shortly.`,
					footer: {
						text: 'Good luck!',
					},
					color: 'BLURPLE',
				},
			],
		});
	};
	const secondReminder = async () => {
		await channel.send({
			content: `<@!${hackathonTeam.members[0].id}> ${
				hackathonTeam.members[1] && `<@!${hackathonTeam.members[1].id}>`
			} <@&${roles.bhacksTeam}>`,
			embeds: [
				{
					title: 'Audit Reminder!',
					description: `The second audit for team "${hackathonTeam.name}" will begin in 5 minutes, at <t:${hackathonTeam.audits[1].epoch}:f>. Join the <#${channels.pool}> VC right away and we'll be with you shortly.`,
					footer: {
						text: 'Good luck!',
					},
					color: 'BLURPLE',
				},
			],
		});
	};
	const nowEpochSeconds = Date.now() / 1000;
	setTimeout(
		firstReminder,
		(hackathonTeam.audits[0].epoch - nowEpochSeconds - 5 * 60) * 1000
	);
	setTimeout(
		secondReminder,
		(hackathonTeam.audits[1].epoch - nowEpochSeconds - 5 * 60) * 1000
	);
}

export async function closing(client: Client, interaction: InteractionType) {
	try {
		// fetch the hackathon team
		const hackathonTeam = await prisma.hackathonTeam.findFirst({
			where: { creatorId: interaction.user.id },
			include: { audits: true, members: true },
		});

		// fetch the teammate
		const teammate = hackathonTeam.members.filter(
			(m) => m.id !== interaction.user.id
		)?.[0];
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

		const webhookOptions: string | MessagePayload | WebhookMessageOptions =
			{
				embeds: [
					{
						author: {
							name: 'Audit Scheduling',
							iconURL:
								'https://cdn.discordapp.com/attachments/944240553153945710/947210546850185226/builderhacks_winter_emoji.png',
						},
						fields: [
							{
								name: 'Team Name',
								value: hackathonTeam.name,
								inline: true,
							},
							{
								name: 'Team Members',
								value:
									hackathonTeam.members.length === 1
										? `<@${hackathonTeam.members[0].id}>`
										: `<@${hackathonTeam.members[0].id}> and <@${hackathonTeam.members[1].id}>`,
								inline: true,
							},
							{ name: '\u200B', value: '\u200B' },
							{
								name: 'Audit One Timing',
								value: `<t:${hackathonTeam.audits[0].epoch}:f>`,
								inline: true,
							},
							{
								name: 'Completed?',
								value: `${
									hackathonTeam.audits[0].completed || false
								}`,
								inline: true,
							},
							{ name: '\u200B', value: '\u200B' },
							{
								name: 'Audit Two Timing',
								value: `<t:${hackathonTeam.audits[1].epoch}:f>`,
								inline: true,
							},
							{
								name: 'Completed?',
								value: `${
									hackathonTeam.audits[1].completed || false
								}`,
								inline: true,
							},
						],
						footer: {
							text: `ID: ${hackathonTeam.id} | Name: ${hackathonTeam.name}`,
						},
					},
				],
			};

		// notify webhook client
		const postedWebhookMessage = await auditsWebhookClient.send(
			webhookOptions
		);

		// add the webhook posting id to the hackathon team
		await prisma.hackathonTeam.update({
			where: { id: hackathonTeam.id },
			data: { webhookPosting: postedWebhookMessage.id },
		});

		await interaction.channel.send({
			embeds: [
				{
					title: 'Thank you for participating in the Hackathon!',
					description: `
					Your response has been recorded. Please keep a close lookout for pings in the BuilderGroop Discord server so the Builderhacks team can convey important information to you.
				`,
					footer: {
						text: 'Good luck!',
					},
					color: 'BLURPLE',
				},
			],
		});
		await remindFiveMinutesBeforeAudit(client, interaction, hackathonTeam);
		return;
	} catch (err) {
		console.error(err);
		await interaction.channel.send('Internal Error ● ' + err);
	}
}
