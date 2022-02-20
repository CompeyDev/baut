import { MessageEmbed } from 'discord.js';

export const careerEmbed = new MessageEmbed()
	.setTitle('What do you do?')
	.setDescription('Choose what best defines your career.')
	.setColor('#535061')
	.setFooter({ text: 'Multi Select' });

export const experienceEmbed = new MessageEmbed()
	.setTitle('Choose your experience level')
	.setDescription(
		'How much experience do you have in your current career(s)/hobby(s) (i.e Developer, Designer, Entrepreneur, Creator)?'
	)
	.setColor('#535061')
	.setFooter({ text: 'Single Select' });

export const locationEmbed = new MessageEmbed()
	.setTitle('Where are you located?')
	.setDescription('Choose which continent you live in.')
	.setColor('#535061')
	.setFooter({ text: 'Single Select' });

export const notificationEmbed = new MessageEmbed()
	.setTitle('Select Ping Roles')
	.setDescription(
		'Choose which of the following you would like to be pinged for'
	)
	.setColor('#535061')
	.setFooter({ text: 'Multi Select' });

export const pronounsEmbed = new MessageEmbed()
	.setTitle('What are your pronouns?')
	.setDescription("Select your pronouns (Skip if you'd rather not disclose).")
	.setColor('#535061')
	.setFooter({ text: 'Single / Multi Select' });
