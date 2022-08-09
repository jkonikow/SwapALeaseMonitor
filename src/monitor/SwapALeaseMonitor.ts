import { SwapALeaseClient, GetListingsRequest, GetListingsResponse, Listing } from "@jkon1513/swap-a-lease-client";
import ListingManager from "./ListingManager";
import SesClientFacade from "../ses/SesClientFacade";

const ANY_MAKE: string = "ALL_MAKES";

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
        const makesToMonitor: string[] = props.preferredMakes.length === 0 ? [ANY_MAKE] : props.preferredMakes;
        let totalNewListings: Listing[] = [];
        for(const make of makesToMonitor) {
            const newListings = await this.monitorForMake(make, props);
            totalNewListings = [...totalNewListings, ...newListings];
            if (newListings.length > 0) {
                this.listingManager.updateKnownListings(make, newListings);
            }
        }

        console.info(`Found ${totalNewListings.length} new listings across makes ${makesToMonitor}: ${totalNewListings}`);
        if(totalNewListings.length > 0) {
            this.sesClient.sendEmailNotification(totalNewListings, props);
        }
    }

    private async monitorForMake(make: string, props: SwapALeaseMonitorProps): Promise<Listing[]> {
        const request: GetListingsRequest = GetListingsRequest.builder()
                                                .withMaxDistanceFromZip(props.radiusMiles ?? '150')
                                                .withMinMilesPerMonth(props.minMilesPerMonth ?? '500')
                                                .withMaxMonthsRemaining(props.maxMonthsRemaining ?? '30')
                                                .withMaxPricePerMonth(props.maxLeasePayment ?? '1000')
                                                .withZip(props.zip)
                                                .withPrefferredMake(make)
                                                .build();
        const listingsResponse: GetListingsResponse = await this.salClient.getListings(request);
        const knownListings: Listing[] = await this.listingManager.getKnownListings(make);
        const newListings: Listing[] = this.extractNewListings(knownListings, listingsResponse.getListings());
        
        console.info(`Found ${newListings.length} new listings for make ${make}`);
        return newListings;
    }

    /**
     *  Listings are fetched from SAL in sorted order with newest appearing first. 
     *  Given the above we will consider that we have new listings if 
     *      [A] we have a listing in the candidate list that is not in the known list 
     *      [B] the new listing is at an index before any known listings in the candidate list
     *          this is to rule out listings from page 2 that move to page 1 due to listings being removed.
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
    preferredMakes: string[], 
    minMilesPerMonth?: string,
    maxMonthsRemaining?: string, 
    maxLeasePayment?: string, 
    radiusMiles?: string,
}