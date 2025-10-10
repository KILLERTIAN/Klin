
export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
}

export type WebSocketEventHandler = (data: any) => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private eventHandlers: Map<string, WebSocketEventHandler[]> = new Map();
  private isConnecting = false;

  constructor(config: WebSocketConfig) {
    this.config = config;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
        resolve();
        return;
      }

      this.isConnecting = true;

      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.emit('connected', {});
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.emit(data.type || 'message', data);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          this.isConnecting = false;
          this.ws = null;
          this.emit('disconnected', {});
          this.scheduleReconnect();
        };

        this.ws.onerror = (event) => {
          // Silently handle WebSocket errors in development
          this.isConnecting = false;
          this.emit('error', { event });
          reject(new Error('WebSocket connection failed'));
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: any): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  on(event: string, handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in WebSocket event handler for ${event}:`, error);
        }
      });
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.emit('max_reconnect_attempts_reached', { attempts: this.reconnectAttempts });
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    this.emit('reconnecting', { attempt: this.reconnectAttempts, delay });

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        // Silently handle reconnection failures - will trigger onclose and schedule another reconnect
      });
    }, delay);
  }

  get isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  get connectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'unknown';
    }
  }

  get reconnectAttemptCount(): number {
    return this.reconnectAttempts;
  }

  resetReconnectAttempts(): void {
    this.reconnectAttempts = 0;
  }

  // Send a ping message to keep connection alive
  ping(): boolean {
    return this.send({ type: 'ping', timestamp: new Date().toISOString() });
  }

  // Request robot status update
  requestStatusUpdate(): boolean {
    return this.send({ type: 'request_status_update' });
  }

  // Subscribe to specific events
  subscribe(eventType: string): boolean {
    return this.send({ type: 'subscribe', eventType });
  }

  // Unsubscribe from specific events
  unsubscribe(eventType: string): boolean {
    return this.send({ type: 'unsubscribe', eventType });
  }
}

export const websocketService = new WebSocketService({
  url: process.env.EXPO_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001/ws',
  reconnectInterval: 5000,
  maxReconnectAttempts: 10
});