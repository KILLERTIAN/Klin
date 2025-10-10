import React, { useEffect } from 'react';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedProps,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { Path } from 'react-native-svg';
import { PathPoint, Point } from '../../types/robot';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface AnimatedPathProps {
  pathPoints: PathPoint[] | Point[];
  mapWidth: number;
  mapHeight: number;
  mapDimensions: { width: number; height: number };
  strokeColor: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  strokeDasharray?: string;
  animationDuration?: number;
  showAnimation?: boolean;
}

export const AnimatedPathComponent: React.FC<AnimatedPathProps> = ({
  pathPoints,
  mapWidth,
  mapHeight,
  mapDimensions,
  strokeColor,
  strokeWidth = 2,
  strokeOpacity = 0.8,
  strokeDasharray,
  animationDuration = 2000,
  showAnimation = true,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (showAnimation && pathPoints.length > 0) {
      progress.value = 0;
      progress.value = withTiming(1, { duration: animationDuration });
    } else {
      progress.value = pathPoints.length > 0 ? 1 : 0;
    }
  }, [pathPoints.length, showAnimation, animationDuration]);

  // Convert coordinates to SVG space
  const toSvgCoords = (point: Point): Point => ({
    x: (point.x / mapDimensions.width) * mapWidth,
    y: (point.y / mapDimensions.height) * mapHeight,
  });

  // Generate SVG path string
  const generatePath = (points: (PathPoint | Point)[], progressValue: number): string => {
    if (points.length === 0) return '';

    const totalPoints = points.length;
    const visiblePoints = Math.floor(totalPoints * progressValue);
    
    if (visiblePoints < 2) return '';

    const visiblePathPoints = points.slice(0, visiblePoints);
    const svgPoints = visiblePathPoints.map(toSvgCoords);
    
    let path = `M ${svgPoints[0].x} ${svgPoints[0].y}`;
    
    for (let i = 1; i < svgPoints.length; i++) {
      // Add smooth curves for better visual appeal
      if (i === svgPoints.length - 1) {
        path += ` L ${svgPoints[i].x} ${svgPoints[i].y}`;
      } else {
        const current = svgPoints[i];
        const next = svgPoints[i + 1];
        const controlX = current.x + (next.x - current.x) * 0.5;
        const controlY = current.y + (next.y - current.y) * 0.5;
        
        path += ` Q ${controlX} ${controlY} ${current.x} ${current.y}`;
      }
    }
    
    return path;
  };

  const animatedProps = useAnimatedProps(() => {
    const pathString = generatePath(pathPoints, progress.value);
    const opacity = interpolate(
      progress.value,
      [0, 0.1, 1],
      [0, strokeOpacity, strokeOpacity],
      Extrapolate.CLAMP
    );

    return {
      d: pathString,
      strokeOpacity: opacity,
    };
  });

  if (pathPoints.length === 0) return null;

  return (
    <AnimatedPath
      animatedProps={animatedProps}
      fill="none"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
};