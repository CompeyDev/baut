import { ClientEvents } from 'discord.js';
import { EventFunction } from '../types';

export default class {
	public name: keyof ClientEvents;
	public once?: boolean;

	constructor(
		private options: { name: keyof ClientEvents; once?: boolean },
		public execute: EventFunction
	) {
		this.name = options.name;
		this.once = options.once;
	}
}
