import {
    EnhancedRoomMap,
    MapArea,
    MapMarker,
    NoGoZone,
    Obstacle,
    PathPoint,
    Point,
    Room
} from '../types/robot';

// Generate mock room data
export const generateMockRooms = (): Room[] => [
  {
    id: 'living-room',
    name: 'Living Room',
    type: 'living_room',
    polygon: [
      { x: 50, y: 50 },
      { x: 200, y: 50 },
      { x: 200, y: 150 },
      { x: 50, y: 150 },
    ],
    isSelected: false,
    cleaningStatus: 'completed',
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    type: 'kitchen',
    polygon: [
      { x: 200, y: 50 },
      { x: 300, y: 50 },
      { x: 300, y: 120 },
      { x: 200, y: 120 },
    ],
    isSelected: false,
    cleaningStatus: 'in_progress',
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    type: 'bedroom',
    polygon: [
      { x: 50, y: 150 },
      { x: 180, y: 150 },
      { x: 180, y: 250 },
      { x: 50, y: 250 },
    ],
    isSelected: false,
    cleaningStatus: 'pending',
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    type: 'bathroom',
    polygon: [
      { x: 180, y: 150 },
      { x: 250, y: 150 },
      { x: 250, y: 200 },
      { x: 180, y: 200 },
    ],
    isSelected: false,
    cleaningStatus: 'skipped',
  },
];

// Generate mock obstacles
export const generateMockObstacles = (): Obstacle[] => [
  {
    id: 'sofa',
    type: 'furniture',
    polygon: [
      { x: 80, y: 80 },
      { x: 140, y: 80 },
      { x: 140, y: 110 },
      { x: 80, y: 110 },
    ],
    isTemporary: false,
  },
  {
    id: 'dining-table',
    type: 'furniture',
    polygon: [
      { x: 220, y: 70 },
      { x: 280, y: 70 },
      { x: 280, y: 100 },
      { x: 220, y: 100 },
    ],
    isTemporary: false,
  },
  {
    id: 'stairs',
    type: 'stairs',
    polygon: [
      { x: 270, y: 200 },
      { x: 300, y: 200 },
      { x: 300, y: 250 },
      { x: 270, y: 250 },
    ],
    isTemporary: false,
  },
];

// Generate mock map areas
export const generateMockAreas = (): MapArea[] => [
  {
    id: 'cleaned-area-1',
    type: 'cleaned',
    polygon: [
      { x: 50, y: 50 },
      { x: 150, y: 50 },
      { x: 150, y: 120 },
      { x: 50, y: 120 },
    ],
    cleanedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    cleaningProgress: 100,
  },
  {
    id: 'cleaning-area-1',
    type: 'cleaning',
    polygon: [
      { x: 200, y: 50 },
      { x: 280, y: 50 },
      { x: 280, y: 100 },
      { x: 200, y: 100 },
    ],
    cleaningProgress: 65,
  },
  {
    id: 'uncleaned-area-1',
    type: 'uncleaned',
    polygon: [
      { x: 50, y: 180 },
      { x: 150, y: 180 },
      { x: 150, y: 250 },
      { x: 50, y: 250 },
    ],
    cleaningProgress: 0,
  },
];

// Generate mock no-go zones
export const generateMockNoGoZones = (): NoGoZone[] => [
  {
    id: 'pet-area',
    name: 'Pet Area',
    polygon: [
      { x: 100, y: 200 },
      { x: 140, y: 200 },
      { x: 140, y: 230 },
      { x: 100, y: 230 },
    ],
    isActive: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
];

// Generate mock markers
export const generateMockMarkers = (): MapMarker[] => [
  {
    id: 'dock',
    position: { x: 30, y: 30 },
    type: 'dock',
    label: 'Dock',
    isVisible: true,
  },
  {
    id: 'waypoint-1',
    position: { x: 175, y: 125 },
    type: 'waypoint',
    label: 'Waypoint',
    isVisible: true,
  },
];

// Generate mock cleaning path
export const generateMockCleaningPath = (): PathPoint[] => {
  const path: PathPoint[] = [];
  const startTime = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago
  
  // Create a realistic cleaning path
  const waypoints = [
    { x: 30, y: 30 },   // Start at dock
    { x: 75, y: 75 },   // Move to living room
    { x: 125, y: 75 },  // Clean living room
    { x: 175, y: 75 },  // Move towards kitchen
    { x: 225, y: 75 },  // Clean kitchen
    { x: 250, y: 85 },  // Continue kitchen
    { x: 200, y: 125 }, // Move to hallway
    { x: 150, y: 175 }, // Move to bedroom
    { x: 100, y: 200 }, // Clean bedroom
    { x: 75, y: 225 },  // Continue bedroom
  ];
  
  waypoints.forEach((point, index) => {
    path.push({
      ...point,
      timestamp: new Date(startTime.getTime() + index * 60 * 1000), // 1 minute intervals
      action: index === 0 ? 'move' : index % 3 === 0 ? 'pause' : 'clean',
    });
  });
  
  return path;
};

// Generate complete mock enhanced room map
export const generateMockEnhancedRoomMap = (): EnhancedRoomMap => ({
  id: 'home-map-1',
  name: 'Home Floor Plan',
  lastUpdated: new Date(),
  dimensions: {
    width: 350,
    height: 300,
    scale: 10, // 10 pixels per meter
  },
  rooms: generateMockRooms(),
  obstacles: generateMockObstacles(),
  cleaningPath: generateMockCleaningPath(),
  areas: generateMockAreas(),
  noGoZones: generateMockNoGoZones(),
  markers: generateMockMarkers(),
  cleaningZones: [
    {
      id: 'high-traffic-zone',
      name: 'High Traffic Zone',
      polygon: [
        { x: 150, y: 100 },
        { x: 200, y: 100 },
        { x: 200, y: 150 },
        { x: 150, y: 150 },
      ],
      intensity: 'high',
      isActive: true,
      estimatedDuration: 10,
    },
  ],
  viewport: {
    center: { x: 175, y: 150 },
    zoom: 1,
    rotation: 0,
  },
});

// Generate mock robot position
export const generateMockRobotPosition = (): Point => ({
  x: 225, // Currently in kitchen
  y: 85,
});

// Generate mock robot rotation
export const generateMockRobotRotation = (): number => 45; // 45 degrees

// Utility to update cleaning progress
export const updateCleaningProgress = (
  roomMap: EnhancedRoomMap,
  progress: number
): EnhancedRoomMap => {
  const updatedAreas = roomMap.areas?.map(area => {
    if (area.type === 'cleaning') {
      return {
        ...area,
        cleaningProgress: Math.min(100, progress),
      };
    }
    return area;
  }) || [];

  return {
    ...roomMap,
    areas: updatedAreas,
  };
};

// Utility to add new path point
export const addPathPoint = (
  currentPath: PathPoint[],
  newPoint: Point,
  action: PathPoint['action'] = 'clean'
): PathPoint[] => {
  const newPathPoint: PathPoint = {
    ...newPoint,
    timestamp: new Date(),
    action,
  };

  return [...currentPath, newPathPoint];
};