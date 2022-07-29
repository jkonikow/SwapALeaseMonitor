import { 
    DynamoDBClient,
    GetItemCommand, 
    GetItemCommandInput, 
    PutItemCommand,
    PutItemCommandInput,
} from "@aws-sdk/client-dynamodb";

const LISTINGS_TABLE_NAME: string = "SwapALeaseListingsTable";

// TODO: look into using a mapper
export class ListingsTableDao {
    private readonly ddbClient: DynamoDBClient;

    constructor(ddbClient: DynamoDBClient) {
        this.ddbClient = ddbClient;
    }

    public async getListings(make: string): Promise<string> {
        console.info(`Fetching listings for make: ${make} from listings table`);

        const request: GetItemCommandInput = {
            TableName: LISTINGS_TABLE_NAME,
            Key: {make: {S: make}}
        }
       
        try {
            const { Item } = await this.ddbClient.send(new GetItemCommand(request));
            if (Item === undefined) {
                console.warn(`No previous listings found for ${make}`);
                return [].toString();
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

    public async putListings(make: string, listingsJson: string): Promise<void> {
        console.info(`Saving listings for make: ${make} to table: ${listingsJson}`);

        const request: PutItemCommandInput = {
            TableName: LISTINGS_TABLE_NAME,
            Item: {
                make: {S: make},
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