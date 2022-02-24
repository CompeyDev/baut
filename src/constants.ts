import { EmbedMessages } from './types';

export const env = process.env;
export const isProd = env.NODE_ENV === 'production';
export const token = process.env.DISCORD_TOKEN;
export const webhook = process.env.MEMBERS_WEBHOOK;
export const bhs1RegistrationForm = '';

export const embedMessages: EmbedMessages = {
	rules: `
    Please read the following rules prior to interacting in the server.
    
    • Keep all messages and content SFW
    • Harassment and Hate Speech is prohibited
    • Do not share pirated/crack software and content
    • Discussing sensitive topics (civics, religion, health) or is frowned upon
    • No Spamming
    • No Doxxing
    • Send malicious links or viruses is prohibited
    • Refrain from using any language except English
    • Asking moderators for leniency in punishment is strictly disallowed
    • Use common sense
    • Follow Discord’s Terms of Service.
    
    The rules mentioned here only exist for the safety of members like you. They are subject to change at any time. Not being aware of the present list of rules is not a valid excuse to be protected from consequences.
    `,

	thankYou: `
    Thank you for joining us. Whether you're a rookie, or a professional, or somewhere in between, Buildergroop is the place for you.

    We wish to empower all the young developers, designers, entrepreneurs, community builders, and other awesome individuals out there that want to change the world.

    If you'd like to support our mission, you can send out this permanent invite link to anyone that might find Buildergroop interesting: https://discord.gg/builders

    Let's get this thing around the globe. It's time to make an impact.
`,
};

export const media = {
	rulesHeaderImage:
		'https://media.discordapp.net/attachments/878195994293075968/939537089882620044/unknown.png?width=961&height=244',
	rolesHeaderImage:
		'https://media.discordapp.net/attachments/878195994293075968/939537090234966096/unknown.png?width=961&height=244',
};
