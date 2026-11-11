# Grovy - Clon de Figma Pro en Angular 22

Un clon profesional de Figma construido con **Angular 22**, **Angular Signals**, **Tailwind CSS** y **SVG declarativo reactivo**.

Incluye soporte para **Colaboración 100% en tiempo real**, creación y gestión de **Design Systems**, **Motor de Generación de UI con IA (Prompts)** y un **Reproductor de Prototipos interactivos de lujo con marcos de dispositivos (iPhone 15 Pro, MacBook Pro y Pantalla Completa)**.

---

## 🌟 Novedades y Capacidades Avanzadas

### 1. 👥 Colaboración 100% en Tiempo Real (Multiplayer)
- **Cursores multijugador en vivo**: Cada participante tiene un cursor con color único y etiqueta de nombre que se desplaza en tiempo real sobre el lienzo en coordenadas SVG.
- **Sincronización instantánea de elementos**: Movimientos, redimensionamiento, colores y creación de formas sincronizados entre pestañas/usuarios mediante `BroadcastChannel`.
- **Avatares de presencia**: Lista de diseñadores activos en la barra superior con tooltips e indicador de conexión online.
- **Modo Demo Multijugador**: Permite activar o desactivar compañeros de equipo virtuales (*Sofía* y *Mateo*) que interactúan en vivo en el lienzo.

### 2. 🎨 Design System y Biblioteca de Componentes
- **Pestaña Design System en el panel izquierdo**: Alterna entre "Capas" y "Design System".
- **Tokens de Color**: Paleta de colores semánticos, de marca y neutros. Un solo clic aplica el token de color a cualquier elemento seleccionado.
- **Tokens de Tipografía**: Estilos rápidos (`Display`, `Heading 1`, `Heading 2`, `Body`, `Caption`).
- **Biblioteca de Componentes Reutilizables**:
  - `Barra de Navegación` (Navbar completa con logo, links y botón CTA).
  - `Tarjeta de KPI` (Métrica de ingresos con porcentaje de crecimiento).
  - `Botón Primario` (Botón con resplandor y tipografía semibold).
- **Crear Componente**: Selecciona cualquier grupo o frame en el lienzo y pulsa **"❖ Crear Componente"** para guardarlo en tu Design System.

### 3. ✨ Motor de IA para Generación de UI con Prompts
- **Botón `✨ IA Prompt` en la barra superior** y en el menú principal.
- **Entrada de lenguaje natural**: Escribe lo que deseas (ej. *"Crea un prototipo interactivo con 2 pantallas conectadas por un botón"* o *"Tarjeta de precios con 3 planes"*).
- **Soporte dual**:
  - **Motor semántico local inteligente**: Funciona 100% offline y sin necesidad de API keys, calculando automáticamente posiciones, esquemas de color, tipografía y sombras.
  - **Integración con Google Gemini**: Si configuras tu clave API en Ajustes, puede conectarse directamente a modelos como `gemini-2.5-flash`.

### 4. 🚀 Prototipado Interactivo y Presentación de Lujo (Preview Cool)
- **Vinculación entre Frames (Links)**: En el Inspector derecho, selecciona la pestaña **"Prototipo"** para configurar interacciones:
  - *Al hacer clic* ➔ *Navegar a [Frame Destino]* con animación (*Deslizar a la izquierda*, *Deslizar a la derecha*, *Disolver* o *Instantáneo*).
- **Líneas conectoras visuales (Noodles)**: Muestra curvas Bézier azules animadas que conectan los botones de acción con sus pantallas de destino en el lienzo.
- **Reproductor de Presentación de Lujo (`▶ Presentar`)**:
  - **iPhone 15 Pro**: Bisel curvado con Dynamic Island, reloj, barra de estado y home indicator.
  - **MacBook Pro**: Ventana de cristal con controles rojo/amarillo/verde y barra de título.
  - **100% Pantalla**: Vista fluida adaptable.
  - **Navegación interactiva real**: Al hacer clic en los botones enlazados, se ejecutan las transiciones entre pantallas.
  - **Resaltado de Hotspots**: Al hacer clic en un área vacía, las áreas interactivas parpadean en azul (igual que en Figma).
  - **Reiniciar prototipo (`R`)** o salir con `Esc`.

### 5. ⚙️ Botón de Ajustes en el Menú de la App
- Al hacer clic en el nombre de la app (**"G Grovy Figma v22"** con la flecha desplegable en la esquina superior izquierda), se abre el menú principal con:
  - ⚙️ **Ajustes / Configuración**: Modal con configuración de perfil de diseñador, color de cursor, ID de sala compartida, toggle de compañeros simulados y API Key de IA.
  - ✨ **Generar con IA (Prompt)**.
  - ▶ **Presentación de Prototipo**.
  - 💾 **Exportar (SVG, PNG Retina 2x, JSON) e Importar**.

---

## 🛠️ Ejecución

```bash
# Servidor de desarrollo
npm start
```

Visita **http://localhost:4200/** en tu navegador.
> 💡 **Tip colaborativo**: Abre la URL en dos pestañas diferentes de tu navegador para ver tus propios cursores y cambios sincronizándose en tiempo real.
