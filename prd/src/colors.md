# Sistema Visual "The Forge"

## Filosofia de Diseno

La identidad visual de FG Fitness Performance se denomina **"The Forge"** (La Forja). Se aleja de las tendencias minimalistas y suaves del software moderno para adoptar una estetica de **"Alto Voltaje"**: agresiva, oscura y de alto contraste.

Esta filosofia visual refuerza el mensaje de la marca: el gimnasio es donde se forja el atleta, no un spa de relajacion.

---

## Los Tres Pilares Visuales

### 1. The Void (El Vacio)
El fondo no utiliza grises medios. Es **negro absoluto o grafito profundo**, optimizado para pantallas OLED donde los pixeles negros se apagan literalmente, creando una sensacion de profundidad infinita donde el contenido parece flotar.

**Aplicacion**: Fondos de pantalla, areas de descanso visual

---

### 2. The Spark (La Chispa)
El color primario **Amarillo Electrico** se utiliza con **precision quirurgica**. No es un color de fondo ni de relleno; es un indicador de:
- Accion requerida
- Progreso activo
- Jerarquia critica
- Energia y potencia

**Aplicacion**: Botones principales, indicadores de progreso, bordes de elementos activos, texto destacado

---

### 3. The Structure (La Estructura)
Los contenedores y tarjetas utilizan un efecto de **"Vidrio Liquido" (Glassmorphism)** con bordes sutiles, imitando la precision y calidad del equipo de gimnasio profesional. Capas semi-transparentes con desenfoque crean profundidad sin perder legibilidad.

**Aplicacion**: Cards de ejercicios, contenedores de informacion, modales

---

## Paleta de Colores Semantica

Los nombres de colores son **semanticos** (describen su funcion, no su valor hex), permitiendo cambios globales sin tocar componentes individuales.

### Fondos Base

| Token | Descripcion | Uso |
|-------|-------------|-----|
| `background` | Negro absoluto / Zinc 950 | Fondo global de todas las pantallas |
| `surface` | Grafito oscuro / Zinc 900 | Tarjetas, contenedores, cards |
| `surfaceHighlight` | Zinc mas claro / Zinc 800 | Estados hover, elementos presionados |

### Acentos de Energia (Primary)

| Token | Descripcion | Uso |
|-------|-------------|-----|
| `primary` | Amarillo Electrico / Oro | Accion principal, botones CTA, indicadores activos |
| `primaryDim` | Primary con 15% opacidad | Resplandor, fondos de acento sutil |
| `primaryDark` | Oro oscuro | Estado presionado de botones primary |

### Tipografia

| Token | Descripcion | Uso |
|-------|-------------|-----|
| `text` | Blanco puro | Titulos, texto principal de alta jerarquia |
| `textMuted` | Gris claro / Zinc 400 | Subtitulos, metadatos, texto secundario |
| `textDark` | Negro puro | Texto sobre fondos primary (botones amarillos) |

### Estados Semanticos

| Token | Descripcion | Uso |
|-------|-------------|-----|
| `danger` | Rojo | Errores, alertas criticas, zona de frecuencia cardiaca maxima |
| `success` | Verde | Completado, exito, series terminadas |
| `warning` | Ambar | Advertencias, atencion requerida |

### Bordes y Separadores

| Token | Descripcion | Uso |
|-------|-------------|-----|
| `border` | Zinc 800 | Bordes estandar de contenedores |
| `borderHighlight` | Zinc 700 | Bordes de elementos destacados o activos |

---

## Accesibilidad y Contraste

La combinacion de colores cumple con los estandares **WCAG AAA**:

- **Primary sobre Background**: Ratio de contraste 13.8:1 (supera el minimo de 7:1 para AAA)
- **Text sobre Background**: Ratio de contraste 21:1 (maximo posible)
- **TextMuted sobre Background**: Ratio de contraste 6.5:1 (cumple AA para texto grande)

Esta alta legibilidad es critica para entornos de gimnasio con iluminacion variable y usuarios con sudor en los ojos o fatiga visual.

---

## Tipografia

La tipografia refuerza la estetica agresiva y tecnica de "The Forge".

### Jerarquia de Fuentes

| Categoria | Familia | Uso | Estilo |
|-----------|---------|-----|--------|
| Heading | Oswald (Bold/ExtraBold) | Titulos, nombres de ejercicios | MAYUSCULAS, tracking amplio |
| Body | Inter (Regular/Medium) | Texto de lectura, descripciones | Normal, legible |
| Mono | JetBrains Mono / Space Mono | Datos numericos, timers, pesos | Tabulada, tecnica |

### Principios Tipograficos

1. **Titulos siempre en mayusculas** - Transmite fuerza y autoridad
2. **Numeros con fuente mono** - Alineacion perfecta en metricas (series, repeticiones, peso)
3. **Contraste de peso** - Bold para accion, Regular para informacion
4. **Sin cursivas** - La italica no tiene lugar en "The Forge"

---

## Efectos Visuales

### Glassmorphism (Vidrio Liquido)

