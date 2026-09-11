import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy Google GenAI initialization
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Resilient candidate models cascade: Primary stable flash, pro preview, and lite models
const CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-3.1-pro-preview",
  "gemini-3.1-flash-lite",
  "gemini-2.5-pro",
  "gemini-flash-latest",
];

interface SafeGenerateOptions {
  contents: any;
  config?: any;
}

async function callGeminiSafe(options: SafeGenerateOptions): Promise<{ text: string; modelUsed: string }> {
  const ai = getAi();
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        ...(options.config ? { config: options.config } : {}),
      });

      if (response && response.text) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      const errMessage = String(err?.message || err || "");
      const isHighDemandOrTransient =
        err?.status === 503 ||
        err?.code === 503 ||
        errMessage.includes("503") ||
        errMessage.includes("high demand") ||
        errMessage.includes("UNAVAILABLE") ||
        errMessage.includes("ResourceExhausted") ||
        errMessage.includes("429") ||
        errMessage.includes("rate limit");

      if (isHighDemandOrTransient) {
        // Model busy; seamlessly try next candidate model without crashing
        continue;
      }
    }
  }

  throw lastError || new Error("All Gemini candidate models were temporarily unavailable.");
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Helper to detect domain of a topic
type TopicDomain =
  | "cognitive-learning"
  | "digital-logic"
  | "hardware-architecture"
  | "math-foundations"
  | "systems-c-os"
  | "dsa-algorithms"
  | "ai-llm-infrastructure"
  | "concurrency-network";

function detectTopicDomain(titleEn: string, titleFa: string, moduleTitle: string = "", phaseTitle: string = ""): TopicDomain {
  const combined = `${titleEn} ${titleFa} ${moduleTitle} ${phaseTitle}`.toLowerCase();
  
  // 1. Cognitive & Learning Science
  if (
    /synap|plastic|consolidation|hippocamp|cortex|neuro|feynman|spaced repetition|sm-2|active recall|cognitive load|learning science|ebbinghaus|working memory|long-term storage|illusion of competence/i.test(combined) ||
    /مغز|شناختی|سیناپس|شکل‌پذیری|شکل پذیری|تثبیت حافظه|حافظه بلندمدت|فاینمن|تکرار فاصله‌دار|تکرار فاصله دار|یادآوری فعال|توهم خواندن|بار شناختی|علوم اعصاب/i.test(combined)
  ) {
    return "cognitive-learning";
  }

  // 2. AI, LLMs & Deep Learning Infrastructure
  if (
    /transformer|attention|flashattention|kv cache|quantiz|gptq|awq|cuda|warp|tensor parallel|zero|lora|fine-tun|embedding/i.test(combined) ||
    /ترنسفورمر|توجه|اتنشن|کش کی‌وی|کوانتایز|لودا|تنسور|مدل زبانی|یادگیری عمیق/i.test(combined)
  ) {
    return "ai-llm-infrastructure";
  }

  // 3. Mathematics & Linear Algebra
  if (
    /vector|matrix|linear algebra|calculus|derivative|gradient|probability|bayes|entropy|gemm|dot product|cosine similarity/i.test(combined) ||
    /ریاضی|بردار|ماتریس|جبر خطی|مشتق|گرادیان|احتمال|بیز|آنتروپی|ضرب ماتریسی|فضای برداری/i.test(combined)
  ) {
    return "math-foundations";
  }

  // 4. Digital Logic & Von Neumann Architecture
  if (
    /von neumann|boolean|logic gate|truth table|two's complement|floating-point|ieee 754|fp32|bf16|alu|control unit|hexadecimal/i.test(combined) ||
    /فون نویمان|منطق بولی|گیت منطقی|جدول درستی|متمم دو|ممیز شناور|نمایش اعداد/i.test(combined)
  ) {
    return "digital-logic";
  }

  // 5. Hardware, Caches, GPUs & Memory Hierarchy
  if (
    /cache|memory hierarchy|memory wall|ddr|lpddr|simd|simt|tensor core|hbm|hbm3|accelerator|bandwidth|latency-opt/i.test(combined) ||
    /سخت‌افزار|سخت افزار|هرم حافظه|خط کش|تنگنای حافظه|شتاب‌دهنده|پهنای باند/i.test(combined)
  ) {
    return "hardware-architecture";
  }

  // 6. Data Structures & Algorithms
  if (
    /big-o|asymptotic|hash table|robin hood|b-tree|red-black|binary tree|trie|timsort|quicksort|radix|dijkstra|graph|dynamic programming|ring buffer|queue/i.test(combined) ||
    /ساختمان داده|الگوریتم|پیچیدگی|درخت|هش تیبل|جدول درهم‌سازی|مرتب‌سازی|گراف|برنامه‌ریزی پویا/i.test(combined)
  ) {
    return "dsa-algorithms";
  }

  // 7. Concurrency, Distributed Systems & Networking
  if (
    /thread|concurren|async|lock|mutex|atomic|race|socket|network|tcp|http|proto|grpc|distribut|raft|paxos|consensus/i.test(combined) ||
    /همزمانی|ترد|قفل|اتمیک|سوکت|شبکه|توزیع‌شده|توزیع شده|اجماع/i.test(combined)
  ) {
    return "concurrency-network";
  }

  // Default: C & Linux Systems Programming
  return "systems-c-os";
}

