import React, { useCallback, useEffect, useRef } from 'react';
import { EnhancedRoomMap, PathPoint, Point, RobotState } from '../../types/robot';

interface RealTimeMapUpdaterProps {
  robotState: RobotState;
  roomMap: EnhancedRoomMap;
  onMapUpdate: (updatedMap: EnhancedRoomMap) => void;
  onPathUpdate: (newPath: PathPoint[]) => void;
  updateInterval?: number; // milliseconds
  isActive?: boolean;
}

export const RealTimeMapUpdater: React.FC<RealTimeMapUpdaterProps> = ({
  robotState,
  roomMap,
  onMapUpdate,
  onPathUpdate,
  updateInterval = 1000, // 1 second default
  isActive = true,
}) => {
  const pathRef = useRef<PathPoint[]>(roomMap.cleaningPath || []);
  const lastPositionRef = useRef<Point>(robotState.position);
  const intervalRef = useRef<number | null>(null);

  // Update cleaning areas based on robot position and status
  const updateCleaningAreas = useCallback((currentMap: EnhancedRoomMap, robotPos: Point): EnhancedRoomMap => {
    if (robotState.status !== 'cleaning') return currentMap;

    const updatedAreas = currentMap.areas?.map(area => {
      // Check if robot is in this area
      const isInArea = isPointInPolygon(robotPos, area.polygon);
      
      if (isInArea && area.type === 'uncleaned') {
        // Convert uncleaned area to cleaning
        return {
          ...area,
          type: 'cleaning' as const,
          cleaningProgress: 10,
        };
      } else if (isInArea && area.type === 'cleaning') {
        // Update cleaning progress
        const newProgress = Math.min(100, (area.cleaningProgress || 0) + 5);
        return {
          ...area,
          cleaningProgress: newProgress,
          type: newProgress >= 100 ? 'cleaned' as const : 'cleaning' as const,
          cleanedAt: newProgress >= 100 ? new Date() : area.cleanedAt,
        };
      }
      
      return area;
    }) || [];

    // Update room cleaning status
    const updatedRooms = currentMap.rooms.map(room => {
      const isInRoom = isPointInPolygon(robotPos, room.polygon);
      
      if (isInRoom && robotState.status === 'cleaning') {
        if (room.cleaningStatus === 'pending') {
          return { ...room, cleaningStatus: 'in_progress' as const };
        }
      }
      
      return room;
    });

    return {
      ...currentMap,
      areas: updatedAreas,
      rooms: updatedRooms,
      lastUpdated: new Date(),
    };
  }, [robotState.status]);

  // Add new path point if robot has moved significantly
  const updateCleaningPath = useCallback((currentPath: PathPoint[], robotPos: Point): PathPoint[] => {
    const lastPoint = currentPath[currentPath.length - 1];
    
    // Only add point if robot has moved more than 0.5 meters or status changed
    if (!lastPoint || 
        getDistance(lastPoint, robotPos) > 0.5 || 
        lastPoint.action !== getActionFromStatus(robotState.status)) {
      
      const newPoint: PathPoint = {
        x: robotPos.x,
        y: robotPos.y,
        timestamp: new Date(),
        action: getActionFromStatus(robotState.status),
      };
      
      // Keep only last 1000 points to prevent memory issues
      const updatedPath = [...currentPath, newPoint].slice(-1000);
      return updatedPath;
    }
    
    return currentPath;
  }, [robotState.status]);

  // Real-time update loop
  useEffect(() => {
    if (!isActive || robotState.status === 'idle' || robotState.status === 'docked') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const currentPosition = robotState.position;
      
      // Update cleaning path
      const updatedPath = updateCleaningPath(pathRef.current, currentPosition);
      if (updatedPath !== pathRef.current) {
        pathRef.current = updatedPath;
        onPathUpdate(updatedPath);
      }
      
      // Update map areas and rooms
      const updatedMap = updateCleaningAreas(roomMap, currentPosition);
      if (updatedMap !== roomMap) {
        onMapUpdate(updatedMap);
      }
      
      lastPositionRef.current = currentPosition;
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, robotState, roomMap, updateInterval, updateCleaningPath, updateCleaningAreas, onMapUpdate, onPathUpdate]);

  // Reset path when cleaning starts
  useEffect(() => {
    if (robotState.status === 'cleaning' && 
        (lastPositionRef.current.x !== robotState.position.x || 
         lastPositionRef.current.y !== robotState.position.y)) {
      
      // If this is a new cleaning session, reset the path
      const lastPathPoint = pathRef.current[pathRef.current.length - 1];
      const timeSinceLastPoint = lastPathPoint ? 
        Date.now() - lastPathPoint.timestamp.getTime() : Infinity;
      
      // If more than 5 minutes since last point, start new path
      if (timeSinceLastPoint > 5 * 60 * 1000) {
        pathRef.current = [];
      }
    }
  }, [robotState.status, robotState.position]);

  // This component doesn't render anything, it's just for side effects
  return null;
};

// Utility functions
function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  if (polygon.length < 3) return false;
  
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    if (((polygon[i].y > point.y) !== (polygon[j].y > point.y)) &&
        (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)) {
      inside = !inside;
    }
  }
  return inside;
}

function getDistance(point1: Point, point2: Point): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function getActionFromStatus(status: RobotState['status']): PathPoint['action'] {
  switch (status) {
    case 'cleaning':
      return 'clean';
    case 'paused':
      return 'pause';
    case 'returning':
    case 'idle':
    default:
      return 'move';
  }
}