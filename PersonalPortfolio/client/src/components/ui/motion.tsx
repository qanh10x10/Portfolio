import { cn } from "@/lib/utils";
import { animate, motion, MotionProps } from "framer-motion";
import React, { useEffect, useRef } from "react";

interface MotionDivProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
}

export function FadeIn({ 
  children, 
  className, 
  ...props 
}: MotionDivProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SlideIn({ 
  children, 
  className, 
  ...props 
}: MotionDivProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface ProgressBarProps {
  percentage: number;
  className?: string;
}

export function ProgressBar({ percentage, className }: ProgressBarProps) {
  const progressRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const element = progressRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(
              element,
              { width: `${percentage}%` },
              { duration: 1, delay: 0.2 }
            );
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    observer.observe(element);
    
    return () => {
      if (element) observer.unobserve(element);
    };
  }, [percentage]);
  
  return (
    <div className="h-2 w-full bg-gray-700 rounded-full">
      <div
        ref={progressRef}
        className={cn("h-full bg-primary rounded-full", className)}
        style={{ width: "0%" }}
      />
    </div>
  );
}
