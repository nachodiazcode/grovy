import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { CanvasStateService } from '../../services/canvas-state.service';
import { FigmaIconComponent } from '../icons/figma-icons.component';

@Component({
  selector: 'app-inspector-panel',
  imports: [FigmaIconComponent],
  styles: `
    :host {
      display: block;
      height: 100%;
      flex-shrink: 0;
    }
  `,
  template: `
    <aside class="w-64 bg-[#252525] border-l border-[#383838] flex flex-col h-full select-none text-gray-300 z-20 overflow-y-auto">
      @let el = state.primarySelectedElement();

      @if (el) {
        <!-- Alignment Toolbar -->
        <div class="h-10 border-b border-[#383838] px-3 flex items-center justify-between">
          <button
            type="button"
            (click)="state.alignSelected('left')"
            class="p-1.5 hover:bg-[#333] hover:text-white rounded text-gray-400 transition"
            title="Alinear a la izquierda"
          >
            <app-figma-icon name="align-left" [size]="14" />
          </button>
          <button
            type="button"
            (click)="state.alignSelected('center')"
            class="p-1.5 hover:bg-[#333] hover:text-white rounded text-gray-400 transition"
            title="Alinear al centro horizontal"
          >
            <app-figma-icon name="align-center" [size]="14" />
          </button>
          <button
            type="button"
            (click)="state.alignSelected('right')"
            class="p-1.5 hover:bg-[#333] hover:text-white rounded text-gray-400 transition"
            title="Alinear a la derecha"
          >
            <app-figma-icon name="align-right" [size]="14" />
          </button>
          <div class="h-4 w-[1px] bg-[#3f3f46]"></div>
          <button
            type="button"
            (click)="state.alignSelected('top')"
            class="p-1.5 hover:bg-[#333] hover:text-white rounded text-gray-400 transition"
            title="Alinear arriba"
          >
            <app-figma-icon name="align-top" [size]="14" />
          </button>
          <button
            type="button"
            (click)="state.alignSelected('middle')"
            class="p-1.5 hover:bg-[#333] hover:text-white rounded text-gray-400 transition"
            title="Alinear al medio vertical"
          >
            <app-figma-icon name="align-middle" [size]="14" />
          </button>
          <button
            type="button"
            (click)="state.alignSelected('bottom')"
            class="p-1.5 hover:bg-[#333] hover:text-white rounded text-gray-400 transition"
            title="Alinear abajo"
          >
            <app-figma-icon name="align-bottom" [size]="14" />
          </button>
        </div>

        <div class="p-3 space-y-4 text-xs">
          <!-- Transform / Dimensions Section -->
          <div>
            <div class="flex items-center justify-between text-gray-400 font-semibold mb-2">
              <span class="uppercase tracking-wider text-[10px]">Posición y Tamaño</span>
              <span class="text-[10px] text-gray-500 font-mono">{{ el.type }}</span>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <!-- X -->
              <div class="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 focus-within:border-[#0d99ff]">
                <span class="text-gray-500 font-mono text-[11px] w-4">X</span>
                <input
                  type="number"
                  [value]="Math.round(el.x)"
                  (input)="updateNumber(el.id, 'x', $event)"
                  class="bg-transparent text-white w-full outline-none text-right font-mono text-xs"
                />
              </div>

              <!-- Y -->
              <div class="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 focus-within:border-[#0d99ff]">
                <span class="text-gray-500 font-mono text-[11px] w-4">Y</span>
                <input
                  type="number"
                  [value]="Math.round(el.y)"
                  (input)="updateNumber(el.id, 'y', $event)"
                  class="bg-transparent text-white w-full outline-none text-right font-mono text-xs"
                />
              </div>

              <!-- W -->
              <div class="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 focus-within:border-[#0d99ff]">
                <span class="text-gray-500 font-mono text-[11px] w-4">W</span>
                <input
                  type="number"
                  [value]="Math.round(el.width)"
                  (input)="updateNumber(el.id, 'width', $event)"
                  min="1"
                  class="bg-transparent text-white w-full outline-none text-right font-mono text-xs"
                />
              </div>

              <!-- H -->
              <div class="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 focus-within:border-[#0d99ff]">
                <span class="text-gray-500 font-mono text-[11px] w-4">H</span>
                <input
                  type="number"
                  [value]="Math.round(el.height)"
                  (input)="updateNumber(el.id, 'height', $event)"
                  min="1"
                  class="bg-transparent text-white w-full outline-none text-right font-mono text-xs"
                />
              </div>

              <!-- Rotation -->
              <div class="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 focus-within:border-[#0d99ff]">
                <span class="text-gray-500 font-mono text-[11px] w-4">∠</span>
                <input
                  type="number"
                  [value]="Math.round(el.rotation)"
                  (input)="updateNumber(el.id, 'rotation', $event)"
                  class="bg-transparent text-white w-full outline-none text-right font-mono text-xs"
                />
                <span class="text-gray-500 text-[10px] ml-1">°</span>
              </div>

              <!-- Corner Radius (for rects & frames) -->
              <div class="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 focus-within:border-[#0d99ff]">
                <span class="text-gray-500 font-mono text-[11px] w-4">⌒</span>
                <input
                  type="number"
                  [value]="Math.round(el.cornerRadius)"
                  (input)="updateNumber(el.id, 'cornerRadius', $event)"
                  min="0"
                  class="bg-transparent text-white w-full outline-none text-right font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <!-- Text Section (Conditional) -->
          @if (el.type === 'text') {
            <div class="border-t border-[#383838] pt-3">
              <div class="text-gray-400 font-semibold mb-2 uppercase tracking-wider text-[10px]">
                Tipografía
              </div>

              <div class="space-y-2">
                <!-- Text Content Input -->
                <textarea
                  [value]="el.content || ''"
                  (input)="updateString(el.id, 'content', $event)"
                  rows="2"
                  class="w-full bg-[#1e1e1e] border border-[#383838] rounded p-2 text-white outline-none focus:border-[#0d99ff] text-xs resize-none"
                  placeholder="Escribe tu texto..."
                ></textarea>

                <!-- Font Size & Weight -->
                <div class="grid grid-cols-2 gap-2">
                  <div class="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1">
                    <span class="text-gray-500 font-mono text-[10px] w-8">Tamaño</span>
                    <input
                      type="number"
                      [value]="el.fontSize || 16"
                      (input)="updateNumber(el.id, 'fontSize', $event)"
                      min="6"
                      max="144"
                      class="bg-transparent text-white w-full outline-none text-right font-mono text-xs"
                    />
                  </div>

                  <select
                    [value]="el.fontWeight || '400'"
                    (change)="updateSelect(el.id, 'fontWeight', $event)"
                    class="bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 text-white outline-none text-xs"
                  >
                    <option value="400">Regular (400)</option>
                    <option value="600">Semibold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="900">Black (900)</option>
                  </select>
                </div>
              </div>
            </div>
          }

          <!-- Fill (Relleno) Section -->
          <div class="border-t border-[#383838] pt-3">
            <div class="flex items-center justify-between text-gray-400 font-semibold mb-2">
              <span class="uppercase tracking-wider text-[10px]">Relleno (Fill)</span>
              <span class="text-[10px] text-gray-500">{{ Math.round(el.fillOpacity * 100) }}%</span>
            </div>

            <div class="flex items-center gap-2 bg-[#1e1e1e] border border-[#383838] rounded p-1.5 focus-within:border-[#0d99ff]">
              <!-- Color Picker Input Swatch -->
              <input
                type="color"
                [value]="formatHex(el.fill)"
                (input)="updateColor(el.id, 'fill', $event)"
                class="w-6 h-6 rounded cursor-pointer border border-[#444] bg-transparent p-0"
              />
              <input
                type="text"
                [value]="el.fill.toUpperCase()"
                (change)="updateHexText(el.id, 'fill', $event)"
                class="bg-transparent text-white w-20 outline-none font-mono text-xs uppercase"
              />
              <div class="h-4 w-[1px] bg-[#383838] mx-1"></div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                [value]="el.fillOpacity"
                (input)="updateNumber(el.id, 'fillOpacity', $event)"
                class="w-full accent-[#0d99ff] cursor-pointer"
                title="Opacidad de relleno"
              />
            </div>
          </div>

          <!-- Stroke (Borde) Section -->
          <div class="border-t border-[#383838] pt-3">
            <div class="flex items-center justify-between text-gray-400 font-semibold mb-2">
              <span class="uppercase tracking-wider text-[10px]">Borde (Stroke)</span>
              <span class="text-[10px] text-gray-500">{{ el.strokeWidth }}px</span>
            </div>

            <div class="flex items-center gap-2 bg-[#1e1e1e] border border-[#383838] rounded p-1.5 focus-within:border-[#0d99ff]">
              <input
                type="color"
                [value]="formatHex(el.stroke)"
                (input)="updateColor(el.id, 'stroke', $event)"
                class="w-6 h-6 rounded cursor-pointer border border-[#444] bg-transparent p-0"
              />
              <input
                type="text"
                [value]="el.stroke.toUpperCase()"
                (change)="updateHexText(el.id, 'stroke', $event)"
                class="bg-transparent text-white w-20 outline-none font-mono text-xs uppercase"
              />
              <div class="h-4 w-[1px] bg-[#383838] mx-1"></div>
              <div class="flex items-center gap-1 w-20">
                <span class="text-gray-500 text-[10px]">W:</span>
                <input
                  type="number"
                  [value]="el.strokeWidth"
                  (input)="updateNumber(el.id, 'strokeWidth', $event)"
                  min="0"
                  max="50"
                  class="bg-transparent text-white w-full outline-none text-right font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <!-- Effects (Sombra / Drop Shadow) Section -->
          <div class="border-t border-[#383838] pt-3">
            <div class="flex items-center justify-between text-gray-400 font-semibold mb-2">
              <span class="uppercase tracking-wider text-[10px]">Sombra (Drop Shadow)</span>
              <span class="text-[10px] text-gray-500">{{ el.shadowBlur }}px blur</span>
            </div>

            <div class="space-y-2 bg-[#1e1e1e] border border-[#383838] rounded p-2">
              <div class="grid grid-cols-3 gap-1">
                <div>
                  <span class="text-[9px] text-gray-500 block">Offset X</span>
                  <input
                    type="number"
                    [value]="el.shadowOffsetX"
                    (input)="updateNumber(el.id, 'shadowOffsetX', $event)"
                    class="bg-[#252525] text-white w-full rounded px-1.5 py-0.5 outline-none font-mono text-xs text-right"
                  />
                </div>
                <div>
                  <span class="text-[9px] text-gray-500 block">Offset Y</span>
                  <input
                    type="number"
                    [value]="el.shadowOffsetY"
                    (input)="updateNumber(el.id, 'shadowOffsetY', $event)"
                    class="bg-[#252525] text-white w-full rounded px-1.5 py-0.5 outline-none font-mono text-xs text-right"
                  />
                </div>
                <div>
                  <span class="text-[9px] text-gray-500 block">Blur</span>
                  <input
                    type="number"
                    [value]="el.shadowBlur"
                    (input)="updateNumber(el.id, 'shadowBlur', $event)"
                    min="0"
                    class="bg-[#252525] text-white w-full rounded px-1.5 py-0.5 outline-none font-mono text-xs text-right"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- General Opacity Section -->
          <div class="border-t border-[#383838] pt-3">
            <div class="flex items-center justify-between text-gray-400 font-semibold mb-1">
              <span class="uppercase tracking-wider text-[10px]">Opacidad de Capa</span>
              <span class="text-[10px] text-gray-500">{{ Math.round(el.opacity * 100) }}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              [value]="el.opacity"
              (input)="updateNumber(el.id, 'opacity', $event)"
              class="w-full accent-[#0d99ff] cursor-pointer"
            />
          </div>
        </div>
      } @else {
        <!-- Empty State / Canvas Settings -->
        <div class="p-4 space-y-4 text-xs">
          <div class="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
            Lienzo de diseño
          </div>

          <div class="bg-[#1e1e1e] border border-[#383838] rounded-lg p-3 space-y-3">
            <div class="text-gray-400">
              <p class="font-medium text-white mb-1">Ningún objeto seleccionado</p>
              <p class="text-[11px] text-gray-500 leading-relaxed">
                Haz clic en una capa o dibuja una forma en el lienzo para ajustar sus propiedades de diseño.
              </p>
            </div>

            <div class="border-t border-[#333] pt-2 text-[11px] text-gray-400 space-y-1">
              <div class="flex justify-between">
                <span>Color de fondo:</span>
                <span class="font-mono text-gray-300">#1E1E1E</span>
              </div>
              <div class="flex justify-between">
                <span>Zoom activo:</span>
                <span class="font-mono text-gray-300">{{ Math.round(state.zoom() * 100) }}%</span>
              </div>
            </div>
          </div>

          <!-- Keyboard Shortcuts Cheat-sheet -->
          <div class="bg-[#202020] border border-[#333] rounded-lg p-3">
            <span class="text-[10px] uppercase font-semibold text-gray-500 block mb-2">Atajos de teclado</span>
            <ul class="text-[11px] space-y-1 text-gray-400 font-mono">
              <li class="flex justify-between">
                <span class="text-gray-300">V / H</span>
                <span>Seleccionar / Mano</span>
              </li>
              <li class="flex justify-between">
                <span class="text-gray-300">R / O / T</span>
                <span>Rect / Círculo / Texto</span>
              </li>
              <li class="flex justify-between">
                <span class="text-gray-300">Espacio + Drag</span>
                <span>Pan / Desplazar</span>
              </li>
              <li class="flex justify-between">
                <span class="text-gray-300">Cmd+Z / Cmd+Shift+Z</span>
                <span>Undo / Redo</span>
              </li>
              <li class="flex justify-between">
                <span class="text-gray-300">Cmd+D</span>
                <span>Duplicar</span>
              </li>
              <li class="flex justify-between">
                <span class="text-gray-300">Supr / Backspace</span>
                <span>Eliminar</span>
              </li>
            </ul>
          </div>
        </div>
      }
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InspectorPanelComponent {
  readonly state = inject(CanvasStateService);
  protected readonly Math = Math;

  updateNumber(id: string, property: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
    if (!isNaN(value)) {
      this.state.updateElement(id, { [property]: value });
    }
  }

  updateString(id: string, property: string, event: Event) {
    const input = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.state.updateElement(id, { [property]: input.value });
  }

  updateSelect(id: string, property: string, event: Event) {
    const select = event.target as HTMLSelectElement;
    this.state.updateElement(id, { [property]: select.value });
  }

  updateColor(id: string, property: string, event: Event) {
    const input = event.target as HTMLInputElement;
    this.state.updateElement(id, { [property]: input.value });
  }

  updateHexText(id: string, property: string, event: Event) {
    const input = event.target as HTMLInputElement;
    let hex = input.value.trim();
    if (!hex.startsWith('#')) hex = '#' + hex;
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      this.state.updateElement(id, { [property]: hex });
    }
  }

  formatHex(color: string): string {
    if (color && color.startsWith('#') && color.length >= 7) {
      return color.substring(0, 7);
    }
    return '#000000';
  }
}
