import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useRobotState } from '../../hooks/useRobotState';
import { EnhancedRoomMap, PathPoint } from '../../types/robot';
import { EnhancedMapView } from './EnhancedMapView';
import { RealTimeMapUpdater } from './RealTimeMapUpdater';
import { RemapDialog } from './RemapDialog';

interface InteractiveMapControllerProps {
  initialRoomMap: EnhancedRoomMap;
  onRoomSelect?: (roomId: string) => void;
  onAreaSelect?: (areaId: string) => void;
  selectedRooms?: string[];
  selectedAreas?: string[];
  showCleaningPath?: boolean;
  showRobotTrail?: boolean;
  enableRealTimeUpdates?: boolean;
}

export const InteractiveMapController: React.FC<InteractiveMapControllerProps> = ({
  initialRoomMap,
  onRoomSelect,
  onAreaSelect,
  selectedRooms = [],
  selectedAreas = [],
  showCleaningPath = true,
  showRobotTrail = true,
  enableRealTimeUpdates = true,
}) => {
  const { state: robotState } = useRobotState();
  
  // Local state for map and remapping
  const [roomMap, setRoomMap] = useState<EnhancedRoomMap>(initialRoomMap);
  const [cleaningPath, setCleaningPath] = useState<PathPoint[]>(initialRoomMap.cleaningPath || []);
  const [showRemapDialog, setShowRemapDialog] = useState(false);
  const [isRemapping, setIsRemapping] = useState(false);
  const [remapProgress, setRemapProgress] = useState(0);

  // Handle map updates from real-time updater
  const handleMapUpdate = useCallback((updatedMap: EnhancedRoomMap) => {
    setRoomMap(updatedMap);
  }, []);

  // Handle path updates from real-time updater
  const handlePathUpdate = useCallback((newPath: PathPoint[]) => {
    setCleaningPath(newPath);
  }, []);

  // Handle remap request
  const handleRemapRequest = useCallback(() => {
    setShowRemapDialog(true);
  }, []);

  // Handle start remapping
  const handleStartRemap = useCallback(() => {
    setIsRemapping(true);
    setRemapProgress(0);
    
    // Simulate remapping progress
    const progressInterval = setInterval(() => {
      setRemapProgress(prev => {
        const newProgress = prev + Math.random() * 5 + 2; // Random progress 2-7%
        
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          
          // Simulate completion
          setTimeout(() => {
            setIsRemapping(false);
            setShowRemapDialog(false);
            setRemapProgress(0);
            
            // Generate new map data (in real app, this would come from the robot)
            const updatedMap: EnhancedRoomMap = {
              ...roomMap,
              id: `${roomMap.id}-remapped-${Date.now()}`,
              lastUpdated: new Date(),
              // Reset cleaning status
              rooms: roomMap.rooms.map(room => ({
                ...room,
                cleaningStatus: 'pending' as const,
              })),
              areas: roomMap.areas?.map(area => ({
                ...area,
                type: 'uncleaned' as const,
                cleaningProgress: 0,
                cleanedAt: undefined,
              })),
              cleaningPath: [],
            };
            
            setRoomMap(updatedMap);
            setCleaningPath([]);
          }, 1000);
          
          return 100;
        }
        
        return newProgress;
      });
    }, 200); // Update every 200ms
  }, [roomMap]);

  // Handle close remap dialog
  const handleCloseRemapDialog = useCallback(() => {
    if (!isRemapping) {
      setShowRemapDialog(false);
    }
  }, [isRemapping]);

  // Enhanced room selection with haptic feedback and validation
  const handleRoomSelect = useCallback((roomId: string) => {
    // Check if room is accessible (not blocked by obstacles)
    const room = roomMap.rooms.find(r => r.id === roomId);
    if (!room) return;
    
    // Validate selection based on robot state
    if (robotState.status === 'cleaning') {
      // Don't allow selection changes during active cleaning
      return;
    }
    
    onRoomSelect?.(roomId);
  }, [roomMap.rooms, robotState.status, onRoomSelect]);

  // Enhanced area selection
  const handleAreaSelect = useCallback((areaId: string) => {
    const area = roomMap.areas?.find(a => a.id === areaId);
    if (!area) return;
    
    // Don't allow selection of no-go zones
    if (area.type === 'no_go') return;
    
    onAreaSelect?.(areaId);
  }, [roomMap.areas, onAreaSelect]);

  return (
    <View style={{ flex: 1 }}>
      {/* Real-time map updater */}
      {enableRealTimeUpdates && (
        <RealTimeMapUpdater
          robotState={robotState}
          roomMap={roomMap}
          onMapUpdate={handleMapUpdate}
          onPathUpdate={handlePathUpdate}
          isActive={robotState.status === 'cleaning' || robotState.status === 'returning'}
        />
      )}

      {/* Enhanced map view */}
      <EnhancedMapView
        roomMap={roomMap}
        robotPosition={robotState.position}
        robotRotation={robotState.position.rotation || 0}
        cleaningPath={cleaningPath}
        showCleaningPath={showCleaningPath}
        showRobotTrail={showRobotTrail}
        onRoomSelect={handleRoomSelect}
        onAreaSelect={handleAreaSelect}
        selectedRooms={selectedRooms}
        selectedAreas={selectedAreas}
        interactive={true}
        showControls={true}
        onRemapRequest={handleRemapRequest}
      />

      {/* Remap dialog */}
      <RemapDialog
        visible={showRemapDialog}
        onClose={handleCloseRemapDialog}
        onStartRemap={handleStartRemap}
        isRemapping={isRemapping}
        progress={remapProgress}
      />
    </View>
  );
};