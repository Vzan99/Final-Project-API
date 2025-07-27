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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllCompaniesController = GetAllCompaniesController;
exports.getCompanyByIdController = getCompanyByIdController;
exports.getPublishedJobsByCompanyIdController = getPublishedJobsByCompanyIdController;
const company_service_1 = require("../services/company.service");
function GetAllCompaniesController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { name, location, sortBy = "name", sortOrder = "asc", page = 1, pageSize = 10, } = req.validatedQuery;
            const data = yield (0, company_service_1.GetAllCompaniesService)({
                name,
                location,
                sortBy,
                sortOrder,
                page,
                pageSize,
            });
            res.status(200).json(data);
        }
        catch (error) {
            next(error);
        }
    });
}
function getCompanyByIdController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const companyId = req.params.id;
            const company = yield (0, company_service_1.getCompanyByIdService)(companyId);
            if (!company) {
                throw new Error("Company not found");
            }
            res.status(200).json(company);
        }
        catch (err) {
            next(err);
        }
    });
}
function getPublishedJobsByCompanyIdController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id: companyId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 5;
            const { jobs, total } = yield (0, company_service_1.getPublishedJobsByCompanyIdService)(companyId, page, pageSize);
            res.status(200).json({
                jobs,
                total,
                page,
                totalPages: Math.ceil(total / pageSize),
            });
        }
        catch (error) {
            next(error);
        }
    });
}
