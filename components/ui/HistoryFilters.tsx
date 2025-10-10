import { useTheme } from '@/hooks/useTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export type FilterType = 'all' | 'completed' | 'error' | 'today' | 'week' | 'month';
export type SortType = 'date' | 'duration' | 'area';
export type SortOrder = 'asc' | 'desc';

interface HistoryFiltersProps {
  activeFilter: FilterType;
  sortBy: SortType;
  sortOrder: SortOrder;
  onFilterChange: (filter: FilterType) => void;
  onSortChange: (sortBy: SortType, sortOrder: SortOrder) => void;
}

const filterOptions: Array<{ key: FilterType; label: string; icon: string }> = [
  { key: 'all', label: 'All', icon: 'view-list' },
  { key: 'completed', label: 'Completed', icon: 'check-circle' },
  { key: 'error', label: 'Errors', icon: 'alert-circle' },
  { key: 'today', label: 'Today', icon: 'calendar-today' },
  { key: 'week', label: 'This Week', icon: 'calendar-week' },
  { key: 'month', label: 'This Month', icon: 'calendar-month' },
];

const sortOptions: Array<{ key: SortType; label: string; icon: string }> = [
  { key: 'date', label: 'Date', icon: 'calendar' },
  { key: 'duration', label: 'Duration', icon: 'clock' },
  { key: 'area', label: 'Area', icon: 'vector-square' },
];

export function HistoryFilters({
  activeFilter,
  sortBy,
  sortOrder,
  onFilterChange,
  onSortChange,
}: HistoryFiltersProps) {
  const { theme } = useTheme();
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [sortAnimation] = useState(new Animated.Value(0));

  const handleFilterPress = (filter: FilterType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFilterChange(filter);
  };

  const toggleSortOptions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const toValue = showSortOptions ? 0 : 1;
    
    Animated.spring(sortAnimation, {
      toValue,
      tension: 100,
      friction: 8,
      useNativeDriver: false,
    }).start();
    
    setShowSortOptions(!showSortOptions);
  };

  const handleSortPress = (newSortBy: SortType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (newSortBy === sortBy) {
      // Toggle sort order if same sort type
      onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Change sort type with default desc order
      onSortChange(newSortBy, 'desc');
    }
    
    setShowSortOptions(false);
    Animated.timing(sortAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const sortOptionsHeight = sortAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 60],
  });

  const sortOptionsOpacity = sortAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      {/* Filter Pills */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {filterOptions.map((option) => {
          const isActive = activeFilter === option.key;
          
          return (
            <TouchableOpacity
              key={option.key}
              onPress={() => handleFilterPress(option.key)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  isActive
                    ? [theme.colors.primary, theme.colors.accent]
                    : [
                        theme.mode === 'dark' 
                          ? 'rgba(255,255,255,0.1)' 
                          : 'rgba(255,255,255,0.9)',
                        theme.mode === 'dark' 
                          ? 'rgba(255,255,255,0.05)' 
                          : 'rgba(255,255,255,0.7)'
                      ]
                }
                style={[
                  styles.filterPill,
                  {
                    borderColor: isActive 
                      ? 'transparent' 
                      : theme.mode === 'dark' 
                        ? 'rgba(255,255,255,0.2)' 
                        : 'rgba(0,0,0,0.1)',
                  }
                ]}
              >
                <MaterialCommunityIcons
                  name={option.icon as any}
                  size={16}
                  color={isActive ? 'white' : theme.colors.text}
                />
                <Text
                  style={[
                    styles.filterText,
                    { color: isActive ? 'white' : theme.colors.text }
                  ]}
                >
                  {option.label}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Sort Controls */}
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[
            styles.sortButton,
            {
              backgroundColor: theme.mode === 'dark' 
                ? 'rgba(255,255,255,0.1)' 
                : 'rgba(255,255,255,0.9)',
              borderColor: theme.mode === 'dark' 
                ? 'rgba(255,255,255,0.2)' 
                : 'rgba(0,0,0,0.1)',
            }
          ]}
          onPress={toggleSortOptions}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="sort"
            size={16}
            color={theme.colors.text}
          />
          <Text style={[styles.sortText, { color: theme.colors.text }]}>
            Sort by {sortOptions.find(opt => opt.key === sortBy)?.label}
          </Text>
          <MaterialCommunityIcons
            name={sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'}
            size={16}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.sortOptionsContainer,
            {
              height: sortOptionsHeight,
              opacity: sortOptionsOpacity,
              backgroundColor: theme.mode === 'dark' 
                ? 'rgba(255,255,255,0.1)' 
                : 'rgba(255,255,255,0.95)',
              borderColor: theme.mode === 'dark' 
                ? 'rgba(255,255,255,0.2)' 
                : 'rgba(0,0,0,0.1)',
            }
          ]}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.sortOptionsRow}>
              {sortOptions.map((option) => {
                const isActive = sortBy === option.key;
                
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.sortOption,
                      {
                        backgroundColor: isActive 
                          ? theme.colors.primary 
                          : 'transparent',
                      }
                    ]}
                    onPress={() => handleSortPress(option.key)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name={option.icon as any}
                      size={14}
                      color={isActive ? 'white' : theme.colors.text}
                    />
                    <Text
                      style={[
                        styles.sortOptionText,
                        { color: isActive ? 'white' : theme.colors.text }
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sortContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  sortText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  sortOptionsContainer: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sortOptionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  sortOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});