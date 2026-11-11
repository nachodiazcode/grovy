import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { CanvasStateService } from '../../services/canvas-state.service';
import {
  BoundingBox,
  FigmaElement,
  Point,
  ResizeHandle,
  ShapeType,
} from '../../models/figma.models';

interface DragState {
  type: 'move' | 'resize' | 'rotate' | 'create' | 'pan';
  startX: number; // screen coords
  startY: number;
  handle?: ResizeHandle;
  initialElements: Map<string, FigmaElement>;
  initialBox?: BoundingBox;
  createdShape?: FigmaElement;
}

@Component({
  selector: 'app-canvas',
  imports: [],
  styles: `
    :host {
      display: flex;
      flex: 1 1 0%;
      min-width: 0;
      height: 100%;
      position: relative;
    }
  `,
  template: `
    <div
      #canvasContainer
      class="flex-1 h-full w-full relative overflow-hidden select-none bg-[#1e1e1e]"
      [class.cursor-grab]="state.activeTool() === 'hand' && !isSpacePressed && !dragState()"
      [class.cursor-grabbing]="(state.activeTool() === 'hand' || isSpacePressed) && dragState()?.type === 'pan'"
      [class.cursor-crosshair]="isDrawingTool()"
      (mousedown)="onMouseDown($event)"
      (mousemove)="onMouseMove($event)"
      (mouseup)="onMouseUp($event)"
      (wheel)="onWheel($event)"
    >
      <!-- SVG Canvas Render Engine -->
      <svg
        id="figma-canvas-svg"
        class="w-full h-full block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <!-- Grid Pattern -->
          <pattern
            id="canvas-grid-pattern"
            [attr.width]="gridSize()"
            [attr.height]="gridSize()"
            patternUnits="userSpaceOnUse"
            [attr.patternTransform]="'translate(' + (state.pan().x % gridSize()) + ',' + (state.pan().y % gridSize()) + ')'"
          >
            <circle
              [attr.cx]="gridSize() / 2"
              [attr.cy]="gridSize() / 2"
              r="1"
              fill="#333333"
            />
          </pattern>

          <!-- SVG Drop Shadow Filters for Elements -->
          @for (el of state.elements(); track el.id) {
            @if (el.shadowBlur > 0) {
              <filter [id]="'shadow-' + el.id" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow
                  [attr.dx]="el.shadowOffsetX"
                  [attr.dy]="el.shadowOffsetY"
                  [attr.stdDeviation]="el.shadowBlur / 2"
                  [attr.flood-color]="el.shadowColor"
                />
              </filter>
            }
          }
        </defs>

        <!-- Canvas Background with Dot Grid -->
        <rect width="100%" height="100%" fill="url(#canvas-grid-pattern)" />

        <!-- Canvas Viewport Transformation Group -->
        <g [attr.transform]="canvasTransform()">
          <!-- Elements Rendering -->
          @for (el of state.elements(); track el.id) {
            @if (el.visible) {
              <g
                [attr.id]="'element-' + el.id"
                [attr.transform]="getElementTransform(el)"
                [attr.opacity]="el.opacity"
                [attr.filter]="el.shadowBlur > 0 ? 'url(#shadow-' + el.id + ')' : null"
                (mousedown)="onElementMouseDown(el, $event)"
                class="cursor-pointer"
              >
                <!-- Frame / Artboard Container -->
                @if (el.type === 'frame') {
                  <rect
                    [attr.x]="el.x"
                    [attr.y]="el.y"
                    [attr.width]="el.width"
                    [attr.height]="el.height"
                    [attr.rx]="el.cornerRadius"
                    [attr.fill]="el.fill"
                    [attr.fill-opacity]="el.fillOpacity"
                    [attr.stroke]="el.stroke"
                    [attr.stroke-width]="el.strokeWidth"
                  />
                  <!-- Frame Title Tag (Figma style) -->
                  <text
                    [attr.x]="el.x"
                    [attr.y]="el.y - 8"
                    fill="#9ca3af"
                    font-size="11"
                    font-family="Inter, sans-serif"
                    font-weight="500"
                    class="select-none pointer-events-none"
                  >
                    {{ el.name }}
                  </text>
                }

                <!-- Rectangle -->
                @if (el.type === 'rect') {
                  <rect
                    [attr.x]="el.x"
                    [attr.y]="el.y"
                    [attr.width]="el.width"
                    [attr.height]="el.height"
                    [attr.rx]="el.cornerRadius"
                    [attr.fill]="el.fill"
                    [attr.fill-opacity]="el.fillOpacity"
                    [attr.stroke]="el.stroke"
                    [attr.stroke-width]="el.strokeWidth"
                  />
                }

                <!-- Circle / Ellipse -->
                @if (el.type === 'circle') {
                  <ellipse
                    [attr.cx]="el.x + el.width / 2"
                    [attr.cy]="el.y + el.height / 2"
                    [attr.rx]="el.width / 2"
                    [attr.ry]="el.height / 2"
                    [attr.fill]="el.fill"
                    [attr.fill-opacity]="el.fillOpacity"
                    [attr.stroke]="el.stroke"
                    [attr.stroke-width]="el.strokeWidth"
                  />
                }

                <!-- Star -->
                @if (el.type === 'star') {
                  <polygon
                    [attr.points]="getStarPoints(el.x, el.y, el.width, el.height)"
                    [attr.fill]="el.fill"
                    [attr.fill-opacity]="el.fillOpacity"
                    [attr.stroke]="el.stroke"
                    [attr.stroke-width]="el.strokeWidth"
                    stroke-linejoin="round"
                  />
                }

                <!-- Line -->
                @if (el.type === 'line') {
                  <line
                    [attr.x1]="el.x"
                    [attr.y1]="el.y + el.height / 2"
                    [attr.x2]="el.x + el.width"
                    [attr.y2]="el.y + el.height / 2"
                    [attr.stroke]="el.stroke !== 'transparent' ? el.stroke : el.fill"
                    [attr.stroke-width]="el.strokeWidth > 0 ? el.strokeWidth : 2"
                    stroke-linecap="round"
                  />
                }

                <!-- Text -->
                @if (el.type === 'text') {
                  <text
                    [attr.x]="el.x"
                    [attr.y]="el.y + (el.fontSize || 16)"
                    [attr.fill]="el.fill"
                    [attr.fill-opacity]="el.fillOpacity"
                    [attr.font-size]="el.fontSize || 16"
                    [attr.font-family]="el.fontFamily || 'Inter, sans-serif'"
                    [attr.font-weight]="el.fontWeight || '400'"
                    class="select-none"
                  >
                    {{ el.content || 'Texto' }}
                  </text>
                }
              </g>
            }
          }

          <!-- Live Drawing Preview Shape -->
          @if (dragState()?.type === 'create' && dragState()?.createdShape; as shape) {
            <g opacity="0.8" class="pointer-events-none">
              @if (shape.type === 'rect' || shape.type === 'frame') {
                <rect
                  [attr.x]="shape.x"
                  [attr.y]="shape.y"
                  [attr.width]="shape.width"
                  [attr.height]="shape.height"
                  [attr.rx]="shape.cornerRadius"
                  fill="#0d99ff"
                  fill-opacity="0.2"
                  stroke="#0d99ff"
                  stroke-width="1.5"
                  stroke-dasharray="4 2"
                />
              }
              @if (shape.type === 'circle') {
                <ellipse
                  [attr.cx]="shape.x + shape.width / 2"
                  [attr.cy]="shape.y + shape.height / 2"
                  [attr.rx]="shape.width / 2"
                  [attr.ry]="shape.height / 2"
                  fill="#0d99ff"
                  fill-opacity="0.2"
                  stroke="#0d99ff"
                  stroke-width="1.5"
                  stroke-dasharray="4 2"
                />
              }
              @if (shape.type === 'star') {
                <polygon
                  [attr.points]="getStarPoints(shape.x, shape.y, shape.width, shape.height)"
                  fill="#0d99ff"
                  fill-opacity="0.2"
                  stroke="#0d99ff"
                  stroke-width="1.5"
                  stroke-dasharray="4 2"
                />
              }
              @if (shape.type === 'line') {
                <line
                  [attr.x1]="shape.x"
                  [attr.y1]="shape.y + shape.height / 2"
                  [attr.x2]="shape.x + shape.width"
                  [attr.y2]="shape.y + shape.height / 2"
                  stroke="#0d99ff"
                  stroke-width="2"
                  stroke-dasharray="4 2"
                />
              }
              @if (shape.type === 'text') {
                <rect
                  [attr.x]="shape.x"
                  [attr.y]="shape.y"
                  [attr.width]="shape.width"
                  [attr.height]="shape.height"
                  fill="transparent"
                  stroke="#0d99ff"
                  stroke-width="1"
                  stroke-dasharray="2 2"
                />
              }
            </g>
          }

          <!-- Selection Bounding Box & Transform Handles Overlay -->
          @if (state.selectionBoundingBox(); as box) {
            <g id="selection-overlay-group" class="select-none">
              <!-- Bounding Box Outline -->
              <rect
                [attr.x]="box.minX"
                [attr.y]="box.minY"
                [attr.width]="box.width"
                [attr.height]="box.height"
                fill="none"
                stroke="#0d99ff"
                [attr.stroke-width]="1 / state.zoom()"
                class="pointer-events-none"
              />

              <!-- Size Dimension Pill (Figma style badge) -->
              <g [attr.transform]="'translate(' + (box.minX + box.width / 2) + ',' + (box.maxY + 18 / state.zoom()) + ')'">
                <rect
                  [attr.x]="-32 / state.zoom()"
                  [attr.y]="-10 / state.zoom()"
                  [attr.width]="64 / state.zoom()"
                  [attr.height]="16 / state.zoom()"
                  [attr.rx]="3 / state.zoom()"
                  fill="#0d99ff"
                />
                <text
                  x="0"
                  [attr.y]="2 / state.zoom()"
                  fill="#ffffff"
                  [attr.font-size]="10 / state.zoom()"
                  font-family="monospace"
                  text-anchor="middle"
                  class="pointer-events-none select-none font-semibold"
                >
                  {{ Math.round(box.width) }} × {{ Math.round(box.height) }}
                </text>
              </g>

              <!-- Rotation Handle Stalk -->
              <line
                [attr.x1]="box.minX + box.width / 2"
                [attr.y1]="box.minY"
                [attr.x2]="box.minX + box.width / 2"
                [attr.y2]="box.minY - 20 / state.zoom()"
                stroke="#0d99ff"
                [attr.stroke-width]="1 / state.zoom()"
              />
              <circle
                [attr.cx]="box.minX + box.width / 2"
                [attr.cy]="box.minY - 20 / state.zoom()"
                [attr.r]="4 / state.zoom()"
                fill="#ffffff"
                stroke="#0d99ff"
                [attr.stroke-width]="1.5 / state.zoom()"
                (mousedown)="onHandleMouseDown('rot', $event)"
                class="cursor-grab hover:scale-125 transition-transform"
              />

              <!-- 8 Resize Handles -->
              @for (handle of resizeHandles; track handle.id) {
                @let pos = getHandlePosition(box, handle.id);
                <rect
                  [attr.x]="pos.x - 4 / state.zoom()"
                  [attr.y]="pos.y - 4 / state.zoom()"
                  [attr.width]="8 / state.zoom()"
                  [attr.height]="8 / state.zoom()"
                  fill="#ffffff"
                  stroke="#0d99ff"
                  [attr.stroke-width]="1.5 / state.zoom()"
                  (mousedown)="onHandleMouseDown(handle.id, $event)"
                  [class]="handle.cursor + ' hover:scale-125 transition-transform'"
                />
              }
            </g>
          }
        </g>
      </svg>

      <!-- Bottom-Left Status Pill -->
      <div class="absolute bottom-3 left-3 bg-[#222222]/90 backdrop-blur-sm border border-[#383838] px-2.5 py-1 rounded-md text-[11px] text-gray-400 flex items-center gap-3 shadow-lg pointer-events-none">
        <span>X: <strong class="text-gray-200 font-mono">{{ Math.round(cursorCanvasPos().x) }}</strong></span>
        <span>Y: <strong class="text-gray-200 font-mono">{{ Math.round(cursorCanvasPos().y) }}</strong></span>
        <span>Zoom: <strong class="text-[#0d99ff] font-mono">{{ Math.round(state.zoom() * 100) }}%</strong></span>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CanvasComponent {
  readonly state = inject(CanvasStateService);
  protected readonly Math = Math;

  readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');

  // Interactive Dragging / Resizing / Creating state
  readonly dragState = signal<DragState | null>(null);
  readonly cursorCanvasPos = signal<Point>({ x: 0, y: 0 });

  isSpacePressed = false;

  readonly gridSize = computed(() => {
    // Dynamic dot grid spacing based on zoom
    const zoom = this.state.zoom();
    if (zoom < 0.3) return 100 * zoom;
    if (zoom > 2) return 10 * zoom;
    return 20 * zoom;
  });

  readonly canvasTransform = computed(() => {
    return `translate(${this.state.pan().x}, ${this.state.pan().y}) scale(${this.state.zoom()})`;
  });

  readonly resizeHandles: { id: ResizeHandle; cursor: string }[] = [
    { id: 'nw', cursor: 'cursor-nwse-resize' },
    { id: 'n', cursor: 'cursor-ns-resize' },
    { id: 'ne', cursor: 'cursor-nesw-resize' },
    { id: 'e', cursor: 'cursor-ew-resize' },
    { id: 'se', cursor: 'cursor-nwse-resize' },
    { id: 's', cursor: 'cursor-ns-resize' },
    { id: 'sw', cursor: 'cursor-nesw-resize' },
    { id: 'w', cursor: 'cursor-ew-resize' },
  ];

  isDrawingTool(): boolean {
    const t = this.state.activeTool();
    return ['rect', 'circle', 'frame', 'text', 'line', 'star'].includes(t);
  }

  getElementTransform(el: FigmaElement): string {
    if (!el.rotation) return '';
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    return `rotate(${el.rotation} ${cx} ${cy})`;
  }

  getHandlePosition(box: BoundingBox, handle: ResizeHandle): Point {
    switch (handle) {
      case 'nw':
        return { x: box.minX, y: box.minY };
      case 'n':
        return { x: box.minX + box.width / 2, y: box.minY };
      case 'ne':
        return { x: box.maxX, y: box.minY };
      case 'e':
        return { x: box.maxX, y: box.minY + box.height / 2 };
      case 'se':
        return { x: box.maxX, y: box.maxY };
      case 's':
        return { x: box.minX + box.width / 2, y: box.maxY };
      case 'sw':
        return { x: box.minX, y: box.maxY };
      case 'w':
        return { x: box.minX, y: box.minY + box.height / 2 };
      default:
        return { x: 0, y: 0 };
    }
  }

  getStarPoints(x: number, y: number, w: number, h: number, points = 5): string {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const outerRx = w / 2;
    const outerRy = h / 2;
    const innerRx = outerRx * 0.45;
    const innerRy = outerRy * 0.45;
    const coords: string[] = [];

    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const rx = i % 2 === 0 ? outerRx : innerRx;
      const ry = i % 2 === 0 ? outerRy : innerRy;
      coords.push(`${cx + rx * Math.cos(angle)},${cy + ry * Math.sin(angle)}`);
    }
    return coords.join(' ');
  }

  screenToCanvas(screenX: number, screenY: number): Point {
    const container = this.canvasContainer()?.nativeElement;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    const pan = this.state.pan();
    const zoom = this.state.zoom();

    return {
      x: (screenX - rect.left - pan.x) / zoom,
      y: (screenY - rect.top - pan.y) / zoom,
    };
  }

  onMouseDown(event: MouseEvent) {
    // If Space is pressed, or Middle Click, or Hand Tool -> Pan
    if (this.isSpacePressed || event.button === 1 || this.state.activeTool() === 'hand') {
      this.dragState.set({
        type: 'pan',
        startX: event.clientX,
        startY: event.clientY,
        initialElements: new Map(),
      });
      return;
    }

    // If drawing tool is active, start shape creation
    if (this.isDrawingTool()) {
      const canvasPt = this.screenToCanvas(event.clientX, event.clientY);
      const tool = this.state.activeTool() as ShapeType;

      const newShape: FigmaElement = {
        id: `${tool}-${Date.now()}`,
        name: this.getDefaultName(tool),
        type: tool,
        x: canvasPt.x,
        y: canvasPt.y,
        width: 1,
        height: 1,
        rotation: 0,
        fill: tool === 'frame' ? '#18181b' : tool === 'text' ? '#ffffff' : '#0d99ff',
        fillOpacity: 1,
        stroke: tool === 'frame' ? '#27272a' : 'transparent',
        strokeWidth: tool === 'frame' ? 1 : 0,
        cornerRadius: tool === 'frame' ? 12 : tool === 'circle' ? 999 : 4,
        opacity: 1,
        shadowBlur: 0,
        shadowColor: '#00000000',
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        locked: false,
        visible: true,
        content: tool === 'text' ? 'Escribe aquí' : undefined,
        fontSize: 16,
      };

      this.dragState.set({
        type: 'create',
        startX: event.clientX,
        startY: event.clientY,
        createdShape: newShape,
        initialElements: new Map(),
      });
      return;
    }

    // Clicked empty canvas with select tool -> clear selection
    if (event.target === this.canvasContainer()?.nativeElement || (event.target as HTMLElement).tagName === 'svg' || (event.target as HTMLElement).tagName === 'rect' && (event.target as HTMLElement).getAttribute('fill') === 'url(#canvas-grid-pattern)') {
      this.state.clearSelection();
    }
  }

  onElementMouseDown(el: FigmaElement, event: MouseEvent) {
    if (el.locked || !el.visible) return;
    if (this.isSpacePressed || this.state.activeTool() === 'hand' || this.isDrawingTool()) return;

    event.stopPropagation();

    const isMulti = event.shiftKey || event.metaKey || event.ctrlKey;
    if (!this.state.selectedIds().includes(el.id)) {
      this.state.select(el.id, isMulti);
    }

    // Prepare move drag state
    const initialMap = new Map<string, FigmaElement>();
    for (const item of this.state.selectedElements()) {
      initialMap.set(item.id, { ...item });
    }

    this.dragState.set({
      type: 'move',
      startX: event.clientX,
      startY: event.clientY,
      initialElements: initialMap,
    });
  }

  onHandleMouseDown(handle: ResizeHandle, event: MouseEvent) {
    event.stopPropagation();
    const box = this.state.selectionBoundingBox();
    if (!box) return;

    const initialMap = new Map<string, FigmaElement>();
    for (const item of this.state.selectedElements()) {
      initialMap.set(item.id, { ...item });
    }

    this.dragState.set({
      type: handle === 'rot' ? 'rotate' : 'resize',
      handle,
      startX: event.clientX,
      startY: event.clientY,
      initialBox: { ...box },
      initialElements: initialMap,
    });
  }

  onMouseMove(event: MouseEvent) {
    const canvasPt = this.screenToCanvas(event.clientX, event.clientY);
    this.cursorCanvasPos.set(canvasPt);

    const drag = this.dragState();
    if (!drag) return;

    const zoom = this.state.zoom();
    const dx = (event.clientX - drag.startX) / zoom;
    const dy = (event.clientY - drag.startY) / zoom;

    // Pan
    if (drag.type === 'pan') {
      const screenDx = event.clientX - drag.startX;
      const screenDy = event.clientY - drag.startY;
      this.state.updatePan(screenDx, screenDy);
      this.dragState.set({
        ...drag,
        startX: event.clientX,
        startY: event.clientY,
      });
      return;
    }

    // Move Selected Elements
    if (drag.type === 'move') {
      const updates = new Map<string, Partial<FigmaElement>>();
      drag.initialElements.forEach((initEl, id) => {
        updates.set(id, {
          x: Math.round(initEl.x + dx),
          y: Math.round(initEl.y + dy),
        });
      });
      this.state.updateMultiple(updates, false);
      return;
    }

    // Create New Shape
    if (drag.type === 'create' && drag.createdShape) {
      const originPt = this.screenToCanvas(drag.startX, drag.startY);
      const width = Math.max(Math.abs(canvasPt.x - originPt.x), 5);
      const height = Math.max(Math.abs(canvasPt.y - originPt.y), 5);
      const x = Math.min(canvasPt.x, originPt.x);
      const y = Math.min(canvasPt.y, originPt.y);

      this.dragState.set({
        ...drag,
        createdShape: {
          ...drag.createdShape,
          x,
          y,
          width,
          height,
        },
      });
      return;
    }

    // Resize Selection
    if (drag.type === 'resize' && drag.initialBox && drag.handle) {
      const initBox = drag.initialBox;
      let newMinX = initBox.minX;
      let newMinY = initBox.minY;
      let newMaxX = initBox.maxX;
      let newMaxY = initBox.maxY;

      if (drag.handle.includes('e')) newMaxX = Math.max(initBox.minX + 10, initBox.maxX + dx);
      if (drag.handle.includes('s')) newMaxY = Math.max(initBox.minY + 10, initBox.maxY + dy);
      if (drag.handle.includes('w')) newMinX = Math.min(initBox.maxX - 10, initBox.minX + dx);
      if (drag.handle.includes('n')) newMinY = Math.min(initBox.maxY - 10, initBox.minY + dy);

      const newWidth = newMaxX - newMinX;
      const newHeight = newMaxY - newMinY;
      const scaleX = newWidth / initBox.width;
      const scaleY = newHeight / initBox.height;

      const updates = new Map<string, Partial<FigmaElement>>();
      drag.initialElements.forEach((initEl, id) => {
        const relX = initEl.x - initBox.minX;
        const relY = initEl.y - initBox.minY;

        updates.set(id, {
          x: Math.round(newMinX + relX * scaleX),
          y: Math.round(newMinY + relY * scaleY),
          width: Math.max(Math.round(initEl.width * scaleX), 2),
          height: Math.max(Math.round(initEl.height * scaleY), 2),
        });
      });

      this.state.updateMultiple(updates, false);
      return;
    }

    // Rotate Selection
    if (drag.type === 'rotate' && drag.initialBox) {
      const centerX = drag.initialBox.minX + drag.initialBox.width / 2;
      const centerY = drag.initialBox.minY + drag.initialBox.height / 2;

      const angleRad = Math.atan2(canvasPt.y - centerY, canvasPt.x - centerX);
      let angleDeg = Math.round((angleRad * 180) / Math.PI + 90);
      if (angleDeg < 0) angleDeg += 360;

      // Snap to 15 degrees if shift held
      if (event.shiftKey) {
        angleDeg = Math.round(angleDeg / 15) * 15;
      }

      const updates = new Map<string, Partial<FigmaElement>>();
      drag.initialElements.forEach((initEl, id) => {
        updates.set(id, { rotation: angleDeg });
      });

      this.state.updateMultiple(updates, false);
      return;
    }
  }

  onMouseUp(event: MouseEvent) {
    const drag = this.dragState();
    if (!drag) return;

    if (drag.type === 'create' && drag.createdShape) {
      const finalShape = drag.createdShape;
      // If user simply clicked without dragging, assign a sensible default dimension
      if (finalShape.width < 10 && finalShape.height < 10) {
        if (finalShape.type === 'text') {
          finalShape.width = 160;
          finalShape.height = 30;
        } else if (finalShape.type === 'frame') {
          finalShape.width = 375;
          finalShape.height = 667; // iPhone frame
        } else {
          finalShape.width = 100;
          finalShape.height = 100;
        }
      }
      this.state.addElement(finalShape);
    } else if (drag.type === 'move' || drag.type === 'resize' || drag.type === 'rotate') {
      this.state.recordSnapshot();
    }

    this.dragState.set(null);
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();

    if (event.ctrlKey || event.metaKey) {
      // Pinch or Ctrl+Wheel = Zoom centered at cursor
      const container = this.canvasContainer()?.nativeElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const origin: Point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      const factor = event.deltaY < 0 ? 1.08 : 0.92;
      this.state.setZoom(this.state.zoom() * factor, origin);
    } else {
      // Normal Wheel = Pan Canvas
      this.state.updatePan(-event.deltaX, -event.deltaY);
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Check if an input or textarea is active
    const activeEl = document.activeElement;
    const isTyping =
      activeEl instanceof HTMLInputElement ||
      activeEl instanceof HTMLTextAreaElement ||
      activeEl instanceof HTMLSelectElement;

    if (isTyping) return;

    // Spacebar for Hand Tool
    if (event.code === 'Space' && !this.isSpacePressed) {
      this.isSpacePressed = true;
      event.preventDefault();
      return;
    }

    // Hotkeys
    const key = event.key.toLowerCase();
    const isCmd = event.metaKey || event.ctrlKey;

    if (isCmd && key === 'z') {
      event.preventDefault();
      if (event.shiftKey) {
        this.state.redo();
      } else {
        this.state.undo();
      }
      return;
    }

    if (isCmd && key === 'd') {
      event.preventDefault();
      this.state.duplicateSelected();
      return;
    }

    if (isCmd && key === 'a') {
      event.preventDefault();
      this.state.selectAll();
      return;
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      this.state.deleteSelected();
      return;
    }

    if (event.key === 'Escape') {
      this.state.clearSelection();
      this.state.setTool('select');
      return;
    }

    // Nudge with arrow keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      const step = event.shiftKey ? 10 : 1;
      const updates = new Map<string, Partial<FigmaElement>>();
      for (const el of this.state.selectedElements()) {
        let x = el.x;
        let y = el.y;
        if (event.key === 'ArrowUp') y -= step;
        if (event.key === 'ArrowDown') y += step;
        if (event.key === 'ArrowLeft') x -= step;
        if (event.key === 'ArrowRight') x += step;
        updates.set(el.id, { x, y });
      }
      this.state.updateMultiple(updates);
      return;
    }

    // Tools
    if (key === 'v') this.state.setTool('select');
    if (key === 'h') this.state.setTool('hand');
    if (key === 'r') this.state.setTool('rect');
    if (key === 'o') this.state.setTool('circle');
    if (key === 't') this.state.setTool('text');
    if (key === 'f') this.state.setTool('frame');
    if (key === 'l') this.state.setTool('line');
    if (key === 's') this.state.setTool('star');
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.code === 'Space') {
      this.isSpacePressed = false;
    }
  }

  private getDefaultName(tool: ShapeType): string {
    switch (tool) {
      case 'frame':
        return 'Frame ' + (this.state.elements().length + 1);
      case 'rect':
        return 'Rectángulo ' + (this.state.elements().length + 1);
      case 'circle':
        return 'Elipse ' + (this.state.elements().length + 1);
      case 'star':
        return 'Estrella ' + (this.state.elements().length + 1);
      case 'line':
        return 'Línea ' + (this.state.elements().length + 1);
      case 'text':
        return 'Texto ' + (this.state.elements().length + 1);
    }
  }
}
