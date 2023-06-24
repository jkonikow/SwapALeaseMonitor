import { 
    SESClient, 
    SendTemplatedEmailCommand, 
    SendTemplatedEmailCommandInput, 
    SendTemplatedEmailCommandOutput 
} from "@aws-sdk/client-ses"
import { 
    RECIPIENT_EMAIL, 
    SENDER_EMAIL, 
    SES_TEMPLATE_NAME, 
    SES_CONFIG } from "../environment/environment_module";
import { Listing } from "@jkonikow/swap-a-lease-client";
import { SwapALeaseMonitorProps } from "../monitor/SwapALeaseMonitor";

const UNSPECIFIED_CRITERIA: string = "not specified";

// TODO: Make this more generic rather than specific to SAL listings
export default class SesClientFacade {
    private client: SESClient;

    public constructor(client: SESClient) {
        this.client = client;
    }

    public async sendEmailNotification(newListings: Listing[], criteria: SwapALeaseMonitorProps): Promise<void> {
        const templateData: SwapALeaseMonitorNotificationData = this.buildTemplateData(newListings, criteria);
        const request: SendTemplatedEmailCommandInput = {
            Template: SES_TEMPLATE_NAME, 
            ConfigurationSetName: SES_CONFIG,
            Destination: {
                ToAddresses: [RECIPIENT_EMAIL]
            },
            Source: SENDER_EMAIL,
            TemplateData: JSON.stringify(templateData)
        };
        const command: SendTemplatedEmailCommand = new SendTemplatedEmailCommand(request);
        console.info(`Sending request to SES: ${request}`);
        try {
            const response: SendTemplatedEmailCommandOutput =  await this.client.send(new SendTemplatedEmailCommand(request));
            console.info(`Notification sent with SES messageId: ${response.MessageId}`);
        } catch (e) {
            const msg: string = e instanceof Error 
            ? `${e.name} failure calling SES: ${e.message}`
            : `Unknown failure calling SES`; 
            console.error(msg);
            throw new Error(msg);
        }
    }

    private buildTemplateData(listings: Listing[], criteria: SwapALeaseMonitorProps): SwapALeaseMonitorNotificationData {
        const listingsForNotification = listings.map(listing => {
            return {
                title: listing.getTitle(),
                imgUrl: listing.getImageUrl(),
                listingUrl: listing.getListingUrl(),
                costPerMonth: listing.getCostPerMonth(),
                milesRemaining: listing.getMilesPerMonth(),
                location: listing.getLocation(),
                monthsRemaining: listing.getMonthsRemaining()
            };
        });
        
        return {
            monitorName: criteria.monitorName,
            listingCount: listings.length.toString(),
            zip: criteria.zip,
            milesFromZip: criteria.radiusMiles ?? UNSPECIFIED_CRITERIA,
            maxMonthsRemaining: criteria.maxMonthsRemaining ?? UNSPECIFIED_CRITERIA,
            maxPayment: criteria.maxLeasePayment ?? UNSPECIFIED_CRITERIA,
            minMilesRemaining: criteria.minMilesPerMonth ?? UNSPECIFIED_CRITERIA,
            listings: listingsForNotification
        };
    }

    
}

// Note that the property names here are defined by the variable names in the html template and must match them
type SwapALeaseMonitorNotificationData = {
    monitorName: string,
    listingCount: string,
    zip: string, 
    milesFromZip: string, 
    maxMonthsRemaining: string,
    maxPayment: string,
    minMilesRemaining: string, 
    listings: {
        title: string, 
        imgUrl: string, 
        listingUrl: string, 
        costPerMonth: string,
        milesRemaining: string, 
        location: string, 
        monthsRemaining: string
    }[]
};