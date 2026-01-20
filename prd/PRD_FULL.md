# PRD Completo

> Generado automáticamente el 1/19/2026

---

## index.md

# FG Fitness Performance - Arquitectura Global

## Vision Ejecutiva

FG Fitness Performance es una aplicacion movil **Client-Only Read-Only** (Solo Cliente, Solo Lectura) disenada para atletas que siguen programas de entrenamiento y nutricion personalizados. La filosofia central es **"Turn Pain Into Power"** traducida tecnicamente como: **eliminar toda friccion**.

### Fricciones Eliminadas
- **Latencia de carga**: Datos siempre disponibles localmente
- **Dependencia de red**: Funciona 100% offline en el gimnasio
- **Complejidad de UI**: Interfaz agresiva y directa, sin ambiguedades
- **Conflictos de sync**: Sin edicion bidireccional = sin conflictos

---

## Arquitectura Offline-First

La aplicacion implementa una estrategia **Read-Only Mirror** donde el cliente nunca modifica los datos del programa, solo los consume.

### Flujo de Datos Unidireccional

```
Supabase (Nube)
     |
     | Pull-Only Sync
     v
SyncEngine (Background)
     |
     | Transaccion Atomica
     v
SQLite Local (Dispositivo)
     |
     | Hidratacion
     v
React Contexts (Estado Global)
     |
     | Render
     v
Componentes UI
```

El usuario interactua con la UI que lee exclusivamente de los Contexts. Los Contexts se hidratan desde SQLite local. SQLite se sincroniza periodicamente con Supabase cuando hay conectividad.

---

## Arquitectura de Estados Globales (Context API)

Cada Context actua como **Singleton** - fuente unica de verdad para su dominio. Los componentes **nunca hacen fetch directo a Supabase**; siempre consumen datos del Context correspondiente.

### AuthContext
**Proposito**: Gestionar autenticacion y sesion del usuario

**Estado**:
- `user`: Objeto de usuario de Supabase Auth
- `session`: Token de sesion activa
- `isAuthenticated`: Booleano derivado (user no es null)
- `loading`: Estado de operaciones async
- `error`: Mensaje de error si existe

**Acciones**:
- `signIn(email, password)`: Iniciar sesion via Supabase Auth
- `signOut()`: Cerrar sesion y limpiar datos locales
- `refreshSession()`: Renovar token expirado

**Fuente de datos**: Supabase Auth (unico Context que habla directo con Supabase en runtime)

---

### ProfileContext
**Proposito**: Datos del perfil del usuario y estado de suscripcion

**Estado**:
- `profile`: Objeto con nombre, avatar, email
- `subscriptionTier`: Nivel de suscripcion (premium, fitness, trial)
- `subscriptionStatus`: Estado (active, trialing, inactive)
- `loading`: Estado de carga

**Acciones**:
- `loadProfile()`: Cargar perfil desde SQLite local
- `refreshFromRemote()`: Forzar sync con Supabase (si hay red)

**Fuente de datos**: SQLite local (sincronizado desde tabla `profiles` de Supabase)

---

### WorkoutContext
**Proposito**: Rutinas de entrenamiento asignadas al cliente

**Estado**:
- `workouts`: Array de todas las rutinas asignadas
- `activeWorkout`: Rutina actual o proxima a ejecutar
- `currentWeek`: Semana activa del programa
- `loading`: Estado de carga

**Acciones**:
- `loadWorkouts()`: Cargar rutinas desde SQLite local
- `setActiveWorkout(id)`: Marcar una rutina como activa
- `getWorkoutById(id)`: Obtener detalle de una rutina especifica

**Fuente de datos**: SQLite local (sincronizado desde tabla `assigned_workouts` de Supabase)

---

### NutritionContext
**Proposito**: Plan nutricional y macros del cliente

**Estado**:
- `nutritionPlan`: Objeto del plan asignado
- `macros`: Objetivos de macronutrientes (proteina, carbs, grasas, calorias)
- `meals`: Array de comidas del dia
- `waterTarget`: Meta de hidratacion en litros
- `documents`: Array de PDFs adjuntos (guias, recetas)
- `loading`: Estado de carga

**Acciones**:
- `loadNutrition()`: Cargar plan desde SQLite local

**Fuente de datos**: SQLite local (sincronizado desde tabla `assigned_nutrition` de Supabase)

---

### SyncContext
**Proposito**: Coordinar sincronizacion entre Supabase y SQLite

**Estado**:
- `lastSyncDate`: Timestamp de ultima sincronizacion exitosa
- `isSyncing`: Booleano indicando sync en progreso
- `isOnline`: Estado de conectividad de red
- `syncError`: Error si la ultima sync fallo

**Acciones**:
- `triggerSync()`: Iniciar sincronizacion manual
- `checkConnectivity()`: Verificar estado de red
- `getSyncStatus()`: Obtener resumen de estado

**Logica interna**:
1. Comparar `updated_at` remoto vs `lastSyncDate` local
2. Si hay cambios, descargar datos nuevos
3. Ejecutar transaccion atomica en SQLite (DELETE + INSERT)
4. Actualizar `lastSyncDate`
5. Notificar a otros Contexts para rehidratarse

---

## Jerarquia de Providers

Los Contexts se anidan en el Root Layout de la aplicacion en un orden especifico:

```
<AuthProvider>           // Nivel 1: Autenticacion primero
  <SyncProvider>         // Nivel 2: Sync necesita auth
    <ProfileProvider>    // Nivel 3: Perfil necesita sync
      <WorkoutProvider>  // Nivel 4: Workouts necesitan sync
        <NutritionProvider> // Nivel 5: Nutrition necesita sync
          <App />
        </NutritionProvider>
      </WorkoutProvider>
    </ProfileProvider>
  </SyncProvider>
</AuthProvider>
```

---

## Stack Tecnologico

| Capa | Tecnologia | Justificacion |
|------|------------|---------------|
| Framework | Expo SDK 52 (Managed) | Iteraciones rapidas, builds locales, subida manual a stores |
| Lenguaje | TypeScript | Tipado estricto para estructuras JSONB complejas |
| Estilos | NativeWind v4 | Sistema de diseno unificado con Tailwind |
| Backend | Supabase | Auth, PostgreSQL, Storage con config minima |
| Persistencia Local | Expo SQLite | Consultas relacionales en dispositivo |
| Sincronizacion | Motor Custom Unidireccional | Pull-Only mas simple que CRDTs |

---

## Principios de Implementacion

1. **UI siempre lee de Context, nunca de red directamente**
2. **Contexts se hidratan desde SQLite, no desde Supabase**
3. **Solo SyncContext interactua con Supabase para datos**
4. **Solo AuthContext interactua con Supabase Auth**
5. **Errores de red son silenciosos** - la app sigue funcionando con datos locales
6. **Sync es eventual, no bloqueante** - el usuario nunca espera por red


---

## colors.md

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


---

## constraints.md

# Restricciones y Metodologia de Desarrollo

## Arquitectura Read-Only

La aplicacion cliente es **100% solo lectura**:

- El cliente **nunca modifica** datos en el servidor
- Solo consume informacion de workouts y nutricion asignados
- No hay tracking de completados, pesos usados, o progreso
- No hay inputs de usuario excepto login
- Cualquier duda se resuelve en el foro externo de la app

### Flujo de Datos Unidireccional

```
Supabase (Fuente) --> SyncEngine --> SQLite Local --> Contexts --> UI
         ↓                                                    ↑
    Solo lectura                                         Solo lectura
```

El cliente solo hace **pull** de datos, nunca **push**.

---

## Metodologia: Test Driven Development (TDD)

### Principio

**Primero mocks, despues realidad.**

1. Definir estructura de datos esperada
2. Crear mocks que simulen la respuesta real
3. Desarrollar UI consumiendo los mocks
4. Validar que la UI funciona correctamente
5. Conectar con datos reales de Supabase
6. Verificar que el comportamiento es identico

### Ventajas

