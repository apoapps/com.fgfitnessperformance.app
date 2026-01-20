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
