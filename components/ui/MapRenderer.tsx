import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import Svg, {
    Circle,
    Defs,
    G,
    Path,
    Stop,
    LinearGradient as SvgLinearGradient,
    Text as SvgText
} from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import {
    EnhancedRoomMap,
    MapArea,
    PathPoint,
    Point
} from '../../types/robot';

interface MapRendererProps {
  roomMap: EnhancedRoomMap;
  robotPosition: Point;
  robotRotation?: number;
  cleaningPath?: PathPoint[];
  showCleaningPath?: boolean;
  showRobotTrail?: boolean;
  mapWidth: number;
  mapHeight: number;
  scale?: number;
  onRoomPress?: (roomId: string) => void;
  onAreaPress?: (areaId: string) => void;
  selectedRooms?: string[];
  selectedAreas?: string[];
}

export const MapRenderer: React.FC<MapRendererProps> = ({
  roomMap,
  robotPosition,
  robotRotation = 0,
  cleaningPath = [],
  showCleaningPath = false,
  showRobotTrail = false,
  mapWidth,
  mapHeight,
  scale = 1,
  onRoomPress,
  onAreaPress,
  selectedRooms = [],
  selectedAreas = [],
}) => {
  const { theme } = useTheme();

  // Animation values
  const robotPulse = useSharedValue(1);
  const pathProgress = useSharedValue(0);
  const cleaningAnimation = useSharedValue(0);

  // Robot pulse animation
  useEffect(() => {
    robotPulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  // Cleaning path animation
  useEffect(() => {
    if (showCleaningPath && cleaningPath.length > 0) {
      pathProgress.value = withTiming(1, { duration: 2000 });
    } else {
      pathProgress.value = 0;
    }
  }, [showCleaningPath, cleaningPath.length]);

  // Cleaning area animation
  useEffect(() => {
    cleaningAnimation.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  // Convert coordinates to SVG space
  const toSvgCoords = (point: Point): Point => ({
    x: (point.x / roomMap.dimensions.width) * mapWidth,
    y: (point.y / roomMap.dimensions.height) * mapHeight,
  });

  // Convert polygon to SVG path
  const polygonToPath = (polygon: Point[]): string => {
    if (polygon.length === 0) return '';
    
    const svgPoints = polygon.map(toSvgCoords);
    let path = `M ${svgPoints[0].x} ${svgPoints[0].y}`;
    
    for (let i = 1; i < svgPoints.length; i++) {
      path += ` L ${svgPoints[i].x} ${svgPoints[i].y}`;
    }
    path += ' Z';
    
    return path;
  };

  // Convert path points to SVG path
  const pathToSvgPath = (path: PathPoint[]): string => {
    if (path.length === 0) return '';
    
    const svgPoints = path.map(point => toSvgCoords(point));
    let svgPath = `M ${svgPoints[0].x} ${svgPoints[0].y}`;
    
    for (let i = 1; i < svgPoints.length; i++) {
      svgPath += ` L ${svgPoints[i].x} ${svgPoints[i].y}`;
    }
    
    return svgPath;
  };

  // Get color for cleaning status
  const getCleaningStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return theme.colors.success;
      case 'in_progress':
        return theme.colors.primary;
      case 'pending':
        return theme.colors.textSecondary;
      case 'skipped':
        return theme.colors.warning;
      default:
        return theme.colors.surface;
    }
  };

  // Get area color based on type
  const getAreaColor = (area: MapArea): string => {
    switch (area.type) {
      case 'cleaned':
        return theme.colors.success + '40';
      case 'uncleaned':
        return theme.colors.surface + '60';
      case 'cleaning':
        return theme.colors.primary + '60';
      case 'no_go':
        return theme.colors.error + '40';
      default:
        return theme.colors.surface + '40';
    }
  };

  // Animated styles
  const robotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: robotPulse.value }],
  }));

  const pathAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      pathProgress.value,
      [0, 1],
      [0, 0.8],
      Extrapolate.CLAMP
    ),
  }));

  const cleaningAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      cleaningAnimation.value,
      [0, 0.5, 1],
      [0.3, 0.7, 0.3],
      Extrapolate.CLAMP
    ),
  }));

  // Memoized SVG elements for performance
  const svgElements = useMemo(() => {
    const elements: React.ReactElement[] = [];

    // Render map areas (cleaned/uncleaned zones)
    roomMap.areas?.forEach((area) => {
      const isSelected = selectedAreas.includes(area.id);
      const areaColor = getAreaColor(area);
      const strokeColor = isSelected ? theme.colors.primary : theme.colors.border;

      elements.push(
        <G key={`area-${area.id}`}>
          <Path
            d={polygonToPath(area.polygon)}
            fill={areaColor}
            stroke={strokeColor}
            strokeWidth={isSelected ? 2 : 1}
            onPress={() => onAreaPress?.(area.id)}
          />
          {area.type === 'cleaning' && (
            <Animated.View style={cleaningAnimatedStyle}>
              <Path
                d={polygonToPath(area.polygon)}
                fill={theme.colors.primary + '30'}
                opacity={0.5}
              />
            </Animated.View>
          )}
        </G>
      );
    });

    // Render rooms
    roomMap.rooms.forEach((room) => {
      const isSelected = selectedRooms.includes(room.id);
      const statusColor = getCleaningStatusColor(room.cleaningStatus);
      const roomColor = isSelected 
        ? theme.colors.primary + '40'
        : theme.colors.surface + '80';
      const strokeColor = isSelected ? theme.colors.primary : statusColor;

      elements.push(
        <G key={`room-${room.id}`}>
          <Path
            d={polygonToPath(room.polygon)}
            fill={roomColor}
            stroke={strokeColor}
            strokeWidth={isSelected ? 3 : 2}
            strokeDasharray={room.cleaningStatus === 'in_progress' ? '5,5' : undefined}
            onPress={() => onRoomPress?.(room.id)}
          />
          {isSelected && (
            <Path
              d={polygonToPath(room.polygon)}
              fill="url(#selectedGradient)"
              opacity={0.4}
            />
          )}
        </G>
      );
    });

    // Render obstacles
    roomMap.obstacles.forEach((obstacle) => {
      const obstacleColor = obstacle.type === 'no_go_zone' 
        ? theme.colors.error + '60'
        : theme.colors.textSecondary + '80';

      elements.push(
        <Path
          key={`obstacle-${obstacle.id}`}
          d={polygonToPath(obstacle.polygon)}
          fill={obstacleColor}
          stroke={theme.colors.error}
          strokeWidth={obstacle.type === 'no_go_zone' ? 2 : 1}
          strokeDasharray={obstacle.type === 'no_go_zone' ? '3,3' : undefined}
        />
      );
    });

    // Render no-go zones
    roomMap.noGoZones?.forEach((zone) => {
      if (!zone.isActive) return;

      elements.push(
        <G key={`no-go-${zone.id}`}>
          <Path
            d={polygonToPath(zone.polygon)}
            fill={theme.colors.error + '20'}
            stroke={theme.colors.error}
            strokeWidth={2}
            strokeDasharray="8,4"
          />
          {/* No-go zone pattern */}
          <Path
            d={polygonToPath(zone.polygon)}
            fill="url(#noGoPattern)"
            opacity={0.3}
          />
        </G>
      );
    });

    // Render cleaning zones
    roomMap.cleaningZones?.forEach((zone) => {
      if (!zone.isActive) return;

      const intensityColor = zone.intensity === 'high' 
        ? theme.colors.error
        : zone.intensity === 'medium'
        ? theme.colors.warning
        : theme.colors.success;

      elements.push(
        <Path
          key={`cleaning-zone-${zone.id}`}
          d={polygonToPath(zone.polygon)}
          fill={intensityColor + '20'}
          stroke={intensityColor}
          strokeWidth={2}
          strokeDasharray="6,2"
        />
      );
    });

    return elements;
  }, [
    roomMap,
    selectedRooms,
    selectedAreas,
    theme,
    mapWidth,
    mapHeight,
    onRoomPress,
    onAreaPress,
  ]);

  // Robot position in SVG coordinates
  const robotSvgPosition = toSvgCoords(robotPosition);

  return (
    <View style={{ width: mapWidth, height: mapHeight }}>
      <Svg
        width={mapWidth}
        height={mapHeight}
        viewBox={`0 0 ${mapWidth} ${mapHeight}`}
      >
        {/* Gradient definitions */}
        <Defs>
          <SvgLinearGradient id="selectedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={theme.colors.primary} stopOpacity={0.4} />
            <Stop offset="100%" stopColor={theme.colors.accent} stopOpacity={0.2} />
          </SvgLinearGradient>
          
          <SvgLinearGradient id="robotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={theme.colors.primary} stopOpacity={1} />
            <Stop offset="100%" stopColor={theme.colors.accent} stopOpacity={0.8} />
          </SvgLinearGradient>

          <SvgLinearGradient id="noGoPattern" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={theme.colors.error} stopOpacity={0.1} />
            <Stop offset="50%" stopColor="transparent" stopOpacity={0} />
            <Stop offset="100%" stopColor={theme.colors.error} stopOpacity={0.1} />
          </SvgLinearGradient>
        </Defs>

        {/* Map background */}
        <Path
          d={`M 0 0 L ${mapWidth} 0 L ${mapWidth} ${mapHeight} L 0 ${mapHeight} Z`}
          fill={theme.colors.surface + '20'}
        />

        {/* Render all map elements */}
        {svgElements}

        {/* Cleaning path trail */}
        {showRobotTrail && cleaningPath.length > 1 && (
          <Animated.View style={pathAnimatedStyle}>
            <Path
              d={pathToSvgPath(cleaningPath)}
              fill="none"
              stroke={theme.colors.accent}
              strokeWidth={3}
              strokeOpacity={0.7}
              strokeDasharray="8,4"
            />
          </Animated.View>
        )}

        {/* Current cleaning path */}
        {showCleaningPath && cleaningPath.length > 1 && (
          <Path
            d={pathToSvgPath(cleaningPath)}
            fill="none"
            stroke={theme.colors.primary}
            strokeWidth={2}
            strokeOpacity={0.8}
          />
        )}

        {/* Map markers */}
        {roomMap.markers?.map((marker) => {
          if (!marker.isVisible) return null;
          
          const markerPos = toSvgCoords(marker.position);
          const markerColor = marker.type === 'dock' 
            ? theme.colors.success
            : marker.type === 'obstacle'
            ? theme.colors.error
            : theme.colors.primary;

          return (
            <G key={`marker-${marker.id}`}>
              <Circle
                cx={markerPos.x}
                cy={markerPos.y}
                r={6}
                fill={markerColor}
                stroke="#FFFFFF"
                strokeWidth={2}
              />
              {marker.label && (
                <SvgText
                  x={markerPos.x}
                  y={markerPos.y - 12}
                  fontSize={10}
                  fill={theme.colors.text}
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {marker.label}
                </SvgText>
              )}
            </G>
          );
        })}

        {/* Robot position */}
        <Animated.View style={robotAnimatedStyle}>
          <G>
            {/* Robot glow effect */}
            <Circle
              cx={robotSvgPosition.x}
              cy={robotSvgPosition.y}
              r={16}
              fill={theme.colors.primary + '20'}
              opacity={0.6}
            />
            
            {/* Robot body */}
            <Circle
              cx={robotSvgPosition.x}
              cy={robotSvgPosition.y}
              r={10}
              fill="url(#robotGradient)"
              stroke="#FFFFFF"
              strokeWidth={2}
            />
            
            {/* Robot direction indicator */}
            <Path
              d={`M ${robotSvgPosition.x} ${robotSvgPosition.y - 10} 
                  L ${robotSvgPosition.x + 6} ${robotSvgPosition.y - 4}
                  L ${robotSvgPosition.x - 6} ${robotSvgPosition.y - 4} Z`}
              fill="#FFFFFF"
              transform={`rotate(${robotRotation} ${robotSvgPosition.x} ${robotSvgPosition.y})`}
            />
          </G>
        </Animated.View>
      </Svg>
    </View>
  );
};