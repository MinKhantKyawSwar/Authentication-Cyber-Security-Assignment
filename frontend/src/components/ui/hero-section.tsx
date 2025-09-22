import React from 'react';
import { motion } from 'framer-motion';
import { FiZap, FiTrendingUp, FiAward } from 'react-icons/fi';
import { ParticleEffect } from '../animated-ui/floating-elements';

interface HeroSectionProps {
  username: string;
  level: number;
  xp: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ username, level, xp }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 20,
      },
    },
  };

  return (
    <motion.div
      className="relative min-h-[60vh] bg-gradient-to-br from-background via-background/90 to-primary/10 rounded-3xl overflow-hidden mb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <ParticleEffect />

      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, hsl(var(--primary)) 2px, transparent 0),
                           radial-gradient(circle at 75px 75px, hsl(var(--accent)) 1px, transparent 0)`,
            backgroundSize: '100px 100px',
          }}
        />
      </div>

      <div className="relative z-10 h-full flex items-center justify-center p-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Welcome Message */}
          <motion.div variants={itemVariants} className="mb-8">
            <motion.h1
              className="text-6xl md:text-8xl font-black mb-4"
              style={{
                background:
                  'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary-glow)))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Welcome Back
            </motion.h1>
            <motion.p
              className="text-3xl md:text-4xl font-bold text-foreground/90 mb-2"
              variants={itemVariants}
            >
              {username}!
            </motion.p>
            <motion.p className="text-lg md:text-xl text-muted-foreground" variants={itemVariants}>
              Ready to dominate the gaming arena?
            </motion.p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            <motion.div
              className="glass rounded-2xl p-6 border border-border/50"
              animate={{
                y: [-10, 10, -10],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <motion.div
                className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-primary flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <FiAward className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="font-bold text-2xl mb-1">Level {level}</h3>
              <p className="text-muted-foreground text-sm">Gaming Rank</p>
            </motion.div>

            <motion.div
              className="glass rounded-2xl p-6 border border-border/50"
              animate={{
                y: [-10, 10, -10],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
            >
              <motion.div
                className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-accent flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: -360 }}
                transition={{ duration: 0.5 }}
              >
                <FiZap className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="font-bold text-2xl mb-1">{xp.toLocaleString()}</h3>
              <p className="text-muted-foreground text-sm">Experience Points</p>
            </motion.div>

            <motion.div
              className="glass rounded-2xl p-6 border border-border/50"
              animate={{
                y: [-10, 10, -10],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 2,
              }}
            >
              <motion.div
                className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-gaming flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <FiTrendingUp className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="font-bold text-2xl mb-1">{100 - (xp % 100)}</h3>
              <p className="text-muted-foreground text-sm">XP to Next Level</p>
            </motion.div>
          </motion.div>

          {/* Level Progress Bar */}
          <motion.div className="mt-8 max-w-md mx-auto" variants={itemVariants}>
            <div className="relative">
              <div className="w-full bg-muted/30 rounded-full h-4 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${xp % 100}%` }}
                  transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                />
              </div>
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {xp % 100}%
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
