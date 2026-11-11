# Grovy - Clon de Figma con Angular 22

Un clon interactivo de Figma construido desde cero con la **última versión de Angular (v22)**, utilizando **Angular Signals**, **Componentes Standalone**, **Tailwind CSS** y un **lienzo SVG declarativo reactivo**.

Diseñado con código limpio, modular y completamente tipado, ideal para aprender los patrones más modernos y avanzados del ecosistema Angular.

---

## 🚀 Características Principales

### 1. Lienzo Infinito SVG Reactivo (Canvas Engine)
- **Transformación de coordenadas**: Pan (desplazamiento) y Zoom fluido centrado en la posición del cursor (`0.1x` a `5x`).
- **Cuadrícula adaptativa**: Fondo con grilla de puntos que se adapta dinámicamente a la escala de zoom.
- **Herramientas de dibujo interactivas**:
  - `Select / Move (V)`: Selección simple o múltiple con Shift.
  - `Hand (H)`: Arrastre libre del lienzo (o manteniendo pulsada la tecla `Espacio`).
  - `Frame (F)`: Creación de marcos contenedores estilo artboard con etiqueta superior.
  - `Rectangle (R)`: Rectángulos con radio de esquinas personalizable.
  - `Circle (O)`: Elipses y círculos perfectos.
  - `Star (S)`: Polígonos de estrella con cálculo de vértices paramétrico.
  - `Line (L)`: Trazado de líneas vectoriales.
  - `Text (T)`: Capas tipográficas con edición directa.

### 2. Transformaciones y Manipulación Visual
- **Bounding Box con 8 manejadores**: Redimensión interactiva (esquinas y laterales) con cursor correspondiente (`nwse-resize`, `nesw-resize`, etc.).
- **Manejador de rotación superior**: Rotación en tiempo real con opción de ajuste angular (`Shift` para múltiplos de 15°).
- **Indicador de dimensiones en vivo**: Badge tipo Figma que muestra `Ancho × Alto` en tiempo real mientras manipulas formas.
- **Mover con teclado**: Nudge de 1px con flechas direccionales, o 10px con `Shift + Flechas`.

### 3. Panel de Capas (Layers Tree)
- Visualización en orden de profundidad z-index (la capa superior arriba, igual que Figma).
- Renombrado en línea con doble clic.
- Control de visibilidad (icono de ojo) y bloqueo contra edición (icono de candado).
- Reordenamiento rápido de profundidad (`Traer adelante`, `Enviar atrás`).
- Duplicar (`Cmd+D`) y eliminar capas seleccionadas.

### 4. Inspector de Propiedades (Right Sidebar)
- **Barra de alineación**: Alinear a la izquierda, centro, derecha, arriba, medio o abajo.
- **Posición y Dimensiones**: Inputs numéricos bidireccionales para `X`, `Y`, `W`, `H`, rotación y radio de esquina.
- **Tipografía**: Fuente, tamaño, peso y contenido editable en vivo.
- **Relleno (Fill)**: Selector de color visual, código HEX y barra de opacidad.
- **Borde (Stroke)**: Color y grosor en píxeles.
- **Sombra (Drop Shadow)**: Filtros SVG reales para desplazamiento X/Y y radio de difuminado (`blur`).
- **Opacidad global de capa**.

### 5. Historial y Exportación
- **Undo / Redo ilimitado**: Historial de estados con atajos `Cmd+Z` y `Cmd+Shift+Z`.
- **Exportar SVG**: Descarga del diseño en formato vectorial puro limpio.
- **Exportar PNG (Retina 2x)**: Rasterización de alta definición directa en el cliente.
- **Guardar / Cargar JSON**: Exporta e importa proyectos completos para continuar diseñando más tarde.

---

## 🧠 Conceptos Modernos de Angular 22 Aplicados

Este proyecto fue estructurado para servir como guía de aprendizaje de Angular moderno:

| Concepto Angular | Implementación en Grovy |
| :--- | :--- |
| **Signals (`signal()`)** | Estado reactivo de elementos, selección, zoom, pan y herramientas activas en `CanvasStateService`. |
| **Computed Signals (`computed()`)** | Cálculo reactivo sin efectos secundarios del Bounding Box combinado, elementos seleccionados y estado de deshacer/rehacer. |
| **Signal Inputs (`input()`, `input.required()`)** | Comunicación tipada en componentes como `FigmaIconComponent`. |
| **Control Flow (`@if`, `@for`, `@let`)** | Renderizado declarativo en templates sin directivas estructurales legacy (`*ngIf`, `*ngFor`). |
| **Standalone Components** | Arquitectura modular sin `NgModule` usando la propiedad `imports: [...]`. |
| **Inyección de dependencias `inject()`** | Consumo limpio de servicios (`CanvasStateService`) sin constructores verbosos. |
| **Change Detection `OnPush`** | Máximo rendimiento y renderizado óptimo al delegar la reactividad en Signals. |

---

## ⌨️ Atajos de Teclado

| Atajo | Acción |
| :--- | :--- |
| `V` | Herramienta de Selección / Mover |
| `H` | Herramienta de Mano (Arrastrar lienzo) |
| `Espacio + Arrastrar` | Desplazar lienzo rápidamente |
| `R` / `O` / `S` | Rectángulo / Círculo / Estrella |
| `F` / `T` / `L` | Frame / Texto / Línea |
| `Cmd + Z` / `Ctrl + Z` | Deshacer |
| `Cmd + Shift + Z` / `Ctrl + Y` | Rehacer |
| `Cmd + D` / `Ctrl + D` | Duplicar elementos seleccionados |
| `Cmd + A` / `Ctrl + A` | Seleccionar todos los elementos |
| `Supr` / `Backspace` | Eliminar elementos seleccionados |
| `Flechas` | Mover 1px (con `Shift`: 10px) |
| `Esc` | Deseleccionar y volver a Selección |

---

## 🛠️ Comandos de Desarrollo

```bash
# Iniciar servidor de desarrollo (por defecto en http://localhost:4200/)
npm start

# Compilar para producción
npm run build
```
