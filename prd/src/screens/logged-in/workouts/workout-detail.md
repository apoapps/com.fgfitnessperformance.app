# Detalle de Sesion - Workout Detail

## Proposito

Pantalla donde el usuario visualiza el detalle completo de una sesion de entrenamiento. Muestra imagen hero, metadata en chips, ejercicios con videos, y circuitos. **Solo lectura** - sin tracking de completados.

---

## Estructura Visual

```
┌─────────────────────────────────┐
│  [←]                      [↗️]   │  <- Header sobre imagen
│                                 │
│  ┌─────────────────────────────┐│
│  │                             ││
│  │    [======IMAGEN======]     ││  <- Hero image
│  │                             ││
│  │              [PRO ELITE]    ││  <- Badge tier
│  └─────────────────────────────┘│
│                                 │
│  FUERZA EXPLOSIVA               │  <- Titulo
│                                 │
│  DETALLE DE SESIÓN              │  <- Subtitulo
│  Enfoque: Potencia de tren      │  <- Descripcion
│  inferior y estabilidad core.   │
│                                 │
│  [60 min] [Alta Intensidad]     │  <- Chips metadata
│  [Gimnasio]                     │
│                                 │
├─────────────────────────────────┤
│  CALENTAMIENTO DINÁMICO         │  <- Section
│  ┌─────────────────────────────┐│
│  │  [🎬]  Movilidad de    [ℹ️] ││  <- Card ejercicio
│  │        Cadera               ││
│  │        2 series x 12 reps   ││
│  └─────────────────────────────┘│
│                                 │
├─────────────────────────────────┤
│  BLOQUE PRINCIPAL               │  <- Section
│  ╔═════════════════════════════╗│  <- Circuito
│  ║  CIRCUITO AMRAP - 15 MIN 🔄 ║│     Borde dorado
│  ╠═════════════════════════════╣│
│  ║  [🎬] Sentadilla Goblet    ║│
│  ║       12 reps              ║│
│  ║─────────────────────────────║│
│  ║  [🎬] Push-ups             ║│
│  ║       15 reps              ║│
│  ║─────────────────────────────║│
│  ║  [🎬] Rowing               ║│
│  ║       12 reps              ║│
│  ╚═════════════════════════════╝│
│                                 │
│  ┌─────────────────────────────┐│
│  │  [🎬]  Hip Thrust     [ℹ️] ││
│  │        4 series x 10 reps   ││
│  │        Descanso: 90s        ││
│  └─────────────────────────────┘│
│                                 │
├─────────────────────────────────┤
│  ┌─────────────────────────────┐│
│  │    [  INICIAR SESIÓN  ]     ││  <- Boton fijo
│  └─────────────────────────────┘│
├─────────────────────────────────┤
│  [Hub] [Prog] [Explore] [Ajust] │
└─────────────────────────────────┘
```

---

## Seccion: Hero Header con Imagen

### Especificaciones

| Elemento | Especificacion |
|----------|----------------|
| Altura | 280-320px |
| Imagen | Full width, aspect ratio 16/10 |
| Overlay | Gradient negro desde bottom |

### Elementos sobre la Imagen

**Boton Atras**
- Icono: Flecha izquierda
- Tamaño: 24px, color white
- Fondo: Circulo semi-transparente
- Posicion: Top-left + safe area

**Boton Compartir**
- Icono: Share/Export
- Tamaño: 24px, color white
- Fondo: Circulo semi-transparente
- Posicion: Top-right

**Badge de Tier** (si aplica)
- Posicion: Bottom-right de la imagen
- Texto: "PRO ELITE" o tier del usuario
- Fondo: `primary`
- Texto: White, 10px, bold
- Radius: 4px

---

## Seccion: Info del Workout

### Titulo

- Texto: Nombre del workout (ej: "FUERZA EXPLOSIVA")
- Fuente: Heading, 28px, extra bold
- Color: `text`
- Mayusculas

### Subtitulo

- Texto: "DETALLE DE SESIÓN"
- Fuente: 12px, bold, uppercase
- Color: `primary`
- Tracking: Wide

### Descripcion

- Texto: Enfoque de la sesion
- Fuente: 14px
- Color: `textMuted`
- Max 2-3 lineas

