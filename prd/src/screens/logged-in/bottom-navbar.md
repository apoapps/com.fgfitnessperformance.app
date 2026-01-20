# TabBar Flotante

## Proposito

Barra de navegacion inferior flotante con efecto glassmorphism. Siguiendo la estetica "The Forge", no es una barra convencional pegada al borde; es un elemento **flotante** que parece suspendido sobre el contenido.

---

## Estructura Visual

```
┌─────────────────────────────────┐
│                                 │
│        Contenido de             │
│        la Pantalla              │
│                                 │
│                                 │
├─────────────────────────────────┤
│     20px margen                 │
│  ┌─────────────────────────────┐│
│  │                             ││
│  │  [🏠]  [📊]  [🔍]  [⚙️]   ││  <- TabBar Flotante
│  │   Hub  Prog  Explore Ajustes││
│  │                             ││
│  └─────────────────────────────┘│
│     20px + safe area            │
└─────────────────────────────────┘
```

---

## Tabs

**Numero de tabs**: 4

| Tab | Label | Icono | Ruta |
|-----|-------|-------|------|
| Hub | "Hub" | Home/House | `/(tabs)/dashboard` |
| Progreso | "Progreso" | Chart/Analytics | `/(tabs)/progress` |
| Explore | "Explore" | Search/Compass | `/(tabs)/explore` |
| Ajustes | "Ajustes" | Settings/Gear | `/(tabs)/settings` |

**Con labels**: Texto pequeño debajo de cada icono.

---

## Dimensiones

| Elemento | Valor |
|----------|-------|
| Altura total | 70px |
| Ancho | 100% - 40px (20px cada lado) |
| Margen inferior | 20px + safe area |
| Margen lateral | 20px cada lado |
| Border radius | 24px |

---

## Efecto Glassmorphism

### iOS

- BlurView nativo con intensidad 80
- Tint: Adapta a light/dark mode
- Borde: 1px `glassBorder`
- El contenido de atras se ve desenfocado

### Android

- Fallback: Color solido `surface` con 95% opacidad
- Mismo borde que iOS
- Blur puede causar drops de FPS en gama baja

---

## Estados de los Tabs

### Activo (seleccionado)

- Color icono: `primary` (amarillo/dorado)
- Color label: `primary`
- Indicador: Punto pequeño (4px) debajo del label

### Inactivo

- Color icono: `textMuted` (gris)
- Color label: `textMuted`
- Sin indicador

### Presionado

- Opacidad: 0.7 momentaneamente
- Sin escala (evitar distracciones)

---

## Iconografia

**Libreria**: Material Symbols o Lucide

| Tab | Icono Sugerido |
|-----|----------------|
| Hub | `home` filled |
| Progreso | `analytics` o `bar_chart` |
| Explore | `explore` o `search` |
| Ajustes | `settings` |

**Tamaño iconos**: 24px
**Tamaño labels**: 10px, bold

---

## Comportamiento

### Visibilidad

- **Visible** en todas las pantallas del grupo `/(tabs)/`
- **Oculto** en `/(auth)/` (login, forgot-password)
- **Oculto** en modales de pantalla completa

### Navegacion

- Tap en tab inactivo: Navega a la ruta
- Tap en tab activo: Scroll to top

### Animaciones

- Cambio de color: 150ms ease
- Indicador: Desplazamiento suave 200ms

---

## Safe Area

### iOS

- Home indicator: El margen de 20px es **adicional** al safe area
- Usar `SafeAreaView` de React Native

### Android

- Navigation bar: Respetar barra de gestos o botones
- Ajuste automatico segun configuracion del sistema

---

## Especificaciones por Modo

### Light Mode

| Elemento | Valor |
|----------|-------|
| Fondo | `rgba(255,255,255,0.85)` con blur |
| Borde | `rgba(0,0,0,0.08)` |
| Iconos activos | `#ca8a04` (Yellow 600) |
| Iconos inactivos | `#71717a` (Zinc 500) |

### Dark Mode

| Elemento | Valor |
|----------|-------|
| Fondo | `rgba(24,24,27,0.8)` con blur |
| Borde | `rgba(255,255,255,0.1)` |
| Iconos activos | `#ffd801` (Amarillo electrico) |
| Iconos inactivos | `#a1a1aa` (Zinc 400) |

---

## Accesibilidad

- `accessibilityRole="tablist"` en contenedor
- `accessibilityRole="tab"` en cada item
- `accessibilityLabel` descriptivo: "Hub", "Ver progreso", etc.
- `accessibilityState={{ selected: true }}` en tab activo

---

## Rendimiento

- Renderiza una sola vez en el layout de tabs
- Solo el indicador activo se actualiza al cambiar tab
- Iconos importados estaticamente
- Evitar logica pesada en el componente

