# Project: OKMD Interactive Activity Website

สร้าง Web Application สำหรับใช้ทำกิจกรรม Interactive ผ่านจอ เช่น จอ Projector, TV หรือจอขนาดใหญ่ โดยมีผู้ดำเนินกิจกรรมเป็นคนควบคุมเกม

ระบบประกอบด้วย 4 ส่วนหลัก:

1. Admin Console
2. Random Number Game
3. Guess the Word Game
4. Guess the Picture Game

นอกจากนี้แต่ละเกมต้องมีหน้า Edit / Configuration สำหรับแก้ไขข้อมูลของเกม

เป้าหมายสำคัญคือ:

- ใช้งานง่ายมากสำหรับผู้ดำเนินกิจกรรม
- ตัวอักษรและปุ่มมีขนาดใหญ่ เหมาะกับการแสดงบน Projector / TV
- ผู้ชมสามารถเห็นสถานะเกมได้ชัดจากระยะไกล
- UI มีความสนุก แต่ยังดูเป็น Professional
- Theme ได้แรงบันดาลใจจาก OKMD
- Config ต้อง persist ลงไฟล์จริงภายใน project
- ไม่ใช้ database
- เมื่อ restart server ข้อมูล config ต้องไม่หาย
- รองรับภาษาไทยได้อย่างสมบูรณ์
- Responsive แต่ optimize หลักสำหรับ Desktop / 16:9 large display

---

# 1. Recommended Tech Stack

ใช้ stack ต่อไปนี้เป็นหลัก

## Frontend

- React
- TypeScript
- Vite
- React Router
- CSS Modules / Tailwind CSS หรือ equivalent styling solution
- Lucide React สำหรับ icon

## Backend

- Node.js
- Express
- TypeScript

Backend มีหน้าที่:

- อ่าน config
- เขียน config
- upload รูป
- delete รูป
- serve รูป
- validate config

## Persistence

ห้ามใช้ database

ให้เก็บข้อมูลไว้ภายใน project เช่น

```text
project-root/
│
├── client/
│
├── server/
│
├── config/
│   ├── random-number.json
│   ├── guess-word.json
│   └── guess-picture.json
│
├── storage/
│   └── images/
│
├── package.json
└── README.md
```

ถ้าต้องปรับโครงสร้างเพื่อให้เหมาะกับ Vite/Express สามารถทำได้ แต่หลักการต้องเหมือนเดิม:

```text
config/
storage/
```

ต้องอยู่ภายใน project และต้อง persist หลัง restart

ห้ามเก็บ config หลักไว้เฉพาะ localStorage

localStorage สามารถใช้เฉพาะ UI preference เช่น fullscreen preference ได้ แต่ game config ต้องมาจากไฟล์ JSON

---

# 2. General Architecture

สร้าง route อย่างน้อยดังนี้

```text
/                         Admin Console

/random-number            Random Number Game
/random-number/edit       Random Number Config

/guess-word               Guess the Word Game
/guess-word/edit          Guess the Word Config

/guess-picture            Guess the Picture Game
/guess-picture/edit       Guess the Picture Config
```

หน้าเกมและหน้า config ต้องแยกจากกันชัดเจน

ทุกหน้า Edit ต้องมี:

- Back to Admin
- Save
- Reset / Reload
- validation
- success notification หลัง save
- error notification เมื่อ save ไม่สำเร็จ

ทุกหน้า Game ต้องมี:

- Home / Admin button ขนาดเล็ก
- Reset Game
- Fullscreen button
- เน้นพื้นที่เกมมากที่สุด
- ไม่มี form/config ที่ไม่จำเป็นปรากฏบนหน้าจอเกม

---

# 3. Admin Console

หน้า `/` คือหน้าแรกของระบบ

ออกแบบเป็น Control Dashboard

Header:

```text
OKMD Interactive Activities
```

หรือ

```text
OKMD Activity Console
```

ด้านล่างเป็น Game Cards จำนวน 3 cards

## Card 1

Random Number

คำอธิบายสั้น:

```text
สุ่มตัวเลขจากช่วงที่กำหนด
```

มี 2 ปุ่ม:

```text
PLAY
EDIT
```

PLAY →

```text
/random-number
```

EDIT →

```text
/random-number/edit
```

---

## Card 2

Guess the Word

คำอธิบาย:

```text
เกมทายตัวอักษรเพื่อเปิดคำที่ซ่อนอยู่
```

PLAY →

```text
/guess-word
```

EDIT →

```text
/guess-word/edit
```

---

## Card 3

Guess the Picture

คำอธิบาย:

```text
เปิดแผ่นป้ายเพื่อทายภาพที่ซ่อนอยู่
```

PLAY →

```text
/guess-picture
```

EDIT →

```text
/guess-picture/edit
```

---

# 4. Random Number Game

Route:

```text
/random-number
```

## Objective

สร้างเกมสุ่มตัวเลขตาม range ที่ Admin ตั้งไว้

ตัวอย่าง config:

```json
{
  "min": 1,
  "max": 100
}
```

## UI

กลางหน้าจอแสดงเลขขนาดใหญ่มาก

Initial state:

```text
?
```

หรือ

```text
READY
```

ด้านล่างมีปุ่มใหญ่:

```text
RANDOM
```

เมื่อกด RANDOM:

