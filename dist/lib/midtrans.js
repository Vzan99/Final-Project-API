"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const midtrans_client_1 = __importDefault(require("midtrans-client"));
const config_1 = require("../config");
const snap = new midtrans_client_1.default.Snap({
    isProduction: false,
    serverKey: config_1.MIDTRANS_SERVER_KEY,
    clientKey: config_1.MIDTRANS_CLIENT_KEY,
});
exports.default = snap;
