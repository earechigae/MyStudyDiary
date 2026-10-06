# specs/001-heat-map/spec.md

## Contexto y objetivo
Añadir una vista de mapa de calor que muestre gráficamente los días estudiados en las últimas 4 semanas. Los días con sesión aparecen con intensidad de color proporcional a los minutos estudiados; los días sin sesión aparecen desactivados/grises. La vista debe ser responsiva y funcionar abriendo index.html por doble clic.

## Usuarios
- Estudiante que quiere visualizar sus patrones de estudio a simple vista

## Historias de usuario
1. Como estudiante, quiero ver un mapa de calor de mis últimos 4 días de estudio para identificar días consecutivos.
2. Como estudiante, quiero que los días sin sesión aparezcan desactivados para entender rápidamente qué días he perdido.

## Requisitos funcionales

**RF-1**: El mapa de calor debe mostrar un grid de hasta 28 celdas (4 semanas × 7 días) correspondientes a las semanas completas que terminan hoy, contando desde el lunes hacía 4 semanas atrás. Si hoy no es lunes, las celdas al principio del grid correspondrán a días "sobrantes" antes del primer lunes completo y quedarán con apariencia desactivada/gris. **EACH** día del período debe tener una celda visual; el grid siempre muestra como máximo 28 celdas lógicas que se reacomodan responsivamente según viewport.

**RF-2**: Cada celda del mapa debe reflejar la intensidad de color basada en los minutos totales estudiados en ese día: más minutos = color más intenso. **IF** un día tiene sesión, **THEN** la intensidad se calculará usando una escala de 5 tonalidades de verde fijas: `0-60` minutos → `#a5d6a7` (verde very light), `61-120` → `#81c784`, `121-180` → `#66bb6a`, `181-240` → `#4caf50`, `241+` → `#1b5e20` (verde dark). Se sumarán los minutos de múltiples sesiones en un mismo día antes de asignar la tonalidad. **AND** si hay múltiples sesiones en un mismo día, los minutos deben sumarse para calcular la intensidad antes de aplicar la tonalidad correspondiente.

**RF-3**: Los días sin sesión registrada en el período deben aparecer con apariencia desactivada aplicando `opacity: 0.4` sobre el color de base verde (mismo tono que los días con sesión pero lavado). **AND** deben ser distinguibles de los días con sesión por tener menor opacidad/visibilidad. Esta sutil diferencia de intensidad permite identificar rápidamente qué días tienen registro y cuáles no, manteniendo la coherencia visual con la paleta de colores definida en RF-2.

**RF-4**: El mapa debe ser fully responsive: debe verse correctamente en pantallas de móvil y desktop. **WHEN** el viewport cambia, **THEN** el diseño debe ajustarse sin romper la disposición de celdas. Se usarán media queries con puntos de quiebre: en viewport >= 1024px, 7 columnas (una por día de lunes a domingo); en viewport >= 768px y < 1024px, 3 columnas; en viewport >= 480px y < 768px, 2 columnas; y en viewport < 480px, 1 sola columna. El grid siempre mostrará como máximo 28 celdas lógicas (4 semanas × 7 días) que se reacomodarán según el breakpoint, nunca romperán el layout y mantendrán la usabilidad en cualquier dispositivo.

**RF-5**: No deben mostrarse valores numéricos estáticos en las celdas. **ONLY** la intensidad de color representa la cantidad de minutos. Para que el usuario pueda comprender el valor total sin violar la regla de sin números en celda, se añadirá un **tooltip** al pasar el ratón sobre cualquier celda: al hacer `hover`, aparecerá un texto en español con la duración total en formato "Xh Ymin estudiando" (o el total en minutos si es menor de 60). Esto cumple RF-5 al no tener valores numéricos visibles por defecto, y permite a CC-2 que el usuario compruebe la suma de minutos al interactuar con el mapa.

