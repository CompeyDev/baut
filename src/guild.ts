/*
This file houses information such as ID's of specific entities (e.g roles, channels, etc) and other such information that is used throughout the bot. 
PRODUCTION VARIABLES!!
*/

export const roles = {
	// Career
	career: [
		'913789663767040001', // programming
		'913791003633266729', // design
		'913791069378990100', // entrepreneurship
		'933713452285960213', // web3
		'933713354730659920', // finance
		'933712617573335051', // social media
		'913791371163336744', // creatorship
		'933983446798336020', // community building
	],

	// Pronouns
	pronouns: {
		he: '914059764542095360',
		she: '914059977382043699',
		they: '914060117371125770',
		ask: '929317868720488459',
	},

	// Location
	location: {
		north_america: '914062801331453952',
		south_america: '914062822491693076',
		europe: '914062876480794634',
		oceania: '914062934479605760',
		asia: '914062611618889798',
		africa: '914062909162803260',
		antartica: '914063088960036915',
	},

	// Experience
	experience: {
		'1-2': '913788809882251285',
		'3-5': '914060415997210644',
		'6-8': '914060591491063808',
		'9+': '914061049949458462',
	},

	// Notifications
	notifications: {
		event_ping: '929265782226042890',
		inactivity_ping: '913788985036382268',
		assistance_ping: '913789046092886037',
		poll_ping: '913789194395074601',
		announcement_ping: '913789232311599128',
	},
	eligible: '913766127451136002',
	not_eligible: '920144177818390649',
	before1k: '939430231993876500',
	onethousandthmember: '939455950920769597',
	member: '913703107660230656',
} as const;

export const channels = {
	about: '913669662649237564',
	intros: '913701412578418718',
	rules: '913669662649237564',
	roles: '934094517525676042',
	chat: '913668807015407649',

	wins: '928628912282554398',
	help: '926837221322022923',
	resources: '913768563792297994',
	jobs: '913742362344300544',
	showcase: '913758897414762507',
};
