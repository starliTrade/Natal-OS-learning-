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

// Helper to generate a deeply structured, academic & industrial systems lecture offline fallback
function generateAcademicLectureFallback(titleEn: string, titleFa: string, phaseTitle: string, moduleTitle: string): string {
  const persianTitle = titleFa || titleEn;
  const isConcurrency = /thread|concurren|async|lock|mutex|atomic|race/i.test(titleEn + moduleTitle);
  const isMemory = /memory|pointer|alloc|cache|paging|heap|stack|virtual|align/i.test(titleEn + moduleTitle);
  const isNetwork = /socket|network|tcp|http|proto|grpc|distribut/i.test(titleEn + moduleTitle);

  const asciiDiagram = isConcurrency
    ? `\`\`\`text
[ Thread 1: Writer Core ]                    [ Cache-Coherent Memory Bus ]                   [ Thread 2: Reader Core ]
           │                                                │                                              │
           │  1. Atomic CAS (Compare-and-Swap)              │                                              │
           ├───────────────────────────────────────────────>│                                              │
           │                                                │  2. Invalidate Cache Line (MESI: Invalid)    │
           │                                                ├─────────────────────────────────────────────>│
           │  3. Memory Fence (Release Semantics)           │                                              │
           ├───────────────────────────────────────────────>│  4. Acquire Semantics & Safe Ingress         │
           │                                                ├─────────────────────────────────────────────>│
           ▼                                                ▼                                              ▼
[ State: Commit Verified ]                     [ Cache Line: Aligned 64B ]                     [ State: Read Guaranteed ]
\`\`\``
    : isMemory
    ? `\`\`\`text
Physical Cache Line (64 Bytes Hardware Window):
+--------------------+--------------------+--------------------+---------------------------------------+
|  Offset 0x00..0x07 |  Offset 0x08..0x0B |  Offset 0x0C..0x0F |           Offset 0x10..0x3F           |
|   uint64_t flags   |    uint32_t len    |     4B Padding     |         Aligned Payload Data          |
|      (8 Bytes)     |     (4 Bytes)      | (Memory Alignment) |              (48 Bytes)               |
+--------------------+--------------------+--------------------+---------------------------------------+
^                                                                                                      ^
└── 64-Byte Cache-Line Boundary (L1 Cache Hit: 1.0ns)                                Next Cache Line ──┘
\`\`\``
    : `\`\`\`text
+-----------------------+         Deterministic FIFO Queue         +-------------------------+
| Ingress Event Stream  | ───────────────────────────────────────> | Batching & Dispatcher   |
+-----------------------+                                          +-------------------------+
                                                                                │
                                                                   Zero-Copy Execution Path
                                                                                ▼
+-----------------------+         Sub-Millisecond P99 Invariant    +-------------------------+
| Hardware Egress Sink  | <─────────────────────────────────────── | Optimized Worker Engine |
+-----------------------+                                          +-------------------------+
\`\`\``;

  return `# ${persianTitle} (${titleEn})
> **مسیر یادگیری:** از نقطه صفر مطلق تا تسلط در معماری صنعتی | **بخش:** ${phaseTitle || "مهندسی سیستم‌ها"} • **ماژول:** ${moduleTitle || "معماری پایه"}

---

## 🧩 بخش ۱: بحران بنیادین و چرایی تولد این مفهوم (The Core Problem & Motivation)
برای درک واقعی یک مفهوم، باید بدانیم **قبل از اختراع آن، جهان چگونه کار می‌کرد و چه فاجعه‌ای رخ می‌داد:**
* **دنیای بدون «${titleEn}»:** در روزهای اولیه، سیستم‌ها داده‌ها را بدون سازوکار اختصاصی و به‌صورت خام پردازش می‌کردند. این امر در مقیاس‌های کوچک پاسخگو بود، اما به محض افزایش بار کاری، سیستم با تصادم حافظه (Memory Corruption)، بن‌بست پردازنده‌ها (Deadlock) و سقوط توان عملیاتی (Throughput Collapse) مواجه می‌شد.
* **واژه‌نامه مفاهیم پایه برای مبتدیان:**
  * **Memory Alignment (تراز حافظه):** چیدمان داده‌ها روی آدرس‌هایی که مضربی از اندازه کلمه پردازنده (مثلاً ۶۴ بیت) هستند تا CPU در یک سیکل کلاک به آن دسترسی یابد.
  * **Latency vs. Throughput (تاخیر در برابر توان):** تاخیر یعنی زمان صرف‌شده برای انجام یک کار؛ توان یعنی تعداد کل کارهای انجام‌شده در واحد ثانیه.
  * **System Invariant (ناوردای سیستم):** شرط و حقیقتی که در تمام طول اجرای برنامه (حتی در شدیدترین کرش‌ها یا خطاهای شبکه) باید ۱۰۰٪ برقرار و معتبر باقی بماند.

---

## 🎯 بخش ۲: شهود فیزیکی در دنیای واقعی (Everyday Tangible Analogy)
تصور کنید فردی بدون هیچ دانش کامپیوتری می‌خواهد این مفهوم را لمس کند:
${
  isConcurrency
    ? "* **تمثیل تقاطع ریلی با اهرم مکانیکی:** تصور کنید یک تقاطع قطار پرسرعت چندطرفه دارید. اگر سوزن‌بان‌ها بر اساس حدس و گمان حرکت کنند، تصادف فاجعه‌بار رخ می‌دهد. مهندسان به جای اعتماد به چشم انسان، یک اهرم فیزیکی اتمیک متصل در ریل کار گذاشته‌اند که در هر لحظه تنها اجازه می‌دهد یک قطار چراغ سبز دریافت کند و سوزن مسیرهای دیگر به طور خودکار قفل فیزیکی می‌شود."
    : isMemory
    ? "* **تمثیل انباردار فوق‌سریع و کارتن‌های ۶۴ سانتی‌متری:** تصور کنید انبارداری در کارخانه‌ای بزرگ دارید که کارتن‌ها را در قفسه‌های دقیقاً ۶۴ سانتی‌متری جا می‌دهد. اگر بسته‌ای ۶۵ سانتی‌متری را تحویل دهید، انباردار مجبور است دو قفسه جداگانه را باز کند و برای برداشتن آن دو بار پیاده‌روی کند (۲ سیکل رفت‌وبرگشت به جای ۱ سیکل)."
    : "* **تمثیل خط مونتاژ کارخانه خودرو با تحویل بموقع (JIT):** تصور کنید کارگران یک خط مونتاژ به جای اینکه ابزارها را تصادفی در کارگاه جستجو کنند، تمام قطعات مورد نیاز هر دقیقه روی نوار نقاله در دسترس مستقیم دست چپ و راستشان قرار می‌گیرد تا کوچک‌ترین مکث و اتلاف انرژی در خط رخ ندهد."
}

---

## ⚠️ بخش ۳: ایده ساده‌لوحانه (Naive Solution) و علت شکست آن در مقیاس
* **راه‌حل اولیه که هر مبتدی به ذهنش می‌رسد:** ذخیره یا پردازش مستقیم متغیرها بدون هیچ‌گونه بافر، قفل‌گذاری هوشمند یا تراز سخت‌افزاری.
* **علت انفجار در پروداکشن:** این روش وقتی تعداد درخواست‌ها از ۱۰ به ۱۰,۰۰۰ در ثانیه می‌رسد، به دلیل وقوع Cache Missهای پیاپی و ناهماهنگی هسته‌های CPU، زمان پاسخ‌دهی را از ۱ میلی‌ثانیه به چند ثانیه می‌رساند و سرور را اصطلاحاً به حالت اشباع (Thrashing) می‌برد.

---

## ⚙️ بخش ۴: کالبدشکافی مکانیسم سخت‌افزار و دیاگرام جریان داده (Under the Hood)
داده‌ها در زیر کاپوت پردازنده و حافظه چگونه گام‌به‌گام حرکت می‌کنند؟

${asciiDiagram}

### شرح گام‌به‌گام تحول وضعیت‌ها:
1. **گام ۱ (Ingress & Validation):** داده ورودی از بافر سخت‌افزاری وارد شده و شرط ناوردا اعتبارسنجی می‌شود.
2. **گام ۲ (Atomic Transition):** ترنزیشن وضعیت بدون توقف خط‌لوله (Pipeline Stall) و با دستورات اتمیک تک‌سیکلی انجام می‌پذیرد.
3. **گام ۳ (Memory Fence):** پردازنده با دستور سد حافظه اطمینان حاصل می‌کند که هیچ بازچینی دستوراتی (Out-of-Order Execution) نظم داده را مختل نکند.
4. **گام ۴ (Egress & Ack):** وضعیت تثبیت‌شده به ماژول بعدی تحویل داده می‌شود.

---

## 📐 بخش ۵: تحلیل ریاضیاتی صوری و جدول کران‌ها (Formal Bounds & Latency Matrix)
تحلیل دقیق بر اساس نظریه محاسبات و سخت‌افزار مدرن x86_64 / ARM:

| شاخص ارزیابی | کران مجانبی (Big-O) | پیامد فیزیکی در سخت‌افزار واقعی | زمان دسترسی تقریبی |
| :--- | :--- | :--- | :--- |
| **بهترین حالت (Best Case)** | $\\mathcal{O}(1)$ | واکشی مستقیم از ثبات‌های CPU یا کش L1 | **~ ۰.۵ تا ۱.۰ نانوثانیه** |
| **میانگین (Average Case)** | $\\mathcal{O}(1)$ تا $\\mathcal{O}(\\log n)$ | هماهنگ با پیش‌بینی انشعابات پردازنده (Branch Predictor) | **~ ۲.۰ تا ۵.۰ نانوثانیه** |
| **بدترین حالت (Worst Case)** | $\\mathcal{O}(n)$ یا خطای ایزوله | رخ دادن خطای Cache Miss و مراجعه به حافظه اصلی DRAM | **~ ۵۰ تا ۱۰۰ نانوثانیه** |
| **سربار فضایی (Space Complexity)** | $\\mathcal{O}(1)$ حافظه کمکی | بسته‌بندی داده‌ها منطبق بر مرزهای ۶۴ بایتی | بدون اتلاف حافظه |
| **ناوردای یکپارچگی (Core Invariant)** | $\\forall t, \\text{State}(t) \\in \\mathcal{S}_{valid}$ | پیشگیری مطلق از خوانش‌های بریده یا مخدوش (Torn Reads) | تضمین سخت‌افزاری |

---

## 💻 بخش ۶: کد استاندارد پروداکشن با کامنت‌های خط‌به‌خط (Industrial C Reference)
این پیاده‌سازی مرجع صنعتی، ساختار بهینه و کاملاً تراز شده با معماری سخت‌افزار مدرن را نشان می‌دهد:

\`\`\`c
/**
 * Industrial Production Reference Implementation
 * Module: ${titleEn} (${persianTitle})
 * Attributes: Cache-Aligned (64B), Thread-Safe, Zero Allocation in Hot Path
 */

#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <stdint.h>

// تعریف ساختار تراز شده با کش‌لاین ۶۴ بایتی جهت پیشگیری از False Sharing
typedef struct {
    uint64_t state_flags;      // فلگ‌های وضعیت و کنترل اتمیک
    uint32_t active_counter;   // شمارنده تراکنش‌های در حال پردازش
    uint32_t capacity_mask;    // ماسک بیتی برای جایگزینی عملگر کند تقسیم (Modulo)
    void* ring_buffer;         // اشاره‌گر مستقیم به بافر تراز شده
} __attribute__((aligned(64))) ProductionSystemEngine;

// مقداردهی اولیه با اعتبارسنجی مرزهای حافظه
bool engine_init(ProductionSystemEngine* engine, size_t capacity_power_of_two) {
    if (!engine || capacity_power_of_two == 0) return false;

    // توان ۲ بودن ظرفیت امکان استفاده از AND بیتی را به جای Modulo فراهم می‌سازد
    engine->capacity_mask = (uint32_t)(capacity_power_of_two - 1);
    engine->active_counter = 0;
    engine->state_flags = 0x0001; // وضعیت Ready

    // تخصیص حافظه تراز با مرز ۶۴ بایتی
    int ret = posix_memalign(&engine->ring_buffer, 64, capacity_power_of_two * sizeof(uint64_t));
    return (ret == 0);
}

// تابع هسته پردازش با حداقل تاخیر و پیش‌بینی انشعاب برای پردازنده
int engine_process_request(ProductionSystemEngine* engine, uint64_t req_id) {
    // خروج سریع در شرایط غیرمجاز با دستور پیش‌بینی انشعاب کامپایلر
    if (__builtin_expect(!(engine->state_flags & 0x0001), 0)) {
        return -1; // خطا بدون برهم زدن خط‌لوله CPU
    }

    // محاسبه اسلات با یک عملگر بیتی تک‌سیکلی
    uint32_t slot = (uint32_t)(req_id & engine->capacity_mask);
    
    // افزایش اتمیک شمارنده با هماهنگی کامل کش
    __sync_fetch_and_add(&engine->active_counter, 1);

    return (int)slot;
}
\`\`\`

---

## ⚠️ بخش ۷: ۳ تله مرگبار در دنیای واقعی و کالبدشکافی حوادث پروداکشن (Post-Mortems)
1. **تله اشتراک دروغین (False Sharing):**
   * *علت:* قرار گرفتن دو متغیر مستقل متعلق به دو هسته مختلف درون یک کش‌لاین ۶۴ بایتی مشترک.
   * *پیامد:* باطل شدن مداوم کش (Cache Invalidation) توسط پروتکل MESI و افت تا ۹۰ درصدی راندمان.
   * *راهکار:* استفاده صریح از \`__attribute__((aligned(64)))\` یا پدینگ برای جداسازی متغیرهای هر هسته.
2. **تله نادیده گرفتن موانع حافظه (Memory Barrier Violations):**
   * *علت:* کامپایلر و پردازنده‌های مدرن برای بهینه‌سازی، ترتیب اجرای دستورات را جابه‌جا می‌کنند (Out-of-Order).
   * *پیامد:* هسته دوم داده تغییریافته را قبل از پرچم آماده‌سازی می‌خواند و دیتای مخدوش تحویل می‌گیرد.
   * *راهکار:* استفاده از سدهای حافظه صریح (\`std::atomic_thread_fence\`) با سمانتیک Acquire/Release.
3. **تله نشت منابع در شاخه‌های استثنایی (Resource Leaks on Early Exit):**
   * *علت:* بازگشت زودرس از تابع بدون آزادسازی بافرها یا قفل‌ها در شرایط بروز خطا.
   * *راهکار:* بهره‌گیری از الگوی RAII در C++ / Rust یا بلوک تمیزسازی یکپارچه در C.

---

## 🧠 بخش ۸: سنتز فاینمن و لنگرهای بازیابی فعال SM-2 (Feynman & Recall Anchors)
* **خلاصه ۳ خطی فاینمن:**
  مفهوم «${persianTitle}» هنر مرتب‌سازی و تراز کردن دقیق جریان داده‌ها است تا پردازنده و حافظه بدون هیچ تصادف، معطلی یا درجا زدن، بیشترین حجم کار را در کمترین نانوثانیه ممکن انجام دهند.
* **لنگرهای بازیابی فعال (Active Recall Questions):**
  1. چرا عدم تراز داده‌ها با خطوط کش ۶۴ بایتی باعث افزایش زمان دسترسی از ۱ نانوثانیه به بیش از ۵۰ نانوثانیه می‌شود؟
  2. چطور می‌توان از افت سرعت ناشی از False Sharing در سیستم‌های چندهسته‌ای جلوگیری کرد؟
  3. تفاوت اصلی رفتار پردازنده در بهترین حالت (L1 Hit) با بدترین حالت (DRAM Stall) در این ماژول چیست؟`;
}

