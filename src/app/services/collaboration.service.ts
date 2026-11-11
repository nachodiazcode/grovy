import { Injectable, computed, inject, signal } from '@angular/core';
import { Collaborator, CollabMessage, FigmaElement, Point } from '../models/figma.models';

const COLLAB_COLORS = [
  '#ff007a', // Hot Pink
  '#00e5ff', // Cyan
  '#ffb800', // Yellow
  '#7928ca', // Purple
  '#00df8f', // Green
  '#ff4d4d', // Red
  '#f59e0b', // Amber
];

const BOT_PEERS: Collaborator[] = [
  {
    id: 'bot-sofia',
    name: 'Sofía (UI Lead)',
    color: '#ff007a',
    cursor: { x: 380, y: 220 },
    selectedIds: ['text-title'],
    lastActive: Date.now(),
    isSimulated: true,
  },
  {
    id: 'bot-mateo',
    name: 'Mateo (Dev)',
    color: '#00df8f',
    cursor: { x: 580, y: 340 },
    selectedIds: ['avatar-circle'],
    lastActive: Date.now(),
    isSimulated: true,
  },
];

@Injectable({
  providedIn: 'root',
})
export class CollaborationService {
  // Current user info
  readonly currentUser = signal<Collaborator>({
    id: this.getOrCreateUserId(),
    name: this.getSavedUserName() || 'Tú (Diseñador)',
    color: this.getRandomColor(),
    lastActive: Date.now(),
  });

  // Active room ID
  readonly roomId = signal<string>('general-workspace');

  // Real connected peers from BroadcastChannel
  readonly remotePeers = signal<Map<string, Collaborator>>(new Map());

  // Simulated peers for demo / testing
  readonly simulatedPeersEnabled = signal<boolean>(true);
  readonly simulatedPeers = signal<Collaborator[]>(BOT_PEERS);

  // Computed all active collaborators
  readonly activeCollaborators = computed<Collaborator[]>(() => {
    const list: Collaborator[] = [this.currentUser()];

    // Add real peers
    this.remotePeers().forEach((peer) => {
      // Filter out stale peers (no heartbeat in 10s)
      if (Date.now() - peer.lastActive < 10000) {
        list.push(peer);
      }
    });

    // Add simulated peers if enabled
    if (this.simulatedPeersEnabled()) {
      list.push(...this.simulatedPeers());
    }

    return list;
  });

  // Other collaborators (excluding current user) for rendering cursors on canvas
  readonly otherCollaborators = computed<Collaborator[]>(() => {
    const myId = this.currentUser().id;
    return this.activeCollaborators().filter((c) => c.id !== myId);
  });

  private channel: BroadcastChannel | null = null;
  private botInterval: any = null;

  // External sync callback
  onElementsReceived?: (elements: FigmaElement[]) => void;

  constructor() {
    this.initBroadcastChannel();
    this.startSimulatedBotMovement();
  }

  setUserName(newName: string) {
    const trimmed = newName.trim();
    if (!trimmed) return;
    this.currentUser.update((u) => ({ ...u, name: trimmed }));
    localStorage.setItem('grovy_user_name', trimmed);
    this.broadcastPresence();
  }

  setUserColor(color: string) {
    this.currentUser.update((u) => ({ ...u, color }));
    localStorage.setItem('grovy_user_color', color);
    this.broadcastPresence();
  }

  setRoomId(roomId: string) {
    this.roomId.set(roomId);
    this.initBroadcastChannel();
  }

  toggleSimulatedPeers(enable?: boolean) {
    const nextVal = enable !== undefined ? enable : !this.simulatedPeersEnabled();
    this.simulatedPeersEnabled.set(nextVal);
  }

  // Broadcast cursor position in canvas coords
  broadcastCursor(canvasPt: Point) {
    this.currentUser.update((u) => ({ ...u, cursor: canvasPt, lastActive: Date.now() }));
    this.postMessage({
      type: 'CURSOR_MOVE',
      sender: this.currentUser(),
      payload: canvasPt,
    });
  }

