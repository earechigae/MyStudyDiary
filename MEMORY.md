# MEMORY.md — Diario de Estudio

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- v1 funcionando: registrar sesiones (fecha, tema, minutos), racha actual y lista de sesiones.
- Mejor racha añadida: cálculo de la racha más larga en todo el historial.
- **Minutos esta semana añadidos**: cálculo y visualización en header (Lunes-Domingo, hora local del navegador).
- **Mapa de calor (heat map) añadido**: grid de 28 celdas (4 semanas × 7 días, Lunes-Domingo) con intensidad de color según minutos, tooltip al hover, responsive.
- **Sanitización de datos en localStorage**: `getSessions()` ahora valida y limpia datos (formato fecha YYYY-MM-DD, minutos como número, filtra inválidos).
- **Objetivo semanal (weekly goal) añadido**: fijar meta de minutos/semana, barra de progreso en header, icono ✓ al 100%, edición inline, persistencia en `study-weekly-goal`.
- Datos en localStorage.

## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer.
- La racha actual cuenta días consecutivos terminando hoy, en hora local (nunca UTC).
- La mejor racha recorre todo el historial de fechas ordenadas para encontrar el máximo de días consecutivos.
- **Minutos de esta semana**: semana definida como Lunes-Domingo en hora local del navegador; se filtran sesiones por fecha y se suman minutos.
- **Mapa de calor**: 28 celdas para 4 semanas calendario (Lunes-Domingo) terminando en la semana de hoy; días con sesión coloreados por intensidad (5 tonos verde fijos), días sin sesión con opacity 0.4; tooltip en español al hover.
- **Objetivo semanal**: meta editable inline en header; barra 4px progresiva (verde → verde intenso + ✓ al 100%); clave localStorage separada `study-weekly-goal`; validación > 0; Escape cancela edición.
- **Sanitización defensiva**: protege contra datos corruptos en localStorage (fechas con time component, minutos como string, campos vacíos).
- Los datos se guardan bajo la clave `study-sessions` en localStorage.

## Aprendizajes y errores a evitar
- Usar siempre `new Date()` en hora local para los cálculos de racha y semana; UTC dará resultados incorrectos.
- El orden lexicográfico de fechas en formato `AAAA-MM-DD` coincide con el orden cronológico, lo que simplifica la comparación.
- Para semana Lunes-Domingo: `getDay()` devuelve 0=Domingo, así que lunes = hoy - (day===0 ? 6 : day-1).
- **Bug corregido**: El mensaje "No hay sesiones registradas aún" ahora se muestra/oculta correctamente basándose en si hay sesiones en localStorage. El problema era que el `<p id="empty-state">` en index.html permanecía visible siempre, independientemente de si había sesiones o no. La fix consistió en actualizar `renderSessions()` para togglear el display del `#empty-state` elemento.
- **Bug corregido**: El mapa de calor no se mostraba porque estaba dentro del `<header>` (contenedor flex con `justify-content: space-between`), lo que lo posicionaba a la derecha del header en lugar de debajo del streak display. Fix: mover `#heat-map` fuera del header a su propia `<section class="heat-map-section">` con estilos de card coherentes.
- **Bug corregido**: Rachas y estadísticas mostraban 0 a pesar de haber sesiones. Causa: datos en localStorage con formato inesperado (fechas ISO con time, minutos como string, campos inválidos). Fix: `getSessions()` ahora sanitiza y valida cada sesión al leer.
- **Bug corregido**: `renderHeatMap()` fallaba con "can't access property className, element is undefined". Causa: el HTML tenía 27 celdas hardcodeadas pero `getHeatMapCells()` genera 28 (4 semanas × 7 días). Al iterar 28 veces, `heatMap.children[27]` era undefined. Fix: añadir la celda 28 faltante en index.html.

## Próximos pasos
- Spec 001-heat-map **completamente cumplida**: todos los RF (1-5) implementados y verificados, tests automatizados pasando (0 fallos), criterios de finalización satisfechos.
- Spec 002-weekly-goal **implementada (T1-T6 completados)**: todos los RF (1-7) codificados, tests automatizados pasando (0 fallos). Pendiente: T7 verificación visual en Chrome DevTools (375px, 768px, 1024px+).
- Verificar visualmente el objetivo semanal en móviles y desktop con Chrome DevTools.
- Probar flujo completo: fijar objetivo → ver barra progreso → registrar sesiones → ver progreso actualizar → alcanzar 100% → ver ✓ → editar/borrar objetivo → recargar y confirmar persistencia.
