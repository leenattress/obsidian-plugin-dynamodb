export const formatError = (error: any) => {
	const { message, name } = error;
	return { text: JSON.stringify({ message, name }, null, 2), cls: 'dynamodbtable-error' }
};

export const generateTable = (el: any, result: any) => {
	const table = el.createEl('table');
	// add 'wide-table' class to the table
	table.addClass('dynamodbtable__wide');
	// create the header row
	const headerRow = table.createEl('tr');

	// for each item in the first row of the results
	if (result.Items && result.Items.length > 0) {
		for (const key in result.Items[0]) {
			// create a header cell and set the text to the key
			headerRow.createEl('th', { text: key, cls: 'dynamodbtable__header' });
		}
		// for each row in the results
		for (const row of result.Items) {
			// create a row
			const tableRow = table.createEl('tr');
			// for each item in the row
			for (const key in row) {
				// create a cell and set the text to the value
				tableRow.createEl('td', { text: row[key].S });
			}
		}
	}
};