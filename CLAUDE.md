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
EXPO_PUBLIC_SUPABASE_URL=https://jlpghwwbixunxglvlsbo.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=sb_publishable_6h-KNR_k_fKdrrQssKDeXw_QXGr9Esj
EXPO_PUBLIC_WEB_APP_URL=https://prod.fgfitnessperformance.com
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

## EAS Build & Deploy

**SIEMPRE usar builds locales** (`--local`). La Mac Mini es la build machine. No usar builds remotos en EAS (free tier es lento).

```bash
# Build local iOS + submit a TestFlight
npx eas-cli build --platform ios --profile production --local --non-interactive
npx eas-cli submit --platform ios --path ./build-XXXXX.ipa --profile production --non-interactive

# Git auth: cuenta activa debe ser "apoapps" (no fgfitnessperformance)
gh auth switch --user apoapps
gh auth setup-git
```

**Flujo para TestFlight**:
1. Bump `buildNumber` en `app.json` → `ios.buildNumber`
2. `npx eas-cli build --platform ios --profile production --local --non-interactive`
3. `npx eas-cli submit --platform ios --path ./build-XXXXX.ipa --profile production --non-interactive`
4. Commit + push

## Arquitectura Hibrida WebView

```
Next.js Web App (prod.fgfitnessperformance.com)
     ^
     | WebView (?embed=1 oculta tab bar/header)
     |
Expo Native Shell (React Native)
     |
     | Auth: login nativo → inject tokens via postMessage
     | Navigation: Tab bar + headers nativos
     | Bridge: Web↔Native postMessage protocol v2
     |
Supabase Auth (jlpghwwbixunxglvlsbo)
```

**IMPORTANTE**: El mobile app es un shell nativo que envuelve el web app via WebViews. Todo el contenido (workouts, nutrition, profile, dashboard) se renderiza en WebViews. Solo login, tab bar, y headers son nativos.

## Jerarquia de Providers

```tsx
<ThemeProvider>     // Theme nativo para header/tab bar
  <AuthProvider>    // Autenticacion y sesion
    <SplashController>
      <RootLayoutContent />  // Stack navigator con tabs WebView
    </SplashController>
  </AuthProvider>
</ThemeProvider>
```

## Contextos

| Context | Proposito | Fuente de Datos |
|---------|-----------|-----------------|
| AuthContext | Autenticacion y sesion | Supabase Auth directo |
| ThemeContext | Theme nativo (light/dark) | AsyncStorage |

Legacy contexts (Profile, Workout, Nutrition, Chat) moved to `_legacy/contexts/`.

## Bridge Protocol v2 (Web ↔ Native)

| Direction | Messages |
|-----------|----------|
| Web → Native | `WEBVIEW_READY`, `WEBVIEW_ROUTE`, `AUTH_NEEDED`, `AUTH_EXPIRED`, `HAPTIC`, `OPEN_EXTERNAL` |
| Native → Web | `AUTH_SESSION`, `AUTH_LOGOUT`, `THEME_CHANGE`, `NAVIGATE_TO` |

Key files: `utils/bridge.ts`, `hooks/useWebViewAuth.ts`, `components/web/EmbeddedWebScreen.tsx`

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
  _layout.tsx              # Root Layout: ThemeProvider → AuthProvider → SplashController
  index.tsx                # Redirect a (tabs) o (auth)
  (auth)/
    _layout.tsx            # Layout sin tabs
    login.tsx              # Login nativo
    forgot-password.tsx
  (tabs)/
    _layout.tsx            # TabBar nativo flotante
    dashboard/index.tsx    # WebView → /app
    workout/index.tsx      # WebView → /app/training
    nutrition/index.tsx    # WebView → /app/nutrition
    profile/index.tsx      # WebView → /app/profile
  _legacy/                 # Archivado: screens/components/contexts nativos originales
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
