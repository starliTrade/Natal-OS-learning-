import { Phase } from "../types";

export const DEFAULT_CURRICULUM: Phase[] = [
  {
    id: 0,
    title: "Phase 0: Computing Foundations, Microarchitecture & Learning Engineering",
    fa: "فاز ۰: مهندسی یادگیری، مبانی دیجیتال، معماری سخت‌افزار و ریاضیات محاسباتی",
    dur: "4 Weeks",
    col: "cyan",
    mods: [
      {
        id: "0.1",
        title: "Learning Science & Cognitive Architecture",
        fa: "مکانیک مغز، علوم شناختی و یادگیری عمیق",
        lessons: [
          { en: "Memory Consolidation, Synaptic Plasticity & Long-Term Storage", fa: "تثبیت حافظه، شکل‌پذیری سیناپسی و انتقال به حافظه بلندمدت" },
          { en: "Active Recall vs Passive Illusion of Competence", fa: "یادآوری فعال در برابر توهم خواندن منفعل" },
          { en: "SuperMemo SM-2 Spaced Repetition Mechanics", fa: "مکانیک الگوریتم تکرار فاصله‌دار SuperMemo SM-2" },
          { en: "The Feynman Technique: Intuitive First-Principles Synthesis", fa: "تکنیک فاینمن: تفهیم شهودی از اصول اولیه بدون اصطلاحات پیچیده" },
          { en: "Cognitive Load Theory: Intrinsic, Extraneous & Germane Load", fa: "نظریه بار شناختی: تفکیک بارهای شناختی و پیشگیری از خستگی ذهن" },
        ],
      },
      {
        id: "0.2",
        title: "Digital Logic, Bits & The Von Neumann Machine",
        fa: "الفبای دیجیتال، منطق بولی و معماری فون نویمان",
        lessons: [
          { en: "Bits, Bytes, Hexadecimal & Two's Complement Integer Representation", fa: "بیت، بایت، مبنای ۱۶ و نمایش اعداد صحیح با متمم دو" },
          { en: "Boolean Algebra, Logic Gates (AND, OR, NOT, XOR) & Truth Tables", fa: "جبر بولی، گیت‌های منطقی و جداول درستی" },
          { en: "Floating-Point Representation (IEEE 754: FP32, FP16, BF16 & FP8)", fa: "نمایش اعداد اعشاری و استانداردهای عددی در هوش مصنوعی (BF16 و FP8)" },
          { en: "The Von Neumann Architecture: CPU, Control Unit, ALU & Memory Bus", fa: "معماری فون نویمان: چرخه واکشی-دیکود-اجرا و گذرگاه داده" },
        ],
      },
      {
        id: "0.3",
        title: "Hardware Hierarchy: CPU, GPU & The Memory Wall",
        fa: "معماری سخت‌افزار: پردازنده، کارت گرافیک و هرم حافظه",
        lessons: [
          { en: "The Memory Hierarchy: Registers, L1/L2/L3 Cache & Cache Line Alignment", fa: "هرم حافظه: رجیسترها، سطوح کَش L1/L2/L3 و پدیده Cache Locality" },
          { en: "RAM (DDR5 vs LPDDR) & The Von Neumann Memory Bottleneck", fa: "رم و تنگنای پهنای باند فون نویمان در سیستم‌های مدرن" },
          { en: "CPU vs GPU Architecture: Latency-Optimized vs Throughput-Optimized", fa: "تفاوت بنیادین معماری CPU و GPU: بهینه‌سازی تأخیر در برابر پهنای‌باند" },
          { en: "SIMD, SIMT & Tensor Cores / Matrix Engines", fa: "موازی‌سازی برداری: SIMD، مدل اجرای SIMT در GPU و هسته‌های تنسوری" },
          { en: "High Bandwidth Memory (HBM3/HBM3e) in AI Accelerators", fa: "حافظه‌های فوق پرسرعت HBM در شتاب‌دهنده‌های هوش مصنوعی" },
        ],
      },
      {
        id: "0.4",
        title: "Essential Mathematics for AI & Computing Systems",
        fa: "ریاضیات کاربردی برای سیستم‌های کامپیوتری و هوش مصنوعی",
        lessons: [
          { en: "Vectors, Vector Spaces, Dot Products & Cosine Similarity", fa: "بردارها، ضرب داخلی و شباهت کسینوسی در فضاهای برداری" },
          { en: "Matrices, Matrix Multiplication (GEMM) & Linear Transformations", fa: "ماتریس‌ها، ضرب ماتریسی (GEMM) و تبدیلات خطی" },
          { en: "Partial Derivatives, Gradients & Computational Optimization", fa: "مشتقات جزئی، گرادیان و بهینه‌سازی محاسباتی" },
          { en: "Probability Distributions, Bayes' Rule & Information Entropy", fa: "توزیع‌های احتمال، قضیه بیز و آنتروپی اطلاعات" },
        ],
      },
    ],
    projs: [
      {
        id: "P0",
        title: "CPU/Memory Emulator & Cache-Miss Visualizer",
        fa: "پروژه ساخت شبیه‌ساز ساده پردازنده و مانیتورینگ خطای کَش",
        description: "شبیه‌سازی یک مینی‌پردازنده با رجیسترها، حافظه رم کوچک و مصورسازی هزینه دسترسی کَش در برابر رم.",
      },
    ],
  },
  {
    id: 1,
    title: "Phase 1: Linux Operating System, Kernel & Systems Programming in C",
    fa: "فاز ۱: سیستم‌عامل لینوکس، ترمینال POSIX و برنامه‌نویسی سطح سیستم با C",
    dur: "6 Weeks",
    col: "indigo",
    mods: [
      {
        id: "1.1",
        title: "Linux Shell, Filesystem & POSIX Mastery",
        fa: "محیط خط فرمان لینوکس، ساختار فایل‌سیستم و ابزارهای POSIX",
        lessons: [
          { en: "Linux Terminal Mastery: Bash Navigation, Coreutils & Permissions (chmod/chown)", fa: "تسلط بر ترمینال لینوکس: ناوبری، دسترسی‌ها و دستورات اصلی" },
          { en: "Standard Streams (stdin, stdout, stderr), Redirections & Pipelines", fa: "جریان‌های استاندارد ورودی/خروجی، لوله‌ها (Pipes) و ریدایرکت" },
          { en: "Process Monitoring & Resource Control: ps, top, htop, kill & Signals", fa: "پایش فرآیندها و مدیریت منابع سیستم با ابزارهای شل و سیگنال‌ها" },
          { en: "The Linux Filesystem Hierarchy (VFS, /proc, /sys, /dev)", fa: "سلسله‌مراتب فایل‌سیستم لینوکس و نقش حیاتی proc و sys" },
        ],
      },
      {
        id: "1.2",
        title: "C Fundamentals & The Native Memory Model",
        fa: "مبانی زبان C و مدل حافظه ماشین",
        lessons: [
          { en: "C Compilation Pipeline: Preprocessor, Compiler, Assembler & Linker", fa: "پایپ‌لاین کامپایل در C: پیش‌پردازنده، کامپایلر، اسمبلر و لینکر" },
          { en: "Types, Variables, Operators, Scopes & The Call Stack", fa: "انواع داده، متغیرها، پشته فراخوانی (Call Stack) و فریم توابع" },
          { en: "Pointers Decoded: Memory Addresses, Dereferencing & Pointer Arithmetic", fa: "رمزگشایی اشاره‌گرها: آدرس‌های حافظه، دی‌ریفرنس و محاسبات پوینتر" },
          { en: "Arrays, Strings (Null-Terminated) & Pointer Equivalence", fa: "آرایه‌ها، رشته‌ها در C و ارتباط مستقیم آرایه با اشاره‌گر" },
        ],
      },
      {
        id: "1.3",
        title: "Dynamic Memory Management & Low-Level Pitfalls",
        fa: "مدیریت حافظه پویا (Heap) و تله‌های سطح پایین",
        lessons: [
          { en: "The Heap: malloc(), free(), calloc(), realloc() & brk/sbrk", fa: "حافظه هیپ: تخصیص پویا، آزادسازی و نحوه گسترش فضای آدرس با brk" },
          { en: "Memory Corruptions: Leaks, Use-After-Free, Double-Free & Buffer Overflows", fa: "خطاهای نابودگر حافظه: نشت حافظه، دسترسی به حافظه آزادشده و سرریز بافر" },
          { en: "Sanitizers & Diagnostics: Valgrind, AddressSanitizer (ASan) & GDB Debugging", fa: "ابزارهای عیب‌یابی و ردگیری خطاهای حافظه با Valgrind و GDB" },
          { en: "Structs, Unions, Bitfields & Hardware Alignment / Structure Padding", fa: "ساختارها، اتحادیه‌ها، فیلدهای بیتی و تراز سخت‌افزاری بایت‌ها" },
        ],
      },
      {
        id: "1.4",
        title: "Linux Kernel Internals & System Calls",
        fa: "درون‌مایه هسته لینوکس و فراخوانی‌های سیستمی (Syscalls)",
        lessons: [
          { en: "User Mode vs Kernel Mode: Context Switching & The Trap/Syscall Gate", fa: "حالت کاربر در برابر هسته: تغییر زمینه و گیت فراخوانی سیستمی" },
          { en: "Process Lifecycle: fork(), execve(), waitpid() & Process Control Blocks (PCB)", fa: "چرخه حیات فرآیند: ایجاد با fork، جایگزینی با execve و بلوک PCB" },
          { en: "POSIX Threads (pthreads): Creation, Mutexes, Condition Variables & Deadlocks", fa: "ریسمان‌های POSIX: ایجاد، قفل‌های Mutex، متغیرهای شرطی و بن‌بست" },
          { en: "Modern I/O Mechanics: File Descriptors, Non-blocking I/O & epoll", fa: "مکانیک I/O مدرن: فایل‌دیسکریپتورها، I/O غیرمسدودکننده و رویدادهای epoll" },
        ],
      },
    ],
    projs: [
      {
        id: "P1",
        title: "Custom Memory Allocator & Unix Process Shell",
        fa: "پیاده‌سازی مینی ملوک (Custom malloc/free) و یک شل یونیکس اختصاصی",
        description: "پیاده‌سازی الگوریتم Free-List برای تخصیص و آزادسازی حافظه به همراه ساخت یک خط‌فرمان لینوکس با قابلیت پشتیبانی از پایپ و مدیریت فرآیندها.",
      },
    ],
  },
  {
    id: 2,
    title: "Phase 2: High-Performance Data Structures & Algorithms (DSA)",
    fa: "فاز ۲: ساختمان داده‌ها و الگوریتم‌های با کارایی بالا در سیستم‌ها",
    dur: "6 Weeks",
    col: "emerald",
    mods: [
      {
        id: "2.1",
        title: "Asymptotic Complexity & Cache-Conscious Structures",
        fa: "تحلیل پیچیدگی محاسباتی و ساختارهای همسو با کَش",
        lessons: [
          { en: "Asymptotic Notation: Big-O, Big-Omega, Theta & Real-World Latency", fa: "تحلیل مجانبی: کران‌های بالا و پایین در برابر تأخیر واقعی سخت‌افزار" },
          { en: "Dynamic Arrays vs Linked Lists: The Cache-Locality Paradigm Shift", fa: "آرایه پویا در برابر لیست پیوندی: برتری قاطع حافظه پنهان بر دسترسی اشاره‌گری" },
          { en: "Ring Buffers (Circular Arrays) & Lock-Free SPSC Queues", fa: "بافرهای حلقوی و صف‌های بدون قفل برای انتقال بلادرنگ داده‌ها" },
          { en: "Stacks & Queues in System Internals & Memory Pools", fa: "کاربرد پشته و صف در مدیریت منابع و استخرهای حافظه" },
        ],
      },
      {
        id: "2.2",
        title: "Hash Tables, Collisions & Fast Key-Value Systems",
        fa: "جداول هش پیشرفته، حل برخورد و سیستم‌های کلید-مقدار",
        lessons: [
          { en: "Hash Functions (MurmurHash, xxHash, CityHash) & Uniform Distribution", fa: "توابع هش مدرن، توزیع یکنواخت و ویژگی‌های سرعت بالا" },
          { en: "Collision Resolution: Chaining vs Open Addressing & Robin Hood Hashing", fa: "روش‌های حل برخورد: زنجیره‌سازی در برابر آدرس‌دهی باز و هش رابین هود" },
          { en: "Amortized Resizing, Load Factors & Memory Overhead", fa: "تغییر اندازه استهلاکی، ضریب بار و کنترل سربار حافظه در هش‌مپ" },
        ],
      },
      {
        id: "2.3",
        title: "Trees, Heaps & Database Storage Engines",
        fa: "درخت‌ها، هپ‌ها و ساختارهای موتورهای ذخیره‌سازی داده",
        lessons: [
          { en: "Binary Search Trees (BST) & Self-Balancing Red-Black Trees", fa: "درخت‌های جستجوی دودویی و درخت‌های خودمتوازن Red-Black" },
          { en: "Binary Heaps & Priority Queues in Task / Packet Schedulers", fa: "هپ دودویی و صف‌های اولویت‌دار در زمان‌بندی بسته‌ها و پردازش‌ها" },
          { en: "B-Trees & B+ Trees: Disk/Memory-Block Optimized Storage Hierarchy", fa: "درخت‌های B و B+ Tree: ساختار استاندارد پایگاه‌های داده و فایل‌سیستم‌ها" },
          { en: "LSM-Trees (Log-Structured Merge-Trees) in Modern High-Throughput DBs", fa: "ساختار LSM-Tree در پایگاه‌های داده با نرخ نوشتن فوق‌العاده بالا" },
        ],
      },
      {
        id: "2.4",
        title: "Graphs, DAGs & Dynamic Optimization",
        fa: "گراف‌ها، گراف‌های مستقیم بدون دور (DAG) و بهینه‌سازی پویا",
        lessons: [
          { en: "Graph Representation: Adjacency Matrix vs Adjacency List", fa: "نمایش گراف: ماتریس مجاورت در برابر لیست مجاورت و ارزیابی مصرف حافظه" },
          { en: "Graph Traversals (BFS, DFS) & Shortest Path (Dijkstra, A*)", fa: "پیمایش‌های عرضی و عمقی و الگوریتم‌های کوتاه‌ترین مسیر" },
          { en: "Directed Acyclic Graphs (DAGs) & Topological Sorting in Task Pipelines", fa: "گراف‌های جهت‌دار بدون دور (DAG) و مرتب‌سازی توپولوژیک در اجرای پایپ‌لاین‌ها" },
          { en: "Dynamic Programming: Memoization vs Tabulation & Resource Allocation", fa: "برنامه‌نویسی پویا: تفاوت مموایز و جدول‌بندی در بهینه‌سازی تخصیص منابع" },
        ],
      },
    ],
    projs: [
      {
        id: "P2",
        title: "High-Throughput In-Memory B+ Tree Key-Value Store",
        fa: "پیاده‌سازی یک دیتابیس کلید-مقدار در حافظه بر پایه B+ Tree",
        description: "طراحی موتور ذخیره‌سازی ایندکس‌شده با کمترین میزان Cache Miss و قابلیت جستجو و درج با زمان O(log N).",
      },
    ],
  },
  {
    id: 3,
    title: "Phase 3: Deep Python, CPython Internals & AI Tensor Mechanics",
    fa: "فاز ۳: پایتون عمیق، معماری داخلی CPython و مکانیک تنسورها در هوش مصنوعی",
    dur: "4 Weeks",
    col: "amber",
    mods: [
      {
        id: "3.1",
        title: "Python Data Model & CPython Internals",
        fa: "مدل اشیاء پایتون و سازوکار درونی مفسر CPython",
        lessons: [
          { en: "The Python Object Model: Everything is a PyObject (Types, Mutability, Identity)", fa: "مدل اشیاء پایتون: ساختار PyObject در حافظه، تغییرپذیری و هویت" },
          { en: "CPython Memory Management: Reference Counting & Cyclic Garbage Collector", fa: "مدیریت حافظه در CPython: شمارش مراجع و کالکتور چرخه‌ای" },
          { en: "The Global Interpreter Lock (GIL): Architecture, Multi-core Limits & Free-Threaded Python", fa: "قفل سراسری مفسر (GIL): معماری، محدودیت‌های چندهسته‌ای و آینده بدون GIL" },
          { en: "Dunder Methods, Metaclasses & Dynamic Attribute Resolution (__getattr__/__setattr__)", fa: "متدهای جادویی (Dunder)، متاساختمان‌ها و رفتارهای پویا در پایتون" },
        ],
      },
      {
        id: "3.2",
        title: "High-Performance Concurrency: AsyncIO & Multiprocessing",
        fa: "همزمانی پرسرعت در پایتون: AsyncIO و چندپردازشی",
        lessons: [
          { en: "Generators, Yield, Coroutines & Custom Iterators", fa: "جنراتورها، کلمه کلیدی yield، کوروتین‌ها و پروتکل تکرار" },
          { en: "AsyncIO Deep Dive: The Event Loop, Tasks, Futures & Non-Blocking Sockets", fa: "غوطه‌وری در AsyncIO: حلقه رویداد، تسک‌ها، فیوچرها و سوکت‌های غیرمسدودکننده" },
          { en: "I/O-Bound vs CPU-Bound: ThreadPoolExecutor vs ProcessPoolExecutor & IPC", fa: "بارهای I/O-Bound در برابر CPU-Bound: تفکیک نخ و فرآیند و ارتباطات بین‌فرآیندی" },
        ],
      },
      {
        id: "3.3",
        title: "C-Extensions, PyO3 & NumPy/PyTorch Tensor Internals",
        fa: "اکستنشن‌های C، بایندینگ Rust با PyO3 و مکانیک تنسورها",
        lessons: [
          { en: "Building C-Extensions for Python: C-API, ctypes & CFFI", fa: "توسعه اکستنشن‌های C برای پایتون: تعامل با لایه‌های پایین و C-API" },
          { en: "Python-Rust Interoperability with PyO3: Zero-Overhead Python Bindings", fa: "پل ارتباطی پایتون و Rust با PyO3: اجرای کدهای سریع با واسط پایتون" },
          { en: "NumPy Strides & Memory Layout: C-Contiguous vs Fortran Arrays", fa: "چیدمان حافظه در آرایه‌ها: پیوستگی بایت‌ها، استرایدها و اسلایس‌های بدون کپی" },
          { en: "PyTorch Tensor Mechanics: Storage, Strides, Autograd & GPU Device Allocation", fa: "درون‌مایه تنسورهای PyTorch: ساختار ذخیره‌سازی، گراف محاسباتی و تخصیص GPU" },
        ],
      },
    ],
    projs: [
      {
        id: "P3",
        title: "Async Micro-Framework with Rust-Accelerated Core",
        fa: "طراحی یک مینی فریم‌ورک سرور وب ناهمگام با هسته شتاب‌یافته در Rust",
        description: "توسعه یک موتور پردازش وب ناهمگام بر پایه AsyncIO که پردازش پارس کردن درخواست‌ها را از طریق PyO3 به Rust واگذار می‌کند.",
      },
    ],
  },
  {
    id: 4,
    title: "Phase 4: Modern Systems Programming with Rust (Safe, Fearless & Fast)",
    fa: "فاز ۴: برنامه‌نویسی سیستمی ایمن، فوق‌سریع و مدرن با زبان Rust",
    dur: "6 Weeks",
    col: "rose",
    mods: [
      {
        id: "4.1",
        title: "The Rust Paradigm & Memory Safety Without GC",
        fa: "پارادایم Rust و امنیت حافظه بدون زباله‌روب (Garbage Collector)",
        lessons: [
          { en: "Rust Philosophy: Zero-Cost Abstractions, Tooling (Cargo) & Strict Static Types", fa: "فلسفه زبان Rust: انتزاع با هزینه صفر، ابزار مدیریت Cargo و نوع‌دهی ایستا" },
          { en: "Enums, Pattern Matching & Exhaustive Error Handling with Result and Option", fa: "شمارنده‌ها (Enums)، تطبیق الگو و مدیریت قطعی خطاها با Result و Option" },
          { en: "The Ownership Model: Move Semantics, Resource Acquisition (RAII) & Drops", fa: "مدل انقلابی مالکیت (Ownership): انتقال مالکیت و الگوی مدیریت خودکار منابع (RAII)" },
          { en: "Borrowing & The Borrow Checker: Shared References (&T) vs Mutable References (&mut T)", fa: "امانت‌گیری (Borrowing) و اعتبارسنجی کامپایلر: قوانین مراجع اشتراکی و تغییرپذیر" },
          { en: "Lifetimes Explained: Lifetime Annotations ('a), Static Lifetime & Elision Rules", fa: "طول عمرها (Lifetimes): اعلان طول عمر، تضمین عدم وجود پوینتر معلق و قوانین حذف" },
        ],
      },
      {
        id: "4.2",
        title: "Traits, Generics & Smart Pointers",
        fa: "سیستم Traitها، برنامه‌نویسی جنریک و نشانگرهای هوشمند",
        lessons: [
          { en: "Traits as Interfaces: Dynamic Dispatch (dyn Trait) vs Static Dispatch (Monomorphization)", fa: "تریت‌ها به عنوان رابط: مقایسه دیسپچ پویا با دیسپچ ایستا در زمان کامپایل" },
          { en: "Smart Pointers: Box<T>, Rc<T>, Arc<T> & The Shared-Ownership Paradigm", fa: "نشانگرهای هوشمند: پوینتر Box، شمارنده مراجع تک‌ریسه‌ای (Rc) و چندریسه‌ای (Arc)" },
          { en: "Interior Mutability: RefCell<T>, Cell<T>, Mutex<T> & RwLock<T>", fa: "تغییرپذیری درونی: اصلاح داده‌ها در پشت مراجع تغییرناپذیر با تضمین ایمنی" },
        ],
      },
      {
        id: "4.3",
        title: "Fearless Concurrency, Tokio & Unsafe Rust",
        fa: "همزمانی بدون ترس، ران‌تایم Tokio و کدهای ناایمن (Unsafe)",
        lessons: [
          { en: "Fearless Concurrency: Send & Sync Traits, Threads & Message Passing (mpsc)", fa: "همزمانی بدون ترس: نقش تریت‌های Send و Sync و تبادل پیام با کانال‌ها" },
          { en: "Async Rust & The Tokio Runtime: Non-blocking Futures, Tasks & Select!", fa: "برنامه‌نویسی ناهمگام با Rust و ران‌تایم Tokio: فیوچرها و مالتی‌پلسینگ رویدادها" },
          { en: "Unsafe Rust & FFI: Raw Pointers, Memory Transmutation & Calling C Libraries", fa: "بخش ناایمن Rust و FFI: اشاره‌گرهای خام، تغییر تبدیل حافظه و تعامل مستقیم با C" },
        ],
      },
    ],
    projs: [
      {
        id: "P4",
        title: "High-Speed Concurrent BPE Tokenizer Engine in Rust",
        fa: "ساخت موتور توکنایزر BPE چندریسه‌ای فوق‌سریع در زبان Rust",
        description: "پیاده‌سازی یک کتابخانه شبیه HuggingFace Tokenizers برای قطعه‌بندی متون با استفاده از تریت‌های همزمانی و ران‌تایم موازی Rayon.",
      },
    ],
  },
  {
    id: 5,
    title: "Phase 5: High-Speed Networks, Distributed Systems & Event Streaming",
    fa: "فاز ۵: شبکه‌های پیشرفته، سیستم‌های توزیع‌شده و پردازش رویدادمحور",
    dur: "5 Weeks",
    col: "sky",
    mods: [
      {
        id: "5.1",
        title: "The Modern Network Stack: TCP/IP, HTTP/3 & RDMA",
        fa: "پشته شبکه مدرن: پروتکل‌های انتقال، HTTP/3 و شبکه‌های RDMA",
        lessons: [
          { en: "OSI & TCP/IP: The Lifecycle of a Packet from Application to Wire", fa: "لایه‌های شبکه: مسیر حرکت یک بسته داده از لایه کاربرد تا کارت شبکه" },
          { en: "Deep TCP: Three-Way Handshake, Flow Control, Congestion Algorithms (BBR) & Bufferbloat", fa: "کالبدشکافی TCP: دست‌تکانی، الگوریتم‌های مدرن کنترل ازدحام (BBR) و سربار تأخیر" },
          { en: "Evolution of Web Transport: HTTP/1.1 vs HTTP/2 Multiplexing vs HTTP/3 (QUIC)", fa: "سیر تحول وب: مالتی‌پلکسینگ در HTTP/2 و مهاجرت به HTTP/3 بر پایه QUIC بدون HOL Blocking" },
          { en: "Ultra-Low Latency Cluster Networks: RDMA (Remote Direct Memory Access) & RoCE", fa: "شبکه‌های با تأخیر نزدیک به صفر: مکانیزم RDMA و RoCE در خوشه‌های ابری هوش مصنوعی" },
        ],
      },
      {
        id: "5.2",
        title: "Distributed Systems Architecture & Consensus",
        fa: "معماری سیستم‌های توزیع‌شده و پروتکل‌های اجماع",
        lessons: [
          { en: "The CAP Theorem, PACELC, Fallacies of Distributed Computing & Split-Brain Scenarios", fa: "قضایای CAP و PACELC: خطاهای رایج سیستم‌های توزیع‌شده و سناریوی Split-Brain" },
          { en: "Time, Clocks & Ordering: Physical Time, NTP Drifts, Lamport Timestamps & Vector Clocks", fa: "مفهوم زمان و نظم رویدادها: عدم قطعیت ساعت‌های فیزیکی و ساعت‌های منطقی برداری" },
          { en: "Remote Procedure Calls: gRPC, Protocol Buffers & Binary Wire Serialization", fa: "فراخوانی از راه دور (RPC): معماری gRPC و سریال‌سازی دودویی پرسرعت با پروتوباف" },
          { en: "Consensus Protocols: Raft in Detail (Leader Election, Log Replication & Heartbeats)", fa: "پروتکل‌های اجماع: جزئیات الگوریتم Raft، انتخاب لیدر و تکرار امن لاگ‌ها" },
        ],
      },
      {
        id: "5.3",
        title: "Event-Driven Architecture & Distributed Streaming with Kafka",
        fa: "معماری رویدادمحور و صف‌های پیام مقیاس‌پذیر با Apache Kafka",
        lessons: [
          { en: "Message Queues vs Distributed Commit Logs: Point-to-Point vs Publish-Subscribe", fa: "مقایسه صف‌های سنتی پیام با لاگ‌های توزیع‌شده: رویکرد انتشار-اشتراک" },
          { en: "Apache Kafka Architecture: Brokers, Topics, Partitions & Offset Commitments", fa: "معماری داخلی آپاچی کافکا: بروکرها، تاپیک‌ها، پارتیشن‌بندی و مدیریت آفست‌ها" },
          { en: "Producer Acknowledgments (acks=all), Consumer Groups & Rebalancing Protocols", fa: "تضمین‌های تحویل پیام در کافکا، گروه‌های مصرف‌کننده و پروتکل‌های Rebalance" },
        ],
      },
    ],
    projs: [
      {
        id: "P5",
        title: "Fault-Tolerant Distributed Key-Value Cluster with Raft & gRPC",
        fa: "ساخت کلاستر پایگاه داده توزیع‌شده مقاوم در برابر خرابی با الگوریتم Raft و gRPC",
        description: "پیاده‌سازی یک کلاستر سه نودی با امکان تحمل خرابی یک نود، همگام‌سازی لاگ‌ها و پاسخ‌گویی به کلاینت‌ها از طریق پروتکل gRPC.",
      },
    ],
  },
  {
    id: 6,
    title: "Phase 6: Cloud-Native Platform, Container Internals & Kubernetes GPU Orchestration",
    fa: "فاز ۶: زیرساخت ابری، کانتینرسازی در هسته سیستم و ارکستراسیون GPU با کوبرنتیز",
    dur: "5 Weeks",
    col: "teal",
    mods: [
      {
        id: "6.1",
        title: "Container Internals: Linux Namespaces & Cgroups v2",
        fa: "درون‌مایه کانتینرها: فضاهای نام لینوکس (Namespaces) و گروه‌های کنترل (Cgroups)",
        lessons: [
          { en: "Containers from Scratch: Linux Namespaces (PID, Mount, Net, IPC, UTS, User)", fa: "کانتینر از اصول اولیه: جداسازی فرآیندها با ۶ فضای نام بنیادین هسته لینوکس" },
          { en: "Resource Isolation with Cgroups v2: Limiting Memory, CPU & I/O Throttling", fa: "ایزوله‌سازی منابع با Cgroups v2: کنترل دقیق سقف رم، پردازنده و مهار مصرف دیسک" },
          { en: "Layered Filesystems: UnionFS, OverlayFS & Efficient Docker Image Storage", fa: "سیستم‌فایل‌های لایه‌ای: ساختار OverlayFS و نحوه ذخیره‌سازی بهینه لایه‌های ایمیج" },
          { en: "Building Lean Production Dockerfiles: Multi-Stage Builds & Distroless Images", fa: "ساخت داکرفایل‌های بهینه و امن: بیلدهای چندمرحله‌ای و ایمیج‌های مینیمال Distroless" },
          { en: "NVIDIA Container Toolkit (nvidia-docker): GPU Passthrough & Driver Runtimes", fa: "ارتباط کانتینر با سخت‌افزار GPU: ابزار NVIDIA Container Toolkit و درایورهای مربوطه" },
        ],
      },
      {
        id: "6.2",
        title: "Kubernetes Architecture & Platform Engineering",
        fa: "معماری کلاستر کوبرنتیز و مهندسی پلتفرم ابری",
        lessons: [
          { en: "Kubernetes Control Plane: API Server, etcd, Kube-Scheduler & Controller Manager", fa: "معماری کنترل‌پلین کوبرنتیز: نقش سرور API، دیتابیس etcd، زمان‌بند و کنترلرها" },
          { en: "Worker Node Mechanics: Kubelet, Container Runtime Interface (CRI) & Kube-Proxy", fa: "سازوکار نودهای کاری: کوبلت، رابط زمان اجرای کانتینرها و شبکه‌بندی Kube-Proxy" },
          { en: "Declarative Workloads: Pods, Deployments, StatefulSets & DaemonSets", fa: "مدیریت اعلانی بارها در K8s: تفاوت پادها، دیپلویمنت‌ها و استیت‌فول‌ست‌ها" },
          { en: "Cluster Networking: CNI Plugins, ClusterIP, NodePort, Ingress & Service Meshes", fa: "شبکه‌بندی کلاستر: پلاگین‌های CNI، سرویس‌ها، کنترلرهای Ingress و سرویس‌مش" },
        ],
      },
      {
        id: "6.3",
        title: "GPU Scheduling, Custom Operators & Observability",
        fa: "زمان‌بندی کارت‌های گرافیک در K8s، اپراتورهای سفارشی و مانیتورینگ",
        lessons: [
          { en: "NVIDIA GPU Operator & Kubernetes GPU Scheduling (Tolerations, NodeAffinity & MIG)", fa: "اپراتور انویدیا در کوبرنتیز: تخصیص کارت‌های گرافیک، زمان‌بندی و فناوری چندتکه‌سازی MIG" },
          { en: "Custom Resource Definitions (CRDs) & The Kubernetes Operator Pattern", fa: "تعریف منابع سفارشی (CRDs) و الگوی اپراتورها برای اتوماسیون وظایف پیچیده" },
          { en: "Observability Pipeline: Prometheus Metrics Scraping, DCGM-Exporter & Grafana Dashboards", fa: "خط لوله مشاهده‌پذیری: جمع‌آوری متریک‌های پردازنده و GPU با DCGM و نمایش در Grafana" },
        ],
      },
    ],
    projs: [
      {
        id: "P6",
        title: "Automated Multi-Node Kubernetes Cluster with GPU Passthrough & Monitoring",
        fa: "راه‌اندازی کلاستر کوبرنتیز چند نودی مجهز به شتاب‌دهنده سخت‌افزاری و داشبورد مانیتورینگ",
        description: "پیکربندی یک محیط ابری مبتنی بر K8s همراه با استقرار خودکار سرویس‌ها، نظارت بر متریک‌های مصرف حافظه GPU و سیاست‌های مقیاس‌پذیری خودکار (HPA).",
      },
    ],
  },
  {
    id: 7,
    title: "Phase 7: AI Infrastructure, Large Model Serving & Industrial MLOps (vLLM, Triton, Ray)",
    fa: "فاز ۷: مهندسی زیرساخت هوش مصنوعی، سرو مدل‌های بزرگ و MLOps صنعتی",
    dur: "6 Weeks",
    col: "purple",
    mods: [
      {
        id: "7.1",
        title: "LLM Inference Architecture, KV-Cache & PagedAttention",
        fa: "معماری استنتاج مدل‌های زبانی، کش کلید-مقدار (KV-Cache) و الگوریتم PagedAttention",
        lessons: [
          { en: "The Transformer Decoder Execution: Prefill Phase vs Autoregressive Decode Phase", fa: "چرخه اجرای مدل‌های زبانی: فاز پیش‌پُرکردن (Prefill) در برابر تولید افزایشی توکن‌ها (Decode)" },
          { en: "The KV-Cache Memory Crisis: Calculating VRAM Consumption across Sequence Lengths", fa: "بحران حافظه KV-Cache: محاسبه دقیق مصرف حافظه کارت گرافیک در طول کانتکست‌های بزرگ" },
          { en: "PagedAttention Revealed: Virtual Memory Paging Applied to GPU Attention Buffers", fa: "کالبدشکافی الگوریتم PagedAttention: حل مشکل تکه‌تکه‌شدن حافظه کارت گرافیک بر پایه حافظه مجازی" },
          { en: "Continuous / In-Flight Batching vs Static Batching: Maximizing GPU Tensor Utilization", fa: "دسته‌بندی پویا و پیوسته درخواست‌ها در برابر روش ایستا برای بیشینه‌سازی اشغال پردازنده گرافیکی" },
          { en: "Model Quantization Mechanics: AWQ, GPTQ, GGUF & Numerical Precisions (FP8, INT4)", fa: "مکانیک کوانتیزاسیون وزن‌ها: تکنیک‌های AWQ و GPTQ و مقایسه فرمت‌های عددی FP8 و INT4" },
        ],
      },
      {
        id: "7.2",
        title: "Ultra-Fast Inference Engines: vLLM & NVIDIA Triton Server",
        fa: "موتورهای استنتاج فوق‌سریع: فریم‌ورک‌های vLLM و Triton Inference Server",
        lessons: [
          { en: "vLLM Engine Internals: Architecture, OpenAI-Compatible API Server & AsyncLLMEngine", fa: "معماری داخلی موتور vLLM: بررسی لایه‌های کلاینت، سرور سازگار با OpenAI و AsyncLLMEngine" },
          { en: "Distributed Model Parallelism: Tensor Parallelism (TP) vs Pipeline Parallelism (PP) with Megatron/NCCL", fa: "موازی‌سازی توزیع‌شده مدل: موازی‌سازی تنسوری (TP) در برابر خط‌لوله‌ای (PP) با کتابخانه NCCL" },
          { en: "NVIDIA Triton Inference Server: Dynamic Batching, Concurrent Model Execution & Ensembles", fa: "سرور استنتاج Triton انویدیا: دسته‌بندی داینامیک، اجرای همزمان چند مدل و پایپ‌لاین‌های ترکیبی" },
          { en: "Inference Benchmarking Metrics: Time-to-First-Token (TTFT), Inter-Token Latency (ITL) & QPS", fa: "شاخص‌های کلیدی کارایی: زمان تا تولید اولین توکن (TTFT)، تأخیر بین توکن‌ها و توان تولید در ثانیه" },
        ],
      },
      {
        id: "7.3",
        title: "Distributed Compute with Ray (Core & Ray Serve)",
        fa: "رایانش و ارکستراسیون خوشه‌ای توزیع‌شده با Ray Core و Ray Serve",
        lessons: [
          { en: "Ray Core Architecture: Tasks, Actors, Object Store (Plasma) & Global Control Store (GCS)", fa: "معماری بنیادین Ray: تسک‌ها، اکتورها، حافظه اشیاء اشتراکی Plasma و کنترل‌پلین GCS" },
          { en: "Ray Serve for Model Serving: Dynamic Routing, Replicas, Scaling Policies & Fractional GPUs", fa: "فریم‌ورک Ray Serve: مسیریابی هوشمند، تکثیر رپلیکاها، سیاست‌های مقیاس‌پذیری و اشتراک درصدی GPU" },
          { en: "Building Resilient AI Pipelines: Error Handling, Graceful Degradation & Streaming Responses", fa: "ساخت پایپ‌لاین‌های پایدار هوش مصنوعی: مدیریت شکست‌ها، بازگشت امن و استریم بلادرنگ پاسخ‌ها" },
        ],
      },
      {
        id: "7.4",
        title: "Vector Databases & Enterprise-Grade RAG Pipelines",
        fa: "پایگاه‌های داده برداری و خطوط لوله RAG صنعتی در مقیاس بالا",
        lessons: [
          { en: "Vector Embeddings, High-Dimensional Spaces & Distance Metrics (L2, Dot, Cosine)", fa: "امبدینگ‌های برداری، فضاهای چندبعدی و معیارهای اندازه‌گیری فاصله و شباهت" },
          { en: "Approximate Nearest Neighbor (ANN) Indexing: HNSW (Hierarchical Navigable Small World) & IVFPQ", fa: "ایندکس‌های جستجوی تقریبی سریع: ساختار HNSW و فشرده‌سازی برداری IVFPQ" },
          { en: "Vector Database Architectures: Qdrant, Milvus & pgvector in Production", fa: "معماری پایگاه‌داده‌های برداری صنعتی: مقایسه کیودرانت، میلووس و افزونه pgvector" },
          { en: "Production RAG Architecture: Chunking Strategies, Reranking Models & Semantic Caching", fa: "معماری خط لوله RAG تجاری: استراتژی‌های تقطیع متن، مدل‌های بازرتبه‌بندی (Reranker) و کش معنایی" },
        ],
      },
    ],
    projs: [
      {
        id: "P7",
        title: "High-Throughput Distributed LLM Serving Cluster with vLLM & Ray Serve",
        fa: "راه‌اندازی کلاستر توزیع‌شده استنتاج مدل‌های زبانی با موتور vLLM و Ray Serve",
        description: "پیاده‌سازی یک درگاه کامل سرو مدل زبانی با قابلیت موازی‌سازی تنسوری (TP)، کوانتیزاسیون FP8، ارکستراسیون Ray Serve و آزمون سنجش تأخیر و توان تولید توکن تحت بار ترافیکی شدید.",
      },
    ],
  },
  {
    id: 8,
    title: "Phase 8: Industrial Capstone: End-to-End Scalable AI Infrastructure Platform",
    fa: "فاز ۸: پروژه جامع پایانی: پلتفرم صنعتی زیرساخت استنتاج، کش معنایی و پردازش توزیع‌شده هوش مصنوعی",
    dur: "6 Weeks",
    col: "amber",
    mods: [
      {
        id: "8.1",
        title: "System Architecture & High-Availability Ingress",
        fa: "معماری جامع سیستم، گیت‌وی ورودی با دسترس‌پذیری بالا و صف‌بندی",
        lessons: [
          { en: "End-to-End System Specifications: Throughput, Latency SLAs & Multi-Tenant Isolation", fa: "مشخصات جامع فنی: قراردادهای SLA تأخیر، مقیاس‌پذیری و ایزوله‌سازی چندمستأجری" },
          { en: "High-Performance Ingress: gRPC / HTTP Reverse Proxy with Token-Aware Load Balancing", fa: "طراحی گیت‌وی ورودی: پروکسی معکوس پرسرعت با متعادل‌سازی بار هوشمند بر اساس ظرفیت KV-Cache" },
          { en: "Asynchronous Request Buffering with Kafka Queue & Priority Queues for VIP Workloads", fa: "بافر کردن ناهمگام ترافیک با صف کافکا و مدیریت اولویت درخواست‌های دارای اولویت" },
        ],
      },
      {
        id: "8.2",
        title: "Cluster Deployment, Observability & Production Hardening",
        fa: "استقرار کلاستر، مشاهده‌پذیری جامع و آزمون‌های سنجش تاب‌آوری (Chaos Engineering)",
        lessons: [
          { en: "Kubernetes GPU Fleet Deployment with KEDA (Kubernetes Event-driven Autoscaling)", fa: "استقرار نودهای GPU در کوبرنتیز با قابلیت مقیاس‌پذیری خودکار رویدادمحور با KEDA" },
          { en: "Full-Stack Observability: GPU VRAM Saturation, Token Throughput & Distributed Tracing", fa: "مانیتورینگ جامع لایه‌ای: پایش اشباع حافظه GPU، توان خروجی توکن‌ها و تریسینگ توزیع‌شده" },
          { en: "Load Testing, Benchmark Profiling & Chaos Engineering Resiliency Tests", fa: "آزمون استرس زیر بار سنگین، بنچمارک استاندارد و تست‌های تاب‌آوری در مواجهه با قطعی سخت‌افزار" },
        ],
      },
    ],
    projs: [
      {
        id: "P8",
        title: "The Industrial AI Infrastructure Platform (TitanAI)",
        fa: "پروژه جامع پایانی: پلتفرم مقیاس‌پذیر سرویس‌دهی مدل‌های هوش مصنوعی با تأخیر میکروثانیه",
        description: "پروژه جامع نهایی شامل پیاده‌سازی گیت‌وی ورودی gRPC، مدیریت کلاستر vLLM روی کوبرنتیز، بافر پیام کافکا، پایگاه برداری Qdrant برای RAG و داشبورد زنده Grafana.",
      },
    ],
  },
];
