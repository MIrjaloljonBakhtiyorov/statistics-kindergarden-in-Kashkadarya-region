import { ChildrenRepository } from './children.repository.js';
export class ChildrenService {
    repository = new ChildrenRepository();
    async createChild(data, kindergartenId) {
        return await this.repository.create(data, kindergartenId);
    }
    async getAllChildren(kindergartenId) {
        return await this.repository.findAll(kindergartenId);
    }
    async updateChild(id, data, kindergartenId) {
        return await this.repository.update(id, data, kindergartenId);
    }
    async deleteChild(id, kindergartenId) {
        return await this.repository.delete(id, kindergartenId);
    }
}
