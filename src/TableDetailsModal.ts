import { App, Modal } from "obsidian";

export class TableDetailsModal extends Modal {
    table: any;
    constructor(app: App, table: any) {
        super(app);
        this.table = table.Table;
    }

    onOpen() {
        const { contentEl } = this;

        // the title
        contentEl.createEl('h1', { text: this.table.TableName });

        // the table arn, in small monospaced text
        contentEl.createEl('h4', { text: 'Table Arn:' });
        contentEl.createEl('p', { text: this.table.TableArn });

        // ItemCount
        contentEl.createEl('h4', { text: 'Item Count:' });
        contentEl.createEl('p', { text: this.table.ItemCount });

        // the table size in kb or mb
        const tableSizeInKb = this.table.TableSizeBytes / 1024;
        contentEl.createEl('h4', { text: 'Table Size:' });
        if (tableSizeInKb < 1024) {
            contentEl.createEl('p', { text: tableSizeInKb.toFixed(2) + ' kb' });
        } else {
            // otherwise, show it in mb
            const tableSizeInMb = tableSizeInKb / 1024;
            contentEl.createEl('p', { text: tableSizeInMb.toFixed(2) + ' mb' });
        }

        // the table attributes
        const attributes = this.table.AttributeDefinitions;
        // create an unordered list
        contentEl.createEl('h4', { text: 'Attributes' });
        const ul = contentEl.createEl('ul');
        attributes.forEach((attribute: any) => {
            const { AttributeName, AttributeType } = attribute;
            ul.createEl("li", { text: `${AttributeName} - ${AttributeType}` });
        });

        // KeySchema
        const keySchema = this.table.KeySchema;
        contentEl.createEl('h4', { text: 'Key Schema' });
        const ul2 = contentEl.createEl('ul');
        keySchema.forEach((key: any) => {
            const { AttributeName, KeyType } = key;
            ul2.createEl("li", { text: `${AttributeName} - ${KeyType}` });
        });

        // if GlobalSecondaryIndexes exist, show them
        if (this.table.GlobalSecondaryIndexes) {
            const gsi = this.table.GlobalSecondaryIndexes;
            contentEl.createEl('h4', { text: 'Global Secondary Indexes' });
            const ul3 = contentEl.createEl('ul');
            gsi.forEach((index: any) => {
                const { IndexName, KeySchema, Projection } = index;
                ul3.createEl("li", { text: `${IndexName} - ${KeySchema} - ${Projection}` });
            });
        }

        // same for LocalSecondaryIndexes
        if (this.table.LocalSecondaryIndexes) {
            const lsi = this.table.LocalSecondaryIndexes;
            contentEl.createEl('h4', { text: 'Local Secondary Indexes' });
            const ul4 = contentEl.createEl('ul');
            lsi.forEach((index: any) => {
                const { IndexName, KeySchema, Projection } = index;
                ul4.createEl("li", { text: `${IndexName} - ${KeySchema} - ${Projection}` });
            });
        }

        // contentEl.createEl('pre', { text: JSON.stringify(this.table, null, 2) });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}