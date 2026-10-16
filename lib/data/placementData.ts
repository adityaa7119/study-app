// lib/data/placementData.ts
import type { CompanyPlacementProfile, InterviewQuestion } from "@/lib/types/placement";

export const COMPANY_PROFILES: CompanyPlacementProfile[] = [
  {
    id: "google",
    name: "Google",
    logoText: "G",
    badgeColor: "bg-blue-600/10 text-blue-700 border-blue-200",
    tier: "Product / FAANG",
    role: "Software Engineer (L3 / University Grad)",
    ctcPackage: "₹38 - 55 LPA (Base + Stock Units)",
    cgpaCutoff: 8.0,
    eligibleBranches: ["CSE", "IT", "ECE", "Mathematics & Computing", "AI & DS"],
    rounds: [
      {
        roundNumber: 1,
        title: "Online Assessment (OA)",
        description: "2 LeetCode Medium/Hard algorithmic problems on HackerEarth/Google platform (90 mins).",
        focusAreas: ["Graphs (BFS/DFS, Dijkstra)", "Dynamic Programming", "Tries & Trees"],
      },
      {
        roundNumber: 2,
        title: "Technical Round 1 (Data Structures)",
        description: "45-minute live coding session on Google Docs without syntax highlighting or compiler.",
        focusAreas: ["Graph cycle detection", "Binary Search on answers", "Time/Space Big-O rigor"],
      },
      {
        roundNumber: 3,
        title: "Technical Round 2 (Algorithms & Scale)",
        description: "45-minute deep problem-solving with follow-up constraints and scalability edge cases.",
        focusAreas: ["Sliding window", "Monotonic stacks", "Modular clean code"],
      },
      {
        roundNumber: 4,
        title: "Googliness & Leadership (HR)",
        description: "Behavioral interview testing ethical dilemmas, ambiguity, bias for action, and teamwork.",
        focusAreas: ["STAR method answers", "Handling failure & feedback", "Intellectual humility"],
      },
    ],
    keySkills: ["C++ / Java / Python", "Data Structures & Algorithms", "Time Complexity Analysis", "Clean Code"],
    selectionRate: "1.8%",
    interviewTips: [
      "Never code silently: think out loud and state your brute-force approach first before optimizing.",
      "Google interviewers evaluate your edge-case anticipation (null inputs, duplicate elements, integer overflow).",
      "Do not memorize code; focus on invariant conditions and clean variable naming.",
    ],
  },
  {
    id: "microsoft",
    name: "Microsoft",
    logoText: "MS",
    badgeColor: "bg-emerald-600/10 text-emerald-700 border-emerald-200",
    tier: "Product / FAANG",
    role: "Software Development Engineer (SDE-1)",
    ctcPackage: "₹42 - 50 LPA",
    cgpaCutoff: 7.5,
    eligibleBranches: ["CSE", "IT", "ECE", "EE", "Data Science"],
    rounds: [
      {
        roundNumber: 1,
        title: "Codility OA",
        description: "3 coding questions + debugging / multiple-choice CS fundamentals (100 mins).",
        focusAreas: ["Arrays & HashMaps", "Tree Traversals", "String Parsing"],
      },
      {
        roundNumber: 2,
        title: "Technical Round 1",
        description: "Core DSA problem + discussion on OS concepts (threads vs processes, virtual memory).",
        focusAreas: ["Linked lists", "Binary Search Trees", "Operating System Kernels"],
      },
      {
        roundNumber: 3,
        title: "Technical Round 2 (System & Design)",
        description: "Low-Level Design (LLD) or Object-Oriented Design (e.g. Parking Lot, LRU Cache) + Projects.",
        focusAreas: ["OOP Principles", "Design Patterns", "Database Indexing & Normalization"],
      },
      {
        roundNumber: 4,
        title: "AA (As Appropriate) / Director Round",
        description: "Final techno-behavioral round evaluating growth mindset and cultural alignment.",
        focusAreas: ["Culture fit", "Growth Mindset", "Past engineering challenges"],
      },
    ],
    keySkills: ["C# / C++ / Java", "Low-Level Design (LLD)", "Operating Systems", "Algorithms"],
    selectionRate: "3.2%",
    interviewTips: [
      "Microsoft loves Low-Level Design (LLD); know Factory, Singleton, and Strategy design patterns inside out.",
      "Be prepared to explain every single project on your resume down to the database schema level.",
    ],
  },
  {
    id: "amazon",
    name: "Amazon",
    logoText: "AZ",
    badgeColor: "bg-amber-600/10 text-amber-700 border-amber-200",
    tier: "Product / FAANG",
    role: "Software Development Engineer (SDE-1)",
    ctcPackage: "₹32 - 44 LPA",
    cgpaCutoff: 7.0,
    eligibleBranches: ["CSE", "IT", "ECE", "EE", "Mech", "All Engineering"],
    rounds: [
      {
        roundNumber: 1,
        title: "Online Assessment (Hackerrank)",
        description: "2 algorithmic problems (70 mins) + Work Styles Assessment (Leadership Principles, 20 mins).",
        focusAreas: ["Priority Queues", "DP & Recursion", "16 Amazon Leadership Principles"],
      },
      {
        roundNumber: 2,
        title: "Technical Interview 1",
        description: "20 mins Leadership Principles + 40 mins Live DSA problem solving.",
        focusAreas: ["Customer Obsession", "Hash Tables", "Graph Shortest Path"],
      },
      {
        roundNumber: 3,
        title: "Technical Interview 2",
        description: "Tree / Heap algorithms + deep dive into concurrency and threading.",
        focusAreas: ["Deliver Results", "Binary Heap", "Concurrency & Deadlocks"],
      },
      {
        roundNumber: 4,
        title: "Bar Raiser Round",
        description: "Independent interviewer testing cross-functional standards, scalability, and ownership.",
        focusAreas: ["Have Backbone; Disagree & Commit", "Edge Case Testing", "STAR format stories"],
      },
    ],
    keySkills: ["Java / C++", "16 Leadership Principles (LPs)", "Heaps & Greedy", "System Architecture"],
    selectionRate: "4.1%",
    interviewTips: [
      "50% of the evaluation is Amazon's Leadership Principles. Prepare 2 STAR stories for each LP.",
      "Never say 'we did this' without specifying 'my exact role was...'. Individual accountability is paramount.",
    ],
  },
  {
    id: "barclays",
    name: "Barclays",
    logoText: "BAR",
    badgeColor: "bg-cyan-600/10 text-cyan-700 border-cyan-200",
    tier: "Fintech & Banking",
    role: "Graduate Analyst (Technology & Quantitative Dev)",
    ctcPackage: "₹14 - 18 LPA",
    cgpaCutoff: 7.0,
    eligibleBranches: ["CSE", "IT", "ECE", "EE", "Mathematics"],
    rounds: [
      {
        roundNumber: 1,
        title: "Cognitive Assessment & Coding OA",
        description: "2 coding questions, banking business situational judgment tests, and verbal reasoning.",
        focusAreas: ["Arrays & Strings", "SQL Queries", "Situational Judgment (SJT)"],
      },
      {
        roundNumber: 2,
        title: "Technical Interview",
        description: "Deep dive into DBMS ACID properties, SQL Joins, REST APIs, and core OOP.",
        focusAreas: ["SQL Window functions", "ACID transactions", "Multi-threading & Locks"],
      },
      {
        roundNumber: 3,
        title: "Values & Competency Round",
        description: "Barclays RISCES values (Respect, Integrity, Service, Excellence, Stewardship).",
        focusAreas: ["Financial compliance ethics", "Team collaboration", "Long-term client trust"],
      },
    ],
    keySkills: ["SQL & RDBMS", "Java / Spring Boot", "OOP Concepts", "Microservices & Cloud"],
    selectionRate: "6.5%",
    interviewTips: [
      "Master SQL: Indexing, Transactions, Isolation Levels, and complex group-by having queries.",
      "Understand how high-throughput banking systems ensure zero data loss during network partitions.",
    ],
  },
  {
    id: "goldman-sachs",
    name: "Goldman Sachs",
    logoText: "GS",
    badgeColor: "bg-indigo-600/10 text-indigo-700 border-indigo-200",
    tier: "Fintech & Banking",
    role: "Analyst - Engineering & Quantitative Strategy",
    ctcPackage: "₹24 - 36 LPA",
    cgpaCutoff: 7.5,
    eligibleBranches: ["CSE", "IT", "ECE", "Mathematics & Computing", "EE"],
    rounds: [
      {
        roundNumber: 1,
        title: "Aptitude + Math + Coding OA (HackerRank)",
        description: "Advanced math (Probability, Permutations), 2 Coding challenges, and CS fundamentals.",
        focusAreas: ["Conditional Probability", "Dynamic Programming", "Bit Manipulation"],
      },
      {
        roundNumber: 2,
        title: "Technical Round 1 (Math & Code)",
        description: "Brainteasers, probability puzzles, and algorithmic problem with optimal memory overhead.",
        focusAreas: ["Bayes Theorem", "Pointers & Arrays", "System memory alignment"],
      },
      {
        roundNumber: 3,
        title: "Technical Round 2 (Systems & Projects)",
        description: "Low-latency system discussions, multi-threading, caches, and garbage collection.",
        focusAreas: ["L1/L2/L3 cache misses", "Socket programming", "Database internals"],
      },
      {
        roundNumber: 4,
        title: "Partner / Leadership Round",
        description: "Motivation to work in investment banking technology, stress test scenario questions.",
        focusAreas: ["Financial domain awareness", "Resilience under pressure"],
      },
    ],
    keySkills: ["C++ / Java", "Probability & Combinatorics", "Operating Systems & Networking", "Data Structures"],
    selectionRate: "2.5%",
    interviewTips: [
      "Review math puzzles: 25 horses 5 tracks, Monty Hall problem, pirate coin distribution.",
      "In code, prefer space-efficient solutions ($O(1)$ auxiliary space) as low-latency systems value memory cache lines.",
    ],
  },
  {
    id: "qualcomm",
    name: "Qualcomm",
    logoText: "QC",
    badgeColor: "bg-red-600/10 text-red-700 border-red-200",
    tier: "Core Engineering",
    role: "Associate Engineer (Embedded Systems & Firmware)",
    ctcPackage: "₹18 - 26 LPA",
    cgpaCutoff: 7.5,
    eligibleBranches: ["ECE", "EE", "CSE", "Instrumentation"],
    rounds: [
      {
        roundNumber: 1,
        title: "Technical OA (TestGorilla / HackerEarth)",
        description: "Embedded C pointers, digital electronics, bitwise operations, and Linux commands.",
        focusAreas: ["Bitwise manipulations", "C pointers & volatile keywords", "Static timing analysis"],
      },
      {
        roundNumber: 2,
        title: "Technical Interview 1 (C & Microcontrollers)",
        description: "Hardware register programming, ISR (Interrupt Service Routines), UART/SPI/I2C protocols.",
        focusAreas: ["Interrupt latency", "Memory-mapped I/O", "RTOS scheduling"],
      },
      {
        roundNumber: 3,
        title: "Technical Interview 2 (Computer Architecture)",
        description: "Pipelining hazards, cache coherence, virtual memory, and ARM assembly basics.",
        focusAreas: ["Branch prediction", "RISC vs CISC", "DMA controllers"],
      },
      {
        roundNumber: 4,
        title: "HR & Managerial",
        description: "Project walkthrough, career aspirations in semiconductor and wireless communications.",
        focusAreas: ["Hardware debugging patience", "Wireless 5G curiosity"],
      },
    ],
    keySkills: ["Embedded C / C++", "Microprocessor Architecture", "RTOS", "Linux Device Drivers", "Digital Logic"],
    selectionRate: "4.5%",
    interviewTips: [
      "Know C keywords in depth: `volatile`, `static`, `register`, `const volatile int * const ptr`.",
      "Be ready to write a custom memory allocator `malloc`/`free` or circular ring buffer from scratch on a whiteboard.",
    ],
  },
  {
    id: "tcs-digital",
    name: "TCS Digital / Prime",
    logoText: "TCS",
    badgeColor: "bg-purple-600/10 text-purple-700 border-purple-200",
    tier: "IT & Consulting",
    role: "System Engineer / Digital Specialist",
    ctcPackage: "₹7.5 - 11.5 LPA",
    cgpaCutoff: 6.5,
    eligibleBranches: ["All Engineering Branches (CSE, IT, ECE, Mech, Civil, etc.)"],
    rounds: [
      {
        roundNumber: 1,
        title: "TCS National Qualifier Test (NQT)",
        description: "Advanced Quantitative, Verbal, Logical Reasoning + 2 Advanced Coding questions.",
        focusAreas: ["Permutations & Probability", "Dynamic Programming", "String Manipulations"],
      },
      {
        roundNumber: 2,
        title: "Technical Interview",
        description: "Questions on final year capstone project, cloud fundamentals, SDLC, and chosen language.",
        focusAreas: ["OOP concepts", "SQL Joins", "RESTful web services"],
      },
      {
        roundNumber: 3,
        title: "Managerial & HR Interview",
        description: "Relocation flexibility, shift willingness, client communication skills, and teamwork.",
        focusAreas: ["Professional adaptability", "Verbal clarity", "Company awareness"],
      },
    ],
    keySkills: ["Python / Java", "SQL", "Cloud Concepts (AWS/Azure)", "Agile SDLC"],
    selectionRate: "12%",
    interviewTips: [
      "Scoring high on the Advanced Coding section of NQT directly upgrades your offer from Ninja (3.6L) to Digital/Prime (9L+).",
      "Explain your final year project clearly: architecture diagram, tech stack choice justification, and your exact contribution.",
    ],
  },
];

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: "dsa-1",
    title: "Trapping Rain Water",
    company: "Amazon / Google",
    topic: "DSA",
    difficulty: "Hard",
    frequency: "Very High",
    question:
      "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    solutionSummary:
      "Use the Two-Pointer approach. Maintain `left`, `right`, `left_max`, and `right_max`. Move the pointer corresponding to the smaller maximum height towards the center because water trapped is bound by the minimum of the two boundaries.",
    codeSnippet: {
      language: "cpp",
      code: `int trap(vector<int>& height) {
    int left = 0, right = height.size() - 1;
    int left_max = 0, right_max = 0;
    int water = 0;

    while (left < right) {
        if (height[left] < height[right]) {
            if (height[left] >= left_max) left_max = height[left];
            else water += left_max - height[left];
            left++;
        } else {
            if (height[right] >= right_max) right_max = height[right];
            else water += right_max - height[right];
            right--;
        }
    }
    return water;
} // Time: O(N), Space: O(1)`,
    },
    keyTakeaway: "Avoid $O(N)$ extra space DP arrays by taking advantage of the convergent two-pointer technique.",
  },
  {
    id: "dbms-1",
    title: "Explain ACID Properties and Isolation Levels",
    company: "Barclays / Goldman Sachs",
    topic: "DBMS",
    difficulty: "Medium",
    frequency: "Very High",
    question:
      "What are ACID properties in database transactions? Explain Dirty Read, Non-Repeatable Read, Phantom Read and how SQL isolation levels prevent them.",
    solutionSummary:
      "Atomicity (all or nothing), Consistency (preserves invariants), Isolation (concurrent execution yields serializable state), Durability (committed changes survive crashes). Isolation levels: Read Uncommitted, Read Committed (prevents dirty reads), Repeatable Read (prevents non-repeatable reads using snapshot MVCC/locks), Serializable (prevents phantoms).",
    codeSnippet: {
      language: "sql",
      code: `-- Setting transaction isolation level in PostgreSQL
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;

SELECT balance FROM accounts WHERE account_id = 42;
-- In Repeatable Read, any concurrent commit will not change the read snapshot!
UPDATE accounts SET balance = balance - 100 WHERE account_id = 42;

COMMIT;`,
    },
    keyTakeaway:
      "Most modern databases (like PostgreSQL) use MVCC (Multi-Version Concurrency Control) rather than heavy table locks to achieve Repeatable Read.",
  },
  {
    id: "os-1",
    title: "Process vs Thread & Context Switching Overhead",
    company: "Microsoft / Qualcomm",
    topic: "Operating Systems",
    difficulty: "Medium",
    frequency: "High",
    question:
      "Compare processes and threads in terms of memory space, creation cost, communication, and what actually happens in the CPU cache during a context switch.",
    solutionSummary:
      "Processes have independent virtual address spaces (Page Tables, PCB, file descriptors). Threads within the same process share code, data, heap, and files, having only their own stack and register set (TCB). A thread context switch only swaps registers and stack pointer. A process context switch also invalidates TLB (Translation Lookaside Buffer) and flushes CPU cache lines, causing huge memory latency spikes.",
    codeSnippet: {
      language: "c",
      code: `// Linux clone() system call underlies both fork() and pthread_create()
// When CLONE_VM | CLONE_FS | CLONE_FILES is passed, memory is shared (Thread)
// When 0 flags passed, copy-on-write page table is duplicated (Process)
#include <pthread.h>
void* worker(void* arg) {
    // Shares heap and global variables with main thread
    return NULL;
}`,
    },
    keyTakeaway:
      "Process switching is expensive primarily due to TLB invalidation and cache misses, not merely register saving.",
  },
  {
    id: "cn-1",
    title: "What happens when you type 'google.com' in browser?",
    company: "Google / Amazon",
    topic: "Computer Networks",
    difficulty: "Medium",
    frequency: "Very High",
    question:
      "Explain end-to-end network flow from pressing Enter to page rendering: DNS resolution, TCP 3-way handshake, TLS 1.3 key exchange, HTTP GET, and DOM rendering.",
    solutionSummary:
      "1. Browser checks browser cache -> OS cache -> hosts file -> Resolving Name Server -> Root -> TLD (.com) -> Authoritative server (DNS over UDP 53). 2. ARP translates default gateway IP to MAC address. 3. TCP 3-way handshake (SYN, SYN-ACK, ACK). 4. TLS 1.3 handshake (ClientHello + KeyShare -> ServerHello + Finished in 1-RTT). 5. HTTP/2 or HTTP/3 GET request. 6. Server responds with 200 OK HTML. 7. Browser parses DOM tree, CSSOM tree, executes JS, calculates Layout, and paints pixels.",
    keyTakeaway:
      "Interviewers love seeing candidates mention TLS 1.3 (0-RTT / 1-RTT handshake) and HTTP/2 multiplexing rather than obsolete HTTP/1.0 descriptions.",
  },
  {
    id: "sys-1",
    title: "Design a URL Shortener (TinyURL)",
    company: "Microsoft / Amazon",
    topic: "System Design",
    difficulty: "Medium",
    frequency: "High",
    question:
      "Design a scalable service like TinyURL that converts long URLs into 7-character short codes with 100M new URLs per month and low latency redirects.",
    solutionSummary:
      "Calculations: 7 chars in Base62 ($[a-zA-Z0-9]$) yields $62^7 \\approx 3.5$ Trillion unique URLs. Architecture: Web Server -> Distributed ID Generator (Snowflake / Counter in Redis cluster) -> Base62 encoder -> NoSQL Store (Cassandra or DynamoDB for $O(1)$ key lookup). Cache recent 20% URLs in Redis (80/20 Pareto rule). Redirect using HTTP 301 (Permanent, cached by browser) or 302 (Temporary, enables click tracking).",
    keyTakeaway: "Always ask about read-to-write ratio (TinyURL is typically 100:1 read-heavy) to justify caching and read-replicas.",
  },
  {
    id: "apt-1",
    title: "The 25 Horses Puzzle (Find Top 3)",
    company: "Goldman Sachs / Google",
    topic: "Aptitude & Puzzles",
    difficulty: "Medium",
    frequency: "High",
    question:
      "There are 25 horses. You can race 5 horses at a time in one race. You have no stopwatch and can only observe relative order. What is the minimum number of races needed to find the top 3 fastest horses?",
    solutionSummary:
      "Answer is 7 races. Step 1: Divide 25 horses into 5 groups of 5. Race each group (5 races). Label horses in each group by rank: $A_1..A_5, B_1..B_5, C_1..C_5, D_1..D_5, E_1..E_5$. Step 2: Race the 5 group winners ($A_1, B_1, C_1, D_1, E_1$) (Race 6). Assume order is $A_1 > B_1 > C_1 > D_1 > E_1$. $A_1$ is guaranteed fastest. Step 3: Eliminate impossible contenders: $D$ and $E$ groups are out; $C_2, C_3$ are out; $B_3$ is out; $A_4, A_5$ are out. Remaining candidates for 2nd and 3rd are: $A_2, A_3, B_1, B_2, C_1$. Race these 5 horses (Race 7). The top 2 of Race 7 are the 2nd and 3rd overall.",
    keyTakeaway: "Carefully prune elements that cannot mathematically reach the podium to fit the final race into a single 5-horse track.",
  },
];

