import { GroupsRepository } from './groups.repository.js';
import { resolveKindergartenId } from '../../requestContext.js';
export class GroupsController {
    repository = new GroupsRepository();
    getAll = async (req, res) => {
        try {
            const groups = await this.repository.findAll(await resolveKindergartenId(req));
            res.json(groups);
        }
        catch (error) {
            console.error('Error in GroupsController.getAll:', error);
            res.status(500).json({ error: error.message });
        }
    };
    create = async (req, res) => {
        try {
            const group = await this.repository.create(req.body, await resolveKindergartenId(req));
            res.status(201).json(group);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    update = async (req, res) => {
        try {
            const group = await this.repository.update(req.params.id, req.body, await resolveKindergartenId(req));
            res.json(group);
        }
        catch (error) {
            console.error('Group update error:', error);
            res.status(500).json({ error: error.message });
        }
    };
    delete = async (req, res) => {
        try {
            await this.repository.delete(req.params.id, await resolveKindergartenId(req));
            res.status(204).send();
        }
        catch (error) {
            console.error('Group delete error:', error);
            res.status(500).json({ error: error.message });
        }
    };
}
