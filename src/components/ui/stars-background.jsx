import React from "react";

export function StarsBackground() {
  const generateStars = (count) => {
    return Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        className="absolute bg-white rounded-full animate-pulse"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: `${Math.random() * 3 + 1}px`,
          height: `${Math.random() * 3 + 1}px`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${Math.random() * 3 + 2}s`,
        }}
      />
    ));
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Large stars */}
      {generateStars(50)}
      
      {/* Medium stars */}
      {generateStars(100)}
      
      {/* Small stars */}
      {generateStars(200)}
    </div>
  );
}
