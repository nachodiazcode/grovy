import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { AIEngineService } from '../../services/ai-engine.service';
import { CanvasStateService } from '../../services/canvas-state.service';
import { FigmaIconComponent } from '../icons/figma-icons.component';

@Component({
  selector: 'app-ai-prompt-dialog',
  imports: [],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center select-none font-sans text-gray-200">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" (click)="close.emit()"></div>

        <!-- Dialog Box -->
        <div class="relative w-full max-w-xl bg-[#202024] border border-[#373740] rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col animate-fade-in">
          <!-- Header -->
          <div class="h-14 px-6 border-b border-[#2d2d35] flex items-center justify-between bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-transparent">
            <div class="flex items-center gap-2.5">
              <span class="text-xl">✨</span>
              <div>
                <h2 class="text-sm font-bold text-white tracking-wide">Generador de UI con IA</h2>
                <span class="text-[10px] text-gray-400">Describe tu interfaz y Grovy creará el diseño y prototipo en el lienzo</span>
              </div>
            </div>
            <button
              type="button"
              (click)="close.emit()"
              class="w-7 h-7 rounded-lg text-gray-400 hover:text-white hover:bg-[#2b2b32] flex items-center justify-center transition"
            >
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Prompt de Diseño
              </label>
              <textarea
                #promptInput
                [value]="promptText()"
                (input)="promptText.set(promptInput.value)"
                rows="3"
                class="w-full bg-[#161619] border border-[#33333d] rounded-xl p-3 text-white outline-none focus:border-[#0d99ff] text-xs resize-none leading-relaxed placeholder:text-gray-600"
                placeholder="Ej. Crea un prototipo interactivo con 2 pantallas (Inicio y Detalles) conectadas por un botón con animación..."
                autofocus
              ></textarea>
            </div>

            <!-- Quick Suggestions Chips -->
            <div>
              <span class="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Sugerencias rápidas
              </span>
              <div class="flex flex-wrap gap-1.5">
                @for (chip of suggestions; track chip) {
                  <button
                    type="button"
                    (click)="promptText.set(chip)"
                    class="px-2.5 py-1 rounded-lg bg-[#292932] hover:bg-[#343440] text-gray-300 hover:text-white text-[11px] transition border border-[#373744]"
                  >
                    {{ chip }}
                  </button>
                }
              </div>
            </div>

            <!-- Engine Info Pill -->
            <div class="bg-[#18181c] border border-[#2b2b34] rounded-xl p-3 flex items-center justify-between text-[11px] text-gray-400">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Motor activo: <strong class="text-white">{{ ai.settings().useGemini ? 'Gemini 2.5 Flash' : 'Motor Semántico Local Grovy' }}</strong></span>
              </div>
              <span class="text-gray-500 font-mono text-[10px]">Cálculo de Layout Automático</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="h-14 px-6 border-t border-[#2d2d35] flex items-center justify-between bg-[#19191d]">
            <span class="text-[11px] text-gray-500">Inserta los elementos en el lienzo</span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="close.emit()"
                class="px-3.5 py-1.5 rounded-xl text-gray-400 hover:text-white text-xs font-medium transition hover:bg-[#2b2b32]"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="generate()"
                [disabled]="ai.isGenerating() || !promptText().trim()"
                class="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-40 transition"
              >
                @if (ai.isGenerating()) {
                  <span class="animate-spin text-sm">⟳</span>
                  <span>Generando elementos...</span>
                } @else {
                  <span>✨ Generar en el Lienzo</span>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.97); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-fade-in { animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AIPromptDialogComponent {
  readonly ai = inject(AIEngineService);
  readonly state = inject(CanvasStateService);

  readonly isOpen = input<boolean>(false);
  readonly close = output<void>();

  readonly promptText = signal<string>(
    'Crea un prototipo con 2 pantallas interactivas conectadas con un botón'
  );

  readonly suggestions = [
    'Prototipo interactivo con 2 pantallas vinculadas',
    'Tarjeta de precios con 3 características y botón CTA',
    'Tarjeta de perfil de usuario con avatar y botones de acción',
  ];

  async generate() {
    const text = this.promptText().trim();
    if (!text) return;

    // Calculate insertion point at current canvas view center
    const originX = Math.round(-this.state.pan().x / this.state.zoom() + 180);
    const originY = Math.round(-this.state.pan().y / this.state.zoom() + 100);

    const elements = await this.ai.generateUIFromPrompt(text, { x: originX, y: originY });
    if (elements.length > 0) {
      this.state.addMultipleElements(elements);
      this.close.emit();
    }
  }
}
