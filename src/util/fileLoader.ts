import { Mammot } from '@mammot/core';
import { PathLike } from 'fs';
import { readdir } from 'fs/promises';
import { resolve, basename } from 'path';

import Component from '../structures/Component';

/**
 * Recursively load files
 * @param {string} dir The root dir
 */
export default async function* fileloader(dir: string) {
	const files = await readdir(dir, { withFileTypes: true });

	for (const file of files) {
		const res: PathLike = resolve(dir, file.name);

		if (file.isDirectory()) {
			yield* fileloader(res);
		} else {
			yield res;
		}
	}
}

/**
 * Load events from the events dir
 * @param {Client} client The Discord client
 * @param {string} dir The dir containing the event files
 */
export async function loadEvents(mammot: Mammot, dir: string) {
	const files = fileloader(dir);

	for await (const file of files) {
		const importedFile = await import(file);
		const event = importedFile.default || importedFile;

		if (event.once) {
			mammot.client.once(event.name, (...args) =>
				event.execute(mammot, ...args)
			);
		} else {
			mammot.client.on(event.name, (...args) =>
				event.execute(mammot, ...args)
			);
		}

		console.log(`Loaded event ${event.name}`);
	}
}

/**
 * Load all of the components recursively
 * @param {Client} client The Discord client
 * @param {string} dir The root components directory
 */
export async function loadComponents(
	client: Mammot,
	dir: string
): Promise<void> {
	const files = fileloader(dir);

	for await (const file of files) {
		const importedFile = await import(file);
		const component = importedFile.default || importedFile;

		if (!(component instanceof Component)) continue;

		if (!component.id) {
			console.error(
				`Failed to load component ${basename(file)} as it has no id`
			);
			continue;
		}

		// @ts-expect-error yeah
		client.components.set(component.id, component);
		console.log(`Loaded component ${component.id}`);
	}
}
