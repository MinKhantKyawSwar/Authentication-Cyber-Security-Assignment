import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const gamingButtonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 glow',
        gaming: 'bg-gradient-gaming text-white shadow-lg hover:scale-105 glow',
        accent: 'bg-accent text-accent-foreground shadow-lg hover:bg-accent/90 neon-glow',
        success: 'bg-success text-success-foreground shadow-lg hover:bg-success/90',
        warning: 'bg-warning text-warning-foreground shadow-lg hover:bg-warning/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive/90',
        outline:
          'border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground',
        ghost: 'text-foreground hover:bg-muted/50',
        glass: 'glass text-foreground hover:bg-card/90',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-lg px-8 text-base',
        xl: 'h-14 rounded-xl px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface GamingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gamingButtonVariants> {
  asChild?: boolean;
}

const GamingButton = React.forwardRef<HTMLButtonElement, GamingButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(gamingButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
GamingButton.displayName = 'GamingButton';

export { GamingButton, gamingButtonVariants };
