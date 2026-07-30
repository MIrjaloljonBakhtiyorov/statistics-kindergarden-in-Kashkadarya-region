import bcrypt from 'bcryptjs';

import sharedDb from '../shared/database.js';
import { assertLoginAvailable } from '../shared/loginUniqueness.js';
import { ParentPortalError } from './parentPortal.errors.js';
import { ParentPortalRepository } from './parentPortal.repository.js';

export class ParentPortalService {
  private repository = new ParentPortalRepository();

  async listParents(kindergartenId: string) {
    const rows = await this.repository.listParents(kindergartenId);

    return rows.map((row: any) => ({
      id: row.account_id || row.child_id,
      childName: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
      childBirthCertificate: row.birth_certificate_number,
      fatherName: row.father_name,
      fatherPhone: row.father_phone,
      fatherPassport: row.father_passport,
      motherName: row.mother_name,
      motherPhone: row.mother_phone,
      motherPassport: row.mother_passport,
      childGroup: row.group_name,
      groupId: row.group_id,
      login: row.login,
    }));
  }

  async updateParentAccount(id: string, kindergartenId: string, body: any) {
    const updates: Record<string, any> = {};

    if (body.login) {
      updates.login = await assertLoginAvailable(sharedDb, body.login, { excludeParentAccountId: id });
    }
    if (body.password) {
      updates.password_hash = await bcrypt.hash(body.password, 10);
    }

    if (Object.keys(updates).length === 0) return { success: true };

    const result = await this.repository.updateParentAccount(id, kindergartenId, updates);
    if (result.changes === 0) throw new ParentPortalError('Parent account not found', 404);
    return { success: true };
  }

  async deleteParentAccount(id: string, kindergartenId: string) {
    await this.repository.deleteParentAccount(id, kindergartenId);
    return { success: true };
  }

  async getChildInfo(childId: string, kindergartenId: string) {
    const child = await this.repository.getChildInfo(childId, kindergartenId);
    if (!child) throw new ParentPortalError('Child not found', 404);
    return child;
  }

  async getFullData(childId: string, kindergartenId: string) {
    const today = new Date().toISOString().slice(0, 10);
    const [attendance, health, documents, pickups, menu] = await Promise.all([
      this.repository.getAttendance(childId, kindergartenId),
      this.repository.getHealth(childId, kindergartenId),
      this.repository.getDocuments(childId, kindergartenId),
      this.repository.getPickups(childId, kindergartenId),
      this.repository.getMenu(kindergartenId, today),
    ]);

    return { attendance, health, documents, pickups, menu, finance: [], progress: [], vaccines: [] };
  }

  async updateProfile(childId: string, kindergartenId: string, body: any) {
    await this.repository.updateChildProfile(childId, kindergartenId, {
      address: body.address || null,
      photo_url: body.photo_url || null,
    });

    const child = await this.repository.getChildParentIds(childId, kindergartenId);
    if (child?.father_id && body.father) {
      await this.repository.updateParentProfile(child.father_id, kindergartenId, body.father);
    }
    if (child?.mother_id && body.mother) {
      await this.repository.updateParentProfile(child.mother_id, kindergartenId, body.mother);
    }

    return { success: true };
  }

  getMenu(childId: string, kindergartenId: string, date: string) {
    void childId;
    return this.repository.getMenu(kindergartenId, date);
  }

  async createDocument(kindergartenId: string, body: any) {
    const title = String(body.title || '').trim();
    const type = String(body.type || 'OTHER').trim().toUpperCase();
    const fileUrl = String(body.file_url || '').trim();

    if (!body.child_id || !title || !fileUrl) {
      throw new ParentPortalError("Hujjat nomi, bola va fayl ma'lumoti kerak", 400);
    }

    const child = await this.repository.getChildById(body.child_id, kindergartenId);
    if (!child) throw new ParentPortalError('Child not found', 404);

    return this.repository.createDocument(kindergartenId, {
      child_id: body.child_id,
      title,
      type,
      file_url: fileUrl,
    });
  }

  async deleteDocument(id: string, kindergartenId: string) {
    const result = await this.repository.deleteDocument(id, kindergartenId);
    if (result.changes === 0) throw new ParentPortalError('Document not found', 404);
    return { success: true };
  }

  async createPickup(kindergartenId: string, body: any) {
    return this.repository.createPickup(kindergartenId, body);
  }

  async deletePickup(id: string, kindergartenId: string) {
    await this.repository.deletePickup(id, kindergartenId);
    return { success: true };
  }
}
