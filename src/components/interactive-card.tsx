"use client";

import React from 'react';
import { Card } from './ui/card';
import { useInteractiveCard } from '@/hooks/use-interactive-card';
import { cn } from '@/lib/utils';

type InteractiveCardProps = React.ComponentProps<typeof Card>;

const InteractiveCard = React.forwardRef<HTMLDivElement, InteractiveCardProps>(
  ({ className, children, ...props }, forwardedRef) => {
    const { ref, style } = useInteractiveCard();
    
    // Combine refs if forwardedRef exists
    const combinedRef = (node: HTMLDivElement) => {
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    return (
      <Card ref={combinedRef} style={style} className={cn('card-3d-interactive', className)} {...props}>
        {children}
      </Card>
    );
  }
);

InteractiveCard.displayName = 'InteractiveCard';

export default InteractiveCard;
