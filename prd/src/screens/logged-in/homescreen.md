# Dashboard - "El Hub"

## Proposito

Pantalla principal post-login. Centro de comando del atleta con acceso rapido al entrenamiento del dia y programacion completa.

---

## Estructura Visual

```
┌─────────────────────────────────┐
│  [Avatar]  EL HUB    [🔔]       │  <- Top Bar fijo con blur
├─────────────────────────────────┤
│                                 │
│  BIENVENIDO                     │  <- Hero Headline
│  DE NUEVO                       │
│  ████                           │  <- Linea accent primary (48px)
│                                 │
├─────────────────────────────────┤
│  Próximo Entrenamiento  ● Live  │  <- Section header
│  ┌─────────────────────────────┐│
│  │ [========IMAGEN=========]   ││
│  │ [Badge: The Forge Central]  ││
│  ├─────────────────────────────┤│
│  │▌FUERZA MÁXIMA: PIERNAS      ││  <- Borde izq primary
│  │▌🕐 18:00-19:30 | Hoy        ││
│  │▌─────────────────────────   ││
│  │▌Descripción del enfoque...  ││
│  └─────────────────────────────┘│
│                                 │
├─────────────────────────────────┤
│  Programación del Día           │  <- Section header
│                                 │
│  ┌───────┬───────────────────┐  │
│  │ 07:00 │ MOVILIDAD FUNCIONAL│  │  <- Card normal
│  │  AM   │ Rutina apertura... │  │
│  └───────┴───────────────────┘  │
│                                 │
│  ╔═══════╦═══════════════════╗  │  <- Card ACTIVA (invertida)
│  ║ 18:00 ║ FUERZA MÁXIMA ✓   ║  │     Fondo oscuro, texto claro
│  ║  PM   ║ Sesión principal  ║  │
│  ╚═══════╩═══════════════════╝  │
│                                 │
│  ┌───────┬───────────────────┐  │
│  │ 20:30 │ RECUPERACIÓN ACTIVA│  │  <- Card normal
│  │  PM   │ Liberación miofa..│  │
│  └───────┴───────────────────┘  │
│                                 │
├─────────────────────────────────┤
├─────────────────────────────────┤
│                                 │
│  [Hub] [Plan] [Prog] [Perfil]   │  <- Bottom Nav
└─────────────────────────────────┘
```

---

## Seccion: Top Bar

### Especificaciones

| Elemento | Especificacion |
|----------|----------------|
| Altura | 56px + safe area |
| Fondo | `background` con 80% opacidad + blur |
| Borde | 1px `border` en bottom |
| Posicion | Sticky top con z-index 50 |

### Contenido

**Avatar (izquierda)**
- Tamaño: 40x40px
- Borde: 2px `border` (dark) o `zinc-900` (light)
- Forma: Rounded-lg (8px radius)
- Fuente: `ProfileContext.profile.avatar_url`

**Titulo (centro)**
- Texto: "EL HUB"
- Fuente: Bold, uppercase, tracking tight
- Tamaño: 20px

**Notificaciones (derecha)**
- Icono: `notifications` de Material Symbols
- Tamaño: 24px
- Tap: Muestra dropdown o navega a notificaciones

---

## Seccion: Hero Headline

### Especificaciones

| Elemento | Especificacion |
|----------|----------------|
| Padding | 16px horizontal, 32px top, 16px bottom |
| Texto | "BIENVENIDO DE NUEVO" en 2 lineas |

**Tipografia**
- Fuente: Display/Heading (Space Grotesk o Oswald)
- Tamaño: 36-40px
- Peso: Extra Bold (800)
- Line height: 0.9 (muy compacto)
- Tracking: -0.02em (tight)
- Mayusculas

**Linea Accent**
- Ancho: 48px
- Alto: 4px
- Color: `primary`
- Margin top: 16px

---

## Seccion: Proximo Entrenamiento

### Header de Seccion

| Elemento | Valor |
|----------|-------|
| Titulo | "Próximo Entrenamiento" |
| Fuente | 12px, Bold, uppercase, tracking widest |
| Color | `textMuted` |

**Indicador "En Vivo"**
- Dot: 6px circulo `primary`
- Texto: "En Vivo" en `primary`
- Solo visible si la sesion es hoy y esta proxima

### Card Principal

