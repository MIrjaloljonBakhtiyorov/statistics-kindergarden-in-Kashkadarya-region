import { Request, Response } from 'express';

import { resolveKindergartenId } from '../kindergarten/requestContext.js';
import { ParentPortalError } from './parentPortal.errors.js';
import { ParentPortalService } from './parentPortal.service.js';

const routeParam = (req: Request, name: string) => {
  const value = req.params[name];
  const normalized = Array.isArray(value) ? value[0] : value;
  if (!normalized) {
    throw new ParentPortalError(`${name} is required`, 400);
  }
  return normalized;
};

const sendError = (res: Response, error: any) => {
  if (error instanceof ParentPortalError) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  return res.status(500).json({ error: error.message });
};

export class ParentPortalController {
  private service = new ParentPortalService();

  listParents = async (req: Request, res: Response) => {
    try {
      res.json(await this.service.listParents(await resolveKindergartenId(req)));
    } catch (error: any) {
      sendError(res, error);
    }
  };

  updateParentAccount = async (req: Request, res: Response) => {
    try {
      res.json(await this.service.updateParentAccount(routeParam(req, 'id'), await resolveKindergartenId(req), req.body));
    } catch (error: any) {
      sendError(res, error);
    }
  };

  deleteParentAccount = async (req: Request, res: Response) => {
    try {
      res.json(await this.service.deleteParentAccount(routeParam(req, 'id'), await resolveKindergartenId(req)));
    } catch (error: any) {
      sendError(res, error);
    }
  };

  getChildInfo = async (req: Request, res: Response) => {
    try {
      res.json(await this.service.getChildInfo(routeParam(req, 'childId'), await resolveKindergartenId(req)));
    } catch (error: any) {
      sendError(res, error);
    }
  };

  getFullData = async (req: Request, res: Response) => {
    try {
      res.json(await this.service.getFullData(routeParam(req, 'childId'), await resolveKindergartenId(req)));
    } catch (error: any) {
      sendError(res, error);
    }
  };

  getParentLoginHistory = async (req: Request, res: Response) => {
    try {
      res.json(await this.service.getParentLoginHistory(routeParam(req, 'childId'), await resolveKindergartenId(req), req.query));
    } catch (error: any) {
      sendError(res, error);
    }
  };

  updateProfile = async (req: Request, res: Response) => {
    try {
      res.json(await this.service.updateProfile(routeParam(req, 'childId'), await resolveKindergartenId(req), req.body));
    } catch (error: any) {
      sendError(res, error);
    }
  };

  getMenu = async (req: Request, res: Response) => {
    try {
      res.json(await this.service.getMenu(routeParam(req, 'childId'), await resolveKindergartenId(req), routeParam(req, 'date')));
    } catch (error: any) {
      sendError(res, error);
    }
  };

  createDocument = async (req: Request, res: Response) => {
    try {
      res.status(201).json(await this.service.createDocument(await resolveKindergartenId(req), req.body));
    } catch (error: any) {
      sendError(res, error);
    }
  };

  deleteDocument = async (req: Request, res: Response) => {
    try {
      res.json(await this.service.deleteDocument(routeParam(req, 'id'), await resolveKindergartenId(req)));
    } catch (error: any) {
      sendError(res, error);
    }
  };

  createPickup = async (req: Request, res: Response) => {
    try {
      res.status(201).json(await this.service.createPickup(await resolveKindergartenId(req), req.body));
    } catch (error: any) {
      sendError(res, error);
    }
  };

  deletePickup = async (req: Request, res: Response) => {
    try {
      res.json(await this.service.deletePickup(routeParam(req, 'id'), await resolveKindergartenId(req)));
    } catch (error: any) {
      sendError(res, error);
    }
  };
}
