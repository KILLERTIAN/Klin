import { AppError, CleaningTask, ErrorType, RobotState } from '../types/robot';

export interface RobotApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

interface QueuedCommand {
  id: string;
  command: string;
  params: any;
  timestamp: Date;
  retryCount: number;
}

export class RobotApiService {
  private config: RobotApiConfig;
  private commandQueue: QueuedCommand[] = [];
  private isOnline: boolean = true;
  private isProcessingQueue: boolean = false;

  constructor(config: RobotApiConfig) {
    this.config = config;
  }

  async getRobotState(): Promise<RobotState> {
    try {
      const response = await this.makeRequest('/api/robot/state', 'GET');
      return response.data;
    } catch (error) {
      throw this.createAppError(ErrorType.API, 'FETCH_STATE_FAILED', 'Failed to fetch robot state', error);
    }
  }

  async sendCommand(command: string, params: any = {}): Promise<boolean> {
    if (!this.isOnline) {
      this.queueCommand(command, params);
      return false;
    }

    try {
      const response = await this.makeRequest('/api/robot/command', 'POST', {
        command,
        params,
        timestamp: new Date().toISOString()
      });
      return response.success;
    } catch (error) {
      // Queue command if network error
      if (this.isNetworkError(error)) {
        this.queueCommand(command, params);
        this.isOnline = false;
        return false;
      }
      throw this.createAppError(ErrorType.API, 'COMMAND_FAILED', `Failed to send command: ${command}`, error);
    }
  }

  async startManualControl(): Promise<boolean> {
    return this.sendCommand('start_manual_control');
  }

  async startAutomaticCleaning(task: Partial<CleaningTask>): Promise<boolean> {
    return this.sendCommand('start_automatic_cleaning', { task });
  }

  async pauseCleaning(): Promise<boolean> {
    return this.sendCommand('pause_cleaning');
  }

  async resumeCleaning(): Promise<boolean> {
    return this.sendCommand('resume_cleaning');
  }

  async returnToDock(): Promise<boolean> {
    return this.sendCommand('return_to_dock');
  }

  async moveRobot(direction: 'forward' | 'backward' | 'left' | 'right'): Promise<boolean> {
    return this.sendCommand('move', { direction });
  }

  async updateCapabilities(capabilities: RobotState['capabilities']): Promise<boolean> {
    return this.sendCommand('update_capabilities', { capabilities });
  }

  async toggleFunction(functionName: keyof RobotState['capabilities'], enabled: boolean): Promise<boolean> {
    return this.sendCommand('toggle_function', { functionName, enabled });
  }

  queueCommand(command: string, params: any = {}): void {
    const queuedCommand: QueuedCommand = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      command,
      params,
      timestamp: new Date(),
      retryCount: 0
    };

    this.commandQueue.push(queuedCommand);
    
    // Limit queue size to prevent memory issues
    if (this.commandQueue.length > 100) {
      this.commandQueue = this.commandQueue.slice(-50); // Keep last 50 commands
    }
  }

  async flushCommandQueue(): Promise<void> {
    if (this.isProcessingQueue || this.commandQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      const commandsToProcess = [...this.commandQueue];
      this.commandQueue = [];

      for (const queuedCommand of commandsToProcess) {
        try {
          const success = await this.sendCommand(queuedCommand.command, queuedCommand.params);
          
          if (!success) {
            // Re-queue if failed and under retry limit
            if (queuedCommand.retryCount < this.config.retryAttempts) {
              queuedCommand.retryCount++;
              this.commandQueue.push(queuedCommand);
            }
          }
        } catch (error) {
          // Re-queue if failed and under retry limit
          if (queuedCommand.retryCount < this.config.retryAttempts) {
            queuedCommand.retryCount++;
            this.commandQueue.push(queuedCommand);
          }
        }

        // Add small delay between commands to avoid overwhelming the robot
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/api/health', 'GET');
      this.isOnline = response.status === 'ok';
      
      if (this.isOnline && this.commandQueue.length > 0) {
        // Process queued commands when connection is restored
        this.flushCommandQueue();
      }
      
      return this.isOnline;
    } catch (error) {
      this.isOnline = false;
      return false;
    }
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  private async makeRequestWithRetry(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any): Promise<any> {
    let lastError: Error;

    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await this.makeRequest(endpoint, method, body);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.config.retryAttempts) {
          // Exponential backoff: 1s, 2s, 4s, 8s...
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  private isNetworkError(error: any): boolean {
    return error instanceof TypeError || 
           (error instanceof Error && (
             error.message.includes('Network request failed') ||
             error.message.includes('Request timeout') ||
             error.message.includes('Failed to fetch')
           ));
  }

  private createAppError(type: ErrorType, code: string, message: string, originalError?: any): AppError {
    return {
      type,
      code,
      message,
      details: originalError,
      timestamp: new Date(),
      isRecoverable: type === ErrorType.CONNECTIVITY || type === ErrorType.API,
      suggestedAction: this.getSuggestedAction(type, code)
    };
  }

  private getSuggestedAction(type: ErrorType, code: string): string {
    switch (type) {
      case ErrorType.CONNECTIVITY:
        return 'Check your internet connection and try again';
      case ErrorType.API:
        if (code === 'COMMAND_FAILED') {
          return 'The robot may be busy. Please wait and try again';
        }
        return 'Please try again in a moment';
      case ErrorType.ROBOT_HARDWARE:
        return 'Check if the robot is powered on and within range';
      default:
        return 'Please try again or contact support if the problem persists';
    }
  }

  // Getters
  get isConnected(): boolean {
    return this.isOnline;
  }

  get queuedCommandsCount(): number {
    return this.commandQueue.length;
  }

  get queuedCommands(): QueuedCommand[] {
    return [...this.commandQueue];
  }
}

export const robotApi = new RobotApiService({
  baseUrl: process.env.EXPO_PUBLIC_ROBOT_API_URL || 'http://localhost:3001',
  timeout: 5000,
  retryAttempts: 3
});