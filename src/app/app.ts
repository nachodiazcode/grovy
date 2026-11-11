import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderToolbarComponent } from './components/header-toolbar/header-toolbar.component';
import { LayersPanelComponent } from './components/layers-panel/layers-panel.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { InspectorPanelComponent } from './components/inspector-panel/inspector-panel.component';
import { PrototypePlayerComponent } from './components/prototype-player/prototype-player.component';

@Component({
  selector: 'app-root',
  imports: [
    HeaderToolbarComponent,
    LayersPanelComponent,
    CanvasComponent,
    InspectorPanelComponent,
    PrototypePlayerComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
