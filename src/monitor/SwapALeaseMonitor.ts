import { SwapALeaseClient } from "@jkon1513/swap-a-lease-client";
import { GetListingsRequest } from "@jkon1513/swap-a-lease-client";
import { GetListingsResponse }  from "@jkon1513/swap-a-lease-client"; 

export default class SwapALeaseMonitor {
    private readonly client: SwapALeaseClient; 

    public constructor(client: SwapALeaseClient) {
        this.client = client;
    }

    public monitor(props: SwapALeaseMonitorProps): void {
        const request: GetListingsRequest = GetListingsRequest.builder()
                                                .withMaxDistanceFromZip(props.radiusMiles ?? '100')
                                                .withMinMilesPerMonth(props.minMilesPerMonth ?? '1000')
                                                .withMaxMonthsRemaining(props.maxMonthsRemaining ?? '24')
                                                .withMaxPricePerMonth(props.maxLeasePayment ?? '650')
                                                .withZip(props.zip)
                                                .build();
        this.client.getListings(request)
        .then((response: GetListingsResponse) => {
            console.log(response.getListings());
        })
        .catch(e => console.error(`error: ${e}`));
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