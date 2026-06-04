import { StaffRepository } from './staff.repository.js';
export class StaffService {
    repository = new StaffRepository();
    async create(data, kindergartenId) {
        return this.repository.create(data, kindergartenId);
    }
    async getAll(kindergartenId) {
        return this.repository.findAll(kindergartenId);
    }
    async update(id, data, kindergartenId) {
        return this.repository.update(id, data, kindergartenId);
    }
    async delete(id, kindergartenId) {
        return this.repository.delete(id, kindergartenId);
    }
}