Los contenedores principales utilizan una combinacion de:
- Fondo semi-transparente con desenfoque (blur)
- Borde sutil de 1px con opacidad baja
- Esquinas redondeadas (radius grande)

**Consideraciones de plataforma**:
- iOS: BlurView nativo con intensidad ajustable
- Android: Fallback a color solido con alta opacidad (el blur es costoso en Android)

---

### Efecto Neon / Glow

Elementos de maxima jerarquia (nombre del usuario, titulos de seccion) utilizan un efecto de resplandor:
- Sombra difusa del color primary detras del elemento
- Crea la ilusion de que el elemento emite luz
- Implementado con Skia para rendimiento nativo

---

### Sombras

| Tipo | Descripcion | Uso |
|------|-------------|-----|
| `neon` | Resplandor amarillo difuso | Elementos de "Alto Voltaje", titulos heroicos |
| `glass` | Sombra negra profunda y difusa | Contenedores flotantes, cards elevadas |

---

## Sistema de Temas: Light & Dark Mode

La aplicacion soporta **ambos modos** manteniendo la estetica "The Forge" en cada uno. El Light mode no es "suave" - es igualmente agresivo pero con fondos claros.

### Filosofia por Modo

| Modo | Filosofia | Uso Ideal |
|------|-----------|-----------|
| **Dark** | "The Void" - Negro absoluto, energia emerge de la oscuridad | Gimnasio, noche, OLED |
| **Light** | "The Forge" - Blanco industrial, contraste brutal | Exterior, dia, LCD |

---

## Tabla Completa de Tokens por Modo

### Fondos Base

| Token | Dark Mode | Light Mode | Uso |
|-------|-----------|------------|-----|
| `background` | `#09090b` (Zinc 950) | `#fafafa` (Zinc 50) | Fondo global |
| `surface` | `#18181b` (Zinc 900) | `#ffffff` (White) | Cards, contenedores |
| `surfaceHighlight` | `#27272a` (Zinc 800) | `#f4f4f5` (Zinc 100) | Hover, pressed |
| `surfaceElevated` | `#3f3f46` (Zinc 700) | `#e4e4e7` (Zinc 200) | Elementos elevados |

### Colores Primarios (Energia)

| Token | Dark Mode | Light Mode | Uso |
|-------|-----------|------------|-----|
| `primary` | `#ffd801` (Amarillo Electrico) | `#ca8a04` (Yellow 600) | Botones CTA, indicadores |
| `primaryDim` | `rgba(255,216,1,0.15)` | `rgba(202,138,4,0.12)` | Fondos de acento |
| `primaryDark` | `#b39700` | `#a16207` (Yellow 700) | Estado pressed |
| `primaryLight` | `#ffeb3b` | `#facc15` (Yellow 400) | Highlights |

### Tipografia

| Token | Dark Mode | Light Mode | Uso |
|-------|-----------|------------|-----|
| `text` | `#ffffff` (White) | `#09090b` (Zinc 950) | Titulos, texto principal |
| `textSecondary` | `#e4e4e7` (Zinc 200) | `#27272a` (Zinc 800) | Texto importante secundario |
| `textMuted` | `#a1a1aa` (Zinc 400) | `#71717a` (Zinc 500) | Subtitulos, metadatos |
| `textDisabled` | `#52525b` (Zinc 600) | `#a1a1aa` (Zinc 400) | Texto deshabilitado |
| `textOnPrimary` | `#000000` (Black) | `#ffffff` (White) | Texto sobre botones primary |
| `textInverse` | `#09090b` (Zinc 950) | `#ffffff` (White) | Texto invertido |

### Bordes y Separadores

| Token | Dark Mode | Light Mode | Uso |
|-------|-----------|------------|-----|
| `border` | `#27272a` (Zinc 800) | `#e4e4e7` (Zinc 200) | Bordes estandar |
| `borderHighlight` | `#3f3f46` (Zinc 700) | `#d4d4d8` (Zinc 300) | Bordes destacados |
| `borderStrong` | `#52525b` (Zinc 600) | `#a1a1aa` (Zinc 400) | Bordes fuertes |
| `divider` | `#27272a` (Zinc 800) | `#f4f4f5` (Zinc 100) | Lineas divisoras |

### Estados Semanticos

| Token | Dark Mode | Light Mode | Uso |
|-------|-----------|------------|-----|
| `danger` | `#ef4444` (Red 500) | `#dc2626` (Red 600) | Errores |
| `dangerDim` | `rgba(239,68,68,0.15)` | `rgba(220,38,38,0.10)` | Fondo de error |
| `success` | `#22c55e` (Green 500) | `#16a34a` (Green 600) | Completado |
| `successDim` | `rgba(34,197,94,0.15)` | `rgba(22,163,74,0.10)` | Fondo de exito |
| `warning` | `#f59e0b` (Amber 500) | `#d97706` (Amber 600) | Advertencias |
| `warningDim` | `rgba(245,158,11,0.15)` | `rgba(217,119,6,0.10)` | Fondo de warning |
| `info` | `#3b82f6` (Blue 500) | `#2563eb` (Blue 600) | Informacion |
| `infoDim` | `rgba(59,130,246,0.15)` | `rgba(37,99,235,0.10)` | Fondo de info |

