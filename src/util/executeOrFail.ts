/**
 * Runs a block of code and throws an error if it fails
 * @param cb Function to run
 * @param message Error message to throw in case the function fails
 * @returns Returns the result of the cb function or throws an API error
 */

export async function executeOrFail<T>(
	cb: () => T | Promise<T>,
	errorHandler: () => any
) {
	try {
		return await cb();
	} catch (err) {
		console.error(err);
		await errorHandler();
		throw new Error('Internal Error');
	}
}
