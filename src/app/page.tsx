import { Hero } from "@/components/hero";
import { About, Contact, EducationLeadership, Experience, Skills, Work } from "@/components/sections";

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
