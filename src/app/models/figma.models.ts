export type ToolType = 'select' | 'hand' | 'frame' | 'rect' | 'circle' | 'text' | 'line' | 'star';

export type ShapeType = 'frame' | 'rect' | 'circle' | 'text' | 'line' | 'star';

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
}

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'rot';
