import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { generateMockEnhancedRoomMap } from '../../utils/mockMapData';
import { Button } from './Button';
import { Card } from './Card';
import { InteractiveMapController } from './InteractiveMapController';

export const MapDemo: React.FC = () => {
  const { theme } = useTheme();
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [showCleaningPath, setShowCleaningPath] = useState(true);
  const [showRobotTrail, setShowRobotTrail] = useState(true);
  const [enableRealTimeUpdates, setEnableRealTimeUpdates] = useState(true);

  // Generate mock map data
  const mockRoomMap = generateMockEnhancedRoomMap();

  // Handle room selection
  const handleRoomSelect = (roomId: string) => {
    setSelectedRooms(prev => 
      prev.includes(roomId) 
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  // Handle area selection
  const handleAreaSelect = (areaId: string) => {
    setSelectedAreas(prev => 
      prev.includes(areaId) 
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        {/* Header */}
        <Card style={{ marginBottom: 16, padding: 16 }}>
          <Text style={[
            theme.typography.h2,
            { color: theme.colors.text, marginBottom: 8 }
          ]}>
            Interactive Map Demo
          </Text>
          <Text style={[
            theme.typography.body,
            { color: theme.colors.textSecondary, lineHeight: 22 }
          ]}>
            This demonstrates the enhanced map visualization system with real-time updates, 
            interactive room selection, and remapping functionality.
          </Text>
        </Card>

        {/* Controls */}
        <Card style={{ marginBottom: 16, padding: 16 }}>
          <Text style={[
            theme.typography.h3,
            { color: theme.colors.text, marginBottom: 12 }
          ]}>
            Map Controls
          </Text>
          
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button
                title={showCleaningPath ? 'Hide Path' : 'Show Path'}
                variant={showCleaningPath ? 'primary' : 'secondary'}
                onPress={() => setShowCleaningPath(!showCleaningPath)}
                style={{ flex: 1 }}
              />
              <Button
                title={showRobotTrail ? 'Hide Trail' : 'Show Trail'}
                variant={showRobotTrail ? 'primary' : 'secondary'}
                onPress={() => setShowRobotTrail(!showRobotTrail)}
                style={{ flex: 1 }}
              />
            </View>
            
            <Button
              title={enableRealTimeUpdates ? 'Disable Real-time' : 'Enable Real-time'}
              variant={enableRealTimeUpdates ? 'primary' : 'secondary'}
              onPress={() => setEnableRealTimeUpdates(!enableRealTimeUpdates)}
            />
            
            <Button
              title="Clear Selections"
              variant="secondary"
              onPress={() => {
                setSelectedRooms([]);
                setSelectedAreas([]);
              }}
            />
          </View>
        </Card>

        {/* Selection Status */}
        {(selectedRooms.length > 0 || selectedAreas.length > 0) && (
          <Card style={{ marginBottom: 16, padding: 16 }}>
            <Text style={[
              theme.typography.h3,
              { color: theme.colors.text, marginBottom: 8 }
            ]}>
              Current Selection
            </Text>
            
            {selectedRooms.length > 0 && (
              <View style={{ marginBottom: 8 }}>
                <Text style={[
                  theme.typography.caption,
                  { color: theme.colors.textSecondary, marginBottom: 4 }
                ]}>
                  Selected Rooms:
                </Text>
                <Text style={[
                  theme.typography.body,
                  { color: theme.colors.text }
                ]}>
                  {selectedRooms.join(', ')}
                </Text>
              </View>
            )}
            
            {selectedAreas.length > 0 && (
              <View>
                <Text style={[
                  theme.typography.caption,
                  { color: theme.colors.textSecondary, marginBottom: 4 }
                ]}>
                  Selected Areas:
                </Text>
                <Text style={[
                  theme.typography.body,
                  { color: theme.colors.text }
                ]}>
                  {selectedAreas.join(', ')}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Interactive Map */}
        <InteractiveMapController
          initialRoomMap={mockRoomMap}
          onRoomSelect={handleRoomSelect}
          onAreaSelect={handleAreaSelect}
          selectedRooms={selectedRooms}
          selectedAreas={selectedAreas}
          showCleaningPath={showCleaningPath}
          showRobotTrail={showRobotTrail}
          enableRealTimeUpdates={enableRealTimeUpdates}
        />

        {/* Feature List */}
        <Card style={{ marginTop: 16, padding: 16 }}>
          <Text style={[
            theme.typography.h3,
            { color: theme.colors.text, marginBottom: 12 }
          ]}>
            Interactive Features
          </Text>
          
          <View style={{ gap: 8 }}>
            <FeatureItem 
              icon="🗺️" 
              title="Re-map Room" 
              description="Tap the Re-map button to start a new mapping session"
            />
            <FeatureItem 
              icon="👆" 
              title="Room Selection" 
              description="Tap on rooms to select them for cleaning"
            />
            <FeatureItem 
              icon="🔍" 
              title="Zoom & Pan" 
              description="Pinch to zoom and drag to pan around the map"
            />
            <FeatureItem 
              icon="🤖" 
              title="Real-time Updates" 
              description="Watch the robot's position and cleaning progress live"
            />
            <FeatureItem 
              icon="🛤️" 
              title="Cleaning Path" 
              description="See the robot's cleaning path with smooth animations"
            />
            <FeatureItem 
              icon="🚫" 
              title="No-Go Zones" 
              description="View restricted areas with warning indicators"
            />
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => {
  const { theme } = useTheme();
  
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[
          theme.typography.body,
          { color: theme.colors.text, fontWeight: '600', marginBottom: 2 }
        ]}>
          {title}
        </Text>
        <Text style={[
          theme.typography.caption,
          { color: theme.colors.textSecondary, lineHeight: 16 }
        ]}>
          {description}
        </Text>
      </View>
    </View>
  );
};