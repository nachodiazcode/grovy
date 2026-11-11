export type ToolType = 'select' | 'hand' | 'frame' | 'rect' | 'circle' | 'text' | 'line' | 'star';

export type ShapeType = 'frame' | 'rect' | 'circle' | 'text' | 'line' | 'star';

export type EditorMode = 'design' | 'prototype';

export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface PrototypeInteraction {
  trigger: 'click' | 'hover';
  action: 'navigate';
  targetFrameId: string;
  animation: 'instant' | 'dissolve' | 'slide-left' | 'slide-right';
}

export interface FigmaElement {
  id: string;
  name: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees
  fill: string; // hex color or 'transparent'
  fillOpacity: number; // 0 to 1
  stroke: string; // hex color or 'transparent'
  strokeWidth: number;
  cornerRadius: number;
  opacity: number; // 0 to 1
  shadowBlur: number;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  locked: boolean;
  visible: boolean;

  // Text specific properties
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';

  // Frame specific properties
  clipsContent?: boolean;
  isInitialFrame?: boolean;

  // Prototype Interaction Link
  interaction?: PrototypeInteraction;
}

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'rot';

// Collaboration Models
export interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursor?: Point;
  selectedIds?: string[];
  lastActive: number;
  isSimulated?: boolean;
}

export interface CollabMessage {
  type: 'CURSOR_MOVE' | 'SELECTION_CHANGE' | 'ELEMENTS_SYNC' | 'USER_PRESENCE' | 'USER_LEAVE';
  sender: Collaborator;
  payload?: any;
}

// Design System Models
export interface ColorToken {
  id: string;
  name: string;
  hex: string;
  category: 'brand' | 'neutral' | 'semantic';
}

export interface TypographyToken {
  id: string;
  name: string;
  fontSize: number;
  fontWeight: string;
  fontFamily: string;
}

export interface ComponentPreset {
  id: string;
  name: string;
  category: 'Navigation' | 'Cards' | 'Buttons' | 'Forms' | 'Headers' | 'Custom';
  description: string;
  elements: FigmaElement[];
}

// AI Settings
export interface AISettings {
  apiKey: string;
  model: string;
  useGemini: boolean;
}
