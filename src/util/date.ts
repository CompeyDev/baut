export const isDateInPast = (firstDate: Date, secondDate: Date) =>
	firstDate.setHours(0, 0, 0, 0) <= secondDate.setHours(0, 0, 0, 0);
