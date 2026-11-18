export const profile = {
  name: "Javier Gil Avilés",
  shortName: "Javier Gil",
  role: "Perception & AI Robotics Engineer",
  location: "Delft, Netherlands",
  email: "jgilaviles@gmail.com",
  headline:
    "I build perception and learning systems that let robots understand and act in the real world.",
  intro:
    "MSc Robotics student at TU Delft with two years of industry and research experience across middleware, multi-sensor tracking and physical AI. I like the whole loop: sensors, models, planning, and the robot actually doing the thing.",
  rotating: [
    "computer vision",
    "sensor fusion",
    "physical AI",
    "3D perception",
    "robot learning",
  ],
  about: [
    "I'm a Spanish robotics engineer, born in Buenos Aires and trained in Seville. After a BSc and an MSc in electronics, robotics and automation at the University of Seville (top 10% and top 5%), I moved to the Netherlands for a second MSc in Robotics at TU Delft, focused on computer vision and AI.",
    "Before Delft I worked on real systems: multi-obstacle tracking for a Navantia unmanned surface vessel at the GRVC lab, and Fast DDS middleware plus the SustainML backend at eProsima. Today I do computer vision research at Hilti AG and collaborate with ETH Zurich's Computer Vision and Geometry group (CVG) on a paper in preparation. I also do part-time AI engineering at VIKTOR and hackathon builds with real arms, humanoids and robot dogs.",
    "Outside the lab I lead the robotics vertical at EuroTech Federation, connect students with industry as External Affairs at ASIMOV, and lead perception for the Delft Neptunians underwater robotics team.",
  ],
  now: [
    { text: "Computer Vision Research at Hilti AG" },
    { text: "Co-authoring a paper with ETH Zurich's Computer Vision and Geometry group (CVG)" },
    { text: "Robotics Vertical Lead at EuroTech Federation" },
    { text: "MSc Robotics at TU Delft, computer vision & AI track" },
    { text: "AI Engineer (part-time) at VIKTOR, building MCP and RAG tooling" },
    { text: "Building memcard, a social diary for video games", href: "/projects/memcard" },
  ] as { text: string; href?: string }[],
  stats: [
    { value: "2+", label: "years in industry & research" },
    { value: "20+", label: "robotics & AI projects" },
    { value: "2", label: "hackathon wins in 2026: RoboHack EPFL & ERH Zurich" },
    { value: "Top 5%", label: "MSc, University of Seville" },
  ],
  socials: {
    github: "https://github.com/Javgilavi",
    linkedin: "https://www.linkedin.com/in/javigilaviles/",
    x: "https://x.com/Javgilavi_18",
  },
  languages: [
    { name: "Spanish", level: "Native" },
    { name: "English", level: "C1 / C2" },
    { name: "German", level: "A2" },
  ],
  openTo:
    "Open to internships and roles in perception, computer vision and physical AI, worldwide.",
} as const;

export type Experience = {
  company: string;
  role: string;
  period: string;
  location: string;
  href?: string;
  points: string[];
  tags: string[];
};