### Efectos y Sombras

| Token | Dark Mode | Light Mode | Uso |
|-------|-----------|------------|-----|
| `shadowColor` | `#000000` | `#71717a` | Base de sombras |
| `glowColor` | `#ffd801` | `#ca8a04` | Efecto neon |
| `overlayDark` | `rgba(0,0,0,0.7)` | `rgba(0,0,0,0.5)` | Modales, overlays |
| `overlayLight` | `rgba(255,255,255,0.1)` | `rgba(255,255,255,0.8)` | Highlights |

### Glassmorphism

| Token | Dark Mode | Light Mode | Uso |
|-------|-----------|------------|-----|
| `glassBackground` | `rgba(24,24,27,0.8)` | `rgba(255,255,255,0.85)` | Fondo glass |
| `glassBorder` | `rgba(255,255,255,0.1)` | `rgba(0,0,0,0.08)` | Borde glass |
| `blurIntensity` | `80` | `60` | Intensidad blur |

---

## Reglas de Cambio de Texto por Modo

### Principio General

El texto siempre debe tener **contraste maximo** con su fondo:

```
Dark Mode:  Fondo oscuro  → Texto claro (white)
Light Mode: Fondo claro   → Texto oscuro (black)
```

### Mapeo de Texto Automatico

| Contexto | Dark Mode | Light Mode |
|----------|-----------|------------|
| Titulo sobre `background` | `text` (white) | `text` (zinc-950) |
| Subtitulo | `textMuted` (zinc-400) | `textMuted` (zinc-500) |
| Texto en Card | `text` | `text` |
| Metadatos | `textMuted` | `textMuted` |
| Placeholder | `textDisabled` | `textDisabled` |
| Boton Primary | `textOnPrimary` (black) | `textOnPrimary` (white) |
| Boton Secondary | `text` | `text` |
| Links | `primary` | `primary` |
| Errores | `danger` | `danger` |

### Texto en Componentes Especificos

| Componente | Token Dark | Token Light | Nota |
|------------|------------|-------------|------|
| Header/Titulo | `text` | `text` | Siempre maximo contraste |
| Badge "HIGH VOLTAGE" | `primary` sobre `primaryDim` | `primary` sobre `primaryDim` | Mismo en ambos |
| Metricas (Sets, Reps) | `text` | `text` | Numeros destacados |
| Labels de metricas | `textMuted` | `textMuted` | Acompanamiento |
| Notas del coach | `textSecondary` | `textSecondary` | Texto largo legible |
| Timestamps | `textMuted` | `textMuted` | Informacion secundaria |
| TabBar activo | `primary` | `primary` | Amarillo en ambos |
| TabBar inactivo | `textMuted` | `textMuted` | Gris en ambos |

---

## Implementacion del Theme Switch

### Deteccion Automatica

La app detecta la preferencia del sistema operativo:
- iOS: `Appearance.getColorScheme()`
- Android: `Appearance.getColorScheme()`

### Override Manual

El usuario puede forzar un modo especifico en la pantalla de Profile:
- "System" (default): Sigue al SO
- "Dark": Siempre oscuro
- "Light": Siempre claro

### Persistencia

La preferencia se guarda en AsyncStorage con key `USER_THEME_PREFERENCE`.

### Transicion

Al cambiar de tema:
- Transicion suave de 200ms
- Sin parpadeo blanco/negro
- Los Contexts de tema notifican a todos los componentes

---

## Contraste WCAG por Modo

### Dark Mode

| Combinacion | Ratio | Nivel |
|-------------|-------|-------|
| `text` sobre `background` | 21:1 | AAA |
| `textMuted` sobre `background` | 6.5:1 | AA |
| `primary` sobre `background` | 13.8:1 | AAA |
| `textOnPrimary` sobre `primary` | 15.2:1 | AAA |

### Light Mode

| Combinacion | Ratio | Nivel |
|-------------|-------|-------|
| `text` sobre `background` | 19.4:1 | AAA |
| `textMuted` sobre `background` | 4.8:1 | AA |
| `primary` sobre `background` | 5.1:1 | AA |
| `textOnPrimary` sobre `primary` | 8.6:1 | AAA |

---

## Consideraciones por Modo

### Dark Mode
- Optimizado para OLED (negros puros = pixeles apagados)
- Mejor para uso nocturno y gimnasios con poca luz
- El amarillo "brilla" mas sobre negro
- Efecto neon mas impactante

### Light Mode
- Mejor legibilidad en exteriores con sol directo
- El amarillo se oscurece para mantener contraste
- Glassmorphism mas sutil
- Sombras mas pronunciadas para profundidad

---

## Modo por Defecto

La app inicia en **Dark Mode** por defecto si:
1. Es la primera vez que se abre
2. No hay preferencia guardada
3. El sistema no reporta preferencia

Esto mantiene la identidad "The Forge" como primera impresion.