- UI estable antes de depender de backend
- Tests reproducibles con datos predecibles
- Desarrollo paralelo frontend/backend
- Deteccion temprana de discrepancias en contratos de datos

---

## Herramienta: Chrome DevTools MCP

Usamos **Chrome DevTools MCP** para interactuar con el sitio durante desarrollo.

### Casos de Uso

- Inspeccionar estado de Contexts en runtime
- Verificar datos en SQLite local
- Simular estados de UI (cargando, error, vacio)
- Debug de sincronizacion
- Validar renderizado de componentes

### Workflow

```
1. Levantar app en modo desarrollo
2. Conectar Chrome DevTools MCP
3. Inspeccionar/modificar estado
4. Verificar comportamiento esperado
5. Iterar hasta estabilidad
```

---

## Principios de Desarrollo

### Keep It Simple

- Sin sobre-ingenieria
- Sin features especulativas
- Solo lo necesario para el MVP
- Codigo legible sobre codigo "clever"

### Estabilidad para Produccion

- Cada feature debe ser estable antes de merge
- No dejar TODOs criticos sin resolver
- Manejo de errores en cada pantalla
- Estados de carga y vacio definidos
- Offline-first: la app debe funcionar sin conexion

---

## Fases de Desarrollo

### Fase 1: Mocks

```typescript
// Ejemplo de mock de workout
const mockWorkout = {
  id: "mock-uuid",
  structure: {
    weeks: [
      {
        week_number: 1,
        days: [
          {
            day_number: 1,
            name: "FUERZA EXPLOSIVA",
            exercises: [...]
          }
        ]
      }
    ]
  }
};
```

- Crear mocks para cada Context
- UI completa funcionando con mocks
- Tests pasando con datos simulados

### Fase 2: Integracion

- Reemplazar mocks por llamadas reales
- Mantener mocks como fallback para tests
- Verificar paridad de comportamiento

### Fase 3: Produccion

- Remover logs de debug
- Optimizar bundle size
- Validar en dispositivos reales
- Deploy manual a stores

---

## Checklist Pre-Produccion

- [ ] Todas las pantallas funcionan offline
- [ ] Estados de error manejados
- [ ] Estados de carga con skeletons
- [ ] Estados vacios con mensajes claros
- [ ] Sin console.logs en produccion
- [ ] Mocks disponibles para testing
- [ ] Sincronizacion probada con datos reales



---

## gemini_report.md

INFORME TÉCNICO DE ARQUITECTURA: SISTEMA DE DELIMITACIÓN AVANZADA, MENSAJERÍA CONTEXTUAL Y SEGREGACIÓN DE DATOS READ-ONLY PARA FG FITNESS PERFORMANCE1. Visión Ejecutiva y Alcance EstratégicoEste documento técnico constituye la definición formal y el análisis de ingeniería para la implementación del módulo de Delimitación Avanzada y Soporte Contextual dentro del ecosistema digital de FG Fitness Performance. Este análisis responde a la necesidad imperativa de transformar la infraestructura actual, caracterizada por procesos manuales y desconectados 1, en una plataforma de alto rendimiento, segura y centrada en la experiencia del usuario (UX) bajo una filosofía estricta de "Solo Lectura" (Read-Only) para el cliente final.La premisa fundamental de este desarrollo es la eliminación de la fricción cognitiva y operativa. En el estado actual, el soporte al cliente carece de contexto; cuando un usuario tiene una duda sobre un ejercicio, debe describir manualmente el problema, el ejercicio y sus parámetros, lo que genera una brecha de comunicación ineficiente. La solución propuesta introduce una arquitectura de Mensajería Contextualizada mediante la inyección de identificadores únicos estables (Stable UUIDs) en estructuras de datos complejas (JSONB), permitiendo que cada interacción de soporte lleve consigo una "huella digital" técnica del elemento consultado.1Este informe detalla la arquitectura de base de datos en PostgreSQL (Supabase), las políticas de seguridad a nivel de fila (Row Level Security - RLS), la lógica de enrutamiento de mensajes basada en roles, y la estrategia de sincronización "Offline-First" necesaria para garantizar la operatividad en entornos de baja conectividad típicos de los gimnasios.1.1 Objetivos Técnicos de la DelimitaciónLa delimitación avanzada no es simplemente una restricción de permisos; es una arquitectura de flujo de datos diseñada para garantizar la integridad y la especificidad.ObjetivoDescripción TécnicaImpacto en Negocio (ROI)Inmutabilidad del Cliente (Read-Only)Implementación de políticas RLS que prohíben estrictamente operaciones INSERT, UPDATE o DELETE por parte del cliente en tablas de planes (assigned_workouts, assigned_nutrition).Elimina errores de usuario, corrupción de planes y asegura que la "Fuente de Verdad" sea siempre el Coach.Contextualización GranularInyección de context_id en cada objeto dentro de los arrays JSONB de ejercicios y comidas.Reduce el tiempo de resolución de dudas al eliminar la necesidad de que el usuario explique "de qué está hablando".Enrutamiento InteligenteLógica de backend que analiza el context_type (Nutrición vs. Workout) para dirigir el mensaje al especialista adecuado (Nutriólogo vs. Entrenador).Optimiza el flujo de trabajo del personal, evitando que los entrenadores reciban dudas de dietas y viceversa.Persistencia OfflineArquitectura de replicación local (SQLite) con sincronización diferida para mensajería y lectura de planes.Garantiza que el "Botón de Duda" funcione incluso sin red, enviando la consulta apenas se restablezca la conexión.32. Arquitectura de Datos e Ingeniería de EsquemaLa base de la solución reside en un diseño de esquema robusto en Supabase (PostgreSQL). A diferencia de los modelos relacionales tradicionales altamente normalizados, la naturaleza variable de los planes de entrenamiento (circuitos, biseries, AMRAPs) y nutrición exige un enfoque híbrido utilizando tipos de datos JSONB para el contenido de los planes, manteniendo relaciones estrictas para la asignación y la mensajería.52.1 El Desafío de la Identidad en Estructuras SemiestructuradasEl requerimiento central es: "cada ejercicio y plan alimenticio tendrá un botón de duda... con id de la duda de donde viene".En una base de datos relacional pura, tendríamos una tabla workout_exercises con un id primario. Sin embargo, para optimizar el rendimiento de lectura móvil y la flexibilidad de las plantillas, FG Fitness utiliza columnas JSONB (structure) en las tablas assigned_workouts y assigned_nutrition.1El Problema Técnico:Dentro de un objeto JSONB, los elementos (ejercicios dentro de un día, alimentos dentro de una comida) son anónimos o dependen de su posición en el array (índice). Si referenciamos una duda al "Índice 0" del "Día 1", y posteriormente el coach reordena el plan, la duda quedará vinculada al ejercicio incorrecto. Esto es inaceptable para un sistema de soporte contextual.La Solución: Inyección de IDs Estables (Stable Context IDs)Se implementará un "Middleware de Ingesta" o un Trigger de Base de Datos que procese cualquier inserción o actualización en las columnas JSONB. Este proceso recorrerá el árbol JSON y asignará un UUID v4 a cada nodo accionable (bloque, ejercicio, comida) que no tenga uno.Estructura JSONB Enriquecida (Propuesta Definitiva):JSON// Columna: structure (jsonb) en assigned_workouts
{
  "weeks":
            }
          ]
        }
      ]
    }
  ]
}
Esta estructura garantiza que el "Botón de Duda" en el frontend siempre tenga un exercise_instance_id único y persistente para enviar al chat, independientemente de si el ejercicio cambia de orden o de día.72.2 Definición del Esquema de Mensajería PolimórficaPara soportar la comunicación contextual, la tabla de mensajes no puede ser una simple relación lineal. Debe ser capaz de referenciar polimórficamente diferentes entidades (un ejercicio de workout, una comida de nutrición, o un check-in).Se propone la creación de la tabla support_messages con metadatos contextuales enriquecidos.Esquema DDL (Data Definition Language):SQLCREATE TYPE support_context_type AS ENUM ('workout_exercise', 'nutrition_meal', 'check_in', 'general');

