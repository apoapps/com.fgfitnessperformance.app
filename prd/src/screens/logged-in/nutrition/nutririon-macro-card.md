# Grafico de Macros (Donut Chart)

## Proposito

Componente visual que muestra los objetivos de macronutrientes del cliente en un formato grafico atractivo y facil de leer. Es el elemento central de la pantalla de nutricion y debe comunicar rapidamente las proporciones de proteina, carbohidratos y grasas.

---

## Tipo de Grafico

**Donut Chart / Anillo**

Un grafico circular con un agujero en el centro donde se muestra el total de calorias. Los segmentos del anillo representan cada macronutriente proporcionalmente.

```
        ╭──────────────╮
       ╱    Carbs       ╲
      │    ┌────────┐    │
      │    │ 3,200  │    │  <- Centro: Calorias
      │    │  KCAL  │    │
      │    └────────┘    │
       ╲   Protein  Fat ╱
        ╰──────────────╯
```

---

## Diseno Visual

### Dimensiones

- Diametro exterior: 200-240px
- Diametro interior (agujero): 60-70% del exterior
- Grosor del anillo: 15-20px

### Colores de Segmentos

Cada macronutriente tiene un color distintivo que sigue la estetica "The Forge":

| Macro | Color | Descripcion |
|-------|-------|-------------|
| Proteina | Azul (`#3b82f6`) | Blue 500 - Construccion muscular |
| Carbohidratos | Verde (`#22c55e`) | Green 500 - Energia |
| Grasas | Amarillo/Dorado (`#ffd801`) | Primary - Reserva energetica |

### Efecto Glow

Cada segmento tiene un **resplandor difuso** detras de su color solido:
- Blur radius: 4-8px
- Opacidad del glow: 40-60%
- El efecto crea sensacion de que cada segmento emite luz

### Centro del Grafico

**Contenido**:
- Numero grande: Total de calorias (ej: "3,200")
- Label pequeño: "KCAL" o "CALORIES"

**Estilo**:
- Numero: Fuente Heading o Mono, grande (32-40px), color `text`
- Label: Fuente Body pequeña, color `textMuted`

---

## Leyenda

Debajo del grafico, una leyenda horizontal muestra los valores exactos de cada macro.

### Layout

```
[●] Protein: 220g   [●] Carbs: 400g   [●] Fat: 80g
```

### Elementos

- Indicador de color: Circulo pequeño (8-10px) del color del segmento
- Label: Nombre del macro
- Valor: Cantidad en gramos con fuente mono

### Variante Vertical

Si el espacio horizontal es limitado, la leyenda puede ser vertical:

```
[●] Protein   220g
[●] Carbs     400g
[●] Fat        80g
```

---

## Calculo de Proporciones

Los segmentos se calculan basados en las calorias aportadas por cada macro:

| Macro | Calorias por gramo |
|-------|-------------------|
| Proteina | 4 kcal/g |
| Carbohidratos | 4 kcal/g |
| Grasas | 9 kcal/g |

### Formula

```
calorias_protein = protein_g * 4
calorias_carbs = carbs_g * 4
calorias_fat = fat_g * 9
total = calorias_protein + calorias_carbs + calorias_fat

porcentaje_protein = calorias_protein / total * 100
porcentaje_carbs = calorias_carbs / total * 100
porcentaje_fat = calorias_fat / total * 100
```

### Ejemplo

Con macros: Proteina 220g, Carbs 400g, Fat 80g

```
calorias_protein = 220 * 4 = 880 kcal
calorias_carbs = 400 * 4 = 1600 kcal
calorias_fat = 80 * 9 = 720 kcal
total = 3200 kcal

porcentaje_protein = 880 / 3200 = 27.5%
porcentaje_carbs = 1600 / 3200 = 50%
porcentaje_fat = 720 / 3200 = 22.5%
```

---

## Implementacion Tecnica

