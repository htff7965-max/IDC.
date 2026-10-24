// عربي / English: كل النصوص هنا. السطر = مفتاح|عربي|English
const RAW = `
login|تسجيل الدخول|Sign in
login_hint|اكتبي حسابك للمتابعة|Enter your account to continue
signup|إنشاء حساب جديد|Create account
signup_hint|بياناتك وتأكيد رقم موبايلك برمز SMS|Your details and an SMS code to confirm your mobile number
email_or_phone|البريد الإلكتروني أو رقم الموبايل|Email or mobile number
email|البريد الإلكتروني|Email
password|كلمة المرور|Password
password_new|كلمة المرور (8 حروف على الأقل)|Password (at least 8 characters)
confirm_pw|تأكيد كلمة المرور|Confirm password
full_name|الاسم الكامل|Full name
phone|رقم الموبايل (01xxxxxxxxx)|Mobile number (01xxxxxxxxx)
forgot|نسيت كلمة المرور؟|Forgot password?
no_account|ليس لديك حساب؟|Don't have an account?
back_login|الرجوع لتسجيل الدخول|Back to sign in
continue|متابعة|Continue
confirm|تأكيد|Confirm
next|التالي|Next
code|رمز التحقق|Verification code
verify_phone|تأكيد رقم الموبايل|Confirm mobile number
sent_to|بعتنا رمز من 6 أرقام إلى|We sent a 6-digit code to
resend|إعادة إرسال الرمز|Resend code
wait_30|استني 30 ثانية قبل إعادة الإرسال|Wait 30 seconds before resending
code_resent|تم إرسال رمز جديد|A new code was sent
reset_title|استعادة كلمة المرور|Reset password
reset_hint|اكتبي رقم الموبايل المسجل وهنبعتلك رمز تحقق|Enter your registered mobile number and we will send a code
reset_sent|لو الرقم مسجل عندنا، هيوصله رمز SMS|If the number is registered, it will receive an SMS code
send_code|إرسال رمز التحقق|Send verification code
enter_code|أدخلي رمز التحقق|Enter the verification code
save_pw|حفظ كلمة المرور|Save password
pw_changed|تم تغيير كلمة المرور|Password changed
err_generic|حصلت مشكلة، حاولي تاني|Something went wrong, try again
err_cred|الحساب أو كلمة المرور غير صحيحة|Incorrect account or password
err_pw_len|كلمة المرور 8 حروف على الأقل|Password must be at least 8 characters
err_pw_match|كلمتا المرور غير متطابقتين|Passwords do not match
err_phone|رقم الموبايل لازم يكون 11 رقم يبدأ بـ 01|Mobile number must be 11 digits starting with 01
err_name|اكتبي الاسم|Enter your name
err_email|اكتبي بريد إلكتروني صحيح|Enter a valid email
err_code|الرمز غير صحيح أو منتهي|Incorrect or expired code
err_confirm_email|اتبعت لك إيميل تأكيد، أكديه وبعدين سجّلي دخول|A confirmation email was sent, confirm it then sign in
err_lock_len|6 حروف على الأقل|At least 6 characters
err_title|اكتبي العنوان|Enter a title
err_file_size|الملف أكبر من 5MB|The file is larger than 5MB
basic_title|بياناتك الأساسية|Your basic details
basic_hint|الاسم مطلوب، والباقي تقدري تكمليه بعدين|Name is required, you can complete the rest later
national_id|الرقم القومي|National ID
birth|تاريخ الميلاد|Date of birth
governorate|المحافظة|Governorate
choose|— اختاري —|— Select —
i_am|أنا|I am
role_student|طالب/ـة|Student
role_grad|خريج/ـة جديد/ـة|New graduate
role_employee|موظف/ـة|Employee
role_owner|صاحب/ـة شركة|Business owner
save|حفظ|Save
saved|تم الحفظ|Saved
lock_set_title|اختاري كلمة مرور فتح التطبيق|Set your app unlock password
lock_set_hint|هتكتبيها (أو تستخدمي البصمة) كل ما تفتحي التطبيق، وبتشفّر نسخة الأوفلاين على الجهاز|You will enter it (or use biometrics) every time you open the app. It also encrypts the offline copy on this device
app_password|كلمة مرور التطبيق|App password
enable_bio|تفعيل البصمة / Face ID|Enable fingerprint / Face ID
bio_will|هتتفعل البصمة عند الحفظ ✓|Biometrics will be enabled on save ✓
bio_on|تم تفعيل البصمة|Biometrics enabled
bio_fail|البصمة مش متاحة على الجهاز ده|Biometrics is not available on this device
unlock_title|افتحي IDC|Unlock IDC
unlock|فتح|Unlock
use_bio|استخدمي البصمة / Face ID|Use fingerprint / Face ID
wrong_pw|كلمة المرور غير صحيحة، باقي|Wrong password, remaining
wrong_pw_short|كلمة المرور غير صحيحة|Incorrect password
attempts|محاولات|attempts
wiped|تم مسح نسخة الأوفلاين من الجهاز لتجاوز المحاولات|Offline copy wiped after too many attempts
switch_account|الدخول بحساب تاني|Sign in with another account
no_cache|مفيش نسخة أوفلاين محفوظة، افتحي التطبيق أونلاين مرة|No offline copy saved, open the app online once
online|أونلاين|Online
offline|أوفلاين|Offline
offline_note|الوضع الأوفلاين: بيانات عامة فقط، مخزنة ومشفرة على جهازك|Offline mode: public data only, stored encrypted on your device
nav_home|الرئيسية|Home
nav_wallet|المحفظة|Wallet
nav_cv|سيرتي|My CV
nav_security|الأمان|Security
hello|أهلًا|Welcome
verified_id|✓ هوية موثقة|✓ Verified identity
contact|بيانات التواصل|Contact details
flip_hint|اضغطي على البطاقة لقلبها|Tap the card to flip it
completion|اكتمال ملفك|Profile completion
next_photo|ضيفي صورتك الشخصية|Add your profile photo
next_file|ارفعي صورة بطاقتك أو شهادة|Upload your ID or a certificate
next_cv|كمّلي سيرتك الذاتية|Complete your CV
next_done|ملفك مكتمل|Your profile is complete
recent_docs|آخر وثائقي|Recent documents
view_all|عرض كل الوثائق|View all documents
empty|لسه مفيش بيانات هنا|No data here yet
add|إضافة|Add
add_data|إضافة بيانات جديدة|Add new data
edit_data|تعديل البيانات|Edit data
delete|حذف|Delete
confirm_del|حذف هذه البيانات؟|Delete this data?
confirm_logout|تسجيل الخروج؟|Sign out?
logout|تسجيل الخروج|Sign out
type|النوع|Type
title|العنوان|Title
value|التفاصيل أو الرقم أو الفترة|Details, number or period
section|القسم|Section
issuer|الجهة المعتمدة|Accredited issuer
issuer_other|جهة أخرى (غير موثقة)|Other issuer (unverified)
issuer_text|اسم الجهة (اختياري)|Issuer name (optional)
secret_until|سرية لغاية (للقسم السري)|Secret until (secret section)
on_card|إظهاره في صفحة الكارت العامة (NFC/QR)|Show it on my public card page (NFC/QR)
file_opt|صورة أو ملف PDF (اختياري)|Image or PDF file (optional)
lvl_public|عامة|Public
lvl_private|خاصة|Private
lvl_secret|سرية|Secret
type_id|بطاقة هوية|ID card
type_lic|رخصة|License
type_birth|شهادة ميلاد|Birth certificate
type_cert|شهادة|Certificate
type_course|كورس|Course
type_dig|هوية رقمية|Digital ID
type_phone|بيانات تواصل|Contact details
type_edu|تعليم|Education
type_exp|خبرة|Experience
type_skill|مهارة|Skill
type_proj|مشروع|Project
type_photo|صورة|Photo
type_doc|مستند|Document
type_other|أخرى|Other
auto_revealed|كُشفت تلقائيًا|Auto-revealed
secret_for|سرية|Secret for
days|يوم|days
secret_forever|سرية دائمة|Permanently secret
vault_title|القسم الخاص والسري محمي|Private and secret sections are protected
vault_intro|محتاج كلمة مرور منفصلة ورمز SMS، وبيتقفل تلقائيًا بعد دقيقتين|Needs a separate password and an SMS code, and locks automatically after 2 minutes
vault_create|إنشاء كلمة مرور القسم الخاص|Create private section password
vault_create_hint|8 حروف وأرقام، ومختلفة عن كلمة مرور الحساب|8 characters with letters and numbers, different from your account password
vault_unlock|فتح القسم الخاص|Open private section
vault_pw|كلمة مرور القسم الخاص|Private section password
vault_step1|الخطوة 1: كلمة مرور القسم الخاص (حاجة بتعرفيها)|Step 1: private section password (something you know)
vault_step2|الخطوة 2: رمز SMS على موبايلك (حاجة معاكي)|Step 2: SMS code on your phone (something you have)
vault_weak|حروف وأرقام، 8 على الأقل|Letters and numbers, at least 8
vault_same_as_account|لازم تختلف عن كلمة مرور الحساب|Must differ from your account password
vault_unauthenticated|سجّلي دخول الأول|Sign in first
vault_wrong|كلمة مرور القسم غير صحيحة|Section password is incorrect
vault_locked|القسم مقفول مؤقتًا بعد محاولات غلط، جرّبي بعد دقيقة|Temporarily locked after wrong attempts, try again in a minute
vault_need_phone|ضيفي رقم موبايلك من الإعدادات الأول|Add your mobile number in Settings first
vault_open_note|القسم مفتوح وبيتقفل تلقائيًا بعد دقيقتين|Section is open and locks automatically after 2 minutes
vault_layers|طبقات حماية القسم الخاص|Private section protection layers
vl1|كلمة مرور منفصلة|Separate password
vl2|رمز SMS لكل فتح|SMS code on every unlock
vl3|قفل تلقائي بعد دقيقتين|Auto-lock after 2 minutes
vl4|حظر مؤقت بعد 3 محاولات خاطئة|Temporary lock after 3 wrong attempts
vl5|سجل بكل محاولة دخول|Log of every sign-in attempt
lock_now|اقفلي الآن|Lock now
open_vault_first|افتحي القسم الخاص الأول|Open the private section first
online_only|الخاصية دي محتاجة إنترنت|This needs an internet connection
cv_edu|التعليم|Education
cv_exp|الخبرات|Experience
cv_skill|المهارات|Skills
cv_proj|المشاريع|Projects
cv_cert|شهادات وكورسات|Certificates & courses
cv_print|طباعة / حفظ PDF|Print / save as PDF
cv_public_only|السيرة بتشمل البيانات العامة فقط|The CV includes public data only
cv_hint_student|لسه بتبدئي؟ ابدئي بالتعليم والمهارات ومشروع من دراستك|Just starting? Begin with education, skills and a project from your studies
cv_hint_grad|سيرة قوية لأول وظيفة: تعليم، كورسات، مشاريع تخرج وتدريب|A strong CV for your first job: education, courses, graduation projects and training
cv_hint_employee|رتّبي خبراتك ومهاراتك وشهاداتك في سيرة جاهزة|Organize your experience, skills and certificates into a ready CV
cv_hint_owner|ضيفي شركتك كخبرة ومشاريعك وتراخيصك المعتمدة|Add your company as experience, plus your projects and accredited licenses
sec_check|فحص الأمان|Security check
sec_strong|حمايتك قوية|Your protection is strong
sec_improve|فعّلي كلمة مرور القسم الخاص|Set up the private section password
app_lock|كلمة مرور فتح التطبيق|App unlock password
biometric|البصمة / Face ID|Fingerprint / Face ID
change|تغيير|Change
enable|تفعيل|Enable
unsupported|غير مدعومة|Not supported
old_password|كلمة المرور الحالية|Current password
new_password|كلمة المرور الجديدة|New password
twofa_title|ما هو التحقق بخطوتين (2FA)؟|What is two-step verification (2FA)?
twofa_body|كلمة المرور لوحدها ممكن تتسرق أو تتخمّن، فبنطلب إثبات تاني: حاجة بتعرفيها (كلمة المرور) + حاجة معاكي (موبايلك). النظام بيبعت رمز عشوائي من 6 أرقام لرقمك المسجل، وبتكتبيه في وقت قصير. حتى لو حد عرف كلمة مرورك، مش هيدخل من غير موبايلك.|A password alone can be stolen or guessed, so we ask for a second proof: something you know (password) + something you have (your phone). The system sends a random 6-digit code to your registered number and you type it within a short time. Even if someone learns your password, they cannot get in without your phone.
access_log|سجل الدخول للقسم الخاص|Private section access log
ok|نجح|Success
fail|فشل|Failed
none|لا يوجد|None
refresh|تحديث|Refresh
settings|الإعدادات|Settings
profile|الملف الشخصي|Profile
change_photo|تغيير الصورة|Change photo
save_changes|حفظ التعديلات|Save changes
language|اللغة|Language
card_link|رابط الكارت (NFC / QR)|Card link (NFC / QR)
card_link_hint|ده الرابط اللي بيتكتب على كارت الـ NFC وبيظهر في QR. بيعرض بس الوثائق اللي علّمتيها "على الكارت".|This is the link written on your NFC card and shown in the QR code. It only shows documents you marked "on card".
support|خدمة العملاء|Customer service
support_id|رقم حسابك للمساعدة|Your support account number
call_now|اتصال الآن|Call now
licenses|التراخيص والسياسات|Licenses & policies
license_text|IDC © 2026. ترخيص استخدام شخصي محدود لإدارة هويتك الرقمية ووثائقك. بياناتك الخاصة والسرية لا تُعرض لأي طرف بدون تحققك.|IDC © 2026. A limited personal license to manage your digital identity and documents. Your private and secret data is never shown to anyone without your verification.
pub_title|بطاقة IDC|IDC card
pub_none|الكارت ده مش موجود|This card was not found
`;
const D = { ar: {}, en: {} };
RAW.trim().split('\n').forEach(l => { const [k, a, e] = l.split('|'); D.ar[k] = a; D.en[k] = e; });
let L = localStorage.getItem('lang') || 'ar';
export const lang = () => L;
export const t = k => D[L][k] ?? D.ar[k] ?? k;
export function apply() { document.documentElement.lang = L; document.documentElement.dir = L === 'ar' ? 'rtl' : 'ltr'; }
export function setLang(l) { L = l; localStorage.setItem('lang', l); apply(); document.dispatchEvent(new Event('langchange')); }
