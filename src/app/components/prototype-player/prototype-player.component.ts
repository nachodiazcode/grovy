import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CanvasStateService } from '../../services/canvas-state.service';
import { FigmaElement } from '../../models/figma.models';
import { FigmaIconComponent } from '../icons/figma-icons.component';

type DeviceType = 'iphone' | 'macbook' | 'responsive';

@Component({
  selector: 'app-prototype-player',
  imports: [FigmaIconComponent],
  template: `
    @if (state.isPrototypePlaying()) {
      <div
        class="fixed inset-0 z-50 bg-[#0d0d11] flex flex-col select-none overflow-hidden font-sans text-gray-200 animate-fade-in"
      >
        <!-- Top Luxury Header Bar -->
        <header
          class="h-14 bg-[#18181c]/90 backdrop-blur-md border-b border-[#2b2b32] px-6 flex items-center justify-between z-30"
        >
          <!-- Left: Frame Selector & Status -->
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span class="text-white text-xs font-black">▶</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-white tracking-wide">Grovy Player</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  En vivo
                </span>
              </div>
              <div class="text-[11px] text-gray-400 flex items-center gap-1">
                <span>Frame activo:</span>
                <select
                  [value]="state.currentPrototypeFrameId() || ''"
                  (change)="onSelectFrame($event)"
                  class="bg-transparent text-white font-medium outline-none cursor-pointer hover:underline"
                >
                  @for (frame of state.allFrames(); track frame.id) {
                    <option [value]="frame.id" class="bg-[#1e1e1e] text-white">
                      {{ frame.name }}
                    </option>
                  }
                </select>
              </div>
            </div>
          </div>

          <!-- Center: Device Switcher (Luxury Device Bezels) -->
          <div class="flex items-center bg-[#222228] p-1 rounded-xl border border-[#33333d] shadow-inner text-xs">
            <button
              type="button"
              (click)="selectedDevice.set('iphone')"
              [class.bg-[#0d99ff]]="selectedDevice() === 'iphone'"
              [class.text-white]="selectedDevice() === 'iphone'"
              [class.text-gray-400]="selectedDevice() !== 'iphone'"
              class="px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5"
            >
              <span>📱</span>
              <span>iPhone 15 Pro</span>
            </button>
            <button
              type="button"
              (click)="selectedDevice.set('macbook')"
              [class.bg-[#0d99ff]]="selectedDevice() === 'macbook'"
              [class.text-white]="selectedDevice() === 'macbook'"
              [class.text-gray-400]="selectedDevice() !== 'macbook'"
              class="px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5"
            >
              <span>💻</span>
              <span>MacBook Pro</span>
            </button>
            <button
              type="button"
              (click)="selectedDevice.set('responsive')"
              [class.bg-[#0d99ff]]="selectedDevice() === 'responsive'"
              [class.text-white]="selectedDevice() === 'responsive'"
              [class.text-gray-400]="selectedDevice() !== 'responsive'"
              class="px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5"
            >
              <span>🖥️</span>
              <span>100% Pantalla</span>
            </button>
          </div>

          <!-- Right: Controls (Restart & Close) -->
          <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="restartPrototype()"
              class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#27272f] hover:bg-[#34343e] text-gray-200 transition border border-[#3f3f4e]"
              title="Reiniciar prototipo al frame inicial (R)"
            >
              <app-figma-icon name="undo" [size]="13" />
              <span>Reiniciar (R)</span>
            </button>

            <button
              type="button"
              (click)="state.stopPrototype()"
              class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition border border-red-500/30"
              title="Cerrar presentación (Esc)"
            >
              <span>✕</span>
              <span>Salir</span>
            </button>
          </div>
        </header>

        <!-- Main Interactive Presentation Stage -->
        <main
          class="flex-1 flex items-center justify-center relative p-6 overflow-auto"
          (click)="onStageClick($event)"
        >
          <!-- Device Frame Bezel Wrapper -->
          @if (activeFrame(); as frame) {
            <div
              [class]="getDeviceWrapperClass()"
              [style.width.px]="getDeviceWidth(frame)"
              [style.height.px]="getDeviceHeight(frame)"
              class="relative bg-[#121216] transition-all duration-300 shadow-2xl flex flex-col overflow-hidden"
              [class.animate-slide-left]="animationState() === 'slide-left'"
              [class.animate-slide-right]="animationState() === 'slide-right'"
              [class.animate-fade-in]="animationState() === 'dissolve'"
            >
              <!-- iPhone Dynamic Island & Status Bar -->
              @if (selectedDevice() === 'iphone') {
                <div class="h-10 bg-black w-full flex items-center justify-between px-7 pt-2 select-none z-30 shrink-0">
                  <span class="text-xs font-semibold text-white">9:41</span>
                  <!-- Dynamic Island Pill -->
                  <div class="w-24 h-5 bg-black rounded-full border border-gray-800 flex items-center justify-end px-2 gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                    <span class="w-2 h-2 rounded-full bg-blue-500/80"></span>
                  </div>
                  <div class="flex items-center gap-1 text-white text-[11px]">
                    <span>5G</span>
                    <span>🔋</span>
                  </div>
                </div>
              }

              <!-- MacBook Window Header Controls -->
              @if (selectedDevice() === 'macbook') {
                <div class="h-8 bg-[#1f1f24] w-full flex items-center px-3 gap-2 border-b border-[#2d2d35] shrink-0">
                  <span class="w-3 h-3 rounded-full bg-[#ff5f56] inline-block"></span>
                  <span class="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block"></span>
                  <span class="w-3 h-3 rounded-full bg-[#27c93f] inline-block"></span>
                  <span class="text-[11px] text-gray-400 mx-auto font-mono">{{ frame.name }}</span>
                </div>
              }

              <!-- Screen Viewport Content (Interactive SVG) -->
              <div class="flex-1 w-full h-full relative overflow-hidden bg-[#18181b]">
                <svg
                  [attr.viewBox]="'0 0 ' + frame.width + ' ' + frame.height"
                  class="w-full h-full block"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    @for (el of frameChildElements(); track el.id) {
                      @if (el.shadowBlur > 0) {
                        <filter [id]="'proto-shadow-' + el.id" x="-50%" y="-50%" width="200%" height="200%">
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

                  <!-- Frame Background -->
                  <rect
                    x="0"
                    y="0"
                    [attr.width]="frame.width"
                    [attr.height]="frame.height"
                    [attr.fill]="frame.fill"
                    [attr.fill-opacity]="frame.fillOpacity"
                  />

                  <!-- Frame Children Elements -->
                  @for (el of frameChildElements(); track el.id) {
                    @if (el.visible) {
                      @let relX = el.x - frame.x;
                      @let relY = el.y - frame.y;
                      @let hasLink = !!el.interaction?.targetFrameId;

                      <g
                        [attr.id]="'proto-el-' + el.id"
                        [attr.opacity]="el.opacity"
                        [attr.filter]="el.shadowBlur > 0 ? 'url(#proto-shadow-' + el.id + ')' : null"
                        [class.cursor-pointer]="hasLink"
                        (click)="onElementClick(el, $event)"
                      >
                        <!-- Rect -->
                        @if (el.type === 'rect') {
                          <rect
                            [attr.x]="relX"
                            [attr.y]="relY"
                            [attr.width]="el.width"
                            [attr.height]="el.height"
                            [attr.rx]="el.cornerRadius"
                            [attr.fill]="el.fill"
                            [attr.fill-opacity]="el.fillOpacity"
                            [attr.stroke]="el.stroke"
                            [attr.stroke-width]="el.strokeWidth"
                          />
                        }

                        <!-- Circle -->
                        @if (el.type === 'circle') {
                          <ellipse
                            [attr.cx]="relX + el.width / 2"
                            [attr.cy]="relY + el.height / 2"
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
                            [attr.points]="getStarPoints(relX, relY, el.width, el.height)"
                            [attr.fill]="el.fill"
                            [attr.fill-opacity]="el.fillOpacity"
                            [attr.stroke]="el.stroke"
                            [attr.stroke-width]="el.strokeWidth"
                          />
                        }

                        <!-- Line -->
                        @if (el.type === 'line') {
                          <line
                            [attr.x1]="relX"
                            [attr.y1]="relY + el.height / 2"
                            [attr.x2]="relX + el.width"
                            [attr.y2]="relY + el.height / 2"
                            [attr.stroke]="el.stroke !== 'transparent' ? el.stroke : el.fill"
                            [attr.stroke-width]="el.strokeWidth > 0 ? el.strokeWidth : 2"
                          />
                        }

                        <!-- Text -->
                        @if (el.type === 'text') {
                          <text
                            [attr.x]="relX"
                            [attr.y]="relY + (el.fontSize || 16)"
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

                        <!-- Hotspot Hint Glow (Pulsing blue overlay when hints active) -->
                        @if (showHotspots() && hasLink) {
                          <rect
                            [attr.x]="relX"
                            [attr.y]="relY"
                            [attr.width]="el.width"
                            [attr.height]="el.height"
                            [attr.rx]="el.cornerRadius"
                            fill="#0d99ff"
                            fill-opacity="0.3"
                            stroke="#0d99ff"
                            stroke-width="2"
                            class="animate-pulse pointer-events-none"
                          />
                        }
                      </g>
                    }
                  }
                </svg>
              </div>

              <!-- iPhone Home Indicator Bar -->
              @if (selectedDevice() === 'iphone') {
                <div class="h-5 bg-black w-full flex items-center justify-center shrink-0">
                  <div class="w-32 h-1 bg-white/40 rounded-full"></div>
                </div>
              }
            </div>
          } @else {
            <div class="text-center text-gray-500 text-sm">
              No hay frames para mostrar.<br />
              Crea un Frame en el lienzo de diseño para probar el prototipo.
            </div>
          }

          <!-- Floating Helper Tip -->
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#18181e]/90 backdrop-blur-md border border-[#33333d] px-4 py-2 rounded-full text-xs text-gray-300 shadow-xl pointer-events-none flex items-center gap-2">
            <span>💡</span>
            <span>Haz clic en los botones enlazados para navegar. Haz clic fuera para resaltar áreas interactivas.</span>
          </div>
        </main>
      </div>
    }
  `,
  styles: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideLeft {
      from { transform: translateX(40px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideRight {
      from { transform: translateX(-40px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-fade-in { animation: fadeIn 0.25s ease-out; }
    .animate-slide-left { animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    .animate-slide-right { animation: slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrototypePlayerComponent {
  readonly state = inject(CanvasStateService);

  readonly selectedDevice = signal<DeviceType>('macbook');
  readonly showHotspots = signal<boolean>(false);
  readonly animationState = signal<string>('fade-in');

  private hotspotTimeout: any = null;

  // Active Frame
  readonly activeFrame = computed(() => {
    const id = this.state.currentPrototypeFrameId();
    const frames = this.state.allFrames();
    return frames.find((f) => f.id === id) || frames[0] || null;
  });

  // Elements that belong to this frame
  readonly frameChildElements = computed<FigmaElement[]>(() => {
    const frame = this.activeFrame();
    if (!frame) return [];

    return this.state.elements().filter((el) => {
      if (el.id === frame.id) return false;
      // An element belongs to the frame if its center or bounds intersect
      const cx = el.x + el.width / 2;
      const cy = el.y + el.height / 2;
      return (
        cx >= frame.x &&
        cx <= frame.x + frame.width &&
        cy >= frame.y &&
        cy <= frame.y + frame.height
      );
    });
  });

  getDeviceWidth(frame: FigmaElement): number {
    if (this.selectedDevice() === 'iphone') return 375;
    if (this.selectedDevice() === 'macbook') return Math.max(frame.width, 680);
    return frame.width;
  }

  getDeviceHeight(frame: FigmaElement): number {
    if (this.selectedDevice() === 'iphone') return 720;
    if (this.selectedDevice() === 'macbook') return Math.max(frame.height + 32, 480);
    return frame.height;
  }

  getDeviceWrapperClass(): string {
    if (this.selectedDevice() === 'iphone') {
      return 'rounded-[48px] border-[10px] border-[#29292e] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]';
    }
    if (this.selectedDevice() === 'macbook') {
      return 'rounded-xl border border-[#3b3b44] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.85)]';
    }
    return 'rounded-lg border border-[#2b2b34] shadow-2xl';
  }

  onSelectFrame(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.state.navigatePrototypeTo(select.value);
  }

  onElementClick(el: FigmaElement, event: MouseEvent) {
    if (el.interaction && el.interaction.targetFrameId) {
      event.stopPropagation();
      const anim = el.interaction.animation || 'slide-left';
      this.animationState.set(anim);
      this.state.navigatePrototypeTo(el.interaction.targetFrameId);
    }
  }

  onStageClick(event: MouseEvent) {
    // Flash hotspots when user clicks empty canvas (like Figma)
    this.showHotspots.set(true);
    if (this.hotspotTimeout) clearTimeout(this.hotspotTimeout);
    this.hotspotTimeout = setTimeout(() => {
      this.showHotspots.set(false);
    }, 700);
  }

  restartPrototype() {
    this.animationState.set('fade-in');
    this.state.startPrototype();
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

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.state.isPrototypePlaying()) return;

    if (event.key === 'Escape') {
      this.state.stopPrototype();
    }
    if (event.key.toLowerCase() === 'r') {
      this.restartPrototype();
    }
  }
}
