# specs/002-weekly-goal/spec.md

## Contexto y objetivo
Añadir la posibilidad de que el usuario fije un **objetivo semanal de minutos de estudio** y vea su progreso hacia ese objetivo en el header. Esto sirve como motivación visual para cumplir la meta semanal. La funcionalidad debe integrarse en los 3 archivos existentes sin añadir dependencias ni romper el funcionamiento offline (doble clic en index.html).

## Usuarios
- Estudiante que quiere una meta semanal concreta para mantener la constancia
- Estudiante que quiere ver de un vistazo si va camino de cumplir su objetivo

## Historias de usuario
1. Como estudiante, quiero **establecer un objetivo semanal de minutos** (ej. 300 min/semana) para tener una meta clara.
2. Como estudiante, quiero **ver mi progreso actual vs objetivo** en el header (ej. "Esta semana: 180 min / Objetivo: 300 min") para saber cuánto me falta.
3. Como estudiante, quiero un **indicador visual de progreso** (barra o porcentaje) que cambie cuando alcance la meta para sentir logro.
4. Como estudiante, quiero **poder modificar o borrar el objetivo** cuando mis circunstancias cambien.

## Requisitos funcionales

**RF-1**: El usuario puede **fijar un objetivo semanal** mediante un control en el header (junto a "Esta semana"). El objetivo es un número entero de minutos > 0. Por defecto no hay objetivo (vacío).

**RF-2**: El header muestra **"Esta semana: X min / Objetivo: Y min"** cuando hay objetivo fijado. Si no hay objetivo, muestra solo "Esta semana: X min" (comportamiento actual).

**RF-3**: Se muestra un **indicador visual de progreso** (barra de progreso horizontal debajo del texto de minutos semanales) que representa `min(X / Y * 100, 100)%`. La barra:
- Tiene altura de 4px, bordes redondeados, fondo gris claro (#e2e8f0) y relleno verde (#38A169 / var(--success)).
- Cuando el progreso ≥ 100%, el relleno cambia a un verde más intenso (#276749) y aparece un icono ✓ pequeño al final del texto "Objetivo: Y min".

**RF-4**: El usuario puede **cambiar el objetivo** clicando sobre el valor "Y min" (se vuelve un `<input type="number">` inline) o mediante un botón "Editar" pequeño junto al objetivo. Al guardar (Enter o blur), se valida que sea > 0 y se actualiza.

**RF-5**: El usuario puede **borrar el objetivo** (vaciarlo) desde el mismo control de edición (botón "Borrar" o dejando el input vacío y guardando). Al borrar, la UI vuelve al estado sin objetivo (RF-2).

**RF-6**: El objetivo se **persiste en localStorage** bajo la clave `study-weekly-goal` (valor número o null). Al recargar la página, el objetivo y el progreso se restauran correctamente.

**RF-7**: El cálculo de "minutos esta semana" **ya existe** (`calculateWeekMinutes`, Lunes-Domingo hora local). El objetivo compara contra ese mismo valor. No se altera la lógica existente de semana.

## Requisitos no funcionales
- **RNF-1**: Sin frameworks, sin librerías, sin compilación. Solo modificaciones en `index.html`, `styles.css`, `app.js`.
- **RNF-2**: Funciona abriendo `index.html` por doble clic, sin servidor, sin CORS.
- **RNF-3**: Todos los textos y mensajes en español.
- **RNF-4**: El objetivo usa hora local del navegador para la semana (consistente con `calculateWeekMinutes`).
- **RNF-5**: Accesibilidad: el input de edición tiene label accesible, focus visible, y el cambio de color al 100% no es el único indicador (icono ✓ + texto).

## Casos límite
- **CC-1**: Usuario fija objetivo 0 o negativo → mostrar error "El objetivo debe ser mayor que 0" y no guardar.
- **CC-2**: Usuario borra objetivo (input vacío) → se elimina de localStorage y UI vuelve a estado sin objetivo.
- **CC-3**: Usuario tiene objetivo 300 min, ya lleva 350 min → barra al 100%, color verde intenso, icono ✓ visible.
- **CC-4**: Usuario cambia objetivo de 300 a 500 min → progreso se recalcula inmediatamente sin recargar.
- **CC-5**: localStorage corrupto o clave inexistente → comportamiento por defecto (sin objetivo), sin errores en consola.
- **CC-6**: Semana cambia (pasa de Domingo a Lunes) → minutos esta semana se reinician a 0, progreso se actualiza automáticamente (ya ocurre con `updateWeekMinutesDisplay` al cargar).

## Fuera de alcance
- **OOS-1**: Notificaciones push, email o recordatorios.
- **OOS-2**: Objetivos por día, mes o personalizados (solo semana Lunes-Domingo).
- **OOS-3**: Historial de objetivos pasados o estadísticas de cumplimiento.
- **OOS-4**: Múltiples objetivos simultáneos.

## Criterios de finalización
- En el header aparece "Esta semana: X min / Objetivo: Y min" cuando hay objetivo, o solo "Esta semana: X min" cuando no.
- Barra de progreso visible debajo del texto de minutos semanales, con ancho proporcional al progreso.
- Al alcanzar ≥ 100%, barra se pone verde intenso y aparece icono ✓.
- Clic en objetivo → input inline para editar → Enter/blur guarda y valida (>0).
- Botón/opción para borrar objetivo → vuelve a estado sin objetivo.
- Persistencia en localStorage (`study-weekly-goal`) verificada al recargar.
- Tests `node --test` pasan (nuevos tests para funciones puras de objetivo + tests de estructura HTML).
- Verificado en Chrome DevTools: móvil 375px, tablet 768px, desktop 1024px+.

## Dudas resueltas
- **Ubicación del control**: En el header, integrado en el span `.week-minutes` existente, para no añadir nuevos elementos visuales que rompan el layout en móvil. **Decisión**: Editar inline el valor del objetivo.
- **Formato de la barra**: Barra simple horizontal (4px) vs círculo/anillo. **Decisión**: Barra horizontal, más compacta en header responsive y coherente con diseño actual.
- **Color al 100%**: ¿Cambiar solo color de barra o también texto? **Decisión**: Barra verde intenso + icono ✓ junto a "Objetivo: Y min" (no cambiar color del texto principal para mantener jerarquía visual).
- **Persistencia**: ¿Misma clave que sesiones o clave separada? **Decisión**: Clave separada `study-weekly-goal` para aislar y permitir limpieza independiente.