export function snakeToCamel(str: string): string {
	return str.replace(/(?!^)_(.)/g, (_, char) => char.toUpperCase());
}

export function getInitials(input: string): string {
	return input
		.split(' ')
		.map((w) => w[0])
		.join('');
}
