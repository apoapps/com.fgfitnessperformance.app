# FG Fitness Performance - Contexto para Claude

## Proyecto

App movil **Client-Only Read-Only** para atletas que siguen programas de entrenamiento y nutricion personalizados. Filosofia: **"Turn Pain Into Power"** = eliminar toda friccion.

## Stack Tecnologico

| Categoria | Tecnologia |
|-----------|------------|
| Framework | Expo SDK 54 (Managed) |
| Package Manager | **Bun** |
| Lenguaje | TypeScript strict |
| Estilos | NativeWind v4 (Tailwind) |
| Backend | Supabase |
| Persistencia Local | expo-sqlite |
| Charts | @shopify/react-native-skia |
| Testing | Jest + jest-expo + @testing-library/react-native |
| Navigation | expo-router v6 |

## Credenciales Supabase

```env
EXPO_PUBLIC_SUPABASE_URL=https://nodhdwskxixnqhnlctiq.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=sb_publishable_UHO2MLlXHjvKbSxAdnSDkw_3OvUHw_u
```

## Usuario de Prueba

```
Email: apocor.alex@gmail.com
Password: dyptap-qatvid-4zEcki
```

## Comandos Principales

```bash
bun install              # Instalar dependencias
bun run start            # Iniciar Expo dev server
bun run web              # Iniciar en web (para testing con Chrome DevTools MCP)
bun run ios              # Iniciar en iOS
bun run android          # Iniciar en Android
bun test                 # Ejecutar tests
```

## Arquitectura Offline-First

```
Supabase (Nube)
     |
     | Pull-Only Sync (NUNCA push)
     v
SyncEngine (Background)
     |
     | Transaccion Atomica
     v
SQLite Local (expo-sqlite)
     |
     | Hidratacion
     v
React Contexts (Estado Global)
     |
     | Render
     v
Componentes UI
```

**IMPORTANTE**: El cliente es 100% READ-ONLY. Nunca modifica datos en Supabase excepto para autenticacion.

## Jerarquia de Providers

```tsx
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

## Contextos

| Context | Proposito | Fuente de Datos |
|---------|-----------|-----------------|
| AuthContext | Autenticacion y sesion | Supabase Auth directo |
| ProfileContext | Datos de perfil y suscripcion | SQLite local |
| WorkoutContext | Rutinas de entrenamiento | SQLite local |
| NutritionContext | Plan nutricional y macros | SQLite local |
| SyncContext | Coordinacion de sincronizacion | Supabase → SQLite |

## Tablas Supabase Principales

- **profiles**: id, email, full_name, avatar_url, subscription_status, subscription_tier, access_tags
- **assigned_workouts**: client_id, structure (JSONB), status, scheduled_start_date
- **assigned_nutrition**: client_id, structure (JSONB), documents (JSONB), status
- **exercise_library**: name, video_url, muscle_group, instructions

## Estructura JSONB de Workouts

```typescript
structure: {
  weeks: [{
    week_number: number,
    name: string,
    days: [{
      day_number: number,
      name: string,
      focus: string,
      exercises: [{
        exercise_id: string,
        name: string,
        sets: number,
        reps: string,
        weight: string,
        rest: string,
        notes: string,
        is_superset: boolean
      }]
    }]
  }]
}
```

## Estructura JSONB de Nutrition

```typescript
structure: {
  macros: {
    protein: number,
    carbs: number,
    fat: number,
    calories: number
  },
  water_target_liters: number,
  meals: [{
    name: string,
    time: string,
    foods: [],
    macros: {}
  }]
}
```

## Sistema de Diseno "The Forge"

### Colores Dark Mode (Principal)
- background: `#09090b` (Zinc 950) - Negro absoluto
- surface: `#18181b` (Zinc 900) - Tarjetas
- primary: `#ffd801` - Amarillo Electrico
- text: `#ffffff` - Blanco puro
- textMuted: `#a1a1aa` (Zinc 400)
- danger: `#ef4444` (Red 500)
- success: `#22c55e` (Green 500)

### Colores Light Mode
- background: `#fafafa` (Zinc 50)
- surface: `#ffffff`
- primary: `#ca8a04` (Yellow 600)
- text: `#09090b` (Zinc 950)

### Tipografia
- **Heading**: Oswald (Bold/ExtraBold) - MAYUSCULAS
- **Body**: Inter (Regular/Medium)
- **Mono**: JetBrains Mono - Numeros, timers

## Estructura de Rutas (expo-router)

```
/app
  _layout.tsx              # Root Layout con Providers
  index.tsx                # Redirect inicial
  (auth)/
    _layout.tsx            # Layout sin tabs
    login.tsx
    forgot-password.tsx
  (tabs)/
    _layout.tsx            # TabBar flotante
    dashboard/index.tsx    # "El Hub"
    workout/
      _layout.tsx          # Stack interno
      index.tsx            # Lista de workouts
      [id].tsx             # Detalle dinamico
    nutrition/index.tsx    # Protocolo Diario
    profile/index.tsx      # Configuracion
```

## Metodologia TDD (Ralph Loop)

Para cada feature:
1. **RED**: Escribir tests que fallan con mocks
2. **GREEN**: Implementar hasta que pasen
3. **VERIFY**: Chrome DevTools MCP en web
4. **CONNECT**: Reemplazar mocks con Supabase real
5. **VERIFY AGAIN**: Confirmar paridad
6. **REFACTOR**: Limpiar codigo

## Verificacion con Chrome DevTools MCP

```bash
bun run web  # Iniciar app en web
```

Luego usar:
- `mcp__chrome-devtools__take_snapshot` - Ver estructura
- `mcp__chrome-devtools__click` - Probar interacciones
- `mcp__chrome-devtools__list_console_messages` - Ver errores

## Orden de Implementacion

1. P0: Foundation (Testing, NativeWind, Theme, Mocks)
2. F1: Theme System
3. F2: Auth Flow
4. F3: Profile
5. F4: Workouts
6. F5: Nutrition
7. F6: Dashboard Hub
8. F7: TabBar + Navigation
9. F8: Offline Sync

## Principios Clave

1. **UI siempre lee de Context, nunca de red directamente**
2. **Contexts se hidratan desde SQLite, no desde Supabase**
3. **Solo SyncContext interactua con Supabase para datos**
4. **Solo AuthContext interactua con Supabase Auth**
5. **Errores de red son silenciosos** - app sigue con datos locales
6. **Sync es eventual, no bloqueante** - usuario nunca espera por red
7. **Tests primero** - TDD estricto con mocks

## Archivos de Referencia

- PRD completo: `prd/PRD_FULL.md`
- Schema Supabase: `prd/src/schema.md`
- Colores detallados: `prd/src/colors.md`
- Plan de implementacion: `.claude/plans/velvet-wibbling-sphinx.md`
