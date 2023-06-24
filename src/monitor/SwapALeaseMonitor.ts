import { SwapALeaseClient, GetListingsRequest, GetListingsResponse, Listing } from "@jkonikow/swap-a-lease-client";
import ListingManager from "./ListingManager";
import SesClientFacade from "../ses/SesClientFacade";

export default class SwapALeaseMonitor {
    private readonly salClient: SwapALeaseClient; 
    private readonly listingManager: ListingManager;
    private readonly sesClient: SesClientFacade;
    

    public constructor(salClient: SwapALeaseClient, listingManager: ListingManager, sesClient: SesClientFacade) {
        this.salClient = salClient;
        this.listingManager = listingManager;
        this.sesClient = sesClient;
    }

    public async monitor(props: SwapALeaseMonitorProps): Promise<void> {
        const preferredMakes: string[] = props.preferredMakes;
        const name: string = props.monitorName;

        const request: GetListingsRequest = GetListingsRequest.builder()
            .withMaxDistanceFromZip(props.radiusMiles ?? '150')
            .withMinMilesPerMonth(props.minMilesPerMonth ?? '500')
            .withMaxMonthsRemaining(props.maxMonthsRemaining ?? '30')
            .withMaxPricePerMonth(props.maxLeasePayment ?? '1000')
            .withZip(props.zip)
            .withPreferredMakes(preferredMakes)
            .build();
        console.info(`running monitor ${name} with criteria: ${JSON.stringify(request)}`)
        const listingsResponse: GetListingsResponse = await this.salClient.getListings(request);
        const knownListings: Listing[] = await this.listingManager.getKnownListings(name);
        const newListings: Listing[] = this.extractNewListings(knownListings, listingsResponse.getListings());

        console.info(`Found ${newListings.length} new listings: ${newListings}`);
        if (newListings.length > 0) {
            this.sesClient.sendEmailNotification(newListings, props);
            this.listingManager.updateKnownListings(name, [...newListings, ...knownListings]);
        }
    }

    /**
     * Extracts the listings that the monitor has not encountered previously which would mean these are new listings
     * that the end user should be alerted to
     *
     * @param knownListings: listings the monitor has seen previously and reported already
     * @param fetchedListings: most recent batch of listings fetched from SwapALease
     */
    private extractNewListings(knownListings: Listing[], fetchedListings: Listing[]): Listing[] {
        const newListings: Listing[] = [];
        for (const candidate of fetchedListings) {
            if (knownListings.every(listing => listing.getListingUrl() !== candidate.getListingUrl())) {
                newListings.push(candidate);
            }
        }

        return newListings;
    }
}

export type SwapALeaseMonitorProps = {
    zip: string,
    monitorName: string,
    preferredMakes: string[],
    minMilesPerMonth?: string,
    maxMonthsRemaining?: string, 
    maxLeasePayment?: string, 
    radiusMiles?: string,
}