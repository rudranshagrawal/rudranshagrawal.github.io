// Project case studies. Each project has the same shape so the renderer is dumb
// and the content lives in one editable place.
//
// Tabs are: problem, approach, architecture, result.
// Tags drive the filter chips. Featured projects render as big cards on the
// home page; non-featured render as compact rows below.
//
// Image paths point to /public/projects/<slug>/. Drop screenshots there.

export const PROJECTS = [
  {
    slug: "trana",
    name: "Trana",
    tagline: "Circadian rhythm health app for iOS, Watch & web.",
    role: "Solo build",
    status: "Shipping April 2026",
    tags: ["Health", "iOS"],
    tech: [
      "SwiftUI",
      "SwiftData",
      "HealthKit",
      "WatchKit",
      "Next.js",
      "Cosinor analysis",
    ],
    link: { label: "trana.health", href: "https://trana.health" },
    accent: "#7c3aed",
    images: [
      { src: "/projects/trana/today.png", caption: "Today — your energy curve" },
      { src: "/projects/trana/history.png", caption: "History — score trend" },
      { src: "/projects/trana/insights.png", caption: "Insights — chronotype" },
      { src: "/projects/trana/sleep.png", caption: "Sleep & heart rate" },
    ],
    problem: `Most people have no idea whether their internal clock is healthy. Wearables track HR, steps, and sleep, but none of them tell you whether your 24-hour biological rhythm is well-anchored — and that rhythm is linked in the literature to metabolic disease, mood disorders, cognitive decline, and how well you age. The gap was: there's no consumer surface for circadian health.`,
    approach: `Build the first consumer app that turns Apple Watch data into a personalized circadian fingerprint. Compute a daily score (0–100), detect drift before the user feels it, and explain everything in plain language — no jargon, no judgement, supportive friend tone. Three-part insights: what changed, what you'll feel, one thing to do.`,
    architecture: `iOS + watchOS, all on-device. SwiftUI + SwiftData for the app, WatchKit for complications and background refresh. Algorithms live in a shared Swift Package (TranaCore): cosinor curve fitting, RA/IS/IV non-parametric metrics from the chronobiology literature, and a custom Trana Score that weights stability, timing, and contrast. HealthKit pulls sleep + HR and feeds the model. No backend, no telemetry — health data never leaves the watch. Marketing site ships separately on Next.js + Vercel.`,
    result: `Full UI redesign complete, builds passing, Reddit-tested onboarding ("instinct has a lag"), and an InsightGenerator that produces empathetic alerts instead of clinical ones. Built on six peer-reviewed papers (JMIR 2025, Lancet 2024, npj Digital Medicine 2024, JAHA 2024). App Store submission targeted for end of April 2026.`,
  },

  {
    slug: "heart-of-india",
    name: "Heart of India",
    tagline: "Concept iOS travel app for Madhya Pradesh — built as a demo for the state government.",
    role: "Solo build · Concept demo",
    status: "Pitching to MP government",
    tags: ["iOS"],
    tech: ["SwiftUI", "Supabase", "AI itinerary", "iOS"],
    link: {
      label: "github.com/rudranshagrawal/madhyapradeshtourism",
      href: "https://github.com/rudranshagrawal/madhyapradeshtourism",
    },
    accent: "#0F6E56",
    images: [
      { src: "/projects/heart-of-india/discover.png", caption: "Discover — Sanchi" },
      { src: "/projects/heart-of-india/stays.png", caption: "Stay categories & experiences" },
      { src: "/projects/heart-of-india/plan.png", caption: "AI Trip Planner" },
      { src: "/projects/heart-of-india/book.png", caption: "Book a stay" },
    ],
    problem: `Madhya Pradesh sits on some of the most extraordinary heritage in India — Sanchi, Khajuraho, the tiger reserves of Kanha and Bandhavgarh, palace stays, Narmada riverfronts — and almost none of it shows up in modern travel apps. International OTAs ignore it; domestic ones bury it. I wanted to build a concept app that did justice to the place itself, and pitch it to the state government as a flagship experience.`,
    approach: `Photo-first, restraint-first. Treat the app like a National Geographic feature, not a booking funnel. Let real photographs of MP carry the design, keep UI chrome minimal, use a deep forest-green identity tied to MP's natural heritage, and make the AI trip planner the killer feature — describe your dream trip in one sentence and get a full itinerary back.`,
    architecture: `SwiftUI iOS app with five tabs (Discover, Book, Plan, Trips, Profile). Supabase backend for properties, safaris, and the Mrignayni handicraft catalog. The AI Trip Planner sends a structured prompt (duration, budget, trip style) to an LLM and parses the response into a day-by-day itinerary the user can save and modify. Wildlife lodges, heritage stays, temple towns, and highway retreats are modeled as first-class property categories.`,
    result: `Working five-tab demo: AI itinerary generation, properties seeded, full visual identity. Currently being shown to the Madhya Pradesh government as a pitch — not yet adopted.`,
  },

  {
    slug: "citation-guard",
    name: "Citation Guard",
    tagline: "Multi-agent system that catches hallucinated legal citations.",
    role: "Solo build",
    status: "Working prototype",
    tags: ["AI/Agents"],
    tech: [
      "Python",
      "Multi-agent",
      "Next.js",
      "Clerk",
      "CourtListener API",
      "GovInfo API",
      "Google Scholar",
      "Gemini",
    ],
    accent: "#1f6feb",
    images: [],
    problem: `Lawyers across the U.S. have been sanctioned, fined, and publicly embarrassed for filing briefs full of AI-fabricated case law — citations that look perfectly real but reference cases that don't exist. The legal industry is racing to adopt LLMs and getting burned. There needed to be a tool that stood between a generated brief and a courtroom filing.`,
    approach: `A pipeline of four specialized agents instead of one monolithic LLM call. Each agent has one job, can be tested independently, and can be swapped out. The goal: take any legal document, surface every citation in it, and tell the user which are verified, which are unverifiable, and which are hallucinated.`,
    architecture: `Four agents in sequence. (1) Extractor pulls every citation-shaped string out of the document. (2) Classifier tags each one by type — case law, statute, regulation, journal — and routes it to the right lookup API. (3) Lookup queries CourtListener for federal cases, GovInfo for statutes and CFR sections, and Google Scholar for academic citations. (4) Verifier does semantic matching against the document's claim using Gemini, so a real citation that's been mischaracterized still gets flagged. Output is a structured report (CLI + JSON + Next.js frontend) with green/yellow/red status per citation.`,
    result: `End-to-end pipeline running on PDFs and pasted briefs. Cleanly catches fabricated cases, flags real cases used out of context, and produces both human-readable and JSON output for downstream tooling. Frontend in Next.js with Clerk auth and Stripe wired up for a paid tier.`,
  },

  {
    slug: "orchestrator",
    name: "Multi-Agent Orchestrator",
    tagline: "Turns a single intent into running code, live.",
    role: "Solo build · JetBrains × OpenAI Hackathon (Apr 2026)",
    status: "Deployed",
    tags: ["AI/Agents"],
    tech: [
      "Vite + React",
      "Vercel serverless",
      "SSE streaming",
      "Anthropic Claude SDK",
    ],
    accent: "#d97706",
    images: [],
    problem: `Single-shot LLM coding tools (paste a prompt, get a file back) keep failing on anything non-trivial. The model has no plan, no memory of what worked, and no way to course-correct mid-task. Real software gets built by teams of specialists working off a shared plan — so why are AI dev tools still pretending one model can do everything in one pass?`,
    approach: `Model the system as a small team. A Planner agent decomposes the user's intent into a directed task graph (DAG). Specialized worker agents — Coder, Tester, Reviewer — execute the graph node by node, passing artifacts along. Every action streams back to the UI in real time so the user can watch the team work, just like sitting next to a developer pair-programming.`,
    architecture: `Vite + React frontend, Vercel serverless functions for the agent runtime, server-sent events (SSE) for live progress streaming back to the UI. Anthropic Claude SDK powers each agent with a different system prompt and toolset. The frontend visualizes the task DAG and shows a running log per agent, with the generated code rendered in a live editor pane as it's written.`,
    result: `Live deployment, full DAG planner, Coder/Tester/Reviewer agents wired up, real-time streamed visualization. Built end-to-end for the JetBrains × OpenAI hackathon (April 2026, San Francisco).`,
  },

  {
    slug: "can-stack",
    name: "CAN Stack",
    tagline: "Pub/sub CAN messaging layer for Milwaukee Tool battery orchestration.",
    role: "Firmware Engineer @ Milwaukee Tool",
    status: "In production",
    tags: ["Embedded"],
    tech: ["C++", "CAN", "PDO", "Bare-metal"],
    accent: "#f87171",
    images: [],
    problem: `Power tool battery packs and orchestrator modules needed to talk over CAN with strict timing guarantees, no RTOS, and no room for jitter. Off-the-shelf stacks were too heavy; the team needed something deterministic, easy to extend, and traceable on a logic analyzer when things went wrong.`,
    approach: `Build a minimal pub/sub layer in C++ on top of raw CAN frames, modeled on the CANopen PDO pattern. Topics map to message IDs; producers publish on a fixed cadence; subscribers register at boot. No dynamic allocation after init.`,
    architecture: `Custom task kernel (no RTOS) with deterministic scheduling, interrupt-driven CAN RX, and a producer/consumer table built at compile time from a header definition. Telemetry messages, command messages, and emergency broadcasts each get their own priority class.`,
    result: `Shipped in production firmware on Power Interface Boards. Survived hardware-in-the-loop regression and bench validation; messages stayed within budget under worst-case bus load.`,
  },

  {
    slug: "hil-automation",
    name: "HIL Automation Framework",
    tagline: "Python Hardware-in-the-Loop framework that cut regression cycles 80%.",
    role: "Embedded SWE Intern @ Milwaukee Tool",
    status: "Adopted by team",
    tags: ["Embedded"],
    tech: ["Python", "MicroPython", "Teensy 4.1", "Azure DevOps", "C++"],
    accent: "#34d399",
    images: [],
    problem: `Firmware regression at Milwaukee was mostly manual — engineers running boards on benches, eyeballing scope traces, signing off by hand. Cycle times were eating engineering hours, and bugs were slipping through because nobody had time to run the full matrix on every change.`,
    approach: `Treat the device under test as a service. A host PC running Python orchestrates test cases; a Teensy 4.1 acts as the "test harness MCU" running MicroPython, talking to the DUT over UART with a small C++ shim. Tests become readable Python files committed to the repo and run on every PR through Azure DevOps.`,
    architecture: `Three layers: (1) Python host runner with a fixture/teardown model, (2) MicroPython runner on Teensy 4.1 exposing a UART RPC, (3) C++ APIs on the device side that the runner can call to drive pins, capture ADC, and verify state. CI/CD wires it into Azure DevOps so every commit triggers the matrix.`,
    result: `Cut regression cycles by ~80%. Caught firmware regressions on PRs instead of in QA, freed up engineering time, and gave the team a repeatable way to validate every new MCU board.`,
  },

  {
    slug: "phoropter",
    name: "Embedded Vision Phoropter",
    tagline: "Embedded vision system for an automated ophthalmic exam device.",
    role: "Capstone @ Purdue",
    status: "Delivered",
    tags: ["Embedded"],
    tech: ["C", "I2C", "SPI", "USART", "Android"],
    accent: "#c084fc",
    images: [],
    problem: `Commercial automated phoropters cost tens of thousands of dollars, putting them out of reach for clinics in lower-income regions. The capstone goal: build a working unit that hit the same clinical functionality at a fraction of the cost.`,
    approach: `Embedded vision pipeline driving the lens hardware over I2C/SPI/USART, with safety logic in firmware to prevent any motion path that could harm a patient. Pair the device with an Android companion app for the optometrist's UI.`,
    architecture: `Microcontroller running a state machine that coordinates the lens turret, sensor reads, and host commands. Android app communicates over a defined serial protocol, handles the patient flow, and stores results. Firmware enforces safety interlocks independently of the app — the device can't move into an unsafe pose even if the host crashes.`,
    result: `Working prototype delivered with ~65% cost savings vs commercial units. Demonstrated end-to-end exam flow with the Android companion driving the embedded core.`,
  },
];

export const FILTERS = [
  { id: "all", label: "All" },
  { id: "Embedded", label: "Embedded" },
  { id: "AI/Agents", label: "AI / Agents" },
  { id: "iOS", label: "iOS" },
  { id: "Health", label: "Health" },
  { id: "Government", label: "Government" },
];
