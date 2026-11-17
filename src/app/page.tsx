import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { About, Contact, EducationLeadership, Experience, Skills, Work } from "@/components/sections";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Work />
      <Experience />
      <Skills />
      <EducationLeadership />
      <Contact />
    </>
  );
}
