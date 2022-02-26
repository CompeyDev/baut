import {
	Client,
	Message,
	MessageActionRow,
	MessageButton,
	MessagePayload,
	WebhookMessageOptions,
} from 'discord.js';
import { InteractionType } from '../types';
import { prisma } from '../providers/prisma';
import { auditsWebhookClient } from '../webhookClients';

export async function scheduleAudits(message: Message) {
	try {
		// make sure they dont exist yet
		const doesUserExist = await prisma.participant.findFirst({
			where: { id: message.author.id },
		});

		if (doesUserExist) {
			await message.channel.send(
				`<@${message.author.id}> you have already started the audit scheduling process. Please contact an admin if there are any issues.`
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
					title: 'Enter at what time you would like to have your first and second audit using comma seperated epoch timestamps.',
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
			interaction.channel.send(
				'Invalid Epoch Timestamps Given. Re-Asking Question.'
			);
			await proposeAuditTimings(client, interaction);
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
	} catch (err) {
		console.error(err);
		await interaction.channel.send('Internal Error ● ' + err);
	}
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
								name: 'Audit One Conductor',
								value: `${
									hackathonTeam.audits[0].conductor ||
									'None Yet'
								}`,
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
								name: 'Audit Two Conductor',
								value: `${
									hackathonTeam.audits[0].conductor ||
									'None Yet'
								}`,
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
				components: [
					new MessageActionRow().addComponents(
						new MessageButton()
							.setLabel(`Conduct Audit One`)
							.setStyle('SECONDARY')
							.setCustomId('conductAuditOne'),
						new MessageButton()
							.setLabel(`Conduct Audit Two`)
							.setStyle('SECONDARY')
							.setCustomId('conductAuditTwo')
					),
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

		const conductAuditInteractionCollector = async (
			filter: (arg0: InteractionType) => boolean,
			auditVersion: 'first' | 'second'
		) => {
			// collector
			const collector =
				interaction.channel.createMessageComponentCollector({
					filter,
					componentType: 'BUTTON',
					max: 1,
				});

			collector.on('collect', async (i) => {
				// put this admins ID into the audit conductor
				const hackathonAudit = await prisma.hackathonAudit.update({
					where: {
						id: hackathonTeam.audits[
							auditVersion === 'first' ? 0 : 1
						].id,
					},
					data: { conductor: i.user.id },
				});

				// update the webhook with new information
				await auditsWebhookClient.editMessage(
					hackathonTeam.webhookPosting,
					webhookOptions
				);

				// message the team members
				hackathonTeam.members.forEach(async (member) => {
					const user = await client.users.fetch(member.id);
					console.log(user);
					await user.dmChannel.send({
						embeds: [
							{
								title: 'Audit One Confirmation',
								description: `Your ${auditVersion} audit will be conducted by <@${i.user.id}> at <t:${hackathonAudit.epoch}:f>. We will notify you and your teammate via direct message 5 minutes prior to the audit. If by any chance you are not able to make it, you must talk to an admin and reschedule.`,
								footer: {
									text: 'Good Luck! - Buildergroop Team',
								},
							},
						],
					});
				});
			});
		};

		// filters
		const filterOne = (i: InteractionType) =>
			i.customId === 'conductAuditOne';
		const filterTwo = (i: InteractionType) =>
			i.customId === 'conductAuditTwo';

		await conductAuditInteractionCollector(filterOne, 'first');
		await conductAuditInteractionCollector(filterTwo, 'second');

		await interaction.channel.send({
			embeds: [
				{
					title: 'Thank you for participating in the Hackathon!',
					description: `
					Your response has been recorded. You will be notified shortly when an audit conducter is assigned to your audits. Please keep a close lookout for pings in the BuilderGroop Discord server as well as DMs between you and I, so the BuilderGroop team can convey important information to you.
				`,
					footer: {
						text: 'Good luck!',
					},
					color: 'BLURPLE',
				},
			],
		});
		return;
	} catch (err) {
		console.error(err);
		await interaction.channel.send('Internal Error ● ' + err);
	}
}
