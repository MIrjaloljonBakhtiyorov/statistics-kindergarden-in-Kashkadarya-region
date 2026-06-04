import { ChildrenService } from './children.service.js';
import { resolveKindergartenId } from '../../requestContext.js';
export class ChildrenController {
    service = new ChildrenService();
    create = async (req, res) => {
        try {
            const kid = await resolveKindergartenId(req);
            const result = await this.service.createChild(req.body, kid);
            res.status(201).json(result);
        }
        catch (error) {
            console.error('Error creating child:', error);
            res.status(500).json({ error: error.message });
        }
    };
    getAll = async (req, res) => {
        try {
            const kid = await resolveKindergartenId(req);
            const children = await this.service.getAllChildren(kid);
            res.status(200).json(children);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    update = async (req, res) => {
        try {
            const kid = await resolveKindergartenId(req);
            await this.service.updateChild(req.params.id, req.body, kid);
            res.status(200).json({ message: 'Child updated successfully' });
        }
        catch (error) {
            console.error('Error updating child:', error);
            res.status(500).json({ error: error.message });
        }
    };
    delete = async (req, res) => {
        try {
            const kid = await resolveKindergartenId(req);
            await this.service.deleteChild(req.params.id, kid);
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
}
