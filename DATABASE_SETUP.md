# إعداد قاعدة البيانات

1. أنشئ مشروع Supabase جديدًا من لوحة Supabase.
2. افتح **SQL Editor** والصق كامل الملف `supabase/schema.sql` ثم نفّذه مرة واحدة.
3. من Project Settings → API انسخ Project URL و`anon` public key إلى `.env.local`.
4. Authentication → URL Configuration: اجعل Site URL هو رابط التطبيق، وأضف `http://localhost:3000/auth/callback` ورابط الإنتاج `/auth/callback` إلى Redirect URLs.
5. Authentication → Providers: فعّل Email، واضبط تأكيد البريد حسب سياسة الإطلاق.
6. راجع Storage وتأكد أن `plant-submissions` خاص، وحجم الملف الأقصى 5MB والأنواع JPG/PNG/WEBP. ينشئ SQL الـBucket والسياسات المطلوبة.

الجداول: `profiles`, `subscriptions`, `submissions`, `replies`, `email_notifications`, `contact_messages`. يربط Trigger كل مستخدم Auth بملف، وتضمن RLS فصل بيانات المستخدمين. يتطلب رفع الصور `SUPABASE_SERVICE_ROLE_KEY` في بيئة الخادم فقط ليتمكن API من فحص الملف قبل التخزين. لا تضف هذا المفتاح إلى متغير `NEXT_PUBLIC_*` أو أي كود متصفح.

## ترقية Admin

أنشئ الحساب وأكد بريده أولًا، ثم نفّذ SQL التالي من لوحة المشروع بصلاحية المالك:

```sql
update public.profiles set role = 'admin' where email = 'admin@example.com';
```

لا تسمح للمستخدمين بالتغيير الذاتي للدور. تغيير صلاحية الإدارة يتطلب دخولًا جديدًا/تحديث الجلسة لرؤية روابط لوحة الإدارة؛ الخادم يعيد قراءة الدور من PostgreSQL عند كل طلب.

## Realtime

يضيف المخطط `submissions` و`replies` إلى منشور `supabase_realtime`. يستقبل التطبيق إشعارات التغيير من القاعدة ويعيد تحميل البيانات من خلال جلسة المستخدم، فتظل سياسات RLS فعالة. في حال كان الجدول موجودًا مسبقًا في المنشور، احذف سطر `alter publication ... add table` المكرر أو تحقّق من إعداد المنشور يدويًا.
