import { SwapALeaseClient, GetListingsRequest, GetListingsResponse, Listing } from "@jkon1513/swap-a-lease-client";
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
        const request: GetListingsRequest = GetListingsRequest.builder()
                                                .withMaxDistanceFromZip(props.radiusMiles ?? '150')
                                                .withMinMilesPerMonth(props.minMilesPerMonth ?? '500')
                                                .withMaxMonthsRemaining(props.maxMonthsRemaining ?? '30')
                                                .withMaxPricePerMonth(props.maxLeasePayment ?? '1000')
                                                .withZip(props.zip)
                                                .build();
        const listingsResponse: GetListingsResponse = await this.salClient.getListings(request);
        const knownListings: Listing[] = await this.listingManager.getKnownListings();
        const newListings: Listing[] = this.extractNewListings(knownListings, listingsResponse.getListings());
        
        console.info(`Found ${newListings.length} new listings`);
        if(newListings.length > 0) {
            this.listingManager.updateKnownListings(listingsResponse.getListings());
            this.sesClient.sendEmailNotification(newListings, props);
        }
    }

    /**
     *  Listings are fetched from SAL in sorted order with newest appearing first. 
     *  Given the above we will consider that we have new listings if 
     *      [A] we have a listing in the candidate list that is not in the known list 
     *      [B] the new listing is at an index before any known listings in the candidate list
     *
     *  TODO: handle edge case where entire page of new listings gets removed from search results. 
     * This would pull listings from subsequent pages to the front and appear as new listings 
     * 
     */
    private extractNewListings(knownListings: Listing[], fetchedListings: Listing[]): Listing[] {
        const newListings: Listing[] = [];
        let encounteredKnownListing = false;
        for(let i = 0; i < fetchedListings.length && !encounteredKnownListing; i++) {
            const candidate: Listing = fetchedListings[i];

            for(let knownListing of knownListings) {
                if(candidate.equals(knownListing)) {
                    encounteredKnownListing = true;
                    break;
                }
            }

            if(!encounteredKnownListing) {
                newListings.push(candidate);
            }
        } 

        return newListings;
    }
}


export type SwapALeaseMonitorProps = {
    zip: string,
    minMilesPerMonth?: string,
    maxMonthsRemaining?: string, 
    maxLeasePayment?: string, 
    radiusMiles?: string,
    preferredMake?: string, 
}