import ListingsTableDao from "../dynamo/ListingsTableDao";
import { Listing, VehicleInfo, LeaseInfo } from "@jkonikow/swap-a-lease-client";

/**
 * Manager is responsible for fetching known listings from DDB
 * and updating the most recently seen listings if needed
 */
export default class ListingManager {
    private readonly listingsTableDao: ListingsTableDao;

    constructor(listingsTableDao: ListingsTableDao) {
        this.listingsTableDao = listingsTableDao;
    }

    public async getKnownListings(key: string): Promise<Listing[]> {
        const json: string = await this.listingsTableDao.getListings(key);
        const listingPojos: PojoLising[] = JSON.parse(json);
        return listingPojos.map(pojo => this.convertPojoToListing(pojo));
    }

    public updateKnownListings(key: string, listings: Listing[]): void {
        const listingsJson: string = JSON.stringify(listings);
        this.listingsTableDao.putListings(key, listingsJson);
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