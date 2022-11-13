import { App, SuggestModal } from "obsidian";

interface Table {
    name: string;
    region: string;
}
type Callback = (table: string) => void;

export class DbSelectorModal extends SuggestModal<Table> {

	tables: any;
    callback: Callback;
	constructor(app: App, tables: any, callback: Callback) {
		super(app);
		this.tables = tables;
        this.callback = callback;
	}    
    // Returns all available suggestions.
    getSuggestions(query: string): Table[] {
        return this.tables.filter((table: Table) =>
            table.name.toLowerCase().includes(query.toLowerCase())
        );
    }

    // Renders each suggestion item.
    renderSuggestion(table: Table, el: HTMLElement) {
        el.createEl("div", { text: table.name });
        el.createEl("small", { text: table.region });
    }

    // Perform action on the selected suggestion.
    onChooseSuggestion(table: Table, evt: MouseEvent | KeyboardEvent) {
        this.callback(table.name);
        // new Notice(`Selected ${table.name}`);
    }
}