# OKMD Interactive Activities

เว็บแอปพลิเคชันสำหรับดำเนินกิจกรรม Interactive ผ่านจอ (Projector / TV / จอขนาดใหญ่)
ควบคุมโดยผู้ดำเนินกิจกรรม (host-controlled activity screen)

ประกอบด้วย 3 เกมและ Admin Console:

- **Random Number** – สุ่มตัวเลขจากช่วงที่กำหนด
- **Guess the Word** – เกมทายตัวอักษรเพื่อเปิดคำที่ซ่อนอยู่ (รองรับภาษาไทย)
- **Guess the Picture** – เปิดแผ่นป้ายเพื่อทายภาพ (จำนวนแผ่นป้ายกำหนดได้ต่อรูป)

Config ทั้งหมด persist ลงไฟล์ JSON จริงภายในโปรเจกต์ ไม่ใช้ database ใด ๆ

---

## Requirements

- Node.js 18+ (พัฒนา/ทดสอบด้วย Node 24)
- npm 9+

ไม่ต้องใช้ cloud service ใด ๆ (ไม่ต้องมี Firebase / Supabase / MongoDB / PostgreSQL / AWS / Cloudinary)

---

## Installation

```bash
npm install
```

คำสั่งเดียวติดตั้ง dependencies ของทั้ง `server` และ `client` (ใช้ npm workspaces)

---

## Development

```bash
npm run dev
```

คำสั่งนี้จะรันพร้อมกัน:

- Backend (Express) ที่ `http://localhost:3000`
- Frontend (Vite) ที่ `http://localhost:5173`

เปิดเบราว์เซอร์ที่ **http://localhost:5173** เพื่อเข้าสู่ Admin Console
(Vite dev server proxy `/api` และ `/storage` ไปยัง backend อัตโนมัติ)

---

## Production build

```bash
npm run build
npm start
```

- `npm run build` – build client (Vite) และ compile server (TypeScript → `server/dist`)
- `npm start` – รัน Express ที่ serve ทั้ง API และ React production build เป็น service เดียว

จากนั้นเปิด **http://localhost:3000** จะเข้าสู่ Admin Console ทันที

เปลี่ยนพอร์ตได้ด้วย environment variable `PORT`

---

## Project structure

```text
okmd-meeting-games/
├── package.json            # root workspace + scripts (dev / build / start / test)
├── config/                 # persisted game config (JSON)
│   ├── random-number.json
│   ├── guess-word.json
│   └── guess-picture.json
├── storage/
│   └── images/             # uploaded images (UUID filenames)
├── server/                 # Express + TypeScript backend
│   └── src/
│       ├── index.ts        # app entry, static serving, SPA fallback
│       ├── storage.ts      # atomic config read/write + defaults
│       ├── validation.ts   # config validation (pure, tested)
│       ├── paths.ts        # resolved project paths
│       └── routes/
│           ├── config.ts   # config GET/PUT endpoints
│           └── images.ts   # image upload/delete
└── client/                 # React + TypeScript + Vite frontend
    └── src/
        ├── components/     # AppHeader, AdminGameCard, GameToolbar, EditLayout,
        │                   # FullscreenButton, ConfirmDialog, Toast, LoadingScreen, ...
        ├── games/
        │   ├── random-number/
        │   ├── guess-word/
        │   └── guess-picture/
        ├── pages/          # AdminConsole, NotFound
        ├── hooks/          # useConfig, useFullscreen, useItemSelection
        ├── services/       # api.ts (typed fetch layer)
        ├── utils/          # random, guessWord, pictureGrid (pure logic + tests)
        ├── styles/         # theme.css (design tokens), form.module.css
        └── types.ts
```

---

## How configs are stored

- Game config ถูกเก็บเป็นไฟล์ JSON ใน `config/`
- Backend อ่าน/เขียนไฟล์เหล่านี้ผ่าน REST API
- การเขียนใช้วิธี **atomic write** (เขียนไฟล์ชั่วคราวแล้ว rename ทับ) เพื่อกันไฟล์เสียหากถูก interrupt
- ถ้าไฟล์ config ไม่มีตอน start server ระบบจะสร้าง default ให้อัตโนมัติ
- ข้อมูลไม่หายหลัง restart server
- `localStorage` ใช้เฉพาะ UI preference เท่านั้น ไม่เก็บ game config

