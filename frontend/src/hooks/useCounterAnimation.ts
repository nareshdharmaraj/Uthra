import { useEffect, useState } from 'react';

export const useCounterAnimation = (targetValue: number, duration: number = 2000, startOnMount: boolean = true) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!startOnMount) return;

    setIsAnimating(true);
    const startTime = Date.now();
    const startValue = 0;
    const endValue = targetValue;
    const totalDuration = duration;

    const animateCount = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      // Easing function for smooth animation (ease-out)
      const easeOutQuad = (t: number) => t * (2 - t);
      const easedProgress = easeOutQuad(progress);

      const value = Math.floor(startValue + (endValue - startValue) * easedProgress);
      setCurrentValue(value);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setCurrentValue(endValue);
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animateCount);
  }, [targetValue, duration, startOnMount]);

  return { currentValue, isAnimating };
};
