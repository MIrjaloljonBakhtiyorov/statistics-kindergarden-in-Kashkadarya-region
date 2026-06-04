import { StaffService } from './staff.service.js';
import { resolveKindergartenId } from '../../requestContext.js';
export class StaffController {
    service = new StaffService();
    create = async (req, res) => {
        try {
            console.log('Creating staff with data:', req.body);
            const staff = await this.service.create(req.body, await resolveKindergartenId(req));
            res.status(201).json(staff);
        }
        catch (error) {
            console.error('Error creating staff:', error);
            res.status(400).json({ error: error.message });
        }
    };
    getAll = async (req, res) => {
        try {
            const staff = await this.service.getAll(await resolveKindergartenId(req));
            res.json(staff);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    update = async (req, res) => {
        try {
            await this.service.update(req.params.id, req.body, await resolveKindergartenId(req));
            res.status(200).json({ message: 'Staff updated successfully' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    delete = async (req, res) => {
        try {
            await this.service.delete(req.params.id, await resolveKindergartenId(req));
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
}
