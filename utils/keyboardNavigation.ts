import { Platform } from 'react-native';

export interface KeyboardNavigationConfig {
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onTab?: () => void;
  onShiftTab?: () => void;
}

class KeyboardNavigationManager {
  private listeners: Map<string, KeyboardNavigationConfig> = new Map();
  private currentFocus: string | null = null;
  private isEnabled: boolean = Platform.OS === 'web';

  constructor() {
    if (this.isEnabled) {
      this.setupGlobalListeners();
    }
  }

  private setupGlobalListeners() {
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', this.handleKeyDown);
    }
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (!this.currentFocus) return;

    const config = this.listeners.get(this.currentFocus);
    if (!config) return;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        config.onArrowUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        config.onArrowDown?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        config.onArrowLeft?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        config.onArrowRight?.();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        config.onEnter?.();
        break;
      case 'Escape':
        event.preventDefault();
        config.onEscape?.();
        break;
      case 'Tab':
        if (event.shiftKey) {
          event.preventDefault();
          config.onShiftTab?.();
        } else {
          event.preventDefault();
          config.onTab?.();
        }
        break;
    }
  };

  public register(id: string, config: KeyboardNavigationConfig): () => void {
    this.listeners.set(id, config);
    
    return () => {
      this.listeners.delete(id);
      if (this.currentFocus === id) {
        this.currentFocus = null;
      }
    };
  }

  public setFocus(id: string) {
    this.currentFocus = id;
  }

  public clearFocus() {
    this.currentFocus = null;
  }

  public getCurrentFocus(): string | null {
    return this.currentFocus;
  }

  public isKeyboardNavigationEnabled(): boolean {
    return this.isEnabled;
  }

  public cleanup() {
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', this.handleKeyDown);
    }
    this.listeners.clear();
    this.currentFocus = null;
  }
}

export const keyboardNavigationManager = new KeyboardNavigationManager();

// Hook for keyboard navigation
export const useKeyboardNavigation = (
  id: string,
  config: KeyboardNavigationConfig,
  enabled: boolean = true
) => {
  const { useEffect } = require('react');

  useEffect(() => {
    if (!enabled || !keyboardNavigationManager.isKeyboardNavigationEnabled()) {
      return;
    }

    const unregister = keyboardNavigationManager.register(id, config);
    return unregister;
  }, [id, config, enabled]);

  return {
    setFocus: () => keyboardNavigationManager.setFocus(id),
    clearFocus: () => keyboardNavigationManager.clearFocus(),
    isFocused: () => keyboardNavigationManager.getCurrentFocus() === id,
  };
};

// Focusable component wrapper
export const createFocusableProps = (
  id: string,
  onActivate?: () => void,
  onFocus?: () => void,
  onBlur?: () => void
) => {
  if (!keyboardNavigationManager.isKeyboardNavigationEnabled()) {
    return {};
  }

  return {
    onFocus: () => {
      keyboardNavigationManager.setFocus(id);
      onFocus?.();
    },
    onBlur: () => {
      if (keyboardNavigationManager.getCurrentFocus() === id) {
        keyboardNavigationManager.clearFocus();
      }
      onBlur?.();
    },
    tabIndex: 0,
    onKeyDown: (event: any) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onActivate?.();
      }
    },
  };
};

// Navigation helpers for common patterns
export const navigationHelpers = {
  // Create grid navigation (for card layouts)
  createGridNavigation: (
    items: string[],
    columns: number,
    onSelect: (id: string) => void
  ) => {
    const configs: Record<string, KeyboardNavigationConfig> = {};
    
    items.forEach((id, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      
      configs[id] = {
        onArrowUp: () => {
          const upIndex = index - columns;
          if (upIndex >= 0) {
            keyboardNavigationManager.setFocus(items[upIndex]);
          }
        },
        onArrowDown: () => {
          const downIndex = index + columns;
          if (downIndex < items.length) {
            keyboardNavigationManager.setFocus(items[downIndex]);
          }
        },
        onArrowLeft: () => {
          if (col > 0) {
            keyboardNavigationManager.setFocus(items[index - 1]);
          }
        },
        onArrowRight: () => {
          if (col < columns - 1 && index + 1 < items.length) {
            keyboardNavigationManager.setFocus(items[index + 1]);
          }
        },
        onEnter: () => onSelect(id),
      };
    });
    
    return configs;
  },

  // Create list navigation (for vertical lists)
  createListNavigation: (
    items: string[],
    onSelect: (id: string) => void
  ) => {
    const configs: Record<string, KeyboardNavigationConfig> = {};
    
    items.forEach((id, index) => {
      configs[id] = {
        onArrowUp: () => {
          if (index > 0) {
            keyboardNavigationManager.setFocus(items[index - 1]);
          }
        },
        onArrowDown: () => {
          if (index < items.length - 1) {
            keyboardNavigationManager.setFocus(items[index + 1]);
          }
        },
        onEnter: () => onSelect(id),
      };
    });
    
    return configs;
  },

  // Create tab navigation (for horizontal tabs)
  createTabNavigation: (
    tabs: string[],
    onSelect: (id: string) => void
  ) => {
    const configs: Record<string, KeyboardNavigationConfig> = {};
    
    tabs.forEach((id, index) => {
      configs[id] = {
        onArrowLeft: () => {
          const prevIndex = index > 0 ? index - 1 : tabs.length - 1;
          keyboardNavigationManager.setFocus(tabs[prevIndex]);
        },
        onArrowRight: () => {
          const nextIndex = index < tabs.length - 1 ? index + 1 : 0;
          keyboardNavigationManager.setFocus(tabs[nextIndex]);
        },
        onEnter: () => onSelect(id),
      };
    });
    
    return configs;
  },
};