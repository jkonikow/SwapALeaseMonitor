import { 
S3Client, 
GetObjectCommand, 
GetObjectCommandInput,
GetObjectCommandOutput,
PutObjectCommand,
PutObjectCommandInput
} from "@aws-sdk/client-s3";
import { Readable } from 'stream'

export default class S3ClientFacade {
    private readonly s3Client: S3Client;

    constructor(s3Client: S3Client) {
        this.s3Client = s3Client;
    }

    public async getObject(key: string, bucket: string): Promise<string> {
        const input: GetObjectCommandInput = {
           Bucket: bucket,
           Key: key
        };
        const command: GetObjectCommand = new GetObjectCommand(input);
        try {
            console.info(`Requesting object ${key} from s3`);
            const response: GetObjectCommandOutput = await this.s3Client.send(command);
            const buffer: Buffer = await this.parseGetObjectResponse(response);
            return buffer.toString('utf-8');
        } catch (e) {
            const msg: string = e instanceof Error 
                ? `${e.name} failure fetching ${key} from s3 bucket ${bucket}: ${e.message}`
                : `Unknown failure fetching ${key} from s3 bucket ${bucket}`; 
            console.error(msg);
            throw e;
        }
    }

    public putObject(key: string, bucket: string, data: string): void {
        const input: PutObjectCommandInput = {
            Key: key,
            Bucket: bucket,
            Body: data
        };
        const command: PutObjectCommand = new PutObjectCommand(input);
        try {
            console.info(`Saving object ${key} to s3 bucket ${bucket}`);
            this.s3Client.send(command);
        } catch(e) {
            const msg: string = e instanceof Error 
                ? `${e.name} failure saving ${key} to s3 bucket ${bucket}: ${e.message}`
                : `Unknown failure saving ${key} to s3 bucket ${bucket}`; 
            console.error(msg);
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
