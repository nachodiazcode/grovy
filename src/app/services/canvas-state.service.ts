import { Injectable, computed, inject, signal } from '@angular/core';
import {
  BoundingBox,
  ComponentPreset,
  EditorMode,
  FigmaElement,
  Point,
  PrototypeInteraction,
  ShapeType,
  ToolType,
} from '../models/figma.models';
import { CollaborationService } from './collaboration.service';

const INITIAL_ELEMENTS: FigmaElement[] = [
  // ==========================================
  // SCREEN 1: LANDING PAGE (Hero Web App)
  // ==========================================
  {
    id: 'frame-hero-1',
    name: 'Frame - Hero Web App',
    type: 'frame',
    x: 80,
    y: 60,
    width: 720,
    height: 460,
    rotation: 0,
    fill: '#0c0e14',
    fillOpacity: 1,
    stroke: '#1c202e',
    strokeWidth: 1.5,
    cornerRadius: 18,
    opacity: 1,
    shadowBlur: 32,
    shadowColor: '#00000088',
    shadowOffsetX: 0,
    shadowOffsetY: 12,
    locked: false,
    visible: true,
    isInitialFrame: true,
  },
  // Navbar elements
  {
    id: 'nav-logo',
    name: 'Logo Icon',
    type: 'circle',
    x: 104,
    y: 84,
    width: 20,
    height: 20,
    rotation: 0,
    fill: '#0d99ff',
    fillOpacity: 1,
    stroke: '#38bdf8',
    strokeWidth: 1.5,
    cornerRadius: 10,
    opacity: 1,
    shadowBlur: 8,
    shadowColor: '#0d99ff55',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  {
    id: 'nav-title',
    name: 'Brand Title',
    type: 'text',
    x: 132,
    y: 100,
    width: 100,
    height: 20,
    rotation: 0,
    fill: '#ffffff',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Grovy Studio',
    fontSize: 13,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '700',
  },
  {
    id: 'nav-link-1',
    name: 'Nav Link 1',
    type: 'text',
    x: 270,
    y: 100,
    width: 60,
    height: 20,
    rotation: 0,
    fill: '#94a3b8',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Productos',
    fontSize: 12,
    fontWeight: '500',
  },
  {
    id: 'nav-link-2',
    name: 'Nav Link 2',
    type: 'text',
    x: 350,
    y: 100,
    width: 80,
    height: 20,
    rotation: 0,
    fill: '#94a3b8',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Componentes',
    fontSize: 12,
    fontWeight: '500',
  },
  {
    id: 'nav-link-3',
    name: 'Nav Link 3',
    type: 'text',
    x: 450,
    y: 100,
    width: 50,
    height: 20,
    rotation: 0,
    fill: '#94a3b8',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Precios',
    fontSize: 12,
    fontWeight: '500',
  },
  {
    id: 'nav-btn-account',
    name: 'Nav CTA Button',
    type: 'rect',
    x: 670,
    y: 80,
    width: 105,
    height: 30,
    rotation: 0,
    fill: '#1e2230',
    fillOpacity: 1,
    stroke: '#2e354a',
    strokeWidth: 1,
    cornerRadius: 6,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  {
    id: 'nav-btn-txt',
    name: 'Nav CTA Label',
    type: 'text',
    x: 694,
    y: 99,
    width: 60,
    height: 16,
    rotation: 0,
    fill: '#e2e8f0',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Comenzar',
    fontSize: 11,
    fontWeight: '600',
  },
  {
    id: 'nav-divider',
    name: 'Nav Border Line',
    type: 'line',
    x: 80,
    y: 125,
    width: 720,
    height: 0,
    rotation: 0,
    fill: '#1c202e',
    fillOpacity: 1,
    stroke: '#1c202e',
    strokeWidth: 1,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },

  // Hero Left Column
  {
    id: 'badge-hero',
    name: 'Hero Pill Badge',
    type: 'rect',
    x: 108,
    y: 155,
    width: 200,
    height: 26,
    rotation: 0,
    fill: '#0284c7',
    fillOpacity: 0.15,
    stroke: '#0284c7',
    strokeWidth: 1,
    cornerRadius: 13,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  {
    id: 'badge-hero-txt',
    name: 'Hero Badge Text',
    type: 'text',
    x: 122,
    y: 172,
    width: 180,
    height: 16,
    rotation: 0,
    fill: '#38bdf8',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: '✨ SISTEMA DE DISEÑO VECTORIAL',
    fontSize: 9.5,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '700',
  },
  {
    id: 'hero-title',
    name: 'Hero Headline',
    type: 'text',
    x: 108,
    y: 220,
    width: 320,
    height: 52,
    rotation: 0,
    fill: '#ffffff',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Diseña interfaces de software de nivel superior',
    fontSize: 21,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '700',
  },
  {
    id: 'hero-desc',
    name: 'Hero Subhead',
    type: 'text',
    x: 108,
    y: 265,
    width: 310,
    height: 38,
    rotation: 0,
    fill: '#94a3b8',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Crea componentes atómicos, organiza tokens globales y colabora en tiempo real con tu equipo.',
    fontSize: 12,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '400',
  },
  // Primary CTA Button (Interactive Link to Screen 2)
  {
    id: 'hero-cta-btn',
    name: 'Botón: Ver Dashboard en Vivo (Link)',
    type: 'rect',
    x: 108,
    y: 325,
    width: 185,
    height: 44,
    rotation: 0,
    fill: '#0d99ff',
    fillOpacity: 1,
    stroke: '#38bdf8',
    strokeWidth: 1,
    cornerRadius: 10,
    opacity: 1,
    shadowBlur: 16,
    shadowColor: '#0d99ff44',
    shadowOffsetX: 0,
    shadowOffsetY: 4,
    locked: false,
    visible: true,
    interaction: {
      trigger: 'click',
      action: 'navigate',
      targetFrameId: 'frame-dashboard-2',
      animation: 'slide-left',
    },
  },
  {
    id: 'hero-cta-txt',
    name: 'Hero CTA Label',
    type: 'text',
    x: 128,
    y: 352,
    width: 150,
    height: 20,
    rotation: 0,
    fill: '#ffffff',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: '▶ Ver Dashboard en Vivo',
    fontSize: 12.5,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '600',
  },
  {
    id: 'hero-secondary-btn',
    name: 'Secondary Button',
    type: 'rect',
    x: 304,
    y: 325,
    width: 110,
    height: 44,
    rotation: 0,
    fill: '#161922',
    fillOpacity: 1,
    stroke: '#272d3f',
    strokeWidth: 1,
    cornerRadius: 10,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  {
    id: 'hero-secondary-txt',
    name: 'Secondary Label',
    type: 'text',
    x: 328,
    y: 352,
    width: 70,
    height: 20,
    rotation: 0,
    fill: '#cbd5e1',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Docs ↗',
    fontSize: 12.5,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '500',
  },
  // Social Proof Avatars
  {
    id: 'av-1',
    name: 'Avatar 1',
    type: 'circle',
    x: 108,
    y: 395,
    width: 26,
    height: 26,
    rotation: 0,
    fill: '#ec4899',
    fillOpacity: 1,
    stroke: '#0c0e14',
    strokeWidth: 2,
    cornerRadius: 13,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  {
    id: 'av-2',
    name: 'Avatar 2',
    type: 'circle',
    x: 125,
    y: 395,
    width: 26,
    height: 26,
    rotation: 0,
    fill: '#8b5cf6',
    fillOpacity: 1,
    stroke: '#0c0e14',
    strokeWidth: 2,
    cornerRadius: 13,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  {
    id: 'av-3',
    name: 'Avatar 3',
    type: 'circle',
    x: 142,
    y: 395,
    width: 26,
    height: 26,
    rotation: 0,
    fill: '#06b6d4',
    fillOpacity: 1,
    stroke: '#0c0e14',
    strokeWidth: 2,
    cornerRadius: 13,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  {
    id: 'av-caption',
    name: 'Social Proof Text',
    type: 'text',
    x: 178,
    y: 412,
    width: 200,
    height: 16,
    rotation: 0,
    fill: '#94a3b8',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: '+14,200 diseñadores activos',
    fontSize: 11,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '500',
  },

  // Hero Right Column: Floating Glassmorphic Analytics Card
  {
    id: 'card-glass-bg',
    name: 'Analytics Card Glass',
    type: 'rect',
    x: 445,
    y: 155,
    width: 325,
    height: 268,
    rotation: 0,
    fill: '#131620',
    fillOpacity: 0.95,
    stroke: '#242b3d',
    strokeWidth: 1.5,
    cornerRadius: 16,
    opacity: 1,
    shadowBlur: 24,
    shadowColor: '#00000088',
    shadowOffsetX: 0,
    shadowOffsetY: 8,
    locked: false,
    visible: true,
  },
  {
    id: 'card-glass-header',
    name: 'Card Title',
    type: 'text',
    x: 468,
    y: 185,
    width: 140,
    height: 20,
    rotation: 0,
    fill: '#ffffff',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Rendimiento de Tokens',
    fontSize: 13,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '700',
  },
  {
    id: 'card-live-dot',
    name: 'Live Indicator Dot',
    type: 'circle',
    x: 718,
    y: 176,
    width: 6,
    height: 6,
    rotation: 0,
    fill: '#10b981',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 3,
    opacity: 1,
    shadowBlur: 6,
    shadowColor: '#10b981aa',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  {
    id: 'card-live-txt',
    name: 'Live Text',
    type: 'text',
    x: 728,
    y: 184,
    width: 30,
    height: 12,
    rotation: 0,
    fill: '#10b981',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'LIVE',
    fontSize: 9,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '700',
  },
  {
    id: 'card-metric-value',
    name: 'Metric Big Number',
    type: 'text',
    x: 468,
    y: 226,
    width: 160,
    height: 34,
    rotation: 0,
    fill: '#38bdf8',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: '$128,450',
    fontSize: 26,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '700',
  },
  {
    id: 'card-metric-sub',
    name: 'Metric Subtext',
    type: 'text',
    x: 468,
    y: 247,
    width: 200,
    height: 16,
    rotation: 0,
    fill: '#94a3b8',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Valor generado este mes (+32.4%)',
    fontSize: 11,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '400',
  },
  // Sparkline Bars
  {
    id: 'bar-1',
    name: 'Chart Bar 1',
    type: 'rect',
    x: 468,
    y: 310,
    width: 32,
    height: 35,
    rotation: 0,
    fill: '#1e293b',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 4,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  {
    id: 'bar-2',
    name: 'Chart Bar 2',
    type: 'rect',
    x: 512,
    y: 290,
    width: 32,
    height: 55,
    rotation: 0,
    fill: '#1e293b',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 4,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  {
    id: 'bar-3',
    name: 'Chart Bar 3',
    type: 'rect',
    x: 556,
    y: 275,
    width: 32,
    height: 70,
    rotation: 0,
    fill: '#0284c7',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 4,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  {
    id: 'bar-4',
    name: 'Chart Bar 4',
    type: 'rect',
    x: 600,
    y: 260,
    width: 32,
    height: 85,
    rotation: 0,
    fill: '#0369a1',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 4,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  {
    id: 'bar-5',
    name: 'Chart Bar 5',
    type: 'rect',
    x: 644,
    y: 240,
    width: 32,
    height: 105,
    rotation: 0,
    fill: '#0ea5e9',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 4,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  {
    id: 'bar-6',
    name: 'Chart Bar 6',
    type: 'rect',
    x: 688,
    y: 220,
    width: 32,
    height: 125,
    rotation: 0,
    fill: '#38bdf8',
    fillOpacity: 1,
    stroke: '#7dd3fc',
    strokeWidth: 1,
    cornerRadius: 4,
    opacity: 1,
    shadowBlur: 10,
    shadowColor: '#38bdf844',
    shadowOffsetX: 0,
    shadowOffsetY: 2,
    locked: false,
    visible: true,
  },
  {
    id: 'chart-baseline',
    name: 'Chart Baseline',
    type: 'line',
    x: 468,
    y: 345,
    width: 252,
    height: 0,
    rotation: 0,
    fill: '#242b3d',
    fillOpacity: 1,
    stroke: '#242b3d',
    strokeWidth: 1,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  // Bottom Card Status Pill
  {
    id: 'card-status-pill',
    name: 'Card Status Container',
    type: 'rect',
    x: 468,
    y: 368,
    width: 252,
    height: 32,
    rotation: 0,
    fill: '#10b981',
    fillOpacity: 0.12,
    stroke: '#10b981',
    strokeWidth: 1,
    cornerRadius: 8,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  {
    id: 'card-status-txt',
    name: 'Card Status Text',
    type: 'text',
    x: 486,
    y: 388,
    width: 220,
    height: 16,
    rotation: 0,
    fill: '#34d399',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: '✓ 100% componentes sincronizados',
    fontSize: 11,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '600',
  },

  // ==========================================
  // SCREEN 2: DASHBOARD CONTROL (Connected Target)
  // ==========================================
  {
    id: 'frame-dashboard-2',
    name: 'Frame - Centro de Control (Detalle)',
    type: 'frame',
    x: 840,
    y: 60,
    width: 640,
    height: 460,
    rotation: 0,
    fill: '#0b0d13',
    fillOpacity: 1,
    stroke: '#1c202e',
    strokeWidth: 1.5,
    cornerRadius: 18,
    opacity: 1,
    shadowBlur: 32,
    shadowColor: '#00000088',
    shadowOffsetX: 0,
    shadowOffsetY: 12,
    locked: false,
    visible: true,
  },
  // Dashboard Header
  {
    id: 'dash-title',
    name: 'Dashboard Header Title',
    type: 'text',
    x: 868,
    y: 98,
    width: 260,
    height: 26,
    rotation: 0,
    fill: '#ffffff',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Centro de Control · Analytics',
    fontSize: 17,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '700',
  },
  {
    id: 'dash-sub',
    name: 'Dashboard Subtitle',
    type: 'text',
    x: 868,
    y: 120,
    width: 280,
    height: 18,
    rotation: 0,
    fill: '#94a3b8',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Pantalla de destino del prototipo interactivo',
    fontSize: 11,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '400',
  },
  // Back Button (Link to Screen 1)
  {
    id: 'btn-back',
    name: 'Botón: Volver a Landing (Link)',
    type: 'rect',
    x: 1315,
    y: 85,
    width: 140,
    height: 36,
    rotation: 0,
    fill: '#161922',
    fillOpacity: 1,
    stroke: '#272d3f',
    strokeWidth: 1,
    cornerRadius: 8,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    interaction: {
      trigger: 'click',
      action: 'navigate',
      targetFrameId: 'frame-hero-1',
      animation: 'slide-right',
    },
  },
  {
    id: 'btn-back-txt',
    name: 'Back Button Label',
    type: 'text',
    x: 1332,
    y: 107,
    width: 110,
    height: 16,
    rotation: 0,
    fill: '#ffffff',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: '⬅ Volver a Landing',
    fontSize: 11.5,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '600',
  },
  {
    id: 'dash-divider',
    name: 'Dashboard Line',
    type: 'line',
    x: 840,
    y: 145,
    width: 640,
    height: 0,
    rotation: 0,
    fill: '#1c202e',
    fillOpacity: 1,
    stroke: '#1c202e',
    strokeWidth: 1,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },

  // KPI Row
  {
    id: 'kpi-card-1',
    name: 'KPI Card 1',
    type: 'rect',
    x: 868,
    y: 165,
    width: 280,
    height: 95,
    rotation: 0,
    fill: '#12151e',
    fillOpacity: 1,
    stroke: '#222838',
    strokeWidth: 1,
    cornerRadius: 12,
    opacity: 1,
    shadowBlur: 10,
    shadowColor: '#00000033',
    shadowOffsetX: 0,
    shadowOffsetY: 2,
    locked: false,
    visible: true,
  },
  {
    id: 'kpi-1-label',
    name: 'KPI 1 Title',
    type: 'text',
    x: 888,
    y: 195,
    width: 180,
    height: 16,
    rotation: 0,
    fill: '#94a3b8',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Componentes Sincronizados',
    fontSize: 12,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '500',
  },
  {
    id: 'kpi-1-val',
    name: 'KPI 1 Big Number',
    type: 'text',
    x: 888,
    y: 232,
    width: 100,
    height: 30,
    rotation: 0,
    fill: '#ffffff',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: '482',
    fontSize: 26,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '700',
  },
  {
    id: 'kpi-1-pill',
    name: 'KPI 1 Growth Pill',
    type: 'rect',
    x: 990,
    y: 215,
    width: 75,
    height: 20,
    rotation: 0,
    fill: '#10b981',
    fillOpacity: 0.15,
    stroke: '#10b981',
    strokeWidth: 1,
    cornerRadius: 10,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  {
    id: 'kpi-1-pill-txt',
    name: 'KPI 1 Growth Text',
    type: 'text',
    x: 1000,
    y: 229,
    width: 60,
    height: 14,
    rotation: 0,
    fill: '#34d399',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: '+18.4% hoy',
    fontSize: 9.5,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '600',
  },

  {
    id: 'kpi-card-2',
    name: 'KPI Card 2',
    type: 'rect',
    x: 1170,
    y: 165,
    width: 285,
    height: 95,
    rotation: 0,
    fill: '#12151e',
    fillOpacity: 1,
    stroke: '#222838',
    strokeWidth: 1,
    cornerRadius: 12,
    opacity: 1,
    shadowBlur: 10,
    shadowColor: '#00000033',
    shadowOffsetX: 0,
    shadowOffsetY: 2,
    locked: false,
    visible: true,
  },
  {
    id: 'kpi-2-label',
    name: 'KPI 2 Title',
    type: 'text',
    x: 1190,
    y: 195,
    width: 180,
    height: 16,
    rotation: 0,
    fill: '#94a3b8',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Tiempo de Compilación',
    fontSize: 12,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '500',
  },
  {
    id: 'kpi-2-val',
    name: 'KPI 2 Big Number',
    type: 'text',
    x: 1190,
    y: 232,
    width: 100,
    height: 30,
    rotation: 0,
    fill: '#38bdf8',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: '0.34s',
    fontSize: 26,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '700',
  },
  {
    id: 'kpi-2-pill',
    name: 'KPI 2 Fast Pill',
    type: 'rect',
    x: 1290,
    y: 215,
    width: 85,
    height: 20,
    rotation: 0,
    fill: '#38bdf8',
    fillOpacity: 0.15,
    stroke: '#38bdf8',
    strokeWidth: 1,
    cornerRadius: 10,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  {
    id: 'kpi-2-pill-txt',
    name: 'KPI 2 Fast Text',
    type: 'text',
    x: 1300,
    y: 229,
    width: 70,
    height: 14,
    rotation: 0,
    fill: '#38bdf8',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Ultrarrápido',
    fontSize: 9.5,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '600',
  },

  // Component Activity Table
  {
    id: 'table-title',
    name: 'Table Section Title',
    type: 'text',
    x: 868,
    y: 295,
    width: 250,
    height: 20,
    rotation: 0,
    fill: '#ffffff',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Actividad de Componentes Recientes',
    fontSize: 13,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '600',
  },
  // Row 1
  {
    id: 'row-1-bg',
    name: 'Table Row 1',
    type: 'rect',
    x: 868,
    y: 312,
    width: 587,
    height: 42,
    rotation: 0,
    fill: '#12151e',
    fillOpacity: 1,
    stroke: '#1c202e',
    strokeWidth: 1,
    cornerRadius: 8,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  {
    id: 'row-1-icon',
    name: 'Row 1 Dot',
    type: 'circle',
    x: 884,
    y: 325,
    width: 16,
    height: 16,
    rotation: 0,
    fill: '#0d99ff',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 8,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  {
    id: 'row-1-name',
    name: 'Row 1 Name',
    type: 'text',
    x: 912,
    y: 338,
    width: 180,
    height: 18,
    rotation: 0,
    fill: '#ffffff',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Navbar / Header Responsive',
    fontSize: 12,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '600',
  },
  {
    id: 'row-1-cat',
    name: 'Row 1 Category',
    type: 'text',
    x: 1150,
    y: 338,
    width: 80,
    height: 18,
    rotation: 0,
    fill: '#94a3b8',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Navigation',
    fontSize: 11,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '400',
  },
  {
    id: 'row-1-badge',
    name: 'Row 1 Badge',
    type: 'rect',
    x: 1345,
    y: 323,
    width: 85,
    height: 20,
    rotation: 0,
    fill: '#10b981',
    fillOpacity: 0.15,
    stroke: '#10b981',
    strokeWidth: 1,
    cornerRadius: 10,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  {
    id: 'row-1-badge-txt',
    name: 'Row 1 Badge Text',
    type: 'text',
    x: 1358,
    y: 337,
    width: 65,
    height: 14,
    rotation: 0,
    fill: '#34d399',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Publicado',
    fontSize: 10,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '600',
  },

  // Row 2
  {
    id: 'row-2-bg',
    name: 'Table Row 2',
    type: 'rect',
    x: 868,
    y: 362,
    width: 587,
    height: 42,
    rotation: 0,
    fill: '#12151e',
    fillOpacity: 1,
    stroke: '#1c202e',
    strokeWidth: 1,
    cornerRadius: 8,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  {
    id: 'row-2-icon',
    name: 'Row 2 Dot',
    type: 'circle',
    x: 884,
    y: 375,
    width: 16,
    height: 16,
    rotation: 0,
    fill: '#8b5cf6',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 8,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  {
    id: 'row-2-name',
    name: 'Row 2 Name',
    type: 'text',
    x: 912,
    y: 388,
    width: 180,
    height: 18,
    rotation: 0,
    fill: '#ffffff',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Button / Glow Variant',
    fontSize: 12,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '600',
  },
  {
    id: 'row-2-cat',
    name: 'Row 2 Category',
    type: 'text',
    x: 1150,
    y: 388,
    width: 80,
    height: 18,
    rotation: 0,
    fill: '#94a3b8',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Buttons',
    fontSize: 11,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '400',
  },
  {
    id: 'row-2-badge',
    name: 'Row 2 Badge',
    type: 'rect',
    x: 1345,
    y: 373,
    width: 85,
    height: 20,
    rotation: 0,
    fill: '#f59e0b',
    fillOpacity: 0.15,
    stroke: '#f59e0b',
    strokeWidth: 1,
    cornerRadius: 10,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  {
    id: 'row-2-badge-txt',
    name: 'Row 2 Badge Text',
    type: 'text',
    x: 1353,
    y: 387,
    width: 70,
    height: 14,
    rotation: 0,
    fill: '#fbbf24',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'En Revisión',
    fontSize: 10,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '600',
  },

  // Row 3
  {
    id: 'row-3-bg',
    name: 'Table Row 3',
    type: 'rect',
    x: 868,
    y: 412,
    width: 587,
    height: 42,
    rotation: 0,
    fill: '#12151e',
    fillOpacity: 1,
    stroke: '#1c202e',
    strokeWidth: 1,
    cornerRadius: 8,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  {
    id: 'row-3-icon',
    name: 'Row 3 Dot',
    type: 'circle',
    x: 884,
    y: 425,
    width: 16,
    height: 16,
    rotation: 0,
    fill: '#06b6d4',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 8,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  {
    id: 'row-3-name',
    name: 'Row 3 Name',
    type: 'text',
    x: 912,
    y: 438,
    width: 180,
    height: 18,
    rotation: 0,
    fill: '#ffffff',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Dialog / Modal Confirm',
    fontSize: 12,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '600',
  },
  {
    id: 'row-3-cat',
    name: 'Row 3 Category',
    type: 'text',
    x: 1150,
    y: 438,
    width: 80,
    height: 18,
    rotation: 0,
    fill: '#94a3b8',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Feedback',
    fontSize: 11,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '400',
  },
  {
    id: 'row-3-badge',
    name: 'Row 3 Badge',
    type: 'rect',
    x: 1345,
    y: 423,
    width: 85,
    height: 20,
    rotation: 0,
    fill: '#0284c7',
    fillOpacity: 0.15,
    stroke: '#0284c7',
    strokeWidth: 1,
    cornerRadius: 10,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
  },
  {
    id: 'row-3-badge-txt',
    name: 'Row 3 Badge Text',
    type: 'text',
    x: 1358,
    y: 437,
    width: 65,
    height: 14,
    rotation: 0,
    fill: '#38bdf8',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    opacity: 1,
    shadowBlur: 0,
    shadowColor: '#00000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    locked: false,
    visible: true,
    content: 'Aprobado',
    fontSize: 10,
    fontFamily: 'Inter, sans-serif',
    fontWeight: '600',
  },
];

@Injectable({
  providedIn: 'root',
})
export class CanvasStateService {
  private readonly collab = inject(CollaborationService);

  // Elements state
  readonly elements = signal<FigmaElement[]>(INITIAL_ELEMENTS);

  // Selection state
  readonly selectedIds = signal<string[]>(['frame-hero-1']);

  // Active Tool & Mode
  readonly activeTool = signal<ToolType>('select');
  readonly editorMode = signal<EditorMode>('design');

  // Prototype Presentation Player state
  readonly isPrototypePlaying = signal<boolean>(false);
  readonly currentPrototypeFrameId = signal<string | null>(null);

  // Canvas Viewport Transformation
  readonly zoom = signal<number>(0.9);
  readonly pan = signal<Point>({ x: 50, y: 30 });

  // History for Undo / Redo
  private readonly history = signal<FigmaElement[][]>([INITIAL_ELEMENTS]);
  private readonly historyIndex = signal<number>(0);

  // Computed signals
  readonly selectedElements = computed(() => {
    const ids = new Set(this.selectedIds());
    return this.elements().filter((el) => ids.has(el.id));
  });

  readonly primarySelectedElement = computed(() => {
    const list = this.selectedElements();
    return list.length > 0 ? list[0] : null;
  });

  readonly allFrames = computed(() => {
    return this.elements().filter((el) => el.type === 'frame');
  });

  readonly elementsWithInteractions = computed(() => {
    return this.elements().filter((el) => el.interaction && el.interaction.targetFrameId);
  });

  readonly canUndo = computed(() => this.historyIndex() > 0);
  readonly canRedo = computed(() => this.historyIndex() < this.history().length - 1);

  readonly selectionBoundingBox = computed<BoundingBox | null>(() => {
    const selected = this.selectedElements();
    if (selected.length === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const el of selected) {
      if (el.x < minX) minX = el.x;
      if (el.y < minY) minY = el.y;
      if (el.x + el.width > maxX) maxX = el.x + el.width;
      if (el.y + el.height > maxY) maxY = el.y + el.height;
    }

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    };
  });

  constructor() {
    this.collab.onElementsReceived = (newElements) => {
      this.elements.set(newElements);
    };
  }

  setEditorMode(mode: EditorMode) {
    this.editorMode.set(mode);
  }

  recordSnapshot() {
    const current = JSON.parse(JSON.stringify(this.elements()));
    const currentIndex = this.historyIndex();
    const newHistory = this.history().slice(0, currentIndex + 1);
    newHistory.push(current);

    if (newHistory.length > 50) {
      newHistory.shift();
    }

    this.history.set(newHistory);
    this.historyIndex.set(newHistory.length - 1);
    this.collab.broadcastElements(this.elements());
  }

  undo() {
    if (!this.canUndo()) return;
    const newIndex = this.historyIndex() - 1;
    this.historyIndex.set(newIndex);
    this.elements.set(JSON.parse(JSON.stringify(this.history()[newIndex])));
    this.collab.broadcastElements(this.elements());
  }

  redo() {
    if (!this.canRedo()) return;
    const newIndex = this.historyIndex() + 1;
    this.historyIndex.set(newIndex);
    this.elements.set(JSON.parse(JSON.stringify(this.history()[newIndex])));
    this.collab.broadcastElements(this.elements());
  }

  setTool(tool: ToolType) {
    this.activeTool.set(tool);
    if (tool !== 'select') {
      this.selectedIds.set([]);
    }
  }

  select(id: string, multiSelect = false) {
    if (multiSelect) {
      const current = this.selectedIds();
      if (current.includes(id)) {
        this.selectedIds.set(current.filter((item) => item !== id));
      } else {
        this.selectedIds.set([...current, id]);
      }
    } else {
      this.selectedIds.set([id]);
    }
    this.activeTool.set('select');
    this.collab.broadcastSelection(this.selectedIds());
  }

  selectAll() {
    this.selectedIds.set(this.elements().map((el) => el.id));
    this.activeTool.set('select');
    this.collab.broadcastSelection(this.selectedIds());
  }

  clearSelection() {
    this.selectedIds.set([]);
    this.collab.broadcastSelection([]);
  }

  addElement(element: FigmaElement) {
    this.elements.update((prev) => [...prev, element]);
    this.selectedIds.set([element.id]);
    this.setTool('select');
    this.recordSnapshot();
  }

  addMultipleElements(newElements: FigmaElement[]) {
    this.elements.update((prev) => [...prev, ...newElements]);
    this.selectedIds.set(newElements.map((el) => el.id));
    this.setTool('select');
    this.recordSnapshot();
  }

  updateElement(id: string, updates: Partial<FigmaElement>, recordHistory = true) {
    this.elements.update((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
    if (recordHistory) {
      this.recordSnapshot();
    }
  }

  updateMultiple(updatesMap: Map<string, Partial<FigmaElement>>, recordHistory = true) {
    this.elements.update((prev) =>
      prev.map((el) => {
        const update = updatesMap.get(el.id);
        return update ? { ...el, ...update } : el;
      })
    );
    if (recordHistory) {
      this.recordSnapshot();
    }
  }

  setElementInteraction(id: string, interaction?: PrototypeInteraction) {
    this.updateElement(id, { interaction }, true);
  }

  deleteSelected() {
    const selected = new Set(this.selectedIds());
    if (selected.size === 0) return;

    this.elements.update((prev) => prev.filter((el) => !selected.has(el.id)));
    this.selectedIds.set([]);
    this.recordSnapshot();
  }

  duplicateSelected() {
    const selected = this.selectedElements();
    if (selected.length === 0) return;

    const newElements: FigmaElement[] = [];
    const newSelectedIds: string[] = [];

    for (const el of selected) {
      const newId = `${el.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const duplicated: FigmaElement = {
        ...JSON.parse(JSON.stringify(el)),
        id: newId,
        name: `${el.name} (Copy)`,
        x: el.x + 24,
        y: el.y + 24,
      };
      newElements.push(duplicated);
      newSelectedIds.push(newId);
    }

    this.elements.update((prev) => [...prev, ...newElements]);
    this.selectedIds.set(newSelectedIds);
    this.recordSnapshot();
  }

  bringForward() {
    const id = this.selectedIds()[0];
    if (!id) return;
    const list = [...this.elements()];
    const index = list.findIndex((el) => el.id === id);
    if (index >= 0 && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
      this.elements.set(list);
      this.recordSnapshot();
    }
  }

  sendBackward() {
    const id = this.selectedIds()[0];
    if (!id) return;
    const list = [...this.elements()];
    const index = list.findIndex((el) => el.id === id);
    if (index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
      this.elements.set(list);
      this.recordSnapshot();
    }
  }

  bringToFront() {
    const id = this.selectedIds()[0];
    if (!id) return;
    const list = [...this.elements()];
    const index = list.findIndex((el) => el.id === id);
    if (index >= 0 && index < list.length - 1) {
      const [item] = list.splice(index, 1);
      list.push(item);
      this.elements.set(list);
      this.recordSnapshot();
    }
  }

  sendToBack() {
    const id = this.selectedIds()[0];
    if (!id) return;
    const list = [...this.elements()];
    const index = list.findIndex((el) => el.id === id);
    if (index > 0) {
      const [item] = list.splice(index, 1);
      list.unshift(item);
      this.elements.set(list);
      this.recordSnapshot();
    }
  }

  toggleLock(id: string) {
    this.elements.update((prev) =>
      prev.map((el) => (el.id === id ? { ...el, locked: !el.locked } : el))
    );
    this.recordSnapshot();
  }

  toggleVisibility(id: string) {
    this.elements.update((prev) =>
      prev.map((el) => (el.id === id ? { ...el, visible: !el.visible } : el))
    );
    this.recordSnapshot();
  }

  alignSelected(alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') {
    const selected = this.selectedElements();
    if (selected.length < 2) return;

    const bbox = this.selectionBoundingBox();
    if (!bbox) return;

    const updates = new Map<string, Partial<FigmaElement>>();

    for (const el of selected) {
      switch (alignment) {
        case 'left':
          updates.set(el.id, { x: bbox.minX });
          break;
        case 'center':
          updates.set(el.id, { x: bbox.minX + (bbox.width - el.width) / 2 });
          break;
        case 'right':
          updates.set(el.id, { x: bbox.maxX - el.width });
          break;
        case 'top':
          updates.set(el.id, { y: bbox.minY });
          break;
        case 'middle':
          updates.set(el.id, { y: bbox.minY + (bbox.height - el.height) / 2 });
          break;
        case 'bottom':
          updates.set(el.id, { y: bbox.maxY - el.height });
          break;
      }
    }

    this.updateMultiple(updates);
  }

  insertComponentPreset(preset: ComponentPreset) {
    const originX = Math.round(-this.pan().x / this.zoom() + 200);
    const originY = Math.round(-this.pan().y / this.zoom() + 150);

    const newElements: FigmaElement[] = preset.elements.map((el) => ({
      ...JSON.parse(JSON.stringify(el)),
      id: `${el.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      x: originX + el.x,
      y: originY + el.y,
    }));

    this.addMultipleElements(newElements);
  }

  startPrototype(startingFrameId?: string) {
    const target = startingFrameId || this.allFrames().find((f) => f.isInitialFrame)?.id || this.allFrames()[0]?.id;
    if (target) {
      this.currentPrototypeFrameId.set(target);
      this.isPrototypePlaying.set(true);
    } else {
      alert('Crea al menos un Frame (Marco) para previsualizar el prototipo.');
    }
  }

  stopPrototype() {
    this.isPrototypePlaying.set(false);
  }

  navigatePrototypeTo(frameId: string) {
    this.currentPrototypeFrameId.set(frameId);
  }

  setZoom(newZoom: number, originPoint?: Point) {
    const clampedZoom = Math.min(Math.max(newZoom, 0.1), 5.0);
    const oldZoom = this.zoom();

    if (originPoint) {
      const currentPan = this.pan();
      const newPanX = originPoint.x - (originPoint.x - currentPan.x) * (clampedZoom / oldZoom);
      const newPanY = originPoint.y - (originPoint.y - currentPan.y) * (clampedZoom / oldZoom);
      this.pan.set({ x: newPanX, y: newPanY });
    }

    this.zoom.set(clampedZoom);
  }

  zoomIn() {
    this.setZoom(this.zoom() * 1.25);
  }

  zoomOut() {
    this.setZoom(this.zoom() / 1.25);
  }

  resetZoom() {
    this.zoom.set(1);
    this.pan.set({ x: 80, y: 40 });
  }

  updatePan(dx: number, dy: number) {
    this.pan.update((p) => ({ x: p.x + dx, y: p.y + dy }));
  }

  exportToJson(): string {
    return JSON.stringify(
      {
        version: '2.0.0',
        generator: 'Grovy Studio',
        elements: this.elements(),
      },
      null,
      2
    );
  }

  importFromJson(jsonString: string) {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.elements)) {
        this.elements.set(parsed.elements);
        this.selectedIds.set([]);
        this.recordSnapshot();
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON project', e);
    }
    return false;
  }
}