**Contenedor**
- Fondo: `surface` (white en light, zinc-900 en dark)
- Borde: 1px `border`
- Radius: 12px (xl)
- Sombra: Sutil (0 4px 20px rgba(0,0,0,0.05) en light)

**Imagen Superior**
- Aspect ratio: 16/10
- Cover con gradient overlay (bottom to transparent)
- Badge posicionado bottom-left: "The Forge Central"
  - Fondo: `primary`
  - Texto: White, 10px, bold, uppercase

**Contenido Inferior**
- Borde izquierdo: 4px `primary` (brutal-border)
- Padding: 20px

**Elementos**:
1. **Titulo**: "FUERZA MÁXIMA: PIERNAS"
   - Fuente: Heading, 24px, bold, uppercase
2. **Horario**: "18:00 - 19:30 | Hoy"
   - Icono: `schedule`
   - Color: `textMuted`
3. **Descripcion**: Texto corto del enfoque
   - Separador top: 1px `border`
   - Color: `textMuted`
   - Tamaño: 14px

### Mapeo de Datos

| UI | Fuente |
|----|--------|
| Titulo | `WorkoutContext.activeWorkout.structure.weeks[w].days[d].name` |
| Horario | Calculado o fijo |
| Descripcion | `days[d].focus` o notas |
| Imagen | Estatica o de `exercise_library` |

---

## Seccion: Programacion del Dia

### Header

- Texto: "Programación del Día"
- Estilo: Mismo que seccion anterior

### Cards de Horario

**Card Normal**
- Fondo: `surface`
- Borde: 1px `border`
- Radius: 8px
- Padding: 16px
- Layout: Flex row con gap

**Estructura interna**:
```
┌─────────┬─────┬─────────────────────┐
│  07:00  │  │  │ MOVILIDAD FUNCIONAL │
│   AM    │  │  │ Descripcion corta   │
└─────────┴─────┴─────────────────────┘
     ↑        ↑           ↑
   Hora    Divider    Contenido
   60px    1px w      flex-1
```

**Hora**:
- Numero: 20px, bold, heading style
- AM/PM: 10px, bold, uppercase, `textMuted`

**Divider vertical**: 1px, 40px alto, `border`

**Contenido**:
- Titulo: Bold, 16px, uppercase tight
- Descripcion: 12px, `textMuted`

### Card Activa (Invertida)

Cuando el horario coincide con la sesion principal del dia:

| Propiedad | Light Mode | Dark Mode |
|-----------|------------|-----------|
| Fondo | `zinc-950` (negro) | `white` |
| Texto titulo | `white` | `zinc-950` |
| Texto secundario | `zinc-400` | `zinc-500` |
| Borde izquierdo | 4px `primary` | 4px `primary` |
| Sombra | Mas pronunciada | Sutil |

**Icono de verificacion**: `verified` en `primary` al final de la fila

---

## Seccion: Quote / Filosofia

### Especificaciones

| Elemento | Valor |
|----------|-------|
| Padding | 24px vertical, 24px horizontal |
| Bordes | Top y bottom 1px `border` |
| Alineacion | Centrado |

**Subtitulo**:
- Texto: "The Forge Philosophy"
- Color: `primary`
- Tamaño: 14px, bold
- Tracking: 0.3em (muy espaciado)
- Uppercase

**Quote**:
- Texto: Frase motivacional
- Fuente: Heading, 18px, medium
- Estilo: Italica
- Line height: Tight

---

## Fuentes de Datos

| Context | Datos |
|---------|-------|
| ProfileContext | `avatar_url`, `full_name` |
| WorkoutContext | `activeWorkout`, estructura del dia |
| SyncContext | Estado de conexion |

---

## Interacciones

| Elemento | Accion |
|----------|--------|
| Card principal | Tap -> Navega a workout detail |
| Card de horario | Tap -> Navega a workout detail si es entrenamiento |
| Avatar | Tap -> Navega a Profile |
| Notificaciones | Tap -> Muestra notificaciones |

---

## Estados

### Cargando
- Skeleton en hero headline
- Skeleton en card principal
- Skeleton en cards de horario

### Sin Workout Activo
- Card principal muestra: "No hay entrenamiento programado"
- Cards de horario vacias o mensaje placeholder

### Offline
- Funciona normalmente con datos de SQLite
- Indicador sutil de "Offline" en top bar (opcional)
