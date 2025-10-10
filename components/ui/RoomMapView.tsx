import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { PanGestureHandler, PinchGestureHandler } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { EnhancedRoomMap, Point, Room, RoomMap } from '../../types/robot';
import { generateMockEnhancedRoomMap, generateMockRobotPosition } from '../../utils/mockMapData';
import { Card } from './Card';
import { EnhancedMapView } from './EnhancedMapView';

interface RoomMapViewProps {
  roomMap?: RoomMap | EnhancedRoomMap;
  robotPosition?: Point;
  onRoomSelect?: (roomId: string) => void;
  selectedRooms?: string[];
  showRobotTrail?: boolean;
  cleaningPath?: Point[];
  // New props for enhanced features
  useEnhancedView?: boolean;
  showCleaningPath?: boolean;
  onRemapRequest?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const RoomMapView: React.FC<RoomMapViewProps> = ({
  roomMap: providedRoomMap,
  robotPosition: providedRobotPosition,
  onRoomSelect,
  selectedRooms = [],
  showRobotTrail = false,
  cleaningPath = [],
  useEnhancedView = true,
  showCleaningPath = false,
  onRemapRequest,
}) => {
  const { theme } = useTheme();
  const [mapDimensions, setMapDimensions] = useState({ width: 300, height: 300 });
  
  // Use mock data if no real data is provided (for demonstration)
  const roomMap = providedRoomMap || generateMockEnhancedRoomMap();
  const robotPosition = providedRobotPosition || generateMockRobotPosition();
  
  // If enhanced view is requested and we have an enhanced room map, use it
  if (useEnhancedView && 'areas' in roomMap) {
    return (
      <EnhancedMapView
        roomMap={roomMap as EnhancedRoomMap}
        robotPosition={robotPosition}
        robotRotation={45}
        cleaningPath={roomMap.cleaningPath}
        showCleaningPath={showCleaningPath}
        showRobotTrail={showRobotTrail}
        onRoomSelect={onRoomSelect}
        selectedRooms={selectedRooms}
        interactive={true}
        showControls={true}
        onRemapRequest={onRemapRequest}
      />
    );
  }
  
  // Animation values
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const robotPulse = useSharedValue(1);
  const trailOpacity = useSharedValue(0);

  // Robot animation
  useEffect(() => {
    // Pulse animation for robot marker
    const pulseAnimation = () => {
      robotPulse.value = withSpring(1.2, { damping: 10 }, () => {
        robotPulse.value = withSpring(1, { damping: 10 });
      });
    };
    
    const interval = setInterval(pulseAnimation, 2000);
    return () => clearInterval(interval);
  }, []);

  // Trail animation
  useEffect(() => {
    if (showRobotTrail && cleaningPath.length > 0) {
      trailOpacity.value = withTiming(1, { duration: 500 });
    } else {
      trailOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [showRobotTrail, cleaningPath.length]);

  // Gesture handlers - simplified approach
  const handlePinchGesture = (event: any) => {
    'worklet';
    if (event.nativeEvent.scale) {
      scale.value = Math.max(0.5, Math.min(3, event.nativeEvent.scale));
    }
  };

  const handlePanGesture = (event: any) => {
    'worklet';
    translateX.value = event.nativeEvent.translationX;
    translateY.value = event.nativeEvent.translationY;
  };

  const animatedMapStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const animatedRobotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: robotPulse.value }],
  }));

  const animatedTrailStyle = useAnimatedStyle(() => ({
    opacity: trailOpacity.value,
  }));

  // Convert room polygon to SVG path
  const roomToPath = (room: Room): string => {
    if (room.polygon.length === 0) return '';
    
    const scaledPoints = room.polygon.map(point => ({
      x: (point.x / roomMap.dimensions.width) * mapDimensions.width,
      y: (point.y / roomMap.dimensions.height) * mapDimensions.height,
    }));
    
    let path = `M ${scaledPoints[0].x} ${scaledPoints[0].y}`;
    for (let i = 1; i < scaledPoints.length; i++) {
      path += ` L ${scaledPoints[i].x} ${scaledPoints[i].y}`;
    }
    path += ' Z';
    
    return path;
  };

  // Convert cleaning path to SVG path
  const pathToSvgPath = (path: Point[]): string => {
    if (path.length === 0) return '';
    
    const scaledPoints = path.map(point => ({
      x: (point.x / roomMap.dimensions.width) * mapDimensions.width,
      y: (point.y / roomMap.dimensions.height) * mapDimensions.height,
    }));
    
    let svgPath = `M ${scaledPoints[0].x} ${scaledPoints[0].y}`;
    for (let i = 1; i < scaledPoints.length; i++) {
      svgPath += ` L ${scaledPoints[i].x} ${scaledPoints[i].y}`;
    }
    
    return svgPath;
  };

  // Handle room selection
  const handleRoomPress = (roomId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRoomSelect?.(roomId);
  };

  // Scale robot position to map coordinates
  const scaledRobotPosition = {
    x: (robotPosition.x / roomMap.dimensions.width) * mapDimensions.width,
    y: (robotPosition.y / roomMap.dimensions.height) * mapDimensions.height,
  };

  return (
    <Card glassmorphism style={{ margin: 16, overflow: 'hidden' }}>
      <View style={{ height: 400, position: 'relative' }}>
        {/* Map Header */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 16,
          paddingHorizontal: 4
        }}>
          <Text style={[
            theme.typography.h3,
            { color: theme.colors.text }
          ]}>
            Room Map
          </Text>
          <View style={{
            backgroundColor: theme.colors.success + '20',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: theme.borderRadius.small,
            borderWidth: 1,
            borderColor: theme.colors.success + '40'
          }}>
            <Text style={[
              theme.typography.caption,
              { color: theme.colors.success, fontWeight: '600' }
            ]}>
              {selectedRooms.length} Selected
            </Text>
          </View>
        </View>

        {/* Interactive Map */}
        <PinchGestureHandler onGestureEvent={handlePinchGesture}>
          <Animated.View style={{ flex: 1 }}>
            <PanGestureHandler onGestureEvent={handlePanGesture}>
              <Animated.View style={[{ flex: 1 }, animatedMapStyle]}>
                <Svg
                  width={mapDimensions.width}
                  height={mapDimensions.height}
                  viewBox={`0 0 ${mapDimensions.width} ${mapDimensions.height}`}
                  style={{
                    backgroundColor: theme.colors.surface + '40',
                    borderRadius: theme.borderRadius.medium,
                  }}
                >
                  {/* Gradient definitions */}
                  <Defs>
                    <SvgLinearGradient id="selectedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor={theme.colors.primary} stopOpacity={0.3} />
                      <Stop offset="100%" stopColor={theme.colors.accent} stopOpacity={0.1} />
                    </SvgLinearGradient>
                  </Defs>

                  {/* Rooms */}
                  {roomMap.rooms.map((room) => {
                    const isSelected = selectedRooms.includes(room.id);
                    const roomColor = isSelected 
                      ? theme.colors.primary + '60'
                      : theme.colors.surface + '80';
                    const strokeColor = isSelected
                      ? theme.colors.primary
                      : theme.colors.border;

                    return (
                      <React.Fragment key={room.id}>
                        {/* Room polygon */}
                        <Path
                          d={roomToPath(room)}
                          fill={roomColor}
                          stroke={strokeColor}
                          strokeWidth={isSelected ? 2 : 1}
                          onPress={() => handleRoomPress(room.id)}
                        />
                        
                        {/* Room selection overlay */}
                        {isSelected && (
                          <Path
                            d={roomToPath(room)}
                            fill="url(#selectedGradient)"
                            opacity={0.3}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}

                  {/* Obstacles */}
                  {roomMap.obstacles.map((obstacle) => (
                    <Path
                      key={obstacle.id}
                      d={roomToPath(obstacle as any)}
                      fill={theme.colors.error + '40'}
                      stroke={theme.colors.error}
                      strokeWidth={1}
                    />
                  ))}

                  {/* Cleaning Path Trail */}
                  {showRobotTrail && cleaningPath.length > 1 && (
                    <Animated.View style={animatedTrailStyle}>
                      <Path
                        d={pathToSvgPath(cleaningPath)}
                        fill="none"
                        stroke={theme.colors.accent}
                        strokeWidth={3}
                        strokeOpacity={0.7}
                        strokeDasharray="5,5"
                      />
                    </Animated.View>
                  )}

                  {/* Robot Position */}
                  <Animated.View style={animatedRobotStyle}>
                    <Circle
                      cx={scaledRobotPosition.x}
                      cy={scaledRobotPosition.y}
                      r={8}
                      fill={theme.colors.primary}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                    {/* Robot glow effect */}
                    <Circle
                      cx={scaledRobotPosition.x}
                      cy={scaledRobotPosition.y}
                      r={12}
                      fill={theme.colors.primary + '30'}
                      opacity={0.6}
                    />
                  </Animated.View>
                </Svg>
              </Animated.View>
            </PanGestureHandler>
          </Animated.View>
        </PinchGestureHandler>

        {/* Room Labels */}
        <View style={{
          position: 'absolute',
          top: 60,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none'
        }}>
          {roomMap.rooms.map((room) => {
            // Calculate room center for label positioning
            const centerX = room.polygon.reduce((sum, point) => sum + point.x, 0) / room.polygon.length;
            const centerY = room.polygon.reduce((sum, point) => sum + point.y, 0) / room.polygon.length;
            
            const scaledCenterX = (centerX / roomMap.dimensions.width) * mapDimensions.width;
            const scaledCenterY = (centerY / roomMap.dimensions.height) * mapDimensions.height;
            
            const isSelected = selectedRooms.includes(room.id);
            
            return (
              <Animated.View
                key={`label-${room.id}`}
                style={{
                  position: 'absolute',
                  left: scaledCenterX - 30,
                  top: scaledCenterY - 12,
                  width: 60,
                  alignItems: 'center',
                  transform: [
                    { scale: scale.value },
                    { translateX: translateX.value },
                    { translateY: translateY.value },
                  ],
                }}
              >
                <View style={{
                  backgroundColor: isSelected 
                    ? theme.colors.primary + 'E0'
                    : theme.glassmorphism.background,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: theme.borderRadius.small,
                  borderWidth: 1,
                  borderColor: isSelected 
                    ? theme.colors.primary
                    : theme.glassmorphism.border,
                  ...theme.shadows.small
                }}>
                  <Text style={[
                    theme.typography.caption,
                    { 
                      color: isSelected ? '#FFFFFF' : theme.colors.text,
                      fontWeight: '600',
                      textAlign: 'center'
                    }
                  ]}>
                    {room.name}
                  </Text>
                </View>
              </Animated.View>
            );
          })}
        </View>

        {/* Map Controls */}
        <View style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          flexDirection: 'column',
          gap: 8
        }}>
          {/* Zoom Controls */}
          <View style={{
            backgroundColor: theme.glassmorphism.background,
            borderRadius: theme.borderRadius.medium,
            borderWidth: 1,
            borderColor: theme.glassmorphism.border,
            overflow: 'hidden'
          }}>
            <TouchableOpacity
              style={{
                padding: 8,
                borderBottomWidth: 1,
                borderBottomColor: theme.glassmorphism.border
              }}
              onPress={() => {
                scale.value = withSpring(Math.min(3, scale.value * 1.2));
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[theme.typography.body, { color: theme.colors.text, textAlign: 'center' }]}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ padding: 8 }}
              onPress={() => {
                scale.value = withSpring(Math.max(0.5, scale.value * 0.8));
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[theme.typography.body, { color: theme.colors.text, textAlign: 'center' }]}>-</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  );
};