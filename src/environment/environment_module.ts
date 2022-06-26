const BUCKET_NAME_KEY: string  = "LISTINGS_S3_BUCKET_NAME";
const REGION_KEY: string = "AWS_REGION";
const OBJECT_KEY: string = "LISTINGS_OBJECT";

const environment: Record<string, string> = {};
[BUCKET_NAME_KEY, REGION_KEY, OBJECT_KEY].forEach(key => {
    if (!process.env[key]) {
        throw new Error(`Missing environment variable for ${key}`);
    }
    environment[key] = process.env[key]!;
});

export const {
    [BUCKET_NAME_KEY]: LISTINGS_S3_BUCKET_NAME,
    [REGION_KEY]: AWS_REGION,
    [OBJECT_KEY]: LISTINGS_OBJECT
} = environment;
