import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { ApiError } from "../utils/http.js";
import { createNotification } from "../utils/notifications.js";

export const teamsRouter = Router();

const MAX_MEMBERS = 5;

const ROLES = ["project_leader", "developer", "designer", "marketer", "domain_expert"] as const;
type TeamRole = (typeof ROLES)[number];

const roleLabels: Record<TeamRole, string> = {
  project_leader: "Loyiha rahbari",
  developer:      "Dasturchi",
  designer:       "Dizayner",
  marketer:       "Marketolog",
  domain_expert:  "Soha mutaxassisi",
};

/* ── helpers ── */
function toTeamDto(row: Record<string, unknown>) {
  return {
    id:          row.id,
    name:        row.name,
    description: row.description ?? "",
    direction:   row.direction,
    ownerId:     row.owner_id,
    status:      row.status,
    inviteCode:  row.invite_code,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
}

function toMemberDto(row: Record<string, unknown>) {
  return {
    id:         row.id,
    teamId:     row.team_id,
    userId:     row.user_id,
    firstName:  row.first_name,
    lastName:   row.last_name,
    email:      row.email,
    avatarUrl:  row.avatar_url,
    role:       row.role,
    roleLabel:  roleLabels[row.role as TeamRole] ?? row.role,
    status:     row.status,
    joinedAt:   row.joined_at,
  };
}

function toInviteDto(row: Record<string, unknown>) {
  return {
    id:           row.id,
    teamId:       row.team_id,
    teamName:     row.team_name,
    invitedBy:    row.invited_by_name,
    invitedUserId:row.invited_user,
    email:        row.email,
    role:         row.role,
    roleLabel:    roleLabels[row.role as TeamRole] ?? row.role,
    status:       row.status,
    token:        row.token,
    expiresAt:    row.expires_at,
    createdAt:    row.created_at,
  };
}

/* ═══════════════════════════════════════════════
   GET /users/:userId/team  — foydalanuvchi jamoasi
═══════════════════════════════════════════════ */
teamsRouter.get("/users/:userId/team", async (req, res, next) => {
  try {
    const { userId } = req.params;

    // User a'zo bo'lgan jamoani topish (faqat 1 ta)
    const teamResult = await pool.query(
      `SELECT t.*, tm.role as member_role
       FROM teams t
       JOIN team_members tm ON tm.team_id = t.id AND tm.user_id = $1 AND tm.status = 'active'
       LIMIT 1`,
      [userId]
    );

    if (teamResult.rows.length === 0) {
      res.json({ data: null });
      return;
    }

    const team = teamResult.rows[0];

    // A'zolarni olish
    const membersResult = await pool.query(
      `SELECT tm.id, tm.team_id, tm.user_id, tm.role, tm.status, tm.joined_at,
              u.first_name, u.last_name, u.email, u.avatar_url
       FROM team_members tm
       JOIN users u ON u.id = tm.user_id
       WHERE tm.team_id = $1 AND tm.status = 'active'
       ORDER BY tm.joined_at ASC`,
      [team.id]
    );

    res.json({
      data: {
        ...toTeamDto(team),
        myRole: team.member_role,
        isOwner: team.owner_id === userId,
        members: membersResult.rows.map(toMemberDto),
      }
    });
  } catch (err) {
    next(err);
  }
});

/* ═══════════════════════════════════════════════
   POST /teams  — jamoa yaratish
═══════════════════════════════════════════════ */
const createTeamSchema = z.object({
  name:        z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
  direction:   z.string().trim().min(2).max(100),
  ownerId:     z.string().uuid(),
});

teamsRouter.post("/teams", async (req, res, next) => {
  try {
    const payload = createTeamSchema.parse(req.body);

    // Allaqachon jamoasi bormi?
    const existing = await pool.query(
      `SELECT t.id FROM teams t
       JOIN team_members tm ON tm.team_id = t.id AND tm.user_id = $1 AND tm.status = 'active'
       LIMIT 1`,
      [payload.ownerId]
    );
    if (existing.rows.length > 0) {
      throw new ApiError(400, "Siz allaqachon jamoaga a'zosiz. Bitta foydalanuvchi faqat 1 ta jamoaga a'zo bo'la oladi.");
    }

    // User mavjudligini tekshirish
    const userResult = await pool.query(
      "SELECT first_name, last_name FROM users WHERE id = $1",
      [payload.ownerId]
    );
    if (userResult.rows.length === 0) throw new ApiError(404, "Foydalanuvchi topilmadi");
    const owner = userResult.rows[0];

    // Jamoani yaratish
    const teamResult = await pool.query(
      `INSERT INTO teams (name, description, direction, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [payload.name, payload.description || null, payload.direction, payload.ownerId]
    );
    const team = teamResult.rows[0];

    // Egasini rahbar sifatida qo'shish
    await pool.query(
      `INSERT INTO team_members (team_id, user_id, role)
       VALUES ($1, $2, 'project_leader')`,
      [team.id, payload.ownerId]
    );

    // Bildirishnoma
    await createNotification({
      userId: payload.ownerId,
      type: "team",
      title: "Jamoa yaratildi 🎉",
      body: `"${team.name}" jamoasi muvaffaqiyatli yaratildi. Taklif havolasi orqali a'zolarni qo'shing.`,
      actionUrl: `/profile/${payload.ownerId}/teams`,
      actionLabel: "Jamoani ko'rish",
    });

    res.status(201).json({
      data: {
        ...toTeamDto(team),
        myRole: "project_leader",
        isOwner: true,
        members: [{
          id: null,
          teamId: team.id,
          userId: payload.ownerId,
          firstName: owner.first_name,
          lastName: owner.last_name,
          role: "project_leader",
          roleLabel: roleLabels.project_leader,
          status: "active",
          joinedAt: team.created_at,
        }],
      }
    });
  } catch (err) {
    next(err);
  }
});

/* ═══════════════════════════════════════════════
   PATCH /teams/:id  — jamoani tahrirlash
═══════════════════════════════════════════════ */
const updateTeamSchema = z.object({
  name:        z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(500).optional(),
  direction:   z.string().trim().min(2).max(100).optional(),
  userId:      z.string().uuid(),
});

teamsRouter.patch("/teams/:id", async (req, res, next) => {
  try {
    const payload = updateTeamSchema.parse(req.body);

    // Faqat owner tahrirlaydi
    const check = await pool.query("SELECT owner_id FROM teams WHERE id = $1", [req.params.id]);
    if (check.rows.length === 0) throw new ApiError(404, "Jamoa topilmadi");
    if (check.rows[0].owner_id !== payload.userId)
      throw new ApiError(403, "Faqat jamoa rahbari tahrirlaydi");

    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    if (payload.name)        { updates.push(`name = $${idx++}`);        values.push(payload.name); }
    if (payload.description !== undefined) { updates.push(`description = $${idx++}`); values.push(payload.description); }
    if (payload.direction)   { updates.push(`direction = $${idx++}`);   values.push(payload.direction); }
    updates.push(`updated_at = now()`);
    values.push(req.params.id);

    const result = await pool.query(
      `UPDATE teams SET ${updates.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );

    res.json({ data: toTeamDto(result.rows[0]) });
  } catch (err) {
    next(err);
  }
});

/* ═══════════════════════════════════════════════
   DELETE /teams/:id  — jamoani o'chirish
═══════════════════════════════════════════════ */
teamsRouter.delete("/teams/:id", async (req, res, next) => {
  try {
    const { userId } = req.body as { userId?: string };
    if (!userId) throw new ApiError(400, "userId kerak");

    const check = await pool.query("SELECT owner_id, name FROM teams WHERE id = $1", [req.params.id]);
    if (check.rows.length === 0) throw new ApiError(404, "Jamoa topilmadi");
    if (check.rows[0].owner_id !== userId)
      throw new ApiError(403, "Faqat jamoa rahbari o'chiradi");

    await pool.query("DELETE FROM teams WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

/* ═══════════════════════════════════════════════
   POST /teams/:id/leave  — jamoadan chiqish
═══════════════════════════════════════════════ */
teamsRouter.post("/teams/:id/leave", async (req, res, next) => {
  try {
    const { userId } = req.body as { userId?: string };
    if (!userId) throw new ApiError(400, "userId kerak");

    const team = await pool.query("SELECT owner_id, name FROM teams WHERE id = $1", [req.params.id]);
    if (team.rows.length === 0) throw new ApiError(404, "Jamoa topilmadi");
    if (team.rows[0].owner_id === userId)
      throw new ApiError(400, "Jamoa rahbari jamoani tark eta olmaydi. Jamoani o'chirishni ishlating.");

    await pool.query(
      "DELETE FROM team_members WHERE team_id = $1 AND user_id = $2",
      [req.params.id, userId]
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

/* ═══════════════════════════════════════════════
   POST /teams/:id/invites  — taklif yaratish
═══════════════════════════════════════════════ */
const createInviteSchema = z.object({
  invitedBy: z.string().uuid(),
  role:      z.enum(ROLES),
  email:     z.string().email().optional(),
});

teamsRouter.post("/teams/:id/invites", async (req, res, next) => {
  try {
    const payload = createInviteSchema.parse(req.body);

    // Jamoa bormi va chaqiruvchi a'zomi?
    const teamResult = await pool.query(
      `SELECT t.id, t.name, t.owner_id,
              (SELECT COUNT(*) FROM team_members WHERE team_id = t.id AND status = 'active') as member_count
       FROM teams t WHERE t.id = $1`,
      [req.params.id]
    );
    if (teamResult.rows.length === 0) throw new ApiError(404, "Jamoa topilmadi");
    const team = teamResult.rows[0];
    if (team.owner_id !== payload.invitedBy)
      throw new ApiError(403, "Faqat jamoa rahbari taklif yuboradi");
    if (Number(team.member_count) >= MAX_MEMBERS)
      throw new ApiError(400, `Jamoa maksimal a'zo soniga (${MAX_MEMBERS}) yetdi`);

    // Mavjud pending taklifni o'chirish (bir rol uchun)
    await pool.query(
      `DELETE FROM team_invites
       WHERE team_id = $1 AND role = $2 AND status = 'pending'`,
      [req.params.id, payload.role]
    );

    // Yangi taklif
    const inv = await pool.query(
      `INSERT INTO team_invites (team_id, invited_by, role, email)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.params.id, payload.invitedBy, payload.role, payload.email || null]
    );

    res.status(201).json({
      data: {
        id:        inv.rows[0].id,
        teamId:    inv.rows[0].team_id,
        teamName:  team.name,
        role:      inv.rows[0].role,
        roleLabel: roleLabels[payload.role],
        token:     inv.rows[0].token,
        inviteUrl: `/profile/join-team?token=${inv.rows[0].token}`,
        expiresAt: inv.rows[0].expires_at,
        createdAt: inv.rows[0].created_at,
      }
    });
  } catch (err) {
    next(err);
  }
});

/* ═══════════════════════════════════════════════
   GET /teams/:id/invites  — taklif ro'yxati
═══════════════════════════════════════════════ */
teamsRouter.get("/teams/:id/invites", async (req, res, next) => {
  try {
    const { userId } = req.query as { userId?: string };
    if (!userId) throw new ApiError(400, "userId kerak");

    const check = await pool.query("SELECT owner_id FROM teams WHERE id = $1", [req.params.id]);
    if (check.rows.length === 0) throw new ApiError(404, "Jamoa topilmadi");
    if (check.rows[0].owner_id !== userId)
      throw new ApiError(403, "Faqat jamoa rahbari ko'radi");

    const result = await pool.query(
      `SELECT ti.*,
              t.name as team_name,
              u.first_name || ' ' || u.last_name as invited_by_name
       FROM team_invites ti
       JOIN teams t ON t.id = ti.team_id
       JOIN users u ON u.id = ti.invited_by
       WHERE ti.team_id = $1 AND ti.status = 'pending' AND ti.expires_at > now()
       ORDER BY ti.created_at DESC`,
      [req.params.id]
    );

    res.json({ data: result.rows.map(toInviteDto) });
  } catch (err) {
    next(err);
  }
});

/* ═══════════════════════════════════════════════
   DELETE /teams/:id/invites/:inviteId  — taklif bekor qilish
═══════════════════════════════════════════════ */
teamsRouter.delete("/teams/:id/invites/:inviteId", async (req, res, next) => {
  try {
    const { userId } = req.body as { userId?: string };
    if (!userId) throw new ApiError(400, "userId kerak");

    const check = await pool.query("SELECT owner_id FROM teams WHERE id = $1", [req.params.id]);
    if (check.rows.length === 0) throw new ApiError(404, "Jamoa topilmadi");
    if (check.rows[0].owner_id !== userId)
      throw new ApiError(403, "Faqat jamoa rahbari bekor qiladi");

    await pool.query("DELETE FROM team_invites WHERE id = $1 AND team_id = $2", [req.params.inviteId, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

/* ═══════════════════════════════════════════════
   GET /team-invite/:token  — token bo'yicha taklif ma'lumoti
═══════════════════════════════════════════════ */
teamsRouter.get("/team-invite/:token", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT ti.*,
              t.name as team_name,
              t.direction as team_direction,
              t.description as team_description,
              (SELECT COUNT(*) FROM team_members WHERE team_id = t.id AND status = 'active') as member_count,
              u.first_name || ' ' || u.last_name as invited_by_name
       FROM team_invites ti
       JOIN teams t ON t.id = ti.team_id
       JOIN users u ON u.id = ti.invited_by
       WHERE ti.token = $1`,
      [req.params.token]
    );

    if (result.rows.length === 0) throw new ApiError(404, "Taklif topilmadi yoki muddati tugagan");
    const inv = result.rows[0];

    if (inv.status !== "pending") throw new ApiError(400, "Taklif allaqachon ishlatilgan");
    if (new Date(inv.expires_at) < new Date()) throw new ApiError(400, "Taklif muddati tugagan");
    if (Number(inv.member_count) >= MAX_MEMBERS) throw new ApiError(400, "Jamoa to'lib bo'lgan");

    res.json({
      data: {
        token:           inv.token,
        teamId:          inv.team_id,
        teamName:        inv.team_name,
        teamDirection:   inv.team_direction,
        teamDescription: inv.team_description,
        memberCount:     Number(inv.member_count),
        maxMembers:      MAX_MEMBERS,
        role:            inv.role,
        roleLabel:       roleLabels[inv.role as TeamRole] ?? inv.role,
        invitedBy:       inv.invited_by_name,
        expiresAt:       inv.expires_at,
      }
    });
  } catch (err) {
    next(err);
  }
});

/* ═══════════════════════════════════════════════
   POST /team-invite/:token/accept  — taklifni qabul qilish
═══════════════════════════════════════════════ */
teamsRouter.post("/team-invite/:token/accept", async (req, res, next) => {
  try {
    const { userId } = req.body as { userId?: string };
    if (!userId) throw new ApiError(400, "userId kerak");

    const inv = await pool.query(
      `SELECT ti.*, t.name as team_name
       FROM team_invites ti
       JOIN teams t ON t.id = ti.team_id
       WHERE ti.token = $1 FOR UPDATE`,
      [req.params.token]
    );
    if (inv.rows.length === 0) throw new ApiError(404, "Taklif topilmadi");
    const invite = inv.rows[0];

    if (invite.status !== "pending") throw new ApiError(400, "Taklif allaqachon ishlatilgan");
    if (new Date(invite.expires_at) < new Date()) throw new ApiError(400, "Taklif muddati tugagan");

    // User allaqachon biror jamoada bormi?
    const userTeam = await pool.query(
      `SELECT t.id FROM teams t
       JOIN team_members tm ON tm.team_id = t.id AND tm.user_id = $1 AND tm.status = 'active'
       LIMIT 1`,
      [userId]
    );
    if (userTeam.rows.length > 0)
      throw new ApiError(400, "Siz allaqachon jamoaga a'zosiz. Bitta foydalanuvchi faqat 1 ta jamoaga a'zo bo'la oladi.");

    // A'zo sonini tekshirish
    const count = await pool.query(
      "SELECT COUNT(*) as cnt FROM team_members WHERE team_id = $1 AND status = 'active'",
      [invite.team_id]
    );
    if (Number(count.rows[0].cnt) >= MAX_MEMBERS)
      throw new ApiError(400, `Jamoa to'lib bo'lgan (maks. ${MAX_MEMBERS} a'zo)`);

    // A'zo qo'shish
    await pool.query(
      `INSERT INTO team_members (team_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (team_id, user_id) DO UPDATE SET status = 'active', role = $3`,
      [invite.team_id, userId, invite.role]
    );

    // Taklifni yopish
    await pool.query(
      `UPDATE team_invites SET status = 'accepted', invited_user = $1 WHERE id = $2`,
      [userId, invite.id]
    );

    // Bildirishnoma (yangi a'zoga)
    await createNotification({
      userId,
      type: "team",
      title: `"${invite.team_name}" jamoasiga qo'shildingiz! 🎉`,
      body: `Siz ${roleLabels[invite.role as TeamRole] ?? invite.role} sifatida jamoaga a'zo bo'ldingiz.`,
      actionUrl: `/profile/${userId}/teams`,
      actionLabel: "Jamoani ko'rish",
    });

    // Bildirishnoma (rahbarga)
    const newMember = await pool.query(
      "SELECT first_name, last_name FROM users WHERE id = $1",
      [userId]
    );
    const nm = newMember.rows[0];
    await createNotification({
      userId: invite.invited_by,
      type: "team",
      title: "Yangi a'zo qo'shildi",
      body: `${nm?.first_name ?? ""} ${nm?.last_name ?? ""} "${invite.team_name}" jamoasiga ${roleLabels[invite.role as TeamRole] ?? invite.role} sifatida qo'shildi.`,
      actionUrl: `/profile/${invite.invited_by}/teams`,
      actionLabel: "Jamoani ko'rish",
    });

    res.json({ success: true, teamId: invite.team_id });
  } catch (err) {
    next(err);
  }
});

/* ═══════════════════════════════════════════════
   DELETE /teams/:id/members/:memberId  — a'zoni chiqarish
═══════════════════════════════════════════════ */
teamsRouter.delete("/teams/:id/members/:memberId", async (req, res, next) => {
  try {
    const { userId } = req.body as { userId?: string };
    if (!userId) throw new ApiError(400, "userId kerak");

    const check = await pool.query("SELECT owner_id FROM teams WHERE id = $1", [req.params.id]);
    if (check.rows.length === 0) throw new ApiError(404, "Jamoa topilmadi");
    if (check.rows[0].owner_id !== userId)
      throw new ApiError(403, "Faqat jamoa rahbari a'zoni chiqaradi");
    if (req.params.memberId === userId)
      throw new ApiError(400, "O'zingizni chiqara olmaysiz");

    await pool.query(
      "DELETE FROM team_members WHERE team_id = $1 AND user_id = $2",
      [req.params.id, req.params.memberId]
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
