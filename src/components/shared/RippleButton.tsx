'use client';

import * as React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type VariantProps } from 'class-variance-authority';

interface RippleButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function RippleButton({
  className,
  variant,
  size,
  asChild = false,
  onClick,
  children,
  ...props
}: RippleButtonProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const diameter = Math.max(rect.width, rect.height);

    /* Determine ripple color based on variant */
    const isLight =
      variant === 'outline' || variant === 'ghost' || variant === 'link' || variant === 'secondary';
    const rippleColor = isLight ? 'oklch(0.37 0.09 155 / 20%)' : 'oklch(1 0 0 / 20%)';

    const ripple = document.createElement('span');
    ripple.className = 'ripple-circle';
    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${x - diameter / 2}px`;
    ripple.style.top = `${y - diameter / 2}px`;
    ripple.style.backgroundColor = rippleColor;

    button.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());

    onClick?.(e);
  };

  return (
    <Button
      ref={buttonRef}
      variant={variant}
      size={size}
      className={cn('relative overflow-hidden', className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
}