export const experience: Experience[] = [
  {
    company: "Hilti AG",
    role: "Computer Vision Research",
    period: "2026 — present",
    location: "Schaan, Liechtenstein",
    href: "https://www.hilti.group",
    points: [
      "Computer vision research for construction: 3D perception and mapping from site captures.",
    ],
    tags: ["Computer vision", "3D perception", "SLAM"],
  },
  {
    company: "ETH Zurich · Computer Vision and Geometry Group (CVG)",
    role: "Research collaborator",
    period: "Aug 2026 — present",
    location: "Zurich, Switzerland (remote)",
    href: "https://cvg.ethz.ch",
    points: [
      "Co-authoring a paper in preparation on geometric minimal solvers for camera pose estimation.",
      "C++ solver work, RANSAC and numerical-stability studies, and real-data localization experiments on ETH3D.",
      "Open-source fix merged into CVG's LIMAP mapping toolbox (multiscale line-descriptor serialization, PR #169).",
    ],
    tags: ["Multi-view geometry", "Minimal solvers", "C++", "PoseLib", "LIMAP"],
  },
  {
    company: "VIKTOR",
    role: "AI Engineer (part-time)",
    period: "Mar 2026 — present",
    location: "Rotterdam, Netherlands",
    href: "https://www.viktor.ai",
    points: [
      "R&D on internal AI tooling, including Model Context Protocol (MCP) servers and retrieval-augmented generation (RAG).",
    ],
    tags: ["MCP", "RAG", "LLM tooling"],
  },
  {
    company: "eProsima",
    role: "Robotics Software Engineer",
    period: "Oct 2024 — Aug 2025",
    location: "Madrid, Spain",
    href: "https://www.eprosima.com",
    points: [
      "Contributed to Fast DDS, the OMG-standard middleware behind low-latency ROS 2 communication.",
      "Lead backend developer for the EU SustainML project, which helps developers build ML models with lower CO₂ emissions.",
      "Built a C++ backend exposed to Python through SWIG, with DDS communication, a Qt/QML frontend and REST APIs.",
      "Integrated transformer models and RAG pipelines with European research and industry partners.",
    ],
    tags: ["C++", "Fast DDS", "SWIG", "Qt/QML", "RAG"],
  },
  {
    company: "GRVC Robotics Lab · University of Seville",
    role: "Robotics Research Assistant",
    period: "Sep 2023 — Sep 2024",
    location: "Seville, Spain",
    href: "https://grvc.us.es",
    points: [
      "Built a real-time multi-sensor, multi-obstacle tracking system for Navantia's unmanned surface vehicle.",
      "Worked with ROS 2 and computer vision on both simulated and real robots.",
      "Turned research concepts into working software for Horizon Europe aerial-robotics projects.",
    ],
    tags: ["ROS 2", "C++", "Kalman filters", "Sensor fusion"],
  },
  {
    company: "FlyROS",
    role: "Project Engineer",
    period: "Sep 2023 — Sep 2024",
    location: "Seville, Spain",
    href: "https://aerostream.fer.hr",
    points: [
      "Represented FlyROS and the University of Seville in the Horizon Europe AeroSTREAM project, supporting aerial-robotics development in Croatia and Bosnia & Herzegovina.",
    ],
    tags: ["Horizon Europe", "Aerial robotics"],
  },
  {
    company: "Alter Technology TÜV Nord",
    role: "Digitalization & Radiation Engineering Intern",
    period: "Feb 2023 — May 2023",
    location: "Seville, Spain",
    href: "https://www.altertechnology-group.com/en",
    points: [
      "Studied space-radiation effects on EEE components in the Space Parts Laboratory and automated COTS test-data digitalization with a Python tool.",
    ],
    tags: ["Python", "Space hardware"],
  },
];

export const education = [
  {
    school: "Delft University of Technology",
    degree: "MSc Robotics",
    period: "2025 — present",
    detail:
      "Computer vision & AI track: Machine Learning for Robotics, Advanced Machine Perception, Computer Vision, 3D Vision. Honours Programme student.",
  },
  {
    school: "University of Seville",
    degree: "MSc Electronic, Robotics & Automation Engineering",
    period: "2024 — 2025",
    detail:
      "Top 5%. Thesis: multi-sensor, multi-obstacle tracking for maritime vehicles (C++, ROS 2, Fast DDS), validated at GRVC.",
  },
  {
    school: "University of Seville",
    degree: "BSc Electronics, Robotics & Mechatronics Engineering",
    period: "2019 — 2023",
    detail:
      "Top 10%. Thesis: classical vs CNN road-lane detection for autonomous guidance. 10/10 in Robot Fundamentals and Perception Systems.",
  },
];

