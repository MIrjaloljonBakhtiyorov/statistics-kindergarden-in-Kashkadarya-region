import { StaffRepository } from './staff.repository.js';

export class StaffService {
  private repository = new StaffRepository();

  async create(data: any, kindergartenId?: string) {
    return this.repository.create(data, kindergartenId);
  }

  async getAll(kindergartenId?: string) {
    return this.repository.findAll(kindergartenId);
  }

  async update(id: string, data: any, kindergartenId?: string) {
    return this.repository.update(id, data, kindergartenId);
  }

  async delete(id: string, kindergartenId?: string) {
    return this.repository.delete(id, kindergartenId);
  }
}
