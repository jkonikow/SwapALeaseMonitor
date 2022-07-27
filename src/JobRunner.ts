import SwapALeaseMonitor, { SwapALeaseMonitorProps } from "./monitor/SwapALeaseMonitor";
import ListingManager from "./monitor/ListingManager";
import { SwapALeaseClient } from "@jkon1513/swap-a-lease-client";
import S3ClientFacade from "./s3/S3ClientFacade";
import { S3Client } from "@aws-sdk/client-s3";
import SesClientFacade  from "./ses/SesClientFacade";
import { SESClient } from "@aws-sdk/client-ses";
import { AWS_REGION } from "./environment/environment_module";

const salClient: SwapALeaseClient = new SwapALeaseClient();
const s3Client: S3Client = new S3Client({region: AWS_REGION});
const s3Facade: S3ClientFacade = new S3ClientFacade(s3Client);
const listingManager: ListingManager = new ListingManager(s3Facade);
const sesClient: SESClient = new SESClient({region: AWS_REGION});
const sesFacade: SesClientFacade = new SesClientFacade(sesClient);
const leaseMonitor: SwapALeaseMonitor = new SwapALeaseMonitor(salClient, listingManager, sesFacade);

export const run = (input: SwapALeaseMonitorProps) => leaseMonitor.monitor(input);