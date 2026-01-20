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