export const ATS_ROLE_KEYWORDS: Record<
  string,
  {
    roleName: string;
    mustHave: string[];
    goodToHave: string[];
    actionVerbs: string[];
  }
> = {
  swe: {
    roleName: "Software Development Engineer (SDE / SWE)",
    mustHave: [
      "Data Structures",
      "Algorithms",
      "Object-Oriented Programming",
      "Git",
      "Unit Testing",
      "REST APIs",
      "SQL",
      "System Design",
      "CI/CD",
      "Debugging",
    ],
    goodToHave: ["Docker", "Kubernetes", "AWS / GCP", "Microservices", "Redis", "Kafka", "TypeScript", "NoSQL"],
    actionVerbs: ["Architected", "Engineered", "Optimized", "Refactored", "Deployed", "Reduced latency by", "Scaled", "Automated"],
  },
  fullstack: {
    roleName: "Full Stack Web Developer",
    mustHave: [
      "React",
      "Next.js",
      "TypeScript",
      "Node.js",
      "RESTful APIs",
      "CSS / Tailwind",
      "PostgreSQL / MongoDB",
      "State Management",
      "Authentication (JWT/OAuth)",
      "Responsive Design",
    ],
    goodToHave: ["GraphQL", "Serverless", "Docker", "Jest / Cypress", "TailwindCSS", "Prisma", "WebSockets", "Vercel"],
    actionVerbs: ["Developed", "Integrated", "Revamped", "Designed", "Built", "Enhanced user retention by", "Streamlined"],
  },
  datascience: {
    roleName: "Data Scientist / Machine Learning Engineer",
    mustHave: [
      "Python",
      "Pandas",
      "NumPy",
      "Scikit-Learn",
      "SQL",
      "Data Cleaning",
      "Model Evaluation (F1/AUC)",
      "PyTorch / TensorFlow",
      "Feature Engineering",
      "Data Visualization",
    ],
    goodToHave: ["Docker", "MLflow", "FastAPI", "HuggingFace", "BigQuery", "A/B Testing", "NLP / LLMs", "Computer Vision"],
    actionVerbs: ["Trained", "Forecasted", "Analyzed", "Achieved X% accuracy", "Extracted insights", "Engineered features", "Clustered"],
  },
  embedded: {
    roleName: "Embedded Systems / Firmware Engineer",
    mustHave: [
      "Embedded C",
      "C++",
      "Microcontrollers (ARM / STM32 / ESP32)",
      "UART / I2C / SPI",
      "RTOS",
      "Oscilloscope / Logic Analyzer",
      "Interrupts & Timers",
      "Git",
      "Memory Management",
      "Device Drivers",
    ],
    goodToHave: ["FreeRTOS", "Linux Kernel", "CAN Bus", "PCB Layout / Altium", "BLE / Zigbee", "Assembly", "Low-Power Optimization"],
    actionVerbs: ["Programmed", "Configured", "Interfaced", "Reduced power consumption by", "Debugged", "Implemented driver for"],
  },
};
