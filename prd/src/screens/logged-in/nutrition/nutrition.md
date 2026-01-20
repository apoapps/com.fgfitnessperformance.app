# Nutricion - "Protocolo Diario"

## Proposito

Pantalla de **solo lectura** donde el cliente visualiza su plan nutricional asignado. Muestra macronutrientes en grafico donut, meta de hidratacion, lista de comidas del dia, y documentos adjuntos. El cliente no edita ni marca nada como completado.

---

## Estructura Visual

```
┌─────────────────────────────────┐
│  [←]    PROTOCOLO DIARIO   [⚙️] │  <- Top Bar
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────────┐│
│  │    ╭────────────────╮       ││
│  │   ╱      CARBS       ╲      ││  <- Donut Chart
│  │  │   ┌──────────┐    │      ││
│  │  │   │  2,450   │    │      ││  <- KCAL CONSUMIDAS
│  │  │   │ de 3,000 │    │      ││     (meta diaria)
│  │  │   └──────────┘    │      ││
│  │   ╲ PROT       FAT  ╱      ││
│  │    ╰────────────────╯       ││
│  │                             ││
│  │  180g      250g       65g   ││  <- Macros
│  │  Proteína  Carbos    Grasas ││
│  └─────────────────────────────┘│
│                                 │
├─────────────────────────────────┤
│  Comidas Programadas            │  <- Section header
│                                 │
│  ┌─────────────────────────────┐│
│  │  07:00 AM                   ││  <- Card Comida
│  │  Desayuno Pro-Energía       ││
│  │  ───────────────────────    ││
│  │  650 kcal • 45g • 60g • 20g ││  <- Macros
│  │                        [🖼️] ││  <- Imagen comida
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │  10:00 AM                   ││
│  │  Pre-Entreno Explosivo      ││
│  │  320 kcal • 10g • 75g • 5g  ││
│  │                        [🖼️] ││
│  └─────────────────────────────┘│
│                                 │
│  ... mas comidas ...            │
│                                 │
├─────────────────────────────────┤
│  Documentos                     │
│  ┌─────────────────────────────┐│
│  │  [📄] Guía de Suplementación││
│  │  [📄] Recetas Semana 1      ││
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
| Boton atras | Flecha izquierda, navega back |
| Titulo | "PROTOCOLO DIARIO", centrado, bold |
| Icono derecha | Settings o mas opciones |

---

## Seccion: Grafico de Macros

### Card Contenedor

- Fondo: `surface`
- Borde: 1px `border`
- Radius: 12px
- Margin: 16px horizontal
- Padding: 24px

### Grafico Donut

**Implementacion**: React Native Skia o SVG

**Dimensiones**:
- Diametro exterior: 180-200px
- Grosor del anillo: 20px
- Diametro interior: 60%

**Colores de Segmentos**:

| Macro | Color |
|-------|-------|
| Proteina | `#3b82f6` (Blue 500) |
| Carbohidratos | `#22c55e` (Green 500) |
| Grasas | `#ffd801` (Primary/Dorado) |

**Centro del Grafico**:
- Titulo: "KCAL CONSUMIDAS" en 10px, `textMuted`
- Numero: Meta diaria (ej: "2,450")
  - Fuente: Heading, 36px, bold
  - Color: `text`
- Subtexto: "de 3,000"
  - Fuente: 14px
  - Color: `textMuted`

### Macros Debajo

Layout horizontal con 3 columnas:

```
   180g         250g          65g
  Proteína     Carbos       Grasas
```

- Numero: 20px, bold, `text`
- Label: 12px, `textMuted`
- Alineacion: Centro cada columna

---

## Seccion: Comidas Programadas

### Header

| Elemento | Valor |
|----------|-------|
| Titulo | "Comidas Programadas" |
| Fuente | 12px, Bold, uppercase |
| Color | `textMuted` |

**Sin contador de completadas** - Es solo lectura

### Card de Comida

**Contenedor**
- Fondo: `surface`
- Borde: 1px `border`
- Radius: 12px
- Margin: 16px horizontal, 12px bottom
- Padding: 16px

**Layout**: Row con imagen a la derecha

**Contenido (izquierda, flex-1)**:
- Horario: "07:00 AM"
  - Fuente: 12px, bold
  - Color: `textMuted`
- Nombre: "Desayuno Pro-Energía"
  - Fuente: 16px, bold
  - Color: `text`
- Macros: "650 kcal • 45g • 60g • 20g"
  - Fuente: 12px
  - Color: `textMuted`
  - Formato: kcal • proteina • carbs • fat

**Imagen (derecha)**:
- Tamaño: 64x64px
- Radius: 8px
- Object-fit: Cover
- Imagen representativa de la comida

**Sin estados de completado** - No hay checkboxes ni indicadores

---

## Seccion: Documentos PDF

### Header

| Elemento | Valor |
|----------|-------|
| Titulo | "Documentos" |
| Fuente | 12px, Bold, uppercase |
| Color | `textMuted` |

### Lista de Documentos

**Card Contenedor**
- Fondo: `surface`
- Borde: 1px `border`
- Radius: 12px
- Margin: 16px horizontal

**Item de Documento**
- Layout: Row con padding 16px
- Icono: PDF, 20px
- Nombre: 14px, `text`
- Chevron: Derecha, `textMuted`
- Separador: 1px `border` entre items

**Tap**: Abre PDF en browser

---

## Mapeo de Datos

| UI | Campo |
|----|-------|
| Meta calorias | `macros.calories` |
| Proteina | `macros.protein` |
| Carbs | `macros.carbs` |
| Grasas | `macros.fat` |
| Comidas | `structure.meals[]` |
| Documentos | `documents[]` |

---

## Estados

### Cargando
- Skeleton en grafico
- Skeleton en cards de comidas

### Sin Plan
- Mensaje: "No hay plan nutricional asignado"
- Subtexto: "Tu nutriologo asignara tu plan pronto"

---

## Fuente de Datos

| Context | Datos |
|---------|-------|
| NutritionContext | Plan completo, macros, comidas, documentos |

---

## Nota Importante

Esta pantalla es **100% read-only**:
- No hay tracking de comidas completadas
- No hay inputs para registrar consumo
- El usuario solo visualiza el plan asignado por su nutriologo
- Cualquier duda se resuelve en el foro de la app