export const leadership: { title: string; org: string; detail: string; period?: string }[] = [
  {
    title: "Robotics Vertical Lead, EuroTech Federation",
    org: "European student tech federation · co-organizer of the ERH Physical AI Hackathon",
    detail: "Leading the robotics vertical: building a European community of robotics students and builders through hackathons, events and partners.",
    period: "2026 — present",
  },
  {
    title: "External Affairs, ASIMOV",
    org: "TU Delft robotics study association · VI Board",
    detail: "Connecting more than 650 robotics engineers with companies such as MathWorks, NVIDIA and Festo, and with events and hackathons.",
    period: "2025 — present",
  },
  {
    title: "Perception Lead, Delft Neptunians",
    org: "RAMI 2026 marine robotics competition",
    detail: "Designing the ROS 2 perception stack (localization and target detection) for an autonomous underwater robot.",
    period: "2025 — present",
  },
  {
    title: "Co-founder & CTO, ServiAgro",
    org: "Innovation Prize, XIX Entrepreneurship Ideas Competition (US × Chamber of Commerce)",
    detail: "Modular retrofit kit that automates and digitalizes legacy agricultural machinery.",
    period: "2024",
  },
  {
    title: "Vice President, ESTIEM LG Seville",
    org: "European students of industrial engineering",
    detail: "Organized events linking engineering students and companies. Winner of the TIMES 2021 local round and 2nd in the Karlstad semifinal.",
    period: "2024 — 2025",
  },
  {
    title: "Member, The Exponential Fellowship",
    org: "Spanish AI & software community",
    detail: "Part of a network of young software and AI builders from Spain.",
  },
];

export const awards: { title: string; detail: string; year: string; href?: string }[] = [
  { title: "1st place — RoboHack 2026 at EPFL", detail: "ArgOS: natural-language control for a Unitree Go2", year: "2026", href: "https://github.com/JavideuS/argOS" },
  { title: "Track prize — ERH Physical AI Hackathon, Zurich", detail: "Liminal: dual-arm manipulation with FLUX 3 Action and Claude", year: "2026", href: "https://javiergil.dev/liminal/" },
  {
    title: "Innovation Prize — XIX Entrepreneurship Ideas Competition",
    detail: "ServiAgro · University of Seville & Chamber of Commerce",
    year: "2024",
    href: "https://etsi.us.es/noticias/actualidad-alumnos/el-alumnado-de-la-escuela-tecnica-superior-de-ingenieria-protagonistas-del-xix-concurso-de-ideas-de-emprendimiento-de-la-us",
  },
  { title: "Lane-detection lead — Autonomous Driving Challenge", detail: "SEAT × CUPRA × Volkswagen, University of Seville team", year: "2022" },
  { title: "TIMES 2021 — 1st local round, 2nd Karlstad semifinal", detail: "ESTIEM international case-study competition", year: "2021" },
  { title: "IBM — AI Fundamentals with Capstone", detail: "Certification", year: "2025" },
  { title: "Business for All", detail: "Certification · Harvard Business Publishing × Santander Open Academy", year: "2024" },
];

export const skills = [
  {
    group: "Perception",
    items: ["Computer vision", "3D detection", "Visual SLAM", "Sensor fusion", "Kalman filters", "Multi-object tracking", "Particle filters", "Gaussian splatting", "OpenCV", "YOLO / YOLOE", "MediaPipe", "DINOv2 / v3"],
  },
  {
    group: "Robot learning",
    items: ["PyTorch", "VLA / ACT policies", "LoRA fine-tuning", "World models", "Knowledge distillation", "LeRobot", "Teleoperation datasets", "Hugging Face", "SLURM / HPC"],
  },
  {
    group: "Robotics & simulation",
    items: ["ROS 2", "Fast DDS", "Nav2", "RTAB-Map", "MPC", "PRM / RRT*", "PDDL / PlanSys2", "Behavior trees", "MuJoCo", "Gazebo", "PyBullet", "Webots", "Isaac Lab"],
  },
  {
    group: "Agents & LLMs",
    items: ["LLM agents", "MCP", "RAG", "Claude / Claude Code", "Amazon Bedrock", "Ollama", "Playwright", "Speech (Whisper, ElevenLabs)"],
  },
  {
    group: "Software engineering",
    items: ["C++", "Python", "C", "MATLAB", "SQL", "CMake", "SWIG", "Qt / QML", "Linux", "Docker", "Git", "GitHub Actions"],
  },
  {
    group: "Web & cloud",
    items: ["TypeScript", "Next.js", "React", "Tailwind CSS", "FastAPI", "PostgreSQL", "REST APIs", "Vercel", "AWS (EC2, S3)", "Chrome extensions"],
  },
];
