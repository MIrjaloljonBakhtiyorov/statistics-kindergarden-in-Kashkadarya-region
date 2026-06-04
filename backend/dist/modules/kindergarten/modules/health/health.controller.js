import { HealthRepository } from './health.repository.js';
import { OperationsRepository } from '../operations/operations.repository.js';
import { resolveKindergartenId } from '../../requestContext.js';
const healthRepo = new HealthRepository();
export class HealthController {
    async saveBatch(req, res) {
        const { group_name, records } = req.body;
        // records: Array of health check data
        try {
            const kindergartenId = await resolveKindergartenId(req);
            for (const record of records) {
                await healthRepo.saveCheck(record, kindergartenId);
            }
            await OperationsRepository.log('CREATE', 'HEALTH_CHECK', group_name, `Guruh uchun tibbiy ko'rik saqlandi: ${group_name}`, 'OTHER', kindergartenId);
            res.json({ success: true });
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
    async getHistory(req, res) {
        const groupId = req.params.groupId;
        try {
            const history = await healthRepo.getHistoryByGroup(groupId);
            res.json(history);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
    async getArchive(req, res) {
        try {
            const archive = await healthRepo.getArchiveSummary();
            res.json(archive);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}
