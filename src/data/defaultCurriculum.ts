import { Phase } from "../types";

/**
 * ══════════════════════════════════════════════════════════════════
 *  AI Infrastructure Engineering Curriculum — FINAL v4.0
 *  Absolute Zero Edition (صفر مطلق)
 * ══════════════════════════════════════════════════════════════════
 *
 *  Total: 48 weeks | 10 phases | 35 modules | 125+ lessons | 13 projects
 *
 *  CHANGES FROM v3.0:
 *  ┌──────────────────────────────────────────────────────────────┐
 *  │ 1. NEW Phase 0: "Computing from First Breath"                │
 *  │    - For absolute beginners (zero math, zero CS, zero code)  │
 *  │    - 4 weeks, 4 modules, 20 lessons, 4 projects              │
 *  │                                                              │
 *  │ 2. Phase 1 (old Phase 0): Added math review lesson           │
 *  │    - Since Phase 0 covers basics, this is a quick review     │
 *  │                                                              │
 *  │ 3. Phase 2 (old Phase 1): Removed terminal intro              │
 *  │    - Terminal is covered in Phase 0, starts advanced         │
 *  │                                                              │
 *  │ 4. Phase 3 (old Phase 2): Removed Python basics               │
 *  │    - Python basics covered in Phase 0, starts with objects   │
 *  │                                                              │
 *  │ 5. All other phases: unchanged from v3.0                      │
 *  └──────────────────────────────────────────────────────────────┘
 *
 *  Validation Framework (every lesson must pass ≥4/5 filters):
 *  ┌──────────────────────────────────────────────────────────────┐
 *  │ F1  Academic     │ MIT/CMU/Stanford/Berkeley syllabus match   │
 *  │ F2  Industry     │ ≥3 real job listings (LinkedIn/Indeed)    │
 *  │ F3  Prereq       │ Next lesson impossible without this one    │
 *  │ F4  Project      │ Directly used in a phase project          │
 *  │ F5  Certification│ AWS/GCP/CNCF/Linux Foundation exam guide  │
 *  └──────────────────────────────────────────────────────────────┘
 *
 *  Evidence Base:
 *  Academic:     CMU 15-213, MIT 6.824, Stanford CS144/CS229,
 *                UC Berkeley CS162, MIT 6.006, CS0/CS1 courses
 *  Industry:     AWS ML Specialty, GCP Professional ML Engineer,
 *                CNCF CKA/CKAD, LFCS, OWASP Top 10 for LLM 2025
 *  Research:     Kwon et al. 2023 (PagedAttention), Moritz 2018 (Ray)
 *  Learning Sci: Dunlosky 2013, Sweller 1988, Ericsson 2016
 *  Job Market:   LinkedIn/Indeed AI Infra listings 2025-2026
 *
 *  Target Audience: ABSOLUTE ZERO
 *  - No math beyond addition/subtraction
 *  - No computer science knowledge
 *  - No programming experience
 *  - No terminal/command line exposure
 * ══════════════════════════════════════════════════════════════════
 */

