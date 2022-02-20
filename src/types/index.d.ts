import { Mammot } from '@mammot/core';
import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	ApplicationCommandPermissionData,
	MessageComponentInteraction,
	SelectMenuInteraction,
	ButtonInteraction,
} from 'discord.js';
import Client from '../structures/Client.js';

export interface CommandOptions extends ChatInputApplicationCommandData {
	permissions?: ApplicationCommandPermissionData[];
}

export type CommandFunction = (
	client?: Client,
	interaction: CommandInteraction
) => void | Promise<void>;

export type EventFunction = (client?: Mammot, ...args) => void | Promise<void>;

export type ComponentFunction = (
	client?: Client,
	interaction:
		| MessageComponentInteraction
		| SelectMenuInteraction
		| ButtonInteraction
) => void | Promise<void>;

export interface EmbedMessages {
	rules: string;
	thankYou: string;
}
