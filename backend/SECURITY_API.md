# Xavfsizlik API Hujjatlari

Bu hujjatda user panel xavfsizlik funksiyalari uchun barcha API endpointlar tushuntirilgan.

## 📋 Umumiy Ma'lumot

Barcha endpointlar `/api/users/:userId/` prefiksi bilan ishlaydi va user ID parametrini qabul qiladi.

**Base URL:** `http://localhost:4000/api`

---

## 🔐 1. Parolni O'zgartirish

### `POST /users/:id/security/change-password`

Foydalanuvchi parolini o'zgartirish.

**Request Body:**
```json
{
  "currentPassword": "eski_parol123",
  "newPassword": "yangi_parol456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Parol muvaffaqiyatli o'zgartirildi"
}
```

**Error Responses:**
- `401`: Joriy parol noto'g'ri
- `400`: Parol o'rnatilmagan
- `404`: Foydalanuvchi topilmadi

---

## 📱 2. Telefon Tasdiqlash

### 2.1 Tasdiqlash Kodi Yuborish

**`POST /users/:id/security/send-phone-verification`**

Foydalanuvchi telefon raqamiga SMS kod yuborish.

**Request Body:**
```json
{
  "phone": "+998901234567"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "SMS kod yuborildi",
  "code": "123456"  // Faqat development mode da
}
```

**Eslatma:** 
- Kod 10 daqiqa davomida amal qiladi
- Production da `code` maydoni qaytarilmaydi
- Real SMS yuborish uchun Eskiz.uz yoki Playmobile.uz integratsiya qiling

### 2.2 Tasdiqlash Kodi Tekshirish

**`POST /users/:id/security/verify-phone`**

Yuborilgan SMS kodini tekshirish va telefon raqamini tasdiqlash.

**Request Body:**
```json
{
  "phone": "+998901234567",
  "code": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Telefon muvaffaqiyatli tasdiqlandi"
}
```

**Error Responses:**
- `400`: Tasdiqlash kodi yuborilmagan
- `400`: Tasdiqlash kodi muddati tugagan
- `400`: Noto'g'ri tasdiqlash kodi
- `404`: Foydalanuvchi topilmadi yoki telefon mos kelmadi

---

## 📧 3. Email Tasdiqlash

### 3.1 Email Tasdiqlash Kodi Yuborish

**`POST /users/:id/security/send-email-verification`**

Foydalanuvchi email manziliga tasdiqlash kodi yuborish.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email kod yuborildi",
  "code": "654321"  // Faqat development mode da
}
```

**Eslatma:**
- Kod 15 daqiqa davomida amal qiladi
- Real email yuborish uchun NodeMailer, SendGrid yoki AWS SES integratsiya qiling

### 3.2 Email Kodi Tekshirish

**`POST /users/:id/security/verify-email`**

Yuborilgan email kodini tekshirish va email manzilini tasdiqlash.

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "654321"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email muvaffaqiyatli tasdiqlandi"
}
```

**Error Responses:**
- `400`: Tasdiqlash kodi yuborilmagan
- `400`: Tasdiqlash kodi muddati tugagan
- `400`: Noto'g'ri tasdiqlash kodi
- `404`: Foydalanuvchi topilmadi yoki email mos kelmadi

---

## 🛡️ 4. Ikki Bosqichli Himoya (2FA)

### `POST /users/:id/security/toggle-2fa`

Ikki bosqichli himoyani yoqish yoki o'chirish.

**Request Body:**
```json
{
  "enabled": true  // yoki false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "2FA yoqildi",
  "twoFactorEnabled": true
}
```

**Error Responses:**
- `400`: Avval telefon raqamingizni tasdiqlang (2FA yoqishda)
- `404`: Foydalanuvchi topilmadi

**Eslatma:** 2FA yoqish uchun telefon raqami avval tasdiqlanganligini tekshiradi.

---

## 📊 5. Xavfsizlik Holati

### `GET /users/:id/security/status`

Foydalanuvchining xavfsizlik holatini olish.

**Success Response (200):**
```json
{
  "data": {
    "phoneVerified": true,
    "emailVerified": true,
    "twoFactorEnabled": false,
    "lastPasswordChange": "2024-06-20T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `404`: Foydalanuvchi topilmadi

---

## 🗄️ Database Schema

Qo'shimcha ustunlar:

```sql
-- Telefon tasdiqlash
phone_verification_code TEXT
phone_verification_expires TIMESTAMPTZ

-- Email tasdiqlash
email_verification_code TEXT
email_verification_expires TIMESTAMPTZ

-- 2FA va parol
two_factor_enabled BOOLEAN DEFAULT false
last_password_change TIMESTAMPTZ
```

---

## 🔒 Xavfsizlik Tamoyillari

1. **Kod Muddati:** 
   - SMS kod: 10 daqiqa
   - Email kod: 15 daqiqa

2. **Parol Xavfsizligi:**
   - Minimal uzunlik: 6 ta belgi
   - Parollar bcrypt bilan hash qilinadi

3. **Ma'lumotlar Saqlanishi:**
   - Tasdiqlash kodlari tasdiqlangandan keyin o'chiriladi
   - Muddati tugagan kodlar avtomatik bekor qilinadi

4. **Validatsiya:**
   - Telefon format: `+998XXXXXXXXX` (O'zbekiston)
   - Email format: Standard email validatsiya
   - Kod format: 6 ta raqam

---

## 📝 Integratsiya Misoli (Frontend)

```typescript
// Parolni o'zgartirish
const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const response = await fetch(`/api/users/${userId}/security/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.error?.message || 'Parol o'zgartirilmadi');
  }
  
  return await response.json();
};

// Telefon tasdiqlash
const sendPhoneVerification = async (userId: string, phone: string) => {
  const response = await fetch(`/api/users/${userId}/security/send-phone-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone })
  });
  
  return await response.json();
};

const verifyPhone = async (userId: string, phone: string, code: string) => {
  const response = await fetch(`/api/users/${userId}/security/verify-phone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code })
  });
  
  return await response.json();
};
```

---

## ⚙️ Konfiguratsiya

`.env` faylida quyidagi sozlamalarni kiriting:

```env
# SMS Provider (Eskiz.uz)
SMS_PROVIDER_URL=https://notify.eskiz.uz/api
SMS_PROVIDER_TOKEN=your_eskiz_token

# Email Provider (SMTP)
EMAIL_PROVIDER_HOST=smtp.gmail.com
EMAIL_PROVIDER_PORT=587
EMAIL_PROVIDER_USER=your_email@gmail.com
EMAIL_PROVIDER_PASSWORD=your_app_password
EMAIL_FROM=noreply@qashqadaryostartup.uz
```

---

## 🚀 Keyingi Qadamlar

1. **SMS Provider Integratsiyasi:**
   - Eskiz.uz: https://documenter.getpostman.com/view/663428/RzfmES4z
   - Playmobile.uz: Contact for API docs

2. **Email Provider Integratsiyasi:**
   - NodeMailer (SMTP)
   - SendGrid
   - AWS SES

3. **Session Management:**
   - Faol sessiyalarni ko'rsatish
   - Sessiyalarni tugatish funksiyasi

4. **Login History:**
   - Kirish tarixini database ga saqlash
   - Muvaffaqiyatsiz urinishlarni monitoring qilish

5. **Rate Limiting:**
   - SMS/Email yuborish uchun limit qo'shish
   - Parol urinish limitlari