1. สุ่ม integer ตั้งแต่ min ถึง max
2. แสดง animation เลขเปลี่ยนอย่างรวดเร็วประมาณ 0.5–1 วินาที
3. หยุดที่เลขที่สุ่มได้
4. แสดงเลขผลลัพธ์ขนาดใหญ่มาก
5. สามารถกด RANDOM ใหม่ได้ทันที

ไม่จำเป็นต้องป้องกันเลขซ้ำ เว้นแต่สร้าง option เพิ่มโดยไม่ทำให้ UI ซับซ้อน

ควรมีข้อความเล็กด้านล่าง:

```text
Range: 1 – 100
```

---

# 5. Random Number Config

Route:

```text
/random-number/edit
```

Form:

```text
Minimum Number
[ 1 ]

Maximum Number
[ 100 ]
```

Validation:

```text
min must be integer
max must be integer
min <= max
```

Save แล้วเขียนลง:

```text
config/random-number.json
```

API ตัวอย่าง:

```text
GET /api/config/random-number
PUT /api/config/random-number
```

---

# 6. Guess the Word Game

Route:

```text
/guess-word
```

ลักษณะคล้าย Hangman แต่ไม่ต้องมีรูปคนแขวนคอและไม่ต้องมีจำนวนชีวิต

Objective คือเปิดคำจากการเดาตัวอักษร

ตัวอย่างคำ:

```text
KNOWLEDGE
```

Initial:

```text
_ _ _ _ _ _ _ _ _
```

ตัวอย่างภาษาไทย:

```text
ความรู้
```

ต้องรองรับ Unicode / Thai characters อย่างถูกต้อง

---

# 7. Guess the Word Logic

เมื่อเริ่มเกม:

1. เลือกคำหนึ่งคำจาก config
2. ซ่อนตัวอักษรทั้งหมด
3. แสดง keyboard บนหน้าจอ

เมื่อกดตัวอักษรบน keyboard:

### ถ้าทายถูก

เช่นคำ:

```text
BANANA
```

ผู้ใช้กด:

```text
A
```

ผลลัพธ์ต้องเป็น:

```text
_ A _ A _ A
```

ต้องเปิดตัวอักษร A ทุกตำแหน่งพร้อมกัน

### ถ้าทายผิด

คำไม่เปลี่ยน

แต่ปุ่มตัวอักษรนั้นต้องเปลี่ยนสถานะเป็น:

```text
USED / WRONG
```

และไม่สามารถกดซ้ำได้

---

# 8. Keyboard

ต้องแสดง keyboard บนหน้าจออย่างชัดเจน

สำหรับภาษาอังกฤษ:

```text
A B C D E F G H I J
K L M N O P Q R S T
U V W X Y Z
```

สำหรับภาษาไทยให้รองรับตัวอักษรไทยที่จำเป็นสำหรับเกม

สามารถ implement เป็นชุดตัวอักษรภาษาไทย หรือ generate keyboard ตาม character set ที่เหมาะสม

แต่ต้อง:

- ใช้ Unicode อย่างถูกต้อง
- ไม่ split Thai text ด้วย logic ที่ทำให้ combining mark แตกผิดตำแหน่ง
- รองรับคำภาษาไทย

ถ้าคำมี space:

```text
KNOWLEDGE IS OPPORTUNITY
```

space ต้องแสดงเป็นช่องว่างตั้งแต่แรก ไม่ต้องทาย

เครื่องหมายพิเศษ เช่น:

```text
-
'
&
```

สามารถ reveal ตั้งแต่เริ่มเกมได้

---

# 9. Guess Word States

Keyboard button มีสถานะอย่างน้อย:

```text
unused
correct
wrong
```

Suggested visual:

```text
unused   = white / neutral
correct  = success highlight
wrong    = dark / muted
```

เมื่อทายครบ:

แสดง message เช่น

```text
CORRECT!
```

และแสดงคำเต็มอย่างเด่นชัด

มี action:

```text
NEXT WORD
RESET
```

RESET = เริ่มคำเดิมใหม่

NEXT WORD = ไปคำถัดไปหรือสุ่มคำใหม่จาก list

---

# 10. Guess Word Config

Route:

```text
/guess-word/edit
```

Admin สามารถเพิ่มหลายคำได้

เช่น:

```json
{
  "words": [
    "KNOWLEDGE",
    "CREATIVITY",
    "OPPORTUNITY",
    "INNOVATION"
  ]
}
```

UI เป็น list editor

ตัวอย่าง:

```text
WORDS

1. [ KNOWLEDGE                 ] [DELETE]
2. [ CREATIVITY                ] [DELETE]
3. [ OPPORTUNITY               ] [DELETE]

[ + ADD WORD ]

                        [ SAVE ]
```

ต้องสามารถ:

- Add word
- Edit word
- Delete word
- Save
- Cancel/Reload

Validation:

- ต้องมีอย่างน้อย 1 word
- word ต้องไม่เป็น empty string
- trim whitespace ก่อน save
- รองรับภาษาไทย
- รองรับภาษาอังกฤษ
- ป้องกัน duplicate word แบบ exact match หรือแจ้งเตือน

Save ลง:

```text
config/guess-word.json
```

API:

```text
GET /api/config/guess-word
PUT /api/config/guess-word
```

---

# 11. Guess the Picture Game

Route:

```text
/guess-picture
```

Concept:

มีรูปภาพหนึ่งรูปถูกปิดไว้ด้วย tiles / panels

ตัวอย่าง:

