import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CanvasStateService } from '../../services/canvas-state.service';
import { DesignSystemService } from '../../services/design-system.service';
import { ColorToken, ComponentPreset, TypographyToken } from '../../models/figma.models';
import { FigmaIconComponent } from '../icons/figma-icons.component';

type LeftPanelTab = 'layers' | 'design-system';

@Component({
  selector: 'app-layers-panel',
  imports: [FigmaIconComponent],
  styles: `
    :host {
      display: block;
      height: 100%;
      flex-shrink: 0;
    }
  `,
  template: `
    <aside class="w-64 bg-[#252525] border-r border-[#383838] flex flex-col h-full select-none text-gray-300 z-20">
      <!-- Top Tab Switcher: Capas vs Design System -->
      <div class="h-10 border-b border-[#383838] flex items-center justify-between px-3">
        <div class="flex items-center gap-3 text-xs font-medium">
          <button
            type="button"
            (click)="activeTab.set('layers')"
            [class.text-white]="activeTab() === 'layers'"
            [class.border-[#0d99ff]]="activeTab() === 'layers'"
            [class.border-b-2]="activeTab() === 'layers'"
            [class.text-gray-400]="activeTab() !== 'layers'"
            class="pb-1.5 pt-2 transition"
          >
            Capas
          </button>
          <button
            type="button"
            (click)="activeTab.set('design-system')"
            [class.text-white]="activeTab() === 'design-system'"
            [class.border-[#0d99ff]]="activeTab() === 'design-system'"
            [class.border-b-2]="activeTab() === 'design-system'"
            [class.text-gray-400]="activeTab() !== 'design-system'"
            class="pb-1.5 pt-2 transition flex items-center gap-1"
          >
            <span>Design System</span>
            <span class="w-1.5 h-1.5 rounded-full bg-[#0d99ff]"></span>
          </button>
        </div>

        @if (activeTab() === 'layers') {
          <div class="flex items-center gap-1 text-gray-400">
            <button
              type="button"
              (click)="state.duplicateSelected()"
              [disabled]="state.selectedIds().length === 0"
              class="p-1 hover:text-white hover:bg-[#333] rounded disabled:opacity-20"
              title="Duplicar seleccionado (Cmd+D)"
            >
              <app-figma-icon name="copy" [size]="13" />
            </button>
            <button
              type="button"
              (click)="state.deleteSelected()"
              [disabled]="state.selectedIds().length === 0"
              class="p-1 hover:text-red-400 hover:bg-[#333] rounded disabled:opacity-20"
              title="Eliminar seleccionado (Del)"
            >
              <app-figma-icon name="trash" [size]="13" />
            </button>
          </div>
        }
      </div>

      <!-- TAB 1: LAYERS -->
      @if (activeTab() === 'layers') {
        <!-- Quick Layer Reorder Actions -->
        <div class="px-3 py-1.5 bg-[#202020] border-b border-[#333333] flex items-center justify-between text-[11px] text-gray-400">
          <span class="font-mono text-[10px] uppercase text-gray-500">Orden z-index</span>
          <div class="flex items-center gap-1">
            <button
              type="button"
              (click)="state.bringForward()"
              [disabled]="state.selectedIds().length === 0"
              class="px-1.5 py-0.5 rounded hover:bg-[#333] hover:text-white disabled:opacity-30"
              title="Traer adelante"
            >
              <app-figma-icon name="chevron-up" [size]="12" />
            </button>
            <button
              type="button"
              (click)="state.sendBackward()"
              [disabled]="state.selectedIds().length === 0"
              class="px-1.5 py-0.5 rounded hover:bg-[#333] hover:text-white disabled:opacity-30"
              title="Enviar atrás"
            >
              <app-figma-icon name="chevron-down" [size]="12" />
            </button>
          </div>
        </div>

        <!-- Layers Tree List -->
        <div class="flex-1 overflow-y-auto py-1">
          @if (reversedLayers().length === 0) {
            <div class="px-4 py-8 text-center text-xs text-gray-500">
              No hay capas en el lienzo.<br />
              Selecciona una herramienta para crear una.
            </div>
          } @else {
            @for (layer of reversedLayers(); track layer.id) {
              @let isSelected = state.selectedIds().includes(layer.id);
              @let hasLink = !!layer.interaction?.targetFrameId;
              <div
                (click)="onLayerClick(layer.id, $event)"
                [class.bg-[#0d99ff]/20]="isSelected"
                [class.border-l-2]="isSelected"
                [class.border-[#0d99ff]]="isSelected"
                [class.hover:bg-[#2c2c2c]]="!isSelected"
                class="group flex items-center justify-between px-3 py-1.5 text-xs cursor-pointer transition select-none"
              >
                <!-- Icon & Name -->
                <div class="flex items-center gap-2 flex-1 min-w-0 pr-1">
                  <span class="text-gray-400 group-hover:text-gray-200">
                    <app-figma-icon [name]="layer.type" [size]="13" />
                  </span>

                  @if (editingId() === layer.id) {
                    <input
                      #nameInput
                      type="text"
                      [value]="layer.name"
                      (blur)="saveName(layer.id, nameInput.value)"
                      (keydown.enter)="saveName(layer.id, nameInput.value)"
                      (keydown.escape)="cancelEdit()"
                      (click)="$event.stopPropagation()"
                      class="bg-[#1e1e1e] border border-[#0d99ff] text-white px-1.5 py-0.5 rounded text-xs outline-none w-full"
                      autofocus
                    />
                  } @else {
                    <span
                      (dblclick)="startEdit(layer.id, $event)"
                      [class.text-white]="isSelected"
                      [class.text-gray-300]="!isSelected"
                      [class.opacity-40]="!layer.visible"
                      class="truncate font-normal hover:underline flex items-center gap-1.5"
                      [title]="layer.name"
                    >
                      <span>{{ layer.name }}</span>
                      @if (hasLink) {
                        <span class="text-[9px] px-1 rounded bg-blue-500/20 text-[#0d99ff] font-mono">link</span>
                      }
                    </span>
                  }
                </div>

                <!-- Hover Controls: Lock & Visibility -->
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition" [class.opacity-100]="layer.locked || !layer.visible">
                  <button
                    type="button"
                    (click)="toggleLock(layer.id, $event)"
                    [class.text-amber-400]="layer.locked"
                    [class.text-gray-400]="!layer.locked"
                    class="p-1 hover:text-white rounded hover:bg-[#3a3a3a]"
                    [title]="layer.locked ? 'Desbloquear' : 'Bloquear'"
                  >
                    <app-figma-icon [name]="layer.locked ? 'lock' : 'unlock'" [size]="12" />
                  </button>

                  <button
                    type="button"
                    (click)="toggleVisibility(layer.id, $event)"
                    [class.text-gray-500]="!layer.visible"
                    [class.text-gray-400]="layer.visible"
                    class="p-1 hover:text-white rounded hover:bg-[#3a3a3a]"
                    [title]="layer.visible ? 'Ocultar' : 'Mostrar'"
                  >
                    <app-figma-icon [name]="layer.visible ? 'eye' : 'eye-off'" [size]="12" />
                  </button>
                </div>
              </div>
            }
          }
        </div>
      }

      <!-- TAB 2: DESIGN SYSTEM -->
      @if (activeTab() === 'design-system') {
        <div class="flex-1 overflow-y-auto p-3 space-y-5 text-xs">
          <!-- Save selection as component button -->
          @if (state.selectedElements().length > 0) {
            <div class="bg-gradient-to-r from-blue-900/40 to-indigo-900/30 border border-[#0d99ff]/40 rounded-xl p-3">
              <span class="text-xs font-semibold text-white block mb-1">Componente Personalizado</span>
              <p class="text-[11px] text-gray-400 mb-2.5">
                Guarda los {{ state.selectedElements().length }} elementos seleccionados en tu Design System.
              </p>
              <button
                type="button"
                (click)="saveCurrentSelectionAsComponent()"
                class="w-full py-1.5 rounded-lg bg-[#0d99ff] hover:bg-[#0b85de] text-white font-medium text-xs shadow-md transition flex items-center justify-center gap-1.5"
              >
                <span>❖</span>
                <span>Crear Componente</span>
              </button>
            </div>
          }

          <!-- Color Tokens Palette -->
          <div>
            <div class="flex items-center justify-between text-gray-400 font-semibold mb-2">
              <span class="uppercase tracking-wider text-[10px]">Tokens de Color</span>
              <span class="text-[10px] text-gray-500">{{ ds.colorTokens().length }} estilos</span>
            </div>
            <div class="grid grid-cols-2 gap-1.5">
              @for (token of ds.colorTokens(); track token.id) {
                <button
                  type="button"
                  (click)="applyColorToken(token)"
                  class="flex items-center gap-2 p-1.5 rounded-lg bg-[#1e1e1e] hover:bg-[#2b2b32] border border-[#33333d] transition text-left group"
                  title="Aplicar color al elemento seleccionado"
                >
                  <span
                    class="w-5 h-5 rounded-md border border-white/10 shrink-0 shadow-sm"
                    [style.background-color]="token.hex"
                  ></span>
                  <div class="min-w-0 flex-1">
                    <span class="text-[11px] font-medium text-gray-200 block truncate group-hover:text-white">
                      {{ token.name }}
                    </span>
                    <span class="text-[10px] font-mono text-gray-500 block truncate uppercase">
                      {{ token.hex }}
                    </span>
                  </div>
                </button>
              }
            </div>
          </div>

          <!-- Typography Tokens -->
          <div>
            <div class="flex items-center justify-between text-gray-400 font-semibold mb-2">
              <span class="uppercase tracking-wider text-[10px]">Tokens de Tipografía</span>
              <span class="text-[10px] text-gray-500">{{ ds.typographyTokens().length }} estilos</span>
            </div>
            <div class="space-y-1">
              @for (typo of ds.typographyTokens(); track typo.id) {
                <button
                  type="button"
                  (click)="applyTypographyToken(typo)"
                  class="w-full flex items-center justify-between p-2 rounded-lg bg-[#1e1e1e] hover:bg-[#2b2b32] border border-[#33333d] transition text-left text-gray-200 hover:text-white"
                  title="Aplicar estilo tipográfico al texto seleccionado"
                >
                  <div>
                    <span class="text-[11px] font-medium block">{{ typo.name }}</span>
                    <span class="text-[10px] text-gray-500 font-mono">{{ typo.fontSize }}px · {{ typo.fontWeight }}</span>
                  </div>
                  <span class="text-xs text-gray-500">Ag</span>
                </button>
              }
            </div>
          </div>

          <!-- Reusable Component Library -->
          <div>
            <div class="flex items-center justify-between text-gray-400 font-semibold mb-2">
              <span class="uppercase tracking-wider text-[10px]">Componentes Reutilizables</span>
              <span class="text-[10px] text-gray-500">{{ ds.components().length }}</span>
            </div>
            <div class="space-y-2">
              @for (comp of ds.components(); track comp.id) {
                <div class="bg-[#1e1e1e] border border-[#33333d] rounded-xl p-2.5 flex flex-col gap-1.5 hover:border-[#0d99ff]/50 transition">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span class="text-[#0d99ff]">❖</span>
                      <span>{{ comp.name }}</span>
                    </span>
                    <span class="text-[9px] px-1.5 py-0.5 rounded bg-[#292930] text-gray-400 font-mono">
                      {{ comp.category }}
                    </span>
                  </div>
                  <p class="text-[11px] text-gray-400 line-clamp-1">
                    {{ comp.description }}
                  </p>
                  <button
                    type="button"
                    (click)="insertComponent(comp)"
                    class="mt-1 w-full py-1 rounded-lg bg-[#272730] hover:bg-[#0d99ff] hover:text-white text-gray-300 text-[11px] font-medium transition flex items-center justify-center gap-1"
                  >
                    <span>+ Insertar en Lienzo</span>
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Footer Info -->
      <div class="h-8 border-t border-[#383838] px-3 flex items-center justify-between text-[11px] text-gray-500 bg-[#222222]">
        <span>Total: {{ state.elements().length }} objetos</span>
        @if (state.selectedIds().length > 0) {
          <span class="text-[#0d99ff]">{{ state.selectedIds().length }} seleccionado(s)</span>
        }
      </div>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayersPanelComponent {
  readonly state = inject(CanvasStateService);
  readonly ds = inject(DesignSystemService);

  readonly activeTab = signal<LeftPanelTab>('layers');
  readonly editingId = signal<string | null>(null);

  readonly reversedLayers = computed(() => {
    return [...this.state.elements()].reverse();
  });

  onLayerClick(id: string, event: MouseEvent) {
    if (this.editingId()) return;
    this.state.select(id, event.shiftKey || event.metaKey || event.ctrlKey);
  }

  startEdit(id: string, event: MouseEvent) {
    event.stopPropagation();
    this.editingId.set(id);
  }

  saveName(id: string, newName: string) {
    const trimmed = newName.trim();
    if (trimmed) {
      this.state.updateElement(id, { name: trimmed });
    }
    this.editingId.set(null);
  }

  cancelEdit() {
    this.editingId.set(null);
  }

  toggleLock(id: string, event: MouseEvent) {
    event.stopPropagation();
    this.state.toggleLock(id);
  }

  toggleVisibility(id: string, event: MouseEvent) {
    event.stopPropagation();
    this.state.toggleVisibility(id);
  }

  applyColorToken(token: ColorToken) {
    for (const el of this.state.selectedElements()) {
      this.state.updateElement(el.id, { fill: token.hex });
    }
  }

  applyTypographyToken(token: TypographyToken) {
    for (const el of this.state.selectedElements()) {
      if (el.type === 'text') {
        this.state.updateElement(el.id, {
          fontSize: token.fontSize,
          fontWeight: token.fontWeight,
          fontFamily: token.fontFamily,
        });
      }
    }
  }

  insertComponent(preset: ComponentPreset) {
    this.state.insertComponentPreset(preset);
  }

  saveCurrentSelectionAsComponent() {
    const name = prompt('Nombre del nuevo Componente:', 'Mi Componente');
    if (name) {
      this.ds.saveSelectionAsComponent(name, 'Componente creado desde el lienzo', this.state.selectedElements());
    }
  }
}