// Helper to generate a deeply structured, domain-adaptive, academic & industrial lecture offline fallback
function generateAcademicLectureFallback(titleEn: string, titleFa: string, phaseTitle: string, moduleTitle: string): string {
  const persianTitle = titleFa || titleEn;
  const domain = detectTopicDomain(titleEn, titleFa, moduleTitle, phaseTitle);

  // 1. COGNITIVE SCIENCE & LEARNING MECHANICS (مکانیک مغز و علوم یادگیری انسان)
  if (domain === "cognitive-learning") {
    return `# ${persianTitle} (\`${titleEn}\`)
> **مسیر یادگیری گام‌به‌گام:** از فهم شهودی کارکرد مغز تا پروتکل‌های علمی یادگیری عمیق | **بخش:** ${phaseTitle || "مکانیک مغز و مهندسی یادگیری"} • **ماژول:** ${moduleTitle || "علوم شناختی"}

---

## 🧩 لایه ۱: تصویرسازی شهودی از صفر مطلق (\`Everyday Tangible Metaphor\`)
اگر هیچ اطلاعاتی از پزشکی، زیست‌شناسی یا نورولوژی نداشته باشید، فرآیند مغز را چگونه باید تصور کنید؟

* **داستان تخته‌سیاه کلاسی پر از گرد و غبار در برابر حکاکی روی سنگ مرمر:**
  تصور کنید در طول روز، هر آنچه می‌بینید، می‌شنوید و می‌خوانید روی یک **تخته‌سیاه کلاسی کوچک** با گچ نوشته می‌شود. فضای این تخته بسیار محدود است و با کوچک‌ترین وزش باد یا در پایان روز، ناپدید و پاک می‌شود.
  برای اینکه اطلاعات ارزشمند برای همیشه باقی بمانند، شب‌ها وقتی مدرسه تعطیل است، یک **حکاک چیره دست** به اتاق می‌آید و نوشته‌های گلچین‌شده و پرکاربرد روی تخته‌سیاه را بر روی **لوح‌های سنگی عظیم دیواری** حکاکی می‌کند.
* **تطبیق دنیای واقعی با ساختار شگفت‌انگیز مغز انسان:**
  * **تخته‌سیاه روزانه:** معادل حافظه کاری و کوتاه‌مدت تحت مدیریت «هیپوکامپوس» (\`Hippocampus\`) است که اطلاعات روز را موقتاً نگه می‌دارد.
  * **حکاک شبانه:** معادل فرآیند خواب عمیق و امواج آهسته مغزی (\`Slow-Wave Sleep\`) است که خاطرات و مفاهیم را تثبیت می‌کند.
  * **لوح‌های سنگی دیواری:** معادل قشر بیرونی مغز یا «نئوکورتکس» (\`Neocortex\`) است که حافظه دائمی و بلندمدت شما در آن ذخیره می‌شود.

---

## 💥 لایه ۲: بحران در غیاب این مفهوم و چرایی تکاملی (\`The Biological Need & Mechanism\`)
چرا مغز ما هر چیزی را بلافاصله ذخیره نمی‌کند و نیاز به سازوکار تثبیت دارد؟
* **دنیای بدون مکانیزم تثبیت:** اگر مغز همه جزئیات بیهوده (مثل پلاک ماشین‌هایی که در خیابان دیدید) را در حافظه بلندمدت ذخیره می‌کرد، ظرفیت پردازشی مغز در چند ساعت اشباع می‌شد و از شدت بار اطلاعاتی از کار می‌افتاد. بنابراین مغز نیاز به یک فیلتر هوشمند دارد.
* **واژه‌نامه پایه برای درک آسان (تعاریف روان):**
  * **سیناپس (\`Synapse\`):** فاصله باریک میان دو سلول عصبی (نورون) که پیام‌های فکری و یادگیری از طریق تبادل مواد شیمیایی از آن عبور می‌کنند.
  * **شکل‌پذیری سیناپسی (\`Synaptic Plasticity\`):** قابلیت شگفت‌انگیز مغز برای تقویت، ضعیف‌سازی یا ساخت مسیرهای ارتباطی جدید میان نورون‌ها بر اساس تجربه.
  * **تقویت درازمدت (\`Long-Term Potentiation / LTP\`):** پدیده‌ای که در آن هرچه دو نورون مکرراً با هم فعال شوند، اتصال میان آن‌ها پایدارتر و رساناتر می‌شود (قانون مشهور: «نورون‌هایی که با هم شلیک می‌کنند، با هم سیم‌کشی می‌شوند»).

---

## ⚠️ لایه ۳: توهم تسلط و علت شکست روش‌های مطالعه سطحی (\`Illusion of Competence\`)
* **روش اشتباه و ساده‌لوحانه اغلب افراد:**
  بسیاری از افراد برای یادگیری، کتاب یا جزوه را چند بار می‌خوانند (\`Rereading\`) یا خطوط را هایلایت رنگی می‌کنند. مغز هنگام روخوانی متن احساس راحتی می‌کند و دچار **«توهم تسلط» (\`Illusion of Competence\`)** می‌شود؛ چون چشم متن را می‌شناسد، اما در واقع هیچ مسیر عصبی جدیدی در قشر مغز ساخته نشده است!
* **علت شکست در یادآوری:**
  با گذشت تنها ۲۴ ساعت، طبق منحنی فراموشی ابینگهاوس، بیش از ۷۰ درصد مطالبی که فقط روخوانی شده‌اند از هیپوکامپوس پاک می‌شوند، چون مغز سیگنال نیاز یا تلاش برای بازیابی دریافت نکرده است.

---

## ⚙️ لایه ۴: کالبدشکافی مکانیسم و دیاگرام مسیر حافظه در مغز (\`Neural Architecture & Data Flow\`)
مسیر عبور و تبدیل یک ایده جدید تا تبدیل شدن به حافظه ابدی در مغز به صورت زیر است:

\`\`\`text
+-----------------------+           توجه و تمرکز ارادی          +-----------------------------+
| ورودی‌های حسی محیط    | ────────────────────────────────────> | حافظه کاری و کوتاه‌مدت      |
| [ Sensory Inputs ]    |                                       | [ Working Memory: Prefrontal] |
+-----------------------+                                       +-----------------------------+
                                                                               │
                                                                   تلاش برای درک و بازیابی فعال
                                                                   \`Active Encoding\`
                                                                               ▼
+-----------------------+          بازتولید و تثبیت در خواب عمیق   +-----------------------------+
| قشر مغز: حافظه بلندمدت | <──────────────────────────────────── | هیپوکامپوس: کانون موقت ثبت  |
| [ Neocortex Storage ] |          \`Slow-Wave Sleep & LTP\`     | [ Hippocampus: Index Buffer]|
+-----------------------+                                       +-----------------------------+
\`\`\`

### شرح ۴ مرحله‌ای ساخت مسیر عصبی پایدار:
1. **مرحله ۱ (رمزگذاری اولیه \`Encoding\`):** نورون‌های قشر پیش‌پیشانی و هیپوکامپوس الگوی شلیک موقتی ایجاد می‌کنند.
2. **مرحله ۲ (شکل‌گیری پروتئین‌های سیناپسی):** تحریک مکرر باعث آزاد شدن پیام‌رسان‌های شیمیایی و افزایش گیرنده‌ها در سیناپس می‌شود.
3. **مرحله ۳ (بازپخش شبانه \`Memory Replay\`):** در طول خواب عمیق، هیپوکامپوس همان الگوهای روز را با سرعت بالا تکرار می‌کند تا اتصالات قشر مخ محکم شوند.
4. **مرحله ۴ (استقلال از هیپوکامپوس):** خاطره و مفهوم به شکل شبکه‌ای از اتصالات عصبی در نئوکورتکس تثبیت شده و بدون نیاز به هیپوکامپوس به سرعت یادآوری می‌شود.

---

## 📐 لایه ۵: تحلیل علمی، منحنی فراموشی ابینگهاوس و فواصل طلایی (\`Ebbinghaus Retention Bounds\`)
بررسی نرخ پایداری اطلاعات در ذهن بر اساس فواصل مرور و بازیابی:

| رخداد و فاصله زمانی | پایداری بدون بازیابی فعال | پایداری با بازیابی و تکرار فاصله‌دار (\`SM-2\`) | وضعیت اتصالات سیناپسی در مغز |
| :--- | :--- | :--- | :--- |
| **۲۰ دقیقه پس از یادگیری** | ~ ۵۸٪ حفظ اطلاعات | **۱۰۰٪ تثبیت شده** | فعال بودن گیرنده‌های موقت هیپوکامپوس |
| **۲۴ ساعت اول (پس از یک خواب)** | ~ ۳۳٪ (افت شدید) | **~ ۹۰٪ تثبیت شده** | آغاز سنتز پروتئین‌های ساختاری سیناپس |
| **روز ششم (مرور دوم)** | ~ ۲۱٪ (فراموشی تقریبی) | **~ ۸۵٪ تثبیت پایدار** | گسترش شبکه‌های عصبی در قشر مغز |
| **ماه اول (مرور سوم)** | < ۱۵٪ (تنها سرنخ‌های محو) | **> ۹۵٪ تثبیت دائمی** | تبدیل به دانش ناخودآگاه و حافظه بلندمدت |
| **قانون بنیادی یادگیری** | $\\text{Retention} = e^{-\\frac{t}{S}}$ | افزایش تصاعدی قدرت حافظه $S$ با هر بازیابی | قانون تقویت درازمدت هب (\`LTP\`) |

---

## 💡 لایه ۶: پروتکل اجرایی و دستورالعمل روزانه یادگیری عمیق (\`Actionable Mastery Protocol\`)
برای تثبیت قطعی هر مفهوم جدید در مغز، این پروتکل ۵ مرحله‌ای را اجرا کنید:

1. **گام اول (بازیابی با چشمان بسته - ۵ دقیقه):** پس از مطالعه هر بخش، کتاب را ببندید و تلاش کنید ساختار اصلی را روی یک کاغذ سفید خالی از حافظه خودتان رسم یا یادداشت کنید (\`Active Recall\`).
2. **گام دوم (توضیح به سبک فاینمن - ۳ دقیقه):** مفهوم را با صدای بلند طوری توضیح دهید که گویی می‌خواهید یک نوجوان ۱۲ ساله را بدون هیچ اصطلاح پیچیده‌ای متوجه کنید.
3. **گام سوم (پیدا کردن حفره‌ها):** به بخش‌هایی که در توضیح آن‌ها گیر کردید برگردید و فقط همان نقاط تاریک را دوباره شفاف کنید.
4. **گام چهارم (ثبت در کارت‌های مرور فاصله‌دار):** ۱ تا ۳ سوال مفهومی از بطن درس طرح کرده و در چرخه مرور (\`Spaced Repetition\`) قرار دهید.
5. **گام پنجم (حفاظت از خواب شبانه):** حداقل ۷ تا ۸ ساعت خواب باکیفیت داشته باشید تا مغز اجازه داشته باشد عملیات مهندسی بازسازی سیناپس‌ها را در خواب عمیق کامل کند.

---

## 🚨 لایه ۷: ۳ تله و اشتباه مرگبار در مسیر یادگیری (\`3 Fatal Cognitive Traps\`)
1. **تله شب‌بیداری و بی‌خوابی (\`All-Nighter Trap\`):**
   * *علت:* درس خواندن طولانی بدون خواب شبانه.
   * *پیامد:* عدم رخ دادن بازپخش هیپوکامپوسی در خواب عمیق و پاک شدن بیش از ۸۰٪ اطلاعات در روز بعد.
   * *راهکار قطعی:* زمان مطالعه را تقسیم کنید و خواب را بخشی جدانشدنی از فرآیند رمزگذاری مغز بدانید.
2. **تله انباشتگی شب امتحانی (\`Cramming Illusion\`):**
   * *علت:* تلاش برای یادگیری تمام سرفصل‌ها در یک روز فشرده به جای فواصل زمانی.
   * *پیامد:* عدم شکل‌گیری پروتئین‌های ساختاری در سیناپس‌ها و فراموشی کامل پس از آزمون.
   * *راهکار قطعی:* استفاده از فواصل روز ۱، روز ۳، روز ۷ و روز ۲۱.
3. **تله اضافه بار شناختی (\`Cognitive Overload\`):**
   * *علت:* تلاش برای یادگیری همزمان چندین مفهوم پیچیده بدون درک تمثیل‌های پایه.
   * *پیامد:* اشباع حافظه کاری پیش‌پیشانی و ایجاد خستگی مفرط ذهنی و دلسردی.
   * *راهکار قطعی:* شکستن مفاهیم به تکه‌های کوچک‌تر (\`Chunking\`) و تسلط زنجیره‌ای.

---

## 🧠 لایه ۸: جمع‌بندی فاینمن در ۳ جمله و پرسش‌های کارت حافظه (\`Feynman Synthesis & SM-2 Flashcards\`)
* **خلاصه ۳ خطی به زبان ساده:**
  مغز انسان مانند عضله‌ای است که با هر بار تلاش برای «به یاد آوردن»، اتصالات میان سلول‌هایش ضخیم‌تر و محکم‌تر می‌شوند. با خواب کافی و مرورهای بافاصله، اطلاعات موقت هیپوکامپوس به بایگانی دائمی و تسخیرناپذیر قشر مغز منتقل می‌گردند.
* **پرسش‌های کلیدی برای جعبه لایتنر (\`SM-2 Flashcard Anchors\`):**
  1. تفاوت وظیفه «هیپوکامپوس» و «نئوکورتکس» در فرآیند ثبت و ماندگاری اطلاعات چیست؟
  2. چرا خواندن چندباره یک متن (\`Rereading\`) فقط توهم یادگیری ایجاد می‌کند اما یادآوری فعال (\`Active Recall\`) مسیر عصبی می‌سازد؟
  3. پدیده تقویت درازمدت سیناپسی (\`LTP\`) به چه معناست و قانون بنیادی آن چیست؟`;
  }

  // 2. MATHEMATICAL FOUNDATIONS (ریاضیات و جبر خطی و بهینه‌سازی)
  if (domain === "math-foundations") {
    return `# ${persianTitle} (\`${titleEn}\`)
> **مسیر یادگیری گام‌به‌گام:** از درک شهودی هندسی تا فرمولاسیون دقیق و کاربرد عملی | **بخش:** ${phaseTitle || "ریاضیات محاسباتی"} • **ماژول:** ${moduleTitle || "پایه‌های عددی"}

---

## 🧩 لایه ۱: تصویرسازی شهودی از صفر مطلق (\`Everyday Tangible Metaphor\`)
اگر فرمول‌ها و نمادهای جبری را کنار بگذاریم، این مفهوم در دنیای ملموس چه معنایی دارد؟
* **تمثیل جهت‌یابی و مقیاس در نقشه:**
  تصور کنید در یک دشت پهناور ایستاده‌اید و می‌خواهید موقعیت یک گنج را به دوستتان بگویید. صرفاً گفتن یک عدد (مثلاً «۵») کافی نیست؛ شما باید هم **جهت حرکت** (مثلاً شمال شرقی) و هم **میزان مسافت** (مثلاً ۵ کیلومتر) را مشخص کنید. این پیکان جهت‌دار، ذات این مفهوم ریاضی است.
* **تطبیق دنیای واقعی با زبان ریاضیات:**
  * **عدد تنها (اسکالر):** فقط نشان‌دهنده مقدار یا اندازه است.
  * **پیکان جهت‌دار:** نشان‌دهنده حالت و ترکیب چند ویژگی همزمان در فضا است.

---

## 💥 لایه ۲: بحران در غیاب این مفهوم و چرایی اختراع (\`The Mathematical Need\`)
* **چرا ریاضی‌دانان این ابزار را ساختند؟** حل معادلات تکی برای سامانه‌های چندبعدی ناممکن بود. این فرمولاسیون ابداع شد تا هزاران رابطه همزمان در قالب یک نماد جمع‌وجور و با سرعت شگفت‌انگیز محاسبه شوند.
* **واژه‌نامه پایه با تعاریف روان:**
  * **فضای برداری (\`Vector Space\`):** محیطی با ابعاد مشخص که تمامی بردارها طبق قوانین جمع و ضرب می‌توانند در آن قرار بگیرند.
  * **تبدیل خطی (\`Linear Transformation\`):** چرخاندن، کشیدن یا تغییر مقیاس فضا بدون خم کردن خطوط مستقیم.
  * **ضرب داخلی (\`Dot Product\`):** معیاری برای اندازه‌گیری هم‌جهت بودن دو بردار و محاسبه شباهت آن‌ها.

---

## ⚠️ لایه ۳: راه‌حل ساده‌لوحانه و علت ناکارآمدی (\`Naive Calculation vs Matrix Rigor\`)
* **روش ساده‌لوحانه:** محاسبه تک‌تک معادلات با حلقه‌های تکراری طولانی.
* **چرا در مقیاس هوش مصنوعی شکست می‌خورد؟** پردازش میلیون‌ها ویژگی بدون استفاده از جبر خطی و ضرب ماتریسی بهینه‌سازی‌شده، زمان محاسبات را از چند میلی‌ثانیه به چند ساعت می‌رساند.

---

## ⚙️ لایه ۴: کالبدشکافی مکانیسم و دیاگرام محاسباتی (\`Geometric Mechanics & Steps\`)
\`\`\`text
+-----------------------+           تبدیل ماتریسی و ضرب خطی        +-------------------------+
| بردار ورودی ویژگی‌ها  | ───────────────────────────────────────> | بردار ویژگی‌های نهایی   |
| [ Input Vector x ]    |               [ y = W · x + b ]          | [ Transformed Vector y] |
+-----------------------+                                          +-------------------------+
\`\`\`

---

## 📐 لایه ۵: فرمالیسم ریاضی، خواص و جدول مقایسه (\`Formal Bounds & Properties\`)
| ویژگی | فرمول ریاضی | مفهوم شهودی هندسی | کاربرد در هوش مصنوعی و سیستم |
| :--- | :--- | :--- | :--- |
| **اندازه و هنجار** | $\\|v\\| = \\sqrt{\\sum v_i^2}$ | طول فیزیکی پیکان در فضا | نرمال‌سازی داده‌ها و جلوگیری از انفجار گرادیان |
| **شباهت کسینوسی** | $\\cos(\\theta) = \\frac{u \\cdot v}{\\|u\\| \\|v\\|}$ | زاویه میان دو بردار | مقایسه شباهت متون و تصاویر در مدل‌های زبانی |
| **پیچیدگی ضرب** | $\\mathcal{O}(n^3) \\rightarrow \\mathcal{O}(n^{2.8})$ | حجم محاسبات جبری | بهینه‌سازی موتورهای GEMM در کارت‌های گرافیک |

---

## 💡 لایه ۶: پروتکل محاسباتی و نمونه حل گام‌به‌گام (\`Step-by-Step Practical Execution\`)
برای حل و به‌کارگیری این مفهوم در مسائل کاربردی:
1. داده‌های ورودی را به صورت آرایه‌ای از اعداد حقیقی مرتب کنید.
2. بردارها را نرمال کنید تا طول آن‌ها برابر با ۱ شود.
3. با استفاده از ضرب نقطه‌ای، میزان هم‌پوشانی و شباهت آن‌ها را محاسبه نمایید.

---

## 🚨 لایه ۷: ۳ تله و اشتباه مرگبار در محاسبات (\`3 Fatal Mathematical Pitfalls\`)
1. **تله عدم تطابق ابعاد:** ضرب ماتریس‌هایی که تعداد ستون اولی با ردیف دومی برابر نیست.
2. **تله صفر شدن مخرج:** فراموش کردن مقدار کوچک $\\epsilon$ در مخرج کسرها هنگام نرمال‌سازی.
3. **تله تقریب اعشاری:** خطاهای گرد کردن در محاسبات اعشاری بزرگ.

---

## 🧠 لایه ۸: جمع‌بندی فاینمن در ۳ جمله و پرسش‌های کارت حافظه (\`Feynman Synthesis & SM-2 Flashcards\`)
* **خلاصه ۳ خطی به زبان ساده:**
  این مفهوم ریاضی زبان واحد توصیف داده‌های پیچیده در چند بعد است که به ما اجازه می‌دهد موقعیت، شباهت و تغییرات را با ساده‌ترین و سریع‌ترین ضرب‌های جبری محاسبه کنیم.
* **پرسش‌های کلیدی برای جعبه لایتنر (\`SM-2 Flashcard Anchors\`):**
  1. تفاوت ضرب داخلی دو بردار عمود بر هم با دو بردار هم‌جهت چیست؟
  2. چرا در فضاهای با ابعاد بالا، شباهت کسینوسی معیار بهتری نسبت به فاصله اقلیدسی است؟
  3. معنای هندسی ضرب ماتریس در بردار چیست؟`;
  }

  // 3. DIGITAL LOGIC & HARDWARE
  if (domain === "digital-logic" || domain === "hardware-architecture") {
    return `# ${persianTitle} (\`${titleEn}\`)
> **مسیر یادگیری گام‌به‌گام:** از الفبای فیزیکی سخت‌افزار تا حداکثر کارایی پردازنده | **بخش:** ${phaseTitle || "معماری سخت‌افزار"} • **ماژول:** ${moduleTitle || "سیستم‌های دیجیتال"}

---

## 🧩 لایه ۱: تصویرسازی شهودی از صفر مطلق (\`Everyday Tangible Metaphor\`)
اگر هیچ اطلاعاتی از برق، الکترونیک و مدارها نداشته باشید، چطور این مفهوم را درک کنید؟
* **داستان میلیون‌ها کلید برق و سطل‌های آب:**
  تصور کنید شهری پر از میلیون‌ها لامپ کوچک دارید که با کلیدهای آب‌پاش کنترل می‌شوند. کلید یا کاملاً باز است (جریان دارد / ۱) یا کاملاً بسته است (جریان ندارد / ۰). کامپیوترها صرفاً با ترکیب هوشمندانه این کلیدهای خاموش و روشن، سخت‌ترین محاسبات دنیا را انجام می‌دهند.
* **تطبیق دنیای واقعی با اجزای سخت‌افزار:**
  * **کلیدهای قطع و وصل:** معادل ترانزیستورها و بیت‌های دودویی (\`Binary Bits\`) است.
  * **میز کار دم دست نجار:** معادل ثبات‌های پردازنده (\`Registers\`) و خطوط حافظه کش (\`L1/L2 Cache\`) است.
  * **انبار دوردست در شهر دیگر:** معادل حافظه رم اصلی (\`DRAM\`) است.

---

## 💥 لایه ۲: بحران در غیاب این مفهوم و چرایی اختراع (\`The Hardware Need\`)
* **قبل از پیدایش این ساختار:** کامپیوترها سیم‌کشی‌های دستی و اختصاصی داشتند و برای هر محاسبه باید کابل‌ها جابجا می‌شدند. معماری فون نویمان با ایده نبوغ‌آمیز «ذخیره برنامه و داده در یک حافظه مشترک» دنیای محاسبات مدرن را خلق کرد.
* **واژه‌نامه پایه با تعاریف ساده:**
  * **چرخه واکشی-دیکود-اجرا (\`Fetch-Decode-Execute\`):** ریتم تپش پردازنده برای خواندن دستور از حافظه و اجرای آن.
  * **خط حافظه نهان (\`64-Byte Cache Line\`):** کوچک‌ترین بسته‌ای که پردازنده در یک مرحله از حافظه می‌خواند.
  * **تنگنای حافظه (\`Memory Wall\`):** فاصله سرعت خیره‌کننده پردازنده در برابر کندی نسبی حافظه رم.

---

## ⚠️ لایه ۳: راه‌حل ساده‌لوحانه و علت شکست در عمل (\`Naive Design vs Modern Hardware\`)
* **روش ساده‌لوحانه:** تصور اینکه پردازنده به تمام نقاط حافظه رم با سرعت یکسان دسترسی دارد.
* **علت شکست در واقعیت:** هر بار که پردازنده منتظر رسیدن داده از رم بماند (\`Cache Miss\`)، حدود ۲۰۰ سیکل معطل می‌شود که باعث افت ۹۹ درصدی توان اجرایی می‌گردد.

---

## ⚙️ لایه ۴: کالبدشکافی مکانیسم و دیاگرام سخت‌افزار (\`Hardware Architecture & Data Flow\`)
\`\`\`text
+-----------------------+           واکشی دستور و آدرس حافظه         +-------------------------+
| واحد کنترل پردازنده   | ───────────────────────────────────────> | حافظه نهان سطح یک (L1)  |
| [ Control Unit / PC ] |               [ Fetch Phase ]            | [ 64-Byte Cache Window] |
+-----------------------+                                          +-------------------------+
                                                                                │
                                                                   دیکود و محاسبه در ثبات‌ها
                                                                   \`ALU Execution\`
                                                                                ▼
+-----------------------+          ثبت نهایی نتیجه در خط حافظه     +-------------------------+
| واحد محاسبات و منطق   | <─────────────────────────────────────── | ثبات‌های پردازنده (Regs)|
| [ Execution Engine ]  |               [ Write-Back ]             | [ Single-Cycle Latency] |
+-----------------------+                                          +-------------------------+
\`\`\`

---

## 📐 لایه ۵: جدول تاخیر فیزیکی سخت‌افزار (\`Hardware Latency & Formal Bounds\`)
| سطح حافظه در سخت‌افزار | زمان دسترسی بر حسب نانوثانیه | سیکل‌های ساعت پردازنده | تمثیل زمانی ملموس در دنیای انسان |
| :--- | :--- | :--- | :--- |
| **ثبات پردازنده (\`Registers\`)** | **~ ۰.۲۵ نانوثانیه** | ۱ سیکل | پلک زدن ۱ ثانیه‌ای |
| **حافظه نهان \`L1 Cache\`** | **~ ۱.۰ نانوثانیه** | ۴ سیکل | ۴ ثانیه |
| **حافظه نهان \`L2 Cache\`** | **~ ۳.۵ نانوثانیه** | ۱۴ سیکل | ۱۴ ثانیه |
| **حافظه نهان اشتراکی \`L3\`** | **~ ۱۰ تا ۲۰ نانوثانیه** | ۵۰ سیکل | ۱ دقیقه |
| **حافظه رم اصلی (\`DRAM\`)** | **~ ۶۰ تا ۱۰۰ نانوثانیه** | ۲۰۰ تا ۴۰۰ سیکل | **۴ دقیقه معطلی!** |
| **حافظه ذخیره‌سازی \`NVMe SSD\`**| **~ ۲۵,۰۰۰ نانوثانیه** | ۱۰۰,۰۰۰ سیکل | **۱ روز کامل معطلی!** |

---

## 💻 لایه ۶: پیاده‌سازی بهینه سازگار با کش سخت‌افزار (\`Hardware-Conscious C Implementation\`)
\`\`\`c
/**
 * Hardware-Aligned High Throughput Structure
 */
#include <stdio.h>
#include <stdint.h>
#include <stdbool.h>

// تراز ساختار بر مرز ۶۴ بایتی خط کش برای جلوگیری از جریمه خطای کش
typedef struct {
    uint64_t operations_count;  // ۸ بایت
    uint32_t active_mask;       // ۴ بایت
    uint8_t  padding[52];       // ۵۲ بایت پدینگ تا ساختار دقیقاً ۶۴ بایت شود
} __attribute__((aligned(64))) CacheAlignedUnit;

void process_aligned_unit(CacheAlignedUnit* unit) {
    if (!unit) return;
    unit->operations_count++;
}
\`\`\`

---

## 🚨 لایه ۷: ۳ تله مرگبار در مهندسی سخت‌افزار (\`3 Fatal Hardware Pitfalls\`)
1. **تله عدم تراز حافظه (\`Unaligned Access\`):** داده‌هایی که روی دو خط کش ۶۴ بایتی می‌افتند و زمان خواندن را دو برابر می‌کنند.
2. **تله پرش‌های غیرقابل پیش‌بینی (\`Branch Misprediction\`):** شرط‌های تصادفی که خط لوله پردازنده را تخلیه می‌کنند.
3. **تله هدررفت فضای کش (\`Structure Bloat\`):** قرار دادن داده‌های کم‌مصرف در کنار داده‌های پرمصرف در یک خط کش مشترک.

---

## 🧠 لایه ۸: جمع‌بندی فاینمن در ۳ جمله و پرسش‌های کارت حافظه (\`Feynman Synthesis & SM-2 Flashcards\`)
* **خلاصه ۳ خطی به زبان ساده:**
  سخت‌افزار کامپیوتر هرمی از حافظه‌های سریع اما کوچک تا حافظه‌های بزرگ اما کند است. هنر مهندسی یعنی نگه داشتن داده‌های حیاتی در سریع‌ترین لایه‌های دم‌دست تا پردازنده حتی یک نانوثانیه معطل نماند.
* **پرسش‌های کلیدی برای جعبه لایتنر (\`SM-2 Flashcard Anchors\`):**
  1. چرا اندازه خط کش پردازنده دقیقاً ۶۴ بایت است و چه تاثیری در طراحی ساختار داده‌ها دارد؟
  2. تفاوت زمان دسترسی کش L1 با رم اصلی چیست؟
  3. مفهوم تنگنای فون نویمان (\`Von Neumann Bottleneck\`) چیست؟`;
  }

  // 4. SYSTEMS, LINUX, C & CONCURRENCY
  return `# ${persianTitle} (\`${titleEn}\`)
> **مسیر یادگیری گام‌به‌گام:** از فهم شهودی تا معماری پروداکشن در سطح سیستم | **بخش:** ${phaseTitle || "مهندسی سیستم‌ها"} • **ماژول:** ${moduleTitle || "سیستم‌های سطح پایین"}

---

## 🧩 لایه ۱: تصویرسازی شهودی از صفر مطلق (\`Everyday Tangible Metaphor\`)
اگر هیچ پیش‌زمینه یا دانش قبلی در علوم کامپیوتر نداشته باشید، این مفهوم را چطور باید درک کنید؟

* **داستان کتابدار فوق‌سریع و قفسه‌های ۶۴ سانتی‌متری:**
  تصور کنید کتابداری بسیار منظم در کتابخانه‌ای عظیم کار می‌کند که قفسه‌های آن دقیقاً ۶۴ سانتی‌متر عرض دارند. این کتابدار برای هر مراجعه تنها می‌تواند یک قفسه کامل ۶۴ سانتی‌متری را در یک حرکت بردارد.
  اگر شما کتاب‌ها را نامرتب و پراکنده قرار دهید، کتابدار مجبور می‌شود پیاپی قفسه‌های دوردست را بیرون بکشد و زمان پاسخ‌دهی ده‌ها برابر کند شود؛ اما با چیدمان تراز و مرتب، همه‌چیز در یک چشم برهم زدن تحویل داده می‌شود.
* **تطبیق دنیای واقعی با اجزای کامپیوتر:**
  * **کتابدار:** معادل پردازنده اصلی (\`CPU\`) است.
  * **قفسه‌های کتابخانه:** معادل خطوط حافظه نهان (\`64-Byte Cache Lines\`) در سخت‌افزار است.
  * **چیدمان دقیق:** معادل تراز کردن داده‌ها در حافظه (\`Memory Alignment\`) است.

---

## 💥 لایه ۲: بحران در غیاب این مفهوم و چرایی اختراع (\`The Missing Link & Catastrophe\`)
* **دنیای بدون این مفهوم:** سیستم‌های اولیه داده‌ها را بدون سازوکار اختصاصی و بدون رعایت ساختار سخت‌افزار مدیریت می‌کردند که در بار بالا منجر به **تصادم حافظه (\`Memory Corruption\`)**، **بن‌بست پردازنده‌ها (\`Deadlock\`)** و **سقوط ناگهانی سرعت** می‌شد.
* **واژه‌نامه پایه برای درک آسان (تعاریف روان):**
  * **تراز حافظه (\`Memory Alignment\`):** چیدن اطلاعات در آدرس‌هایی که مضربی از توان پردازنده است.
  * **تاخیر در برابر توان (\`Latency vs. Throughput\`):** تاخیر یعنی زمان یک درخواست؛ توان یعنی تعداد کل درخواست‌ها در ثانیه.
  * **ناوردای سیستم (\`System Invariant\`):** قانونی حیاتی در سیستم که تحت هیچ شرایطی نباید نقض شود.

---

## ⚠️ لایه ۳: راه‌حل ساده‌لوحانه و علت شکست در مقیاس (\`Naive Approach vs Real Scale\`)
* **روش ساده‌لوحانه:** متغیرهای پراکنده بدون بافر و بدون هماهنگی سخت‌افزاری.
* **علت شکست:** با افزایش درخواست‌ها، خطاهای حافظه نهان (\`Cache Misses\`) رخ داده و پردازنده در انتظار داده‌های رم متوقف می‌ماند (\`CPU Stall\`).

---

## ⚙️ لایه ۴: کالبدشکافی مکانیسم و دیاگرام جریان داده (\`Under the Hood Architecture\`)
\`\`\`text
+-------------------------+                     +-------------------------------+                     +-------------------------+
|     هسته پردازنده ۱     |                     |    گذرگاه حافظه هماهنگ با کش  |                     |     هسته پردازنده ۲     |
| [ Core 1: Writer Thread]|                     | [ Cache-Coherent Memory Bus ] |                     | [ Core 2: Reader Thread]|
+-------------------------+                     +-------------------------------+                     +-------------------------+
             │                                                  │                                                  │
             │  ۱. دستور اتمیک بررسی و جابجایی (CAS)            │                                                  │
             ├─────────────────────────────────────────────────>│                                                  │
             │                                                  │  ۲. نامعتبرسازی خط کش در هسته دوم (MESI)         │
             │                                                  ├─────────────────────────────────────────────────>│
             │  ۳. سد حافظه جهت تضمین ترتیب نوشتن (Fence)       │                                                  │
             ├─────────────────────────────────────────────────>│  ۴. سمانتیک خوانش امن داده تازه (Acquire)       │
             │                                                  ├─────────────────────────────────────────────────>│
             ▼                                                  ▼                                                  ▼
+-------------------------+                     +-------------------------------+                     +-------------------------+
| وضعیت: ثبت قطعی در حافظه |                     |  تراز دقیق بر خط ۶۴ بایتی کش  |                     |  وضعیت: تضمین خوانش تازه|
+-------------------------+                     +-------------------------------+                     +-------------------------+
\`\`\`

---

## 📐 لایه ۵: تحلیل ریاضیاتی، پیچیدگی و جدول تاخیر سخت‌افزار (\`Formal Bounds & Latency\`)
| شاخص ارزیابی | کران محاسباتی (\`Big-O\`) | رخداد فیزیکی در سخت‌افزار | زمان دسترسی تقریبی |
| :--- | :--- | :--- | :--- |
| **بهترین حالت (\`Best Case\`)** | $\\mathcal{O}(1)$ | واکشی مستقیم از کش پرسرعت \`L1\` | **~ ۱.۰ نانوثانیه** |
| **میانگین (\`Average Case\`)** | $\\mathcal{O}(1)$ تا $\\mathcal{O}(\\log n)$ | هماهنگ با پیش‌بین انشعابات سخت‌افزار | **~ ۲.۰ تا ۵.۰ نانوثانیه** |
| **بدترین حالت (\`Worst Case\`)** | $\\mathcal{O}(n)$ یا خطای موردی | مراجعه مستقیم به رم اصلی (\`DRAM\`) | **~ ۵۰ تا ۱۰۰ نانوثانیه** |
| **حافظه مصرفی (\`Space Complexity\`)** | $\\mathcal{O}(1)$ حافظه کمکی | چیدمان بسته داده‌ها در مرزهای ۶۴ بایتی | بدون اتلاف حافظه |

---

## 💻 لایه ۶: کد استاندارد صنعتی با کامنت‌های خط‌به‌خط (\`Clean Industrial Implementation\`)
\`\`\`c
/**
 * Industrial Production Reference Implementation
 * Module: ${titleEn} (${persianTitle})
 */

#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <stdint.h>

// ساختار تراز شده برای کارایی بالا در سخت‌افزار
typedef struct {
    uint64_t state_flags;      // فلگ‌های وضعیت
    uint32_t active_counter;   // شمارنده عملیات فعال
    uint32_t capacity_mask;    // ماسک بیتی جایگزین عملگر تقسیم
    void* ring_buffer;         // بافر تراز شده
} __attribute__((aligned(64))) ProductionSystemEngine;

bool engine_init(ProductionSystemEngine* engine, size_t capacity_power_of_two) {
    if (!engine || capacity_power_of_two == 0) return false;
    engine->capacity_mask = (uint32_t)(capacity_power_of_two - 1);
    engine->active_counter = 0;
    engine->state_flags = 0x0001;
    return true;
}
\`\`\`

---

## 🚨 لایه ۷: ۳ تله و اشتباه مرگبار در پروداکشن (\`3 Fatal Real-World Pitfalls\`)
1. **تله اشتراک دروغین در کش (\`False Sharing\`):** تداخل دو هسته روی یک خط کش مشترک.
2. **تله جابجایی دستورات در سخت‌افزار (\`Memory Reordering\`):** نقض ترتیب اجرای خطوط در پردازنده.
3. **تله نشت منابع (\`Resource Leaks\`):** عدم آزادسازی حافظه در مسیرهای خطا.

---

## 🧠 لایه ۸: جمع‌بندی فاینمن در ۳ جمله و پرسش‌های کارت حافظه (\`Feynman Synthesis & SM-2 Flashcards\`)
* **خلاصه ۳ خطی به زبان ساده:**
  این مفهوم هنر چیدمان و هماهنگی دقیق داده‌ها است تا سیستم بدون معطلی، بیشترین کار را با کمترین زمان تاخیر انجام دهد.
* **پرسش‌های کلیدی برای جعبه لایتنر (\`SM-2 Flashcard Anchors\`):**
  1. چرا رعایت تراز داده‌ها موجب افزایش سرعت پردازش می‌شود؟
  2. پدیده \`Cache Miss\` چیست و چه تاثیری بر زمان پاسخ‌دهی سیستم دارد؟
  3. تفاوت حافظه نهان پردازنده با رم اصلی در چیست؟`;
}