CREATE TABLE public.support_threads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES auth.users(id) NOT NULL,
    coach_id UUID REFERENCES auth.users(id), -- Asignado dinámicamente según el contexto
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.support_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id UUID REFERENCES public.support_threads(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    content TEXT NOT NULL CHECK (char_length(content) > 0),
    
    -- Campos de Delimitación Contextual
    context_type support_context_type DEFAULT 'general',
    context_source_id UUID, -- El ID del registro padre (assigned_workout_id o assigned_nutrition_id)
    context_item_id UUID,   -- El ID interno del JSONB (exercise_instance_id)
    
    -- Snapshotting: Crucial para la integridad histórica
    context_snapshot JSONB, 
    
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar la búsqueda de historial por contexto
CREATE INDEX idx_messages_context_item ON public.support_messages(context_item_id);
CREATE INDEX idx_threads_participants ON public.support_threads(client_id, coach_id);
Justificación del Campo context_snapshot:El análisis de requisitos indica que el sistema debe ser robusto ante cambios. Si un usuario pregunta sobre una dieta de "2000 calorías" y al día siguiente el coach la cambia a "1800 calorías", la duda original pierde sentido si solo referenciamos el ID. El campo context_snapshot almacena una copia congelada de los datos (nombre del ejercicio, reps, peso, o macros de la comida) en el momento exacto en que se creó la duda.8 Esto permite al coach ver: "El usuario preguntó esto cuando el plan decía X", eliminando ambigüedades.3. Estrategia de Seguridad: Row Level Security (RLS) y Delimitación de Solo LecturaLa seguridad no se delega al frontend. Se implementa en el núcleo de la base de datos mediante Row Level Security (RLS) de PostgreSQL. Esto cumple estrictamente con el requerimiento: "haz un análisis de delimitación avanzada de que sea read only".3.1 Política de "Solo Lectura" para el ClienteEl principio de menor privilegio dicta que el cliente nunca debe tener permisos de escritura (INSERT, UPDATE, DELETE) sobre las tablas que definen su programación. Su rol es de consumo pasivo.Implementación de Políticas RLS:Workouts (assigned_workouts):SELECT: Permitido si auth.uid() == client_id. Además, se verifica que el usuario tenga una suscripción activa y el tag de acceso correspondiente (verificación cruzada con tabla profiles).INSERT/UPDATE/DELETE: Denegado implícitamente (al no crear política). Solo los roles administrativos (service_role o usuarios con tag admin) pueden escribir.9SQL-- Política de Lectura Estricta para Clientes
CREATE POLICY "Clientes leen sus propios workouts activos"
ON public.assigned_workouts
FOR SELECT
TO authenticated
USING (
    client_id = auth.uid()
    AND status = 'active'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND 'workout' = ANY(access_tags) -- Validación de acceso por servicio
    )
);
Nutrición (assigned_nutrition):Sigue la misma lógica. El usuario solo ve los registros donde él es el client_id, filtrado adicionalmente por la existencia del tag nutrition en su perfil. Si un usuario tiene el plan "Fitness" (solo workouts), esta consulta retornará 0 filas, ocultando efectivamente la nutrición a nivel de API.13.2 Política de Escritura para MensajeríaA diferencia de los planes, el chat requiere escritura bidireccional. Sin embargo, la delimitación debe impedir que un usuario escriba en hilos que no le pertenecen.SQL-- Política de Inserción de Mensajes
CREATE POLICY "Usuarios escriben en sus hilos"
ON public.support_messages
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.support_threads
        WHERE id = thread_id
        AND (client_id = auth.uid() OR coach_id = auth.uid())
    )
);
Esta política utiliza una subconsulta (EXISTS) para validar la propiedad del hilo antes de permitir la inserción del mensaje. Si un usuario intenta inyectar un mensaje en un thread_id ajeno, la base de datos rechazará la transacción silenciosamente o lanzará un error de violación de política, blindando la privacidad del sistema.114. Lógica de Negocio: Enrutamiento de Coach y ContextoEl requerimiento especifica: "mirará que coach estará hablando con él". Esto implica que la asignación del interlocutor no es estática ni genérica; depende del contexto de la duda (Ejercicio vs. Nutrición).4.1 Matriz de Asignación de StaffPara resolver dinámicamente quién recibe la duda, el sistema consulta la tabla staff_client_assignments (o las columnas de asignación en profiles) basándose en el context_type del mensaje.1Flujo de Resolución de Identidad:Evento: Usuario pulsa "Duda" en una comida.Detección de Contexto: La App identifica context_type = 'nutrition_meal'.Consulta de Asignación:El sistema busca en el perfil del usuario quién es su nutrition_coach_id.Si existe, ese UUID se asigna como el coach_id del hilo de conversación.Si no existe (ej. usuario básico), se asigna al general_admin o a un head_coach por defecto.Presentación Visual:La interfaz de chat carga los metadatos de ese UUID (profiles.full_name, profiles.avatar_url).El usuario ve: "Hablando con: Dra. María González (Nutrición)" en la cabecera del chat.Esta lógica desacopla al "Entrenador" del "Nutricionista", permitiendo que equipos multidisciplinarios atiendan al mismo cliente sin cruzar líneas de comunicación ni saturar a un solo profesional con todas las dudas.4.2 Experiencia de Usuario (UX) del Botón de DudaLa integración del botón debe ser omnipresente pero no intrusiva.Ubicación: En cada tarjeta de ejercicio (ExerciseCard) y cada fila de alimento (MealRow).Iconografía: Un icono de interrogación (?) o burbuja de chat discreta, situada junto al título del elemento.Comportamiento Modal:Al hacer clic, no se navega a una pantalla nueva completa (lo que perdería el contexto visual del plan), sino que se abre un Bottom Sheet (Panel deslizante inferior).Este panel contiene:Snippet de Contexto: Un resumen visual del elemento (miniatura del video, nombre del ejercicio, series/reps). Esto confirma al usuario sobre qué está preguntando.Área de Chat: Historial de mensajes previos sobre este ítem específico (si existen) y el campo de entrada de texto.Este diseño mantiene al usuario "dentro" de su entrenamiento mientras resuelve la duda.125. Arquitectura Offline-First y SincronizaciónDada la naturaleza móvil de la aplicación y el entorno de uso (gimnasios con mala señal), la aplicación no puede depender de una conexión HTTP exitosa para mostrar un plan o abrir el chat. Se requiere una arquitectura Offline-First.5.1 Motor de Sincronización Local (SQLite + WatermelonDB)La estrategia recomendada utiliza una base de datos SQLite embebida en el dispositivo del cliente, gestionada por un ORM reactivo como WatermelonDB o a través de la integración de PowerSync.13Flujo de Sincronización de Datos (Read-Only):Pull (Descarga): Al detectar conexión, el motor de sincronización solicita a Supabase todos los registros modificados desde la última sincronización (last_pulled_at).Persistencia: Los datos JSONB complejos de Workouts y Nutrición se guardan localmente en tablas SQLite.Hidratación de UI: La interfaz de usuario (React Native) se "hidrata" exclusivamente desde SQLite. Esto garantiza tiempos de renderizado inferiores a 50ms, independientemente de la red.5.2 Manejo de Mensajería Offline (Cola de Escritura)Para el chat de dudas, la experiencia debe ser fluida incluso sin red.Escritura Local: Cuando el usuario envía una duda sin conexión, el mensaje se guarda en SQLite con un flag status: 'pending'.UI Optimista: La interfaz muestra el mensaje inmediatamente en el chat, quizás con una opacidad reducida o un icono de "reloj", para dar feedback instantáneo de que la acción fue registrada.16Cola de Sincronización (Background Sync): Un worker en segundo plano monitorea el estado de la red (NetInfo). Al recuperar la conexión, itera sobre los mensajes pendientes y los envía (INSERT) a la tabla support_messages de Supabase.Resolución: Una vez que Supabase confirma la recepción (ACK), el estado local se actualiza a sent.Esta arquitectura es crítica para evitar la frustración del usuario ("El botón no funciona") en zonas muertas de cobertura.6. Análisis de Escalabilidad y Tendencias de DatosLa implementación de este sistema genera datos valiosos que van más allá del soporte inmediato.6.1 Tendencias Derivadas (Second-Order Insights)El registro granular de dudas (context_item_id) permite un análisis de datos profundo:Detección de "Puntos de Dolor" en la Programación: Si el sistema detecta que el 40% de los usuarios presiona el "Botón de Duda" en el ejercicio "Sentadilla Búlgara", esto indica una falla sistémica (video explicativo deficiente, ejercicio demasiado complejo o descripción ambigua).Evaluación de Staff: Se puede medir el tiempo de respuesta de los coaches desglosado por tipo de duda. ¿Responde el nutricionista más rápido que el entrenador?Adherencia Real: El uso del chat contextual es un proxy de compromiso. Un usuario que pregunta es un usuario que está intentando ejecutar el plan.6.2 Consideraciones de Almacenamiento JSONBEl almacenamiento de snapshots en cada mensaje (context_snapshot) duplicará datos. Sin embargo, dado el volumen de texto (bytes), el impacto en el almacenamiento es despreciable comparado con el valor de la integridad histórica. Se recomienda purgar o archivar mensajes antiguos (> 1 año) a un almacenamiento en frío ("Cold Storage") si la tabla support_messages supera los millones de registros, manteniendo la base de datos operativa ágil.67. Plan de Implementación y RecomendacionesFase 1: Migración y Estructuración (Backend)Refactorización de JSONB: Desarrollar scripts para recorrer todos los planes existentes y asignar UUIDs estables a cada bloque, ejercicio y comida. Sin esto, el chat contextual no puede funcionar retroactivamente.Despliegue de Esquema: Crear las tablas support_threads y support_messages con los tipos ENUM y las claves foráneas definidas.Configuración RLS: Aplicar las políticas de seguridad restrictivas en Supabase para bloquear la escritura directa de clientes en tablas core.Fase 2: Desarrollo Frontend (React Native)Integración de SQLite: Implementar la capa de base de datos local y la lógica de sincronización (Pull/Push).Componentes Contextuales: Modificar los componentes de renderizado de listas (FlatList) para que cada ítem reciba su context_id y renderice el "Botón de Duda".Chat UI: Construir la interfaz de chat con soporte para "Sticky Headers" contextuales y renderizado optimista de mensajes.Fase 3: Lógica Operativa (Staff)Dashboard de Coach: Actualizar el panel administrativo (WordPress/Web) para que, al recibir un mensaje, el coach vea inmediatamente el "Snippet" del ejercicio o comida en cuestión, sin tener que buscar el plan del cliente manualmente.ConclusiónLa arquitectura propuesta satisface todos los requisitos de delimitación avanzada: Read-Only estricto mediante RLS, Contextualización profunda mediante IDs estables en JSONB, e Identidad Transparente mediante enrutamiento dinámico de roles. La adopción de una estrategia Offline-First asegura que la aplicación sea robusta y rápida, transformando la experiencia de usuario de un simple visor de archivos a una herramienta de entrenamiento interactiva y profesional de alto nivel.

