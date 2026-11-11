import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CollaborationService } from '../../services/collaboration.service';
import { AIEngineService } from '../../services/ai-engine.service';
import { FigmaIconComponent } from '../icons/figma-icons.component';

type SettingsTab = 'collab' | 'ai' | 'canvas';

@Component({
  selector: 'app-settings-modal',
  imports: [],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center select-none font-sans text-gray-200">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" (click)="close.emit()"></div>

        <!-- Dialog Box -->
        <div class="relative w-full max-w-lg bg-[#202024] border border-[#373740] rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
          <!-- Header -->
          <div class="h-14 px-6 border-b border-[#2d2d35] flex items-center justify-between bg-[#19191d]">
            <div class="flex items-center gap-2.5">
              <span class="text-lg">⚙️</span>
              <h2 class="text-sm font-bold text-white tracking-wide">Ajustes de Grovy Figma</h2>
            </div>
            <button
              type="button"
              (click)="close.emit()"
              class="w-7 h-7 rounded-lg text-gray-400 hover:text-white hover:bg-[#2b2b32] flex items-center justify-center transition"
            >
              ✕
            </button>
          </div>

          <!-- Tabs Navigation -->
          <div class="flex items-center px-6 border-b border-[#2d2d35] bg-[#1a1a1e] text-xs font-medium gap-6">
            <button
              type="button"
              (click)="activeTab.set('collab')"
              [class.text-[#0d99ff]]="activeTab() === 'collab'"
              [class.border-[#0d99ff]]="activeTab() === 'collab'"
              class="py-3 border-b-2 border-transparent transition hover:text-white flex items-center gap-1.5"
            >
              <span>👥</span>
              <span>Colaboración</span>
            </button>
            <button
              type="button"
              (click)="activeTab.set('ai')"
              [class.text-[#0d99ff]]="activeTab() === 'ai'"
              [class.border-[#0d99ff]]="activeTab() === 'ai'"
              class="py-3 border-b-2 border-transparent transition hover:text-white flex items-center gap-1.5"
            >
              <span>✨</span>
              <span>Motor de IA</span>
            </button>
            <button
              type="button"
              (click)="activeTab.set('canvas')"
              [class.text-[#0d99ff]]="activeTab() === 'canvas'"
              [class.border-[#0d99ff]]="activeTab() === 'canvas'"
              class="py-3 border-b-2 border-transparent transition hover:text-white flex items-center gap-1.5"
            >
              <span>🎨</span>
              <span>Lienzo & Atajos</span>
            </button>
          </div>

          <!-- Content Body -->
          <div class="p-6 overflow-y-auto space-y-6 text-xs text-gray-300">
            <!-- 1. Collab Tab -->
            @if (activeTab() === 'collab') {
              <div class="space-y-4">
                <div>
                  <label class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Tu Nombre de Diseñador
                  </label>
                  <input
                    type="text"
                    [value]="collab.currentUser().name"
                    (input)="onNameChange($event)"
                    class="w-full bg-[#161619] border border-[#33333d] rounded-lg px-3 py-2 text-white outline-none focus:border-[#0d99ff] text-xs"
                    placeholder="Ej. Nacho"
                  />
                  <p class="text-[11px] text-gray-500 mt-1">Este nombre aparecerá junto a tu cursor en tiempo real para otros participantes.</p>
                </div>

                <div>
                  <label class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Color de tu Cursor Multijugador
                  </label>
                  <div class="flex items-center gap-2">
                    @for (color of colorPalette; track color) {
                      <button
                        type="button"
                        (click)="collab.setUserColor(color)"
                        [style.background-color]="color"
                        [class.ring-2]="collab.currentUser().color === color"
                        [class.ring-white]="collab.currentUser().color === color"
                        class="w-7 h-7 rounded-full cursor-pointer hover:scale-110 transition shadow-md"
                      ></button>
                    }
                  </div>
                </div>

                <div class="border-t border-[#2d2d35] pt-4">
                  <label class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Sala de Colaboración (BroadcastChannel)
                  </label>
                  <div class="flex items-center gap-2">
                    <input
                      type="text"
                      [value]="collab.roomId()"
                      (change)="onRoomChange($event)"
                      class="flex-1 bg-[#161619] border border-[#33333d] rounded-lg px-3 py-2 text-white outline-none font-mono text-xs focus:border-[#0d99ff]"
                    />
                    <span class="text-[11px] px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono">Conectado</span>
                  </div>
                  <p class="text-[11px] text-gray-500 mt-1">
                    Abre esta misma URL en otra pestaña o ventana del navegador para ver la sincronización y cursores en vivo.
                  </p>
                </div>

                <!-- Simulated Bots Toggle -->
                <div class="bg-[#18181c] border border-[#2d2d36] rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span class="text-xs font-semibold text-white block">Modo Demo Multijugador</span>
                    <span class="text-[11px] text-gray-500 block">
                      Muestra compañeros simulados (Sofía y Mateo) colaborando en el lienzo en tiempo real.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    [checked]="collab.simulatedPeersEnabled()"
                    (change)="collab.toggleSimulatedPeers()"
                    class="w-5 h-5 accent-[#0d99ff] cursor-pointer"
                  />
                </div>
              </div>
            }

            <!-- 2. AI Tab -->
            @if (activeTab() === 'ai') {
              <div class="space-y-4">
                <div class="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 rounded-xl p-3.5">
                  <div class="flex items-center gap-2 text-white font-semibold mb-1">
                    <span>✨</span>
                    <span>Generador de UI con IA</span>
                  </div>
                  <p class="text-[11px] text-gray-400 leading-relaxed">
                    Escribe un prompt en lenguaje natural (ej. <em>"Crea una tarjeta de precios"</em> o <em>"Genera un prototipo de login"</em>) y Grovy construirá la estructura visual en el lienzo con vectores y enlaces interactivos.
                  </p>
                </div>

                <div>
                  <label class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Google Gemini API Key (Opcional)
                  </label>
                  <input
                    type="password"
                    [value]="ai.settings().apiKey"
                    (input)="onApiKeyChange($event)"
                    class="w-full bg-[#161619] border border-[#33333d] rounded-lg px-3 py-2 text-white outline-none focus:border-[#0d99ff] text-xs font-mono"
                    placeholder="AIzaSy..."
                  />
                  <p class="text-[11px] text-gray-500 mt-1">
                    Si no ingresas una clave, Grovy utilizará su motor semántico integrado de alta precisión que genera interfaces y prototipos en milisegundos de forma gratuita y offline.
                  </p>
                </div>

                <div>
                  <label class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Modelo de Lenguaje
                  </label>
                  <select
                    [value]="ai.settings().model"
                    class="w-full bg-[#161619] border border-[#33333d] rounded-lg px-3 py-2 text-white outline-none text-xs"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultrarrápido y preciso)</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Diseño complejo multi-pantalla)</option>
                  </select>
                </div>
              </div>
            }

            <!-- 3. Canvas & Shortcuts Tab -->
            @if (activeTab() === 'canvas') {
              <div class="space-y-4">
                <div class="bg-[#18181c] border border-[#2d2d36] rounded-xl p-3">
                  <span class="text-xs font-semibold text-white block mb-2">Atajos de Diseño</span>
                  <div class="grid grid-cols-2 gap-2 text-[11px]">
                    <div class="flex justify-between py-1 border-b border-[#2d2d35]">
                      <span class="text-gray-400">Selección / Mover</span>
                      <kbd class="px-1.5 py-0.5 rounded bg-[#272730] text-gray-200 font-mono text-[10px]">V</kbd>
                    </div>
                    <div class="flex justify-between py-1 border-b border-[#2d2d35]">
                      <span class="text-gray-400">Mano (Pan)</span>
                      <kbd class="px-1.5 py-0.5 rounded bg-[#272730] text-gray-200 font-mono text-[10px]">H o Espacio</kbd>
                    </div>
                    <div class="flex justify-between py-1 border-b border-[#2d2d35]">
                      <span class="text-gray-400">Rectángulo</span>
                      <kbd class="px-1.5 py-0.5 rounded bg-[#272730] text-gray-200 font-mono text-[10px]">R</kbd>
                    </div>
                    <div class="flex justify-between py-1 border-b border-[#2d2d35]">
                      <span class="text-gray-400">Círculo</span>
                      <kbd class="px-1.5 py-0.5 rounded bg-[#272730] text-gray-200 font-mono text-[10px]">O</kbd>
                    </div>
                    <div class="flex justify-between py-1 border-b border-[#2d2d35]">
                      <span class="text-gray-400">Frame (Marco)</span>
                      <kbd class="px-1.5 py-0.5 rounded bg-[#272730] text-gray-200 font-mono text-[10px]">F</kbd>
                    </div>
                    <div class="flex justify-between py-1 border-b border-[#2d2d35]">
                      <span class="text-gray-400">Texto</span>
                      <kbd class="px-1.5 py-0.5 rounded bg-[#272730] text-gray-200 font-mono text-[10px]">T</kbd>
                    </div>
                    <div class="flex justify-between py-1 border-b border-[#2d2d35]">
                      <span class="text-gray-400">Duplicar</span>
                      <kbd class="px-1.5 py-0.5 rounded bg-[#272730] text-gray-200 font-mono text-[10px]">Cmd + D</kbd>
                    </div>
                    <div class="flex justify-between py-1 border-b border-[#2d2d35]">
                      <span class="text-gray-400">Deshacer / Rehacer</span>
                      <kbd class="px-1.5 py-0.5 rounded bg-[#272730] text-gray-200 font-mono text-[10px]">Cmd + Z / ⇧Z</kbd>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="h-14 px-6 border-t border-[#2d2d35] flex items-center justify-end bg-[#19191d] gap-2">
            <button
              type="button"
              (click)="close.emit()"
              class="px-4 py-2 rounded-xl bg-[#0d99ff] hover:bg-[#0b85de] text-white text-xs font-semibold shadow-md transition"
            >
              Listo
            </button>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsModalComponent {
  readonly collab = inject(CollaborationService);
  readonly ai = inject(AIEngineService);

  readonly isOpen = input<boolean>(false);
  readonly close = output<void>();

  readonly activeTab = signal<SettingsTab>('collab');

  readonly colorPalette = [
    '#ff007a',
    '#00e5ff',
    '#ffb800',
    '#7928ca',
    '#00df8f',
    '#ff4d4d',
    '#f59e0b',
  ];

  onNameChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.collab.setUserName(input.value);
  }

  onRoomChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.collab.setRoomId(input.value.trim() || 'general-workspace');
  }

  onApiKeyChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.ai.setApiKey(input.value.trim());
  }
}
