import SwapALeaseMonitor, { SwapALeaseMonitorProps } from "./monitor/SwapALeaseMonitor";
import { SwapALeaseClient } from "@jkon1513/swap-a-lease-client";
import S3ClientFacade from "./s3/S3ClientFacade";
import { S3Client } from "@aws-sdk/client-s3";

const salClient: SwapALeaseClient = new SwapALeaseClient();
const s3Client: S3Client = new S3Client({region: process.env.AWS_REGION});
const s3Facade: S3ClientFacade = new S3ClientFacade(s3Client);
const leaseMonitor: SwapALeaseMonitor = new SwapALeaseMonitor(salClient, s3Facade);

export const run = (input: SwapALeaseMonitorProps) => leaseMonitor.monitor(input);