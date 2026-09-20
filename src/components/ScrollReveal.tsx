import { CSSProperties, ReactNode } from 'react';
import { useIntersectionObserver, UseIntersectionObserverOptions } from '../hooks/useIntersectionObserver';

export interface ScrollRevealProps extends UseIntersectionObserverOptions {
  children: ReactNode;
  /**
   * The animation direction.
   * 'up' (default): slides upward into position
   * 'down': slides downward into position
   * 'left': slides from left to right
   * 'right': slides from right to left
   * 'scale': zooms from 95% to 100%
   * 'none': pure opacity fade
   */
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';
  /**
   * Distance in pixels to travel (default: 32px)
   */
  distance?: number;
  /**
   * Animation duration in seconds (default: 0.75s)
   */
  duration?: number;
  /**
   * Transition delay in seconds (default: 0s)
   */
  delay?: number;
  /**
   * Whether to include a subtle cinematic un-blur effect (default: true)
   */
  blur?: boolean;
  /**
   * Optional custom CSS classes
   */
  className?: string;
  /**
   * HTML tag to render as (default: 'div')
   */
  as?: 'div' | 'section' | 'article' | 'li' | 'header' | 'footer' | 'span';
  /**
   * Unique HTML element ID for styling or targeting
   */
  id?: string;
  /**
   * Optional style object
   */
  style?: CSSProperties;
}

export function ScrollReveal({
  children,
  direction = 'up',
  distance = 28,
  duration = 0.75,
  delay = 0,
  blur = true,
  className = '',
  as = 'div',
  id,
  style = {},
  threshold = 0.12,
  rootMargin = '0px 0px -60px 0px',
  triggerOnce = true,
  disabled = false,
}: ScrollRevealProps) {
  const [ref, isIntersecting] = useIntersectionObserver<HTMLDivElement>({
    threshold,
    rootMargin,
    triggerOnce,
    disabled,
  });

  // Calculate transform offset based on direction
  const getInitialTransform = () => {
    switch (direction) {
      case 'up':
        return `translate3d(0, ${distance}px, 0)`;
      case 'down':
        return `translate3d(0, -${distance}px, 0)`;
      case 'left':
        return `translate3d(-${distance}px, 0, 0)`;
      case 'right':
        return `translate3d(${distance}px, 0, 0)`;
      case 'scale':
        return `scale(0.95)`;
      case 'none':
      default:
        return 'none';
    }
  };

  const Component = as as any;

  const animationStyle: CSSProperties = {
    ...style,
    opacity: isIntersecting ? 1 : 0,
    transform: isIntersecting ? 'translate3d(0, 0, 0) scale(1)' : getInitialTransform(),
    filter: blur ? (isIntersecting ? 'blur(0px)' : 'blur(5px)') : undefined,
    transitionProperty: 'opacity, transform, filter',
    transitionDuration: `${duration}s`,
    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)', // Smooth high-end easing
    transitionDelay: `${delay}s`,
    willChange: isIntersecting ? 'auto' : 'opacity, transform, filter',
  };

  return (
    <Component
      ref={ref}
      id={id}
      className={className}
      style={animationStyle}
    >
      {children}
    </Component>
  );
}