// 1. Generate comprehensive lesson syllabus / lecture notes (جزوه تحلیلی و استاندارد صنعتی)
app.post("/api/generate-lesson-material", async (req, res) => {
  try {
    const { titleEn, titleFa, phaseTitle, moduleTitle, focusPoints } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        content: generateAcademicLectureFallback(titleEn, titleFa, phaseTitle, moduleTitle),
        source: "fallback",
      });
    }

    const systemPrompt = `You are a World-Renowned Principal Systems Architect and Distinguished University Professor in Computer Science (like a hybrid of Leslie Lamport, Martin Kleppmann, and a top Systems Engineering Lead).

Your mission is to produce the ABSOLUTE PINNACLE, DEFINITIVE, ZERO-FLUFF, ULTRA-PEDAGOGICAL 8-SECTION ENGINEERING LECTURE NOTE (جزوه جامع و تحلیلی استاندارد جهانی سیستم‌ها) crafted specifically so that a student starting from ABSOLUTE ZERO can step-by-step reach TOP-TIER ARCHITECTURAL & INDUSTRIAL MASTERY.

MANDATORY 8-SECTION ZERO-TO-MASTERY COGNITIVE ARCHITECTURE:
You MUST format the output using these EXACT Markdown H2 headings and sections in clear, expressive Persian and precise English technical terms:

# [عنوان فارسی درس] ([English Lesson Title])
> **مسیر یادگیری:** از نقطه صفر مطلق تا تسلط در معماری صنعتی | **بخش:** [Phase Title] • **ماژول:** [Module Title]

---

## 🧩 بخش ۱: بحران بنیادین و چرایی تولد این مفهوم (The Core Problem & Motivation)
- **دنیای بدون این مفهوم:** Explain vividly how early computer systems handled this without this abstraction, and what exact catastrophe (data corruption, throughput collapse, latency spikes, deadlock, hardware thrashing) forced engineers to invent this concept.
- **واژه‌نامه مفاهیم پایه برای مبتدیان:** Define 3-4 prerequisite technical terms used in this lesson (like Memory Alignment, Latency, Invariant, Concurrency, Cache Line) in 1 crystal-clear sentence each so a complete beginner never gets stuck.

---

## 🎯 بخش ۲: شهود فیزیکی در دنیای واقعی (Everyday Tangible Analogy)
- **تمثیل مکانیکی ملموس:** A vivid, everyday physical metaphor (warehouse forklift, train rail interlock, factory assembly line, postal sorting) that anyone with ZERO CS background can visualize immediately. Explicitly map real-world parts to hardware components (e.g. Warehouse = RAM, Work Desk = L1 Cache, Worker Hands = CPU Registers).

---

## ⚠️ بخش ۳: ایده ساده‌لوحانه (Naive Solution) و علت شکست آن در مقیاس
- **راه‌حل اولیه و دم‌دستی:** What is the naive solution a junior programmer would try first?
- **علت انفجار در پروداکشن:** Why does this naive approach catastrophic fail under high load (10k req/s), concurrency, or scale? (Latency explosion, memory bloat, cache invalidation storms).

---

## ⚙️ بخش ۴: کالبدشکافی مکانیسم سخت‌افزار و دیاگرام جریان داده (Under the Hood)
- **دیاگرام ساختاری ASCII:** Provide a clear, wide, monospaced ASCII diagram illustrating data movement across registers, cache lines (64-byte), and memory buffers.
- **شرح گام‌به‌گام تحول وضعیت‌ها:** 4 numbered concrete steps explaining pointer transitions, barrier guarantees, and cache coherency (MESI).

---

## 📐 بخش ۵: تحلیل ریاضیاتی صوری و جدول کران‌ها (Formal Bounds & Latency Matrix)
- **جدول ماتریس پیچیدگی و تاخیر فیزیکی:**
  A complete Markdown table comparing:
  | شاخص ارزیابی | کران مجانبی (Big-O) | پیامد فیزیکی در سخت‌افزار واقعی | زمان دسترسی تقریبی |
  Cover Best Case (L1 Hit: ~1ns), Average Case (Branch Predicted: ~3ns), Worst Case (DRAM Stall: ~60ns), Space Complexity, and Core System Invariant.

---

## 💻 بخش ۶: کد استاندارد پروداکشن با کامنت‌های خط‌به‌خط (Industrial Reference Code)
- Complete, non-truncated production reference code (in C, Rust, or Go) demonstrating cache alignment (__attribute__((aligned(64))) or posix_memalign), error handling, atomic synchronization, and extensive Persian comments explaining every critical line.

---

## ⚠️ بخش ۷: ۳ تله مرگبار در دنیای واقعی و کالبدشکافی حوادث پروداکشن (Post-Mortems)
- Top 3 fatal production failure modes (e.g. False Sharing, Memory Leak, Priority Inversion, Missing Memory Fence, Torn Read) with root-cause analysis and exact production fix.

---

## 🧠 بخش ۸: سنتز فاینمن و لنگرهای بازیابی فعال SM-2 (Feynman & Recall Anchors)
- **خلاصه ۳ خطی فاینمن:** 3-sentence summary in plain everyday language understandable by a teenager.
- **لنگرهای بازیابی فعال:** 3 high-yield active recall questions designed for the spaced repetition deck.

STRICT FORMATTING MANDATES:
- ZERO conversational chatter or introductory remarks ("Welcome to today's lecture..."). Start directly with the # H1 title.
- High typographic contrast, structured bullet points, elegant bold highlights, and clean code blocks.`;

    const userPrompt = `Generate the definitive, zero-to-production 8-section masterclass lecture note for:
Topic: "${titleEn}" (Persian: "${titleFa || titleEn}")
Phase: "${phaseTitle || "Computer Science Systems"}"
Module: "${moduleTitle || "Low-Level Architecture"}"
Specific Focus: "${focusPoints || "From zero intuition to mathematical rigor and production C/Rust systems architecture"}"

Deliver the complete, comprehensive master lecture strictly adhering to the 8-section cognitive structure.`;

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

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        analogy: `تکنیک فاینمن برای «${titleFa || titleEn}»: تصور کنید این مفهوم را برای یک دانش‌آموز ۱۲ ساله یا همکاری بدون پیش‌زمینه فنی توضیح می‌دهید. از تمثیل‌های دنیای واقعی (مانند کتابخانه، پستچی، یا صف رستوران) استفاده کنید.`,
        keyQuestions: [
          `اگر این مکانیزم وجود نداشت، چه فاجعه‌ای در سیستم رخ می‌داد؟`,
          `ورودی، پردازش و خروجی اصلی این بخش چیست؟`,
          `در بدترین حالت (Worst Case) چه رفتاری از خود نشان می‌دهد؟`,
        ],
      });
    }

    const prompt = `You are Richard Feynman teaching Computer Science.
For the topic "${titleEn}" (${titleFa || ""}) in "${phaseTitle} > ${moduleTitle}":
Provide:
1. A vivid, intuitive real-world analogy (تمثیل ساده و قدرتمند) that cuts through jargon without losing precision.
2. Three diagnostic questions (۳ پرسش کلیدی) that the student must answer to prove they truly grasp the concept, not just the vocabulary.
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

    const fallbackCards = [
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

    const prompt = `You are a cognitive systems engineer designing active recall SM-2 flashcards.
