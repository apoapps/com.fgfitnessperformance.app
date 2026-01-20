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

