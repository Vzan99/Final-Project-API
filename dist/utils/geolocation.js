"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reverseGeocode = reverseGeocode;
const axios_1 = __importDefault(require("axios"));
function reverseGeocode(lat, lng) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const apiKey = process.env.OPENCAGE_API_KEY;
        if (!apiKey) {
            console.warn("OPENCAGE_API_KEY is missing");
            return null;
        }
        try {
            const response = yield axios_1.default.get(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`);
            const components = (_a = response.data.results[0]) === null || _a === void 0 ? void 0 : _a.components;
            return (components === null || components === void 0 ? void 0 : components.city) || (components === null || components === void 0 ? void 0 : components.town) || (components === null || components === void 0 ? void 0 : components.village) || null;
        }
        catch (err) {
            console.error("Reverse geocoding failed:", err);
            return null;
        }
    });
}
