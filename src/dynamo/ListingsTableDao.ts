import { 
    DynamoDBClient,
    GetItemCommand, 
    GetItemCommandInput, 
    PutItemCommand,
    PutItemCommandInput,
} from "@aws-sdk/client-dynamodb";

const LISTINGS_TABLE_NAME: string = "SwapALeaseListingsTable";

// TODO: look into using a mapper
export default class ListingsTableDao {
    private readonly ddbClient: DynamoDBClient;

    constructor(ddbClient: DynamoDBClient) {
        this.ddbClient = ddbClient;
    }

    public async getListings(key: string): Promise<string> {
        console.info(`Fetching listings for monitor: ${key} from listings table`);

        const request: GetItemCommandInput = {
            TableName: LISTINGS_TABLE_NAME,
            Key: {monitorInstanceName: {S: key}}
        }
       
        try {
            const { Item } = await this.ddbClient.send(new GetItemCommand(request));
            if (Item === undefined) {
                console.warn(`No previous listings found for monitor: ${key}`);
                // TODO: best practice for returning empty array json
                return "[]";
            }
            const listingsJson: string = Item.listings.S!;
            console.info(`Succesfully fetched listings: ${listingsJson}`);

            return listingsJson;
        } catch (e) {
            const msg: string = e instanceof Error 
                ? `${e.name} Failure fetching listings from DynamoDb: ${e.message}`
                : `Failure fetching listings from DynamoDb: ${e}`;
            console.error(msg);
            throw new Error(msg); 
        }
    }

    public async putListings(key: string, listingsJson: string): Promise<void> {
        console.info(`Saving listings for monitor: ${key} to table: ${listingsJson}`);

        const request: PutItemCommandInput = {
            TableName: LISTINGS_TABLE_NAME,
            Item: {
                monitorInstanceName: {S: key},
                listings: {S: listingsJson}
            }
        };
        
        try {
            this.ddbClient.send(new PutItemCommand(request));
        } catch (e) {
            const msg: string = e instanceof Error 
                ? `${e.name} Failure saving listings to DynamoDb: ${e.message}`
                : `Failure saving listings to DynamoDb: ${e}`;
            console.error(msg);
            throw new Error(msg); 
        }
    }
}