```text
┌────┬────┬────┬────┐
│ 01 │ 02 │ 03 │ 04 │
├────┼────┼────┼────┤
│ 05 │ 06 │ 07 │ 08 │
├────┼────┼────┼────┤
│ 09 │ 10 │ 11 │ 12 │
├────┼────┼────┼────┤
│ 13 │ 14 │ 15 │ 16 │
└────┴────┴────┴────┘
```

ด้านหลังคือรูปภาพ

เริ่มต้น tile ปิดภาพทั้งหมด

---

# 12. Manual Tile Reveal

ผู้ดำเนินกิจกรรมสามารถ click tile ไหนก็ได้

เมื่อ click:

```text
tile disappears
```

และเห็นรูปภาพด้านหลังเฉพาะตำแหน่งนั้น

Tile ที่เปิดแล้ว:

- click ซ้ำแล้วไม่ต้องทำอะไร
- ไม่ต้องกลับไปปิดใหม่

ใช้ transition เช่น:

```text
fade
flip
scale
```

แต่ animation ต้องสั้นและไม่รบกวนกิจกรรม

---

# 13. Random Tile Reveal

มีปุ่ม:

```text
RANDOM TILE
```

เมื่อกด:

1. หารายการ tile ที่ยังไม่เปิด
2. random 1 tile
3. reveal tile นั้น
4. ห้ามสุ่ม tile ที่เปิดแล้ว

เมื่อเปิดครบทั้งหมด:

ปุ่ม Random Tile disabled

---

# 14. Reveal Answer

Guess the Picture ไม่มีช่องกรอกคำตอบจากผู้เล่น

ผู้ดำเนินกิจกรรมเป็นผู้ตัดสินคำตอบ

ต้องมีปุ่ม:

```text
REVEAL ANSWER
```

เมื่อกด:

แสดงคำตอบอย่างเด่นชัด

ตัวอย่าง:

```text
ANSWER

สำนักงานบริหารและพัฒนาองค์ความรู้
```

สามารถใช้ modal / overlay / panel

แนะนำให้ Reveal Answer เปิดภาพทั้งหมดด้วยพร้อมกัน เพื่อให้กิจกรรมจบอย่างชัดเจน

หลังจาก reveal:

มีปุ่ม:

```text
NEXT PICTURE
RESET
```

---

# 15. Guess Picture Image Layout

รูปต้อง:

- อยู่กึ่งกลาง
- มี aspect ratio ที่เหมาะสม
- ใช้ object-fit: contain
- ห้าม crop รูปโดยไม่จำเป็น
- Background รอบรูปใช้ neutral color

Tile overlay ต้องตรงกับพื้นที่รูปจริง

สำหรับ version แรกใช้ grid:

```text
4 columns × 4 rows
```

รวม 16 tiles

ออกแบบ component ให้สามารถเปลี่ยน grid size ในอนาคตได้ง่าย แม้ยังไม่ต้อง expose config ใน UI

---

# 16. Guess Picture Config

Route:

```text
/guess-picture/edit
```

ต้องสามารถสร้างรายการ picture questions

แต่ละรายการประกอบด้วย:

```text
Image
Answer
```

ตัวอย่าง data:

```json
{
  "pictures": [
    {
      "id": "uuid-1",
      "image": "/storage/images/example-1.jpg",
      "answer": "Knowledge"
    },
    {
      "id": "uuid-2",
      "image": "/storage/images/example-2.jpg",
      "answer": "Creativity"
    }
  ]
}
```

Admin UI:

```text
PICTURE QUESTIONS

------------------------------------------------
IMAGE PREVIEW

[ image ]

Answer:
[ Knowledge ]

[ CHANGE IMAGE ] [ DELETE ]
------------------------------------------------

[ + ADD PICTURE ]

                           [ SAVE ]
```

---

# 17. Image Upload

ต้องมี backend endpoint สำหรับ upload รูป

รองรับ:

```text
.jpg
.jpeg
.png
.webp
```

กำหนด file size limit ที่เหมาะสม เช่น 10 MB

เมื่อ upload:

save ลง:

```text
storage/images/
```

ตั้งชื่อไฟล์อย่างปลอดภัย เช่น:

```text
uuid-original-extension.jpg
```

ห้าม trust filename จาก client โดยตรง

validate MIME type และ extension

API ตัวอย่าง:

```text
POST /api/images
DELETE /api/images/:filename
```

รูปต้องสามารถ serve จาก URL เช่น:

```text
/storage/images/xxxx.jpg
```

---

# 18. Guess Picture Config Persistence

Config เก็บที่:

```text
config/guess-picture.json
```

API:

```text
GET /api/config/guess-picture
PUT /api/config/guess-picture
```

Validation:

แต่ละ item ต้องมี:

```text
id
image
answer
```

answer ห้ามเป็น empty string

image ต้องอ้างอิงไฟล์ที่มีอยู่จริง

---

# 19. Game Selection

สำหรับ Guess Word และ Guess Picture ที่มีหลายรายการ

ตอนเปิดหน้าเกม:

เลือก item จาก config

สามารถใช้ random selection เป็น default

แต่เพิ่ม control ขนาดเล็กสำหรับ host:

```text
Previous
Next
Random
```

เพื่อเปลี่ยนโจทย์

เมื่อเปลี่ยนโจทย์:

reset game state อัตโนมัติ

---

# 20. Game State vs Config State

แยกอย่างชัดเจน

## Persistent Config

เช่น:

