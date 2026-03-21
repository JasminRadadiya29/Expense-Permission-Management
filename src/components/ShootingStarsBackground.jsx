import React from "react";
import { ShootingStars } from "./ui/shooting-stars";
import { StarsBackground } from "./ui/stars-background";

export function ShootingStarsBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-slate-900">
        <ShootingStars />
        <StarsBackground />
      </div>
    </div>
  );
}
