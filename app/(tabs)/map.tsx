import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '../../components/ui/Card';
import { EnhancedMapView } from '../../components/ui/EnhancedMapView';
import { RemapDialog } from '../../components/ui/RemapDialog';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { useRobotState } from '../../hooks/useRobotState';
import { useTheme } from '../../hooks/useTheme';
import { RoomMap } from '../../types/robot';

// Mock room map data
const mockRoomMap: RoomMap = {
  id: 'home-map-1',
  name: 'Home Layout',
  lastUpdated: new Date(),
  dimensions: {
    width: 1000,
    height: 800,
    scale: 10
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
      cleaningStatus: 'completed'
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
      cleaningStatus: 'in_progress'
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
  cleaningPath: [
    { x: 200, y: 200, timestamp: new Date(), action: 'move' as const },
    { x: 250, y: 200, timestamp: new Date(), action: 'move' as const },
    { x: 300, y: 200, timestamp: new Date(), action: 'move' as const },
    { x: 350, y: 200, timestamp: new Date(), action: 'move' as const }
  ]
};

export default function MapScreen() {
  const { theme } = useTheme();
  const { state: robotState, dispatch } = useRobotState();
  const [showRemapDialog, setShowRemapDialog] = useState(false);

  const handleRemapRoom = () => {
    setShowRemapDialog(true);
  };

  const handleConfirmRemap = () => {
    // Start remapping process
    dispatch({
      type: 'UPDATE_STATUS',
      payload: 'cleaning' // Robot will start mapping
    });
    
    setShowRemapDialog(false);
    
    // Simulate mapping completion
    setTimeout(() => {
      dispatch({
        type: 'UPDATE_STATUS',
        payload: 'docked'
      });
    }, 5000);
  };

  const handleCancelRemap = () => {
    setShowRemapDialog(false);
  };

  const isActive = robotState.status === 'cleaning' || robotState.status === 'paused';
  const currentRoom = robotState.currentTask?.progress.currentRoom || '';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Room Map
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Interactive home layout and cleaning progress
          </Text>
        </View>

        {/* Status Card */}
        <Card glassmorphism style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Current Status
            </Text>
            <StatusIndicator
              status={robotState.status}
              label=""
            />
          </View>
          
          {isActive && currentRoom && (
            <Text style={[styles.currentRoom, { color: theme.colors.textSecondary }]}>
              Currently cleaning: {currentRoom}
            </Text>
          )}
          
          <Text style={[styles.lastUpdated, { color: theme.colors.textSecondary }]}>
            Map last updated: {mockRoomMap.lastUpdated.toLocaleDateString()}
          </Text>
        </Card>

        {/* Enhanced Map View */}
        <Card glassmorphism style={styles.mapCard}>
          <EnhancedMapView
            roomMap={{
              ...mockRoomMap,
              areas: [],
              noGoZones: [],
              markers: [],
              cleaningZones: [],
              viewport: {
                center: { x: 200, y: 200 },
                zoom: 1,
                rotation: 0
              }
            }}
            robotPosition={robotState.position}
            showRobotTrail={isActive}
            showCleaningPath={isActive}
            interactive={true}
          />
        </Card>

        {/* Map Controls */}
        <Card glassmorphism style={styles.controlsCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Map Controls
          </Text>
          
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              onPress={handleRemapRoom}
              style={[styles.controlButton, styles.outlineButton, { opacity: isActive ? 0.5 : 1 }]}
              disabled={isActive}
            >
              <Text style={styles.outlineButtonText}>Re-map Room</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                // Navigate to full screen map view
                console.log('Opening full screen map');
              }}
              style={[styles.controlButton, styles.secondaryButton]}
            >
              <Text style={styles.secondaryButtonText}>View Full Screen</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.controlsNote, { color: theme.colors.textSecondary }]}>
            Tap and drag to pan around the map. Pinch to zoom in and out.
          </Text>
        </Card>

        {/* Room Statistics */}
        <Card glassmorphism style={styles.statsCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Room Statistics
          </Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {mockRoomMap.rooms.length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Total Rooms
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>
                {mockRoomMap.rooms.filter(r => r.cleaningStatus === 'completed').length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Cleaned
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.warning }]}>
                {mockRoomMap.rooms.filter(r => r.cleaningStatus === 'in_progress').length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                In Progress
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.textSecondary }]}>
                {mockRoomMap.rooms.filter(r => r.cleaningStatus === 'pending').length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Pending
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Remap Dialog */}
      <RemapDialog
        visible={showRemapDialog}
        onClose={handleCancelRemap}
        onStartRemap={handleConfirmRemap}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 100 : 90,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 24,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.8,
    marginBottom: 4,
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Display',
        fontWeight: '700',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  statusCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  currentRoom: {
    fontSize: 14,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  lastUpdated: {
    fontSize: 12,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  mapCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    minHeight: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  controlsCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 12,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4F8EF7',
  },
  outlineButtonText: {
    color: '#4F8EF7',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F8F9FB',
  },
  secondaryButtonText: {
    color: '#222222',
    fontSize: 14,
    fontWeight: '600',
  },
  controlsNote: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  statsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
});