```text
word list
picture list
number range
```

ต้อง save ลง filesystem

## Temporary Game State

เช่น:

```text
current random number
letters already guessed
opened picture tiles
current question
answer revealed
```

ไม่ต้อง persist

refresh หน้าเกมสามารถ reset temporary state ได้

---

# 21. OKMD Visual Direction

Theme ให้ได้รับแรงบันดาลใจจาก visual language ของ OKMD แต่ไม่ต้อง clone website ตรง ๆ

ต้องให้ความรู้สึก:

```text
creative
bold
playful
educational
modern
high contrast
```

ใช้ visual hierarchy ชัดเจน

แนะนำ palette ในแนว:

```text
Black
White / Off-white
Bright Yellow
Orange
Red accent
```

ถ้า Kiro สามารถตรวจ official OKMD reference ได้ ให้ derive สีและ visual direction จาก reference ปัจจุบันแทนการยึด hex code แบบเดาสุ่ม

หลีกเลี่ยง:

- generic blue SaaS dashboard
- gradient purple startup UI
- glassmorphism มากเกินไป
- card UI แบบ corporate dashboard ทั่วไป
- shadow เยอะเกินไป

ควรเน้น:

- Flat color
- Strong border
- Bold typography
- Large shapes
- Editorial composition
- High contrast
- Playful geometric accent
- Large numbers
- Oversized headings

---

# 22. Design Tokens

สร้าง CSS variables เช่น:

```css
:root {
  --color-bg: #f5f5f0;
  --color-surface: #ffffff;
  --color-text: #111111;

  --color-primary: /* OKMD-inspired yellow */;
  --color-secondary: /* OKMD-inspired orange */;
  --color-accent: /* OKMD-inspired red */;

  --color-success: #1f8a4c;
  --color-muted: #777777;

  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;

  --border-width: 2px;
}
```

สามารถปรับ exact color หลังตรวจ reference

---

# 23. Typography

ต้องรองรับภาษาไทยดี

ใช้ font ที่อ่านภาษาไทยบนจอใหญ่ได้ง่าย

ถ้ามี Google Font available ให้เลือกเช่น:

```text
IBM Plex Sans Thai
Noto Sans Thai
Prompt
```

หรือ font ที่มี licensing เหมาะสม

Typography hierarchy:

```text
Page Title        48–72px
Game Result       120–240px
Game Word         64–120px
Button            20–32px
Admin Label       18–24px
Secondary text    16–20px
```

ใช้ responsive `clamp()` ได้

---

# 24. Large Screen / Projector UX

เนื่องจากระบบนี้ใช้สำหรับกิจกรรมผ่านจอ

game pages ต้อง optimize สำหรับ:

```text
1920 × 1080
16:9
```

และยังใช้งานได้ตั้งแต่ laptop ขึ้นไป

Random Number result ต้องกินพื้นที่หน้าจอส่วนใหญ่

Guess Word:

```text
word
keyboard
controls
```

ต้องมองเห็นทั้งหมดโดยไม่ต้อง scroll บน 1080p

Guess Picture:

```text
image + tiles
controls
```

ต้องมองเห็นทั้งหมดโดยไม่ scroll

---

# 25. Fullscreen

หน้า game ทุกเกมมีปุ่ม Fullscreen

ใช้ Browser Fullscreen API:

```javascript
document.documentElement.requestFullscreen()
```

และสามารถ exit fullscreen ได้

fullscreen control ไม่ควรเด่นกว่าปุ่มเล่นเกม

---

# 26. Accessibility

ต้องมี:

- keyboard focus state
- button contrast ที่เพียงพอ
- semantic HTML
- alt text สำหรับรูป
- ARIA label สำหรับ icon button
- ปุ่มไม่เล็กเกินไป
- status ไม่พึ่งสีอย่างเดียว

---

# 27. Backend File Safety

เวลา save config:

อย่า write แบบเสี่ยงทำไฟล์เสียถ้า process ถูก interrupt

Prefer:

1. validate data
2. write temporary file
3. replace config file

และ handle error อย่างเหมาะสม

ถ้า config file ไม่มีตอน start server:

ให้สร้าง default config อัตโนมัติ

ตัวอย่าง:

### random-number.json

```json
{
  "min": 1,
  "max": 100
}
```

### guess-word.json

```json
{
  "words": [
    "KNOWLEDGE",
    "CREATIVITY",
    "OPPORTUNITY"
  ]
}
```

### guess-picture.json

```json
{
  "pictures": []
}
```

---

# 28. API

สร้าง REST API อย่างน้อยดังนี้

```text
GET /api/health


GET /api/config/random-number
PUT /api/config/random-number


GET /api/config/guess-word
PUT /api/config/guess-word


GET /api/config/guess-picture
PUT /api/config/guess-picture


POST /api/images
DELETE /api/images/:filename
```

ใช้ JSON response format สม่ำเสมอ เช่น:

```json
{
  "success": true,
  "data": {}
}
```

error:

```json
{
  "success": false,
  "error": "Invalid number range"
}
```

---

# 29. Frontend Component Structure

ออกแบบ reusable components

ตัวอย่าง:

```text
src/
├── components/
│   ├── AppHeader.tsx
│   ├── AdminGameCard.tsx
│   ├── GameToolbar.tsx
│   ├── FullscreenButton.tsx
│   ├── ConfirmDialog.tsx
│   ├── Toast.tsx
│   └── LoadingScreen.tsx
│
├── games/
│   ├── random-number/
│   ├── guess-word/
│   └── guess-picture/
│
├── pages/
├── hooks/
├── services/
├── types/
└── utils/
```

