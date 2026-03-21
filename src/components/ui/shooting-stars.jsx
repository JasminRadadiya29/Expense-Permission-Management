import React from "react";

export function ShootingStars() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Shooting stars */}
      <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse">
        <div className="absolute top-0 left-0 w-20 h-0.5 bg-gradient-to-r from-white to-transparent transform -rotate-12 origin-left"></div>
      </div>
      
      <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}>
        <div className="absolute top-0 left-0 w-16 h-0.5 bg-gradient-to-r from-white to-transparent transform -rotate-45 origin-left"></div>
      </div>
      
      <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '2s' }}>
        <div className="absolute top-0 left-0 w-24 h-0.5 bg-gradient-to-r from-white to-transparent transform -rotate-30 origin-left"></div>
      </div>
      
      <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '3s' }}>
        <div className="absolute top-0 left-0 w-18 h-0.5 bg-gradient-to-r from-white to-transparent transform -rotate-60 origin-left"></div>
      </div>
      
      <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '4s' }}>
        <div className="absolute top-0 left-0 w-14 h-0.5 bg-gradient-to-r from-white to-transparent transform -rotate-20 origin-left"></div>
      </div>
    </div>
  );
}
