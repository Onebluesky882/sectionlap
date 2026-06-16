breakdown_feature.md

Status: DRAFT

Owner: DEV

⸻

Purpose

Breakdown ของ features ที่ Dev วางแผนไว้ใน Planning.md
แต่ละ feature ถูก breakdown เป็น: สิ่งที่ต้องทำ / dependency / ระดับความยาก / priority

อ่านร่วมกับ Planning.md และ PIPELINE.md

⸻

## ภาพรวม AI Stack ที่ใช้ร่วมกันทุก feature

ก่อน build AI features ต้องมี shared layer นี้ก่อน:

* Claude API (claude-sonnet-4-6) — model หลักสำหรับทุก AI feature
* Streaming response — ใช้ SSE หรือ WebSocket ส่ง token ทีละตัว
* Context injection — inject section content / lesson plan เข้า prompt
* Backend AI Gateway — endpoint กลางที่ frontend เรียก แทนที่จะ call Claude โดยตรง

⸻

## TEACHER FEATURES

⸻

### T1 — AI Curriculum Designer
> จาก Topic เดียว แตกเป็น Lesson Tree อัตโนมัติ

**สิ่งที่ต้องทำ:**
* Teacher กรอก Topic เดียว (เช่น "HTML Basics")
* ระบบส่งให้ Claude สร้าง Lesson Tree (section → subsection → learning objective)
* Teacher ปรับ/approve tree ก่อน save
* Tree ที่ approved กลายเป็น section list ใน SectionLap

**Dependency:**
* Stage 6a เสร็จ (API + DB) — เก็บ lesson tree ลง DB
* Backend AI Gateway (shared layer)

**ระดับ:** Medium
**Priority:** HIGH — เป็น core differentiator

⸻

### T2 — AI Lesson Scope Checker
> ช่วย teacher ไม่หลุด scope ระหว่างสอน

**สิ่งที่ต้องทำ:**
* ดึง lesson plan / scope ของ section ปัจจุบัน
* Real-time monitor สิ่งที่ teacher พิมพ์หรือพูด (transcript)
* แจ้งเตือนเมื่อ content เริ่มออกนอก scope ที่กำหนด
* แสดง warning แบบ non-intrusive (side panel)

**Dependency:**
* T1 (Lesson Tree ต้องมีก่อน จึงรู้ scope)
* Live class page มี teacher input (ต้องเพิ่ม teacher text input หรือ transcript)

**ระดับ:** Hard
**Priority:** Medium — ต้องมี T1 ก่อน

⸻

### T3 — AI Teaching Script Generator
> สร้าง Script การสอนจาก lesson plan

**สิ่งที่ต้องทำ:**
* Teacher เลือก section/lesson จาก tree
* Claude สร้าง script: intro → concept → example → summary
* Script แสดงเป็น step-by-step ที่ teacher เดิน follow ได้
* Export เป็น PDF หรือ copy ได้

**Dependency:**
* T1 (ต้องมี lesson plan)
* Backend AI Gateway

**ระดับ:** Easy–Medium
**Priority:** HIGH — ใช้ก่อน live class ได้เลย ไม่ต้อง real-time

⸻

### T4 — AI Demo Project Builder
> สร้าง demo project ที่ follow document/learning

**สิ่งที่ต้องทำ:**
* Teacher ระบุ topic + tech stack
* Claude สร้าง starter project (files + code) ที่ตรงกับ lesson scope
* Project ส่งให้ student เป็น sandbox (zip หรือ online IDE link)
* Teacher ปรับได้ก่อน publish

**Dependency:**
* T1 (lesson scope)
* S6 (Portfolio/sandbox for student)
* ต้องการ sandbox infra (เช่น CodeSandbox embed หรือ self-host)

**ระดับ:** Hard
**Priority:** Low–Medium — ต้องมี sandbox infra ก่อน

⸻

### T5 — AI Quiz Generator
> สร้าง quiz ในระหว่างการสอน

**สิ่งที่ต้องทำ:**
* Teacher กด "Generate Quiz" ระหว่าง live class
* Claude สร้าง 3–5 คำถามจาก content ที่สอนไปแล้ว
* Student เห็น quiz popup ใน live class page (desktop + mobile)
* Teacher เห็นผล real-time (กี่คนตอบถูก/ผิด)

**Dependency:**
* Stage 4b เสร็จ (Sync service — ใช้ broadcast quiz ไปทุก client)
* Stage 6a เสร็จ (เก็บ quiz result)
* Backend AI Gateway

**ระดับ:** Hard
**Priority:** HIGH — differentiator ที่ชัดมาก

⸻

## SYSTEM FEATURES

⸻

### SYS1 — Calendar Booking
> ระบบจองเวลาเรียน

**สิ่งที่ต้องทำ:**
* Teacher สร้าง time slot สำหรับแต่ละ section
* Student จอง slot ที่ต้องการ
* ระบบ prevent double booking
* Reminder notification ก่อนเรียน

