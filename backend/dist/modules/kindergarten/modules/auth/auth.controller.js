import { db } from '../../db.js';
import bcrypt from 'bcryptjs';
import { normalizeLogin } from '../../../shared/loginUniqueness.js';
export class AuthController {
    login = async (req, res) => {
        const { login, password } = req.body;
        const normalizedLogin = normalizeLogin(login);
        db.get('SELECT * FROM kindergartens WHERE lower(trim(username)) = ? AND password = ?', [normalizedLogin, password], (err, user) => {
            if (err)
                return res.status(500).json({ error: err.message });
            if (!user) {
                db.get(`SELECT ra.*, k.name as kindergarten_name
           FROM role_accounts ra
           LEFT JOIN kindergartens k ON k.id = ra.kindergarten_id
           WHERE lower(trim(ra.login)) = ?
             AND ra.role IN (
               'OPERATOR', 'TEACHER', 'NURSE', 'CHEF', 'STOREKEEPER', 'INSPECTOR'
             )
           LIMIT 1`, [normalizedLogin], async (roleErr, roleUser) => {
                    if (roleErr) {
                        if (roleErr.message.includes('no such table')) {
                            return res.status(401).json({ error: 'Invalid login or password' });
                        }
                        return res.status(500).json({ error: roleErr.message });
                    }
                    if (!roleUser)
                        return res.status(401).json({ error: 'Invalid login or password' });
                    const ok = await bcrypt.compare(password, roleUser.password_hash);
                    if (!ok)
                        return res.status(401).json({ error: 'Invalid login or password' });
                    return res.json({
                        id: roleUser.id,
                        kindergarten_id: roleUser.kindergarten_id,
                        login: roleUser.login,
                        role: roleUser.role,
                        full_name: roleUser.full_name || roleUser.kindergarten_name || roleUser.login
                    });
                });
                return;
            }
            res.json({
                id: user.id,
                kindergarten_id: user.id,
                login: user.username,
                role: 'DIRECTOR', // Default role for now
                full_name: user.directorName
            });
        });
    };
    parentLogin = async (req, res) => {
        const { login, password } = req.body;
        const normalizedLogin = normalizeLogin(login);
        db.get(`
      SELECT pa.*, c.id as child_id, p.full_name
      FROM parent_accounts pa
      LEFT JOIN children c ON c.parent_account_id = pa.id
      LEFT JOIN parents p ON p.child_id = c.id OR p.id = c.father_id OR p.id = c.mother_id
      WHERE lower(trim(pa.login)) = ?
      LIMIT 1
    `, [normalizedLogin], async (err, user) => {
            if (err)
                return res.status(500).json({ error: err.message });
            if (!user)
                return res.status(401).json({ error: 'Invalid login or password' });
            const ok = await bcrypt.compare(password, user.password_hash);
            if (!ok)
                return res.status(401).json({ error: 'Invalid login or password' });
            res.json({
                id: user.id,
                login: user.login,
                role: 'PARENT',
                full_name: user.full_name || user.login,
                childId: user.child_id,
                kindergarten_id: user.kindergarten_id,
            });
        });
    };
}