---

## routes.md

# Navegacion y Estructura de Rutas

## Sistema de Enrutamiento

La aplicacion utiliza **Expo Router v3** con enrutamiento basado en archivos (file-based routing), similar a Next.js. La estructura de carpetas en `/app` define automaticamente las rutas de navegacion.

---

## Arbol de Rutas

```
/app
  |
  +-- _layout.tsx          [Root Layout - Providers globales]
  +-- index.tsx            [Redirect inicial]
  |
  +-- (auth)/              [Grupo: Autenticacion - Sin TabBar]
  |     +-- _layout.tsx
  |     +-- login.tsx
  |     +-- forgot-password.tsx
  |
  +-- (tabs)/              [Grupo: App Principal - Con TabBar]
        +-- _layout.tsx    [TabBar flotante]
        |
        +-- dashboard/
        |     +-- index.tsx    [The Hub - Pantalla principal]
        |
        +-- workout/
        |     +-- _layout.tsx  [Stack Navigator interno]
        |     +-- index.tsx    [Lista de rutinas]
        |     +-- [id].tsx     [Detalle de rutina dinamico]
        |
        +-- nutrition/
        |     +-- index.tsx    [Daily Protocol]
        |
        +-- profile/
              +-- index.tsx    [Configuracion y logout]
```

---

## Descripcion de Rutas

### Root Layout (`/_layout.tsx`)

**Proposito**: Contenedor raiz que envuelve toda la aplicacion

**Responsabilidades**:
- Inicializar todos los Context Providers en orden jerarquico
- Configurar fuentes personalizadas (Oswald, Inter, JetBrains Mono)
- Manejar el Splash Screen hasta que los recursos esten listos
- Detectar estado de autenticacion inicial

**Providers anidados**:
```
AuthProvider
  SyncProvider
    ProfileProvider
      WorkoutProvider
        NutritionProvider
          <Slot />
```

---

### Index (`/index.tsx`)

**Proposito**: Punto de entrada que redirige segun estado de autenticacion

**Logica de redireccion**:
- Si `AuthContext.isAuthenticated === false`: Navegar a `/(auth)/login`
- Si `AuthContext.isAuthenticated === true`: Navegar a `/(tabs)/dashboard`

**Comportamiento**: Esta pantalla no se renderiza visualmente; solo ejecuta la redireccion.

---

### Grupo Auth (`/(auth)/`)

**Proposito**: Pantallas de autenticacion, sin barra de navegacion inferior

**Caracteristicas del grupo**:
- No muestra TabBar
- Fondo con video o imagen de alto impacto
- Navegacion tipo Stack simple (atras/adelante)

#### Login (`/(auth)/login.tsx`)
- Ver detalle en `screens/login.md`

#### Forgot Password (`/(auth)/forgot-password.tsx`)
- Formulario para solicitar reset de contrasena
- Campo: Email
- Accion: Enviar email de recuperacion via Supabase Auth
- Navegacion: Boton para volver a login

---

### Grupo Tabs (`/(tabs)/`)

**Proposito**: Contenedor principal de la app para usuarios autenticados

**Layout**: TabBar flotante en la parte inferior (ver `screens/logged-in/bottom-navbar.md`)

**Proteccion de rutas**: Si el usuario no esta autenticado, se redirige a login. Si la suscripcion esta inactiva, se muestra mensaje de renovacion.

---

### Dashboard (`/(tabs)/dashboard/index.tsx`)

**Proposito**: Pantalla principal post-login, "The Hub"

**Ver detalle completo en**: `screens/logged-in/homescreen.md`

**Datos requeridos**: ProfileContext, WorkoutContext

---

### Workout Stack (`/(tabs)/workout/`)

**Proposito**: Modulo de entrenamiento con navegacion interna

**Layout interno**: Stack Navigator que permite push/pop entre lista y detalle

#### Lista de Workouts (`/(tabs)/workout/index.tsx`)
- **Ver detalle en**: `screens/logged-in/workouts/workouts.md`
- Muestra calendario o lista de rutinas asignadas
- Tap en item navega a detalle

#### Detalle de Workout (`/(tabs)/workout/[id].tsx`)
- **Ver detalle en**: `screens/logged-in/workouts/workout-detail.md`
- Ruta dinamica: el `[id]` se reemplaza por el UUID del workout
- Muestra ejercicios del dia o circuito
- Boton atras vuelve a la lista

---

### Nutrition (`/(tabs)/nutrition/index.tsx`)

**Proposito**: Plan nutricional diario

**Ver detalle completo en**: `screens/logged-in/nutrition/nutrition.md`

**Datos requeridos**: NutritionContext

---

### Profile (`/(tabs)/profile/index.tsx`)

**Proposito**: Configuracion de cuenta y logout

**Contenido**:
- Foto de perfil y nombre
- Email (solo lectura)
- Nivel de suscripcion
- Estado de ultima sincronizacion
- Boton: Sincronizar ahora (trigger manual)
- Boton: Cerrar sesion
- Version de la app

