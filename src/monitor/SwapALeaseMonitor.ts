import { SwapALeaseClient } from "@jkon1513/swap-a-lease-client";
import { GetListingsRequest } from "@jkon1513/swap-a-lease-client";
import { GetListingsResponse }  from "@jkon1513/swap-a-lease-client"; 

export default class SwapALeaseMonitor {
    private readonly client: SwapALeaseClient; 

    public constructor(client: SwapALeaseClient) {
        this.client = client;
    }

    public run(): void {
        this.monitor();
    }

    private monitor(): void {
        console.log("running monitor...");
        const request: GetListingsRequest = GetListingsRequest.builder()
                                                .withMaxDistanceFromZip('100')
                                                .withMinMilesPerMonth('1000')
                                                .withMaxMonthsRemaining('24')
                                                .withMaxPricePerMonth('650')
                                                .withZip('07675')
                                                .build();
        console.log("before async");
        this.client.getListings(request)
        .then((response: GetListingsResponse) => {
            console.log("before");
            console.log(response.getListings());
            console.log("after");
        })
        .catch(e => console.error(e));
    }
}