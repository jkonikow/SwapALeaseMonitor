const REGION_KEY: string = "AWS_REGION";
const SENDER_EMAIL_KEY: string = "SENDER_EMAIL";
const RECIPIENT_EMAIL_KEY: string = "RECIPIENT_EMAIL";
const SES_TEMPLATE_KEY: string = "SES_TEMPLATE_NAME";
const SES_CONFIG_KEY: string = "SES_CONFIG";

const envVarKeys: string[] = [
    REGION_KEY,
    SENDER_EMAIL_KEY,
    RECIPIENT_EMAIL_KEY,
    SES_TEMPLATE_KEY,
    SES_CONFIG_KEY
];

const environment: Record<string, string> = {};
envVarKeys.forEach(key => {
    if (!process.env[key]) {
        throw new Error(`Missing environment variable for ${key}`);
    }
    environment[key] = process.env[key]!;
});

export const {
    [REGION_KEY]: AWS_REGION,
    [SENDER_EMAIL_KEY]: SENDER_EMAIL,
    [RECIPIENT_EMAIL_KEY]: RECIPIENT_EMAIL,
    [SES_TEMPLATE_KEY]: SES_TEMPLATE_NAME,
    [SES_CONFIG_KEY]: SES_CONFIG
} = environment;
