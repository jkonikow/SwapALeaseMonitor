import { SwapALeaseClient } from "@jkon1513/swap-a-lease-client";
import { GetListingsRequest } from "@jkon1513/swap-a-lease-client";
import { GetListingsResponse }  from "@jkon1513/swap-a-lease-client"; 
import S3ClientFacade from "../s3/S3ClientFacade";

export default class SwapALeaseMonitor {
    private readonly salClient: SwapALeaseClient; 
    private readonly s3Client: S3ClientFacade;

    public constructor(salClient: SwapALeaseClient, s3Client: S3ClientFacade) {
        this.salClient = salClient;
        this.s3Client = s3Client;
    }

    public monitor(props: SwapALeaseMonitorProps): void {
        const request: GetListingsRequest = GetListingsRequest.builder()
                                                .withMaxDistanceFromZip(props.radiusMiles ?? '100')
                                                .withMinMilesPerMonth(props.minMilesPerMonth ?? '1000')
                                                .withMaxMonthsRemaining(props.maxMonthsRemaining ?? '24')
                                                .withMaxPricePerMonth(props.maxLeasePayment ?? '650')
                                                .withZip(props.zip)
                                                .build();
        this.salClient.getListings(request)
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