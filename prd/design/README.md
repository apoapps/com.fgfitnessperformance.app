# Diseños de FG Fitness Performance - Light Mode

Archivos de diseño `.pen` (Pencil.dev) de las pantallas principales de la app en modo claro.

## Sistema de Diseño - Light Mode

### Colores

```
background:   #fafafa  (Zinc 50)
surface:      #ffffff  (White)
primary:      #ca8a04  (Yellow 600)
text:         #09090b  (Zinc 950)
textMuted:    #71717a  (Zinc 500)
border:       #e4e4e7  (Zinc 200)
danger:       #ef4444  (Red 500)
success:      #22c55e  (Green 500)

Macros:
  Proteína:   #3b82f6  (Blue 500)
  Carbos:     #22c55e  (Green 500)
  Grasas:     #ca8a04  (Yellow 600)
```

### Tipografía

- **Heading**: Oswald (Bold/ExtraBold) - Siempre en MAYÚSCULAS
- **Body**: Inter (Regular/Medium/SemiBold)
- **Mono**: JetBrains Mono (para números, timers)

## Archivos de Diseño

### 01-login-light.pen
**Pantalla de Inicio de Sesión**
- Logo horizontal (negro para light mode)
- Card con formulario de login
- Input de email y contraseña
- Botón primario amarillo (#ca8a04)
- Texto de ayuda para contraseña olvidada
- Footer con copyright

**Dimensiones**: 390x844 (iPhone 12/13/14 Pro)

---

### 02-dashboard-light.pen
**El Hub - Dashboard Principal**
- Header con saludo personalizado y botón de chat
- Badge de notificaciones no leídas (rojo)
- 3 Quick Actions (Entreno, Nutrición, Perfil)
- Card de "Próximo Entrenamiento" con:
  - Badge "HOY" amarillo
  - Día y semana actual
  - Nombre del workout
  - Objetivo del día
  - Número de bloques
  - Botón "INICIAR"
- TabBar flotante en la parte inferior

**Interacciones**:
- Tap en Quick Actions navega a sección
- Tap en card de workout navega a entrenamiento
- Badge de chat muestra número de mensajes no leídos

---

### 03-workout-light.pen
**Pantalla de Entrenamiento**
- Header con mini-logo y título del plan
- Subtítulo con objetivo del plan
- Selector horizontal de días (1-7+)
  - Día actual resaltado en amarillo
  - Días pasados/futuros en gris
- Card de objetivo del día (fondo amarillo claro)
- Bloques de entrenamiento (A, B, C...)
  - Badge circular con letra del bloque
  - Nombre del bloque
  - Lista de ejercicios con:
    - Nombre del ejercicio
    - Series, reps, peso/RPE, descanso
- TabBar flotante

**Variaciones**:
- Día de descanso: Card especial con checkmark verde
- Día sin workout: Estado vacío

---

### 04-nutrition-light.pen
**Pantalla de Nutrición**
- Header "FG NUTRITION PLAN" con mini-logo
- Card de macros con donut chart:
  - Centro: calorías totales
  - Anillo: distribución de macros (colores diferenciados)
  - Stats debajo: Proteína (azul), Carbos (verde), Grasas (amarillo)
  - Cada stat muestra: cantidad en gramos y porcentaje
- Card de objetivo de agua:
  - Ícono de gota
  - Texto descriptivo
  - Cantidad en litros
- Sección "COMIDAS DEL DÍA":
  - Cards de comidas con:
    - Badge de hora (amarillo)
    - Nombre de la comida
    - Lista de alimentos
    - Macros de la comida (P/C/G/kcal)
- TabBar flotante

**Elementos visuales**:
- Donut chart con gradiente en anillo
- Colores diferenciados para cada macro
- Time badges amarillos consistentes

---

## Elementos Comunes

### TabBar Flotante
- Posición: Absoluta, bottom: 20px
- Fondo blanco con border gris claro
- Border radius: 30px
- Shadow sutil
- 4 tabs: Dashboard, Workout, Nutrition, Profile
- Tab activo en amarillo (#ca8a04)
- Tabs inactivos en gris (#71717a)

### Cards
- Background: #ffffff
- Border radius: 12-16px
- Border: 1px solid #e4e4e7
- Shadow: rgba(0,0,0,0.05) 0px 4px 10px

### Badges
- Border radius: 8px
- Padding: 4px 10px
- Background amarillo para elementos activos
- Tipografía Inter Semi-Bold

### Botones Primarios
- Background: #ca8a04
- Color: #fafafa (casi blanco)
- Tipografía: Inter Semi-Bold o Oswald Bold
- Border radius: 12-20px

## Notas de Implementación

1. **Responsividad**: Los diseños están optimizados para 390px de ancho (iPhone estándar), pero deben adaptarse a diferentes tamaños
2. **Fuentes**: Usar expo-font para cargar Oswald e Inter
3. **Espaciado**: Usar sistema de 4px (4, 8, 12, 16, 20, 24...)
4. **Accesibilidad**:
   - Contraste mínimo 4.5:1 para texto normal
   - Touch targets mínimo 44x44px
5. **Performance**:
   - Lazy load de imágenes
   - Virtualized lists para días/ejercicios largos

## Visualización

Para visualizar estos archivos, usa la extensión de Pencil.dev en tu editor o importa en pencil.dev.

---

**Filosofía de Diseño**: "Turn Pain Into Power" - Eliminar toda fricción, interfaz clara y directa, énfasis en la acción.
