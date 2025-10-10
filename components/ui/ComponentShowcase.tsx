import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Button } from './Button';
import { Card } from './Card';
import { CircularProgress } from './CircularProgress';
import { ConnectionBadge } from './ConnectionBadge';
import { Slider } from './Slider';
import { StatusIndicator } from './StatusIndicator';
import { Switch } from './Switch';

export const ComponentShowcase: React.FC = () => {
  const { theme } = useTheme();
  const [switchValue, setSwitchValue] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);
  const [batteryLevel, setBatteryLevel] = useState(75);

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 24,
        textAlign: 'center'
      }}>
        UI Component Showcase
      </Text>

      {/* Buttons */}
      <Card style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, marginBottom: 12 }}>
          Buttons
        </Text>
        <View style={{ gap: 8 }}>
          <Button title="Primary Button" onPress={() => {}} />
          <Button title="Secondary Button" variant="secondary" onPress={() => {}} />
          <Button title="Gradient Button" variant="gradient" glowEffect onPress={() => {}} />
          <Button title="Outline Button" variant="outline" onPress={() => {}} />
          <Button title="Loading Button" loading onPress={() => {}} />
        </View>
      </Card>

      {/* Cards */}
      <Card style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, marginBottom: 12 }}>
          Cards
        </Text>
        <View style={{ gap: 8 }}>
          <Card>
            <Text style={{ color: theme.colors.text }}>Regular Card</Text>
          </Card>
          <Card glassmorphism>
            <Text style={{ color: theme.colors.text }}>Glassmorphism Card</Text>
          </Card>
          <Card gradient>
            <Text style={{ color: theme.colors.text }}>Gradient Card</Text>
          </Card>
        </View>
      </Card>

      {/* Switches */}
      <Card style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, marginBottom: 12 }}>
          Switches
        </Text>
        <View style={{ gap: 12 }}>
          <Switch
            label="Water Dispenser"
            value={switchValue}
            onValueChange={setSwitchValue}
          />
          <Switch
            label="Mopping Mode"
            value={true}
            onValueChange={() => {}}
            size="large"
          />
          <Switch
            label="Vacuum"
            value={false}
            onValueChange={() => {}}
            size="small"
          />
        </View>
      </Card>

      {/* Slider */}
      <Card style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, marginBottom: 12 }}>
          Slider
        </Text>
        <Slider
          label="Cleaning Intensity"
          value={sliderValue}
          onValueChange={setSliderValue}
          minimumValue={0}
          maximumValue={100}
          step={25}
          valueLabels={['Low', 'Medium', 'High']}
        />
      </Card>

      {/* Progress Indicators */}
      <Card style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, marginBottom: 12 }}>
          Progress Indicators
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
          <CircularProgress
            progress={batteryLevel}
            label="Battery"
            size={80}
            glowEffect
          />
          <CircularProgress
            progress={30}
            label="Cleaning"
            size={60}
            color={theme.colors.primary}
          />
          <CircularProgress
            progress={90}
            label="Storage"
            size={60}
            color={theme.colors.success}
          />
        </View>
      </Card>

      {/* Status Indicators */}
      <Card style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, marginBottom: 12 }}>
          Status Indicators
        </Text>
        <View style={{ gap: 8 }}>
          <StatusIndicator status="online" />
          <StatusIndicator status="cleaning" />
          <StatusIndicator status="charging" />
          <StatusIndicator status="error" />
          <StatusIndicator status="offline" />
        </View>
      </Card>

      {/* Connection Badges */}
      <Card style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, marginBottom: 12 }}>
          Connection Badges
        </Text>
        <View style={{ gap: 8 }}>
          <ConnectionBadge status="connected" signalStrength={85} />
          <ConnectionBadge status="connecting" />
          <ConnectionBadge status="weak" signalStrength={25} />
          <ConnectionBadge status="disconnected" />
        </View>
      </Card>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
};