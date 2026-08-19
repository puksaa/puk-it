# PUK IT — เว็บไซต์พร้อมระบบหลังบ้าน

โฟลเดอร์นี้คือเว็บพร้อมใช้จริง: หน้าเว็บ `index.html`, หลังบ้าน `admin.html`, ฐานข้อมูลและนโยบายความปลอดภัยใน `supabase/schema.sql`, และฟังก์ชันแจ้ง LINE ใน `supabase/functions/line-notify`.

## โหมดทดลองบนเครื่อง

เปิด `demo-admin.html` เพื่อทดลองเพิ่มและแก้ผลงาน บริการ ข้อความ และรายการลูกค้าโดยไม่ต้องตั้งค่า Supabase ข้อมูลตัวอย่างจะถูกเก็บเฉพาะในเบราว์เซอร์ของเครื่อง และห้ามนำหน้านี้ขึ้นใช้งานจริง.

## เปิดใช้จริง

1. สร้างโปรเจกต์ Supabase แล้วเปิด SQL Editor วางเนื้อหาจาก `supabase/schema.sql` และกด Run
2. ที่ Authentication สร้างผู้ใช้คนแรกด้วยอีเมลของคุณ แล้วนำ UUID ไปแทนในคำสั่งสุดท้ายของไฟล์ SQL เพื่อให้เป็นผู้ดูแล
3. นำ Project URL และ Publishable/anon key ใส่ใน `js/config.js` (ค่านี้ใช้หน้าเว็บได้; **ห้าม** ใส่ Service Role key ที่นี่)
4. สร้าง LINE Official Account และ Messaging API channel จากนั้น deploy ฟังก์ชัน `line-notify` และตั้ง Secrets: `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_TO`, `WEBHOOK_SECRET`
5. Deploy `create-admin` ด้วย `supabase functions deploy create-admin` เพื่อเพิ่มผู้ดูแลผ่านหน้าแอดมินได้อย่างปลอดภัย
6. ใน Supabase สร้าง Database Webhook: ตาราง `leads`, event `INSERT`, URL เป็น Edge Function `line-notify`, และตั้ง HTTP header `x-webhook-secret` ให้ตรงกับ Secret
7. อัปโหลดทั้งโฟลเดอร์นี้ไป Netlify หรือ Vercel แล้วเข้า `/admin.html` เพื่อล็อกอิน (หากใช้ Netlify ไฟล์ `netlify.toml` จะเปิดใช้ HTTP security headers ให้อัตโนมัติ)

## ความปลอดภัย

- ผู้เข้าชมอ่านได้เฉพาะบริการและผลงานที่เผยแพร่ และส่งได้เฉพาะฟอร์มติดต่อ
- ข้อมูลลูกค้า, การแก้ไขเว็บ, และรายชื่อผู้ดูแล ใช้ได้เฉพาะบัญชีที่ `is_admin = true`
- รหัส LINE และ Service Role key อยู่ใน Supabase Secrets เท่านั้น ไม่อยู่ในหน้าเว็บหรือ Git
- เปิด CAPTCHA/Turnstile ใน Supabase และตั้งโดเมนที่อนุญาตใน Authentication ก่อนเผยแพร่
- ตั้งค่า SMTP สำหรับอีเมลเชิญผู้ดูแล และเปิดใช้รหัสผ่านที่แข็งแรง/การยืนยันอีเมลใน Supabase Authentication

## เพิ่มผู้ดูแล

สร้างบัญชีใน Supabase Authentication แล้วเพิ่มลงตาราง `profiles` โดยใช้ SQL:

```sql
insert into public.profiles(id,email,is_admin) values ('USER_UUID','admin@example.com',true);
```

หลัง deploy Edge Function `create-admin` แล้ว ใช้เมนู **ผู้ดูแล → เพิ่มผู้ดูแล** ในหน้าแอดมินได้โดยตรง ระบบจะส่งอีเมลเชิญเพื่อตั้งรหัสผ่าน.