// 1. Generate comprehensive lesson syllabus / lecture notes (جزوه تحلیلی و استاندارد صنعتی)
app.post("/api/generate-lesson-material", async (req, res) => {
  try {
    const { titleEn, titleFa, phaseTitle, moduleTitle, focusPoints } = req.body;
    const domain = detectTopicDomain(titleEn, titleFa, moduleTitle, phaseTitle);

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        content: generateAcademicLectureFallback(titleEn, titleFa, phaseTitle, moduleTitle),
        source: "fallback",
      });
    }

    const domainInstructions =
      domain === "cognitive-learning"
        ? `DOMAIN TARGET: COGNITIVE SCIENCE, NEUROSCIENCE OF MEMORY, & LEARNING ENGINEERING.
CRITICAL MANDATE: This lesson is about the HUMAN BRAIN, COGNITIVE ARCHITECTURE, NEUROBIOLOGY, and LEARNING THEORY (Memory Consolidation, Synaptic Plasticity, LTP, Hippocampus vs Neocortex, Sleep/Consolidation, Feynman Technique, Spaced Repetition SM-2, Cognitive Load Theory).
DO NOT talk about C programming, CPU cache lines, x86_64 registers, or computer operating systems!
Teach how the human brain acquires, stores, consolidates and retrieves information from biological and cognitive first principles.`
        : domain === "math-foundations"
        ? `DOMAIN TARGET: MATHEMATICS, LINEAR ALGEBRA & NUMERICAL COMPUTATION.
CRITICAL MANDATE: This lesson is about MATHEMATICAL PRINCIPLES (Vectors, Matrices, Calculus, Gradients, Probability, Bayes, Information Theory).
Teach geometric intuition, algebraic formalisms, step-by-step calculation protocols, and visual representations.`
        : domain === "digital-logic"
        ? `DOMAIN TARGET: DIGITAL LOGIC, BOOLEAN ALGEBRA & VON NEUMANN ARCHITECTURE.
CRITICAL MANDATE: This lesson is about Digital Logic, Logic Gates, Two's Complement, Floating Point IEEE 754, ALU, Control Unit, and the Von Neumann execution cycle.
Teach step-by-step bit transformations, hardware gates, and truth tables.`
        : domain === "hardware-architecture"
        ? `DOMAIN TARGET: COMPUTER HARDWARE ARCHITECTURE, CACHE HIERARCHY, GPU & MEMORY WALL.
CRITICAL MANDATE: This lesson is about L1/L2/L3 Caches, 64-byte Cache Lines, Cache Locality, DDR5/LPDDR RAM Bottleneck, SIMD/SIMT GPU Cores, and HBM memory.
Teach physical latency numbers (nanoseconds), cache-line boundaries, and hardware bottlenecks.`
        : domain === "dsa-algorithms"
        ? `DOMAIN TARGET: HIGH-PERFORMANCE DATA STRUCTURES & ALGORITHMS (DSA).
CRITICAL MANDATE: This lesson is about Asymptotic Complexity, Big-O vs Cache-friendly contiguous structures, Hash Tables (Linear Probing/Robin Hood), B-Trees, Graph Algorithms, and Lock-free structures.
Teach algorithmic trade-offs, spatial/temporal bounds, and production implementation.`
        : domain === "ai-llm-infrastructure"
        ? `DOMAIN TARGET: AI & LLM INFRASTRUCTURE, TRANSFORMERS & ACCELERATORS.
CRITICAL MANDATE: This lesson is about Attention mechanisms, QKV projections, FlashAttention SRAM tiling, KV Cache memory footprint, Model Quantization, CUDA kernels, and distributed parallelism.`
        : domain === "concurrency-network"
        ? `DOMAIN TARGET: CONCURRENCY, DISTRIBUTED SYSTEMS & NETWORKING.
CRITICAL MANDATE: This lesson is about POSIX Threads, Mutexes, Deadlocks, Atomic CAS, Memory Barriers, Socket Programming, TCP/IP, epoll, and Consensus protocols.`
        : `DOMAIN TARGET: COMPUTER SYSTEMS, LOW-LEVEL ARCHITECTURE, OS & SOFTWARE ENGINEERING.
Teach low-level system mechanics, data flows, hardware alignment, and clean industrial code.`;

    const systemPrompt = `You are a World-Class Master Educator and Pedagogical Architect (combining the intuitive clarity of Richard Feynman, the neurological precision of Eric Kandel / Andrew Huberman, and top university professors from MIT and Stanford).

Your mission is to produce the ABSOLUTE PINNACLE, DEFINITIVE, ZERO-FLUFF, ULTRA-PEDAGOGICAL 8-LAYER LECTURE NOTE (جزوه جامع ۸ لایه‌ای از صفر تا تسلط عمیق).

${domainInstructions}

CRITICAL PEDAGOGICAL & LINGUISTIC RULES:
1. ABSOLUTE ZERO TO HERO: Layer 1 MUST start with ZERO technical prerequisites, using an unforgettable everyday physical/real-world tangible analogy before introducing formal terminology.
2. STRICT TYPOGRAPHY & PERSIAN HALF-SPACES (نیم‌فاصله‌های استاندارد):
   - Correctly use standard Persian half-spaces (e.g. «شکل‌پذیری», «کوتاه‌مدت», «بلندمدت», «تخته‌سیاه», «راه‌حل», «بازپخش»).
3. STRICT LANGUAGE HARMONY & BIDI INTEGRITY (قانون طلایی زبان فارسی و عدم تداخل متنی):
   - The explanatory narrative MUST be 100% fluent, elegant, and crystal-clear Persian (فارسی شیوا، دقیق و کاملاً روان).
   - NEVER leave English words floating freely inside Persian sentences. EVERY single English term MUST be enclosed in inline code ticks \`EnglishTerm\` or formatted as «اصطلاح فارسی (\`EnglishTerm\`)» to guarantee zero RTL/LTR bidi direction rendering glitches.
   - Code blocks and ASCII diagrams must be completely separated into dedicated Markdown blocks.
4. STRICT MARKDOWN FORMATTING & LINE BREAKS (جلوگیری از فشردگی و خرابی جدول‌ها):
   - Every list item, numbered step, trap, or definition MUST be separated by a double newline (\\n\\n) so they render as distinct paragraphs/lines.
   - TABLES MUST BE FORMATTED PROPERLY with line breaks between every single row. Never put multiple rows on one line!
   - Math formulas must be explicitly written out (e.g. فرمول منحنی فراموشی ابینگهاوس: $R = e^{-t/S}$).

5. 8-LAYER STRUCTURE WITH EXACT HEADINGS:

# [عنوان فارسی درس] (\`[English Lesson Title]\`)
> **مسیر یادگیری گام‌به‌گام:** از فهم شهودی از صفر تا تسلط عمیق و کاربردی | **بخش:** [Phase Title] • **ماژول:** [Module Title]

---

## 🧩 لایه ۱: تصویرسازی شهودی از صفر مطلق (\`Everyday Tangible Metaphor\`)
- یک داستان یا تمثیل کاملاً ملموس فیزیکی و روزمره بدون نیاز به کوچک‌ترین پیش‌نیاز فنی.
- جدول یا فهرست نقطه‌ای تطبیق تک‌تک اجزای تمثیل با واقعیت مفهوم علمی.

---

## 💥 لایه ۲: بحران در غیاب این مفهوم و چرایی بنیادین (\`The Missing Link & Core Purpose\`)
- تشریح شفاف فاجعه یا نقصی که در صورت نبود این مفهوم رخ می‌دهد.
- واژه‌نامه پایه با تعریف ساده ۳ اصطلاح کلیدی (هر تعریف در یک سطر مجزا با بولت).

---

## ⚠️ لایه ۳: راه‌حل ساده‌لوحانه و علت شکست روش‌های سطحی (\`Naive Approach vs Reality\`)
- رویکرد شهودی و ساده‌لوحانه‌ای که افراد مبتدی به اشتباه به کار می‌برند (مثلاً روخوانی منفعل یا حلقه‌های تکرار ساده).
- چرا این رویکرد در دنیای واقعی و شرایط سخت شکست می‌خورد و فریب «توهم تسلط» را توضیح دهید.

---

## ⚙️ لایه ۴: کالبدشکافی مکانیسم و دیاگرام ساختاری (\`Under the Hood Architecture & Flow\`)
- دیاگرام متنی چندخطی اسکی (ASCII Map) خوانا و دقیق درون بلوک \`\`\`text ... \`\`\`.
- تشریح گام‌به‌گام ۴ مرحله اصلی فرآیند (هر مرحله در یک سطر شماره‌دار مجزا با یک خط فاصله).

---

## 📐 لایه ۵: تحلیل علمی، مدل‌ها و جدول مقایسه (\`Scientific Bounds, Models & Metrics\`)
- جدول مقایسه‌ای مارک‌داون با فرمت استاندارد (سطر به سطر با خط شکست مجزا) شامل مراحل، معیارهای کمی و زمانی و ویژگی‌ها.
- فرمول‌ها یا قضایای ریاضی/علمی مربوطه.

---

## 💡 لایه ۶: پیاده‌سازی و پروتکل عملیاتی استاندارد (\`Standard Practical Protocol / Implementation\`)
- اگر علوم شناختی/یادگیری است: پروتکل ۵ مرحله‌ای روزانه با دستورالعمل‌های اجرایی دقیق (هر گام در سطر مجزا).
- اگر سیستم/ریاضی است: کد تمیز و امن استاندارد C/Python یا فرمولاسیون گام‌به‌گام با کامنت‌های خط‌به‌خط.

---

## 🚨 لایه ۷: ۳ تله و اشتباه مرگبار (\`3 Fatal Real-World Pitfalls\`)
- ۱. تله اول: شرح اشتباه رایج + ریشه + راهکار قطعی رفع.
- ۲. تله دوم: شرح اشتباه رایج + ریشه + راهکار قطعی رفع.
- ۳. تله سوم: شرح اشتباه رایج + ریشه + راهکار قطعی رفع.

---

## 🧠 لایه ۸: جمع‌بندی فاینمن در ۳ جمله و پرسش‌های کارت حافظه (\`Feynman Synthesis & SM-2 Flashcards\`)
- خلاصه فاینمن در ۳ جمله فوق‌العاده ساده، روان و ماندگار.
- ۳ پرسش لنگری و تشخیصی باکیفیت برای جعبه لایتنر و تکرار فاصله‌دار SM-2.`;

    const userPrompt = `Generate the definitive 8-layer zero-to-mastery lecture for:
Topic: "${titleEn}" (Persian: "${titleFa || titleEn}")
Phase: "${phaseTitle || "Foundations"}"
Module: "${moduleTitle || "Core Module"}"
Focus: "${focusPoints || "Absolute zero intuition to scientific rigor and practical execution"}"

Output ONLY the formatted Markdown starting directly with the # H1 title.`;

    const { text, modelUsed } = await callGeminiSafe({
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        },
      ],
    });

    const content = text || generateAcademicLectureFallback(titleEn, titleFa, phaseTitle, moduleTitle);

    res.json({
      content,
      source: "gemini",
      modelUsed,
    });
  } catch (error: any) {
    console.warn("Gracefully using structured academic lecture fallback due to upstream status:", error?.message || error);
    res.json({
      content: generateAcademicLectureFallback(
        req.body?.titleEn || "",
        req.body?.titleFa || "",
        req.body?.phaseTitle || "",
        req.body?.moduleTitle || ""
      ),
      source: "fallback",
      errorNote: error?.message,
    });
  }
});

