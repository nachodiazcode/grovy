import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { CanvasStateService } from '../../services/canvas-state.service';
import { ToolType } from '../../models/figma.models';
import { FigmaIconComponent } from '../icons/figma-icons.component';

@Component({
  selector: 'app-header-toolbar',
  imports: [FigmaIconComponent],
  styles: `
    :host {
      display: block;
      width: 100%;
      flex-shrink: 0;
    }
  `,
  template: `
    <header class="h-12 bg-[#2c2c2c] border-b border-[#383838] px-3 flex items-center justify-between text-gray-200 select-none z-30 relative">
      <!-- Left: Brand & File Title -->
      <div class="flex items-center gap-3">
        <!-- Figma-like Logo Icon -->
        <div class="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md">
          <span class="text-white text-xs font-black tracking-tight">G</span>
        </div>
        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-white tracking-wide">Grovy Figma</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">v22</span>
          </div>
          <span class="text-[10px] text-gray-400">Diseño sin título</span>
        </div>

        <div class="h-5 w-[1px] bg-[#3f3f46] mx-1"></div>

        <!-- Undo / Redo -->
        <div class="flex items-center gap-0.5 bg-[#222222] p-0.5 rounded-md border border-[#383838]">
          <button
            type="button"
            (click)="state.undo()"
            [disabled]="!state.canUndo()"
            class="p-1 rounded text-gray-400 hover:text-white hover:bg-[#333333] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition"
            title="Deshacer (Cmd+Z)"
          >
            <app-figma-icon name="undo" [size]="14" />
          </button>
          <button
            type="button"
            (click)="state.redo()"
            [disabled]="!state.canRedo()"
            class="p-1 rounded text-gray-400 hover:text-white hover:bg-[#333333] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition"
            title="Rehacer (Cmd+Shift+Z)"
          >
            <app-figma-icon name="redo" [size]="14" />
          </button>
        </div>
      </div>

      <!-- Center: Tools Bar -->
      <div class="flex items-center gap-1 bg-[#1e1e1e] p-1 rounded-lg border border-[#383838] shadow-inner">
        @for (tool of tools; track tool.id) {
          <button
            type="button"
            (click)="selectTool(tool.id)"
            [class.bg-[#0d99ff]]="state.activeTool() === tool.id"
            [class.text-white]="state.activeTool() === tool.id"
            [class.text-gray-400]="state.activeTool() !== tool.id"
            class="p-1.5 rounded-md hover:bg-[#333333] hover:text-white transition flex items-center justify-center relative group"
            [title]="tool.label + ' (' + tool.shortcut + ')'"
          >
            <app-figma-icon [name]="tool.icon" [size]="15" />
            <!-- Shortcut tooltip -->
            <span class="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-black/90 text-[10px] text-gray-200 px-1.5 py-0.5 rounded border border-[#444] whitespace-nowrap z-50">
              {{ tool.label }} ({{ tool.shortcut }})
            </span>
          </button>
        }
      </div>

      <!-- Right: Zoom, Export, Import & Share -->
      <div class="flex items-center gap-2">
        <!-- Hidden file input for project import -->
        <input
          #fileInput
          type="file"
          accept=".json"
          (change)="onFileSelected($event)"
          class="hidden"
        />

        <!-- Zoom Controls -->
        <div class="flex items-center bg-[#222222] rounded-md border border-[#383838] px-1 text-xs">
          <button
            type="button"
            (click)="state.zoomOut()"
            class="p-1 text-gray-400 hover:text-white transition"
            title="Alejar (-)"
          >
            <app-figma-icon name="zoom-out" [size]="13" />
          </button>
          <button
            type="button"
            (click)="state.resetZoom()"
            class="px-1.5 py-0.5 text-[11px] font-mono text-gray-300 hover:text-white transition"
            title="Restablecer zoom al 100%"
          >
            {{ Math.round(state.zoom() * 100) }}%
          </button>
          <button
            type="button"
            (click)="state.zoomIn()"
            class="p-1 text-gray-400 hover:text-white transition"
            title="Acercar (+)"
          >
            <app-figma-icon name="zoom-in" [size]="13" />
          </button>
        </div>

        <!-- Import Button -->
        <button
          type="button"
          (click)="triggerImport()"
          class="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-[#333333] hover:bg-[#3f3f46] text-gray-200 transition border border-[#444]"
          title="Importar proyecto JSON"
        >
          <app-figma-icon name="upload" [size]="13" />
          <span>Importar</span>
        </button>

        <!-- Export Dropdown -->
        <div class="relative">
          <button
            type="button"
            (click)="toggleExportMenu()"
            class="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md bg-[#0d99ff] hover:bg-[#0b85de] text-white shadow-sm transition"
          >
            <app-figma-icon name="download" [size]="13" />
            <span>Exportar</span>
            <app-figma-icon name="chevron-down" [size]="11" />
          </button>

          @if (isExportMenuOpen) {
            <!-- Backdrop -->
            <div class="fixed inset-0 z-40" (click)="isExportMenuOpen = false"></div>
            <!-- Menu -->
            <div class="absolute right-0 mt-1.5 w-44 bg-[#252525] border border-[#3f3f46] rounded-lg shadow-2xl py-1 z-50 text-xs">
              <button
                type="button"
                (click)="exportSvg()"
                class="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white text-gray-200 flex items-center justify-between transition"
              >
                <span>Exportar SVG</span>
                <span class="text-[10px] opacity-70">Vector</span>
              </button>
              <button
                type="button"
                (click)="exportPng()"
                class="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white text-gray-200 flex items-center justify-between transition"
              >
                <span>Exportar PNG</span>
                <span class="text-[10px] opacity-70">2x Retina</span>
              </button>
              <div class="h-[1px] bg-[#383838] my-1"></div>
              <button
                type="button"
                (click)="exportJson()"
                class="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white text-gray-200 flex items-center justify-between transition"
              >
                <span>Guardar JSON</span>
                <span class="text-[10px] opacity-70">Proyecto</span>
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderToolbarComponent {
  readonly state = inject(CanvasStateService);
  protected readonly Math = Math;

  readonly fileInputRef = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  isExportMenuOpen = false;

  readonly tools: { id: ToolType; label: string; shortcut: string; icon: string }[] = [
    { id: 'select', label: 'Seleccionar / Mover', shortcut: 'V', icon: 'select' },
    { id: 'hand', label: 'Mano (Arrastrar Lienzo)', shortcut: 'H', icon: 'hand' },
    { id: 'frame', label: 'Frame (Marco)', shortcut: 'F', icon: 'frame' },
    { id: 'rect', label: 'Rectángulo', shortcut: 'R', icon: 'rect' },
    { id: 'circle', label: 'Círculo / Elipse', shortcut: 'O', icon: 'circle' },
    { id: 'star', label: 'Estrella', shortcut: 'S', icon: 'star' },
    { id: 'line', label: 'Línea', shortcut: 'L', icon: 'line' },
    { id: 'text', label: 'Texto', shortcut: 'T', icon: 'text' },
  ];

  selectTool(tool: ToolType) {
    this.state.setTool(tool);
  }

  toggleExportMenu() {
    this.isExportMenuOpen = !this.isExportMenuOpen;
  }

  triggerImport() {
    const input = this.fileInputRef()?.nativeElement;
    if (input) {
      input.click();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          const success = this.state.importFromJson(content);
          if (success) {
            alert('¡Proyecto importado correctamente!');
          } else {
            alert('El archivo JSON no tiene un formato válido.');
          }
        }
      };
      reader.readAsText(file);
      input.value = '';
    }
  }

  exportJson() {
    this.isExportMenuOpen = false;
    const json = this.state.exportToJson();
    const blob = new Blob([json], { type: 'application/json' });
    this.downloadBlob(blob, 'grovy-design.json');
  }

  exportSvg() {
    this.isExportMenuOpen = false;
    const svgEl = document.getElementById('figma-canvas-svg') as SVGGraphicsElement | null;
    if (!svgEl) return;

    // Clone svg content and wrap in standalone svg
    const svgClone = svgEl.cloneNode(true) as SVGElement;
    // Remove UI helpers/overlays from export
    const overlays = svgClone.querySelector('#selection-overlay-group');
    if (overlays) overlays.remove();
    const grid = svgClone.querySelector('#canvas-grid-pattern');
    if (grid) grid.remove();

    const svgString = new XMLSerializer().serializeToString(svgClone);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    this.downloadBlob(blob, 'grovy-design.svg');
  }

  exportPng() {
    this.isExportMenuOpen = false;
    const svgEl = document.getElementById('figma-canvas-svg') as SVGGraphicsElement | null;
    if (!svgEl) return;

    const svgClone = svgEl.cloneNode(true) as SVGElement;
    const overlays = svgClone.querySelector('#selection-overlay-group');
    if (overlays) overlays.remove();

    const svgString = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const width = svgEl.clientWidth || 1200;
      const height = svgEl.clientHeight || 800;
      canvas.width = width * 2; // 2x Retina
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(2, 2);
        ctx.drawImage(image, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            this.downloadBlob(blob, 'grovy-design.png');
          }
          URL.revokeObjectURL(blobURL);
        }, 'image/png');
      }
    };
    image.src = blobURL;
  }

  private downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
