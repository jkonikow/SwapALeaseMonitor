import SwapALeaseMonitor, { SwapALeaseMonitorProps } from "./monitor/SwapALeaseMonitor";
import { SwapALeaseClient } from "@jkon1513/swap-a-lease-client";

const salClient: SwapALeaseClient = new SwapALeaseClient();
const leaseMonitor: SwapALeaseMonitor = new SwapALeaseMonitor(salClient);

export const run = (input: SwapALeaseMonitorProps) => leaseMonitor.monitor(input);
