import { useState, useEffect } from "react";

function SpotlightBox({ children }) {
  const [pos, setPos] = useState({ x: -9999, y: -9999 });
  const [smoothPos, setSmoothPos] = useState({ x: -9999, y: -9999 });

  // Smooth cursor movement (lerp effect)
  useEffect(() => {
    let animationFrame;
    const animate = () => {
      setSmoothPos((prev) => ({
        x: prev.x + (pos.x - prev.x) * 0.1,
        y: prev.y + (pos.y - prev.y) * 0.1,
      }));
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [pos]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setPos({ x: -9999, y: -9999 });
    setSmoothPos({ x: -9999, y: -9999 });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="cursor-pointer md:h-[300px] relative rounded-2xl overflow-hidden bg-gradient-to-br bg-white shadow-lg"
    >
      {/* Spotlight border glow */}
      <div
        className="absolute inset-0 border-2 border-transparent rounded-2xl pointer-events-none transition-opacity duration-500 ease-out"
        style={{
          maskImage: `radial-gradient(180px at ${smoothPos.x}px ${smoothPos.y}px, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)`,
          WebkitMaskImage: `radial-gradient(180px at ${smoothPos.x}px ${smoothPos.y}px, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)`,
          background:
            "radial-gradient(circle, rgba(99,102,241,0.7) 0%, rgba(236,72,153,0.6) 60%, transparent 100%)",
          opacity: pos.x === -9999 ? 0 : 1,
          transition: "opacity 0.4s ease-in-out",
        }}
      />

      {/* Content */}
      <div className="flex items-center justify-center h-full text-xl font-bold text-neutral-700 relative z-10">
        {children}
      </div>
    </div>
  );
}

export default SpotlightBox;