ไม่จำเป็นต้องยึดชื่อ folder นี้แบบตายตัว แต่ codebase ต้อง modular

---

# 30. TypeScript Types

สร้าง types เช่น:

```typescript
interface RandomNumberConfig {
  min: number;
  max: number;
}

interface GuessWordConfig {
  words: string[];
}

interface PictureQuestion {
  id: string;
  image: string;
  answer: string;
}

interface GuessPictureConfig {
  pictures: PictureQuestion[];
}
```

อย่าใช้ `any` โดยไม่จำเป็น

---

# 31. Loading / Empty / Error States

ทุกหน้าต้อง handle state อย่างเหมาะสม

## Loading

แสดง loading UI

## Error

เช่น config load ไม่สำเร็จ:

```text
Unable to load game configuration.
Retry
```

## Empty Guess Word

```text
No words configured.
Go to Edit
```

## Empty Guess Picture

```text
No pictures configured.
Go to Edit
```

ห้าม crash

---

# 32. Confirmation

ก่อน delete word/picture ที่สำคัญให้มี confirmation

โดยเฉพาะ delete picture

ตัวอย่าง:

```text
Delete this picture?

Cancel
Delete
```

---

# 33. Saving UX

เมื่อมีการแก้ไข config แต่ยังไม่ได้ save:

แสดงสถานะ:

```text
Unsaved changes
```

เมื่อ save สำเร็จ:

```text
Saved successfully
```

ใช้ toast หรือ status indicator

Save button disabled ระหว่าง request

---

# 34. README

สร้าง README.md ที่อธิบาย:

```text
Project overview

Requirements

Installation

Development

Production build

Project structure

How configs are stored

How image uploads are stored

How to reset config

Available routes

Available API
```

ต้องสามารถเริ่ม project ใหม่ได้ด้วยขั้นตอนที่ชัดเจน เช่น:

```bash
npm install
npm run dev
```

ถ้า frontend/backend ต้อง run พร้อมกัน ให้สร้าง root script ที่ start ทั้งคู่

เช่น:

```bash
npm run dev
```

แล้วเปิดทั้ง:

```text
frontend
backend
```

โดยอัตโนมัติ

---

# 35. Development Requirement

ต้องสามารถ run local ได้โดยไม่ต้องใช้ external cloud service

ห้าม require:

```text
Firebase
Supabase
MongoDB
PostgreSQL
AWS
Cloudinary
```

ทุกอย่างต้องทำงาน local

---

# 36. Production Requirement

สร้าง production command เช่น:

```bash
npm run build
npm start
```

Prefer architecture ที่ Express สามารถ serve React production build ได้ เพื่อ deploy เป็น service เดียว

ตัวอย่าง:

```text
localhost:3000
```

เปิดแล้วเข้าสู่ Admin Console ทันที

---

# 37. Testing

เพิ่ม test อย่างน้อยสำหรับ core logic

## Random Number

ตรวจว่า:

```text
min <= result <= max
```

## Guess Word

ตรวจว่า:

```text
BANANA + guess A
=> _ A _ A _ A
```

และ repeated guess ไม่เปลี่ยน state ผิด

## Guess Picture

ตรวจว่า random tile:

- เลือกเฉพาะ tile ที่ปิด
- ไม่เลือก tile ซ้ำ
- disabled เมื่อเปิดครบ

## Config validation

ตรวจ invalid number range และ invalid empty configs

---

# 38. Important UX Detail

นี่ไม่ใช่เว็บไซต์สำหรับผู้เล่นแต่ละคนเปิดมือถือเล่น

เป็น:

```text
HOST-CONTROLLED ACTIVITY SCREEN
```

ผู้ดำเนินกิจกรรมยืนควบคุมจอหลัก

ดังนั้นให้ prioritize:

1. อ่านง่ายจากระยะไกล
2. คลิกง่าย
3. action หลักชัด
4. ไม่มี navigation รก
5. animation สนุกแต่เร็ว
6. reset game ได้รวดเร็ว
7. ไม่ต้อง login หลายขั้นตอน

---

# 39. Admin vs Audience Information

หน้า Game ไม่ควรแสดงข้อมูล config มากเกินไป

ตัวอย่าง:

Random Number:

ผู้ชมเห็น:

```text
42
RANDOM
```

ไม่ควรเห็น form min/max

Guess Picture:

คำเฉลยต้องไม่แสดงจนกด Reveal Answer

Guess Word:

คำจริงต้องไม่สามารถมองเห็นใน UI ก่อนเปิดครบ

ระวังอย่าใส่ answer ลง DOM แบบ plain visible text แล้วซ่อนด้วย CSS อย่างเดียวถ้าสามารถหลีกเลี่ยงได้

---

# 40. Animation

ใช้ animation แบบ subtle

## Random Number

rolling / count shuffle

## Guess Word

correct character:

```text
pop / fade in
```

## Guess Picture

tile:

```text
flip / fade
```

## Answer

```text
scale + fade
```

animation duration ประมาณ:

```text
150–500ms
```

ยกเว้น random number shuffle สามารถประมาณ 700–1000ms

---

# 41. Optional Sound Architecture

ยังไม่ต้องเพิ่ม sound ใน version แรก