// 2. Generate Feynman guided questions and mental analogies
app.post("/api/generate-feynman-guide", async (req, res) => {
  try {
    const { titleEn, titleFa, phaseTitle, moduleTitle } = req.body;
    const domain = detectTopicDomain(titleEn, titleFa, moduleTitle, phaseTitle);

    if (!process.env.GEMINI_API_KEY) {
      const defaultAnalogy =
        domain === "cognitive-learning"
          ? `تکنیک فاینمن برای «${titleFa || titleEn}»: تصور کنید چگونگی ثبت و ماندگاری اطلاعات در مغز را برای یک نوجوان ۱۲ ساله توضیح می‌دهید (مثلاً تمثیل تخته‌سیاه کلاسی و لوح‌های سنگی دائمی).`
          : domain === "math-foundations"
          ? `تکنیک فاینمن برای «${titleFa || titleEn}»: تصور کنید این مفهوم ریاضی را با تمثیل‌های هندسی و ملموس (مثل جهت‌یابی با قطب‌نما یا کشیدن نقشه) بدون فرمول‌های ترسناک توضیح می‌دهید.`
          : `تکنیک فاینمن برای «${titleFa || titleEn}»: تصور کنید این مفهوم فنی را برای یک همکار بدون پیش‌زمینه یا دانش‌آموز با تمثیل ملموس (مانند قفسه‌های کتابخانه، خط مونتاژ یا تقاطع ریل‌ها) توضیح می‌دهید.`;

      const defaultQuestions =
        domain === "cognitive-learning"
          ? [
              "چرا صرفاً روخوانی کردن باعث توهم یادگیری می‌شود اما یادآوری فعال مسیر عصبی می‌سازد؟",
              "نقش خواب عمیق در تثبیت اطلاعات از حافظه کوتاه‌مدت به بلندمدت چیست؟",
              "چگونه می‌توان این مفهوم را با تمثیل یک تخته‌سیاه و لوح سنگی توضیح داد؟",
            ]
          : domain === "math-foundations"
          ? [
              "این مفهوم در فضای هندسی چه معنای ملموسی دارد؟",
              "اگر این ابزار ریاضی نبود، برای حل روابط چه بن‌بستی پیش می‌آمد؟",
              "تفاوت این کمیت با یک عدد معمولی در چیست؟",
            ]
          : [
              "اگر این مکانیزم در سیستم وجود نداشت، چه فاجعه یا خطایی رخ می‌داد؟",
              "جریان داده از ورودی تا خروجی نهایی چگونه طی می‌شود؟",
              "در بدترین حالت بار کاری (Worst Case) چه رفتاری از خود نشان می‌دهد؟",
            ];

      return res.json({
        analogy: defaultAnalogy,
        keyQuestions: defaultQuestions,
      });
    }

    const domainHint =
      domain === "cognitive-learning"
        ? "Domain: Cognitive Science & Neuroscience of Memory (Brain, synapses, sleep consolidation, recall). Focus on human biology and mental models."
        : domain === "math-foundations"
        ? "Domain: Mathematics & Linear Algebra (Vectors, matrices, geometric intuition)."
        : domain === "digital-logic" || domain === "hardware-architecture"
        ? "Domain: Computer Hardware Architecture (Caches, ALU, registers, latency)."
        : "Domain: Systems & Computer Science (Low-level execution, throughput, memory).";

    const prompt = `You are Richard Feynman teaching this specific discipline.
Topic: "${titleEn}" (${titleFa || ""}) in "${phaseTitle} > ${moduleTitle}".
${domainHint}

Provide:
1. A vivid, intuitive real-world analogy (تمثیل ساده و بسیار ملموس از دنیای فیزیکی بدون واژگان پیچیده).
2. Three diagnostic questions (۳ پرسش کلیدی بدون اصطلاح گیج‌کننده) that the student must answer to prove they truly grasp the first principles.
Return in JSON format:
{
  "analogy": "string in Persian explaining the analogy clearly",
  "keyQuestions": ["question 1", "question 2", "question 3"]
}`;

    const { text } = await callGeminiSafe({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.warn("Feynman guide fallback active:", error?.message || error);
    res.json({
      analogy: `مفهوم «${req.body?.titleFa || req.body?.titleEn}» را به زبان ساده بیان کنید.`,
      keyQuestions: [
        "ایده اصلی چیست؟",
        "چه مشکلی را حل می‌کند؟",
        "مثالی از دنیای واقعی برای آن بیاورید.",
      ],
    });
  }
});

// 2.1 AI Feynman Evaluation: Analyze student's intuitive explanation for clarity, jargon, and blind spots
app.post("/api/evaluate-feynman", async (req, res) => {
  try {
    const { titleEn, titleFa, phaseTitle, moduleTitle, feynmanText } = req.body;
    const text = (feynmanText || "").trim();

    if (!text || text.length < 15) {
      return res.status(400).json({
        error: "توضیح فاینمن باید حداقل ۱۵ کاراکتر باشد.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      // High-yield heuristics for offline evaluation
      const words = text.split(/\s+/).filter(Boolean).length;
      const hasAnalogy = /مثل|مانند|شبیه|تصور کن|انگار|قفسه|رستوران|کارخانه|پست|جعبه/i.test(text);
      const score = Math.min(95, Math.max(65, (words > 20 ? 80 : 70) + (hasAnalogy ? 15 : 0)));

      return res.json({
        score,
        ratingText: score >= 85 ? "بسیار روان و مفهومی" : "خوب، با ظرفیت ساده‌سازی بیشتر",
        jargonDetected: [],
        strengths: hasAnalogy
          ? "استفاده عالی از تمثیل و نگارش شهودی بدون غرق شدن در واژگان پیچیده."
          : "توضیح کلی درست است و روند مفهوم را شفاف می‌کند.",
        improvementTip: hasAnalogy
          ? "برای تعمیق بیشتر، یک حالت استثنا یا شکست (Failure Mode) را هم با همین تمثیل بیان کنید."
          : "سعی کنید از یک مثال ملموس روزمره (مثل انبارداری، ترافیک یا آشپزخانه) برای رفع هرگونه ابهام استفاده نمایید.",
      });
    }

    const prompt = `You are Richard Feynman evaluating an engineering student's intuitive explanation of a systems concept.
Topic: "${titleEn}" (${titleFa || ""})
Curriculum: "${phaseTitle} > ${moduleTitle}"
Student's Feynman Explanation:
"${text}"

Evaluation Rules:
1. Score from 0 to 100 based on clarity, intuitive grasp, and avoidance of empty buzzwords/jargon.
2. Flag any hollow jargon or unnecessary buzzwords in 'jargonDetected'.
3. Provide encouraging, concise Persian feedback in 'strengths'.
4. Provide a concrete, actionable Persian recommendation to make the explanation even simpler or fix subtle misconceptions in 'improvementTip'.

Return JSON:
{
  "score": number between 0 and 100,
  "ratingText": "عالی و شفاف" | "خوب و قابل فهم" | "نیازمند ساده‌سازی بیشتر",
  "jargonDetected": ["jargon1", "jargon2"],
  "strengths": "Persian feedback on strong points",
  "improvementTip": "Persian constructive advice"
}`;

    const { text: evalResult } = await callGeminiSafe({
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const parsed = JSON.parse(evalResult || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.warn("Feynman evaluation fallback active:", error?.message || error);
    res.json({
      score: 80,
      ratingText: "ثبت و تایید شد",
      jargonDetected: [],
      strengths: "تبیین شما برای ساخت مدل ذهنی ذخیره گردید.",
      improvementTip: "توصیه می‌شود هنگام مرور، این تمثیل را با کدهای واقعی تطبیق دهید.",
    });
  }
});

// 2.2 Generate SM-2 Spaced Repetition Flashcards from Lesson
app.post("/api/generate-flashcards", async (req, res) => {
  try {
    const { titleEn, titleFa, phaseTitle, moduleTitle } = req.body;
    const domain = detectTopicDomain(titleEn, titleFa, moduleTitle, phaseTitle);

    const fallbackCards =
      domain === "cognitive-learning"
        ? [
            {
              front: `تفاوت حافظه کاری (Working Memory) و حافظه بلندمدت در مغز چیست و انتقال چگونه رخ می‌دهد؟`,
              back: `حافظه کاری ظرفیت بسیار محدودی دارد (حدود ۴ آیتم)؛ تثبیت در حافظه بلندمدت از طریق فرآیند «تقویت درازمدت سیناپسی (LTP)» و خواب عمیق با امواج آهسته رخ می‌دهد.`,
              hint: "به هیپوکامپوس و نئوکورتکس فکر کنید.",
              concept: "Memory Consolidation",
            },
            {
              front: `چرا روخوانی مکرر (Passive Rereading) توهم یادگیری ایجاد می‌کند اما یادآوری فعال (Active Recall) مسیر عصبی می‌سازد؟`,
              back: `روخوانی صرفاً حس آشنایی کاذب به مغز می‌دهد بدون آنکه سیناپس‌ها را برای بازیابی به چالش بکشد؛ یادآوری فعال با وادار کردن مغز به بازسازی مفهوم، مدار عصبی را ضخیم و پایدار می‌کند.`,
              hint: "تفاوت شناخت سطحی و بازسازی فعال.",
              concept: "Illusion of Competence",
            },
            {
              front: `منحنی فراموشی ابینگهاوس چه هشداری به ما می‌دهد و چگونه با تکرار فاصله‌دار (Spaced Repetition) مهار می‌شود؟`,
              back: `بیش از ۷۰ درصد اطلاعات ظرف ۲۴ تا ۴۸ ساعت نخست فراموش می‌شوند؛ تکرار در فواصل تصاعدی (۱، ۳، ۷ و ۲۱ روز) شیب منحنی را مسطح و ماندگاری را دائمی می‌کند.`,
              hint: "فواصل زمانی هوشمند برای مهار شیب فراموشی.",
              concept: "Spaced Spacing Curve",
            },
          ]
        : domain === "math-foundations"
        ? [
            {
              front: `مفهوم شهودی و هندسی یک بردار و ضرب داخلی (Dot Product) چیست؟`,
              back: `بردار نشان‌دهنده جهت و شدت در یک فضا است؛ ضرب داخلی نشان می‌دهد دو بردار چقدر در یک راستا هم‌پوشانی دارند (شباهت کسینوسی).`,
              hint: "زاویه و هم‌پوشانی در فضا.",
              concept: "Geometric Intuition",
            },
            {
              front: `ماتریس به عنوان یک تبدیل خطی چه تغییری روی فضای ورودی ایجاد می‌کند؟`,
              back: `ماتریس فضای برداری را می‌چرخاند، کش می‌آورد یا فشرده می‌کند بدون آنکه خطوط راست خمیده شوند یا مبدا جابجا شود.`,
              hint: "دگرگونی هندسی بردارها.",
              concept: "Linear Transformation",
            },
            {
              front: `چرا در محاسبات هوش مصنوعی از ضرب ماتریسی بهینه‌شده (GEMM) استفاده می‌شود؟`,
              back: `ضرب ماتریسی سنگین‌ترین بار محاسباتی است و با سازماندهی داده‌ها در قالب بلوک‌های متناسب با رجیسترها سرعت ده‌ها برابر می‌شود.`,
              hint: "بهره‌وری حداکثری از توان سخت‌افزار.",
              concept: "Computational Scalability",
            },
          ]
        : [
            {
              front: `مکانیزم هسته‌ای «${titleFa || titleEn}» چه مشکلی را در لایه‌های پایین سیستم برطرف می‌کند؟`,
              back: `این مکانیزم با بهینه‌سازی دسترسی به حافظه و جلوگیری از رقابت منابع (Race Conditions)، عملکرد سیستم را پایدار می‌سازد.`,
              hint: "به زمان دسترسی و سربار پردازنده توجه کنید.",
              concept: "Architectural Goal",
            },
            {
              front: `پیچیدگی زمانی و مکانی این عملیات در بدترین سناریو (Worst Case) چیست؟`,
              back: `وابسته به نحوه توزیع بار و ظرفیت کش‌لاین، اغلب در کران O(1) استهلاک‌شده یا O(log N) مهار می‌شود.`,
              hint: "Worst-case vs Average-case",
              concept: "Asymptotic Bound",
            },
            {
              front: `بزرگ‌ترین اشتباه مهندسی در پیاده‌سازی پروداکشن این مفهوم چیست؟`,
              back: `نادیده گرفتن تراز کش‌لاین (Cache Alignment) و عدم استفاده از موانع حافظه در محیط‌های چند هسته‌ای.`,
              hint: "به کش سخت‌افزار و همزمانی فکر کنید.",
              concept: "Critical Pitfall",
            },
          ];

    if (!process.env.GEMINI_API_KEY) {
      return res.json({ cards: fallbackCards });
    }

    const domainFocus =
      domain === "cognitive-learning"
        ? "Domain: Neuroscience & Learning Mastery. Focus on memory retention, active recall, and sleep consolidation."
        : domain === "math-foundations"
        ? "Domain: Mathematical and geometric intuition, algebraic properties, and computing efficiency."
        : "Domain: Systems engineering, hardware performance, and industrial failure modes.";

    const prompt = `You are a master cognitive systems engineer designing active recall SM-2 flashcards.
Topic: "${titleEn}" (${titleFa || ""})
Module: "${phaseTitle} > ${moduleTitle}"
${domainFocus}

Generate 3 high-yield active-recall flashcards testing deep mental models, scientific bounds/mechanisms, and real-world traps.
Questions and answers MUST be in fluent, clear Persian, with any English terms wrapped in parentheses or code ticks.

Return JSON:
{
  "cards": [
    {
      "front": "Question in Persian testing conceptual grasp",
      "back": "Clear, precise explanation in Persian",
      "hint": "Brief cognitive hint",
      "concept": "Concept Tag in English"
    }
  ]
}`;

    const { text } = await callGeminiSafe({
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const parsed = JSON.parse(text || "{}");
    res.json(parsed.cards ? parsed : { cards: fallbackCards });
  } catch (error: any) {
    console.warn("Flashcards fallback active:", error?.message || error);
    res.json({
      cards: [
        {
          front: `مفهوم کلیدی «${req.body?.titleFa || req.body?.titleEn}» چه نقشی در معماری پایدار سیستم دارد؟`,
          back: `تضمین بهینگی تخصیص منابع و پایداری در بار پردازشی سنگین.`,
          hint: "بهینه‌سازی منابع و توازن کارایی",
          concept: "Systems Core",
        },
      ],
    });
  }
});

// 3. Review Engine: Active Recall Challenge & SM-2 Grading
app.post("/api/review", async (req, res) => {
  try {
    const { action, lessonTitle, lessonFa, phase, module, userNote, feynmanNote, question, userAnswer } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      if (action === "question") {
        return res.json({
          question: `توضیح دهید در سیستم‌های واقعی، مفهوم «${lessonFa || lessonTitle}» (${lessonTitle}) در هنگام مواجهه با کمبود منابع یا همزمانی چگونه رفتار می‌کند و راهکار مقابله با آن چیست؟`,
        });
      }
      if (action === "grade") {
        const length = (userAnswer || "").trim().length;
        const score = length > 80 ? 4 : length > 30 ? 3 : 2;
        return res.json({
          score,
          feedback: "پاسخ شما ثبت شد. در اتصال به سرویس هوش مصنوعی، ارزیابی خودکار بر اساس طول و انسجام پاسخ انجام گرفت.",
          modelAnswer: `پاسخ کامل مستلزم تبیین مبانی معماری ${lessonTitle} و چرخه مدیریت آن در سیستم است.`,
        });
      }
      if (action === "quiz") {
        return res.json({
          questions: [
            {
              q: `هدف اصلی از پیاده‌سازی ${lessonTitle} چیست؟`,
              options: [
                "بهینه‌سازی مصرف حافظه و مدیریت منابع",
                "افزایش پیچیدگی کامپایلر",
                "صرفاً کاهش خطوط کد",
                "غیرفعال‌سازی بررسی‌های زمان اجرا",
              ],
              correct: 0,
              explanation: "هدف اصلی در سیستم‌ها، تخصیص بهینه منابع و حداقل‌سازی سربار است.",
            },
          ],
        });
      }
    }

    if (action === "question") {
      const prompt = `You are an expert Computer Science examiner testing a student using the Active Recall technique.
Topic: "${lessonTitle}" (Persian: "${lessonFa || ""}")
Phase: "${phase}"
Module: "${module}"
Student's Notes: "${userNote || "None"}"
Student's Feynman Explanation: "${feynmanNote || "None"}"

Formulate ONE penetrating, conceptual, practical diagnostic question in Persian (with English technical terms in parentheses) that tests true deep comprehension of this topic.
DO NOT ask trivial definition questions. Ask a scenario, edge-case, trade-off, or architectural comparison question.
Return JSON:
{
  "question": "The question in Persian/English"
}`;

      const { text } = await callGeminiSafe({
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });

      const data = JSON.parse(text || "{}");
      return res.json({ question: data.question || `توضیح دهید ${lessonTitle} چگونه کار می‌کند؟` });
    }

    if (action === "grade") {
      const prompt = `You are an expert cognitive evaluator and computer science professor using the SuperMemo SM-2 grading standard.
Topic: "${lessonTitle}"
Question asked: "${question}"
Student's Answer: "${userAnswer}"
Student's Reference Notes: "${userNote || ""}"

Grade the student's answer on the SM-2 scale (0 to 5):
- 5: Perfect response, flawless understanding, mentions key trade-offs/mechanisms.
- 4: Correct response with minor omission.
- 3: Serious difficulty, but correct core intuition. (Pass mark)
- 2: Incorrect response; where the correct one seemed easy to recall. (Failure)
- 1: Incorrect response; the correct answer remembered after looking. (Failure)
- 0: Complete blackout / total misconception. (Failure)

Provide constructive, encouraging, high-yield feedback in Persian, highlighting exact misconceptions and giving the optimal technical model answer.
Return JSON:
{
  "score": integer between 0 and 5,
  "feedback": "constructive explanation and critique in Persian",
  "modelAnswer": "the ideal technical explanation",
  "keyMissingPoints": ["point 1", "point 2"]
}`;

      const { text } = await callGeminiSafe({
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });

      const data = JSON.parse(text || "{}");
      return res.json({
        score: typeof data.score === "number" ? Math.max(0, Math.min(5, Math.round(data.score))) : 3,
        feedback: data.feedback || "پاسخ دریافت شد.",
        modelAnswer: data.modelAnswer || "",
        keyMissingPoints: data.keyMissingPoints || [],
      });
    }

    if (action === "quiz") {
      const prompt = `Create a 3-question diagnostic conceptual multiple-choice quiz for the CS topic: "${lessonTitle}" (${lessonFa || ""}) in "${phase} > ${module}".
Format JSON:
{
  "questions": [
    {
      "q": "Question text in Persian with technical terms in English",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": index (0, 1, 2, or 3),
      "explanation": "Detailed explanation in Persian why this option is correct and others are flawed"
    }
  ]
}`;

      const { text } = await callGeminiSafe({
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });

      const data = JSON.parse(text || "{}");
      return res.json(data);
    }

    res.status(400).json({ error: "Unknown action" });
  } catch (error: any) {
    console.warn("Review API graceful fallback:", error?.message || error);
    if (req.body?.action === "question") {
      return res.json({
        question: `نقش محوری «${req.body?.lessonFa || req.body?.lessonTitle}» در عملکرد سیستم و نحوه اجتناب از تداخل منابع را شرح دهید.`,
      });
    }
    if (req.body?.action === "grade") {
      return res.json({
        score: 3,
        feedback: "پاسخ شما برای تثبیت در فواصل زمانی ثبت شد.",
        modelAnswer: `تسلط بر این مبحث نیازمند فهم همزمانی و بهینه‌سازی دسترسی است.`,
        keyMissingPoints: [],
      });
    }
    if (req.body?.action === "quiz") {
      return res.json({
        questions: [
          {
            q: `اصلی‌ترین هدف فنی از به‌کارگیری ${req.body?.lessonTitle || "این ساختار"} چیست؟`,
            options: [
              "بهینه‌سازی مصرف حافظه و مدیریت منابع سیستم",
              "صرفاً کاهش تعداد توابع کد",
              "حذف کامل بررسی‌های امنیتی کامپایلر",
              "افزایش تاخیر در اجرای پردازش‌ها",
            ],
            correct: 0,
            explanation: "طراحی سیستم‌های مقیاس‌پذیر بر پایه مدیریت بهینه منابع و حداقل‌سازی سربار است.",
          },
        ],
      });
    }
    res.status(500).json({ error: error?.message || "Review API failed" });
  }
});

// 4. Interactive AI Systems & Science Tutor (دستیار هوشمند تفهیم و رفع اشکال عمیق)
app.post("/api/ask-ai-tutor", async (req, res) => {
  try {
    const { lessonTitle, lessonFa, phaseTitle, moduleTitle, question, context } = req.body;
    const domain = detectTopicDomain(lessonTitle || "", lessonFa || "", moduleTitle || "", phaseTitle || "");

    if (!process.env.GEMINI_API_KEY) {
      const defaultAnswer =
        domain === "cognitive-learning"
          ? `در حالت آفلاین: مفهوم **${lessonFa || lessonTitle}** در حوزه علوم یادگیری و عصب‌شناسی شناختی نیازمند درک تقویت پیوند سیناپسی (LTP)، تفکیک حافظه کوتاه‌مدت/کاری از بلندمدت و نقش خواب عمیق است. برای سوال شما: «${question}»، کلید درک مسئله تکیه بر بازیابی فعال و مهار شیب منحنی فراموشی است.`
          : domain === "math-foundations"
          ? `در حالت آفلاین: مفهوم **${lessonFa || lessonTitle}** در ریاضیات محاسباتی نیازمند درک هندسی، فضای برداری و تبدیل‌های خطی است. برای سوال شما: «${question}»، درک معنای هندسی و بصری فرمول‌ها کلید اصلی تسلط است.`
          : `در حالت آفلاین: مفهوم **${lessonTitle}** در معماری ${phaseTitle || "سیستم"} نیازمند درک دقیق تخصیص منابع، رفتار همزمانی و بهینه‌سازی لایه زیرین است. برای سوال شما: «${question}»، توجه به تعامل سخت‌افزار با سیستم‌عامل و الگوریتم مربوطه کلید درک مسئله است.`;

      return res.json({ answer: defaultAnswer });
    }

    const domainExpertise =
      domain === "cognitive-learning"
        ? "You are a World-Leading Cognitive Scientist and Neurobiology Professor (in the style of Eric Kandel, Andrew Huberman, and Barbara Oakley)."
        : domain === "math-foundations"
        ? "You are a Distinguished Mathematics & Computational Geometry Professor (in the style of Grant Sanderson / 3Blue1Brown and Gilbert Strang)."
        : "You are a Principal Systems Architect and Distinguished Computer Science Professor (in the style of Richard Feynman, Dave Patterson, and Linus Torvalds).";

    const prompt = `${domainExpertise}
A dedicated student is studying:
- Topic: "${lessonTitle}" (${lessonFa || ""})
- Phase: "${phaseTitle || ""}"
- Module: "${moduleTitle || ""}"
- Optional Context: "${context || ""}"

The student asks this specific question:
"${question}"

Provide an exceptionally clear, authoritative, zero-jargon, and deeply insightful answer in fluent Persian (wrapping English technical terms in code ticks):
1. Immediate, crystal-clear intuitive answer (پاسخ سریع، ملموس و قابل درک).
2. Deepen into the first-principles mechanisms (بررسی عمیق مکانیزم و ریشه علمی).
3. If relevant, provide a concise ASCII diagram, formula, or clean code snippet.
4. Conclude with a practical takeaway or rule of thumb.`;

    const { text } = await callGeminiSafe({
      contents: prompt,
    });

    res.json({
      answer: text || "متأسفانه پاسخی دریافت نشد.",
    });
  } catch (error: any) {
    console.warn("Tutor fallback active:", error?.message || error);
    res.json({
      answer: `پاسخ به پرسش شما درباره «${req.body?.lessonFa || req.body?.lessonTitle || "مفهوم"}»: این مبحث بر پایه اصول بنیادین و حداقل‌سازی خطاهای شناختی یا سیستمی بنا شده است.`,
    });
  }
});

// Vite middleware in dev, static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Natal Learning Engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
