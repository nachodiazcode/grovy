import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CanvasStateService } from '../../services/canvas-state.service';
import { FigmaElement } from '../../models/figma.models';
import { FigmaIconComponent } from '../icons/figma-icons.component';

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
    <aside class="w-60 bg-[#252525] border-r border-[#383838] flex flex-col h-full select-none text-gray-300 z-20">
      <!-- Top Tab Header -->
      <div class="h-10 border-b border-[#383838] flex items-center justify-between px-3">
        <div class="flex items-center gap-3 text-xs font-medium">
          <button
            type="button"
            class="text-white border-b-2 border-[#0d99ff] pb-1.5 pt-2"
          >
            Capas
          </button>
          <button
            type="button"
            class="text-gray-400 hover:text-gray-200 pb-1.5 pt-2 transition"
          >
            Páginas (1)
          </button>
        </div>
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
      </div>

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
                    class="truncate font-normal hover:underline"
                    [title]="layer.name"
                  >
                    {{ layer.name }}
                  </span>
                }
              </div>

              <!-- Hover Controls: Lock & Visibility -->
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition" [class.opacity-100]="layer.locked || !layer.visible">
                <!-- Lock Toggle -->
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

                <!-- Visibility Toggle -->
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

      <!-- Layers Footer Info -->
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

  readonly editingId = signal<string | null>(null);

  // Figma displays top layers at the top of the layers list (reversed order of array)
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
}