**Dependency:**
* Stage 6a (DB สำหรับ booking records)
* Stage 3 mock logic → replace ด้วย real booking API

**ระดับ:** Medium
**Priority:** HIGH — core feature ของ SectionLap

⸻

### SYS2 — AI Assistant (Reports + Helper)
> AI ช่วย teacher ดูรายงานและ insight

**สิ่งที่ต้องทำ:**
* Dashboard แสดง analytics (enrollment, attendance, quiz scores)
* Teacher พิมพ์ถามได้ เช่น "นักเรียนคนไหนมาน้อยที่สุด?"
* Claude ตอบโดย query ข้อมูลใน DB แล้วสรุปให้เป็นภาษาธรรมดา

**Dependency:**
* Stage 6a (DB + API)
* Backend AI Gateway

**ระดับ:** Medium
**Priority:** Medium

⸻

### SYS3 — Invite by Email (Private Room)
> เชิญ user เข้า private room เพื่อสอบหรือ interview

**สิ่งที่ต้องทำ:**
* Teacher กรอก email → ระบบส่ง invite link
* Link มี token ที่ expire ได้
* Private Jitsi room เปิดเฉพาะคนที่มี token
* ใช้สำหรับ oral exam / interview / 1-on-1

**Dependency:**
* Stage 6a (user management + token generation)
* Email service (Resend หรือ SMTP)
* Stage 2a (Jitsi self-host)

**ระดับ:** Medium
**Priority:** Medium

⸻

### SYS4 — Public Q&A Remark List (ท้ายคลาส)
> รวบรวมคำถามจาก chat ให้ teacher ตอบช่วงท้าย

**สิ่งที่ต้องทำ:**
* Student ส่งคำถามระหว่าง class เข้า queue
* AI merge คำถามที่คล้ายกัน (ดู S8)
* Teacher เห็น list ที่ sort by priority
* ช่วงท้าย class เปิด "Q&A Mode" แสดงคำถามทีละข้อ

**Dependency:**
* Sync service (Stage 4a/4b) — broadcast คำถาม real-time
* S8 AI Question Merge

**ระดับ:** Medium
**Priority:** HIGH — ใช้ร่วมกับ T5 ได้ดี

⸻

### SYS5 — Class Participant Email Notification
> ส่ง email สรุปให้ผู้เข้าร่วมหลังจบ class

**สิ่งที่ต้องทำ:**
* หลัง class จบ ระบบรวบรวม: attendance, quiz result, key points
* ส่ง email สรุปให้แต่ละคน
* Email มี link กลับมา replay หรือ notes

**Dependency:**
* Stage 6a (enrollment records)
* Email service
* S6 AI Auto Notes (ถ้าต้องการ auto-generate key points)

**ระดับ:** Easy
**Priority:** Low–Medium

⸻

### SYS6 — Portfolio / Sandbox to Student (Auto)
> ส่ง demo project หรือ sandbox ให้ student อัตโนมัติ

**สิ่งที่ต้องทำ:**
* หลัง section จบ ส่ง starter project ให้ student อัตโนมัติ
* Student เปิด sandbox ได้ใน browser (CodeSandbox embed หรือ self-host)
* ผูกกับ T4 (Demo Project Builder)

**Dependency:**
* T4
* Stage 6a (enrollment check ก่อนให้สิทธิ์)
* Sandbox infra

**ระดับ:** Hard
**Priority:** Low — ต้องมี T4 และ sandbox infra ก่อน

⸻

## STUDENT FEATURES

⸻

### S1 — Remark + Private Chat with AI Expand
> นักเรียน remark ช่วงเวลา / chat private / AI ขยายความ

**สิ่งที่ต้องทำ:**
* Student กด bookmark timestamp ระหว่าง live class
* เปิด private chat กับ AI (ไม่ให้ teacher เห็น)
* Student พิมพ์คำถาม → AI ขยายความ + ยกตัวอย่างเพิ่ม
* Bookmark และ chat history save ไว้ดูหลัง class

**Dependency:**
* Stage 6a (save remark/chat history)
* Backend AI Gateway

**ระดับ:** Medium
**Priority:** HIGH

⸻

### S2 — Public Class Chat Room + Auto Question Generation
> chat room สาธารณะ + AI สร้างคำถามอัตโนมัติ

**สิ่งที่ต้องทำ:**
* Public chat ระหว่าง live class (ทุกคนเห็น)
* AI วิเคราะห์ chat และ generate คำถามที่น่าสนใจ
* คำถามที่ AI สร้างส่งเข้า SYS4 Q&A queue อัตโนมัติ

**Dependency:**
* Sync service (Stage 4a/4b) — real-time chat
* SYS4
* Backend AI Gateway

**ระดับ:** Medium
**Priority:** Medium

⸻

### S3 — Private AI Tutor
> AI tutor ส่วนตัวสำหรับแต่ละนักเรียน