export const DEFAULT_CURRICULUM: Phase[] = [

  /* ════════════════════════════════════════════════════════════
     PHASE 0 — Computing from First Breath (ABSOLUTE ZERO)
     ════════════════════════════════════════════════════════════
     Duration: 4 weeks
     Rationale: The learner has ZERO background. We start with
     Learning Science (how to learn), then basic computing,
     math, programming and engineering thinking.
     Daily hours: 3 (not 4 — gentle start)
     ════════════════════════════════════════════════════════════ */
  {
    id: 0,
    title: "Phase 0: Computing from First Breath — Absolute Zero Foundation",
    fa: "فاز ۰: دنیای کامپیوتر از اولین نفس — بنیان صفر مطلق",
    dur: "4 Weeks",
    col: "lime",
    mods: [
      {
        id: "0.1",
        title: "Learning Science & Cognitive Architecture",
        fa: "علم یادگیری و معماری شناختی مغز",
        lessons: [
          {
            en: "How the Brain Learns: Memory Consolidation, Synaptic Plasticity, Forgetting Curve & Sleep-Dependent Learning",
            fa: "مغز چطور یاد می‌گیره: تثبیت حافظه، شکل‌پذیری سیناپسی، منحنی فراموشی و یادگیری وابسته به خواب",
          },
          {
            en: "Evidence-Based Learning: Active Recall vs Passive Illusion, Deliberate Practice, Cognitive Load Theory & Feynman Technique",
            fa: "یادگیری مبتنی بر شواهد: یادآوری فعال، تمرین عمدی، نظریه بار شناختی و تکنیک فاینمن",
          },
        ],
      },
      {
        id: "0.2",
        title: "What is a Computer? Files, Internet & First Terminal",
        fa: "کامپیوتر چیه؟ فایل، اینترنت و اولین ملاقات با ترمینال",
        lessons: [
          {
            en: "Computer = Super-Fast Calculator: Input → Processing → Output, Hardware vs Software, Operating System as Manager",
            fa: "کامپیوتر = ماشین‌حساب فوق‌سریع: ورودی → پردازش → خروجی، تفاوت سخت‌افزار و نرم‌افزار، سیستم‌عامل به‌عنوان مدیر کل",
          },
          {
            en: "Files, Folders & Paths: A File is a Paper, a Folder is a Filing Cabinet, a Path is a Postal Address",
            fa: "فایل، پوشه و مسیر: فایل یعنی برگه کاغذ، پوشه یعنی کمد بایگانی، مسیر یعنی آدرس پستی",
          },
          {
            en: "Internet & Network: Browser as Window, Server as Always-On Computer, URL as Phone Number",
            fa: "اینترنت و شبکه: مرورگر به‌عنوان پنجره، سرور به‌عنوان کامپیوتر همیشه روشن، آدرس وب به‌عنوان شماره تلفن",
          },
          {
            en: "Terminal First Contact: What is It, Why Engineers Use It, First Commands (pwd, ls, cd)",
            fa: "اولین ملاقات با ترمینال: چیه، چرا مهندس‌ها استفاده می‌کنن، اولین دستورات",
          },
        ],
      },
      {
        id: "0.3",
        title: "Mathematics for Computing: Variables, Functions, Logic",
        fa: "ریاضیات برای کامپیوتر: متغیر، تابع، منطق",
        lessons: [
          {
            en: "Numbers & Operations Review: Addition to Division, Order of Operations, Parentheses, Negative Numbers",
            fa: "مرور اعداد و عملیات: جمع تا تقسیم، اولویت عملیات، پرانتز، اعداد منفی",
          },
          {
            en: "Variables = Named Boxes: x = 5, y = x + 3, Why Variables Matter in Programming",
            fa: "متغیر = جعبه با اسم: چرا متغیر در برنامه‌نویسی حیاتی‌ه",
          },
          {
            en: "Functions = Input/Output Machines: f(x) = x + 2, f(3) = 5, Juice Maker Analogy",
            fa: "تابع = ماشین ورودی/خروجی: مثال آبمیوه‌گیری، چرا در برنامه‌نویسی مهمه",
          },
          {
            en: "Graphs & Coordinates: Horizontal/Vertical Axis, Points, Lines, Slope, Why Graphs Matter",
            fa: "نمودار و مختصات: محور افقی و عمودی، نقطه، خط و شیب",
          },
          {
            en: "Logic & True/False: AND, OR, NOT, If-Then, Computer Only Understands True/False",
            fa: "منطق درست/غلط: و، یا، نه، اگر-آنگاه، کامپیوتر فقط درست و غلط می‌فهمه",
          },
        ],
      },
      {
        id: "0.4",
        title: "First Programming: Python from Hello World to Functions",
        fa: "اولین برنامه‌نویسی: پایتون از سلام دنیا تا تابع",
        lessons: [
          {
            en: "Program = List of Instructions: Recipe Analogy, Computer Executes One-by-One, First Code: print('Hello World')",
            fa: "برنامه = لیست دستورات: تمثیل دستور پخت، اولین کد: چاپ سلام دنیا",
          },
          {
            en: "Variables in Python: name = 'Ali', age = 25, Data Types (Number, Text, True/False)",
            fa: "متغیرها در پایتون: انواع داده (عدد، متن، درست/غلط)",
          },
          {
            en: "Conditions (if/elif/else): Age Check Example, Computer Becomes Decision-Maker",
            fa: "شرط‌ها: مثال بررسی سن، کامپیوتر تصمیم‌گیرنده می‌شه",
          },
          {
            en: "Loops (for/while): 'Do This 10 Times', Real Power = Loops + Conditions",
            fa: "حلقه‌ها: 'این کار رو ۱۰ بار تکرار کن'، قدرت واقعی = حلقه + شرط",
          },
          {
            en: "Functions in Python: def salam(name), return, Why Functions Organize Code",
            fa: "تابع‌ها در پایتون: تعریف، فراخوانی، چرا تابع‌ها کد رو منظم می‌کنن",
          },
        ],
      },
      {
        id: "0.5",
        title: "Engineering Thinking: Algorithms, Debugging, Googling",
        fa: "تفکر مهندسی: الگوریتم، دیباگ، گوگل کردن",
        lessons: [
          {
            en: "Algorithm = Precise Recipe: Input-Process-Output, Order Matters, Writing Algorithms on Paper First",
            fa: "الگوریتم = دستور پخت دقیق: ورودی-پردازش-خروجی، ترتیب مهمه",
          },
          {
            en: "Divide & Conquer: Split Problems into Small Pieces, Solve Each Piece, This is Engineering",
            fa: "تقسیم مسئله به تیکه‌های کوچک: حل هر تیکه جدا، این کار مهندسه",
          },
          {
            en: "Debugging = Finding Mistakes: Errors Are Normal, Computer Does What You Say Not What You Mean, Patience",
            fa: "دیباگ = پیدا کردن اشتباه: خطا طبیعیه، کامپیوتر کاری رو می‌کنه که می‌گی نه منظورت",
          },
          {
            en: "Googling Like an Engineer: How to Ask Questions, Stack Overflow, Official Docs, 90% of Engineering is Googling",
            fa: "گوگل کردن مثل مهندس: چطور سوال بپرسی، استک‌اورفلو، داکیومنت رسمی",
          },
          {
            en: "Preparation for Phase 1: Install VS Code, Python, Review All Concepts, First Real Project",
            fa: "آماده‌سازی برای فاز ۱: نصب ابزارها، مرور مفاهیم، اولین پروژه واقعی",
          },
        ],
      },
    ],
    projs: [
      {
        id: "P0.1",
        title: "First Steps: Personal Folder Structure + 5 Terminal Commands",
        fa: "اولین قدم‌ها: ساخت ساختار پوشه + ۵ دستور ترمینال",
        description:
          "ساخت ساختار پوشه شخصی، نوشتن فایل متنی ساده و اجرای ۵ دستور ترمینال از حفظ.",
      },
      {
        id: "P0.2",
        title: "Paper Calculator: 10 Functions + 5 Logic Questions + 1 Graph",
        fa: "ماشین‌حساب روی کاغذ: ۱۰ تابع + ۵ سوال منطقی + ۱ نمودار",
        description:
          "حل ۱۰ تابع مختلف، پاسخ به ۵ سوال منطقی و رسم نمودار یک خط ساده روی کاغذ.",
      },
      {
        id: "P0.3",
        title: "Number Guessing Game in Python",
        fa: "بازی حدس عدد در پایتون",
        description:
          "کامپیوتر عددی ۱ تا ۱۰۰ انتخاب می‌کنه، کاربر حدس می‌زنه، برنامه راهنمایی می‌کنه. ترکیب متغیر، شرط، حلقه و تابع.",
      },
      {
        id: "P0.4",
        title: "Complete Calculator: +, -, ×, ÷ with Error Handling",
        fa: "ماشین‌حساب کامل: جمع، تفریق، ضرب، تقسیم با مدیریت خطا",
        description:
          "ساخت ماشین‌حساب با ورودی کاربر، تشخیص تقسیم بر صفر و خروجی خوانا. این پروژه = دیپلم فارغ‌التحصیلی از فاز ۰.",
      },
    ],
  },

  /* ════════════════════════════════════════════════════════════
     PHASE 1 — Digital Logic, Architecture & Math
     ════════════════════════════════════════════════════════════
     Duration: 3 weeks
     ════════════════════════════════════════════════════════════ */
  {
    id: 1,
    title: "Phase 1: Digital Logic, Hardware Architecture & Mathematical Foundations",
    fa: "فاز ۱: منطق دیجیتال، معماری سخت‌افزار و بنیان‌های ریاضی",
    dur: "3 Weeks",
    col: "cyan",
    mods: [
      {
        id: "1.1",
        title: "Digital Logic & The Von Neumann Machine",
        fa: "منطق دیجیتال و ماشین فون نویمان",
        lessons: [
          {
            en: "Bits, Bytes, Hexadecimal & Two's Complement Integer Representation",
            fa: "بیت، بایت، مبنای ۱۶ و نمایش اعداد صحیح با متمم دو",
          },
          {
            en: "Boolean Algebra, Logic Gates (AND, OR, NOT, XOR) & Truth Tables",
            fa: "جبر بولی، گیت‌های منطقی و جداول درستی",
          },
          {
            en: "IEEE 754 Floating-Point: FP32, FP16, BF16, FP8 & Quantization Implications",
            fa: "استاندارد IEEE 754 و فرمت‌های عددی هوش مصنوعی",
          },
          {
            en: "Von Neumann Architecture: Fetch-Decode-Execute Cycle, Control Unit & Memory Bus",
            fa: "معماری فون نویمان: چرخه واکشی-دیکود-اجرا و گذرگاه حافظه",
          },
        ],
      },
      {
        id: "1.2",
        title: "Hardware Hierarchy: CPU, GPU & The Memory Wall",
        fa: "هرم سخت‌افزار: پردازنده، GPU و دیوار حافظه",
        lessons: [
          {
            en: "Memory Hierarchy: Registers → L1/L2/L3 Cache → RAM → NVMe & Cache Locality",
            fa: "هرم حافظه: رجیستر تا NVMe و اصل محلی بودن کش",
          },
          {
            en: "CPU vs GPU: Latency-Optimized vs Throughput-Optimized Architecture",
            fa: "مقایسه معماری CPU و GPU",
          },
          {
            en: "SIMD, SIMT, Tensor Cores & NVIDIA Hopper/Blackwell Architecture",
            fa: "موازی‌سازی برداری و هسته‌های تنسوری",
          },
          {
            en: "HBM3/HBM3e, NVLink, PCIe Bandwidth & The Von Neumann Bottleneck",
            fa: "حافظه HBM، اتصال NVLink و تنگنای فون نویمان",
          },
        ],
      },
      {
        id: "1.3",
        title: "Essential Mathematics for AI Systems",
        fa: "ریاضیات ضروری برای سیستم‌های هوش مصنوعی",
        lessons: [
          {
            en: "Quick Review: Variables, Functions, Graphs (From Phase 0)",
            fa: "مرور سریع: متغیر، تابع و نمودار (از فاز ۰)",
          },
          {
            en: "Vectors, Dot Products, Cosine Similarity & Embedding Spaces",
            fa: "بردارها، ضرب داخلی، شباهت کسینوسی و فضاهای امبدینگ",
          },
          {
            en: "Matrix Multiplication (GEMM), Linear Transforms & Computational Cost",
            fa: "ضرب ماتریسی (GEMM)، تبدیلات خطی و تحلیل هزینه",
          },
          {
            en: "Gradients, Chain Rule & Computational Graphs (Autograd Foundation)",
            fa: "گرادیان، قاعده زنجیره‌ای و گراف‌های محاسباتی",
          },
          {
            en: "Probability Distributions, Bayes' Rule & Information Entropy",
            fa: "توزیع‌های احتمال، قضیه بیز و آنتروپی اطلاعات",
          },
        ],
      },
    ],
    projs: [
      {
        id: "P1",
        title: "GPU Memory Hierarchy Visualizer & GEMM Benchmark",
        fa: "مصورساز هرم حافظه و بنچمارک ضرب ماتریسی",
        description:
          "ابزار خط‌فرمان برای مصورسازی تأخیر هر سطح حافظه و بنچمارک GEMM با فرمت‌های مختلف عددی.",
      },
    ],
  },

  /* ════════════════════════════════════════════════════════════
     PHASE 2 — Linux, Systems Literacy & Version Control
     ════════════════════════════════════════════════════════════
     Duration: 5 weeks
     CHANGED: Removed terminal intro (covered in Phase 0)
     Starts with advanced commands immediately
     ════════════════════════════════════════════════════════════ */
  {
    id: 2,
    title: "Phase 2: Linux Operating System, Systems Literacy & Version Control",
    fa: "فاز ۲: سیستم‌عامل لینوکس، سواد سیستمی و کنترل نسخه",
    dur: "5 Weeks",
    col: "indigo",
    mods: [
      {
        id: "2.1",
        title: "Linux Shell, Filesystem & POSIX Mastery",
        fa: "ترمینال لینوکس، فایل‌سیستم و ابزارهای POSIX",
        lessons: [
          {
            en: "Advanced Terminal: Bash Navigation, Coreutils, Permissions (chmod/chown/umask), Environment Variables",
            fa: "ترمینال پیشرفته: ناوبری، دسترسی‌ها، متغیرهای محیطی",
          },
          {
            en: "Standard Streams, Redirections, Pipelines & Process Substitution",
            fa: "جریان‌های استاندارد، ریدایرکت، پایپ‌ها",
          },
          {
            en: "Linux Filesystem Hierarchy: VFS, /proc, /sys, /dev & File Descriptors",
            fa: "سلسله‌مراتب فایل‌سیستم: VFS و دایرکتوری‌های سیستمی",
          },
          {
            en: "Process Monitoring, Signals, Resource Limits & systemd Services",
            fa: "پایش فرآیندها، سیگنال‌ها و مدیریت سرویس‌ها",
          },
        ],
      },
      {
        id: "2.2",
        title: "C for Systems Understanding (Read-Focused)",
        fa: "زبان C برای درک سیستم (تمرکز بر خواندن)",
        lessons: [
          {
            en: "C Compilation Pipeline: Preprocessor → Compiler → Assembler → Linker",
            fa: "پایپ‌لاین کامپایل C",
          },
          {
            en: "Pointers, Memory Addresses, Stack vs Heap & The Call Stack",
            fa: "اشاره‌گرها، آدرس حافظه، پشته در برابر هیپ",
          },
          {
            en: "Structs, Memory Layout, Alignment & How CPython Maps to C",
            fa: "ساختارها، چیدمان حافظه و نگاشت پایتون به C",
          },
        ],
      },
      {
        id: "2.3",
        title: "Kernel Internals, Syscalls & Process Management",
        fa: "هسته لینوکس، فراخوانی‌های سیستمی و مدیریت فرآیند",
        lessons: [
          {
            en: "User Mode vs Kernel Mode: Context Switching & The Syscall Gate",
            fa: "حالت کاربر در برابر هسته",
          },
          {
            en: "Process Lifecycle: fork(), execve(), waitpid() & PCB",
            fa: "چرخه حیات فرآیند",
          },
          {
            en: "POSIX Threads, Mutexes & Foundations of Concurrent Systems",
            fa: "ریسمان‌های POSIX و مبانی همزمانی",
          },
          {
            en: "Modern I/O: File Descriptors, Non-blocking I/O, epoll & io_uring",
            fa: "I/O مدرن: اپول و io_uring",
          },
        ],
      },
      {
        id: "2.4",
        title: "Git Deep Dive & Collaborative Engineering",
        fa: "گیت عمیق و مهندسی مشارکتی",
        lessons: [
          {
            en: "Git Internals: Objects, Refs, HEAD, Index & The DAG Structure",
            fa: "درون‌مایه گیت: اشیاء و ساختار گراف",
          },
          {
            en: "Branching Strategies, Rebasing, Cherry-Pick & Conflict Resolution",
            fa: "استراتژی‌های شاخه‌بندی و حل تعارض",
          },
          {
            en: "GitHub Workflows: PRs, Code Review, CI Integration & Semantic Versioning",
            fa: "جریان‌های کاری گیت‌هاب: پول‌ریکوئست و بازبینی کد",
          },
        ],
      },
    ],
    projs: [
      {
        id: "P2",
        title: "Custom Unix Shell with Pipeline & Process Management",
        fa: "شل یونیکس اختصاصی با پایپ و مدیریت فرآیند",
        description:
          "پیاده‌سازی شل با پشتیبانی پایپ، ریدایرکت، اجرای پس‌زمینه و مدیریت سیگنال.",
      },
    ],
  },

  /* ════════════════════════════════════════════════════════════
     PHASE 3 — Systems Data Structures & Deep Python
     ════════════════════════════════════════════════════════════
     Duration: 5 weeks
     CHANGED: Removed Python basics (covered in Phase 0)
     Starts with object model and CPython internals
     ════════════════════════════════════════════════════════════ */
  {
    id: 3,
    title: "Phase 3: Systems Data Structures & Deep Python Engineering",
    fa: "فاز ۳: ساختارهای داده سیستمی و مهندسی عمیق پایتون",
    dur: "5 Weeks",
    col: "emerald",
    mods: [
      {
        id: "3.1",
        title: "Cache-Conscious Structures & Hash Systems",
        fa: "ساختارهای همسو با کش و سیستم‌های هش",
        lessons: [
          {
            en: "Big-O in Practice: Latency Numbers Every Engineer Should Know",
            fa: "Big-O در عمل: اعداد تأخیری که هر مهندس باید بداند",
          },
          {
            en: "Dynamic Arrays, Cache Locality & Why Linked Lists Lose",
            fa: "آرایه پویا، محلی بودن کش و ضعف لیست پیوندی",
          },
          {
            en: "Hash Tables: MurmurHash/xxHash, Collision Resolution & Load Factors",
            fa: "جداول هش: توابع مدرن و حل برخورد",
          },
          {
            en: "B-Trees, B+ Trees & LSM-Trees: Database & Vector DB Backbone",
            fa: "درخت‌های B و LSM: ستون فقرات دیتابیس‌ها",
          },
        ],
      },
      {
        id: "3.2",
        title: "DAGs, Scheduling & Pipeline Structures",
        fa: "گراف‌های DAG و ساختارهای پایپ‌لاین",
        lessons: [
          {
            en: "Directed Acyclic Graphs (DAGs) & Topological Sorting",
            fa: "گراف‌های جهت‌دار بدون دور و مرتب‌سازی توپولوژیک",
          },
          {
            en: "Priority Queues & Binary Heaps in Task/Packet Schedulers",
            fa: "صف‌های اولویت‌دار و هپ در زمان‌بندی",
          },
          {
            en: "Graph Traversals (BFS/DFS) for Dependency Resolution & Deadlock Detection",
            fa: "پیمایش گراف برای حل وابستگی و تشخیص بن‌بست",
          },
        ],
      },
      {
        id: "3.3",
        title: "Python Data Model, CPython Internals & Memory",
        fa: "مدل اشیاء پایتون و درون‌مایه CPython",
        lessons: [
          {
            en: "PyObject Internals: Reference Counting, Cyclic GC & pymalloc",
            fa: "درون‌مایه PyObject: شمارش مراجع و زباله‌روب",
          },
          {
            en: "The GIL: Architecture, Multi-core Limits & Free-Threaded Python (PEP 703)",
            fa: "قفل سراسری مفسر و آینده بدون GIL",
          },
          {
            en: "Dunder Methods, Metaclasses & The Descriptor Protocol",
            fa: "متدهای جادویی، متاساختارها و پروتکل توصیف‌گر",
          },
        ],
      },
      {
        id: "3.4",
        title: "High-Performance Python: AsyncIO, Concurrency & Tensors",
        fa: "پایتون پرسرعت: AsyncIO و مکانیک تنسورها",
        lessons: [
          {
            en: "Generators, Coroutines & AsyncIO Event Loop Deep Dive",
            fa: "جنراتورها، کوروتین‌ها و حلقه رویداد AsyncIO",
          },
          {
            en: "I/O-Bound vs CPU-Bound: ThreadPool vs ProcessPool vs AsyncIO",
            fa: "مقایسه نخ، فرآیند و AsyncIO",
          },
          {
            en: "NumPy Strides, Memory Layout & PyTorch Tensor Internals",
            fa: "استرایدهای NumPy و درون‌مایه تنسورهای PyTorch",
          },
        ],
      },
      {
        id: "3.5",
        title: "SQL Fundamentals & Technical Documentation",
        fa: "مبانی SQL و مستندسازی فنی",
        lessons: [
          {
            en: "SQL Core: SELECT, JOIN, INDEX, Transactions & Query Optimization Basics",
            fa: "هسته SQL: کوئری، ایندکس، تراکنش و بهینه‌سازی",
          },
          {
            en: "Technical Writing: Architecture Decision Records, README Standards & API Docs",
            fa: "مستندسازی فنی: سوابق تصمیمات معماری",
          },
        ],
      },
    ],
    projs: [
      {
        id: "P3",
        title: "Async ML Model API with FastAPI & B+ Tree Index",
        fa: "API ناهمگام سرو مدل با FastAPI و ایندکس B+ Tree",
        description:
          "سرویس وب ناهمگام با FastAPI، ایندکس‌گذاری B+ Tree و اتصال به PostgreSQL.",
      },
    ],
  },

  /* ════════════════════════════════════════════════════════════
     PHASE 4 — Rust for AI Tooling
     ════════════════════════════════════════════════════════════
     Duration: 3 weeks
     ════════════════════════════════════════════════════════════ */
  {
    id: 4,
    title: "Phase 4: Rust for AI Tooling & Safe Systems Programming",
    fa: "فاز ۴: زبان Rust برای ابزارسازی هوش مصنوعی",
    dur: "3 Weeks",
    col: "rose",
    mods: [
      {
        id: "4.1",
        title: "Rust Core: Ownership, Borrowing & Memory Safety",
        fa: "هسته Rust: مالکیت، امانت‌گیری و امنیت حافظه",
        lessons: [
          {
            en: "Rust Philosophy: Zero-Cost Abstractions, Cargo & Type System",
            fa: "فلسفه Rust: انتزاع با هزینه صفر و سیستم نوع",
          },
          {
            en: "Ownership, Move Semantics, Borrowing & The Borrow Checker",
            fa: "مالکیت، انتقال، امانت‌گیری و اعتبارسنج کامپایلر",
          },
          {
            en: "Enums, Pattern Matching & Error Handling with Result/Option",
            fa: "شمارنده‌ها، تطبیق الگو و مدیریت خطا",
          },
        ],
      },
      {
        id: "4.2",
        title: "Async Rust, Concurrency & Smart Pointers",
        fa: "Rust ناهمگام و همزمانی",
        lessons: [
          {
            en: "Traits, Generics, Smart Pointers (Box, Arc) & Interior Mutability",
            fa: "تریت‌ها، جنریک و نشانگرهای هوشمند",
          },
          {
            en: "Fearless Concurrency: Send/Sync, Threads & Message Passing",
            fa: "همزمانی بدون ترس: تریت‌های Send/Sync",
          },
          {
            en: "Async Rust & Tokio Runtime: Futures, Tasks & Select",
            fa: "Rust ناهمگام و ران‌تایم Tokio",
          },
        ],
      },
      {
        id: "4.3",
        title: "PyO3, FFI & Reading Production Rust",
        fa: "پل پایتون-راست و خواندن کد صنعتی",
        lessons: [
          {
            en: "PyO3: Zero-Overhead Python Bindings & Native Extensions",
            fa: "PyO3: اتصال بدون سربار پایتون",
          },
          {
            en: "Reading Production Rust: HuggingFace Tokenizers & candle Source",
            fa: "خواندن کد صنعتی: تحلیل سورس ابزارهای HuggingFace",
          },
          {
            en: "Unsafe Rust & FFI: When and Why It's Necessary",
            fa: "Rust ناایمن و FFI: ضرورت‌ها و محدودیت‌ها",
          },
        ],
      },
    ],
    projs: [
      {
        id: "P4",
        title: "High-Speed Concurrent BPE Tokenizer Engine",
        fa: "موتور توکنایزر BPE چندریسه‌ای پرسرعت",
        description:
          "پیاده‌سازی توکنایزر BPE با Rayon و مقایسه عملکرد با نسخه پایتون.",
      },
    ],
  },

  /* ════════════════════════════════════════════════════════════
     PHASE 5 — Networks, Distributed Systems & Event Streaming
     ════════════════════════════════════════════════════════════
     Duration: 5 weeks
     ════════════════════════════════════════════════════════════ */
  {
    id: 5,
    title: "Phase 5: High-Speed Networks, Distributed Systems & Event Streaming",
    fa: "فاز ۵: شبکه‌های پرسرعت، سیستم‌های توزیع‌شده و جریان رویدادها",
    dur: "5 Weeks",
    col: "sky",
    mods: [
      {
        id: "5.1",
        title: "The Modern Network Stack: TCP/IP, HTTP/3 & RDMA",
        fa: "پشته شبکه مدرن: TCP/IP، HTTP/3 و RDMA",
        lessons: [
          {
            en: "TCP Deep Dive: Handshake, Flow Control, Congestion (BBR) & Bufferbloat",
            fa: "کالبدشکافی TCP: دست‌تکانی و کنترل ازدحام",
          },
          {
            en: "HTTP/1.1 → HTTP/2 Multiplexing → HTTP/3 (QUIC) Evolution",
            fa: "سیر تحول وب از HTTP/1.1 تا HTTP/3",
          },
          {
            en: "RDMA, RoCE & Ultra-Low Latency Networking for GPU Clusters",
            fa: "RDMA و RoCE: شبکه‌های تأخیر صفر برای خوشه‌های GPU",
          },
          {
            en: "gRPC, Protocol Buffers & Binary Wire Serialization",
            fa: "معماری gRPC و سریال‌سازی دودویی",
          },
        ],
      },
      {
        id: "5.2",
        title: "Distributed Systems Architecture & Consensus",
        fa: "معماری توزیع‌شده و پروتکل‌های اجماع",
        lessons: [
          {
            en: "CAP Theorem, PACELC & The 8 Fallacies of Distributed Computing",
            fa: "قضایای CAP و خطاهای رایج توزیع‌شده",
          },
          {
            en: "Time & Ordering: Lamport Timestamps, Vector Clocks & NTP Drift",
            fa: "زمان و نظم: ساعت‌های منطقی و انحراف فیزیکی",
          },
          {
            en: "Consensus: Raft (Leader Election, Log Replication, Safety Proofs)",
            fa: "اجماع Raft: انتخاب لیدر و تکرار امن لاگ",
          },
        ],
      },
      {
        id: "5.3",
        title: "Event-Driven Architecture & Apache Kafka",
        fa: "معماری رویدادمحور و آپاچی کافکا",
        lessons: [
          {
            en: "Message Queues vs Distributed Commit Logs: Pub/Sub Patterns",
            fa: "صف‌های پیام در برابر لاگ‌های توزیع‌شده",
          },
          {
            en: "Kafka Architecture: Brokers, Topics, Partitions, Offsets & Consumer Groups",
            fa: "معماری کافکا: بروکرها، تاپیک‌ها و پارتیشن‌ها",
          },
          {
            en: "Delivery Guarantees: acks=all, Idempotent Producers & Exactly-Once",
            fa: "تضمین تحویل: معنای دقیقاً یک‌بار",
          },
          {
            en: "Schema Registry, Kafka Streams & AI Pipeline Integration",
            fa: "رجیستری اسکیما و یکپارچه‌سازی با پایپ‌لاین AI",
          },
        ],
      },
    ],
    projs: [
      {
        id: "P5",
        title: "Fault-Tolerant Distributed KV Store with Raft & gRPC",
        fa: "پایگاه کلید-مقدار توزیع‌شده مقاوم با Raft و gRPC",
        description:
          "کلاستر ۳ نودی با الگوریتم Raft، تحمل خرابی و سرویس‌دهی gRPC.",
      },
    ],
  },

  /* ════════════════════════════════════════════════════════════
     PHASE 6 — Cloud-Native, Containers & Kubernetes
     ════════════════════════════════════════════════════════════
     Duration: 6 weeks
     ════════════════════════════════════════════════════════════ */
  {
    id: 6,
    title: "Phase 6: Cloud-Native Platform, Containers & Kubernetes GPU Orchestration",
    fa: "فاز ۶: پلتفرم ابری، کانتینرها و ارکستراسیون GPU با کوبرنتیز",
    dur: "6 Weeks",
    col: "teal",
    mods: [
      {
        id: "6.1",
        title: "Container Internals: Namespaces, Cgroups & GPU Passthrough",
        fa: "درون‌مایه کانتینرها و اتصال GPU",
        lessons: [
          {
            en: "Linux Namespaces (PID, Mount, Net, IPC, UTS, User) & Isolation",
            fa: "فضاهای نام لینوکس و ایزوله‌سازی",
          },
          {
            en: "Cgroups v2: CPU, Memory & I/O Throttling",
            fa: "گروه‌های کنترل: مهار منابع",
          },
          {
            en: "OverlayFS, Multi-Stage Builds & Distroless Images",
            fa: "فایل‌سیستم لایه‌ای و ایمیج‌های مینیمال",
          },
          {
            en: "NVIDIA Container Toolkit: GPU Passthrough, Drivers & MIG",
            fa: "اتصال GPU به کانتینر و فناوری MIG",
          },
        ],
      },
      {
        id: "6.2",
        title: "Kubernetes Architecture & Workload Management",
        fa: "معماری کوبرنتیز و مدیریت بارها",
        lessons: [
          {
            en: "Control Plane: API Server, etcd, Scheduler & Controller Manager",
            fa: "صفحه کنترل کوبرنتیز",
          },
          {
            en: "Worker Nodes: Kubelet, CRI, Kube-Proxy & Container Runtimes",
            fa: "نودهای کاری و رابط کانتینر",
          },
          {
            en: "Declarative Workloads: Pods, Deployments, StatefulSets & DaemonSets",
            fa: "بارهای اعلانی: پادها و دیپلویمنت‌ها",
          },
          {
            en: "Networking: CNI, Services, Ingress & Service Mesh Fundamentals",
            fa: "شبکه‌بندی کلاستر و سرویس‌مش",
          },
        ],
      },
      {
        id: "6.3",
        title: "GPU Scheduling, Operators & Autoscaling",
        fa: "زمان‌بندی GPU، اپراتورها و مقیاس‌پذیری",
        lessons: [
          {
            en: "NVIDIA GPU Operator, NodeAffinity, Tolerations & MIG Scheduling",
            fa: "اپراتور GPU و زمان‌بندی با تحمل‌پذیری",
          },
          {
            en: "Custom Resource Definitions (CRDs) & The Operator Pattern",
            fa: "منابع سفارشی و الگوی اپراتور",
          },
          {
            en: "HPA, VPA, KEDA & Event-Driven Autoscaling for AI Workloads",
            fa: "مقیاس‌پذیری خودکار برای بارهای AI",
          },
        ],
      },
      {
        id: "6.4",
        title: "Infrastructure as Code: Terraform, Cloud & Cost Optimization",
        fa: "زیرساخت به‌عنوان کد: ترافرم، ابر و بهینه‌سازی هزینه",
        lessons: [
          {
            en: "Terraform HCL: Providers, Resources, State Management & Modules",
            fa: "ترافرم: منابع، مدیریت حالت و ماژول‌ها",
          },
          {
            en: "Cloud Core Services: Compute, Storage, Networking & IAM (AWS/GCP)",
            fa: "سرویس‌های اصلی ابری و مدیریت دسترسی",
          },
          {
            en: "CI/CD for Infrastructure: GitOps, ArgoCD & Automated Pipelines",
            fa: "CI/CD برای زیرساخت: GitOps و پایپ‌لاین خودکار",
          },
          {
            en: "Cloud Cost Modeling: Spot Instances, Right-Sizing & GPU Cost Analysis",
            fa: "مدل‌سازی هزینه ابری و تحلیل هزینه GPU",
          },
        ],
      },
    ],
    projs: [
      {
        id: "P6",
        title: "Terraform-Provisioned K8s Cluster with GPU & Observability",
        fa: "کلاستر کوبرنتیز با ترافرم، GPU و مانیتورینگ",
        description:
          "استقرار خودکار با Terraform، دیپلوی مدل با GPU و مانیتورینگ Prometheus.",
      },
    ],
  },

  /* ════════════════════════════════════════════════════════════
     PHASE 7 — AI Infrastructure, Model Serving & MLOps
     ════════════════════════════════════════════════════════════
     Duration: 7 weeks
     ════════════════════════════════════════════════════════════ */
  {
    id: 7,
    title: "Phase 7: AI Infrastructure, Large Model Serving & Industrial MLOps",
    fa: "فاز ۷: زیرساخت هوش مصنوعی، سرو مدل‌های بزرگ و MLOps صنعتی",
    dur: "7 Weeks",
    col: "purple",
    mods: [
      {
        id: "7.1",
        title: "LLM Inference Architecture: KV-Cache, PagedAttention & Quantization",
        fa: "معماری استنتاج: کش کلید-مقدار و کوانتیزاسیون",
        lessons: [
          {
            en: "Transformer Inference: Prefill Phase vs Autoregressive Decode Phase",
            fa: "استنتاج ترنسفورمر: فاز پیش‌پُرکردن در برابر تولید افزایشی",
          },
          {
            en: "KV-Cache Memory Crisis: VRAM Calculation across Sequence Lengths",
            fa: "بحران حافظه KV-Cache و محاسبه مصرف VRAM",
          },
          {
            en: "PagedAttention: Virtual Memory Paging for GPU Attention Buffers",
            fa: "الگوریتم PagedAttention: صفحه‌بندی حافظه برای توجه",
          },
          {
            en: "Continuous Batching vs Static Batching: Maximizing GPU Utilization",
            fa: "دسته‌بندی پیوسته در برابر ایستا",
          },
          {
            en: "Quantization: AWQ, GPTQ, GGUF, FP8 & INT4 Trade-offs",
            fa: "کوانتیزاسیون: مقایسه تکنیک‌ها و مصالحه دقت-سرعت",
          },
        ],
      },
      {
        id: "7.2",
        title: "Inference Engines: vLLM, TensorRT-LLM & Triton Server",
        fa: "موتورهای استنتاج: vLLM، TensorRT و Triton",
        lessons: [
          {
            en: "vLLM Internals: AsyncLLMEngine, OpenAI-Compatible API & Scheduling",
            fa: "درون‌مایه vLLM: موتور ناهمگام و سرور سازگار با OpenAI",
          },
          {
            en: "Distributed Parallelism: Tensor Parallelism (TP) vs Pipeline Parallelism (PP) & NCCL",
            fa: "موازی‌سازی تنسوری در برابر خط‌لوله‌ای و کتابخانه NCCL",
          },
          {
            en: "NVIDIA Triton: Dynamic Batching, Concurrent Execution & Ensembles",
            fa: "سرور Triton: دسته‌بندی پویا و اجرای همزمان",
          },
          {
            en: "Benchmarking: TTFT, ITL, QPS, GPU Utilization & Cost-per-Token",
            fa: "بنچمارک: شاخص‌های کلیدی عملکرد و هزینه",
          },
        ],
      },
      {
        id: "7.3",
        title: "Distributed Compute with Ray (Core & Ray Serve)",
        fa: "رایانش توزیع‌شده با Ray",
        lessons: [
          {
            en: "Ray Core: Tasks, Actors, Object Store (Plasma) & GCS",
            fa: "هسته Ray: تسک‌ها، اکتورها و حافظه اشتراکی",
          },
          {
            en: "Ray Serve: Dynamic Routing, Replicas, Scaling & Fractional GPUs",
            fa: "فریم‌ورک Ray Serve: مسیریابی و مقیاس‌پذیری",
          },
          {
            en: "Resilient AI Pipelines: Error Handling, Graceful Degradation & Streaming",
            fa: "پایپ‌لاین‌های پایدار: مدیریت شکست و استریم",
          },
        ],
      },
      {
        id: "7.4",
        title: "Vector Databases & Production RAG Pipelines",
        fa: "پایگاه‌های برداری و خطوط لوله RAG صنعتی",
        lessons: [
          {
            en: "Embeddings, ANN Indexing: HNSW, IVFPQ & Distance Metrics",
            fa: "امبدینگ‌ها و ایندکس تقریبی: HNSW و معیارهای فاصله",
          },
          {
            en: "Vector DB Architectures: Qdrant, Milvus, Weaviate & pgvector",
            fa: "معماری پایگاه‌های برداری: مقایسه و انتخاب",
          },
          {
            en: "Production RAG: Chunking, Reranking, Semantic Caching & Evaluation (RAGAS)",
            fa: "RAG صنعتی: تقطیع، بازرتبه‌بندی و ارزیابی",
          },
        ],
      },
      {
        id: "7.5",
        title: "MLOps Pipeline: Tracking, Registry, CI/CD & Data Engineering",
        fa: "پایپ‌لاین MLOps: ردیابی، رجیستری و مهندسی داده",
        lessons: [
          {
            en: "Experiment Tracking: MLflow / Weights & Biases for Model Versioning",
            fa: "ردیابی آزمایش: نسخه‌بندی مدل با MLflow یا W&B",
          },
          {
            en: "Model Registry, Staging/Production Promotion & A/B Testing",
            fa: "رجیستری مدل و تست A/B",
          },
          {
            en: "CI/CD for ML: Automated Testing, Validation Gates & Deployment Pipelines",
            fa: "CI/CD برای ML: تست خودکار و پایپ‌لاین استقرار",
          },
          {
            en: "Data Engineering Basics: ETL Pipelines, Data Validation & Feature Stores",
            fa: "مبانی مهندسی داده: پایپ‌لاین‌های ETL و اعتبارسنجی",
          },
        ],
      },
      {
        id: "7.6",
        title: "Practical Fine-Tuning: LoRA, PEFT & Model Adaptation",
        fa: "فاین‌تیونینگ عملی: LoRA و سازگاری مدل",
        lessons: [
          {
            en: "LoRA, QLoRA & PEFT: Parameter-Efficient Fine-Tuning in Practice",
            fa: "فاین‌تیونینگ کم‌پارامتر: تکنیک‌های عملی",
          },
        ],
      },
    ],
    projs: [
      {
        id: "P7",
        title: "Distributed LLM Serving: vLLM + Ray Serve + Qdrant RAG + MLflow",
        fa: "کلاستر توزیع‌شده سرو مدل با RAG و ردیابی آزمایش",
        description:
          "راه‌اندازی کلاستر استنتاج با موازی‌سازی تنسوری، کوانتیزاسیون، پایپ‌لاین RAG و بنچمارک کامل.",
      },
    ],
  },

  /* ════════════════════════════════════════════════════════════
     PHASE 8 — Security, Observability & Production Hardening
     ════════════════════════════════════════════════════════════
     Duration: 4 weeks
     ════════════════════════════════════════════════════════════ */
  {
    id: 8,
    title: "Phase 8: AI Security, Observability & Production Hardening",
    fa: "فاز ۸: امنیت هوش مصنوعی، مشاهده‌پذیری و استحکام تولید",
    dur: "4 Weeks",
    col: "orange",
    mods: [
      {
        id: "8.1",
        title: "AI Security: Threats, Defenses & Compliance",
        fa: "امنیت هوش مصنوعی: تهدیدها و دفاع‌ها",
        lessons: [
          {
            en: "Prompt Injection, Jailbreaking & Input Validation Strategies",
            fa: "تزریق پرامپت، فرار از محدودیت و اعتبارسنجی ورودی",
          },
          {
            en: "Model Poisoning, Data Leakage & Supply Chain Security",
            fa: "مسموم‌سازی مدل، نشت داده و امنیت زنجیره تأمین",
          },
          {
            en: "API Security: Rate Limiting, Auth, RBAC & Audit Logging",
            fa: "امنیت API: محدودیت نرخ، احراز هویت و لاگ ممیزی",
          },
        ],
      },
      {
        id: "8.2",
        title: "Full-Stack Observability: Metrics, Logs, Traces & SLOs",
        fa: "مشاهده‌پذیری کامل: متریک، لاگ، تریس و SLO",
        lessons: [
          {
            en: "Three Pillars: Prometheus Metrics, Structured Logging & Distributed Tracing",
            fa: "سه ستون مشاهده‌پذیری: متریک، لاگ و تریس",
          },
          {
            en: "GPU Observability: DCGM-Exporter, VRAM Saturation & Token Throughput",
            fa: "مشاهده‌پذیری GPU: متریک‌های DCGM و داشبوردها",
          },
          {
            en: "OpenTelemetry: Unified Instrumentation, Context Propagation & Backends",
            fa: "OpenTelemetry: ابزارسازی یکپارچه و انتشار زمینه",
          },
          {
            en: "SLI/SLO/SLA Definition, Error Budgets & Alerting Strategies",
            fa: "تعریف شاخص‌ها و اهداف سطح سرویس و بودجه خطا",
          },
          {
            en: "Grafana Dashboards, Alertmanager & Incident Response Playbooks",
            fa: "داشبورد گرافانا و دستورالعمل پاسخ به حادثه",
          },
        ],
      },
      {
        id: "8.3",
        title: "Production Hardening: Load Testing, Chaos Engineering & DR",
        fa: "استحکام تولید: تست بار، مهندسی آشوب و بازیابی",
        lessons: [
          {
            en: "Load Testing: k6, Locust & GPU Stress Tests",
            fa: "تست بار: ابزارهای تست فشار و تست GPU",
          },
          {
            en: "Chaos Engineering: Node Failure, Network Partition & GPU Fault Injection",
            fa: "مهندسی آشوب: شبیه‌سازی خرابی و تزریق خطا",
          },
          {
            en: "Disaster Recovery, Backup Strategies & Multi-AZ Design",
            fa: "بازیابی فاجعه و طراحی چندمنطقه‌ای",
          },
        ],
      },
      {
        id: "8.4",
        title: "Career Readiness: Portfolio, Interview & Communication",
        fa: "آمادگی شغلی: نمونه‌کار، مصاحبه و ارتباط",
        lessons: [
          {
            en: "Portfolio Presentation: GitHub, Technical Blog & Architecture Diagrams",
            fa: "ارائه نمونه‌کار: گیت‌هاب، بلاگ فنی و دیاگرام معماری",
          },
          {
            en: "System Design Interview Patterns & Behavioral Question Frameworks",
            fa: "الگوهای مصاحبه طراحی سیستم و چارچوب سوالات رفتاری",
          },
        ],
      },
    ],
    projs: [
      {
        id: "P8",
        title: "Security Audit + Observability Stack + Chaos Engineering Test",
        fa: "ممیزی امنیتی + پشته مشاهده‌پذیری + تست آشوب",
        description:
          "تست نفوذ، راه‌اندازی Prometheus/Grafana/OpenTelemetry، تعریف SLO و اجرای سناریوهای آشوب.",
      },
    ],
  },

  /* ════════════════════════════════════════════════════════════
     PHASE 9 — Industrial Capstone: End-to-End AI Platform
     ════════════════════════════════════════════════════════════
     Duration: 6 weeks
     ════════════════════════════════════════════════════════════ */
  {
    id: 9,
    title: "Phase 9: Industrial Capstone — End-to-End Scalable AI Infrastructure",
    fa: "فاز ۹: پروژه جامع صنعتی — پلتفرم مقیاس‌پذیر زیرساخت هوش مصنوعی",
    dur: "6 Weeks",
    col: "amber",
    mods: [
      {
        id: "9.1",
        title: "System Architecture, Ingress & Multi-Tenant Design",
        fa: "معماری سیستم، گیت‌وی و طراحی چندمستأجری",
        lessons: [
          {
            en: "System Specs: Throughput SLAs, Latency Targets & Multi-Tenant Isolation",
            fa: "مشخصات سیستم: اهداف توان، تأخیر و ایزوله‌سازی",
          },
          {
            en: "High-Performance Ingress: gRPC Gateway, Token-Aware LB & Kafka Buffering",
            fa: "گیت‌وی پرسرعت: متعادل‌سازی هوشمند و بافر کافکا",
          },
          {
            en: "Cost Optimization: Spot Instances, Right-Sizing & GPU Utilization Analysis",
            fa: "بهینه‌سازی هزینه: تحلیل اشغال GPU و اندازه‌بندی",
          },
        ],
      },
      {
        id: "9.2",
        title: "Deployment, Testing, Documentation & Presentation",
        fa: "استقرار، تست، مستندسازی و ارائه",
        lessons: [
          {
            en: "K8s GPU Fleet with KEDA, HPA & Rolling Updates",
            fa: "استقرار ناوگان GPU با مقیاس‌پذیری خودکار",
          },
          {
            en: "End-to-End Testing: Integration, Load, Security & Chaos Suite",
            fa: "تست جامع: یکپارچه‌سازی، بار، امنیت و آشوب",
          },
          {
            en: "Architecture Decision Records, Technical Docs & Portfolio Presentation",
            fa: "مستندات معماری و ارائه نمونه‌کار صنعتی",
          },
        ],
      },
    ],
    projs: [
      {
        id: "P9",
        title: "TitanAI: Production-Grade Distributed AI Serving Platform",
        fa: "پلتفرم صنعتی سرو هوش مصنوعی — پروژه جامع نهایی",
        description:
          "گیت‌وی gRPC، کلاستر vLLM روی K8s، بافر کافکا، پایگاه برداری برای RAG، مانیتورینگ کامل، تست آشوب و مستندات معماری.",
      },
    ],
  },
];
