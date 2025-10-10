export type RootStackParamList = {
  '(tabs)': undefined;
  'splash': undefined;
  'modal': {
    type: 'error' | 'success' | 'info';
    title: string;
    message: string;
  };
};

export type TabParamList = {
  'index': undefined;
  'map': undefined;
  'explore': undefined; // This is the Clean/FAB screen
  'history': undefined;
  'settings': undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}