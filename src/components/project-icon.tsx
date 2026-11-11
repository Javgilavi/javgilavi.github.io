import {
  Bot,
  Brain,
  Cable,
  Camera,
  ConciergeBell,
  Drone,
  Gamepad2,
  Leaf,
  Map,
  MousePointerClick,
  Network,
  OctagonAlert,
  PersonStanding,
  Pill,
  Puzzle,
  Radar,
  Route,
  Ship,
  type LucideProps,
} from "lucide-react";
import type { IconKey } from "@/data/projects";

const icons = {
  arm: Bot,
  map: Map,
  radar: Radar,
  pill: Pill,
  humanoid: PersonStanding,
  gamepad: Gamepad2,
  cable: Cable,
  brain: Brain,
  agent: MousePointerClick,
  tray: ConciergeBell,
  leaf: Leaf,
  sign: OctagonAlert,
  ship: Ship,
  network: Network,
  drone: Drone,
  road: Route,
  puzzle: Puzzle,
  camera: Camera,
} satisfies Record<IconKey, React.ComponentType<LucideProps>>;

export function ProjectIcon({ name, ...props }: { name: IconKey } & LucideProps) {
  const Icon = icons[name];
  return <Icon {...props} />;
}
