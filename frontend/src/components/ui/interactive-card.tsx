import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
  glowEffect?: boolean;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  className = '',
  hoverScale = 1.02,
  glowEffect = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{
        scale: hoverScale,
        y: -5,
      }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
    >
      {glowEffect && (
        <motion.div
          className="absolute inset-0 rounded-lg opacity-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--accent) / 0.3))',
            filter: 'blur(20px)',
          }}
          animate={{
            opacity: isHovered ? 0.6 : 0,
            scale: isHovered ? 1.05 : 1,
          }}
          transition={{ duration: 0.3 }}
        />
      )}
      <Card
        className={`glass relative z-10 border-border/50 ${isHovered ? 'border-primary/50' : ''} transition-colors duration-300`}
      >
        {children}
      </Card>
    </motion.div>
  );
};
