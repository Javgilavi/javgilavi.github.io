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
    "Before Delft I worked on real systems: multi-obstacle tracking for a Navantia unmanned surface vessel at the GRVC lab, and Fast DDS middleware plus the SustainML backend at eProsima. Today I spend my time on 3D perception, vision-language-action policies and hackathon builds with real arms and humanoids.",
    "Outside the lab I connect students with industry as External Affairs at ASIMOV and lead perception for the Delft Neptunians underwater robotics team.",
  ],
  stats: [
    { value: "2+", label: "years in industry & research" },
    { value: "20+", label: "robotics & AI projects" },
    { value: "4", label: "physical-AI hackathons in 2026" },
    { value: "Top 5%", label: "MSc, University of Seville" },
  ],
  socials: {
    github: "https://github.com/Javgilavi",
    linkedin: "https://www.linkedin.com/in/javier-gil-avil%C3%A9s-1854aa235/",
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
      "Computer vision & AI track: Machine Learning for Robotics, Advanced Machine Perception, Computer Vision, 3D Vision.",
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

export const leadership = [
  {
    title: "External Affairs, ASIMOV",
    org: "TU Delft robotics study association",
    detail: "Connecting more than 650 robotics engineers with leading companies, partners and hackathons.",
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
];

export const awards = [
  { title: "Innovation Prize — XIX Entrepreneurship Ideas Competition", detail: "ServiAgro · University of Seville & Chamber of Commerce", year: "2024" },
  { title: "Lane-detection lead — Autonomous Driving Challenge", detail: "SEAT × CUPRA × Volkswagen, University of Seville team", year: "2022" },
  { title: "TIMES 2021 — 1st local round, 2nd Karlstad semifinal", detail: "ESTIEM international case-study competition", year: "2021" },
  { title: "IBM — AI Fundamentals with Capstone", detail: "Certification", year: "2025" },
];

export const skills = [
  {
    group: "Perception",
    items: ["Computer vision", "3D detection", "Visual SLAM", "Sensor fusion", "Kalman filters", "Multi-object tracking", "OpenCV", "YOLO / YOLOE", "MediaPipe", "DINOv2 / v3"],
  },
  {
    group: "Robot learning & AI",
    items: ["PyTorch", "VLA / ACT policies", "LoRA fine-tuning", "World models", "LLM agents", "MCP", "RAG", "Knowledge distillation"],
  },
  {
    group: "Robotics",
    items: ["ROS 2", "Fast DDS", "Nav2", "RTAB-Map", "MPC", "PRM / RRT*", "PDDL / PlanSys2", "LeRobot", "MuJoCo", "Gazebo", "PyBullet", "Webots"],
  },
  {
    group: "Engineering",
    items: ["C++", "Python", "C", "TypeScript", "MATLAB", "SQL", "Docker", "Linux", "CMake", "SLURM / HPC", "FastAPI", "Qt / QML", "Next.js"],
  },
];
