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
