# 🏥 Pharmacy Inventory System
## ระบบคลังยาสำหรับโรงพยาบาล

ระบบจัดการคลังยาและการเบิกยาสำหรับโรงพยาบาลทั่วประเทศ พัฒนาด้วย Next.js 16 และ Prisma 7

---

## ✨ Features - คุณสมบัติหลัก

### 📦 การจัดการยา (Drug Management)
- เพิ่ม/แก้ไข/ลบข้อมูลยา
- จัดหมวดหมู่ยา
- ค้นหายาด้วยชื่อ/รหัส/ชื่อสามัญ
- กำหนดสต็อกขั้นต่ำและจุดสั่งซื้อใหม่

### 🏥 การจัดการโรงพยาบาล (Hospital Management)
- เพิ่ม/แก้ไขข้อมูลโรงพยาบาล
- จัดกลุ่มตามจังหวัดและประเภทสถานบริการ
- ติดตามข้อมูลการอัพเดทล่าสุด

### 💊 การจัดการคลังยา (Inventory Management)
- ติดตามสต็อกยาแยกตามโรงพยาบาล
- ติดตามวันหมดอายุ
- แจ้งเตือนยาใกล้หมด/ใกล้หมดอายุ
- ระบบ Lot Number

### 📋 การเบิกยา (Drug Requests)
- สร้างใบเบิกยา
- ติดตามสถานะการเบิก
- ประวัติการเบิกยา

### 👥 ระบบผู้ใช้ (User Management)
- Authentication ด้วย NextAuth.js v5
- Role-based access control (ADMIN, PHARMACIST, STAFF, VIEWER)
- จัดการผู้ใช้แยกตามโรงพยาบาล

---

## 🛠 Tech Stack

### Frontend
- **Next.js 16** - React framework
- **React 19** - UI library
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** - Server-side API
- **Prisma 7** - ORM
- **SQLite/LibSQL** - Database
- **NextAuth.js v5** - Authentication
- **bcryptjs** - Password hashing

### Development
- **TypeScript** - Type safety
- **Vitest** - Testing
- **ESLint** - Linting

---

## 🚀 Installation & Setup

### ความต้องการระบบ (Requirements)
- Node.js 18.x หรือใหม่กว่า
- npm หรือ yarn หรือ pnpm

### ขั้นตอนการติดตั้ง

1. **Clone repository**
```bash
git clone <repository-url>
cd pharmacy-system
```

2. **ติดตั้ง dependencies**
```bash
npm install
# หรือ
yarn install
# หรือ
pnpm install
```

3. **สร้างไฟล์ `.env`**
```bash
cp .env.example .env
```

4. **แก้ไข `.env` ตามที่ต้องการ**
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NODE_ENV="development"
```

5. **สร้างฐานข้อมูลและ seed ข้อมูลเริ่มต้น**
```bash
npx prisma db push
npx prisma generate
```

6. **สร้าง admin user เริ่มต้น**
```bash
# เรียก API ผ่าน browser หรือ curl
# GET http://localhost:9401/api/seed-admin
```

7. **รันโปรเจกต์**
```bash
npm run dev
```

8. **เปิด browser ไปที่**
```
http://localhost:9401
```

---

## 🔐 Environment Variables

สร้างไฟล์ `.env` จาก template `.env.example`:

```env
# Database Configuration
# - SQLite: file:./dev.db (default สำหรับ development)
# - LibSQL: libsql://your-database.turso.io
# - PostgreSQL: postgresql://user:password@host:port/database
DATABASE_URL="file:./dev.db"

# NextAuth.js Secret
# ใช้สำหรับเข้ารหัส session และ JWT tokens
# สร้างด้วยคำสั่ง: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"

# Application Environment
# development | production | test
NODE_ENV="development"

# Server Port (Optional)
PORT="9401"
```

---

## 🏃 Running the Project

### Development mode
```bash
npm run dev
```
เปิด http://localhost:9401

### Production mode
```bash
npm run build
npm start
```

### Running tests
```bash
npm run test          # รัน tests ครั้งเดียว
npm run test:watch    # รัน tests แบบ watch mode
npm run test:coverage # รัน tests พร้อม coverage
```

### Linting
```bash
npm run lint
```

---

## 🔑 Default Credentials

### Admin Account (หลังจาก seed)
```
Username: admin
Password: admin123
```

⚠️ **ควรเปลี่ยนรหัสผ่านทันทีหลังจาก deploy ไป production**

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/callback/credentials` | Login |
| POST | `/api/auth/signout` | Logout |

