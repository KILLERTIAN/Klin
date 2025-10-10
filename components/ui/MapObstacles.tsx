import React, { useEffect } from 'react';
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
    Pattern,
    Rect,
    Stop,
    LinearGradient as SvgLinearGradient,
    Text as SvgText,
} from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { NoGoZone, Obstacle, Point } from '../../types/robot';

interface MapObstaclesProps {
  obstacles: Obstacle[];
  noGoZones: NoGoZone[];
  mapWidth: number;
  mapHeight: number;
  mapDimensions: { width: number; height: number };
  showLabels?: boolean;
  animated?: boolean;
}

export const MapObstacles: React.FC<MapObstaclesProps> = ({
  obstacles,
  noGoZones,
  mapWidth,
  mapHeight,
  mapDimensions,
  showLabels = true,
  animated = true,
}) => {
  const { theme } = useTheme();

  // Animation values
  const pulseAnimation = useSharedValue(1);
  const warningAnimation = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      // Pulse animation for obstacles
      pulseAnimation.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1500 }),
          withTiming(1, { duration: 1500 })
        ),
        -1,
        false
      );

      // Warning animation for no-go zones
      warningAnimation.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0.3, { duration: 800 })
        ),
        -1,
        true
      );
    }
  }, [animated]);

  // Convert coordinates to SVG space
  const toSvgCoords = (point: Point): Point => ({
    x: (point.x / mapDimensions.width) * mapWidth,
    y: (point.y / mapDimensions.height) * mapHeight,
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

  // Calculate polygon center for labels
  const getPolygonCenter = (polygon: Point[]): Point => {
    if (polygon.length === 0) return { x: 0, y: 0 };
    
    const center = polygon.reduce(
      (acc, point) => ({
        x: acc.x + point.x,
        y: acc.y + point.y,
      }),
      { x: 0, y: 0 }
    );
    
    return {
      x: center.x / polygon.length,
      y: center.y / polygon.length,
    };
  };

  // Get obstacle color based on type
  const getObstacleColor = (type: Obstacle['type']): string => {
    switch (type) {
      case 'furniture':
        return theme.colors.textSecondary;
      case 'wall':
        return theme.colors.border;
      case 'stairs':
        return theme.colors.warning;
      case 'no_go_zone':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  // Get obstacle icon based on type
  const getObstacleIcon = (type: Obstacle['type']): string => {
    switch (type) {
      case 'furniture':
        return '🪑';
      case 'wall':
        return '🧱';
      case 'stairs':
        return '🪜';
      case 'no_go_zone':
        return '🚫';
      default:
        return '⚠️';
    }
  };

  // Animated styles
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  const warningStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      warningAnimation.value,
      [0, 1],
      [0.3, 0.8],
      Extrapolate.CLAMP
    ),
  }));

  return (
    <View style={{ width: mapWidth, height: mapHeight, position: 'absolute' }}>
      <Svg
        width={mapWidth}
        height={mapHeight}
        viewBox={`0 0 ${mapWidth} ${mapHeight}`}
      >
        <Defs>
          {/* No-go zone pattern */}
          <Pattern
            id="noGoPattern"
            patternUnits="userSpaceOnUse"
            width="20"
            height="20"
          >
            <Rect width="20" height="20" fill={theme.colors.error + '10'} />
            <Path
              d="M 0 20 L 20 0 M -5 5 L 5 -5 M 15 25 L 25 15"
              stroke={theme.colors.error}
              strokeWidth="2"
              opacity={0.3}
            />
          </Pattern>

          {/* Obstacle gradient */}
          <SvgLinearGradient id="obstacleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={theme.colors.textSecondary} stopOpacity={0.8} />
            <Stop offset="100%" stopColor={theme.colors.textSecondary} stopOpacity={0.4} />
          </SvgLinearGradient>

          {/* Warning gradient */}
          <SvgLinearGradient id="warningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={theme.colors.error} stopOpacity={0.6} />
            <Stop offset="100%" stopColor={theme.colors.error} stopOpacity={0.2} />
          </SvgLinearGradient>
        </Defs>

        {/* Render obstacles */}
        {obstacles.map((obstacle) => {
          const obstacleColor = getObstacleColor(obstacle.type);
          const center = toSvgCoords(getPolygonCenter(obstacle.polygon));
          const isNoGoZone = obstacle.type === 'no_go_zone';

          return (
            <G key={`obstacle-${obstacle.id}`}>
              {/* Obstacle shape */}
              <Path
                d={polygonToPath(obstacle.polygon)}
                fill={isNoGoZone ? 'url(#warningGradient)' : 'url(#obstacleGradient)'}
                stroke={obstacleColor}
                strokeWidth={isNoGoZone ? 3 : 2}
                strokeDasharray={isNoGoZone ? '8,4' : obstacle.isTemporary ? '4,2' : undefined}
              />

              {/* Obstacle center marker */}
              {animated ? (
                <Animated.View style={isNoGoZone ? warningStyle : pulseStyle}>
                  <Circle
                    cx={center.x}
                    cy={center.y}
                    r={8}
                    fill={obstacleColor}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                </Animated.View>
              ) : (
                <Circle
                  cx={center.x}
                  cy={center.y}
                  r={8}
                  fill={obstacleColor}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
              )}

              {/* Obstacle label */}
              {showLabels && (
                <SvgText
                  x={center.x}
                  y={center.y + 20}
                  fontSize={10}
                  fill={theme.colors.text}
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {getObstacleIcon(obstacle.type)}
                </SvgText>
              )}
            </G>
          );
        })}

        {/* Render no-go zones */}
        {noGoZones.map((zone) => {
          if (!zone.isActive) return null;

          const center = toSvgCoords(getPolygonCenter(zone.polygon));

          return (
            <G key={`no-go-${zone.id}`}>
              {/* No-go zone area */}
              <Path
                d={polygonToPath(zone.polygon)}
                fill="url(#noGoPattern)"
                stroke={theme.colors.error}
                strokeWidth={3}
                strokeDasharray="10,5"
              />

              {/* Warning overlay */}
              {animated ? (
                <Animated.View style={warningStyle}>
                  <Path
                    d={polygonToPath(zone.polygon)}
                    fill={theme.colors.error + '20'}
                  />
                </Animated.View>
              ) : (
                <Path
                  d={polygonToPath(zone.polygon)}
                  fill={theme.colors.error + '20'}
                />
              )}

              {/* Zone center marker */}
              <Circle
                cx={center.x}
                cy={center.y}
                r={12}
                fill={theme.colors.error}
                stroke="#FFFFFF"
                strokeWidth={3}
              />

              {/* Warning icon */}
              <SvgText
                x={center.x}
                y={center.y + 3}
                fontSize={12}
                fill="#FFFFFF"
                textAnchor="middle"
                fontWeight="bold"
              >
                ⚠
              </SvgText>

              {/* Zone label */}
              {showLabels && zone.name && (
                <SvgText
                  x={center.x}
                  y={center.y + 25}
                  fontSize={10}
                  fill={theme.colors.text}
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {zone.name}
                </SvgText>
              )}
            </G>
          );
        })}
      </Svg>
    </View>
  );
};