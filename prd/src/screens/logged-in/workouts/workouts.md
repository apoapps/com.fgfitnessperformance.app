# Lista de Rutinas - "Mis Entrenamientos"

## Proposito

Pantalla que muestra el programa de entrenamiento del cliente. Presenta la fecha actual, fase del mesociclo, el workout de hoy destacado, y los proximos dias. **Solo lectura** - sin tracking de completados.

---

## Estructura Visual

```
┌─────────────────────────────────┐
│  [←]  MIS ENTRENAMIENTOS   [⚙️] │  <- Top Bar
├─────────────────────────────────┤
│                                 │
│  [Semana 1] [Semana 2] [Sem 3]  │  <- Chips semana
│                                 │
│  Lunes, 12 de Octubre           │  <- Fecha actual
│  Fase de Potencia • Mesociclo 1 │  <- Info programa
│                                 │
├─────────────────────────────────┤
│  ┌─────────────────────────────┐│  <- Card HOY
│  │  [HOY]  [RUTINA A]          ││     Badges
│  │                             ││
│  │  Leg Power -          [👤]  ││  <- Avatar/imagen
│  │  Hypertrophy                ││
│  │  ⏱️ 75 min • Alta Intensidad││
│  │                             ││
│  │  [      INICIAR      ]      ││  <- Boton primary
│  └─────────────────────────────┘│
│                                 │
├─────────────────────────────────┤
│  Próximos Días                  │  <- Section header
│                                 │
│  ┌─────────────────────────────┐│
│  │  MARTES • RUTINA B          ││
│  │  Upper Body Strength  [👤]  ││
│  │  ⏱️ 60 min • Media Intensidad││
│  │  [    VER DETALLES    ]     ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │  JUEVES • DESCANSO          ││
│  │  Active Recovery &    [👤]  ││
│  │  Mobility                   ││
│  │  ⏱️ 30 min • Baja Intensidad ││
│  │  [    VER DETALLES    ]     ││
│  └─────────────────────────────┘│
│                                 │
├─────────────────────────────────┤
│  [Hub] [Prog] [Explore] [Ajust] │
└─────────────────────────────────┘
```

---

## Seccion: Top Bar

| Elemento | Especificacion |
|----------|----------------|
| Altura | 56px + safe area |
| Boton atras | Flecha izquierda |
| Titulo | "MIS ENTRENAMIENTOS", bold, uppercase |
| Icono derecha | Settings |

---

## Seccion: Selector de Semana

### Chips

**Layout**: Scroll horizontal

```
[Semana 1] [Semana 2] [Semana 3] ...
            ^^^^^^^^
           (seleccionada)
```

**Chip seleccionado**:
- Fondo: `primary`
- Texto: `textOnPrimary`, bold
- Radius: Full (pill)

**Chip normal**:
- Fondo: `surface`
- Borde: 1px `border`
- Texto: `textMuted`

---

## Seccion: Info del Dia

**Fecha actual**
- Formato: "Lunes, 12 de Octubre"
- Fuente: 18px, bold
- Color: `text`

**Fase del programa**
- Formato: "Fase de Potencia • Mesociclo 1"
- Fuente: 14px
- Color: `textMuted`

---

## Card: Workout de Hoy

### Contenedor

- Fondo: `surface`
- Borde: 1px `border`
- Radius: 12px
- Padding: 16px

### Badges (fila superior)

**Badge HOY**
- Fondo: `primary`
- Texto: "HOY", white, 10px, bold, uppercase
- Radius: 4px
- Padding: 4px 8px

**Badge RUTINA**
- Fondo: `surface`
- Borde: 1px `primary`
- Texto: "RUTINA A", `primary`, 10px, bold
- Radius: 4px

### Contenido Principal

**Layout**: Row con imagen a la derecha

**Izquierda (flex-1)**:
- Titulo: "Leg Power - Hypertrophy"
  - Fuente: 18px, bold
  - Color: `text`
- Metadata: "⏱️ 75 min • Alta Intensidad"
  - Fuente: 14px
  - Color: `textMuted`
  - Icono: Timer

**Imagen derecha**:
- Tamaño: 64x64px circular
- Avatar del coach o imagen del workout
- Radius: Full (circulo)

### Boton INICIAR

- Fondo: `primary`
- Texto: "INICIAR", `textOnPrimary`, bold, uppercase
- Padding: 14px vertical
- Radius: 8px
- Full width
- Tap: Navega a workout-detail

---

## Seccion: Proximos Dias

### Header

- Texto: "Próximos Días"
- Fuente: 12px, Bold, uppercase
- Color: `textMuted`

### Cards Proximas

**Contenedor**
- Fondo: `surface`
- Borde: 1px `border`
- Radius: 12px
- Padding: 16px
- Margin bottom: 12px

**Header de Card**
- Texto: "MARTES • RUTINA B"
- Fuente: 12px, bold, uppercase
- Color: `textMuted`

**Contenido**
- Titulo: Nombre del workout, 16px, bold, `text`
- Metadata: Duracion e intensidad, 14px, `textMuted`

**Imagen derecha**: 48x48px circular

**Boton VER DETALLES**
- Fondo: Transparente
- Borde: 1px `border`
- Texto: "VER DETALLES", `textMuted`, bold
- Padding: 10px
- Radius: 8px
- Tap: Navega a workout-detail

---

## Mapeo de Datos

| UI | Fuente |
|----|--------|
| Semanas | `structure.weeks.length` |
| Fecha | Calculada desde `scheduled_start_date` |
| Fase | `structure.weeks[w].name` o metadata |
| Titulo workout | `days[d].name` |
| Duracion | Estimado o campo explicito |
| Intensidad | `days[d].focus` o metadata |

---

## Estados

### Cargando
- Skeleton en chips
- Skeleton en cards

### Sin Programa
- Mensaje: "No hay programa asignado"
- Subtexto: "Tu coach asignara tu programa pronto"

---

## Nota Importante

Esta pantalla es **100% read-only**:
- No hay tracking de workouts completados
- No hay checkboxes ni indicadores de progreso
- El usuario solo visualiza su programa
- Cualquier duda se resuelve en el foro de la app