  // Broadcast selection change
  broadcastSelection(selectedIds: string[]) {
    this.currentUser.update((u) => ({ ...u, selectedIds, lastActive: Date.now() }));
    this.postMessage({
      type: 'SELECTION_CHANGE',
      sender: this.currentUser(),
      payload: selectedIds,
    });
  }

  // Broadcast elements update
  broadcastElements(elements: FigmaElement[]) {
    this.postMessage({
      type: 'ELEMENTS_SYNC',
      sender: this.currentUser(),
      payload: elements,
    });
  }

  private initBroadcastChannel() {
    if (this.channel) {
      this.channel.close();
    }

    try {
      this.channel = new BroadcastChannel(`grovy_room_${this.roomId()}`);
      this.channel.onmessage = (event: MessageEvent<CollabMessage>) => {
        this.handleMessage(event.data);
      };

      // Announce presence
      this.broadcastPresence();

      // Periodic presence heartbeat
      setInterval(() => {
        this.broadcastPresence();
      }, 3000);
    } catch (e) {
      console.warn('BroadcastChannel not supported in this environment', e);
    }
  }

  private broadcastPresence() {
    this.postMessage({
      type: 'USER_PRESENCE',
      sender: this.currentUser(),
    });
  }

  private postMessage(msg: CollabMessage) {
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (e) {
        // ignore detached buffer or serialization errors
      }
    }
  }

  private handleMessage(msg: CollabMessage) {
    if (!msg || !msg.sender || msg.sender.id === this.currentUser().id) return;

    const sender = msg.sender;

    this.remotePeers.update((map) => {
      const copy = new Map(map);
      const existing = copy.get(sender.id) || { ...sender };

      switch (msg.type) {
        case 'CURSOR_MOVE':
          existing.cursor = msg.payload;
          break;
        case 'SELECTION_CHANGE':
          existing.selectedIds = msg.payload;
          break;
        case 'ELEMENTS_SYNC':
          if (this.onElementsReceived && Array.isArray(msg.payload)) {
            this.onElementsReceived(msg.payload);
          }
          break;
        case 'USER_PRESENCE':
          existing.name = sender.name;
          existing.color = sender.color;
          break;
        case 'USER_LEAVE':
          copy.delete(sender.id);
          return copy;
      }

      existing.lastActive = Date.now();
      copy.set(sender.id, existing);
      return copy;
    });
  }

  // Animated bot movement for live demonstration
  private startSimulatedBotMovement() {
    let t = 0;
    this.botInterval = setInterval(() => {
      if (!this.simulatedPeersEnabled()) return;

      t += 0.05;
      this.simulatedPeers.update((peers) =>
        peers.map((peer, idx) => {
          const radius = idx === 0 ? 80 : 120;
          const baseX = idx === 0 ? 400 : 540;
          const baseY = idx === 0 ? 240 : 320;
          const speed = idx === 0 ? 1 : 0.7;

          return {
            ...peer,
            cursor: {
              x: Math.round(baseX + Math.cos(t * speed) * radius),
              y: Math.round(baseY + Math.sin(t * speed * 1.5) * (radius * 0.6)),
            },
            lastActive: Date.now(),
          };
        })
      );
    }, 100);
  }

  private getOrCreateUserId(): string {
    let id = localStorage.getItem('grovy_user_id');
    if (!id) {
      id = 'user_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('grovy_user_id', id);
    }
    return id;
  }

  private getSavedUserName(): string | null {
    return localStorage.getItem('grovy_user_name');
  }

  private getRandomColor(): string {
    const saved = localStorage.getItem('grovy_user_color');
    if (saved) return saved;
    const color = COLLAB_COLORS[Math.floor(Math.random() * COLLAB_COLORS.length)];
    localStorage.setItem('grovy_user_color', color);
    return color;
  }
}