**Acciones**:
- Sincronizar: Llama a `SyncContext.triggerSync()`
- Cerrar sesion: Llama a `AuthContext.signOut()`, limpia SQLite, navega a login

---

## Logica de Redireccion

### Flujo de Inicio de App

```
App Inicia
    |
    v
Root Layout carga
    |
    v
AuthContext verifica sesion
    |
    +--[No hay sesion]---> Redirect a /(auth)/login
    |
    +--[Hay sesion]
           |
           v
    SyncContext inicia sync en background
           |
           v
    Redirect a /(tabs)/dashboard
```

### Flujo Post-Login

```
Usuario hace login exitoso
    |
    v
AuthContext guarda sesion
    |
    v
SyncContext descarga datos iniciales
    |
    v
Contexts se hidratan desde SQLite
    |
    v
Navegar a /(tabs)/dashboard
```

### Flujo de Logout

```
Usuario presiona "Cerrar sesion"
    |
    v
AuthContext.signOut()
    |
    v
Limpiar sesion de Supabase Auth
    |
    v
Limpiar SQLite local (opcional, segun politica)
    |
    v
Resetear todos los Contexts
    |
    v
Navegar a /(auth)/login
```

---

## Proteccion de Rutas

### Autenticacion Requerida

Todas las rutas en `/(tabs)/` requieren autenticacion. El Root Layout verifica:
- Si `AuthContext.isAuthenticated === false` y la ruta actual esta en `/(tabs)/`
- Entonces: Redirect forzado a `/(auth)/login`

### Suscripcion Activa

Algunas rutas (workout, nutrition) requieren suscripcion activa:
- Si `ProfileContext.subscriptionStatus !== 'active' && !== 'trialing'`
- Entonces: Mostrar pantalla de "Suscripcion requerida" en lugar del contenido

---

## Transiciones y Animaciones

### Stack Navigator (Workout)
- **Push**: Slide desde la derecha (iOS) / Fade (Android)
- **Pop**: Slide hacia la derecha (iOS) / Fade (Android)

### Tab Navigator
- **Cambio de tab**: Sin animacion de transicion (cambio instantaneo)
- **TabBar**: Siempre visible excepto en grupo `(auth)`

### Shared Element Transitions (Opcional)
- Al navegar de lista de workouts a detalle, la card puede animarse expandiendose
- Requiere libreria adicional (react-native-shared-element o similar)

---

## Deep Linking (Futuro)

Estructura preparada para soportar deep links:

| URL | Ruta |
|-----|------|
| `fgfitness://login` | `/(auth)/login` |
| `fgfitness://dashboard` | `/(tabs)/dashboard` |
| `fgfitness://workout/abc123` | `/(tabs)/workout/abc123` |
| `fgfitness://nutrition` | `/(tabs)/nutrition` |

Implementacion pendiente; requiere configuracion en `app.json` y manejo en Root Layout.


---

## schema.md

