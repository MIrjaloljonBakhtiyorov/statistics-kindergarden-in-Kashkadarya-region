import { ChildrenRepository } from './children.repository.js';

export class ChildrenService {
  private repository = new ChildrenRepository();

  async createChild(data: any, kindergartenId: string) {
    return await this.repository.create(data, kindergartenId);
  }

  async getAllChildren(kindergartenId: string) {
    return await this.repository.findAll(kindergartenId);
  }

  async updateChild(id: string, data: any, kindergartenId: string) {
    return await this.repository.update(id, data, kindergartenId);
  }

  async deleteChild(id: string, kindergartenId: string) {
    return await this.repository.delete(id, kindergartenId);
  }
}
