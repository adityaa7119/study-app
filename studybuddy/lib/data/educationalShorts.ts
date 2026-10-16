// lib/data/educationalShorts.ts
import type { EducationalShort } from "@/lib/types/shorts";

export const EDUCATIONAL_SHORTS: EducationalShort[] = [
  // =========================================================================
  // 1. COMPUTER SCIENCE & ALGORITHMS (Spanning Tree)
  // =========================================================================
  {
    id: "short-dijkstra-cs",
    title: "How Dijkstra's Algorithm Finds the Shortest Path in Graphs",
    subject: "Computer Science",
    creator: {
      name: "Spanning Tree",
      handle: "@SpanningTree",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      verified: true,
      subscribers: "480K",
    },
    summary:
      "Dijkstra's algorithm greedily expands the frontier node with minimum provisional distance, ensuring optimal pathfinding in non-negative weighted networks.",
    formula: "dist[v] = min(dist[v], dist[u] + weight(u, v))",
    conceptExplanation:
      "Starting at the source with distance 0 and all other nodes at ∞, a min-priority queue (binary or Fibonacci heap) extracts the closest unvisited node u. The algorithm relaxes all outgoing edges (u, v): if the path through u is shorter than the current distance to v, dist[v] is updated. Once a node is visited with non-negative weights, its distance is mathematically guaranteed to be optimal.",
    youtubeId: "EFg3u_E6eHU",
    duration: "4:32",
    likes: 24800,
    views: "520K",
    saves: 8900,
    tags: ["#Algorithms", "#ComputerScience", "#Dijkstra", "#GraphTheory"],
    quickQuiz: {
      question: "Why does standard Dijkstra's algorithm fail when a graph contains negative edge weights?",
      options: [
        "It crashes the priority queue with division by zero",
        "A previously finalized node's distance could be reduced further, violating the greedy invariant",
        "It can only run on undirected trees",
        "Graph adjacency lists cannot store negative numbers",
      ],
      correctIndex: 1,
      explanation:
        "Dijkstra assumes that adding an edge only increases (or preserves) path length. Negative edges violate this greedy assumption; Bellman-Ford must be used instead.",
      rewardCredits: 10,
    },
    comments: [
      {
        id: "c1",
        user: "Rohan Patel (CS Year 2)",
        avatar: "R",
        time: "1 hour ago",
        text: "The Min-Heap priority queue optimization reduces time complexity from O(V²) down to O((V + E) log V). Essential for semester exams!",
        likes: 198,
      },
      {
        id: "c2",
        user: "Sarah Chen (Data Systems)",
        avatar: "S",
        time: "4 hours ago",
        text: "Google Maps and OSPF network routers fundamentally use variants of Dijkstra with A* heuristics.",
        likes: 112,
      },
    ],
  },

  // =========================================================================
  // 2. MATHEMATICS & CALCULUS (3Blue1Brown)
  // =========================================================================
  {
    id: "short-essence-calculus",
    title: "The Essence of Calculus: Geometric Rates of Change & Integration",
    subject: "Mathematics",
    creator: {
      name: "Grant Sanderson",
      handle: "@3blue1brown",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
      verified: true,
      subscribers: "6.2M",
    },
    summary:
      "Derivatives calculate instantaneous rates of change; integrals accumulate area. The Fundamental Theorem links them as inverse operations.",
    formula: "d/dx ∫[a to x] f(t) dt = f(x)",
    conceptExplanation:
      "Calculus simplifies complex continuous curves by breaking them into infinitely many tiny, simple linear approximations (dx). Finding the derivative is finding the slope of the secant line as dx approaches zero. Conversely, integration sums infinite slivers of height f(x) and width dx. The Fundamental Theorem of Calculus proves that differentiation and integration invert each other.",
    youtubeId: "WUvTyaaNkzM",
    duration: "17:04",
    likes: 89400,
    views: "2.8M",
    saves: 34100,
    tags: ["#Calculus", "#Mathematics", "#3Blue1Brown", "#Integration"],
    quickQuiz: {
      question: "According to the Fundamental Theorem of Calculus, what is the derivative of the area function A(x) = ∫[a to x] f(t) dt?",
      options: [
        "A'(x) = f'(x)",
        "A'(x) = f(x)",
        "A'(x) = 1 / f(x)",
        "A'(x) = f(x)²",
      ],
      correctIndex: 1,
      explanation:
        "The rate at which accumulated area increases as x nudges forward by dx is precisely the current height of the curve, f(x).",
      rewardCredits: 10,
    },
    comments: [
      {
        id: "c3",
        user: "Aditi Joshi (First Year Engineering)",
        avatar: "A",
        time: "2 hours ago",
        text: "Grant's circle area proof via unrolling rings into a triangle changed how I see math forever: Area = 1/2 * base * height = 1/2 * (2πr) * r = πr²!",
        likes: 340,
      },
    ],
  },

  // =========================================================================
  // 3. ARTIFICIAL INTELLIGENCE & DEEP LEARNING (3Blue1Brown)
  // =========================================================================
  {
    id: "short-gradient-descent",
    title: "Gradient Descent: How Neural Networks Actually Learn",
    subject: "Computer Science",
    creator: {
      name: "3Blue1Brown AI",
      handle: "@3blue1brown",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
      verified: true,
      subscribers: "6.2M",
    },
    summary:
      "A neural network is a high-dimensional function. Gradient descent slides down the cost landscape toward optimal weights.",
    formula: "W_{t+1} = W_t - η ∇C(W)",
    conceptExplanation:
      "The Cost function C(W) measures how inaccurate the network's predictions are compared to ground truth. The gradient ∇C is a vector of partial derivatives pointing in the direction of steepest ascent on the multidimensional cost surface. By subtracting the gradient scaled by the learning rate η, we step in the direction of steepest descent, minimizing training error.",
    youtubeId: "IHZwWFHWa-w",
    duration: "21:00",
    likes: 120500,
    views: "3.4M",
    saves: 42000,
    tags: ["#DeepLearning", "#AI", "#NeuralNetworks", "#GradientDescent"],
    quickQuiz: {
      question: "What does the negative gradient -∇C(W) represent in neural network parameter optimization?",
      options: [
        "The direction of maximum prediction variance",
        "The direction of steepest descent to minimize cost/loss",
        "The regularization penalty on bias weights",
        "The learning rate schedule",
      ],
      correctIndex: 1,
      explanation:
        "The gradient points uphill toward maximum cost increase; therefore, stepping in the negative gradient direction achieves steepest descent toward minimal loss.",
      rewardCredits: 10,
    },
    comments: [
      {
        id: "c4",
        user: "Kavya Nair (AI Year 3)",
        avatar: "K",
        time: "3 hours ago",
        text: "Watch this before studying backpropagation in your Deep Learning course. Visualizing the cost landscape makes the chain rule intuitive.",
        likes: 215,
      },
    ],
  },

  // =========================================================================
  // 4. PHYSICS & ELECTROMAGNETISM (Veritasium)
  // =========================================================================
  {
    id: "short-electricity-fields",
    title: "The Biggest Misconception About How Electricity and Circuits Work",
    subject: "Physics",
    creator: {
      name: "Derek Muller",
      handle: "@Veritasium",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      verified: true,
      subscribers: "15.4M",
    },
    summary:
      "Energy in an electric circuit does not travel inside the copper wires—it flows through electromagnetic fields in the surrounding space.",
    formula: "S = (1 / μ₀) * (E × B)  (Poynting Energy Flux Vector)",
    conceptExplanation:
      "Electrons inside wires drift at less than a millimeter per second. Electrical energy is actually transmitted through the electromagnetic fields surrounding the wires, governed by the Poynting vector S = (E × B)/μ₀. The wires act merely as conduits that guide the electromagnetic wave across the electric field between battery and load.",
    youtubeId: "bHIhgxav9LY",
    duration: "13:30",
    likes: 310000,
    views: "8.9M",
    saves: 65400,
    tags: ["#Physics", "#Electricity", "#Veritasium", "#Electromagnetism"],
    quickQuiz: {
      question: "Where does electrical energy predominantly flow from a battery to a light bulb in a DC circuit?",
      options: [
        "Inside the copper wire via high-speed electron collisions",
        "Through the electromagnetic fields in the space outside the wires (Poynting vector)",
        "Within the chemical electrolyte of the battery",
        "Along the outer thermal insulation sheath",
      ],
      correctIndex: 1,
      explanation:
        "Poynting's Theorem dictates that electromagnetic power flow is directed by E × B through the dielectric field space, not through electron kinetic collisions.",
      rewardCredits: 10,
    },
    comments: [
      {
        id: "c5",
        user: "Prof. S. Sengupta (EE Faculty)",
        avatar: "P",
        time: "5 hours ago",
        text: "Every electrical engineering student should see this. Maxwell's equations and Poynting vectors explain what Ohm's law simply approximates.",
        likes: 420,
      },
    ],
  },

  // =========================================================================
  // 5. LINEAR ALGEBRA & VECTORS (3Blue1Brown)
  // =========================================================================
  {
    id: "short-linear-algebra-vectors",
    title: "Vectors: What Are They Really? (Essence of Linear Algebra)",
    subject: "Mathematics",
    creator: {
      name: "3Blue1Brown",
      handle: "@3blue1brown",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
      verified: true,
      subscribers: "6.2M",
    },
    summary:
      "Physics views vectors as arrows; computer science sees lists of numbers. Linear algebra unifies them through linear combinations.",
    formula: "v = c₁ î + c₂ ĵ  (Linear Combinations & Basis)",
    conceptExplanation:
      "A vector is an element of a vector space that can be scaled and added. In 2D, standard basis vectors î = [1, 0] and ĵ = [0, 1] span the entire plane. Any coordinate [x, y] is simply a recipe: stretch î by x, stretch ĵ by y, and add them together.",
    youtubeId: "fNk_zzaMoSs",
    duration: "9:52",
    likes: 145000,
    views: "4.1M",
    saves: 48000,
    tags: ["#LinearAlgebra", "#Math", "#Vectors", "#3Blue1Brown"],
    quickQuiz: {
      question: "In linear algebra, what does the 'span' of a set of vectors mean?",
      options: [
        "The maximum length among all vectors",
        "The set of all possible linear combinations that can be reached by scaling and adding them",
        "The determinant of the square coordinate matrix",
        "The dot product between the first two vectors",
      ],
      correctIndex: 1,
      explanation:
        "The span of vectors {v₁, v₂, ...} is the subspace containing all linear combinations c₁v₁ + c₂v₂ + ...",
      rewardCredits: 10,
    },
    comments: [
      {
        id: "c6",
        user: "Kunal M. (Data Science Year 1)",
        avatar: "K",
        time: "6 hours ago",
        text: "Linear algebra became my favorite subject after this series. Essential for embeddings in Large Language Models!",
        likes: 180,
      },
    ],
  },

  // =========================================================================
  // 6. BIOLOGY & MEDICINE: CANCER DEFENSE (Kurzgesagt)
  // =========================================================================
  {
    id: "short-peto-paradox",
    title: "Why Huge Blue Whales Don't Get Cancer: Peto's Paradox",
    subject: "Biology & Medical",
    creator: {
      name: "Kurzgesagt – In a Nutshell",
      handle: "@Kurzgesagt",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      verified: true,
      subscribers: "22.4M",
    },
    summary:
      "A blue whale has 1,000 times more cells than a human, yet rarely develops cancer. Discover how evolution engineered hyper-tumors and TP53 tumor suppression.",
    formula: "P(tumor) ∝ N_cells × Time × Mutation Rate",
    conceptExplanation:
      "Statistically, organisms with more cells and longer lifespans should develop cancer exponentially faster. But Peto's Paradox reveals that large mammals evolved redundant tumor suppressor genes (like dozens of copies of the TP53 'guardian of the genome' gene) and 'hypertumors'—tumors that parasitize other tumors before they can grow lethally large.",
    youtubeId: "1AElONvi9WQ",
    duration: "10:04",
    likes: 380000,
    views: "11.2M",
    saves: 52000,
    tags: ["#Biology", "#Kurzgesagt", "#Medicine", "#Science"],
    quickQuiz: {
      question: "What evolutionary adaptation explains why massive animals like elephants and whales resist cancer despite trillions more cell divisions?",
      options: [
        "Their cells never undergo mitosis",
        "Multiple redundant copies of tumor suppressor genes like TP53 and lower metabolic rates",
        "Their bloodstream lacks oxygen",
        "They have identical DNA across all tissues",
      ],
      correctIndex: 1,
      explanation:
        "Elephants have 20 copies of the TP53 tumor suppressor gene (humans have just 1 copy), allowing aggressive apoptosis of DNA-damaged cells.",
      rewardCredits: 10,
    },
    comments: [
      {
        id: "c7",
        user: "Dr. Alisha Roy (Biochem)",
        avatar: "A",
        time: "1 day ago",
        text: "The concept of hypertumors—where a mutated subclone starves the original tumor of angiogenesis—is fascinating oncology research.",
        likes: 290,
      },
    ],
  },

  // =========================================================================
  // 7. ROBOTICS & MECHANICAL DYNAMICS (ETH Zürich)
  // =========================================================================
  {
    id: "short-cubli-robotics",
    title: "The Cubli: How Reaction Wheels and Angular Momentum Defy Falling",
    subject: "Physics",
    creator: {
      name: "ETH Zürich Robotics",
      handle: "@ETHZurich",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
      verified: true,
      subscribers: "320K",
    },
    summary:
      "A 15cm cube balances on a corner and jumps using high-speed internal reaction wheels that brake suddenly to transfer angular momentum.",
    formula: "τ = dL / dt = I * α  (Rotational Torque Equation)",
    conceptExplanation:
      "The Cubli contains three orthogonal reaction wheels driven by brushless DC motors spinning at up to 6,000 RPM. When a wheel is abruptly braked, conservation of angular momentum transfers massive rotational torque to the cube frame, allowing it to jump up from a flat surface and balance autonomously on a sharp corner using PID feedback control.",
    youtubeId: "n_6p-1J551Y",
    duration: "2:45",
    likes: 190000,
    views: "14.5M",
    saves: 41000,
    tags: ["#Robotics", "#Mechanical", "#AngularMomentum", "#ControlSystems"],
    quickQuiz: {
      question: "What physical principle allows satellites and the Cubli robot to change orientation or balance without external thrusters?",
      options: [
        "Conservation of Angular Momentum via internal reaction wheels",
        "Gravitational wave absorption",
        "Aerodynamic surface lift",
        "Electrostatic repulsion with the Earth's crust",
      ],
      correctIndex: 0,
      explanation:
        "Accelerating or braking an internal spinning flywheel creates an equal and opposite torque on the host body due to conservation of angular momentum.",
      rewardCredits: 10,
    },
    comments: [
      {
        id: "c8",
        user: "Tanya Sharma (Mech Eng SE)",
        avatar: "T",
        time: "1 day ago",
        text: "Space telescopes like Hubble and James Webb use the exact same reaction wheel dynamics to aim at distant galaxies with arcsecond precision!",
        likes: 175,
      },
    ],
  },

  // =========================================================================
  // 8. STUDY TECHNIQUES & COGNITIVE SCIENCE (Prof. Marty Lobdell)
  // =========================================================================
  {
    id: "short-study-smart",
    title: "Study Less, Study Smart: Spaced Intervals & The Chunking Technique",
    subject: "Study Hacks",
    creator: {
      name: "Prof. Marty Lobdell",
      handle: "@PierceCollege",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
      verified: true,
      subscribers: "1.2M",
    },
    summary:
      "Studying for 6 hours straight produces rapid diminishing returns. Master 25-minute focused sprints, active recall, and teaching concepts to peers.",
    formula: "Retention Rate = f(Active Recall, Spaced Interleaving)",
    conceptExplanation:
      "Human working memory degrades sharply after 25-30 minutes of continuous focus. Taking a 5-minute break resets attentional focus. Crucially, passive rereading yields mere 'recognition' rather than 'retrieval' capability. To cement concepts into long-term memory, summarize notes with closed books and teach the concept in plain English to someone else.",
    youtubeId: "IlU-zDU6aQ0",
    duration: "59:55",
    likes: 410000,
    views: "15.8M",
    saves: 72000,
    tags: ["#StudyHacks", "#CognitiveScience", "#ActiveRecall", "#Productivity"],
    quickQuiz: {
      question: "Why is active recall (e.g. testing yourself with flashcards) vastly superior to passive rereading of textbooks?",
      options: [
        "Rereading causes irreversible neural fatigue",
        "Active retrieval forces the brain to rebuild neural pathways, strengthening synaptic consolidation",
        "Highlighting text erases cognitive bias",
        "Flashcards reduce the need for REM sleep",
      ],
      correctIndex: 1,
      explanation:
        "The 'Testing Effect' in cognitive psychology proves that actively retrieving information from memory creates resilient retrieval pathways.",
      rewardCredits: 10,
    },
    comments: [
      {
        id: "c9",
        user: "Vikram Sengupta (Year 3)",
        avatar: "V",
        time: "1 day ago",
        text: "Implementing 25-minute Pomodoro bursts with active recall raised my semester GPA from 6.8 to 8.9. Absolute gold advice.",
        likes: 540,
      },
    ],
  },
];
