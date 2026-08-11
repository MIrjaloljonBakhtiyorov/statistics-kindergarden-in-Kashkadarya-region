import bcrypt from 'bcryptjs';

import sharedDb from '../shared/database.js';
import { assertLoginAvailable } from '../shared/loginUniqueness.js';
import { ParentPortalError } from './parentPortal.errors.js';
import { ParentPortalRepository } from './parentPortal.repository.js';

const PASSWORD_POLICY_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const MAX_PICKUP_PEOPLE = 10;

const verifyStoredPassword = async (password: string, storedPassword: string) => {
  if (!storedPassword) return false;
  if (!storedPassword.startsWith('$2')) return password === storedPassword;
  return bcrypt.compare(password, storedPassword);
};

export class ParentPortalService {
  private repository = new ParentPortalRepository();

  async getAdvertisements() {
    const rows = await this.repository.getActiveAdvertisements();
    const now = Date.now();

    return rows
      .filter((row: any) => {
        const durationDays = Math.max(1, Number(row.duration_days || 1));
        const createdAt = new Date(row.created_at || Date.now()).getTime();
        if (Number.isNaN(createdAt)) return true;
        return createdAt + durationDays * 24 * 60 * 60 * 1000 >= now;
      })
      .map((row: any) => ({
        id: row.id,
        name: row.name || '',
        displayCount: Number(row.display_count || 0),
        viewCount: Number(row.view_count || 0),
        durationDays: Number(row.duration_days || 1),
        contentType: row.content_type || 'text',
        imageUrl: row.image_url || '',
        linkUrl: row.link_url || '',
        text: row.text || '',
        createdAt: row.created_at || null,
      }));
  }

  async recordAdvertisementView(id: string) {
    const advertisementId = String(id || '').trim();
    if (!advertisementId) throw new ParentPortalError('Advertisement id is required', 400);

    await this.repository.recordAdvertisementView(advertisementId);
    return { success: true };
  }

  async getParentProfileNews() {
    const rows = await this.repository.getParentProfileNews();
    return rows.map((row: any) => ({
      id: row.id,
      title: row.title || '',
      text: row.body || '',
      imageUrl: row.image_url || '',
      mediaType: row.media_type || 'image',
      linkUrl: row.link_url || '',
      publishedAt: row.published_at || row.created_at || '',
      createdAt: row.created_at || null,
    }));
  }

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
    const nextPassword = String(body.password || '').trim();
    const resetRole = String(body.updatedByRole || '').toUpperCase();
    const isPrivilegedPasswordReset = ['ADMIN', 'OPERATOR'].includes(resetRole);

    if (body.login) {
      updates.login = await assertLoginAvailable(sharedDb, body.login, { excludeParentAccountId: id });
    }
    if (nextPassword) {
      const oldPassword = String(body.oldPassword || body.currentPassword || '');
      if (!isPrivilegedPasswordReset && !oldPassword) {
        throw new ParentPortalError('Eski parolni kiriting', 400);
      }
      if (!isPrivilegedPasswordReset && !PASSWORD_POLICY_RE.test(nextPassword)) {
        throw new ParentPortalError('Yangi parol kamida 8 ta belgi, katta harf, kichik harf, son va maxsus belgidan iborat boʼlishi kerak', 400);
      }

      const account = await this.repository.getParentAccount(id, kindergartenId);
      if (!account) throw new ParentPortalError('Parent account not found', 404);

      if (!isPrivilegedPasswordReset) {
        const oldPasswordOk = await verifyStoredPassword(oldPassword, account.password_hash);
        if (!oldPasswordOk) {
          throw new ParentPortalError("Eski parol noto'g'ri", 401);
        }
      }

      updates.password_hash = await bcrypt.hash(nextPassword, 10);
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
    const row = child as any;

    return {
      ...row,
      childGroup: row.childGroup || row.childgroup || row.child_group || '',
      kindergartenName: row.kindergartenName || row.kindergartenname || row.kindergarten_name || '',
      kindergartenDistrict: row.kindergartenDistrict || row.kindergartendistrict || row.kindergarten_district || '',
      kindergartenAddress: row.kindergartenAddress || row.kindergartenaddress || row.kindergarten_address || '',
      fatherName: row.fatherName || row.fathername || row.father_name || '',
      fatherPhone: row.fatherPhone || row.fatherphone || row.father_phone || '',
      fatherPassport: row.fatherPassport || row.fatherpassport || row.father_passport || '',
      fatherWorkplace: row.fatherWorkplace || row.fatherworkplace || row.father_workplace || '',
      motherName: row.motherName || row.mothername || row.mother_name || '',
      motherPhone: row.motherPhone || row.motherphone || row.mother_phone || '',
      motherPassport: row.motherPassport || row.motherpassport || row.mother_passport || '',
      motherWorkplace: row.motherWorkplace || row.motherworkplace || row.mother_workplace || '',
    };
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

  async getParentLoginHistory(childId: string, kindergartenId: string, query: any) {
    const child = await this.repository.getChildById(childId, kindergartenId);
    if (!child) throw new ParentPortalError('Child not found', 404);

    const page = Math.max(1, Number.parseInt(String(query.page || '1'), 10) || 1);
    const limit = Math.min(10, Math.max(1, Number.parseInt(String(query.limit || '10'), 10) || 10));
    const offset = (page - 1) * limit;
    const [rows, totalRow] = await Promise.all([
      this.repository.getParentLoginHistory(childId, kindergartenId, limit, offset),
      this.repository.countParentLoginHistory(childId, kindergartenId),
    ]);
    const total = Number(totalRow?.count || 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      items: rows,
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
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

    return this.getChildInfo(childId, kindergartenId);
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
    const childId = String(body.child_id || '').trim();
    const fullName = String(body.full_name || '').trim();
    const phone = String(body.phone || '').trim();

    if (!childId || !fullName || !phone) {
      throw new ParentPortalError("Vakil ismi, telefoni va bola ma'lumoti kerak", 400);
    }

    const child = await this.repository.getChildById(childId, kindergartenId);
    if (!child) throw new ParentPortalError('Child not found', 404);

    const existing = await this.repository.countPickups(childId, kindergartenId);
    if (Number(existing?.count || 0) >= MAX_PICKUP_PEOPLE) {
      throw new ParentPortalError(`Ko'pi bilan ${MAX_PICKUP_PEOPLE} ta vakil qo'shish mumkin`, 400);
    }

    body.child_id = childId;
    body.full_name = fullName;
    body.phone = phone;
    return this.repository.createPickup(kindergartenId, body);
  }

  async deletePickup(id: string, kindergartenId: string) {
    await this.repository.deletePickup(id, kindergartenId);
    return { success: true };
  }
}
