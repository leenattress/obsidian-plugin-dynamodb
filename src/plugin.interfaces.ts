export interface DynamoDbPluginSettings {
	accessKeyId: string;
	secretAccessKey: string;
    region: string;
    limit: number;
}

export interface DynamoDbYMLConfig {
	region: string;
	query: string;
	params: object;
	title: string;
	columns: string[];
}