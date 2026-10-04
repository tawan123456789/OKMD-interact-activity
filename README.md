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

## Docker

รันทั้งแอปเป็น container เดียว (Express serve ทั้ง API และ React build)

```bash
docker compose up -d --build
```

- แอปจะเปิดที่ **http://localhost** (compose map host port `80` → container `3000`)
- `config/` และ `storage/` ถูก bind-mount จาก host จึง **persist** หลัง restart / rebuild
- ดู log: `docker compose logs -f`
- หยุด: `docker compose down` (ข้อมูลใน `config/` และ `storage/` ยังอยู่)

เปลี่ยนพอร์ต host ได้ที่ `docker-compose.yml` เช่น `"8080:3000"`

---

## Deploy บน Google Cloud VM

ขั้นตอนสำหรับ Compute Engine VM (Debian/Ubuntu):

1. **สร้าง VM** – เลือก e2-small ขึ้นไป, ติ๊ก "Allow HTTP traffic" (เปิด firewall port 80)
   หากไม่ได้ติ๊กตอนสร้าง ให้เพิ่ม firewall rule เปิด TCP `80` สำหรับ tag ของ VM

2. **ติดตั้ง Docker บน VM**

   ```bash
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose-plugin git
   sudo systemctl enable --now docker
   sudo usermod -aG docker $USER   # แล้ว logout/login ใหม่หนึ่งครั้ง
   ```

3. **ดึงโค้ดและรัน**

   ```bash
   git clone https://github.com/tawan123456789/OKMD-interact-activity.git
   cd OKMD-interact-activity
   docker compose up -d --build
   ```

4. **เข้าใช้งาน** – เปิด `http://<VM_EXTERNAL_IP>` ในเบราว์เซอร์

**อัปเดตเวอร์ชันใหม่**

```bash
git pull
docker compose up -d --build
```

**Backup ข้อมูล** – สำรองเฉพาะสองโฟลเดอร์นี้ก็พอ:

```bash
tar czf okmd-backup.tar.gz config storage
```

> หมายเหตุ: ถ้าต้องการ HTTPS แนะนำวาง reverse proxy (Nginx/Caddy) หรือใช้
> Google Cloud Load Balancer หน้า container นี้ ตัวแอปเองให้บริการผ่าน HTTP ที่พอร์ต 3000

### Troubleshooting: permission / เขียนไฟล์ config หรืออัปโหลดรูปไม่ได้

Container รันด้วย user `node` (ไม่ใช่ root) แต่โฟลเดอร์ `config/` และ `storage/`
ที่ bind-mount จาก host มักเป็นเจ้าของ `root` ทำให้เขียนไม่ได้ (EACCES)

โปรเจกต์นี้จัดการให้อัตโนมัติแล้วผ่าน `docker-entrypoint.sh` ซึ่งจะ `chown`
โฟลเดอร์ที่ mount ตอนเริ่ม container ก่อนจะลด privilege ลงเป็น `node`

ถ้ายังเจอปัญหา (เช่นจาก image เวอร์ชันเก่า) ให้ rebuild ใหม่:

```bash
docker compose down
docker compose up -d --build
```

หรือแก้ ownership บน host เองครั้งเดียว (UID ของ node คือ 1000):

```bash
sudo chown -R 1000:1000 config storage
```

> อย่ารันด้วย `sudo docker ...` แล้วแก้ไฟล์ด้วย user ปกติสลับกันไปมา เพราะจะทำให้
> ownership ปนกัน หากไฟล์ที่ commit มากับ repo เป็นของ root ก็ใช้คำสั่ง `chown` ด้านบนได้

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
| `/number-cut`           | Number Cut Game             |
| `/number-cut/edit`      | Number Cut Config           |

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
| GET    | `/api/config/number-cut`          | อ่าน config Number Cut         |
| PUT    | `/api/config/number-cut`          | บันทึก config Number Cut       |
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
