import { Request, Response } from 'express';
import { ChildrenService } from './children.service.js';
import { resolveKindergartenId } from '../../requestContext.js';

export class ChildrenController {
  private service = new ChildrenService();

  create = async (req: Request, res: Response) => {
    try {
      const kid = await resolveKindergartenId(req);
      const result = await this.service.createChild(req.body, kid);
      res.status(201).json(result);
    } catch (error: any) {
      console.error('Error creating child:', error);
      res.status(500).json({ error: error.message });
    }
  };

  getAll = async (req: Request, res: Response) => {
    try {
      const kid = await resolveKindergartenId(req);
      const children = await this.service.getAllChildren(kid);
      res.status(200).json(children);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const kid = await resolveKindergartenId(req);
      await this.service.updateChild(req.params.id as string, req.body, kid);
      res.status(200).json({ message: 'Child updated successfully' });
    } catch (error: any) {
      console.error('Error updating child:', error);
      res.status(500).json({ error: error.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const kid = await resolveKindergartenId(req);
      await this.service.deleteChild(req.params.id as string, kid);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
