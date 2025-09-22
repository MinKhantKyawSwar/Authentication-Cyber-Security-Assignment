import { cursorImg } from '@/assests';
import React, { useEffect, useState } from 'react';

const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const moveHandler = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', moveHandler);
    return () => {
      window.removeEventListener('mousemove', moveHandler);
    };
  }, []);

  return (
    <img
      src={cursorImg}
      alt="custom cursor"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '25px',
        height: '25px',
        pointerEvents: 'none',
        transform: 'translate(-5px, -5px)',
        zIndex: 9999,
      }}
    />
  );
};

export default CustomCursor;
