import S3ClientFacade from "../s3/S3ClientFacade";
import { LISTINGS_OBJECT, LISTINGS_S3_BUCKET_NAME } from "../environment/environment_module";
import { Listing, VehicleInfo, LeaseInfo } from "@jkon1513/swap-a-lease-client";

/**
 * Manager is responsible for fetching known listings from s3 
 * and updating the most recently seen listings if needed
 */
export default class ListingManager {
    private readonly s3Client: S3ClientFacade;

    constructor(s3Client: S3ClientFacade) {
        this.s3Client = s3Client;
    }

    // TODO: handle first execution case where there is no listings object
    public async getKnownListings(): Promise<Listing[]> {
        const json: string = await this.s3Client.getObject(LISTINGS_OBJECT, LISTINGS_S3_BUCKET_NAME);
        const listingPojos: PojoLising[] = JSON.parse(json);
        return listingPojos.map(pojo => this.convertPojoToListing(pojo));
    }

    public updateKnownListings(listings: Listing[]) {
        const listingsJson: string = JSON.stringify(listings);
        this.s3Client.putObject(LISTINGS_OBJECT, LISTINGS_S3_BUCKET_NAME, listingsJson);
    }

    private convertPojoToListing(pojo: PojoLising): Listing {
        return new Listing(pojo.title, pojo.vehicleInfo, pojo.leaseInfo, 
            pojo.imageUrl, pojo.location, pojo.listingUrl);
    }
}

/*
TODO: TS does not deserialize into class instances, only pojos so we define a type
with the expected properties on the deserialized object. Need to imprpove this 
so the Listing can evolve without breaking this
*/
type PojoLising = {
    title: string, 
    vehicleInfo: VehicleInfo, 
    leaseInfo: LeaseInfo, 
    imageUrl: string, 
    location: string, 
    listingUrl: string
}