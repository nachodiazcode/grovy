import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CanvasStateService } from '../../services/canvas-state.service';
import { FigmaIconComponent } from '../icons/figma-icons.component';

type InspectorTab = 'design' | 'prototype';

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
      <!-- Tabs: Diseño vs Prototipo -->
      <div class="h-10 border-b border-[#383838] px-3 flex items-center justify-between text-xs font-medium">
        <div class="flex items-center gap-4">
          <button
            type="button"
            (click)="activeTab.set('design')"
            [class.text-white]="activeTab() === 'design'"
            [class.border-[#0d99ff]]="activeTab() === 'design'"
            [class.border-b-2]="activeTab() === 'design'"
            [class.text-gray-400]="activeTab() !== 'design'"
            class="pb-1.5 pt-2 transition"
          >
            Diseño
          </button>
          <button
            type="button"
            (click)="activeTab.set('prototype')"
            [class.text-white]="activeTab() === 'prototype'"
            [class.border-[#0d99ff]]="activeTab() === 'prototype'"
            [class.border-b-2]="activeTab() === 'prototype'"
            [class.text-gray-400]="activeTab() !== 'prototype'"
            class="pb-1.5 pt-2 transition flex items-center gap-1"
          >
            <span>Prototipo</span>
            @if (state.primarySelectedElement()?.interaction) {
              <span class="w-1.5 h-1.5 rounded-full bg-[#0d99ff]"></span>
            }
          </button>
        </div>

        <button
          type="button"
          (click)="state.startPrototype()"
          class="flex items-center gap-1 px-2 py-0.5 rounded bg-[#0d99ff]/20 text-[#0d99ff] hover:bg-[#0d99ff] hover:text-white transition text-[11px] font-semibold"
          title="Ver presentación de prototipo"
        >
          <span>▶</span>
          <span>Play</span>
        </button>
      </div>

      @let el = state.primarySelectedElement();

      <!-- TAB 1: DESIGN -->
      @if (activeTab() === 'design') {
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

                <!-- Corner Radius -->
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

            <!-- Typography (Conditional) -->
            @if (el.type === 'text') {
              <div class="border-t border-[#383838] pt-3">
                <div class="text-gray-400 font-semibold mb-2 uppercase tracking-wider text-[10px]">
                  Tipografía
                </div>

                <div class="space-y-2">
                  <textarea
                    [value]="el.content || ''"
                    (input)="updateString(el.id, 'content', $event)"
                    rows="2"
                    class="w-full bg-[#1e1e1e] border border-[#383838] rounded p-2 text-white outline-none focus:border-[#0d99ff] text-xs resize-none"
                    placeholder="Escribe tu texto..."
                  ></textarea>

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

            <!-- Fill Section -->
            <div class="border-t border-[#383838] pt-3">
              <div class="flex items-center justify-between text-gray-400 font-semibold mb-2">
                <span class="uppercase tracking-wider text-[10px]">Relleno (Fill)</span>
                <span class="text-[10px] text-gray-500">{{ Math.round(el.fillOpacity * 100) }}%</span>
              </div>

              <div class="flex items-center gap-2 bg-[#1e1e1e] border border-[#383838] rounded p-1.5 focus-within:border-[#0d99ff]">
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
                />
              </div>
            </div>

            <!-- Stroke Section -->
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

            <!-- Effects Section -->
            <div class="border-t border-[#383838] pt-3">
              <div class="flex items-center justify-between text-gray-400 font-semibold mb-2">
                <span class="uppercase tracking-wider text-[10px]">Sombra (Drop Shadow)</span>
                <span class="text-[10px] text-gray-500">{{ el.shadowBlur }}px</span>
              </div>

              <div class="grid grid-cols-3 gap-1 bg-[#1e1e1e] border border-[#383838] rounded p-2">
                <div>
                  <span class="text-[9px] text-gray-500 block">X</span>
                  <input
                    type="number"
                    [value]="el.shadowOffsetX"
                    (input)="updateNumber(el.id, 'shadowOffsetX', $event)"
                    class="bg-[#252525] text-white w-full rounded px-1.5 py-0.5 outline-none font-mono text-xs text-right"
                  />
                </div>
                <div>
                  <span class="text-[9px] text-gray-500 block">Y</span>
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
        } @else {
          <div class="p-4 space-y-4 text-xs text-gray-500 text-center">
            Ningún objeto seleccionado
          </div>
        }
      }

      <!-- TAB 2: PROTOTYPE -->
      @if (activeTab() === 'prototype') {
        <div class="p-4 space-y-4 text-xs">
          @if (el) {
            <div class="bg-gradient-to-br from-blue-900/20 to-purple-900/10 border border-[#0d99ff]/30 rounded-xl p-3">
              <span class="text-xs font-semibold text-white block mb-1">Interacción de Prototipo</span>
              <p class="text-[11px] text-gray-400 leading-relaxed mb-3">
                Conecta este elemento con otro Frame para crear navegación interactiva.
              </p>

              <!-- Target Frame Selector -->
              <div class="space-y-3">
                <div>
                  <label class="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Frame de Destino
                  </label>
                  <select
                    [value]="el.interaction?.targetFrameId || ''"
                    (change)="updateTargetFrame(el.id, $event)"
                    class="w-full bg-[#18181c] border border-[#383838] rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-[#0d99ff] text-xs"
                  >
                    <option value="">(Sin interacción)</option>
                    @for (frame of state.allFrames(); track frame.id) {
                      @if (frame.id !== el.id) {
                        <option [value]="frame.id">{{ frame.name }}</option>
                      }
                    }
                  </select>
                </div>

                @if (el.interaction?.targetFrameId) {
                  <div>
                    <label class="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Animación de Transición
                    </label>
                    <select
                      [value]="el.interaction?.animation || 'slide-left'"
                      (change)="updateAnimation(el.id, $event)"
                      class="w-full bg-[#18181c] border border-[#383838] rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-[#0d99ff] text-xs"
                    >
                      <option value="slide-left">Deslizar a la izquierda (Slide Left)</option>
                      <option value="slide-right">Deslizar a la derecha (Slide Right)</option>
                      <option value="dissolve">Disolver (Fade In)</option>
                      <option value="instant">Instantáneo</option>
                    </select>
                  </div>
                }
              </div>
            </div>

            <!-- Start presentation CTA -->
            <button
              type="button"
              (click)="state.startPrototype()"
              class="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2"
            >
              <span>▶</span>
              <span>Probar en Modo Presentación</span>
            </button>
          } @else {
            <div class="text-center text-gray-500 py-6">
              Selecciona un elemento en el lienzo para configurarle una interacción de prototipo.
            </div>
          }
        </div>
      }
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InspectorPanelComponent {
  readonly state = inject(CanvasStateService);
  protected readonly Math = Math;

  readonly activeTab = signal<InspectorTab>('design');

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

  updateTargetFrame(id: string, event: Event) {
    const select = event.target as HTMLSelectElement;
    const targetFrameId = select.value;
    if (!targetFrameId) {
      this.state.setElementInteraction(id, undefined);
    } else {
      this.state.setElementInteraction(id, {
        trigger: 'click',
        action: 'navigate',
        targetFrameId,
        animation: 'slide-left',
      });
    }
  }

  updateAnimation(id: string, event: Event) {
    const select = event.target as HTMLSelectElement;
    const el = this.state.primarySelectedElement();
    if (el?.interaction) {
      this.state.setElementInteraction(id, {
        ...el.interaction,
        animation: select.value as any,
      });
    }
  }

  formatHex(color: string): string {
    if (color && color.startsWith('#') && color.length >= 7) {
      return color.substring(0, 7);
    }
    return '#000000';
  }
}
