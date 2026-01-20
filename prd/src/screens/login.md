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
