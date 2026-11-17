export type Category =
  | "Physical AI"
  | "Perception"
  | "Planning & Control"
  | "Software & Agents"
  | "Research";

export const categories: Category[] = [
  "Physical AI",
  "Perception",
  "Planning & Control",
  "Software & Agents",
  "Research",
];

export type Media = {
  type: "image" | "video";
  src: string;
  poster?: string;
  alt: string;
  caption?: string;
  /** Show the whole frame (diagrams, plots, phone screens) instead of cropping. */
  contain?: boolean;
  pixelated?: boolean;
};

export type LinkKind = "github" | "live" | "video" | "paper" | "external";

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  date: string; // YYYY-MM, used for sorting
  period: string;
  categories: Category[];
  context: string;
  role: string;
  team?: string;
  icon: IconKey;
  featured?: boolean;
  stack: string[];
  cover?: Media;
  gallery?: Media[];
  overview: string[];
  highlights: string[];
  results?: { value: string; label: string }[];
  links?: { label: string; href: string; kind: LinkKind }[];
  note?: string;
};

export type IconKey =
  | "arm"
  | "map"
  | "radar"
  | "pill"
  | "humanoid"
  | "gamepad"
  | "cable"
  | "brain"
  | "agent"
  | "tray"
  | "leaf"
  | "sign"
  | "ship"
  | "network"
  | "drone"
  | "road"
  | "puzzle"
  | "camera";

const m = (slug: string, file: string) => `/media/${slug}/${file}`;

