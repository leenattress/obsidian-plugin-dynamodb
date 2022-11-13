import {
    DynamoDBClient,
    ExecuteStatementCommand,
    ExecuteStatementInput,
    QueryCommand,
    ListTablesCommand,
    DescribeTableCommand
} from "@aws-sdk/client-dynamodb";

export const getClient = async (region: string, credentials: any) => {
    return new DynamoDBClient({ region, credentials });
}

export const getDynamoDbTables = async (region: string, credentials: any) => {
    const client = await getClient(region, credentials);
    return await client.send(new ListTablesCommand({}));
}

export const dynamoDBQuery = async (region: string, credentials: any, query: string) => {
    const client = await getClient(region, credentials);
    let params: ExecuteStatementInput = {
        Statement: query,
    };
    return await client.send(new ExecuteStatementCommand(params));
}

export const dynamoDBWithParams = async (region: string, credentials: any, params: any) => {
    const client = await getClient(region, credentials);
    return await client.send(new QueryCommand(params));
}

// get the details for a table given its name
export const getTableDetails = async (region: string, credentials: any, tableName: string) => {
    const client = await getClient(region, credentials);
    return await client.send(new DescribeTableCommand({ TableName: tableName }));
}