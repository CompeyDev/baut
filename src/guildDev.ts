/*
This file houses information such as ID's of specific entities (e.g roles, channels, etc) and other such information that is used throughout the bot. 
DEV VARIABLES!!
*/

export const rolesDev = {
	// Career
	career: [
		'', // programming
		'', // design
		'', // entrepreneurship
		'', // web3
		'', // finance
		'', // social media
		'', // creatorship
		'', // community building
	],

	// Pronouns
	pronouns: {
		he: '',
		she: '',
		they: '',
		ask: '',
	},

	// Location
	location: {
		north_america: '',
		south_america: '',
		europe: '',
		oceania: '',
		asia: '',
		africa: '',
		antartica: '',
	},

	// Experience
	experience: {
		'1-2': '',
		'3-5': '',
		'6-8': '',
		'9+': '',
	},

	// Notifications
	notifications: {
		event_ping: '',
		inactivity_ping: '',
		assistance_ping: '',
		poll_ping: '',
		announcement_ping: '',
	},
	eligible: '',
	not_eligible: '',
	before1k: '',
	onethousandthmember: '',
	member: '',
} as const;

export const channelsDev = {
	chat: '944240553153945710',

	wins: '944306109945118741',
	help: '944306163443441746',
	resources: '944306124595798057',
	jobs: '944306172968718377',
	showcase: '944306186398871552',
};

export const emojis = {
	arrow: '<:arrow:944594435172364328>',
};