### Libreria Sugerida

**React Native Skia** (`@shopify/react-native-skia`)

Skia permite dibujar graficos de alto rendimiento con efectos avanzados (blur, gradientes) que no son posibles con sombras CSS estandar de React Native.

### Componentes de Skia Utilizados

- `Canvas`: Contenedor principal del grafico
- `Path`: Para dibujar cada arco/segmento
- `BlurMask`: Para el efecto glow detras de segmentos
- `Text`: Para el numero de calorias en el centro

### Logica de Arcos

Cada segmento es un arco SVG calculado a partir de angulos:

```
// Pseudocodigo
startAngle = 0
proteinArc = 0 to (porcentaje_protein * 360)
carbsArc = proteinArc.end to (porcentaje_carbs * 360)
fatArc = carbsArc.end to (porcentaje_fat * 360)
```

Los arcos se dibujan en sentido horario comenzando desde la parte superior (12 o'clock).

---

## Animacion de Entrada

### Descripcion

Al cargar la pantalla de nutricion, el grafico debe animarse:

1. Los segmentos empiezan con tamaño 0
2. Se expanden hasta su porcentaje final
3. Duracion: 600-800ms
4. Easing: ease-out (rapido al inicio, suave al final)

### Implementacion

Usar `Reanimated` para interpolar los valores de angulo de cada segmento desde 0 hasta su valor final.

### Animacion del Centro

El numero de calorias puede:
- Aparecer con fade-in despues de que los segmentos terminen
- O hacer un "count up" desde 0 hasta el valor final

---

## Estados

### Cargando

- Mostrar anillo gris placeholder
- Skeleton shimmer effect
- Centro con placeholder "---"

### Sin Datos

Si `macros` esta vacio o undefined:
- Anillo gris completo sin segmentos
- Centro: "No data" o "---"

### Con Datos

- Grafico completo con colores y glow
- Calorias en el centro
- Leyenda visible

---

## Interaccion (Opcional)

### Tap en Segmento

Al tocar un segmento, mostrar un tooltip o destacar:
- Nombre del macro
- Valor en gramos
- Porcentaje del total

### Implementacion

Detectar taps usando Gesture Handler de Reanimated y calcular en que segmento cayo el punto tocado basado en el angulo.

**Nota**: Esta interaccion es opcional y puede omitirse para simplificar.

---

## Mapeo de Datos

| Elemento | Fuente |
|----------|--------|
| Proteina (g) | `NutritionContext.macros.protein` |
| Carbohidratos (g) | `NutritionContext.macros.carbs` |
| Grasas (g) | `NutritionContext.macros.fat` |
| Calorias (calculadas o directas) | `NutritionContext.macros.calories` |

---

## Rendimiento

### Optimizaciones

- El Canvas de Skia renderiza en un thread separado (no bloquea JS)
- Memoizar el componente para evitar re-renders innecesarios
- Calcular proporciones fuera del render (useMemo)
- Las animaciones corren en el UI thread nativo

### Consideraciones

- El grafico debe ser visible sin lag al navegar a la pantalla
- Si la animacion causa drops de FPS, simplificarla o eliminarla
- Probar en dispositivos de gama baja

---

## Variantes de Tamaño

### Grande (Default)

- Usado en pantalla de nutricion
- Diametro: 200-240px
- Con leyenda completa

### Compacto (Dashboard)

Si se muestra un resumen en el Dashboard:
- Diametro: 80-100px
- Sin leyenda (o leyenda minima)
- Sin animacion de entrada

---

## Accesibilidad

- Incluir `accessibilityLabel` con descripcion textual:
  - "Macros chart: 220 grams protein (27%), 400 grams carbs (50%), 80 grams fat (22%), total 3200 calories"
- La leyenda textual sirve como alternativa para screen readers
- Colores elegidos tienen suficiente distincion para daltonismo comun (protanopia, deuteranopia)
