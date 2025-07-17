import { Request, Response, NextFunction } from "express";
import {
  GetAllCompaniesService,
  getCompanyByIdService,
  getPublishedJobsByCompanyIdService,
} from "../services/company.service";

export async function GetAllCompaniesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      name,
      location,
      sortBy = "name",
      sortOrder = "asc",
      page = 1,
      pageSize = 10,
    } = (req as any).validatedQuery;

    const data = await GetAllCompaniesService({
      name,
      location,
      sortBy,
      sortOrder,
      page,
      pageSize,
    });

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

export async function getCompanyByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const companyId = req.params.id;

    const company = await getCompanyByIdService(companyId);

    if (!company) {
      throw new Error("Company not found");
    }

    res.status(200).json(company);
  } catch (err) {
    next(err);
  }
}

export async function getPublishedJobsByCompanyIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id: companyId } = req.params;

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 5;

    const { jobs, total } = await getPublishedJobsByCompanyIdService(
      companyId,
      page,
      pageSize
    );

    res.status(200).json({
      jobs,
      total,
      page,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    next(error);
  }
}