### Chips de Metadata

**Layout**: Flex row, wrap, gap 8px

**Chip individual**:
- Fondo: `surface`
- Borde: 1px `border`
- Texto: `textMuted`, 12px
- Radius: Full (pill)
- Padding: 6px 12px

**Tipos de chips**:
- Duracion: "60 min"
- Intensidad: "Alta Intensidad"
- Ubicacion: "Gimnasio" o "Casa"
- Equipamiento: "Mancuernas" (opcional)

---

## Seccion: Ejercicios

### Header de Seccion

- Texto: "CALENTAMIENTO DINÁMICO", "BLOQUE PRINCIPAL", etc.
- Fuente: 12px, bold, uppercase
- Color: `textMuted`
- Margin: 24px top, 12px bottom

### Card de Ejercicio Simple

**Contenedor**
- Fondo: `surface`
- Borde: 1px `border`
- Radius: 12px
- Padding: 16px
- Margin bottom: 12px

**Layout**: Row

**Thumbnail (izquierda)**
- Tamaño: 64x64px
- Radius: 8px
- Imagen: YouTube thumbnail o placeholder
- Overlay: Icono play pequeño

**Contenido (centro, flex-1)**
- Nombre: 16px, bold, `text`
- Metricas: "2 series x 12 repeticiones"
  - Fuente: 14px
  - Color: `textMuted`
- Descanso (opcional): "Descanso: 90s"

**Boton Info (derecha)**
- Icono: Info circle
- Color: `textMuted`
- Tap: Abre modal con instrucciones

---

## Bloque: Circuito AMRAP

### Identificador Visual

Circuitos tienen **borde dorado** distintivo.

**Contenedor**
- Fondo: `surface`
- Borde: **2px `primary` (dorado)**
- Radius: 12px
- Margin: 16px horizontal, 12px bottom

### Header del Circuito

- Texto: "CIRCUITO AMRAP - 15 MIN"
- Icono: 🔄 o flechas circulares
- Fondo: `primaryDim`
- Padding: 12px
- Radius top: 10px

**AMRAP** = As Many Rounds As Possible

### Lista de Ejercicios

Cada ejercicio en formato compacto:

```
[🎬] Sentadilla Goblet
     12 reps
─────────────────────
[🎬] Push-ups
     15 reps
```

- Thumbnail: 48x48px
- Nombre: 14px, `text`
- Reps: 12px, `textMuted`
- Separador: 1px `border` entre items
- Tap: Abre modal de video

---

## Modal de Video

### Activacion

- Tap en thumbnail de ejercicio
- Tap en card de ejercicio

### Contenido

- Bottom sheet o modal
- Reproductor YouTube
- Nombre del ejercicio
- Instrucciones de ejecucion
- Boton cerrar

---

## Boton: Iniciar Sesion

### Especificaciones

| Elemento | Valor |
|----------|-------|
| Posicion | Sticky bottom, sobre TabBar |
| Fondo | `danger` (rojo) o `primary` |
| Texto | "INICIAR SESIÓN", white, bold |
| Padding | 16px vertical |
| Radius | 8px |
| Margin | 16px horizontal |

**Nota**: El boton es visible pero es **informativo**. La app es read-only, no hay tracking de inicio/fin de sesion. El boton puede simplemente mostrar un mensaje o abrir un timer externo.

---

## Mapeo de Datos

| UI | Campo JSONB |
|----|-------------|
| Titulo | `days[d].name` |
| Descripcion | `days[d].focus` |
| Ejercicios | `days[d].exercises[]` |
| Video | `exercise_id` -> `exercise_library.video_url` |
| Sets/Reps | `exercises[].sets`, `reps` |
| Circuito | `is_superset: true` consecutivos |

---

## Estados

### Cargando
- Skeleton en hero
- Skeleton en cards

### Error de Video
- Placeholder con icono roto
- Mensaje: "Video no disponible"

---

## Nota Importante

Esta pantalla es **100% read-only**:
- No hay tracking de ejercicios completados
- No hay registro de pesos usados
- El boton "Iniciar Sesión" es informativo
- Dudas se resuelven en el foro de la app