### Drugs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/drugs` | ดึงรายการยาทั้งหมด |
| POST | `/api/drugs` | สร้างยาใหม่ |
| GET | `/api/drugs/[id]` | ดึงข้อมูลยาตาม ID |
| PUT | `/api/drugs/[id]` | อัพเดทข้อมูลยา |
| DELETE | `/api/drugs/[id]` | ลบยา |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory` | ดึงข้อมูลคลังยา |
| POST | `/api/inventory` | เพิ่ม/อัพเดทสต็อกยา |
| GET | `/api/inventory/[id]` | ดึงข้อมูลคลังยาตาม ID |
| GET | `/api/inventory/[id]/transactions` | ดึงประวัติการเคลื่อนไหว |

### Hospitals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hospitals` | ดึงรายการโรงพยาบาล |
| POST | `/api/hospitals` | สร้างโรงพยาบาลใหม่ |
| GET | `/api/hospitals/[id]` | ดึงข้อมูลโรงพยาบาล |
| PUT | `/api/hospitals/[id]` | อัพเดทข้อมูลโรงพยาบาล |

### Drug Requests (ใบเบิกยา)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/requests` | ดึงรายการใบเบิกยา |
| POST | `/api/requests` | สร้างใบเบิกยาใหม่ |
| GET | `/api/requests/[id]` | ดึงข้อมูลใบเบิกยา |
| PUT | `/api/requests/[id]` | อัพเดทสถานะใบเบิกยา |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | ดึงรายการผู้ใช้ (Admin only) |
| POST | `/api/users` | สร้างผู้ใช้ใหม่ (Admin only) |
| GET | `/api/users/[id]` | ดึงข้อมูลผู้ใช้ |
| PUT | `/api/users/[id]` | อัพเดทข้อมูลผู้ใช้ |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/drug-categories` | ดึงหมวดยาทั้งหมด |
| POST | `/api/drug-categories` | สร้างหมวดยาใหม่ |
| GET | `/api/provinces` | ดึงจังหวัดทั้งหมด |
| POST | `/api/provinces` | สร้างจังหวัดใหม่ |
| GET | `/api/facility-types` | ดึงประเภทสถานบริการ |

---

## 📁 Project Structure

```
pharmacy-system/
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Dashboard page
│   │   ├── drugs/          # Drug management pages
│   │   ├── hospitals/      # Hospital pages
│   │   ├── inventory/      # Inventory pages
│   │   ├── requests/       # Drug request pages
│   │   ├── settings/       # Settings pages
│   │   └── login/          # Login page
│   ├── components/         # React components
│   ├── generated/          # Prisma generated files
│   ├── lib/                # Utility functions
│   │   └── prisma.ts       # Prisma client
│   └── types/              # TypeScript types
│       └── api.ts          # API types
├── __tests__/              # Test files
│   ├── auth.test.ts        # Authentication tests
│   ├── drugs.test.ts       # Drugs API tests
│   └── inventory.test.ts   # Inventory tests
├── .env.example            # Environment template
├── package.json
├── tsconfig.json
└── vitest.config.ts        # Test configuration
```

---

## 🧪 Testing

โปรเจกต์นี้ใช้ Vitest สำหรับ unit tests:

```bash
# รัน tests ทั้งหมด
npm run test

# รัน tests แบบ watch mode
npm run test:watch

# รัน tests พร้อม coverage report
npm run test:coverage
```

### Test Files
- `__tests__/auth.test.ts` - ทดสอบระบบ authentication
- `__tests__/drugs.test.ts` - ทดสอบ API ยา
- `__tests__/inventory.test.ts` - ทดสอบ API คลังยา

---

## 🔒 Security Notes

1. **Password Hashing**: ระบบใช้ bcrypt สำหรับ hashing passwords (ขึ้นต้นด้วย `$2`)
2. **Session Management**: ใช้ JWT-based session ด้วย NextAuth.js v5
3. **Role-based Access**: ควบคุมการเข้าถึง API ตามบทบาทผู้ใช้
4. **Environment Variables**: ไม่ commit `.env` เข้า repository

⚠️ **สำหรับ Production:**
- เปลี่ยน `NEXTAUTH_SECRET` เป็นค่า random ที่ปลอดภัย
- เปลี่ยนรหัสผ่าน default admin
- ใช้ database server (PostgreSQL/MySQL) แทน SQLite
- เปิดใช้ HTTPS

---

## 📝 License

MIT License

---

## 👨‍💻 Authors

Pharmacy System Development Team

---

## 🙏 Acknowledgments

- Next.js Team
- Prisma Team
- Tailwind CSS Team
- Open Source Community