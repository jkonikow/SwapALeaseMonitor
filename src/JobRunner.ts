import SwapALeaseMonitor, { SwapALeaseMonitorProps } from "./monitor/SwapALeaseMonitor";
import ListingManager from "./monitor/ListingManager";
import { SwapALeaseClient } from "@jkonikow/swap-a-lease-client";
import SesClientFacade  from "./ses/SesClientFacade";
import { SESClient } from "@aws-sdk/client-ses";
import { AWS_REGION } from "./environment/environment_module";
import ListingsTableDao from "./dynamo/ListingsTableDao";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const salClient: SwapALeaseClient = new SwapALeaseClient();
const ddbClient: DynamoDBClient = new DynamoDBClient({region: AWS_REGION});
const listingsTableDao: ListingsTableDao = new ListingsTableDao(ddbClient);
const listingManager: ListingManager = new ListingManager(listingsTableDao);
const sesClient: SESClient = new SESClient({region: AWS_REGION});
const sesFacade: SesClientFacade = new SesClientFacade(sesClient);
const leaseMonitor: SwapALeaseMonitor = new SwapALeaseMonitor(salClient, listingManager, sesFacade);


export const runMonitor = (input: SwapALeaseMonitorProps) => leaseMonitor.monitor(input);
