import { CleaningSession, UsageAnalytics } from '../types/robot';
import { storageService } from './storage';

export class HistoryService {
  // Generate mock data for development
  private generateMockSessions(): CleaningSession[] {
    const sessions: CleaningSession[] = [];
    const now = new Date();
    
    for (let i = 0; i < 15; i++) {
      const startTime = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000) - Math.random() * 12 * 60 * 60 * 1000);
      const duration = Math.floor(Math.random() * 90) + 30; // 30-120 minutes
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
      
      sessions.push({
        id: `session_${i + 1}`,
        startTime,
        endTime,
        duration,
        mode: Math.random() > 0.5 ? 'automatic' : 'manual',
        areaCovered: Math.floor(Math.random() * 80) + 20, // 20-100 sq meters
        batteryUsed: Math.floor(Math.random() * 60) + 20, // 20-80%
        roomsCleaned: this.getRandomRooms(),
        intensity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
        status: Math.random() > 0.1 ? 'completed' : (Math.random() > 0.5 ? 'interrupted' : 'error'),
        errorMessage: Math.random() > 0.9 ? 'Robot got stuck under furniture' : undefined
      });
    }
    
    return sessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  private getRandomRooms(): string[] {
    const allRooms = ['Living Room', 'Kitchen', 'Bedroom', 'Bathroom', 'Hallway', 'Office'];
    const numRooms = Math.floor(Math.random() * 4) + 1;
    const shuffled = allRooms.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numRooms);
  }

  async getCleaningHistory(): Promise<CleaningSession[]> {
    try {
      let history = await storageService.getCleaningHistory();
      
      // If no history exists, generate mock data for development
      if (history.length === 0) {
        history = this.generateMockSessions();
        // Save mock data
        for (const session of history) {
          await storageService.saveCleaningSession(session);
        }
      }
      
      return history;
    } catch (error) {
      console.error('Failed to get cleaning history:', error);
      return [];
    }
  }

  async getFilteredHistory(
    filter: 'all' | 'completed' | 'error' | 'today' | 'week' | 'month' = 'all',
    sortBy: 'date' | 'duration' | 'area' = 'date',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<CleaningSession[]> {
    const history = await this.getCleaningHistory();
    let filtered = [...history];

    // Apply filters
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (filter) {
      case 'completed':
        filtered = filtered.filter(session => session.status === 'completed');
        break;
      case 'error':
        filtered = filtered.filter(session => session.status === 'error');
        break;
      case 'today':
        filtered = filtered.filter(session => session.startTime >= today);
        break;
      case 'week':
        filtered = filtered.filter(session => session.startTime >= weekAgo);
        break;
      case 'month':
        filtered = filtered.filter(session => session.startTime >= monthAgo);
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.startTime.getTime() - b.startTime.getTime();
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
        case 'area':
          comparison = a.areaCovered - b.areaCovered;
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }

  async calculateAnalytics(): Promise<UsageAnalytics> {
    const history = await this.getCleaningHistory();
    
    if (history.length === 0) {
      return {
        totalSessions: 0,
        totalCleaningTime: 0,
        totalAreaCleaned: 0,
        averageSessionDuration: 0,
        mostCleanedRooms: [],
        weeklyUsage: []
      };
    }

    const totalSessions = history.length;
    const totalCleaningTime = history.reduce((sum, session) => sum + session.duration, 0);
    const totalAreaCleaned = history.reduce((sum, session) => sum + session.areaCovered, 0);
    const averageSessionDuration = totalCleaningTime / totalSessions;

    // Calculate most cleaned rooms
    const roomCounts: Record<string, number> = {};
    history.forEach(session => {
      session.roomsCleaned.forEach(room => {
        roomCounts[room] = (roomCounts[room] || 0) + 1;
      });
    });

    const mostCleanedRooms = Object.entries(roomCounts)
      .map(([roomId, count]) => ({ roomId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate weekly usage for the last 8 weeks
    const weeklyUsage = [];
    const now = new Date();
    
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const weekSessions = history.filter(session => 
        session.startTime >= weekStart && session.startTime < weekEnd
      );
      
      const weekDuration = weekSessions.reduce((sum, session) => sum + session.duration, 0);
      
      weeklyUsage.push({
        week: `Week ${8 - i}`,
        sessions: weekSessions.length,
        duration: weekDuration
      });
    }

    return {
      totalSessions,
      totalCleaningTime,
      totalAreaCleaned,
      averageSessionDuration,
      mostCleanedRooms,
      weeklyUsage
    };
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      const history = await storageService.getCleaningHistory();
      const updatedHistory = history.filter(session => session.id !== sessionId);
      
      // Clear and re-save the updated history
      await storageService.clearCleaningHistory();
      for (const session of updatedHistory) {
        await storageService.saveCleaningSession(session);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw error;
    }
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  formatArea(squareMeters: number): string {
    return `${squareMeters} m²`;
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  getStatusColor(status: CleaningSession['status']): string {
    switch (status) {
      case 'completed':
        return '#10B981'; // Success green
      case 'interrupted':
        return '#F59E0B'; // Warning orange
      case 'error':
        return '#EF4444'; // Error red
      default:
        return '#6B7280'; // Gray
    }
  }

  getStatusIcon(status: CleaningSession['status']): string {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'interrupted':
        return 'pause-circle';
      case 'error':
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  }
}

export const historyService = new HistoryService();