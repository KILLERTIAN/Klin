import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CleaningControls } from '../components/ui/CleaningControls';
import { RoomMapView } from '../components/ui/RoomMapView';
import { useRobotState } from '../hooks/useRobotState';
import { useTheme } from '../hooks/useTheme';
import { Point, RoomMap } from '../types/robot';

// Mock data for demonstration
const mockRoomMap: RoomMap = {
  id: 'home-map-1',
  name: 'Home Layout',
  lastUpdated: new Date(),
  dimensions: {
    width: 1000,
    height: 800,
    scale: 10 // 10 pixels per meter
  },
  rooms: [
    {
      id: 'living-room',
      name: 'Living Room',
      type: 'living_room',
      polygon: [
        { x: 100, y: 100 },
        { x: 400, y: 100 },
        { x: 400, y: 300 },
        { x: 100, y: 300 }
      ],
      isSelected: false,
      cleaningStatus: 'pending'
    },
    {
      id: 'kitchen',
      name: 'Kitchen',
      type: 'kitchen',
      polygon: [
        { x: 400, y: 100 },
        { x: 600, y: 100 },
        { x: 600, y: 250 },
        { x: 400, y: 250 }
      ],
      isSelected: false,
      cleaningStatus: 'pending'
    },
    {
      id: 'bedroom',
      name: 'Bedroom',
      type: 'bedroom',
      polygon: [
        { x: 100, y: 350 },
        { x: 350, y: 350 },
        { x: 350, y: 550 },
        { x: 100, y: 550 }
      ],
      isSelected: false,
      cleaningStatus: 'pending'
    },
    {
      id: 'bathroom',
      name: 'Bathroom',
      type: 'bathroom',
      polygon: [
        { x: 400, y: 300 },
        { x: 500, y: 300 },
        { x: 500, y: 400 },
        { x: 400, y: 400 }
      ],
      isSelected: false,
      cleaningStatus: 'pending'
    }
  ],
  obstacles: [
    {
      id: 'couch',
      type: 'furniture',
      polygon: [
        { x: 150, y: 150 },
        { x: 250, y: 150 },
        { x: 250, y: 200 },
        { x: 150, y: 200 }
      ],
      isTemporary: false
    }
  ],
  cleaningPath: []
};

export default function AutomaticScreen() {
  const { theme } = useTheme();
  const { state: robotState, dispatch } = useRobotState();
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [cleaningIntensity, setCleaningIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [cleaningPath, setCleaningPath] = useState<Point[]>([]);

  const handleRoomSelect = (roomId: string) => {
    setSelectedRooms(prev => {
      if (prev.includes(roomId)) {
        return prev.filter(id => id !== roomId);
      } else {
        return [...prev, roomId];
      }
    });
  };

  const handleStartPause = () => {
    if (robotState.status === 'cleaning') {
      // Pause cleaning
      dispatch({
        type: 'UPDATE_STATUS',
        payload: 'paused'
      });
    } else {
      // Start cleaning
      if (selectedRooms.length === 0) {
        // Select all rooms if none selected
        setSelectedRooms(mockRoomMap.rooms.map(room => room.id));
      }
      
      dispatch({
        type: 'START_TASK',
        payload: {
          id: `task-${Date.now()}`,
          mode: 'automatic',
          startTime: new Date(),
          estimatedDuration: 45,
          selectedRooms: selectedRooms.length > 0 ? selectedRooms : mockRoomMap.rooms.map(room => room.id),
          intensity: cleaningIntensity,
          progress: {
            percentage: 0,
            areaCovered: 0,
            currentRoom: mockRoomMap.rooms[0]?.name || 'Living Room'
          }
        }
      });
      
      dispatch({
        type: 'UPDATE_STATUS',
        payload: 'cleaning'
      });
    }
  };

  const handleReturnToDock = () => {
    dispatch({
      type: 'UPDATE_STATUS',
      payload: 'returning'
    });
    
    // Simulate returning to dock
    setTimeout(() => {
      dispatch({
        type: 'UPDATE_STATUS',
        payload: 'docked'
      });
      dispatch({
        type: 'COMPLETE_TASK'
      });
    }, 3000);
  };

  const isActive = robotState.status === 'cleaning' || robotState.status === 'paused';
  const isPaused = robotState.status === 'paused';
  const progress = robotState.currentTask?.progress.percentage || 0;
  const estimatedTime = robotState.currentTask?.estimatedDuration || 45;
  const currentRoom = robotState.currentTask?.progress.currentRoom || '';

  return (
    <LinearGradient
      colors={theme.mode === 'dark' ? ['#1a1a2e', '#16213e', '#0f3460'] : ['#e8f5e8', '#c8e6c9', '#a5d6a7']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity 
                onPress={() => router.back()}
                style={[styles.backButton, { backgroundColor: theme.colors.surface + '80' }]}
              >
                <Ionicons 
                  name="arrow-back" 
                  size={24} 
                  color={theme.colors.text} 
                />
              </TouchableOpacity>
              <View style={styles.headerTitles}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                  Automatic Mode
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  Select rooms and start automated cleaning
                </Text>
              </View>
            </View>
          </View>

        {/* Room Map */}
        <RoomMapView
          roomMap={mockRoomMap}
          robotPosition={robotState.position}
          onRoomSelect={handleRoomSelect}
          selectedRooms={selectedRooms}
          showRobotTrail={isActive}
          cleaningPath={cleaningPath}
        />

        {/* Cleaning Controls */}
        <View style={{ paddingHorizontal: 16 }}>
          <CleaningControls
            intensity={cleaningIntensity}
            onIntensityChange={setCleaningIntensity}
            isActive={isActive}
            isPaused={isPaused}
            onStartPause={handleStartPause}
            onReturnToDock={handleReturnToDock}
            progress={progress}
            estimatedTime={estimatedTime}
            currentRoom={currentRoom}
            disabled={selectedRooms.length === 0 && !isActive}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
});