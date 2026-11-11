import { Injectable, computed, inject, signal } from '@angular/core';
import {
  BoundingBox,
  ComponentPreset,
  EditorMode,
  FigmaElement,
  Point,
  PrototypeInteraction,
  ShapeType,
  ToolType,
} from '../models/figma.models';
import { CollaborationService } from './collaboration.service';

const INITIAL_ELEMENTS: FigmaElement[] = [
  {
    id: 'frame-1',
    name: 'Frame - Hero Section',
    type: 'frame',
    x: 120,
    y: 80,
    width: 600,
    height: 420,
    rotation: 0,
    fill: '#18181b',
    fillOpacity: 1,
    stroke: '#27272a',
    strokeWidth: 1,
    cornerRadius: 16,
    opacity: 1,
    shadowBlur: 24,
    shadowColor: '#00000066',
    shadowOffsetX: 0,
    shadowOffsetY: 8,
    locked: false,
    visible: true,
    isInitialFrame: true,
  },
  {
    id: 'badge-1',
    name: 'Badge Pill',
    type: 'rect',
    x: 156,
    y: 120,
    width: 130,
    height: 28,
    rotation: 0,
    fill: '#0284c7',
    fillOpacity: 0.15,
    stroke: '#38bdf8',
    strokeWidth: 1,
    cornerRadius: 14,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  {
    id: 'badge-text',
    name: 'Badge Text',
    type: 'text',
    x: 172,
    y: 139,
    width: 100,
    height: 20,
    rotation: 0,
    fill: '#38bdf8',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'ANGULAR 22 CLONE',
    fontSize: 10,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '700',
    textAlign: 'left',
  },
  {
    id: 'text-title',
    name: 'Hero Title',
    type: 'text',
    x: 156,
    y: 195,
    width: 440,
    height: 44,
    rotation: 0,
    fill: '#ffffff',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Diseña interfaces a la velocidad de la luz',
    fontSize: 26,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '700',
    textAlign: 'left',
  },
  {
    id: 'text-desc',
    name: 'Hero Subtitle',
    type: 'text',
    x: 156,
    y: 245,
    width: 460,
    height: 36,
    rotation: 0,
    fill: '#9ca3af',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Crea formas, manipula capas y exporta vectores con Angular Signals y SVG declarativo.',
    fontSize: 14,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '400',
    textAlign: 'left',
  },
  {
    id: 'btn-primary',
    name: 'Primary Button',
    type: 'rect',
    x: 156,
    y: 310,
    width: 160,
    height: 44,
    rotation: 0,
    fill: '#0d99ff',
    fillOpacity: 1,
    stroke: '#38bdf8',
    strokeWidth: 1,
    cornerRadius: 8,
    opacity: 1,
    shadowBlur: 16,
    shadowColor: '#0d99ff44',
    shadowOffsetX: 0,
    shadowOffsetY: 4,
    locked: false,
    visible: true,
    interaction: {
      trigger: 'click',
      action: 'navigate',
      targetFrameId: 'frame-detail-preview',
      animation: 'slide-left',
    },
  },
  {
    id: 'btn-text',
    name: 'Button Text',
    type: 'text',
    x: 195,
    y: 337,
    width: 90,
    height: 20,
    rotation: 0,
    fill: '#ffffff',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Comenzar ahora',
    fontSize: 13,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '600',
    textAlign: 'left',
  },
  {
    id: 'avatar-circle',
    name: 'Avatar Accent',
    type: 'circle',
    x: 570,
    y: 310,
    width: 90,
    height: 90,
    rotation: 0,
    fill: '#f59e0b',
    fillOpacity: 0.9,
    stroke: '#fbbf24',
    strokeWidth: 2,
    cornerRadius: 45,
    opacity: 0.85,
    shadowBlur: 20,
    shadowColor: '#f59e0b55',
    shadowOffsetX: 0,
    shadowOffsetY: 6,
    locked: false,
    visible: true,
  },
  {
    id: 'star-accent',
    name: 'Decoration Star',
    type: 'star',
    x: 620,
    y: 110,
    width: 44,
    height: 44,
    rotation: 15,
    fill: '#a855f7',
    fillOpacity: 1,
    stroke: '#c084fc',
    strokeWidth: 1,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 12,
    shadowColor: '#a855f766',
    shadowOffsetX: 0,
    shadowOffsetY: 2,
    locked: false,
    visible: true,
  },
  // Frame 2: Linked Prototype Target Frame
  {
    id: 'frame-detail-preview',
    name: 'Frame - Vista Detalle (Target)',
    type: 'frame',
    x: 780,
    y: 80,
    width: 420,
    height: 420,
    rotation: 0,
    fill: '#0f172a',
    fillOpacity: 1,
    stroke: '#1e293b',
    strokeWidth: 1,
    cornerRadius: 16,
    opacity: 1,
    shadowBlur: 24,
    shadowColor: '#00000066',
    shadowOffsetX: 0,
    shadowOffsetY: 8,
    locked: false,
    visible: true,
  },
  {
    id: 'frame-detail-title',
    name: 'Detail Title',
    type: 'text',
    x: 810,
    y: 140,
    width: 360,
    height: 36,
    rotation: 0,
    fill: '#38bdf8',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: '¡Prototipo en Acción! 🚀',
    fontSize: 22,
    fontWeight: '700',
  },
  {
    id: 'frame-detail-desc',
    name: 'Detail Subtitle',
    type: 'text',
    x: 810,
    y: 185,
    width: 360,
    height: 40,
    rotation: 0,
    fill: '#94a3b8',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Hiciste clic en el botón y navegaste a este frame con una transición fluida.',
    fontSize: 13,
    fontWeight: '400',
  },
  {
    id: 'btn-back-home',
    name: 'Botón: Volver a Hero',
    type: 'rect',
    x: 810,
    y: 260,
    width: 170,
    height: 42,
    rotation: 0,
    fill: '#1e293b',
    fillOpacity: 1,
    stroke: '#334155',
    strokeWidth: 1,
    cornerRadius: 8,
    opacity: 1,
    shadowBlur: 10,
    shadowColor: '#00000033',
    shadowOffsetX: 0,
    shadowOffsetY: 2,
    locked: false,
    visible: true,
    interaction: {
      trigger: 'click',
      action: 'navigate',
      targetFrameId: 'frame-1',
      animation: 'slide-right',
    },
  },
  {
    id: 'btn-back-home-text',
    name: 'Back Label',
    type: 'text',
    x: 840,
    y: 286,
    width: 120,
    height: 20,
    rotation: 0,
    fill: '#ffffff',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: '⬅ Volver al inicio',
    fontSize: 12,
    fontWeight: '600',
  },
];

@Injectable({
  providedIn: 'root',
})
export class CanvasStateService {
  private readonly collab = inject(CollaborationService);

  // Elements state
  readonly elements = signal<FigmaElement[]>(INITIAL_ELEMENTS);

  // Selection state
  readonly selectedIds = signal<string[]>(['frame-1']);

  // Active Tool & Mode
  readonly activeTool = signal<ToolType>('select');
  readonly editorMode = signal<EditorMode>('design'); // 'design' | 'prototype'

  // Prototype Presentation Player state
  readonly isPrototypePlaying = signal<boolean>(false);
  readonly currentPrototypeFrameId = signal<string | null>(null);

  // Canvas Viewport Transformation
  readonly zoom = signal<number>(1);
  readonly pan = signal<Point>({ x: 80, y: 40 });

  // History for Undo / Redo
  private readonly history = signal<FigmaElement[][]>([INITIAL_ELEMENTS]);
  private readonly historyIndex = signal<number>(0);

  // Computed signals
  readonly selectedElements = computed(() => {
    const ids = new Set(this.selectedIds());
    return this.elements().filter((el) => ids.has(el.id));
  });

  readonly primarySelectedElement = computed(() => {
    const list = this.selectedElements();
    return list.length > 0 ? list[0] : null;
  });

  readonly allFrames = computed(() => {
    return this.elements().filter((el) => el.type === 'frame');
  });

  readonly elementsWithInteractions = computed(() => {
    return this.elements().filter((el) => el.interaction && el.interaction.targetFrameId);
  });

  readonly canUndo = computed(() => this.historyIndex() > 0);
  readonly canRedo = computed(() => this.historyIndex() < this.history().length - 1);

  readonly selectionBoundingBox = computed<BoundingBox | null>(() => {
    const selected = this.selectedElements();
    if (selected.length === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const el of selected) {
      if (el.x < minX) minX = el.x;
      if (el.y < minY) minY = el.y;
      if (el.x + el.width > maxX) maxX = el.x + el.width;
      if (el.y + el.height > maxY) maxY = el.y + el.height;
    }

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    };
  });

  constructor() {
    // Listen for elements broadcasted by remote peers
    this.collab.onElementsReceived = (newElements) => {
      this.elements.set(newElements);
    };
  }

  setEditorMode(mode: EditorMode) {
    this.editorMode.set(mode);
  }

  // History management
  recordSnapshot() {
    const current = JSON.parse(JSON.stringify(this.elements()));
    const currentIndex = this.historyIndex();
    const newHistory = this.history().slice(0, currentIndex + 1);
    newHistory.push(current);

    if (newHistory.length > 50) {
      newHistory.shift();
    }

    this.history.set(newHistory);
    this.historyIndex.set(newHistory.length - 1);

    // Broadcast change to peers
    this.collab.broadcastElements(this.elements());
  }

  undo() {
    if (!this.canUndo()) return;
    const newIndex = this.historyIndex() - 1;
    this.historyIndex.set(newIndex);
    this.elements.set(JSON.parse(JSON.stringify(this.history()[newIndex])));
    this.collab.broadcastElements(this.elements());
  }

  redo() {
    if (!this.canRedo()) return;
    const newIndex = this.historyIndex() + 1;
    this.historyIndex.set(newIndex);
    this.elements.set(JSON.parse(JSON.stringify(this.history()[newIndex])));
    this.collab.broadcastElements(this.elements());
  }

  // Tool Selection
  setTool(tool: ToolType) {
    this.activeTool.set(tool);
    if (tool !== 'select') {
      this.selectedIds.set([]);
    }
  }

  // Selection
  select(id: string, multiSelect = false) {
    if (multiSelect) {
      const current = this.selectedIds();
      if (current.includes(id)) {
        this.selectedIds.set(current.filter((item) => item !== id));
      } else {
        this.selectedIds.set([...current, id]);
      }
    } else {
      this.selectedIds.set([id]);
    }
    this.activeTool.set('select');
    this.collab.broadcastSelection(this.selectedIds());
  }

  selectAll() {
    this.selectedIds.set(this.elements().map((el) => el.id));
    this.activeTool.set('select');
    this.collab.broadcastSelection(this.selectedIds());
  }

  clearSelection() {
    this.selectedIds.set([]);
    this.collab.broadcastSelection([]);
  }

  // Element CRUD
  addElement(element: FigmaElement) {
    this.elements.update((prev) => [...prev, element]);
    this.selectedIds.set([element.id]);
    this.setTool('select');
    this.recordSnapshot();
  }

  addMultipleElements(newElements: FigmaElement[]) {
    this.elements.update((prev) => [...prev, ...newElements]);
    this.selectedIds.set(newElements.map((el) => el.id));
    this.setTool('select');
    this.recordSnapshot();
  }

  updateElement(id: string, updates: Partial<FigmaElement>, recordHistory = true) {
    this.elements.update((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
    if (recordHistory) {
      this.recordSnapshot();
    }
  }

  updateMultiple(updatesMap: Map<string, Partial<FigmaElement>>, recordHistory = true) {
    this.elements.update((prev) =>
      prev.map((el) => {
        const update = updatesMap.get(el.id);
        return update ? { ...el, ...update } : el;
      })
    );
    if (recordHistory) {
      this.recordSnapshot();
    }
  }

  setElementInteraction(id: string, interaction?: PrototypeInteraction) {
    this.updateElement(id, { interaction }, true);
  }

  deleteSelected() {
    const selected = new Set(this.selectedIds());
    if (selected.size === 0) return;

    this.elements.update((prev) => prev.filter((el) => !selected.has(el.id)));
    this.selectedIds.set([]);
    this.recordSnapshot();
  }

  duplicateSelected() {
    const selected = this.selectedElements();
    if (selected.length === 0) return;

    const newElements: FigmaElement[] = [];
    const newSelectedIds: string[] = [];

    for (const el of selected) {
      const newId = `${el.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const duplicated: FigmaElement = {
        ...JSON.parse(JSON.stringify(el)),
        id: newId,
        name: `${el.name} (Copy)`,
        x: el.x + 24,
        y: el.y + 24,
      };
      newElements.push(duplicated);
      newSelectedIds.push(newId);
    }

    this.elements.update((prev) => [...prev, ...newElements]);
    this.selectedIds.set(newSelectedIds);
    this.recordSnapshot();
  }

  // Layer ordering
  bringForward() {
    const id = this.selectedIds()[0];
    if (!id) return;
    const list = [...this.elements()];
    const index = list.findIndex((el) => el.id === id);
    if (index >= 0 && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
      this.elements.set(list);
      this.recordSnapshot();
    }
  }

  sendBackward() {
    const id = this.selectedIds()[0];
    if (!id) return;
    const list = [...this.elements()];
    const index = list.findIndex((el) => el.id === id);
    if (index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
      this.elements.set(list);
      this.recordSnapshot();
    }
  }

  bringToFront() {
    const id = this.selectedIds()[0];
    if (!id) return;
    const list = [...this.elements()];
    const index = list.findIndex((el) => el.id === id);
    if (index >= 0 && index < list.length - 1) {
      const [item] = list.splice(index, 1);
      list.push(item);
      this.elements.set(list);
      this.recordSnapshot();
    }
  }

  sendToBack() {
    const id = this.selectedIds()[0];
    if (!id) return;
    const list = [...this.elements()];
    const index = list.findIndex((el) => el.id === id);
    if (index > 0) {
      const [item] = list.splice(index, 1);
      list.unshift(item);
      this.elements.set(list);
      this.recordSnapshot();
    }
  }

  toggleLock(id: string) {
    this.elements.update((prev) =>
      prev.map((el) => (el.id === id ? { ...el, locked: !el.locked } : el))
    );
    this.recordSnapshot();
  }

  toggleVisibility(id: string) {
    this.elements.update((prev) =>
      prev.map((el) => (el.id === id ? { ...el, visible: !el.visible } : el))
    );
    this.recordSnapshot();
  }

  // Alignment
  alignSelected(alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') {
    const selected = this.selectedElements();
    if (selected.length < 2) return;

    const bbox = this.selectionBoundingBox();
    if (!bbox) return;

    const updates = new Map<string, Partial<FigmaElement>>();

    for (const el of selected) {
      switch (alignment) {
        case 'left':
          updates.set(el.id, { x: bbox.minX });
          break;
        case 'center':
          updates.set(el.id, { x: bbox.minX + (bbox.width - el.width) / 2 });
          break;
        case 'right':
          updates.set(el.id, { x: bbox.maxX - el.width });
          break;
        case 'top':
          updates.set(el.id, { y: bbox.minY });
          break;
        case 'middle':
          updates.set(el.id, { y: bbox.minY + (bbox.height - el.height) / 2 });
          break;
        case 'bottom':
          updates.set(el.id, { y: bbox.maxY - el.height });
          break;
      }
    }

    this.updateMultiple(updates);
  }

  // Insert Design System Component
  insertComponentPreset(preset: ComponentPreset) {
    // Insert at center of view
    const originX = Math.round(-this.pan().x / this.zoom() + 200);
    const originY = Math.round(-this.pan().y / this.zoom() + 150);

    const newElements: FigmaElement[] = preset.elements.map((el) => ({
      ...JSON.parse(JSON.stringify(el)),
      id: `${el.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      x: originX + el.x,
      y: originY + el.y,
    }));

    this.addMultipleElements(newElements);
  }

  // Prototype Player Controls
  startPrototype(startingFrameId?: string) {
    const target = startingFrameId || this.allFrames().find((f) => f.isInitialFrame)?.id || this.allFrames()[0]?.id;
    if (target) {
      this.currentPrototypeFrameId.set(target);
      this.isPrototypePlaying.set(true);
    } else {
      alert('Crea al menos un Frame (Marco) para previsualizar el prototipo.');
    }
  }

  stopPrototype() {
    this.isPrototypePlaying.set(false);
  }

  navigatePrototypeTo(frameId: string) {
    this.currentPrototypeFrameId.set(frameId);
  }

  // Zoom & Pan
  setZoom(newZoom: number, originPoint?: Point) {
    const clampedZoom = Math.min(Math.max(newZoom, 0.1), 5.0);
    const oldZoom = this.zoom();

    if (originPoint) {
      const currentPan = this.pan();
      const newPanX = originPoint.x - (originPoint.x - currentPan.x) * (clampedZoom / oldZoom);
      const newPanY = originPoint.y - (originPoint.y - currentPan.y) * (clampedZoom / oldZoom);
      this.pan.set({ x: newPanX, y: newPanY });
    }

    this.zoom.set(clampedZoom);
  }

  zoomIn() {
    this.setZoom(this.zoom() * 1.25);
  }

  zoomOut() {
    this.setZoom(this.zoom() / 1.25);
  }

  resetZoom() {
    this.zoom.set(1);
    this.pan.set({ x: 80, y: 40 });
  }

  updatePan(dx: number, dy: number) {
    this.pan.update((p) => ({ x: p.x + dx, y: p.y + dy }));
  }

  // Project Import / Export
  exportToJson(): string {
    return JSON.stringify(
      {
        version: '2.0.0',
        generator: 'Grovy Figma Clone (Angular 22)',
        elements: this.elements(),
      },
      null,
      2
    );
  }

  importFromJson(jsonString: string) {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.elements)) {
        this.elements.set(parsed.elements);
        this.selectedIds.set([]);
        this.recordSnapshot();
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON project', e);
    }
    return false;
  }
}