export const projects: Project[] = [
  {
    slug: "liminal",
    title: "Liminal",
    tagline: "Long-horizon dual-arm manipulation with FLUX 3 Action, planned and checked by Claude.",
    date: "2026-10",
    period: "Oct 2026",
    categories: ["Physical AI"],
    context: "ERH Physical AI Hackathon · Zurich · Track prize winner",
    role: "Team lead; live lab, MuJoCo digital twin, launch videos, system integration",
    team: "Oscar Devos, Javier Gil, Tomas Leggaet, Simone Utili, Stanislaw Sufin",
    icon: "arm",
    featured: true,
    stack: ["FLUX 3 Action", "LoRA", "LeRobot", "SO-101 / Haller", "MuJoCo", "Claude", "Behavior trees", "Python"],
    cover: { type: "video", src: m("liminal", "full-chain.mp4"), poster: m("liminal", "full-chain-poster.webp"), alt: "Operator console running the full four-skill chain on the real robot" },
    gallery: [
      { type: "video", src: m("liminal", "full-chain.mp4"), poster: m("liminal", "full-chain-poster.webp"), alt: "Full four-skill chain", caption: "One uncut run of the full 4-skill chain on the real Haller, sped up uniformly. The console shows the plan, Claude's step checks, the head and wrist cameras, and FLUX's imagined vs. actual frames." },
      { type: "image", src: m("liminal", "setup.webp"), alt: "Real dual-arm setup next to its digital twin", caption: "The real station and its MuJoCo twin, which mirrors the arms' measured joints live." },
      { type: "image", src: m("liminal", "architecture.webp"), alt: "Liminal architecture diagram", caption: "Task plan → harness → per-arm FLUX 3 Action skills → safety supervisor, with perception closing the loop.", contain: true },
      { type: "image", src: m("liminal", "real-vs-sim.webp"), alt: "Real robot compared with simulation", caption: "Real vs. simulated scene used to validate the twin." },
      { type: "image", src: m("liminal", "head-camera.webp"), alt: "Head camera view", caption: "Head-camera view used for Claude's after-step verification." },
    ],
    overview: [
      "Liminal explores collaboration between two arms: one arm changes or holds something in the scene so the other can do what it otherwise couldn't. FLUX 3 Action provides learned, text-prompted manipulation skills. Everything above that is our system: deciding why a skill is needed, when the other arm is ready, which conditions must stay true, and whether the goal really happened.",
      "We trained one LoRA adapter per skill on our own VR-teleoperated demonstrations and chained them under a planner. After every step, Claude checks the cameras and replans when a step fails. A safety supervisor enforces joint limits, rate limits, a torque cap and the e-stop throughout.",
      "My part was the research front-end: the public project page and a full-screen live lab that mirrors the real arms in a MuJoCo twin of the Haller, also embedded in the orchestrator HMI. I also produced the launch and teaser videos and helped integrate the end-to-end demo.",
    ],
    highlights: [
      "Full 4-skill chain (open box → green pen → yellow cutter → red pen) on real hardware, with a camera check after each step.",
      "Per-skill FLUX 3 Action LoRAs (rank 32) trained on our own LeRobot v3 datasets.",
      "Behavior-tree executor with AFTER / WHILE / UNTIL conditions, retries and arm-ownership safety.",
      "Live digital twin in the browser, driven by the real arms' joint telemetry.",
      "All checkpoints and five teleoperation datasets released publicly on Hugging Face.",
    ],
    results: [
      { value: "€1,000", label: "track prize, awarded by the ERH jury" },
      { value: "2 / 3", label: "full-chain runs finished 4/4 with no human touch" },
      { value: "0 → 3/5", label: "red-pen inserts: stock zero-shot FLUX vs. our LoRA" },
      { value: "5", label: "public datasets & 4 LoRA checkpoints" },
    ],
    links: [
      { label: "Project page", href: "https://javiergil.dev/liminal/", kind: "live" },
      { label: "Live lab", href: "https://javiergil.dev/liminal/live.html", kind: "live" },
      { label: "Code", href: "https://github.com/Javgilavi/liminal", kind: "github" },
      { label: "Submission video", href: "https://drive.google.com/file/d/1et5ffQpXLLh4a1qOvociNB1weNlaCGPU/view", kind: "video" },
      { label: "Teaser (60 s)", href: "https://drive.google.com/file/d/1eyPMYofcuqxp0x0iw8-73LB_qJwRpfDJ/view", kind: "video" },
      { label: "Slides", href: "https://drive.google.com/file/d/1tG4ehYkKH0PK-AJg1K_wNPsWDiAQaoM3/view", kind: "paper" },
      { label: "Datasets & LoRAs", href: "https://huggingface.co/Oskrt", kind: "external" },
    ],
  },
  {
    slug: "g1-alien-bazaar",
    title: "XRAY - G1 Scene Survey & AR",
    tagline: "A Unitree G1 humanoid that maps a room, finds objects from language and shows them in AR glasses.",
    date: "2026-09",
    period: "Sep 2026",
    categories: ["Physical AI", "Perception"],
    context: "Alien Bazaar robotics hackathon · Warsaw",
    role: "G1 perception, object search, navigation and the AR-glasses bridge",
    team: "Hackathon team",
    icon: "humanoid",
    featured: true,
    stack: ["Unitree G1 EDU", "ROS 2", "RTAB-Map", "Livox MID-360", "OAK-D", "Nav2", "AprilTags", "Grounding DINO", "SAM 2", "m-explore", "Snap Spectacles", "Lens Studio"],
    cover: { type: "image", src: m("g1-alien-bazaar", "g1.webp"), alt: "Unitree G1 humanoid at the hackathon" },
    gallery: [
      { type: "image", src: m("g1-alien-bazaar", "g1.webp"), alt: "Unitree G1", caption: "The Unitree G1 EDU used as a mobile survey platform." },
      { type: "image", src: m("g1-alien-bazaar", "oak-view.webp"), alt: "OAK-D chest camera view", caption: "Chest-mounted OAK-D view with the AprilTag used to align robot and glasses." },
      { type: "video", src: m("g1-alien-bazaar", "ar-glasses.mp4"), poster: m("g1-alien-bazaar", "ar-glasses-poster.webp"), alt: "AR glasses view", caption: "Spectacles overlay of the robot's map and points of interest.", contain: true },
    ],
    overview: [
      "The G1 acts as a survey robot. LiDAR (MID-360) and IMU feed RTAB-Map, which builds the metric 3D map, the 2D occupancy grid and the trajectory. A chest-mounted OAK-D RGB-D camera adds color and semantics. A natural-language query such as \"red cup\" becomes a 3D point of interest in the shared map frame, ready to hand to a Leo Rover.",
      "A single AprilTag on the wall, seen by both the robot camera and the Snap Spectacles, aligns the two frames. The glasses can then render the robot, its path, the LiDAR map and the semantic POIs in the room.",
    ],
    highlights: [
      "LiDAR-inertial RTAB-Map as the only map → odom owner; RGB-D used only for semantics.",
      "Language → keyframe search → 3D POI in the map frame.",
      "ROS 2 → AR bridge with AprilTag frame alignment for Snap Spectacles.",
      "Open-vocabulary object search on the G1 with Grounding DINO + SAM 2, marked live in the AR glasses.",
      "A Leo Rover joins the same world frame through the shared wall AprilTag and shows up in the glasses.",
      "G1 navigation and frontier exploration (m-explore) on the real robot, plus voice commands.",
      "One-command session scripts for camera, TF, map, AR and object search.",
    ],
    links: [
      { label: "Code", href: "https://github.com/v-prgmr/warsaw_hackathon", kind: "github" },
      { label: "My pull requests", href: "https://github.com/v-prgmr/warsaw_hackathon/pulls?q=is%3Apr+author%3AJavgilavi", kind: "github" },
    ],
  },
  {
    slug: "memcard",
    title: "memcard",
    tagline: "A social diary for video games, built around playthroughs and sessions rather than a single rating.",
    date: "2026-11",
    period: "Sep 2026 — present",
    categories: ["Software & Agents"],
    context: "Personal product · early access",
    role: "Founder, design and full-stack development",
    icon: "gamepad",
    featured: true,
    stack: ["Next.js 16", "TypeScript", "PostgreSQL 17", "Steam API", "Riot API", "Wikidata", "Vercel", "Neon"],
    cover: { type: "image", src: m("memcard", "banner.webp"), alt: "memcard banner" },
    gallery: [
      { type: "image", src: m("memcard", "home.webp"), alt: "memcard home feed", caption: "Home feed with friends' activity." },
      { type: "image", src: m("memcard", "game.webp"), alt: "Game page", caption: "Game page with labels, stores and community discussions." },
      { type: "image", src: m("memcard", "phone.webp"), alt: "Phone view", caption: "Phone-first design.", contain: true },
      { type: "image", src: m("memcard", "browse.webp"), alt: "Browse view", caption: "Browse ~175k games by genre, platform or label." },
    ],
    overview: [
      "Games are played over weeks, not watched in an evening. memcard is built around the playthrough (a \"save\") and the sessions inside it, in the spirit of Letterboxd for films. You can log plays, keep a session diary, rate in half-blocks, build shelves and see what your friends are finishing.",
      "Steam sign-in imports your library with hours played and turns new playtime into dated diary sessions on every sync. League of Legends matches become daily sessions. CSV imports never overwrite your own ratings. The catalogue of about 175,000 games comes from Wikidata and is refreshed weekly.",
    ],
    highlights: [
      "Steam and Riot integrations that turn playtime into diary sessions automatically.",
      "Social layer: follows, feed, likes, comments, community threads and a weekly email.",
      "Stats, badges, a yearly Wrapped, and daily guess-the-game puzzles.",
      "Phone-first UI, live with real users.",
    ],
    links: [{ label: "thememcard.com", href: "https://thememcard.com", kind: "live" }],
  },
  {
    slug: "argos",
    title: "ArgOS",
    tagline: "Natural-language control for a Unitree Go2 robot dog, from any browser. 1st place at EPFL RoboHack 2026.",
    date: "2026-05",
    period: "May 2026",
    categories: ["Physical AI", "Software & Agents"],
    context: "RoboHack 2026 at EPFL · 1st place",
    role: "Cloud & intelligence layer: MCP agent, FastAPI server, 3D LiDAR UI, robot bridges",
    team: "Javier Gil Avilés, Javier Gonzalez Villasmil, Minh Nhut Nguyen, Harsh Talathi, Jiwon You",
    icon: "camera",
    featured: true,
    stack: ["DimOS", "Unitree Go2", "MCP", "Claude (Amazon Bedrock)", "FastAPI", "YOLO11", "LCM", "AWS EC2 / S3", "WebGL"],
    cover: { type: "image", src: m("argos", "live-map.webp"), alt: "ArgOS browser UI: live 3D LiDAR map with labelled objects and the semantic-memory table" },
    gallery: [
      { type: "image", src: m("argos", "live-map.webp"), alt: "ArgOS live map", caption: "The browser UI: live LiDAR map, YOLO objects in semantic memory, camera feed and the Ask / Agent panel." },
      { type: "image", src: m("argos", "go2.webp"), alt: "Unitree Go2 with the ArgOS sensor setup", caption: "The Unitree Go2 EDU used at the hackathon." },
      { type: "image", src: m("argos", "architecture.webp"), alt: "ArgOS architecture diagram", caption: "Robot → perception and semantic memory → LLM parsing and skills → planning, with the website on top.", contain: true },
    ],
    overview: [
      "ArgOS is an intelligence and cloud layer on top of DimOS that lets you command a quadruped in plain language from any browser, even a phone on 4G. The robot sees its surroundings, remembers what it finds in a semantic spatial map, understands what you ask and navigates to do it, while you watch a live 3D map.",
      "I led the cloud and intelligence layer: the FastAPI server, the MCP agent that drives DimOS navigation and perception tools, LLM streaming, the 3D LiDAR web UI, the bridges that stream odometry, point clouds and camera frames from the robot, and the EC2 deployment. We demoed people counting, \"find the chair\" object navigation, live segmentation, an instant stop and scene descriptions, and won the hackathon.",
    ],
    highlights: [
      "LLM agent with MCP tool access to DimOS navigation and perception; skills are added as new tools.",
      "Semantic object memory from YOLO11 detections, with confidence decay so stale objects disappear.",
      "Live 3D LiDAR map in the browser with click-to-navigate goals and an Ask / Agent chat, plus voice input.",
      "EC2-hosted server with password-protected bridges, so the robot can be driven from anywhere.",
      "Five stability patches upstream of DimOS that kept the agentic stack from crashing during the demo.",
    ],
    results: [
      { value: "1st", label: "place at RoboHack 2026, EPFL" },
      { value: "90+ FPS", label: "off-board segmentation (20 FPS on board)" },
    ],
    links: [
      { label: "ArgOS", href: "https://github.com/JavideuS/argOS", kind: "github" },
      { label: "Pitch deck", href: "https://github.com/JavideuS/argOS/blob/main/ArgOS.pdf", kind: "paper" },
      { label: "Hackathon code", href: "https://github.com/JavideuS/robohack2026", kind: "github" },
      { label: "DimOS fork", href: "https://github.com/Javgilavi/dimos_epfl", kind: "github" },
    ],
  },
  {
    slug: "slam3d",
    title: "slam3d",
    tagline: "Turn a 360° construction walkthrough into an explorable, floor-plan-aligned 3D map.",
    date: "2026-09",
    period: "Sep 2026",
    categories: ["Perception", "Research"],
    context: "Personal project · Hilti–Trimble–Oxford SLAM Challenge 2026 data",
    role: "Sole developer",
    icon: "map",
    featured: true,
    stack: ["stella_vslam", "PanoVGGT", "YOLOE", "Particle filter", "Gaussian splatting", "Python", "C++", "Docker"],
    cover: { type: "video", src: m("slam3d", "showcase.mp4"), poster: m("slam3d", "showcase-poster.webp"), alt: "slam3d showcase" },
    gallery: [
      { type: "image", src: m("slam3d", "viewer.webp"), alt: "slam3d synchronized viewer", caption: "The browser viewer keeps the 360° recording, the floor plan and the 3D map in sync." },
      { type: "video", src: m("slam3d", "showcase.mp4"), poster: m("slam3d", "showcase-poster.webp"), alt: "slam3d walkthrough", caption: "Walkthrough mapping output." },
      { type: "image", src: m("slam3d", "gaussian-world.webp"), alt: "Gaussian world viewer", caption: "Experimental Gaussian appearance scene rendered from a processed run." },
    ],
    overview: [
      "slam3d is an offline, stage-based pipeline for panoramic visual SLAM on construction sites. It takes a stitched equirectangular video, or a calibrated dual-fisheye ROS bag, plus a floor plan (mask, drawing, PDF or DXF). It produces timestamped trajectories, dense point clouds, plan overlays, object tracks and reports.",
      "The pipeline runs panorama ingest → stella_vslam with loop closure → gravity and scale estimation → PanoVGGT depth → structural alignment with the plan → open-vocabulary objects lifted into 3D → particle-filter localization against the plan. Stages resume automatically when their configuration hasn't changed.",
    ],
    highlights: [
      "Monocular 360° SLAM with loop closure, gravity alignment and scale recovery.",
      "Floor-plan registration with confidence checks, manual seeding and local drift refinement.",
      "YOLOE open-vocabulary detections lifted into 3D with static/dynamic association.",
      "Causal particle-filter replay for plan-based localization.",
      "Synchronized video / plan / 3D browser viewer, plus an experimental Gaussian-splat world view.",
    ],
    links: [
      { label: "Code", href: "https://github.com/Javgilavi/slam3d", kind: "github" },
      { label: "Showcase video", href: "https://github.com/Javgilavi/slam3d/blob/main/docs/assets/showcase.mp4", kind: "video" },
      { label: "Hilti–Trimble–Oxford dataset", href: "https://huggingface.co/datasets/Hilti-Research/hilti-trimble-slam-challenge-2026", kind: "external" },
    ],
  },
  {
    slug: "nursearm",
    title: "NurseArm",
    tagline: "An LLM agent that safely drives an SO-101 arm for medication tasks through bounded MCP skills.",
    date: "2026-06",
    period: "Jun 2026",
    categories: ["Physical AI", "Software & Agents"],
    context: "Physical AI hackathon · 6–7 June 2026",
    role: "Agent, robot control and policy integration",
    team: "Javier Gil, Miguel (MxguelTech), Simone Utili",
    icon: "pill",
    featured: true,
    stack: ["LeRobot", "ACT", "SO-101", "MCP", "Ollama / Qwen", "Claude", "MediaPipe", "Faster-Whisper", "FastAPI", "RealSense"],
    cover: { type: "image", src: m("nursearm", "cover.webp"), alt: "Illustration: an SO-101 arm hands a green pill to an open, palm-up hand while the agent logs the MCP call" },
    overview: [
      "NurseArm connects an SO-101 robot arm to a browser interface and an LLM agent. The agent never produces raw motor commands. It discovers a bounded set of MCP tools, picks a registered skill, executes it and reports a structured result. Every decision lands in an append-only audit log.",
      "Skills include direct Cartesian primitives and two trained ACT policies: sorting pills and handing over a green or black pill when MediaPipe detects an open, palm-up hand. A calendar can trigger the right skill at medication time. Text, voice (Faster-Whisper) and an optional Telegram bridge are all supported inputs.",
    ],
    highlights: [
      "Bounded MCP skill server: the LLM selects tools and never improvises motor commands.",
      "ACT policies (sort_pills, handover_pill) deployed through lerobot-rollout.",
      "Hand openness and palm-up detection with MediaPipe on RealSense or webcam streams.",
      "Local-first agent (Ollama + Qwen 3) with Claude as a drop-in backend.",
      "An honesty document that separates what was built, what was borrowed and what was verified.",
    ],
    links: [
      { label: "Code", href: "https://github.com/Javgilavi/nursearm", kind: "github" },
      { label: "Pitch video", href: "https://github.com/Javgilavi/nursearm/blob/main/Video/business-video.mp4", kind: "video" },
      { label: "Honesty notes", href: "https://github.com/Javgilavi/nursearm/blob/main/HONESTY.md", kind: "github" },
    ],
  },
  {
    slug: "radar-3d-detection",
    title: "Radar-based 3D Object Detection",
    tagline: "Boosting a radar-only CenterPoint detector with camera fusion and LiDAR distillation.",
    date: "2026-04",
    period: "Feb — Apr 2026",
    categories: ["Perception", "Research"],
    context: "TU Delft · Advanced Machine Perception",
    role: "PointPainting adaptation and baseline tuning",
    team: "Javier Gil Avilés, Kevin Stehouwer, Daniël Paul",
    icon: "radar",
    featured: true,
    stack: ["PyTorch", "CenterPoint", "View-of-Delft", "PointPainting", "SSDLite", "SLURM / DelftBlue"],
    cover: { type: "image", src: m("radar", "detections.webp"), alt: "Radar detections projected on the camera image" },
    gallery: [
      { type: "image", src: m("radar", "detections.webp"), alt: "Detection visualisation", caption: "Detections on the View-of-Delft dataset." },
      { type: "image", src: m("radar", "results.webp"), alt: "Results table", caption: "ROI mAP on the VoD evaluation set, for each method alone and stacked on the tuned baseline.", contain: true },
      { type: "image", src: m("radar", "pointpainting.webp"), alt: "PointPainting architecture", caption: "Radar PointPainting: per-class camera confidence appended to each radar point.", contain: true },
      { type: "image", src: m("radar", "cafusion.webp"), alt: "Distillation architecture", caption: "LiDAR-to-radar feature distillation (RadarDistill adaptation).", contain: true },
    ],
    overview: [
      "Radar is robust to weather, cheap, and measures radial velocity natively, but its point clouds are extremely sparse. We started from a CenterPoint radar baseline on the View-of-Delft dataset. We added four model-agnostic improvements that need only radar and a monocular camera at inference time.",
      "I led the systematic baseline tuning, which gave the single largest gain (+9.7 mAP). I also built a radar adaptation of PointPainting: an SSDLite camera segmenter paints each radar point with per-class confidence scores. My teammates built CAFusion (cross-attention BEV fusion) and a RadarDistill-style LiDAR→radar knowledge distillation.",
    ],
    highlights: [
      "Hyper-parameter and architecture sweep of CenterPoint on DelftBlue (SLURM).",
      "Radar PointPainting: camera semantics appended to radar points via calibrated projection.",
      "Evaluated each module alone and stacked on the tuned baseline, including speed vs. accuracy trade-offs.",
    ],
    results: [
      { value: "63.95", label: "ROI mAP on the VoD evaluation set" },
      { value: "+10.35", label: "mAP over the radar-only baseline" },
      { value: "67.48", label: "mAP on the VoD leaderboard (tuned + PointPainting)" },
    ],
  },
  {
    slug: "barista-mobile-manipulator",
    title: "Barista Mobile Manipulator",
    tagline: "Hierarchical motion planning for a mobile manipulator serving in a dynamic restaurant.",
    date: "2026-01",
    period: "Nov 2025 — Jan 2026",
    categories: ["Planning & Control"],
    context: "TU Delft · Planning & Decision Making (RO47005)",
    role: "Planning and MPC development",
    team: "Francesco Marani, Javier Gil, Núria Seguí, Simone Utili",
    icon: "tray",
    featured: true,
    stack: ["Python", "PyBullet", "MPC", "PRM", "RRT / RRT*", "Inverse kinematics"],
    cover: { type: "image", src: m("barista", "env.webp"), alt: "Albert mobile manipulator in the bar environment" },
    gallery: [
      { type: "image", src: m("barista", "env.webp"), alt: "Bar environment", caption: "The Albert mobile manipulator in the PyBullet restaurant." },
      { type: "image", src: m("barista", "prm.webp"), alt: "PRM roadmap", caption: "PRM global roadmap through the restaurant.", contain: true },
      { type: "image", src: m("barista", "rrtstar.webp"), alt: "RRT* path", caption: "RRT* global path.", contain: true },
      { type: "image", src: m("barista", "mpc.webp"), alt: "MPC results", caption: "Base MPC tracking: trajectory, distance to goal and control inputs.", contain: true },
    ],
    overview: [
      "A differential-drive base with a 7-DOF arm must navigate a bar, grasp bottles and deliver them while avoiding static and moving obstacles. We built a hierarchical framework: sampling-based global planners (PRM, RRT, RRT*) produce collision-free routes, and model predictive control tracks them while reacting to dynamic obstacles.",
      "The arm uses its own MPC for reaching and manipulation. We compared planners on path quality, computation time and success rate. The combined approach was more robust than standalone local planning.",
    ],
    highlights: [
      "PRM / RRT / RRT* global planners with MPC tracking for the base.",
      "Arm-level MPC with inverse kinematics for grasp and place.",
      "Sequential task execution: navigate → reach → grasp → transport → deliver.",
    ],
    links: [
      { label: "Code", href: "https://github.com/Javgilavi/Barista_MobileManipulator_sim", kind: "github" },
      { label: "Team repo", href: "https://github.com/francescomarani/PlanningAndDecisionMakingProject", kind: "github" },
    ],
  },
  {
    slug: "aic-cable-insertion",
    title: "AI for Industry Challenge",
    tagline: "Perception for robotic cable insertion in Intrinsic's industrial manipulation challenge.",
    date: "2026-05",
    period: "Mar — May 2026",
    categories: ["Physical AI", "Perception"],
    context: "Intrinsic · AI for Industry Challenge · Team abs(tractable)",
    role: "Perception lead",
    team: "Team abs(tractable)",
    icon: "cable",
    stack: ["ROS 2", "Gazebo", "PyTorch", "LeRobot", "Isaac Lab", "Python"],
    cover: { type: "image", src: m("aic", "wrist.webp"), alt: "Simulated wrist camera view during insertion" },
    overview: [
      "Intrinsic's AI for Industry Challenge targets hard, high-impact manufacturing tasks. Our track was inserting SFP and SC cable plugs into NIC-card and patch-panel ports. I led perception for the team, estimating plug and port poses from the arm's cameras so the policy could align and insert. The pipeline combines 3D semantic segmentation for socket localization with fine-grained pin detection and orientation estimation.",
      "A key lesson was data diversity. Our first datasets used a nearly static arm, so every image looked the same. I rebuilt collection around full scripted insertion episodes with randomized component placement, recording labelled samples across the whole approach, alignment and descent.",
    ],
    highlights: [
      "Multi-camera pipeline: 3D semantic segmentation to localize the socket, then pin detection and orientation estimation.",
      "ROS 2 dataset-collection node recording labelled samples during full insertion episodes.",
      "Multi-session pipeline with randomized component positions for view diversity.",
      "Compact perception network trained for port/plug localization.",
      "Demonstration recording and conversion to LeRobot format for policy learning.",
    ],
    links: [{ label: "Challenge", href: "https://www.intrinsic.ai/events/ai-for-industry-challenge", kind: "external" }],
  },
  {
    slug: "dino-wm",
    title: "DINO-WM Reproduction",
    tagline: "Reproducing zero-shot planning with world models on frozen DINO features, and testing DINOv3.",
    date: "2026-06",
    period: "May — Jun 2026",
    categories: ["Research", "Physical AI"],
    context: "TU Delft · DSAIT4030 Generative Modelling",
    role: "PointMaze experiments, DINOv3 encoder, training infrastructure",
    team: "D. Townsend, G. Bernardini, J. Gil Avilés, J. Mellema, N. Menta, S. Krafft",
    icon: "brain",
    stack: ["PyTorch", "DINOv2", "DINOv3", "MuJoCo", "Flash Attention", "DelftBlue", "Kaggle"],
    cover: { type: "video", src: m("dino-wm", "plan.mp4"), poster: m("dino-wm", "plan-poster.webp"), alt: "Successful PointMaze plan", contain: true },
    gallery: [
      { type: "image", src: m("dino-wm", "planning.webp"), alt: "Planning outputs grid", caption: "Imagined vs. actual rollouts while planning in latent space.", contain: true },
      { type: "image", src: m("dino-wm", "loss.webp"), alt: "Loss curves", caption: "Validation losses for DINOv2, DINOv3 and DINOv3-Repeat4 world models.", contain: true },
      { type: "video", src: m("dino-wm", "plan.mp4"), poster: m("dino-wm", "plan-poster.webp"), alt: "Plan success", caption: "Successful PointMaze plan with the DINOv3 world model.", contain: true },
    ],
    overview: [
      "DINO-WM learns task-agnostic visual dynamics in the latent space of a frozen DINOv2 encoder, which enables zero-shot planning without rewards or expert demonstrations. We set out to reproduce its planning results on PointMaze and Push-T under real compute constraints.",
      "Training was first bottlenecked by I/O, not compute. We moved to precomputed float32 embeddings, decoder-free training and Flash Attention (which nearly halved VRAM), and ran on the DelftBlue and DAIC clusters. I owned the PointMaze runs and swapped in DINOv3 as the observation encoder, which gave about 17× lower visual loss thanks to smoother frame-to-frame features.",
    ],
    highlights: [
      "Profiled and removed data-loading bottlenecks across Kaggle, local GPUs and HPC clusters.",
      "DINOv3 vs. DINOv2 encoder comparison for latent world models.",
      "CEM planning in latent space evaluated on PointMaze success rate.",
    ],
    links: [{ label: "Code", href: "https://github.com/SebastianKrafft/DSAIT4030_DINO-WM", kind: "github" }],
  },
  {
    slug: "centauri",
    title: "Centauri",
    tagline: "A Chrome extension that runs web tasks from natural language in a floating command shell.",
    date: "2026-02",
    period: "Feb 2026",
    categories: ["Software & Agents"],
    context: "HackEurope 2026",
    role: "Co-developer: agent features & integration",
    team: "Marcos Hernanz, Javier Gil, Martí Massó, Marc Altabella",
    icon: "agent",
    stack: ["TypeScript", "Chrome Extensions", "Claude", "Gemini", "ElevenLabs"],
    cover: { type: "video", src: m("centauri", "demo.mp4"), poster: m("centauri", "demo-poster.webp"), alt: "Centauri demo" },
    overview: [
      "Built at HackEurope 2026 to bring AI assistance into the page you are working on, so you don't have to switch to a separate chat window. Press Ctrl+Shift+Space on any page and type what you want: \"summarize the top 5 Hacker News articles\" or \"summarize my last 5 unread emails\". Centauri plans, navigates visibly, and summarizes, moving through Planning → Executing → Summarizing states.",
      "Claude is the main agent, planner and summarizer. Gemini handles image questions about a selected region, and ElevenLabs provides speech in and out. A chat mode answers read-only questions about the current DOM, and per-page notes are built in.",
    ],
    highlights: [
      "Agentic and chat modes, with visible step-by-step navigation.",
      "Multimodal: page images via Gemini, voice via ElevenLabs.",
      "Per-page notes stored alongside the browsing session.",
    ],
    links: [
      { label: "Demo video", href: "https://www.youtube.com/watch?v=wplMA1UC-Fw", kind: "video" },
      { label: "Code", href: "https://github.com/marcoshernanz/centauri", kind: "github" },
    ],
  },
  {
    slug: "greenhouse-surveillance",
    title: "Greenhouse Surveillance Robot",
    tagline: "Autonomous exploration, mapping and AprilTag localization for a Mirte robot in a greenhouse.",
    date: "2026-06",
    period: "Apr — Jun 2026",
    categories: ["Planning & Control", "Perception"],
    context: "TU Delft · Multidisciplinary Project (RO47007), Group 16",
    role: "Robotics software & workspace infrastructure",
    team: "Núria Seguí Vidal, Gonçalo Fernández-Nespral Vaz, Twan Grooff, Javier Gil Avilés, Tom van Beekhoff",
    icon: "leaf",
    stack: ["ROS 2 Humble", "Nav2", "Frontier exploration", "AprilTags", "Gazebo", "Docker", "PyTorch", "FastAPI", "SQLite"],
    overview: [
      "A Mirte robot explores and maps a greenhouse on its own, records the AprilTag on each table along the way, saves the map, and then goes back to check any tables whose tags it missed.",
      "Each package lives in its own repository with CI. A layered Docker setup (base → dev with CUDA → deploy) means the robot pulls one image and runs with no compilation on board.",
      "A companion digital-twin dashboard (FastAPI and SQLite) stores and displays temperature and humidity readings for each greenhouse stand.",
    ],
    highlights: [
      "Autonomous exploration and mapping, with tag gathering during exploration.",
      "Post-mapping double-check pass for missing table tags.",
      "Layered Docker images with GPU auto-detection and one-command workflows.",
      "Digital-twin web dashboard fed by a sensor REST API.",
    ],
    links: [{ label: "Digital twin", href: "https://github.com/nseguividal/DigitalTwin-TulipTech", kind: "github" }],
  },
  {
    slug: "maritime-tracking",
    title: "Maritime Multi-Obstacle Tracking",
    tagline: "Real-time multi-sensor, multi-obstacle tracking for Navantia's unmanned surface vessel.",
    date: "2025-06",
    period: "2023 — 2025",
    categories: ["Perception"],
    context: "GRVC Lab × Navantia · MSc thesis, University of Seville",
    role: "Tracking system developer",
    icon: "ship",
    stack: ["C++", "ROS 2", "Fast DDS", "Kalman filters", "LiDAR", "ADS-B", "Gazebo"],
    overview: [
      "At the GRVC Robotics Lab I developed a real-time tracking system for an unmanned surface vehicle, built with Navantia, Spain's largest naval company. It fuses several sensors to keep a consistent list of obstacles around the vessel, which feeds the downstream obstacle-avoidance and navigation modules. I also handled the LiDAR deployment and encoder integration on the platform. This became my MSc thesis: \"Development of a Multi-Sensor Multi-Obstacle Tracking System for Maritime Obstacle Tracking\".",
      "I also turned the core ideas into an open training workspace (ROS 2 Humble + Gazebo). A drone tracks three moving targets by fusing ADS-B messages and LiDAR with Kalman filters, with step-by-step exercises from a single track to robust multi-target association.",
    ],
    highlights: [
      "Multi-target Kalman filter with track management (birth, loss and re-association).",
      "LiDAR-to-track association combined with ADS-B global-to-local transforms.",
      "Robustness to dropouts with filtering and gating.",
      "Worked with real sensor data from the vessel, coordinating with the teams deploying each sensor.",
      "Validated at GRVC; training material published as a ROS 2 workspace.",
    ],
    links: [
      { label: "Training workspace", href: "https://github.com/Javgilavi/multitracker_sim_ws", kind: "github" },
      { label: "Navantia USV", href: "https://www.navantia.es/es/actualidad/notas-prensa/el-usv-poniente-de-navantia-en-aguas-gaditanas/", kind: "external" },
    ],
  },
  {
    slug: "sustainml",
    title: "SustainML Framework",
    tagline: "An EU framework that guides ML development toward lower-energy, lower-CO₂ models.",
    date: "2025-08",
    period: "2024 — 2025",
    categories: ["Software & Agents"],
    context: "eProsima · Horizon Europe SustainML project",
    role: "Lead backend developer",
    icon: "network",
    stack: ["C++", "Fast DDS", "SWIG", "Python", "Qt / QML", "REST", "Transformers", "RAG", "Knowledge graphs"],
    overview: [
      "SustainML helps developers describe a problem and get model, hardware and carbon-footprint recommendations across the ML lifecycle. As lead backend developer at eProsima, I built the C++ core that connects the framework's modules over Fast DDS. It is exposed to Python through SWIG, with a Qt/QML frontend and REST APIs.",
      "With European partners I integrated transformer-based modules and RAG pipelines, including a knowledge graph built from the Hugging Face model hub and queried with SPARQL to ground model suggestions.",
    ],
    highlights: [
      "Distributed module architecture over DDS with a Python-friendly API.",
      "Qt/QML desktop frontend and REST service for remote use.",
      "Hugging Face → knowledge graph crawler with LLM-backed conversational search.",
    ],
    links: [
      { label: "v0.1.0 demo", href: "https://sustainml.eu/showroom/news/sustainml-framework-v0-1-0-demo", kind: "external" },
      { label: "SustainML Framework", href: "https://github.com/eProsima/SustainML-Framework", kind: "github" },
      { label: "My pull requests", href: "https://github.com/eProsima/SustainML-Framework/pulls?q=is%3Apr+author%3AJavgilavi", kind: "github" },
      { label: "Knowledge2Model", href: "https://github.com/Javgilavi/Knowledge2Model", kind: "github" },
    ],
  },
  {
    slug: "traffic-sign-attacks",
    title: "Traffic-Sign Attack Generator",
    tagline: "Physical adversarial shadows and occlusions for stress-testing traffic-sign recognition.",
    date: "2026-03",
    period: "Mar 2026",
    categories: ["Perception", "Research"],
    context: "TU Delft · Computer Vision group project",
    role: "Attack generator (sole developer), within a group project",
    icon: "sign",
    stack: ["Python", "OpenCV", "NumPy", "YAML", "PyTorch", "GTSRB"],
    cover: { type: "image", src: m("traffic-signs", "shadow-stop.webp"), alt: "Stop sign with a shadow attack", pixelated: true, contain: true },
    gallery: [
      { type: "image", src: m("traffic-signs", "shadow-stop.webp"), alt: "Shadow attack on stop sign", caption: "Triangular shadow attack.", pixelated: true, contain: true },
      { type: "image", src: m("traffic-signs", "occlusion-stop.webp"), alt: "Occlusion attack on stop sign", caption: "Edge-patch occlusion.", pixelated: true, contain: true },
      { type: "image", src: m("traffic-signs", "shadow-yield.webp"), alt: "Shadow attack on yield sign", caption: "Shadow on a yield sign.", pixelated: true, contain: true },
      { type: "image", src: m("traffic-signs", "occlusion-yield.webp"), alt: "Occlusion on yield sign", caption: "Sticker-style occlusion.", pixelated: true, contain: true },
    ],
    overview: [
      "A configurable generator that applies physically plausible attacks to any traffic-sign dataset described by a CSV manifest. It covers triangular shadows inside the sign region and occlusions (edge patch, center sticker, diagonal band), with optional rotation, brightness, contrast and blur.",
      "Every output is written alongside a manifest recording the exact attack parameters and ROI metadata, so robustness experiments are fully reproducible.",
      "The generator powered a group project on adversarial robustness. An AlexNet classifier for the 43 GTSRB sign classes was retrained on mixes of clean and attacked images. It was compared with a defence pipeline that estimates the probability of an attack, denoises the image, and blends the corrected and original images in proportion to that probability before classifying.",
    ],
    highlights: [
      "Shape-aware masks: circle, triangle, diamond, octagon and box.",
      "Dataset-agnostic CSV manifest with optional ROIs.",
      "Reproducible output manifests for every attacked image.",
      "Used for adversarial training and for an attack-detection and denoising defence that can be fine-tuned end to end.",
    ],
    links: [
      { label: "Code", href: "https://github.com/Javgilavi/traffic-sign-attack-generator", kind: "github" },
      { label: "Group project", href: "https://github.com/fa-fie/computer-vision-project", kind: "github" },
    ],
  },
  {
    slug: "mirte-task-planning",
    title: "Mirte Symbolic Task Planning",
    tagline: "PDDL planning with PlanSys2 to sequence move, pick, place and dishwasher actions on a Mirte robot.",
    date: "2026-03",
    period: "Feb — Mar 2026",
    categories: ["Planning & Control"],
    context: "TU Delft · Knowledge Representation & Symbolic Reasoning",
    role: "Task-decision layer",
    icon: "puzzle",
    stack: ["ROS 2", "PDDL", "PlanSys2", "C++", "Gazebo"],
    overview: [
      "A task-decision layer for the Mirte Master robot. PDDL domain and problem files describe the household task, PlanSys2 plans it, and action executables (move, pick, place, dishwasher) are wired to the robot's skills in Gazebo.",
    ],
    highlights: [
      "PDDL domain modelling of household manipulation tasks.",
      "PlanSys2 executor with ROS 2 action nodes bound to Mirte skills.",
    ],
    links: [{ label: "Code", href: "https://github.com/Javgilavi/krr_mirte_task_decision", kind: "github" }],
  },
  {
    slug: "browser-challenge-agent",
    title: "Browser Challenge Agent",
    tagline: "A DOM-first Playwright agent that works through a 30-step browser challenge, with an optional LLM planner.",
    date: "2026-02",
    period: "Feb 2026",
    categories: ["Software & Agents"],
    context: "Personal project · Brett Adcock's 30-step browser challenge",
    role: "Sole developer",
    icon: "agent",
    stack: ["Python", "Playwright", "OpenAI API", "DOM inspection"],
    overview: [
      "A browser-automation agent built around one idea: understand the DOM before acting. Each step starts with a structured observation of the page, taken with page.evaluate(). Specialized solvers then handle the challenge types: reveal buttons, hidden DOM elements, delayed reveals, hover targets, math questions and modal choices.",
      "An optional LLM planner (OpenAI) can be switched on, with token and cost reporting. The agent runs in a precise mode by default, with brute-force clicking and auto-progress switched off.",
    ],
    highlights: [
      "Rich, structured DOM observations instead of screenshots as the primary signal.",
      "Specialized solvers per challenge type, with an optional LLM planner.",
      "Per-run debug artifacts: an event log, a report with timing and cost, DOM snapshots and screenshots on stall.",
    ],
    links: [{ label: "Code", href: "https://github.com/Javgilavi/adsBlockerChallenge_solver", kind: "github" }],
  },
  {
    slug: "crazyflie-navigation",
    title: "Crazyflie Autonomous Navigation",
    tagline: "A* planning, PID control and YOLO person detection for a nano-quadrotor in Webots.",
    date: "2024-06",
    period: "2024",
    categories: ["Planning & Control", "Perception"],
    context: "University of Seville",
    role: "Planning & vision",
    team: "J. Maese, S. Moreno, M. Ballesteros, J. Gil",
    icon: "drone",
    stack: ["Python", "Webots", "A*", "PID", "YOLO", "OpenCV"],
    cover: { type: "image", src: m("crazyflie", "trayectoria-3d.webp"), alt: "3D trajectory", contain: true },
    gallery: [
      { type: "image", src: m("crazyflie", "webots-map.webp"), alt: "Webots world with person detection", caption: "Webots world. The drone stops when YOLO detects a person.", contain: true },
      { type: "image", src: m("crazyflie", "map.webp"), alt: "Planning map", caption: "Occupancy map used by 3D A*.", contain: true },
      { type: "image", src: m("crazyflie", "trayectoria-3d.webp"), alt: "3D trajectory", caption: "Planned vs. flown 3D trajectory.", contain: true },
      { type: "image", src: m("crazyflie", "trayectoria-2d.webp"), alt: "2D trajectory", caption: "2D trajectory log.", contain: true },
    ],
    overview: [
      "An end-to-end autonomy stack for the Crazyflie quadrotor: 3D A* generates waypoints around obstacles, cascaded PID controllers follow them, and a YOLO detector on the onboard camera stops the drone when a person appears.",
    ],
    highlights: [
      "3D A* waypoint generation with obstacle avoidance.",
      "Velocity / fixed-height PID controllers for stable tracking.",
      "Real-time YOLO person detection as a safety stop.",
      "CSV logging and automatic trajectory plots.",
    ],
    links: [{ label: "Code", href: "https://github.com/Javgilavi/Crazyflie-Autonomous-Navigation", kind: "github" }],
  },
  {
    slug: "lane-detection",
    title: "Road Lane Detection",
    tagline: "Classical vs. CNN lane detection for autonomous guidance, validated on highway footage.",
    date: "2023-06",
    period: "2022 — 2023",
    categories: ["Perception"],
    context: "BSc thesis · CUPRA Autonomous Driving Challenge",
    role: "Lane-detection software lead",
    icon: "road",
    stack: ["MATLAB", "Image Processing", "Hough transform", "CNNs"],
    cover: { type: "video", src: m("lane-detection", "output.mp4"), poster: m("lane-detection", "output-poster.webp"), alt: "Lane detection output on a highway" },
    overview: [
      "My bachelor's thesis compared classical lane-detection pipelines (ROI masking, edge detection, Hough transform and lane fitting) with CNN-based approaches for autonomous guidance. I tested them on highway footage in good visibility, at night and on worn roads with changing light.",
      "The same work powered the University of Seville team's lane detector in the SEAT × CUPRA × Volkswagen Autonomous Driving Challenge, where I led that module.",
    ],
    highlights: [
      "Lateral offset estimation from the detected lanes.",
      "Robustness tests at night and under changing light.",
      "Classical vs. learned methods compared side by side.",
    ],
    links: [{ label: "Code", href: "https://github.com/Javgilavi/road_lane_detection", kind: "github" }],
  },
];

export const sortedProjects = [...projects].sort((a, b) => b.date.localeCompare(a.date));
export const featuredProjects = projects.filter((p) => p.featured);
export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