## Requisitos no funcionales
- **RNF-1**: Sin frameworks, sin librerías, sin compilación. La vista debe añadirse directamente a los tres archivos existentes.
- **RNF-2**: Debe funcionar abriendo index.html por doble clic, sin servidor, sin CORS.
- **RNF-3**: Todos los textos y mensajes deben estar en español.
- **RNF-4**: Los datos deben persistir en localStorage con la clave `study-sessions`; el mapa debe leer los datos de ahí.

## Casos límite
- **CC-1**: Si el usuario tiene menos de 4 semanas de datos, el mapa debe llenar solo las semanas disponibles y dejar celdas vacías/desactivadas para completar el período de 4 semanas.
- **CC-2**: Si hay múltiples sesiones en un mismo día, los minutos deben sumarse para calcular la intensidad.
- **CC-3**: La fecha del formulario permite días pasados; el mapa debe incluir esas fechas en el cálculo de las 4 semanas si están dentro del rango.
- **CC-4**: El mensaje "No hay sesiones registradas aún" solo aparece cuando realmente no hay sesiones guardadas en localStorage. Antes del fix, este mensaje aparecía incluso cuando había sesiones debido a que el renderizado no ocultaba el estado vacío.

## Fuera de alcance
- **OOS-1**: No se implementará cálculo de "mejor racha" dentro del mapa; eso es una feature separada.
- **OOS-2**: No se añaden controles de exportación o descarga de la imagen del mapa.
- **OOS-3**: No se implementa modo oscuro/clear aparte de los colores de intensidad definidos.

## Criterios de finalización
- El mapa de calor es visible en la página, debajo del streak display.
- Clickeando/abriendo la página se ven 28 celdas (4 semanas × 7 días) con el comportamiento descrito.
- Los días con sesión tienen color según minutos; los días sin sesión son grises/desactivados.
- La vista se adapta a móvil sin romperse.
- No se han añadido nuevas dependencias ni archivos fuera de los tres originales.

## Dudas resueltas
- **Paleta de colores**: Definir `hsl()` con luminosidad variable basada en minutos (más ligera = pocos minutos, más oscura = muchos). Flexible para ajustes posteriores sin redefinir tonos fijos. **Decisión final**: Usar 5 tonos hex fijos según RF-2 (`#a5d6a7`, `#81c784`, `#66bb6a`, `#4caf50`, `#1b5e20`).
- **Indicación de día actual**: Resaltar la celda de hoy con un borde o sombra extra (distinta al color de intensidad). Mantiene el foco en el color de minutos. **Pendiente**: No implementado en esta versión; se deja para futura mejora.
- **Recálculo automático**: Recalcular al instante al enviar el formulario. El mapa actualiza sin necesidad de recargar la página, mejorando la fluidez de la experiencia. **Implementado**: `renderHeatMap()` se llama en el event listener del formulario y al cargar la página.

## Bugs corregidos durante la implementación
- **Heat-map no visible**: Estaba dentro del `<header>` (flex container con `justify-content: space-between`), posicionándose a la derecha de los streaks en vez de debajo. **Fix**: Movido a `<section id="heat-map-section" class="heat-map-section">` inmediatamente después del `</header>`.
- **Rachas y estadísticas en 0**: `renderHeatMap()` fallaba con `TypeError: can't access property "className", element is undefined` porque el HTML tenía 27 celdas pero `getHeatMapCells` genera 28. Al iterar 28 veces, `children[27]` era `undefined`. El error detenía toda la ejecución JS, incluyendo `updateStreakDisplay()` y `updateWeekMinutesDisplay()`. **Fix**: Añadida la celda 28 faltante en `index.html`.
- **Datos sucios en localStorage**: Fechas con componente de tiempo (`2026-10-03T10:00:00.000Z`), minutos como string (`"30"`), campos vacíos hacían que los cálculos devolvieran 0. **Fix**: `getSessions()` ahora sanitiza: trunca fecha a `YYYY-MM-DD`, `parseInt` en minutos, filtra entradas inválidas, maneja JSON corrupto.