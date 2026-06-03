'use client';

import { useState, type ReactNode } from 'react';
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  type PanInfo,
} from 'framer-motion';
import { cn } from '@/lib/utils';
import { Grid3X3, Layers, LayoutList } from 'lucide-react';

export type LayoutMode = 'stack' | 'grid' | 'list';

export interface CardData {
  id: string;
  title: string;
  description: ReactNode;
  icon?: ReactNode;
  color?: string;
}

export interface MorphingCardStackProps {
  cards?: CardData[];
  className?: string;
  defaultLayout?: LayoutMode;
  onCardClick?: (card: CardData) => void;
}

const layoutIcons = {
  stack: Layers,
  grid: Grid3X3,
  list: LayoutList,
};

const SWIPE_THRESHOLD = 50;

export function Component({
  cards = [],
  className,
  defaultLayout = 'stack',
  onCardClick,
}: MorphingCardStackProps) {
  const [layout, setLayout] = useState<LayoutMode>(defaultLayout);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  if (!cards || cards.length === 0) {
    return null;
  }

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const { offset, velocity } = info;
    const swipe = Math.abs(offset.x) * velocity.x;

    if (offset.x < -SWIPE_THRESHOLD || swipe < -1000) {
      // Swiped left - go to next card
      setActiveIndex((prev) => (prev + 1) % cards.length);
    } else if (offset.x > SWIPE_THRESHOLD || swipe > 1000) {
      // Swiped right - go to previous card
      setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }
    setIsDragging(false);
  };

  const getStackOrder = () => {
    const reordered = [];
    for (let i = 0; i < cards.length; i++) {
      const index = (activeIndex + i) % cards.length;
      reordered.push({ ...cards[index], stackPosition: i });
    }
    return reordered.reverse(); // Reverse so top card renders last (on top)
  };

  const getLayoutStyles = (stackPosition: number) => {
    switch (layout) {
      case 'stack':
        // Limit visual stack to max 3 offset cards so it doesn't overflow massively
        const visualPos = Math.min(stackPosition, 3);
        const isHidden = stackPosition > 3;
        return {
          top: visualPos * 6, // shift down slightly
          left: 0, // keep horizontally centered
          zIndex: cards.length - stackPosition,
          // alternate rotation direction for a realistic scattered stack
          rotate:
            visualPos === 0 ? 0 : (visualPos % 2 === 0 ? -2 : 2) * visualPos,
          scale: 1 - visualPos * 0.02, // shrink cards slightly as they go back
          opacity: isHidden ? 0 : 1,
          pointerEvents: isHidden ? 'none' : 'auto',
        };
      case 'grid':
        return {
          top: 0,
          left: 0,
          zIndex: 1,
          rotate: 0,
          scale: 1,
        };
      case 'list':
        return {
          top: 0,
          left: 0,
          zIndex: 1,
          rotate: 0,
          scale: 1,
        };
    }
  };

  const containerStyles = {
    stack: 'relative flex-1 w-full',
    grid: 'grid grid-cols-2 gap-3',
    list: 'flex flex-col gap-3',
  };

  return (
    <div
      className={cn('flex h-full w-full flex-col justify-between', className)}
    >
      {/* Cards Container */}
      <div className={cn(containerStyles[layout], 'mx-auto')}>
        {cards.map((card, i) => {
          // Calculate logical position in stack based on activeIndex
          const stackPosition = (i - activeIndex + cards.length) % cards.length;
          const styles = getLayoutStyles(stackPosition) as any;
          const isExpanded = expandedCard === card.id;
          const isTopCard = layout === 'stack' && stackPosition === 0;

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: styles.opacity ?? 1,
                scale: isExpanded ? 1.05 : (styles.scale ?? 1),
                x: 0,
                top: styles.top,
                left: styles.left,
                zIndex: styles.zIndex,
                rotate: styles.rotate,
                pointerEvents: styles.pointerEvents as any,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
              }}
              drag={isTopCard ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={handleDragEnd}
              whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
              onClick={() => {
                if (isDragging) return;
                setExpandedCard(isExpanded ? null : card.id);
                onCardClick?.(card);
              }}
              className={cn(
                'border-border bg-card cursor-pointer rounded-xl border p-6 shadow-sm',
                'hover:border-primary/50 transition-colors',
                // Use calc to ensure shifted cards stay within the container bounds
                layout === 'stack' && 'absolute h-[calc(100%-24px)] w-full',
                layout === 'stack' &&
                  isTopCard &&
                  'cursor-grab active:cursor-grabbing',
                layout === 'grid' && 'aspect-square w-full',
                layout === 'list' && 'w-full',
                isExpanded && 'ring-primary ring-2',
              )}
              style={{
                borderTop: card.color ? `4px solid ${card.color}` : undefined,
              }}
            >
              <div className="flex h-full flex-col justify-between gap-2">
                <div className="flex items-start gap-3">
                  {card.icon && (
                    <div className="bg-secondary text-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                      {card.icon}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-card-foreground truncate font-semibold">
                      {card.title}
                    </h3>
                    <p
                      className={cn(
                        'text-muted-foreground mt-1 text-sm',
                        layout === 'stack' && 'line-clamp-3',
                        layout === 'grid' && 'line-clamp-2',
                        layout === 'list' && 'line-clamp-1',
                      )}
                    >
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>

              {isTopCard && (
                <div className="absolute right-0 bottom-2 left-0 text-center">
                  <span className="text-muted-foreground/50 text-xs">
                    Swipe to navigate
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {layout === 'stack' && cards.length > 1 && (
        <div className="flex items-end justify-center gap-1.5 pb-2">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'h-1.5 rounded-full transition-all',
                index === activeIndex
                  ? 'bg-primary w-4'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50 w-1.5',
              )}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
