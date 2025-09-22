import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiStar,
  FiGift,
  FiZap,
  FiShield,
  FiDollarSign,
  FiSmile,
  FiAward,
  FiHexagon,
} from 'react-icons/fi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface TierData {
  id: number;
  name: string;
  color: string;
  gradient: string;
  glowColor: string;
  icon: React.ReactNode;
  requiredLevel: number;
  rewards: {
    icon: React.ReactNode;
    name: string;
    amount: string;
  }[];
}

interface TierRewardsProps {
  currentLevel?: number;
  currentXP?: number;
}

export const TierRewards: React.FC<TierRewardsProps> = ({ currentLevel = 15, currentXP = 750 }) => {
  const [hoveredTier, setHoveredTier] = useState<number | null>(null);

  const tiers: TierData[] = [
    {
      id: 1,
      name: 'Rookie',
      color: 'hsl(140 100% 50%)',
      gradient: 'linear-gradient(135deg, hsl(140 100% 50%), hsl(120 100% 60%))',
      glowColor: 'hsl(140 100% 50% / 0.5)',
      icon: <FiShield className="h-6 w-6" />,
      requiredLevel: 1,
      rewards: [
        { icon: <FiDollarSign className="h-4 w-4" />, name: 'Coins', amount: '100' },
        { icon: <FiSmile className="h-4 w-4" />, name: 'Emote', amount: '1' },
      ],
    },
    {
      id: 2,
      name: 'Bronze',
      color: 'hsl(30 100% 50%)',
      gradient: 'linear-gradient(135deg, hsl(30 100% 50%), hsl(20 100% 60%))',
      glowColor: 'hsl(30 100% 50% / 0.5)',
      icon: <FiStar className="h-6 w-6" />,
      requiredLevel: 10,
      rewards: [
        { icon: <FiDollarSign className="h-4 w-4" />, name: 'Coins', amount: '250' },
        { icon: <FiHexagon className="h-4 w-4" />, name: 'Gems', amount: '5' },
        { icon: <FiShield className="h-4 w-4" />, name: 'Frame', amount: '1' },
      ],
    },
    {
      id: 3,
      name: 'Silver',
      color: 'hsl(210 100% 60%)',
      gradient: 'linear-gradient(135deg, hsl(210 100% 60%), hsl(220 100% 70%))',
      glowColor: 'hsl(210 100% 60% / 0.5)',
      icon: <FiZap className="h-6 w-6" />,
      requiredLevel: 20,
      rewards: [
        { icon: <FiDollarSign className="h-4 w-4" />, name: 'Coins', amount: '500' },
        { icon: <FiHexagon className="h-4 w-4" />, name: 'Gems', amount: '10' },
        { icon: <FiGift className="h-4 w-4" />, name: 'Chest', amount: '1' },
        { icon: <FiSmile className="h-4 w-4" />, name: 'Emotes', amount: '3' },
      ],
    },
    {
      id: 4,
      name: 'Gold',
      color: 'hsl(50 100% 50%)',
      gradient: 'linear-gradient(135deg, hsl(50 100% 50%), hsl(45 100% 60%))',
      glowColor: 'hsl(50 100% 50% / 0.6)',
      icon: <FiAward className="h-6 w-6" />,
      requiredLevel: 30,
      rewards: [
        { icon: <FiDollarSign className="h-4 w-4" />, name: 'Coins', amount: '1000' },
        { icon: <FiHexagon className="h-4 w-4" />, name: 'Gems', amount: '25' },
        { icon: <FiGift className="h-4 w-4" />, name: 'Epic Chest', amount: '1' },
        { icon: <FiShield className="h-4 w-4" />, name: 'Golden Frame', amount: '1' },
      ],
    },
    {
      id: 5,
      name: 'Diamond',
      color: 'hsl(180 100% 60%)',
      gradient: 'linear-gradient(135deg, hsl(180 100% 60%), hsl(200 100% 70%))',
      glowColor: 'hsl(180 100% 60% / 0.6)',
      icon: <FiHexagon className="h-6 w-6" />,
      requiredLevel: 50,
      rewards: [
        { icon: <FiDollarSign className="h-4 w-4" />, name: 'Coins', amount: '2500' },
        { icon: <FiHexagon className="h-4 w-4" />, name: 'Gems', amount: '50' },
        { icon: <FiGift className="h-4 w-4" />, name: 'Diamond Chest', amount: '1' },
        { icon: <FiZap className="h-4 w-4" />, name: 'Power Boost', amount: '1' },
      ],
    },
    {
      id: 6,
      name: 'Mythic',
      color: 'hsl(270 100% 60%)',
      gradient: 'linear-gradient(135deg, hsl(270 100% 60%), hsl(290 100% 70%))',
      glowColor: 'hsl(270 100% 60% / 0.7)',
      icon: <FiZap className="h-6 w-6" />,
      requiredLevel: 75,
      rewards: [
        { icon: <FiDollarSign className="h-4 w-4" />, name: 'Coins', amount: '5000' },
        { icon: <FiHexagon className="h-4 w-4" />, name: 'Gems', amount: '100' },
        { icon: <FiGift className="h-4 w-4" />, name: 'Mythic Chest', amount: '1' },
        { icon: <FiAward className="h-4 w-4" />, name: 'Legendary Avatar', amount: '1' },
      ],
    },
    {
      id: 7,
      name: 'Eternal',
      color: 'hsl(0 100% 60%)',
      gradient: 'linear-gradient(135deg, hsl(0 100% 60%), hsl(50 100% 50%), hsl(0 100% 60%))',
      glowColor: 'hsl(0 100% 60% / 0.8)',
      icon: <FiAward className="h-6 w-6" />,
      requiredLevel: 100,
      rewards: [
        { icon: <FiDollarSign className="h-4 w-4" />, name: 'Coins', amount: '10000' },
        { icon: <FiHexagon className="h-4 w-4" />, name: 'Gems', amount: '250' },
        { icon: <FiGift className="h-4 w-4" />, name: 'Eternal Chest', amount: '1' },
        { icon: <FiAward className="h-4 w-4" />, name: 'Eternal Crown', amount: '1' },
        { icon: <FiZap className="h-4 w-4" />, name: 'Ultimate Power', amount: '∞' },
      ],
    },
  ];

  const getCurrentTier = () => {
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (currentLevel >= tiers[i].requiredLevel) {
        return tiers[i];
      }
    }
    return tiers[0];
  };

  const getNextTier = () => {
    const currentTier = getCurrentTier();
    const currentIndex = tiers.findIndex((tier) => tier.id === currentTier.id);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  };

  const getProgressToNextTier = () => {
    const nextTier = getNextTier();
    if (!nextTier) return 100;

    const currentTier = getCurrentTier();
    const progressInCurrentTier = currentLevel - currentTier.requiredLevel;
    const tierRange = nextTier.requiredLevel - currentTier.requiredLevel;
    return Math.min((progressInCurrentTier / tierRange) * 100, 100);
  };

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();
  const progressPercent = getProgressToNextTier();

  return (
    <div className="relative">
      {/* Cosmic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background opacity-50" />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <Card className="glass relative z-10 border-primary/20">
        <CardContent className="p-8">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold gradient-text mb-2">Tier Rewards System</h2>
            <p className="text-muted-foreground text-lg">
              Unlock epic rewards as you level up your gaming journey
            </p>
          </motion.div>

          {/* Current Progress Bar */}
          <motion.div
            className="mb-8 p-6 rounded-2xl bg-gradient-card border border-primary/20"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl" style={{ background: currentTier.gradient }}>
                  <div className="text-white">{currentTier.icon}</div>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{currentTier.name} Tier</h3>
                  <p className="text-muted-foreground">Level {currentLevel}</p>
                </div>
              </div>
              {nextTier && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Next: {nextTier.name}</p>
                  <p className="text-sm font-medium">Level {nextTier.requiredLevel}</p>
                </div>
              )}
            </div>

            <div className="relative">
              <Progress value={progressPercent} className="h-3 bg-muted/50" />
              <motion.div
                className="absolute inset-0 h-3 rounded-full"
                style={{
                  background: currentTier.gradient,
                  width: `${progressPercent}%`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>

            <div className="flex justify-between mt-2 text-sm">
              <span>Level {currentTier.requiredLevel}</span>
              {nextTier && <span>Level {nextTier.requiredLevel}</span>}
            </div>
          </motion.div>

          {/* Tier Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            {tiers.map((tier, index) => {
              const isUnlocked = currentLevel >= tier.requiredLevel;
              const isCurrent = tier.id === currentTier.id;
              const isHovered = hoveredTier === tier.id;

              return (
                <motion.div
                  key={tier.id}
                  className="relative group cursor-pointer"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  onHoverStart={() => setHoveredTier(tier.id)}
                  onHoverEnd={() => setHoveredTier(null)}
                  whileHover={{ scale: 1.1, y: -10 }}
                >
                  {/* Glow Effect */}
                  {(isUnlocked || isHovered) && (
                    <motion.div
                      className="absolute inset-0 rounded-full blur-xl opacity-50"
                      style={{ background: tier.glowColor }}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      }}
                    />
                  )}

                  {/* Tier Badge */}
                  <div
                    className={`relative w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                      isUnlocked
                        ? 'border-white/50 shadow-2xl'
                        : 'border-muted/50 grayscale opacity-60'
                    } ${isCurrent ? 'ring-4 ring-primary/50' : ''}`}
                    style={{
                      background: isUnlocked ? tier.gradient : 'hsl(var(--muted))',
                      boxShadow: isUnlocked ? `0 0 30px ${tier.glowColor}` : 'none',
                    }}
                  >
                    <div className={`text-white ${isUnlocked ? '' : 'text-muted-foreground'}`}>
                      {tier.icon}
                    </div>

                    {/* Current Tier Indicator */}
                    {isCurrent && (
                      <motion.div
                        className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <FiStar className="h-3 w-3 text-white" />
                      </motion.div>
                    )}

                    {/* Lock indicator for locked tiers */}
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                        <FiShield className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Tier Name and Level */}
                  <div className="text-center mt-3">
                    <p className="font-bold text-sm">{tier.name}</p>
                    <p className="text-xs text-muted-foreground">Lv. {tier.requiredLevel}</p>
                  </div>

                  {/* Hover Tooltip */}
                  {isHovered && (
                    <motion.div
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 z-20"
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    >
                      <Card className="glass border-primary/20 min-w-48">
                        <CardContent className="p-4">
                          <div className="text-center mb-3">
                            <h4 className="font-bold text-lg" style={{ color: tier.color }}>
                              {tier.name} Tier
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Required Level: {tier.requiredLevel}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-center">Rewards:</p>
                            {tier.rewards.map((reward, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                  <div className="text-primary">{reward.icon}</div>
                                  <span>{reward.name}</span>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {reward.amount}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Milestones Progress */}
          <motion.div
            className="bg-gradient-card rounded-2xl p-6 border border-primary/20"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <h3 className="text-xl font-bold mb-4 text-center">Milestone Progression</h3>
            <div className="flex justify-between items-center mb-4">
              {Array.from({ length: 11 }).map((_, i) => {
                const milestoneLevel = i * 10;
                const isReached = currentLevel >= milestoneLevel;

                return (
                  <motion.div key={i} className="relative" whileHover={{ scale: 1.2 }}>
                    <div
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                        isReached
                          ? 'bg-primary border-primary shadow-lg'
                          : 'bg-muted border-muted-foreground/50'
                      }`}
                      style={{
                        boxShadow: isReached ? '0 0 15px hsl(var(--primary) / 0.5)' : 'none',
                      }}
                    />
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                      {milestoneLevel}
                    </div>

                    {isReached && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary"
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
            <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(currentLevel / 100) * 100}%` }}
                transition={{ duration: 1.5, delay: 1 }}
              />
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
};
