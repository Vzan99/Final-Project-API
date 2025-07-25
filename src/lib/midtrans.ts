import midtransClient from "midtrans-client";
import { MIDTRANS_SERVER_KEY, MIDTRANS_CLIENT_KEY } from "../config";

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY,
});

export default snap;