---

## How image uploads are stored

- อัปโหลดผ่าน `POST /api/images` (field name `image`)
- รองรับ `.jpg .jpeg .png .webp`, จำกัดขนาด 10 MB
- validate ทั้ง MIME type และ extension, ไม่ใช้ชื่อไฟล์จาก client โดยตรง
- บันทึกลง `storage/images/` ด้วยชื่อไฟล์แบบ UUID เช่น `xxxxxxxx-....png`
- Serve ผ่าน URL `/storage/images/<filename>`
- ลบด้วย `DELETE /api/images/:filename` (ป้องกัน path traversal)

---

## How to reset config

ลบไฟล์ใน `config/` แล้ว restart server — ระบบจะสร้าง default config ใหม่ให้:

```bash
# ตัวอย่าง (PowerShell)
Remove-Item config\random-number.json, config\guess-word.json, config\guess-picture.json
npm start
```

Default:

- `random-number.json` → `{ "min": 1, "max": 100 }`
- `guess-word.json` → `{ "words": ["KNOWLEDGE", "CREATIVITY", "OPPORTUNITY"] }`
- `guess-picture.json` → `{ "pictures": [] }`

ลบรูปที่อัปโหลดได้โดยลบไฟล์ใน `storage/images/`

---

## Available routes (frontend)

| Route                   | หน้า                        |
| ----------------------- | --------------------------- |
| `/`                     | Admin Console               |
| `/random-number`        | Random Number Game          |
| `/random-number/edit`   | Random Number Config        |
| `/guess-word`           | Guess the Word Game         |
| `/guess-word/edit`      | Guess the Word Config       |
| `/guess-picture`        | Guess the Picture Game      |
| `/guess-picture/edit`   | Guess the Picture Config    |

---

## Available API

| Method | Endpoint                          | คำอธิบาย                       |
| ------ | --------------------------------- | ------------------------------ |
| GET    | `/api/health`                     | Health check                   |
| GET    | `/api/config/random-number`       | อ่าน config Random Number      |
| PUT    | `/api/config/random-number`       | บันทึก config Random Number    |
| GET    | `/api/config/guess-word`          | อ่าน config Guess the Word     |
| PUT    | `/api/config/guess-word`          | บันทึก config Guess the Word   |
| GET    | `/api/config/guess-picture`       | อ่าน config Guess the Picture  |
| PUT    | `/api/config/guess-picture`       | บันทึก config Guess the Picture|
| POST   | `/api/images`                     | อัปโหลดรูป (field `image`)     |
| DELETE | `/api/images/:filename`           | ลบรูป                          |

รูปแบบ response สม่ำเสมอ:

```json
{ "success": true, "data": {} }
```

```json
{ "success": false, "error": "Invalid number range" }
```

---

## Testing

```bash
npm test
```

รัน test ทั้ง server และ client (Vitest):

- **Random Number** – ผลลัพธ์อยู่ในช่วง min–max เสมอ
- **Guess the Word** – `BANANA` + `A` ⇒ `_ A _ A _ A`, guess ซ้ำไม่ทำให้ state เสีย, รองรับภาษาไทย
- **Guess the Picture** – สร้าง tiles ตาม `rows × columns` (2×2..8×8), random tile เลือกเฉพาะแผ่นที่ยังไม่เปิดและไม่ซ้ำ, reset/next picture rebuild grid ใหม่
- **Config validation** – reject ช่วงตัวเลขที่ผิด, config ว่าง, grid ที่ไม่ถูกต้อง

---

## Notes / อาจพัฒนาต่อ

- ยังไม่มีระบบเสียง — architecture เปิดทางให้เพิ่ม (`correct.mp3` / `reveal.mp3` / `random.mp3`) ในอนาคต
- Guess Picture รองรับ grid ต่อรูป 2×2 ถึง 8×8 (config เก่าที่ไม่มี grid จะ fallback เป็น 4×4)
- ไม่มี authentication / database / multiplayer / scoring ตามข้อกำหนด version แรก
- `react-router-dom` v6 มี advisory ที่เกี่ยวกับ SSR / open-redirect ซึ่งไม่กระทบแอปนี้ (เป็น SPA local ไม่มี SSR และไม่รับ redirect target จากภายนอก)
```