แต่เขียน architecture ไม่ให้ขัดขวางการเพิ่ม:

```text
correct.mp3
reveal.mp3
random.mp3
```

ในอนาคต

---

# 42. Do Not Overengineer

Version แรกไม่ต้องมี:

- authentication
- user account
- database
- analytics
- multiplayer
- WebSocket
- cloud storage
- online leaderboard
- scoring system
- timer

เน้น core activity ให้เสถียรก่อน

---

# 43. Acceptance Criteria

งานถือว่าเสร็จเมื่อผ่านเงื่อนไขทั้งหมดต่อไปนี้

### Admin

- เปิด `/` แล้วเห็น 3 เกม
- ทุกเกมมี Play และ Edit
- navigation ทุกปุ่มทำงาน

### Random Number

- อ่าน range จาก JSON
- สุ่ม integer ถูกต้อง
- Edit range ได้
- Save แล้ว refresh/restart server ข้อมูลยังอยู่

### Guess Word

- เพิ่ม/แก้/delete word ได้
- save ลง JSON จริง
- เปิดหน้าเกมแล้วซ่อนคำ
- keyboard ใช้งานได้
- กดตัวอักษรถูกแล้วเปิดทุก occurrence
- ตัวอักษรที่ใช้แล้วแสดงสถานะ
- reset ได้
- next word ได้
- รองรับภาษาไทย

### Guess Picture

- Upload รูปได้
- รูป save ใน project
- ใส่ answer ได้
- มีหลาย picture questions ได้
- เปิด tile ด้วยการ click ได้
- Random Tile เปิดเฉพาะ tile ที่ยังไม่เปิด
- Reveal Answer แสดงเฉลย
- reset ได้
- next picture ได้
- config persist หลัง restart

### UI

- ใช้งาน 1920×1080 ได้โดยไม่ต้อง scroll ในหน้าเกม
- Fullscreen ทำงาน
- Theme สอดคล้องกับ OKMD-inspired visual direction
- รองรับภาษาไทย
- responsive
- ไม่มี console error

### Development

- `npm install` ใช้งานได้
- `npm run dev` ใช้งานได้
- `npm run build` ผ่าน
- README ครบ
- tests ผ่าน

---

# 44. Implementation Process

ก่อนเขียน code:

1. Inspect repository ปัจจุบันทั้งหมดก่อน
2. ตรวจว่ามี existing framework/config อะไรอยู่แล้ว
3. อย่าทำลาย code ที่มีอยู่โดยไม่จำเป็น
4. สรุป architecture ที่จะใช้
5. สร้าง backend persistence layer
6. สร้าง API
7. สร้าง base frontend/layout/theme
8. สร้าง Admin Console
9. สร้าง Random Number
10. สร้าง Guess Word
11. สร้าง Guess Picture
12. สร้าง Edit pages
13. เพิ่ม validation/error states
14. เพิ่ม responsive/fullscreen
15. เพิ่ม tests
16. run tests/build
17. แก้ TypeScript/lint/runtime errors
18. ตรวจ functionality จริง

อย่าหยุดเพียงสร้าง mock UI

ต้อง implement functionality จริงจนสามารถใช้งานได้

---

# 45. Final Verification

หลัง implementation ให้ทดสอบ flow จริง:

```text
Admin
↓
Edit Random Number
↓
change 1–100 → 50–80
↓
Save
↓
Play
↓
random number ต้องอยู่ระหว่าง 50–80
```

จากนั้น:

```text
Admin
↓
Edit Guess Word
↓
Add "KNOWLEDGE"
↓
Save
↓
Play
↓
guess K
↓
K _ _ _ _ _ _ _ _
```

และ:

```text
Admin
↓
Edit Guess Picture
↓
Upload image
↓
Set answer
↓
Save
↓
Play
↓
Manual Reveal
↓
Random Reveal
↓
Reveal Answer
↓
Next / Reset
```

จากนั้น restart server และตรวจว่า config + uploaded images ยังอยู่

---

# 46. Deliverables

เมื่อทำเสร็จให้รายงาน:

1. Architecture ที่ใช้
2. File/folder structure ที่สร้าง
3. API ที่สร้าง
4. Config file locations
5. Image storage location
6. Routes ทั้งหมด
7. คำสั่ง run development
8. คำสั่ง build/start production
9. Tests ที่เพิ่ม
10. ข้อจำกัดหรือสิ่งที่ควรพัฒนาต่อ

และให้ตรวจสอบเองว่า:

```bash
npm run build
```

ผ่านก่อนถือว่างานเสร็จ

# Additional Requirement — Configurable Picture Tile Grid

ปรับระบบ **Guess the Picture** ให้จำนวนแผ่นป้ายที่ปิดรูปสามารถกำหนดได้แยกสำหรับแต่ละรูป

จำนวนแผ่นป้ายของแต่ละรูปไม่ควรถูก fix ไว้ที่ 4×4 อีกต่อไป

ให้กำหนดผ่าน:

```text
Rows × Columns
```

เช่น:

```text
2 × 2 = 4 tiles
3 × 3 = 9 tiles
4 × 4 = 16 tiles
5 × 5 = 25 tiles
3 × 4 = 12 tiles
4 × 5 = 20 tiles
```

---

# Guess Picture Config Data

เปลี่ยน `PictureQuestion` ให้มีข้อมูล grid ของตัวเอง

ตัวอย่าง:

