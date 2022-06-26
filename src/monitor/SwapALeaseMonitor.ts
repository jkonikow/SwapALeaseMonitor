import { SwapALeaseClient, GetListingsRequest, GetListingsResponse, Listing } from "@jkon1513/swap-a-lease-client";
import S3ClientFacade from "../s3/S3ClientFacade";
import ListingManager from "./ListingManager";

export default class SwapALeaseMonitor {
    private readonly salClient: SwapALeaseClient; 
    private readonly listingManager: ListingManager
    

    public constructor(salClient: SwapALeaseClient, listingManager: ListingManager) {
        this.salClient = salClient;
        this.listingManager = listingManager;
    }

    public async monitor(props: SwapALeaseMonitorProps): Promise<void> {
        const request: GetListingsRequest = GetListingsRequest.builder()
                                                .withMaxDistanceFromZip(props.radiusMiles ?? '100')
                                                .withMinMilesPerMonth(props.minMilesPerMonth ?? '1000')
                                                .withMaxMonthsRemaining(props.maxMonthsRemaining ?? '24')
                                                .withMaxPricePerMonth(props.maxLeasePayment ?? '650')
                                                .withZip(props.zip)
                                                .build();
        const listingsResponse: GetListingsResponse = await this.salClient.getListings(request);
        //const knownListings: Listing[] = await this.listingManager.getKnownListings();
        const knownListings: Listing[] = [];
        const newListings: Listing[] = this.extractNewListings(knownListings, listingsResponse.getListings());
        newListings.forEach(l => console.log(l));
    }

    /**
     *  Listings are fetched from SAL in sorted order with newest appearing first. 
     *  Given the above we will consider that we have new listings if 
     *      [A] we have a listing in the candidate list that is not in the known list 
     *      [B] the new listing is at an index before all other known listings 
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