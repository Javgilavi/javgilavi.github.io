import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-xs tracking-widest text-brand uppercase">404 · no detections</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">This frame is empty.</h1>
      <p className="mt-3 text-muted-foreground">The page you were looking for isn&apos;t in the map.</p>
      <Button asChild className="mt-8 rounded-full">
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