Topic: "${titleEn}" (${titleFa || ""})
Module: "${phaseTitle} > ${moduleTitle}"

Generate 3 high-yield active-recall flashcards testing mental models, performance bounds, and production pitfalls.
Questions must be in Persian with technical terms in English.

Return JSON:
{
  "cards": [
    {
      "front": "Front prompt question",
      "back": "Clear, precise answer in Persian with technical depth",
      "hint": "Short memory trigger hint",
      "concept": "Core Concept Tag"
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

// 4. Interactive AI Systems Tutor (دستیار هوشمند تفهیم معماری و رفع اشکال عمیق)
app.post("/api/ask-ai-tutor", async (req, res) => {
  try {
    const { lessonTitle, lessonFa, phaseTitle, moduleTitle, question, context } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        answer: `در حالت آفلاین: مفهوم **${lessonTitle}** در معماری ${phaseTitle || "سیستم"} نیازمند درک دقیق تخصیص منابع، رفتار همزمانی و بهینه‌سازی لایه زیرین است. برای سوال شما: «${question}»، توجه به تعامل سخت‌افزار با سیستم‌عامل و الگوریتم مربوطه کلید درک مسئله است.`,
      });
    }

    const prompt = `You are a Principal AI Systems & Infrastructure Architect and Distinguished Professor.
A dedicated engineering student is studying:
- Topic: "${lessonTitle}" (${lessonFa || ""})
- Phase: "${phaseTitle || ""}"
- Module: "${moduleTitle || ""}"
- Optional Context: "${context || ""}"

The student asks this specific question or asks for clarification:
"${question}"

Provide an exceptionally clear, authoritative, intuitive, and technically deep answer in Persian (keeping core systems terminology in English):
1. Give the immediate, crystal-clear intuitive answer (پاسخ سریع و شهودی).
2. Deepen into the architectural mechanics (بررسی لایه‌های پایین، حافظه یا رفتار سیستم در مقیاس بالا).
3. If relevant, provide a concise code snippet (C, Python, Rust, or Bash/K8s) or an ASCII architecture diagram to make it crystal clear.
4. Conclude with a practical rule of thumb for real-world engineering.`;

    const { text } = await callGeminiSafe({
      contents: prompt,
    });

    res.json({
      answer: text || "متأسفانه پاسخی دریافت نشد.",
    });
  } catch (error: any) {
    console.warn("Tutor fallback active:", error?.message || error);
    res.json({
      answer: `پاسخ تحلیلی به پرسش شما درباره «${req.body?.lessonTitle || "مفهوم"}»: در سامانه‌های مهندسی با کارایی بالا، مولفه ${req.body?.lessonTitle} وظیفه توازن میان توان عملیاتی (Throughput) و حداقل‌سازی تاخیر (Latency) را عهده‌دار است. برای مدیریت بهینه، همواره رفتار آن را در بار کاری ماکزیمم بسنجید و کش‌لاین و همزمانی را در نظر بگیرید.`,
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