**สิ่งที่ต้องทำ:**
* Student เข้าถึง AI tutor นอก live class ได้
* AI รู้ context ของ section ที่เรียน + ประวัติคำถามของ student
* ตอบแบบ step-by-step, Socratic method (ถามกลับแทนการบอกตรง ๆ)

**Dependency:**
* Stage 6a (student history + enrollment)
* Backend AI Gateway

**ระดับ:** Medium
**Priority:** HIGH — core differentiator

⸻

### S4 — AI Expand Example
> AI ขยายตัวอย่างเพิ่มเติมจาก content ที่ teacher สอน

**สิ่งที่ต้องทำ:**
* Student highlight ส่วนใดส่วนหนึ่งของ content
* กด "Expand" → AI สร้างตัวอย่างเพิ่มเติม 2–3 ข้อ
* ตัวอย่างปรับตาม level ของ student ได้

**Dependency:**
* Document Highlight (Stage 4b เสร็จแล้ว ✅)
* Backend AI Gateway

**ระดับ:** Easy
**Priority:** HIGH — ต่อยอดจาก Stage 4b ได้เลย

⸻

### S5 — AI Personalized Learning Guide Roadmap
> AI แนะนำ roadmap การเรียนส่วนตัว

**สิ่งที่ต้องทำ:**
* วิเคราะห์ quiz scores + attendance + remark history ของ student
* สร้าง roadmap: section ไหนควรเรียนต่อ, ส่วนไหนควร review
* แสดงเป็น visual roadmap ใน student dashboard

**Dependency:**
* Stage 6a (student analytics)
* T5 Quiz, S1 Remark history
* Backend AI Gateway

**ระดับ:** Hard
**Priority:** Medium — ต้องมี data ก่อน

⸻

### S6 — AI Auto Notes
> AI สร้าง notes อัตโนมัติจาก live class

**สิ่งที่ต้องทำ:**
* หลัง/ระหว่าง class AI สรุป key points จาก content ที่สอน
* Student เห็น notes แบบ bullet point ที่ structured
* Student แก้ไข/เพิ่มเติม notes เองได้
* Export เป็น PDF หรือ Markdown

**Dependency:**
* Stage 6a (save notes)
* Content source (teacher script จาก T3 หรือ transcript)

**ระดับ:** Medium
**Priority:** Medium

⸻

### S7 — AI Assistant (General)
> AI assistant ทั่วไปสำหรับ student

**สิ่งที่ต้องทำ:**
* Chat interface ที่ student ถามอะไรก็ได้เกี่ยวกับ section ที่เรียน
* AI รู้ context ของ section ปัจจุบัน
* แยกจาก S3 (Private Tutor) ตรงที่ไม่มี memory ข้ามครั้ง

**Dependency:**
* Backend AI Gateway

**ระดับ:** Easy
**Priority:** Medium — ทำได้เร็ว ต่อยอดจาก gateway

⸻

### S8 — AI Question Merge
> รวมคำถามที่คล้ายกันจาก 20 คน เป็น 1 คำถาม

**สิ่งที่ต้องทำ:**
* รับคำถามจาก student ทุกคนใน class
* Claude cluster คำถามที่ semantic คล้ายกัน
* สรุปเป็น 1 คำถามตัวแทน พร้อม count ("12 คนถามเรื่องนี้")
* ส่งเข้า SYS4 Q&A queue

**Dependency:**
* SYS4
* Backend AI Gateway
* Sync service (รับ question stream real-time)

**ระดับ:** Medium
**Priority:** HIGH — เสริม SYS4 ให้มีคุณค่ามาก

⸻

## สรุป Priority และ Sequence แนะนำ

### Phase A — หลัง Stage 6a เสร็จ (Foundation)
ทำพร้อมกันได้:
1. **SYS1** Calendar Booking (replace mock)
2. **T3** AI Teaching Script Generator
3. **S7** AI Assistant (ง่ายสุด, เป็น proof of concept AI gateway)

### Phase B — AI Core
4. **T1** AI Curriculum Designer
5. **S4** AI Expand Example (ต่อยอด Stage 4b)
6. **S1** Remark + Private Chat
7. **S3** Private AI Tutor

### Phase C — Live Class AI
8. **T5** AI Quiz Generator
9. **S8** AI Question Merge
10. **SYS4** Public Q&A Remark List
11. **S2** Public Chat + Auto Questions

### Phase D — Advanced
12. **T2** Lesson Scope Checker
13. **S5** Personalized Roadmap
14. **S6** AI Auto Notes
15. **SYS2** AI Reports
16. **SYS3** Invite by Email
17. **SYS5** Class Participant Email

### Phase E — Infra Heavy
18. **T4** AI Demo Project Builder
19. **SYS6** Portfolio/Sandbox

⸻

ทั้งหมด: 19 features
Phase A–C (MVP AI): 11 features
