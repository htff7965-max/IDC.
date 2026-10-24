// حطي هنا بيانات مشروعك من Supabase > Project Settings > API
// الـ anon key مسموح يتحط في الفرونت اند لأن الحماية الحقيقية هي الـ RLS في schema.sql
// ممنوع تحطي service_role key هنا نهائيًا.
export const CFG = {
  SUPABASE_URL: 'https://YOUR-PROJECT.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR-ANON-KEY',
  SITE_URL: 'http://localhost:3000',          // بعد النشر: رابط موقعك الحقيقي (https)
  SUPPORT_PHONE: '+1 650-253-0000'            // رقم تجريبي، بدّليه برقم خدمة عملاء IDC
};
