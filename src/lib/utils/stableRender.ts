'use client';

import { useEffect, useState } from 'react';

/**
 * A utility hook that prevents component flickering by ensuring
 * components only render once they're fully mounted and have data
 * 
 * @param Component The component to render
 * @param fallback Optional fallback component to show while loading
 * @returns A stable component that won't flicker
 */
export function useStableRender<T>(data: T | null | undefined, fallback: React.ReactNode = null) {
  const [mounted, setMounted] = useState(false);
  const [stableData, setStableData] = useState<T | null>(null);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  useEffect(() => {
    if (data) {
      setStableData(data);
    }
  }, [data]);
  
  const isReady = mounted && stableData;
  
  return {
    isReady,
    stableData,
    fallback
  };
}

/**
 * A higher-order component that prevents flickering by ensuring
 * the wrapped component only renders once it's fully mounted
 * 
 * @param Component The component to wrap
 * @param LoadingComponent Optional loading component
 * @returns A stable component that won't flicker
 */
export function withStableRendering<P extends object>(
  Component: React.ComponentType<P>,
  LoadingComponent: React.ComponentType<any> = () => null
) {
  return function StableComponent(props: P) {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
      setMounted(true);
      return () => setMounted(false);
    }, []);
    
    if (!mounted) {
      return <LoadingComponent />;
    }
    
    return <Component {...props} />;
  };
}