```typescript
interface PictureQuestion {
  id: string;
  image: string;
  answer: string;
  gridRows: number;
  gridColumns: number;
}
```

ตัวอย่าง JSON:

```json
{
  "pictures": [
    {
      "id": "uuid-1",
      "image": "/storage/images/example-1.jpg",
      "answer": "Knowledge",
      "gridRows": 3,
      "gridColumns": 3
    },
    {
      "id": "uuid-2",
      "image": "/storage/images/example-2.jpg",
      "answer": "Creativity",
      "gridRows": 4,
      "gridColumns": 4
    },
    {
      "id": "uuid-3",
      "image": "/storage/images/example-3.jpg",
      "answer": "Innovation",
      "gridRows": 5,
      "gridColumns": 5
    }
  ]
}
```

จำนวนแผ่นป้ายทั้งหมดคำนวณจาก:

```typescript
const totalTiles = gridRows * gridColumns;
```

ห้ามเก็บ `totalTiles` แยกถ้าไม่จำเป็น เพื่อป้องกันข้อมูลไม่ตรงกัน

---

# Guess Picture Edit UI

ในหน้า:

```text
/guess-picture/edit
```

แต่ละ Picture Question ต้องสามารถ config ได้ดังนี้:

```text
┌──────────────────────────────────────────┐
│ IMAGE                                    │
│                                          │
│          [ IMAGE PREVIEW ]               │
│                                          │
│ Answer                                   │
│ [ Knowledge                           ]  │
│                                          │
│ Tile Layout                              │
│                                          │
│ Rows              Columns                │
│ [ 4 ▼ ]           [ 4 ▼ ]               │
│                                          │
│ Total Tiles: 16                          │
│                                          │
│ [ CHANGE IMAGE ]            [ DELETE ]   │
└──────────────────────────────────────────┘
```

ควรมี preset ที่เลือกง่าย เช่น:

```text
2 × 2
3 × 3
3 × 4
4 × 4
4 × 5
5 × 5
```

และสามารถเลือก Rows / Columns เองได้

Recommended limits:

```text
Minimum rows: 2
Maximum rows: 8

Minimum columns: 2
Maximum columns: 8
```

ดังนั้นรองรับได้สูงสุด:

```text
8 × 8 = 64 tiles
```

เพื่อป้องกันจำนวน tile มากเกินไปจนใช้งานบน Projector ไม่สะดวก

---

# Live Grid Preview

ในหน้า Edit ควรมี preview เล็ก ๆ เพื่อให้ Admin เห็นรูปแบบของแผ่นป้ายก่อน Save

ตัวอย่างเมื่อเลือก:

```text
Rows: 3
Columns: 4
```

Preview:

```text
┌────┬────┬────┬────┐
│    │    │    │    │
├────┼────┼────┼────┤
│    │    │    │    │
├────┼────┼────┼────┤
│    │    │    │    │
└────┴────┴────┴────┘

12 Tiles
```

เมื่อ Admin เปลี่ยน Rows หรือ Columns preview ต้องเปลี่ยนทันที

---

# Guess Picture Game Grid

หน้า:

```text
/guess-picture
```

ต้องอ่านค่า:

```typescript
currentPicture.gridRows
currentPicture.gridColumns
```

แล้วสร้าง tile ตาม config

ตัวอย่าง:

```typescript
const totalTiles =
  currentPicture.gridRows *
  currentPicture.gridColumns;
```

สร้าง array:

```typescript
const tiles = Array.from({
  length: totalTiles
});
```

CSS Grid:

```typescript
gridTemplateColumns:
  `repeat(${currentPicture.gridColumns}, 1fr)`
```

และ:

```typescript
gridTemplateRows:
  `repeat(${currentPicture.gridRows}, 1fr)`
```

Grid overlay ต้องครอบ image area อย่างแม่นยำ

---

# Tile Numbering

แต่ละ Tile ควรมีหมายเลข

เช่น 4×4:

```text
┌────┬────┬────┬────┐
│ 01 │ 02 │ 03 │ 04 │
├────┼────┼────┼────┤
│ 05 │ 06 │ 07 │ 08 │
├────┼────┼────┼────┤
│ 09 │ 10 │ 11 │ 12 │
├────┼────┼────┼────┤
│ 13 │ 14 │ 15 │ 16 │
└────┴────┴────┴────┘
```

3×3:

```text
┌────┬────┬────┐
│ 01 │ 02 │ 03 │
├────┼────┼────┤
│ 04 │ 05 │ 06 │
├────┼────┼────┤
│ 07 │ 08 │ 09 │
└────┴────┴────┘
```

หมายเลขควร generate อัตโนมัติจาก index

```typescript
tileNumber = index + 1;
```

---

# Manual Reveal

ยังคง behavior เดิม

ผู้ดำเนินกิจกรรมสามารถ click tile ใดก็ได้

เมื่อ click:

```text
tile → revealed
```

ห้ามเปิด tile ซ้ำ

จำนวน tile ต้องไม่ขึ้นอยู่กับค่าคงที่ เช่น:

```typescript
16
```

ห้าม hard-code `16 tiles`

ทุก logic ต้องใช้:

```typescript
gridRows * gridColumns
```

---

# Random Tile Reveal

ปุ่ม:

```text
RANDOM TILE
```

ต้องรองรับจำนวนแผ่นป้ายแบบ dynamic

Logic:

