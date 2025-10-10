import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Dimensions,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { PanGestureHandler, PinchGestureHandler } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { EnhancedRoomMap, PathPoint, Point } from '../../types/robot';
import { AnimatedPathComponent } from './AnimatedPath';
import { Card } from './Card';
import { MapObstacles } from './MapObstacles';
import { MapRenderer } from './MapRenderer';

interface EnhancedMapViewProps {
  roomMap: EnhancedRoomMap;
  robotPosition: Point;
  robotRotation?: number;
  cleaningPath?: PathPoint[];
  showCleaningPath?: boolean;
  showRobotTrail?: boolean;
  onRoomSelect?: (roomId: string) => void;
  onAreaSelect?: (areaId: string) => void;
  selectedRooms?: string[];
  selectedAreas?: string[];
  interactive?: boolean;
  showControls?: boolean;
  onRemapRequest?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const EnhancedMapView: React.FC<EnhancedMapViewProps> = ({
  roomMap,
  robotPosition,
  robotRotation = 0,
  cleaningPath = [],
  showCleaningPath = false,
  showRobotTrail = false,
  onRoomSelect,
  onAreaSelect,
  selectedRooms = [],
  selectedAreas = [],
  interactive = true,
  showControls = true,
  onRemapRequest,
}) => {
  const { theme } = useTheme();
  const [mapDimensions, setMapDimensions] = useState({ width: 320, height: 320 });
  
  // Animation values for gestures
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const mapOpacity = useSharedValue(1);

  // Map loading animation
  useEffect(() => {
    mapOpacity.value = 0;
    mapOpacity.value = withTiming(1, { duration: 800 });
  }, [roomMap.id]);

  // Calculate optimal map dimensions based on room map aspect ratio
  useEffect(() => {
    const aspectRatio = roomMap.dimensions.width / roomMap.dimensions.height;
    const maxWidth = screenWidth - 32; // Account for margins
    const maxHeight = 400;
    
    let width = maxWidth;
    let height = width / aspectRatio;
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    setMapDimensions({ width, height });
  }, [roomMap.dimensions]);

  // Gesture handlers - simplified approach
  const handlePinchGesture = (event: any) => {
    'worklet';
    if (interactive && event.nativeEvent.scale) {
      scale.value = Math.max(0.5, Math.min(4, event.nativeEvent.scale));
    }
  };

  const handlePanGesture = (event: any) => {
    'worklet';
    if (interactive) {
      translateX.value = event.nativeEvent.translationX;
      translateY.value = event.nativeEvent.translationY;
    }
  };

  // Animated styles
  const animatedMapStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    opacity: mapOpacity.value,
  }));

  // Handle room selection
  const handleRoomPress = useCallback((roomId: string) => {
    if (interactive && onRoomSelect) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onRoomSelect(roomId);
    }
  }, [interactive, onRoomSelect]);

  // Handle area selection
  const handleAreaPress = useCallback((areaId: string) => {
    if (interactive && onAreaSelect) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onAreaSelect(areaId);
    }
  }, [interactive, onAreaSelect]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    scale.value = withSpring(Math.min(4, scale.value * 1.3));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const zoomOut = useCallback(() => {
    scale.value = withSpring(Math.max(0.5, scale.value * 0.7));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const resetView = useCallback(() => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  return (
    <Card glassmorphism style={{ margin: 16, overflow: 'hidden' }}>
      <View style={{ minHeight: 450 }}>
        {/* Map Header */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 16,
          paddingHorizontal: 4
        }}>
          <View>
            <Text style={[
              theme.typography.h3,
              { color: theme.colors.text }
            ]}>
              {roomMap.name || 'Room Map'}
            </Text>
            <Text style={[
              theme.typography.caption,
              { color: theme.colors.textSecondary, marginTop: 2 }
            ]}>
              Last updated: {new Date(roomMap.lastUpdated).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {/* Selection indicator */}
            {(selectedRooms.length > 0 || selectedAreas.length > 0) && (
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
                  {selectedRooms.length + selectedAreas.length} Selected
                </Text>
              </View>
            )}

            {/* Re-map button */}
            {onRemapRequest && (
              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.primary + '20',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: theme.borderRadius.small,
                  borderWidth: 1,
                  borderColor: theme.colors.primary + '40'
                }}
                onPress={onRemapRequest}
              >
                <Text style={[
                  theme.typography.caption,
                  { color: theme.colors.primary, fontWeight: '600' }
                ]}>
                  Re-map
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Interactive Map Container */}
        <View style={{ 
          height: 400, 
          position: 'relative',
          backgroundColor: theme.colors.surface + '20',
          borderRadius: theme.borderRadius.medium,
          overflow: 'hidden'
        }}>
          {interactive ? (
            <PinchGestureHandler onGestureEvent={handlePinchGesture}>
              <Animated.View style={{ flex: 1 }}>
                <PanGestureHandler onGestureEvent={handlePanGesture}>
                  <Animated.View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center' }, animatedMapStyle]}>
                    {/* Main map renderer */}
                    <MapRenderer
                      roomMap={roomMap}
                      robotPosition={robotPosition}
                      robotRotation={robotRotation}
                      cleaningPath={cleaningPath}
                      showCleaningPath={showCleaningPath}
                      showRobotTrail={showRobotTrail}
                      mapWidth={mapDimensions.width}
                      mapHeight={mapDimensions.height}
                      onRoomPress={handleRoomPress}
                      onAreaPress={handleAreaPress}
                      selectedRooms={selectedRooms}
                      selectedAreas={selectedAreas}
                    />

                    {/* Obstacles overlay */}
                    <MapObstacles
                      obstacles={roomMap.obstacles}
                      noGoZones={roomMap.noGoZones || []}
                      mapWidth={mapDimensions.width}
                      mapHeight={mapDimensions.height}
                      mapDimensions={roomMap.dimensions}
                      showLabels={scale.value > 1.2}
                      animated={true}
                    />

                    {/* Animated cleaning path */}
                    {showCleaningPath && cleaningPath.length > 1 && (
                      <View style={{ position: 'absolute', top: 0, left: 0 }}>
                        <AnimatedPathComponent
                          pathPoints={cleaningPath}
                          mapWidth={mapDimensions.width}
                          mapHeight={mapDimensions.height}
                          mapDimensions={roomMap.dimensions}
                          strokeColor={theme.colors.primary}
                          strokeWidth={3}
                          strokeOpacity={0.8}
                          strokeDasharray="8,4"
                          animationDuration={3000}
                          showAnimation={true}
                        />
                      </View>
                    )}
                  </Animated.View>
                </PanGestureHandler>
              </Animated.View>
            </PinchGestureHandler>
          ) : (
            <Animated.View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center' }, animatedMapStyle]}>
              <MapRenderer
                roomMap={roomMap}
                robotPosition={robotPosition}
                robotRotation={robotRotation}
                cleaningPath={cleaningPath}
                showCleaningPath={showCleaningPath}
                showRobotTrail={showRobotTrail}
                mapWidth={mapDimensions.width}
                mapHeight={mapDimensions.height}
                onRoomPress={handleRoomPress}
                onAreaPress={handleAreaPress}
                selectedRooms={selectedRooms}
                selectedAreas={selectedAreas}
              />
            </Animated.View>
          )}

          {/* Map Controls */}
          {showControls && interactive && (
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
                overflow: 'hidden',
                ...theme.shadows.small
              }}>
                <TouchableOpacity
                  style={{
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.glassmorphism.border
                  }}
                  onPress={zoomIn}
                >
                  <Text style={[
                    theme.typography.body, 
                    { color: theme.colors.text, textAlign: 'center', fontWeight: '600' }
                  ]}>
                    +
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={{
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.glassmorphism.border
                  }}
                  onPress={zoomOut}
                >
                  <Text style={[
                    theme.typography.body, 
                    { color: theme.colors.text, textAlign: 'center', fontWeight: '600' }
                  ]}>
                    −
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={{ padding: 12 }}
                  onPress={resetView}
                >
                  <Text style={[
                    theme.typography.caption, 
                    { color: theme.colors.text, textAlign: 'center', fontWeight: '600' }
                  ]}>
                    ⌂
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Map Legend */}
          <View style={{
            position: 'absolute',
            top: 16,
            left: 16,
            backgroundColor: theme.glassmorphism.background,
            borderRadius: theme.borderRadius.small,
            borderWidth: 1,
            borderColor: theme.glassmorphism.border,
            padding: 8,
            ...theme.shadows.small
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <View style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.colors.primary,
                marginRight: 6
              }} />
              <Text style={[theme.typography.caption, { color: theme.colors.text }]}>
                Robot
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <View style={{
                width: 8,
                height: 8,
                borderRadius: 1,
                backgroundColor: theme.colors.success + '60',
                marginRight: 6
              }} />
              <Text style={[theme.typography.caption, { color: theme.colors.text }]}>
                Cleaned
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 8,
                height: 8,
                borderRadius: 1,
                backgroundColor: theme.colors.error + '60',
                marginRight: 6
              }} />
              <Text style={[theme.typography.caption, { color: theme.colors.text }]}>
                No-Go Zone
              </Text>
            </View>
          </View>
        </View>

        {/* Map Statistics */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginTop: 16,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border + '40'
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
              Rooms
            </Text>
            <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: '600' }]}>
              {roomMap.rooms.length}
            </Text>
          </View>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
              Areas
            </Text>
            <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: '600' }]}>
              {roomMap.areas?.length || 0}
            </Text>
          </View>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
              Obstacles
            </Text>
            <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: '600' }]}>
              {roomMap.obstacles.length}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
};