import { App, Editor, Notice, Modal, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { DynamoDbPluginSettings, DynamoDbYMLConfig } from './src/plugin.interfaces';

import { TableDetailsModal } from './src/TableDetailsModal';
import { DbSelectorModal } from './src/DbSelectorModal';
import { SetRegionModal } from './src/SetRegionModal';
import { generateTable, formatError } from './src/lib';

import {
	getDynamoDbTables,
	dynamoDBQuery,
	dynamoDBWithParams,
	getTableDetails
} from './aws/dynamodb';

const yaml = require('js-yaml');

const DEFAULT_SETTINGS: DynamoDbPluginSettings = {
	accessKeyId: '',
	secretAccessKey: '',
	region: 'us-east-1',
	limit: 100
}

const defaultRegion = 'us-east-1';

export default class DynamoDbPlugin extends Plugin {
	settings: DynamoDbPluginSettings;

	async getAwsCredentials() {
		const { accessKeyId, secretAccessKey } = this.settings;
		return { accessKeyId, secretAccessKey };
	}
	async awsRegionChoiceInvoke() {
		new SetRegionModal(this.app, (region) => {
			new Notice(`Set region in settings to ${region}`);
			this.settings.region = region;
			this.saveSettings();
		}).open();
	}
	async dbSelectorInvoke() {
		const tables = await getDynamoDbTables(this.settings.region, this.getAwsCredentials());
		if (!tables || !tables.TableNames || tables.TableNames.length === 0) {
			new Notice('No tables found in ' + this.settings.region);
			return;
		}
		const tablesObj: any = tables.TableNames.map((table: any) => ({ name: table, region: defaultRegion }));
		new DbSelectorModal(this.app, tablesObj, async (table: string) => {
			// new Notice(`Callback on ${table}`);
			const tableDetails: any = await getTableDetails(this.settings.region, this.getAwsCredentials(), table);
			new TableDetailsModal(this.app, tableDetails).open();
		}).open();
	}
	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('database', 'AWS DynamoDB', async (evt: MouseEvent) => {
			this.dbSelectorInvoke();
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('ribbonDbIcon');

		this.registerMarkdownCodeBlockProcessor("dynamodb", async (source, el, ctx) => {

			// parse the source as yml
			let config: DynamoDbYMLConfig;
			try {
				// convert all tabs in the source into two spaces
				config = yaml.load(source.replace(/\t/g, '  '));
				if (typeof config !== 'object') {
					throw new Error('config is not an object'); // error may occur here
				}
			} catch (error) {
				// show an errors caught here
				el.createEl('pre', formatError(error));
				return;
			}

			// get the query and the region from the options
			const { query, params, title }: any = config;

			const { accessKeyId, secretAccessKey, region } = this.settings;
			if (!accessKeyId || !secretAccessKey) {
				el.setText("Error: AWS credentials not set");
				el.addClass("error");
				return;
			}

			// either query or params must be set
			if (!query && !params) {
				el.setText("Error: query or params must be set");
				el.addClass("error");
				return;
			}

			if (title) {
				el.createEl('h5', { text: title, cls: 'dynamodbtable-title' });
			}

			if (query) {
				try {
					let result = await dynamoDBQuery(this.settings.region, await this.getAwsCredentials(), query);
					generateTable(el, result);
				} catch (error) {
					el.createEl('pre', formatError(error));
				}
			}

			if (params) {
				try {
					let result = await dynamoDBWithParams(this.settings.region, await this.getAwsCredentials(), params);
					generateTable(el, result);
				} catch (error) {
					el.createEl('pre', formatError(error));
				}
			}

		});

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'dynamodb-info-command',
			name: 'Search for a DynamoDB Table and get some info',
			callback: () => {
				this.dbSelectorInvoke();
			}
		});

		this.addCommand({
			id: 'dynamodb-set-region',
			name: 'Set the default region for AWS DynamoDB',
			callback: () => {
				this.awsRegionChoiceInvoke();
			}
		});


		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new DynamoDBSettingTab(this.app, this));

	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}



class DynamoDBSettingTab extends PluginSettingTab {
	plugin: DynamoDbPlugin;

	constructor(app: App, plugin: DynamoDbPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for AWS access' });

		new Setting(containerEl)
			.setName('AWS Profile')
			.setDesc('Your AWS Access ID and Secret Key')
			.addText(text => text
				.setPlaceholder('AWS Access ID')
				.setValue(this.plugin.settings.accessKeyId)
				.onChange(async (value) => {
					this.plugin.settings.accessKeyId = value;
					await this.plugin.saveSettings();
				}))
			.addText(text => text
				.setPlaceholder('AWS Secret Key')
				.setValue(this.plugin.settings.secretAccessKey)
				.onChange(async (value) => {
					this.plugin.settings.secretAccessKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('AWS Region')
			.setDesc('The region for AWS DynamoDB')
			.addText(text => text
				.setPlaceholder('us-east-1')
				.setValue(this.plugin.settings.region)
				.onChange(async (value) => {
					this.plugin.settings.region = value;
					await this.plugin.saveSettings();
				}))
	}
}
