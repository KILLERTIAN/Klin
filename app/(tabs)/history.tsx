import { AnalyticsDashboard } from '@/components/ui';
import { EmptyHistoryState } from '@/components/ui/EmptyHistoryState';
import { HistoryCard } from '@/components/ui/HistoryCard';
import { FilterType, HistoryFilters, SortOrder, SortType } from '@/components/ui/HistoryFilters';
import { useTheme } from '@/hooks/useTheme';
import { historyService } from '@/services/historyService';
import { CleaningSession } from '@/types/robot';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function HistoryScreen() {
  const { theme } = useTheme();
  const [sessions, setSessions] = useState<CleaningSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<CleaningSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [activeTab, setActiveTab] = useState<'history' | 'analytics'>('history');

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const history = await historyService.getCleaningHistory();
      setSessions(history);
      
      // Apply current filters and sorting
      const filtered = await historyService.getFilteredHistory(activeFilter, sortBy, sortOrder);
      setFilteredSessions(filtered);
    } catch (error) {
      console.error('Failed to load history:', error);
      Alert.alert('Error', 'Failed to load cleaning history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [activeFilter, sortBy, sortOrder]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }, [loadHistory]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleFilterChange = async (filter: FilterType) => {
    setActiveFilter(filter);
    try {
      const filtered = await historyService.getFilteredHistory(filter, sortBy, sortOrder);
      setFilteredSessions(filtered);
    } catch (error) {
      console.error('Failed to filter history:', error);
    }
  };

  const handleSortChange = async (newSortBy: SortType, newSortOrder: SortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    try {
      const filtered = await historyService.getFilteredHistory(activeFilter, newSortBy, newSortOrder);
      setFilteredSessions(filtered);
    } catch (error) {
      console.error('Failed to sort history:', error);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this cleaning session? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await historyService.deleteSession(sessionId);
              await loadHistory(); // Reload the list
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Failed to delete session:', error);
              Alert.alert('Error', 'Failed to delete session. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSessionPress = (session: CleaningSession) => {
    // For now, just expand the card (handled by the card component)
    // In the future, this could navigate to a detailed session view
  };

  const handleTabSwitch = (tab: 'history' | 'analytics') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const renderSessionCard = ({ item }: { item: CleaningSession }) => (
    <HistoryCard
      session={item}
      onPress={handleSessionPress}
      onDelete={handleDeleteSession}
    />
  );

  const renderTabHeader = () => (
    <View style={styles.tabHeader}>
      <View style={styles.titleContainer}>
        <MaterialCommunityIcons
          name={activeTab === 'history' ? 'history' : 'chart-line'}
          size={28}
          color={theme.colors.primary}
        />
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {activeTab === 'history' ? 'Cleaning History' : 'Analytics'}
        </Text>
      </View>
      
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'history' && styles.tabButtonActive,
            {
              backgroundColor: activeTab === 'history' 
                ? theme.colors.primary 
                : theme.mode === 'dark' 
                  ? 'rgba(255,255,255,0.1)' 
                  : 'rgba(0,0,0,0.05)',
            }
          ]}
          onPress={() => handleTabSwitch('history')}
        >
          <MaterialCommunityIcons
            name="history"
            size={16}
            color={activeTab === 'history' ? 'white' : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.tabButtonText,
              {
                color: activeTab === 'history' ? 'white' : theme.colors.textSecondary
              }
            ]}
          >
            History
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'analytics' && styles.tabButtonActive,
            {
              backgroundColor: activeTab === 'analytics' 
                ? theme.colors.primary 
                : theme.mode === 'dark' 
                  ? 'rgba(255,255,255,0.1)' 
                  : 'rgba(0,0,0,0.05)',
            }
          ]}
          onPress={() => handleTabSwitch('analytics')}
        >
          <MaterialCommunityIcons
            name="chart-line"
            size={16}
            color={activeTab === 'analytics' ? 'white' : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.tabButtonText,
              {
                color: activeTab === 'analytics' ? 'white' : theme.colors.textSecondary
              }
            ]}
          >
            Analytics
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'history' && sessions.length > 0 && (
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {filteredSessions.length} of {sessions.length} sessions
        </Text>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <EmptyHistoryState
      title="No Cleaning History"
      message="Start your first cleaning session to see your history here. Your Klin robot is ready to make your home spotless!"
      actionText="Start Cleaning"
      onAction={() => {
        // Navigate to home or manual cleaning
        // This would typically use navigation
        console.log('Navigate to cleaning');
      }}
      icon="robot-vacuum"
    />
  );

  const renderFilteredEmptyState = () => (
    <EmptyHistoryState
      title="No Results Found"
      message={`No cleaning sessions match your current filter "${activeFilter}". Try adjusting your filters to see more results.`}
      actionText="Clear Filters"
      onAction={() => handleFilterChange('all')}
      icon="filter-remove"
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons
            name="loading"
            size={32}
            color={theme.colors.primary}
          />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading history...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {sessions.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {renderTabHeader()}
          
          {activeTab === 'history' ? (
            <>
              <HistoryFilters
                activeFilter={activeFilter}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
              />
              
              {filteredSessions.length === 0 ? (
                renderFilteredEmptyState()
              ) : (
                <FlatList
                  data={filteredSessions}
                  renderItem={renderSessionCard}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.listContainer}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      tintColor={theme.colors.primary}
                      colors={[theme.colors.primary]}
                    />
                  }
                />
              )}
            </>
          ) : (
            <AnalyticsDashboard onRefresh={loadHistory} />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginLeft: 12,
    letterSpacing: -0.5,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  tabButtonActive: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    marginLeft: 40,
  },
  listContainer: {
    paddingBottom: 100, // Account for tab bar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
});