1. หา tiles ที่ `revealed === false`
2. Random หนึ่ง tile จากรายการนั้น
3. Reveal
4. ห้าม random tile ที่เปิดแล้ว
5. เมื่อเปิดครบทุก tile ให้ disable ปุ่ม

ตัวอย่าง:

```typescript
const remainingTiles = tiles.filter(
  tile => !tile.revealed
);
```

ห้าม assume ว่ามี 16 tile

---

# Reveal Progress

เพิ่มข้อมูลจำนวนแผ่นที่เปิดแล้วบนหน้า Game

ตัวอย่าง:

```text
Opened 5 / 16
```

หรือกรณี 3×3:

```text
Opened 4 / 9
```

ข้อมูลนี้ควรอยู่ใน Game Toolbar หรือบริเวณที่ไม่รบกวนภาพ

คำนวณแบบ dynamic:

```typescript
revealedCount / totalTiles
```

---

# Reset Behavior

เมื่อกด:

```text
RESET
```

ให้:

- ปิด tile ทุกแผ่นกลับ
- reset revealed tile state
- ซ่อน answer
- คงรูปเดิม
- คง grid configuration ของรูปเดิม

---

# Next Picture Behavior

เมื่อกด:

```text
NEXT PICTURE
```

ให้โหลด config ของรูปใหม่

เช่น:

```text
Picture A
3 × 3
= 9 tiles
```

เปลี่ยนเป็น:

```text
Picture B
5 × 5
= 25 tiles
```

Grid ต้อง rebuild อัตโนมัติ

ห้ามใช้ state ของรูปก่อนหน้า

---

# Guess Picture Validation

เมื่อ Save config ให้ validate:

```text
image is required
answer is required

gridRows must be integer
gridColumns must be integer

gridRows >= 2
gridRows <= 8

gridColumns >= 2
gridColumns <= 8
```

ถ้า invalid:

ห้าม save และแสดงข้อความ error ที่ field นั้น

ตัวอย่าง:

```text
Rows must be between 2 and 8.
```

---

# Default Value

ตอนสร้าง Picture Question ใหม่ ให้ default เป็น:

```json
{
  "gridRows": 4,
  "gridColumns": 4
}
```

ดังนั้นค่าเริ่มต้นคือ:

```text
4 × 4 = 16 tiles
```

---

# Existing Config Migration

เนื่องจาก config เก่าอาจมี picture ที่ยังไม่มี:

```text
gridRows
gridColumns
```

backend/frontend ต้องรองรับ backward compatibility

หาก property ไม่มี:

```typescript
gridRows = 4;
gridColumns = 4;
```

ดังนั้น config เดิมยังเปิดได้โดยไม่ crash

เมื่อ Save ครั้งต่อไปจึงเขียนค่าใหม่ลง JSON

---

# Updated Guess Picture Acceptance Criteria

Guess Picture ถือว่าทำงานสมบูรณ์เมื่อ:

- Upload รูปได้
- ใส่ Answer ได้
- กำหนด Rows ต่อรูปได้
- กำหนด Columns ต่อรูปได้
- แสดง Total Tiles ได้
- มี Live Grid Preview ในหน้า Edit
- แต่ละรูปใช้ grid ต่างกันได้
- 3×3 ต้องสร้าง 9 tiles
- 4×4 ต้องสร้าง 16 tiles
- 5×5 ต้องสร้าง 25 tiles
- Manual Reveal ทำงานทุก grid size
- Random Reveal ทำงานทุก grid size
- Random Reveal ไม่เลือก tile ที่เปิดแล้ว
- เปิดครบแล้ว Random button disabled
- Reveal Answer ทำงาน
- Reset ทำงาน
- Next Picture เปลี่ยน grid ตาม config ของรูปใหม่
- Config persist หลัง restart server
- Config เก่าที่ไม่มี grid settings fallback เป็น 4×4

---

# Updated Tests

เพิ่ม test สำหรับ dynamic tile configuration

## Grid Generation

```text
2 × 2 → 4 tiles
3 × 3 → 9 tiles
3 × 4 → 12 tiles
4 × 4 → 16 tiles
5 × 5 → 25 tiles
```

## Random Reveal

สำหรับ:

```text
3 × 3
```

ต้องไม่มี tile index เกิน 8

สำหรับ:

```text
5 × 5
```

ต้องไม่มี tile index เกิน 24

## Reset

หลัง reveal บางส่วนแล้ว reset:

```text
revealedCount = 0
```

## Next Picture

จาก:

```text
Picture A = 3 × 3
```

ไป:

```text
Picture B = 5 × 5
```

ต้อง rebuild จาก:

```text
9 tiles
```

เป็น:

```text
25 tiles
```

โดยไม่มี state ค้างจากรูปเดิม

## Validation

ต้อง reject:

```text
1 × 4
0 × 0
9 × 4
4 × 20
decimal values
negative values
```

และ accept:

```text
2 × 2
3 × 4
4 × 4
5 × 5
8 × 8
```

---

# Important Implementation Rule

ห้ามมี magic number:

```typescript
16
```

สำหรับ Guess Picture logic

ให้ทุกส่วน derive จำนวนแผ่นป้ายจาก:

```typescript
const totalTiles =
  gridRows * gridColumns;
```

ทั้ง:

- rendering
- random selection
- progress
- reset
- completion detection
- reveal all
- testing

เพื่อให้ระบบรองรับจำนวนแผ่นป้ายของแต่ละรูปได้อย่างสมบูรณ์