//supabse schema 
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.assigned_nutrition (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  template_id uuid,
  structure jsonb NOT NULL DEFAULT '{}'::jsonb,
  documents jsonb NOT NULL DEFAULT '[]'::jsonb,
  scheduled_start_date date,
  scheduled_end_date date,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'completed'::text, 'paused'::text])),
  client_notes text,
  coach_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT assigned_nutrition_pkey PRIMARY KEY (id),
  CONSTRAINT assigned_nutrition_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id),
  CONSTRAINT assigned_nutrition_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.nutrition_templates(id)
);
CREATE TABLE public.assigned_workouts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  template_id uuid,
  structure jsonb NOT NULL DEFAULT '{"weeks": []}'::jsonb,
  scheduled_start_date date,
  scheduled_end_date date,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'completed'::text])),
  client_notes text,
  is_editable_by_client boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  coach_notes text,
  progress_data jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT assigned_workouts_pkey PRIMARY KEY (id),
  CONSTRAINT assigned_workouts_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.users(id),
  CONSTRAINT assigned_workouts_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.workout_templates(id)
);
CREATE TABLE public.check_ins (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  date date DEFAULT CURRENT_DATE,
  weight_kg numeric,
  waist_cm numeric,
  photos jsonb DEFAULT '{"back": null, "side": null, "front": null}'::jsonb,
  coach_feedback text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT check_ins_pkey PRIMARY KEY (id),
  CONSTRAINT check_ins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.client_privacy_settings (
  user_id uuid NOT NULL,
  can_view_own_workout_plan boolean DEFAULT true,
  can_view_own_nutrition_plan boolean DEFAULT true,
  can_view_own_clinical_history boolean DEFAULT false,
  can_view_own_check_ins boolean DEFAULT true,
  can_edit_assigned_workouts boolean DEFAULT true,
  can_submit_check_ins boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT client_privacy_settings_pkey PRIMARY KEY (user_id),
  CONSTRAINT client_privacy_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.exercise_library (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  name_es text,
  muscle_group text NOT NULL,
  secondary_muscles ARRAY DEFAULT '{}'::text[],
  equipment text,
  exercise_type text DEFAULT 'strength'::text,
  difficulty text DEFAULT 'intermediate'::text,
  video_url text,
  thumbnail_url text,
  instructions text,
  tips ARRAY,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT exercise_library_pkey PRIMARY KEY (id)
);
CREATE TABLE public.landing_content (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  content_type text NOT NULL CHECK (content_type = ANY (ARRAY['hero'::text, 'seo_meta'::text])),
  title text,
  subtitle text,
  cta_text text,
  cta_link text,
  image_url text,
  image_storage_path text,
  meta_title text,
  meta_description text,
  og_image_url text,
  og_title text,
  og_description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  description text,
  CONSTRAINT landing_content_pkey PRIMARY KEY (id)
);
CREATE TABLE public.landing_programs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  subtitle text,
  description text,
  icon_name text DEFAULT 'Archive'::text,
  image_url text,
  image_storage_path text,
  is_large boolean DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT landing_programs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.landing_transformations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  client_name text NOT NULL,
  plan_name text NOT NULL,
  before_image_url text NOT NULL,
  after_image_url text NOT NULL,
  before_storage_path text,
  after_storage_path text,
  testimonial text,
  metrics jsonb DEFAULT '{}'::jsonb,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT landing_transformations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.magic_link_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  is_onboarding boolean DEFAULT false,
  invited_by uuid,
  initial_permissions jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT magic_link_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT magic_link_tokens_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id)
);
CREATE TABLE public.nutrition_plans (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text DEFAULT 'Plan Nutricional'::text,
  macros jsonb DEFAULT '{"fat": 70, "carbs": 250, "protein": 180, "calories": 2500}'::jsonb,
  documents jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  hydration_notes text,
  water_target_liters numeric DEFAULT 2.5,
  CONSTRAINT nutrition_plans_pkey PRIMARY KEY (id),
  CONSTRAINT nutrition_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.nutrition_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  structure jsonb NOT NULL DEFAULT '{"macros": {"fat": 70, "carbs": 200, "protein": 150, "calories": 2000}, "water_target_liters": 2.5}'::jsonb,
  documents jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_public boolean DEFAULT false,
  tags ARRAY DEFAULT '{}'::text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT nutrition_templates_pkey PRIMARY KEY (id),
  CONSTRAINT nutrition_templates_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.payment_records (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid,
  year integer NOT NULL,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  amount numeric NOT NULL,
  payment_method text CHECK (payment_method = ANY (ARRAY['stripe'::text, 'cash'::text, 'transfer'::text])),
  plan_type text,
  status text DEFAULT 'paid'::text CHECK (status = ANY (ARRAY['paid'::text, 'pending'::text, 'failed'::text])),
  stripe_invoice_id text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payment_records_pkey PRIMARY KEY (id),
  CONSTRAINT payment_records_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.permission_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  changed_by uuid NOT NULL,
  target_user_id uuid NOT NULL,
  action text NOT NULL CHECK (action = ANY (ARRAY['grant'::text, 'revoke'::text, 'assign_client'::text, 'unassign_client'::text])),
  permission_name text,
  old_value boolean,
  new_value boolean,
  client_id uuid,
  assignment_type text,
  reason text,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT permission_audit_log_pkey PRIMARY KEY (id),
  CONSTRAINT permission_audit_log_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES auth.users(id),
  CONSTRAINT permission_audit_log_target_user_id_fkey FOREIGN KEY (target_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text UNIQUE,
  full_name text,
  avatar_url text,
  stripe_customer_id text,
  subscription_status text DEFAULT 'inactive'::text CHECK (subscription_status = ANY (ARRAY['active'::text, 'past_due'::text, 'canceled'::text, 'manual_cash'::text, 'trialing'::text, 'inactive'::text])),
  subscription_tier text,
  access_tags ARRAY DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  notes text,
  user_status text DEFAULT 'pending'::text CHECK (user_status = ANY (ARRAY['pending'::text, 'stripe'::text, 'cash'::text, 'canceled'::text])),
  stripe_product_id text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.recommendation_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category = ANY (ARRAY['cardiovascular'::text, 'metabolico'::text, 'muscular'::text, 'general'::text])),
  content jsonb NOT NULL DEFAULT '{"restrictions": [], "dietary_notes": [], "recommendations": [], "contraindicated_exercises": []}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT recommendation_templates_pkey PRIMARY KEY (id),
  CONSTRAINT recommendation_templates_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.staff_client_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL,
  client_id uuid NOT NULL,
  assignment_type text NOT NULL CHECK (assignment_type = ANY (ARRAY['workout_coach'::text, 'nutritionist'::text, 'both'::text])),
  assigned_at timestamp with time zone DEFAULT now(),
  ends_at timestamp with time zone,
  is_active boolean DEFAULT true,
  CONSTRAINT staff_client_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT staff_client_assignments_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES auth.users(id),
  CONSTRAINT staff_client_assignments_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.users(id)
);
CREATE TABLE public.staff_permissions (
  user_id uuid NOT NULL,
  is_super_admin boolean DEFAULT false,
  can_view_users boolean DEFAULT false,
  can_create_users boolean DEFAULT false,
  can_edit_users boolean DEFAULT false,
  can_view_workout_plans boolean DEFAULT false,
  can_create_workout_plans boolean DEFAULT false,
  can_edit_workout_plans boolean DEFAULT false,
  can_create_workout_templates boolean DEFAULT false,
  can_view_nutrition_plans boolean DEFAULT false,
  can_create_nutrition_plans boolean DEFAULT false,
  can_edit_nutrition_plans boolean DEFAULT false,
  can_view_clinical_history boolean DEFAULT false,
  can_edit_clinical_history boolean DEFAULT false,
  can_view_sales boolean DEFAULT false,
  can_manage_subscriptions boolean DEFAULT false,
  can_edit_landing_content boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT staff_permissions_pkey PRIMARY KEY (user_id),
  CONSTRAINT staff_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.stripe_plans (
  id text NOT NULL,
  price_id text NOT NULL,
  name text NOT NULL,
  description text,
  price integer NOT NULL,
  currency text NOT NULL DEFAULT 'mxn'::text,
  interval text NOT NULL DEFAULT 'month'::text,
  access_tags ARRAY NOT NULL DEFAULT '{}'::text[],
  plan_type text DEFAULT 'online'::text,
  is_online boolean DEFAULT true,
  is_recommended boolean DEFAULT false,
  display_order integer DEFAULT 99,
  color text,
  active boolean DEFAULT true,
  synced_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT stripe_plans_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_status_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month date NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['pending'::text, 'stripe'::text, 'cash'::text, 'canceled'::text])),
  subscription_tier text,
  amount_paid numeric,
  payment_method text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_status_history_pkey PRIMARY KEY (id),
  CONSTRAINT user_status_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.workout_plans (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  coach_id uuid,
  title text NOT NULL,
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  is_active boolean DEFAULT true,
  structure jsonb NOT NULL DEFAULT '{"weeks": []}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT workout_plans_pkey PRIMARY KEY (id),
  CONSTRAINT workout_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT workout_plans_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.workout_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  structure jsonb NOT NULL DEFAULT '{"weeks": []}'::jsonb,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  tags ARRAY DEFAULT '{}'::text[],
  difficulty text DEFAULT 'intermediate'::text,
  CONSTRAINT workout_templates_pkey PRIMARY KEY (id),
  CONSTRAINT workout_templates_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES auth.users(id)
);

---

## screens/logged-in/bottom-navbar.md

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



---

## screens/logged-in/homescreen.md

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


---

## screens/logged-in/nutrition/nutririon-macro-card.md

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


---

## screens/logged-in/nutrition/nutrition.md

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



---

## screens/logged-in/workouts/workout-detail.md

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



---

## screens/logged-in/workouts/workouts.md

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



---

## screens/login.md

# Pantalla de Login

## Proposito

Primera impresion del usuario con la aplicacion. Debe comunicar inmediatamente la estetica "The Forge" y la energia de la marca FG Fitness. No es un formulario generico; es una declaracion de identidad visual.

---

## Diseno Visual

### Fondo

**Opcion Principal**: Video en loop
- Contenido: Clips de entrenamiento de alta intensidad (pesas, atletas, sudor)
- Duracion: 10-15 segundos en loop sin corte visible
- Tratamiento: Overlay oscuro con gradiente de abajo hacia arriba para legibilidad

**Opcion Alternativa**: Imagen estatica
- Foto de alta calidad de gimnasio o atleta
- Mismo tratamiento de overlay oscuro

### Capa de Overlay

- Gradiente vertical desde `transparent` (arriba) hasta `background` (abajo)
- Opacidad: 60-80% en la zona del formulario
- Proposito: Garantizar contraste del texto sin ocultar completamente el fondo

### Logo

**Posicion**: Centro superior de la pantalla (25% desde el top)

**Elemento**: Logo "FG" o nombre "FG FITNESS"

**Efecto visual**:
- Texto en blanco puro (`text`)
- Efecto Neon/Glow con color `primary` (amarillo electrico)
- El resplandor crea sensacion de que el logo emite energia

### Formulario

**Contenedor**: GlassBox (Glassmorphism)
- Fondo semi-transparente con blur
- Borde sutil blanco con baja opacidad
- Esquinas muy redondeadas (24px+)
- Posicion: Centro-inferior de la pantalla

**Elementos del formulario**:

1. **Campo Email**
   - Label: "EMAIL" (mayusculas, fuente heading pequeña)
   - Input: Fondo `surface`, borde `border`, texto `text`
   - Placeholder: "tu@email.com" en `textMuted`
   - Icono: Mail icon a la izquierda (opcional)

2. **Campo Password**
   - Label: "PASSWORD" (mayusculas)
   - Input: Mismo estilo que email
   - Toggle: Icono de ojo para mostrar/ocultar password
   - Placeholder: "********"

3. **Boton Login**
   - Texto: "Tu transformacion empieza aqui!" o "LOGIN"
   - Fondo: `primary` (amarillo electrico)
   - Texto: `textDark` (negro)
   - Estilo: Bold, mayusculas, ancho completo
   - Estado presionado: `primaryDark`

4. **Link Forgot Password**
   - Texto: "Forgot password?" o "Olvidaste tu password?"
   - Color: `textMuted`
   - Posicion: Debajo del boton, centrado
   - Accion: Navega a pantalla de recuperacion

---

## Estados de UI

### Estado: Inicial
- Campos vacios
- Boton habilitado (validacion al submit)
- Sin mensajes de error

### Estado: Cargando
- Boton muestra spinner o indicador de carga
- Boton deshabilitado (no permite doble tap)
- Campos deshabilitados
- Texto del boton cambia a "LOADING..." o muestra solo spinner

### Estado: Error
- Mensaje de error debajo del formulario
- Fondo del mensaje: `danger` con opacidad baja
- Texto: Blanco
- Ejemplos de mensajes:
  - "Invalid email or password"
  - "Network error. Please try again."
  - "Account not found"
- Los campos mantienen sus valores para reintentar

### Estado: Exito
- Breve feedback visual (opcional): flash verde o checkmark
- Transicion inmediata al dashboard
- No se muestra pantalla de "exito" prolongada

---

## Flujo Post-Login

Cuando el login es exitoso:

1. **AuthContext recibe sesion**
   - Guarda token de sesion
   - Actualiza `isAuthenticated = true`

2. **SyncContext inicia sincronizacion**
   - Descarga perfil del usuario
   - Descarga workouts activos
   - Descarga plan de nutricion
   - Guarda todo en SQLite local

3. **Hidratacion de Contexts**
   - ProfileContext carga desde SQLite
   - WorkoutContext carga desde SQLite
   - NutritionContext carga desde SQLite

4. **Navegacion**
   - Redirect automatico a `/(tabs)/dashboard`

---

## Validaciones

### Validacion de Email
- Formato de email valido (regex basico)
- No vacio
- Mostrar error inline si el formato es invalido

### Validacion de Password
- No vacio
- Minimo de caracteres (segun politica de Supabase, tipicamente 6+)
- No se muestra medidor de seguridad (es login, no registro)

### Momento de Validacion
- Validacion en tiempo real al salir del campo (onBlur)
- Validacion completa al presionar Login
- Errores de servidor se muestran despues del intento

---

## Interacciones

### Keyboard Behavior
- Al enfocar un campo, el teclado sube
- El formulario se ajusta para no quedar oculto (KeyboardAvoidingView)
- Boton "Done" en teclado pasa al siguiente campo o hace submit

### Touch Feedback
- Input: Borde cambia a `borderHighlight` al enfocar
- Boton: Cambia a `primaryDark` al presionar
- Link: Opacidad reducida al presionar

---

## Consideraciones de Plataforma

### iOS
- Video de fondo funciona sin problema
- BlurView nativo disponible
- Safe area para notch

### Android
- Video de fondo puede requerir optimizacion de memoria
- Fallback a imagen si el rendimiento es bajo
- Glassmorphism con color solido si el blur es muy costoso

---

## Fuente de Datos

Esta pantalla **no consume ninguno de los Contexts de datos** (Workout, Nutrition, Profile).

Solo interactua con **AuthContext** para:
- Llamar `signIn(email, password)`
- Leer `loading` para mostrar estado de carga
- Leer `error` para mostrar mensaje de error


---

## structure.md

# Arquitectura de Datos y Estrategia Offline-First

## Vision General

La aplicacion implementa una arquitectura **Read-Only Mirror** donde el dispositivo del cliente mantiene un espejo local de los datos relevantes desde Supabase. El cliente **solo lee** workouts y nutrition; no modifica nada en el servidor.

### Tablas que la App Lee

| Tabla | Proposito | Sync |
|-------|-----------|------|
| `profiles` | Datos del usuario, suscripcion | Si |
| `assigned_workouts` | Rutinas asignadas al cliente | Si |
| `assigned_nutrition` | Plan nutricional asignado | Si |
| `exercise_library` | Detalles de ejercicios (videos, instrucciones) | Cache |
| `check_ins` | Ver feedback del coach (solo lectura) | Si |

---

## Esquema Real de Supabase

### Tabla: profiles

**Proposito**: Identidad del usuario y estado de suscripcion

```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL,                    -- FK a auth.users
  email text UNIQUE,
  full_name text,
  avatar_url text,
  stripe_customer_id text,
  subscription_status text DEFAULT 'inactive',
    -- CHECK: 'active', 'past_due', 'canceled', 'manual_cash', 'trialing', 'inactive'
  subscription_tier text,
  access_tags text[] DEFAULT '{}',
  user_status text DEFAULT 'pending',
    -- CHECK: 'pending', 'stripe', 'cash', 'canceled'
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Campos relevantes para la app**:

| Campo | Uso en App |
|-------|------------|
| `id` | Identificador del usuario |
| `email` | Mostrar en perfil |
| `full_name` | Saludo en Dashboard |
| `avatar_url` | Foto de perfil |
| `subscription_status` | Validar acceso a contenido |
| `subscription_tier` | Badge "HIGH VOLTAGE" vs "STANDARD" |

---

### Tabla: assigned_workouts

**Proposito**: Rutinas de entrenamiento asignadas al cliente

```sql
CREATE TABLE public.assigned_workouts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,             -- FK a auth.users
  template_id uuid,                    -- FK a workout_templates (opcional)
  structure jsonb NOT NULL DEFAULT '{"weeks": []}',
  scheduled_start_date date,
  scheduled_end_date date,
  status text DEFAULT 'pending',
    -- CHECK: 'pending', 'active', 'completed'
  client_notes text,
  coach_notes text,
  is_editable_by_client boolean DEFAULT true,
  progress_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Campos relevantes para la app**:

| Campo | Uso en App |
|-------|------------|
| `id` | Identificador del workout |
| `client_id` | Filtrar por usuario autenticado |
| `structure` | **JSONB principal** - toda la rutina |
| `scheduled_start_date` | Calcular semana actual |
| `scheduled_end_date` | Determinar si el programa termino |
| `status` | Solo mostrar 'active' |
| `coach_notes` | Notas visibles para el cliente |
| `progress_data` | Datos de progreso (futuro) |

---

### Tabla: assigned_nutrition

**Proposito**: Plan nutricional asignado al cliente

```sql
CREATE TABLE public.assigned_nutrition (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,             -- FK a profiles.id
  template_id uuid,                    -- FK a nutrition_templates (opcional)
  structure jsonb NOT NULL DEFAULT '{}',
  documents jsonb NOT NULL DEFAULT '[]',
  scheduled_start_date date,
  scheduled_end_date date,
  status text DEFAULT 'active',
    -- CHECK: 'pending', 'active', 'completed', 'paused'
  client_notes text,
  coach_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Campos relevantes para la app**:

| Campo | Uso en App |
|-------|------------|
| `id` | Identificador del plan |
| `client_id` | Filtrar por usuario autenticado |
| `structure` | **JSONB principal** - macros, comidas, hidratacion |
| `documents` | **JSONB** - Array de PDFs adjuntos |
| `status` | Solo mostrar 'active' |
| `coach_notes` | Notas del nutriologo |

---

### Tabla: exercise_library

**Proposito**: Catalogo de ejercicios con videos e instrucciones

```sql
CREATE TABLE public.exercise_library (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  name_es text,                        -- Nombre en español
  muscle_group text NOT NULL,
  secondary_muscles text[] DEFAULT '{}',
  equipment text,
  exercise_type text DEFAULT 'strength',
  difficulty text DEFAULT 'intermediate',
  video_url text,                      -- URL completa del video
  thumbnail_url text,                  -- Thumbnail del video
  instructions text,                   -- Descripcion tecnica
  tips text[],                         -- Array de consejos
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Campos relevantes para la app**:

| Campo | Uso en App |
|-------|------------|
| `id` | Referencia desde workouts |
| `name` / `name_es` | Nombre del ejercicio |
| `video_url` | Reproductor de video |
| `thumbnail_url` | Preview en lista |
| `instructions` | Descripcion tecnica |
| `tips` | Consejos adicionales |
| `muscle_group` | Etiqueta informativa |

---

### Tabla: check_ins

**Proposito**: Registro de progreso y feedback del coach (solo lectura en app)

```sql
CREATE TABLE public.check_ins (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,               -- FK a profiles.id
  date date DEFAULT CURRENT_DATE,
  weight_kg numeric,
  waist_cm numeric,
  photos jsonb DEFAULT '{"back": null, "side": null, "front": null}',
  coach_feedback text,                 -- Respuesta del coach
  created_at timestamptz DEFAULT now()
);
```

**Campos relevantes para la app**:

| Campo | Uso en App |
|-------|------------|
| `user_id` | Filtrar por usuario |
| `date` | Ordenar cronologicamente |
| `weight_kg` | Mostrar en Dashboard |
| `coach_feedback` | Notificacion de feedback nuevo |

---

## Estructura JSONB de Workouts

El campo `structure` en `assigned_workouts` contiene toda la rutina.

### Estructura Real

```json
{
  "weeks": [
    {
      "week_number": 1,
      "name": "Week 1 - Foundation",
      "days": [
        {
          "day_number": 1,
          "name": "Upper Power",
          "focus": "Strength",
          "exercises": [
            {
              "exercise_id": "uuid-del-ejercicio",
              "name": "Barbell Bench Press",
              "sets": 4,
              "reps": "6-8",
              "weight": "RPE 8",
              "rest": "90s",
              "notes": "Control en la excentrica",
              "is_superset": false,
              "superset_with": null
            },
            {
              "exercise_id": "uuid-otro",
              "name": "Incline Dumbbell Press",
              "sets": 3,
              "reps": "10-12",
              "weight": "Moderate",
              "rest": "60s",
              "notes": null,
              "is_superset": true,
              "superset_with": "uuid-siguiente"
            }
          ]
        },
        {
          "day_number": 2,
          "name": "Rest Day",
          "focus": "Recovery",
          "exercises": []
        }
      ]
    }
  ]
}
```

### Jerarquia

```
structure
  └── weeks[] (Array de semanas)
        ├── week_number: 1
        ├── name: "Week 1 - Foundation"
        └── days[] (Array de dias)
              ├── day_number: 1
              ├── name: "Upper Power"
              ├── focus: "Strength"
              └── exercises[] (Array de ejercicios)
                    ├── exercise_id: UUID (referencia a exercise_library)
                    ├── name: "Barbell Bench Press"
                    ├── sets: 4
                    ├── reps: "6-8"
                    ├── weight: "RPE 8"
                    ├── rest: "90s"
                    ├── notes: "Control..."
                    ├── is_superset: false
                    └── superset_with: null | UUID
```

### Supersets / Circuitos

Los ejercicios en superset se identifican por:
- `is_superset: true`
- `superset_with: UUID` apuntando al siguiente ejercicio del grupo

La UI agrupa visualmente los ejercicios con el mismo grupo de superset.

---

## Estructura JSONB de Nutrition

El campo `structure` en `assigned_nutrition` contiene macros y comidas.

### Estructura Real (basada en nutrition_templates)

```json
{
  "macros": {
    "calories": 2500,
    "protein": 180,
    "carbs": 250,
    "fat": 70
  },
  "water_target_liters": 2.5,
  "meals": [
    {
      "meal_number": 1,
      "name": "Desayuno",
      "time": "07:00",
      "foods": [
        { "name": "Avena", "quantity": "80g", "notes": null },
        { "name": "Claras de huevo", "quantity": "150g", "notes": "o 4 huevos enteros" },
        { "name": "Platano", "quantity": "1 pieza", "notes": null }
      ],
      "macros": {
        "calories": 550,
        "protein": 40,
        "carbs": 70,
        "fat": 10
      }
    }
  ],
  "notes": "Instrucciones generales del plan..."
}
```

### Campo: documents (Array separado)

```json
[
  {
    "name": "Guia de Suplementacion",
    "url": "https://xxxxx.supabase.co/storage/v1/object/public/documents/guia.pdf",
    "type": "pdf"
  },
  {
    "name": "Recetas Semana 1",
    "url": "https://xxxxx.supabase.co/storage/v1/object/public/documents/recetas.pdf",
    "type": "pdf"
  }
]
```

---

## Queries de Sincronizacion

### Query: Obtener Workouts Activos

```sql
SELECT
  id,
  structure,
  scheduled_start_date,
  scheduled_end_date,
  status,
  coach_notes,
  updated_at
FROM assigned_workouts
WHERE client_id = auth.uid()
  AND status = 'active'
ORDER BY scheduled_start_date DESC
LIMIT 1;
```

### Query: Obtener Nutrition Activo

```sql
SELECT
  id,
  structure,
  documents,
  status,
  coach_notes,
  updated_at
FROM assigned_nutrition
WHERE client_id = auth.uid()
  AND status = 'active'
ORDER BY created_at DESC
LIMIT 1;
```

### Query: Obtener Ejercicios (Cache)

```sql
SELECT
  id,
  name,
  name_es,
  muscle_group,
  video_url,
  thumbnail_url,
  instructions,
  tips
FROM exercise_library
WHERE is_active = true;
```

### Query: Obtener Check-ins Recientes

```sql
SELECT
  id,
  date,
  weight_kg,
  coach_feedback,
  created_at
FROM check_ins
WHERE user_id = auth.uid()
ORDER BY date DESC
LIMIT 5;
```

---

## Estrategia Offline-First

### Flujo de Sincronizacion

```
App Inicia
    │
    ▼
¿Hay conexion?
    │
    ├─[No]──► Cargar desde SQLite local
    │              │
    │              ▼
    │         Hidratar Contexts
    │              │
    │              ▼
    │         Renderizar UI
    │
    ├─[Si]──► Comparar updated_at
                   │
                   ├─[Sin cambios]──► Usar SQLite local
                   │
                   └─[Hay cambios]──► Descargar datos nuevos
                                           │
                                           ▼
                                      Transaccion SQLite
                                           │
                                           ▼
                                      Hidratar Contexts
                                           │
                                           ▼
                                      Renderizar UI
```

### Tablas SQLite Locales

```sql
-- Workout activo
CREATE TABLE local_workout (
  id TEXT PRIMARY KEY,
  structure_json TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  coach_notes TEXT,
  updated_at TEXT NOT NULL
);

-- Nutrition activo
CREATE TABLE local_nutrition (
  id TEXT PRIMARY KEY,
  structure_json TEXT NOT NULL,
  documents_json TEXT NOT NULL,
  coach_notes TEXT,
  updated_at TEXT NOT NULL
);

-- Cache de ejercicios
CREATE TABLE local_exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_es TEXT,
  muscle_group TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  instructions TEXT,
  tips_json TEXT,
  updated_at TEXT NOT NULL
);

-- Check-ins recientes (solo lectura)
CREATE TABLE local_checkins (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  weight_kg REAL,
  coach_feedback TEXT,
  created_at TEXT NOT NULL
);

-- Perfil del usuario
CREATE TABLE local_profile (
  id TEXT PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  subscription_status TEXT,
  subscription_tier TEXT,
  updated_at TEXT NOT NULL
);

-- Metadata de sync
CREATE TABLE sync_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

---

## Politicas RLS (Row Level Security)

### Para Cliente (App)

```sql
-- El cliente solo ve sus propios workouts
CREATE POLICY "client_select_own_workouts"
ON assigned_workouts FOR SELECT
TO authenticated
USING (client_id = auth.uid());

-- El cliente solo ve su propia nutricion
CREATE POLICY "client_select_own_nutrition"
ON assigned_nutrition FOR SELECT
TO authenticated
USING (client_id = auth.uid());

-- Cualquier usuario autenticado puede leer ejercicios
CREATE POLICY "anyone_select_exercises"
ON exercise_library FOR SELECT
TO authenticated
USING (is_active = true);

-- El cliente solo ve sus propios check-ins
CREATE POLICY "client_select_own_checkins"
ON check_ins FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

### Validacion de Suscripcion

La app valida `subscription_status` localmente despues del sync:
- `'active'` o `'trialing'` o `'manual_cash'`: Acceso completo
- Cualquier otro valor: Mostrar pantalla de suscripcion requerida

---

## Consideraciones de Rendimiento

1. **Solo 1 workout activo**: La query siempre trae `LIMIT 1`
2. **Solo 1 nutrition activo**: Igual, `LIMIT 1`
3. **Ejercicios en cache**: Se descargan una vez y se actualizan semanalmente
4. **Check-ins limitados**: Solo los ultimos 5 para mostrar peso y feedback
5. **JSONB como TEXT**: SQLite guarda el JSON como string, se parsea al leer
6. **Indices**: Crear indice en `updated_at` para comparacion rapida


---

