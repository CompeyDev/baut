import 'dotenv/config';
import { Mammot } from '@mammot/core';
import {
	RulesCommand,
	PingCommand,
	IntroCommand,
	RolesCommand,
	Before1kmembers,
} from './cmds';
import { clientOptions } from './config';
import { token } from './constants';
import { loadComponents, loadEvents } from './util/fileLoader';
import { Collection, TextChannel, User } from 'discord.js';
import { schedule } from 'node-cron';
import messages from './messages';
import { channels } from './guild';

export const mammot = Mammot.client({
	...clientOptions,
});

async function boot() {
	// @ts-expect-error
	mammot.components = new Collection();
	await loadComponents(mammot, 'src/comps');
	mammot.addCommands([
		RulesCommand,
		PingCommand,
		IntroCommand,
		RolesCommand,
		Before1kmembers,
	]);
	await loadEvents(mammot, 'src/events');
	mammot.name;
}

boot().then(() =>
	mammot.login(token).then(() => {
		schedule('* * * * *', async () => {
			const authors = new Set<User>();
			[...messages].map((message) => authors.add(message.author));
			const uniqueUsers = authors.size;
			const uniqueMessages = messages.size;
			console.log(
				`${uniqueMessages} message${
					uniqueMessages === 1 ? '' : 's'
				} were sent by ${uniqueUsers} user${
					uniqueUsers === 1 ? '' : 's'
				}.`
			);
			const channel = mammot.client.channels.cache.get(
				channels.chat
			) as TextChannel;
			messages.clear();
			const MPM = uniqueMessages / uniqueUsers;
			console.log(`MPM: ${MPM}`);
			if (MPM >= 6) {
				const result = uniqueMessages / MPM / 2.5;
				const slowmode = Number(result.toString().split('.')[0]);
				console.log(
					`Setting slowmode to ${slowmode} second${
						slowmode === 1 ? '' : 's'
					}.`
				);
				channel.setRateLimitPerUser(slowmode);
			} else {
				channel.setRateLimitPerUser(0);
			}
		});
	})
);
