import { 
S3Client, 
GetObjectCommand, 
GetObjectCommandInput,
GetObjectCommandOutput 
} from "@aws-sdk/client-s3";
import { Readable } from 'stream'

export default class S3ClientFacade {
    private readonly s3Client: S3Client;

    constructor(s3Client: S3Client) {
        this.s3Client = s3Client;
    }

    public async getObject(key: string): Promise<void> {
        const input: GetObjectCommandInput = {
           Bucket: process.env.LISTINGS_S3_BUCKET_NAME,
           Key: key
        };
        const command: GetObjectCommand = new GetObjectCommand(input);
        try {
            console.info(`Requesting object ${key} from s3`);
            const response: GetObjectCommandOutput = await this.s3Client.send(command);
            const buffer: Buffer = await this.parseGetObjectResponse(response);
            console.log(buffer.toString('utf-8'));
        } catch (e) {
            if (e instanceof Error) {
                console.log(`${e.name} calling s3: ${e.message}`);
            } 
            throw e;
        }
    }

    private parseGetObjectResponse(response: GetObjectCommandOutput): Promise<Buffer> {
        if(! response.Body) {
            throw new Error("GetObjectResponse contained no body");
        }
        
        const stream = response.Body as Readable;
        return new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = []
            stream.on('data', chunk => chunks.push(chunk))
            stream.once('end', () => resolve(Buffer.concat(chunks)))
            stream.once('error', reject)
        })
    }
}
