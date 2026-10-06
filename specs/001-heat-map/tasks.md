# tasks.md - Mapa de Calor

## Orden de dependencia

- [x] **T1: Añadir contenedor HTML del mapa de calor**
  - **RF**: RF‑1 (grid de 28 celdas que terminan hoy), RF‑5 (tooltip en las celdas)
  - **Hecho cuando.**: El `index.html` incluye una `<section id="heat-map-section" class="heat-map-section">` **debajo del `</header>`** (fuera del flex container), con un `<div id="heat-map" class="heat-map">` conteniendo **exactamente 28** `<div class="cell sessionless">` elementos, cada uno con `data-tooltip=""`. Verificado con `node --test` (T1a–T1d).

- [x] **T2: Estilar el grid responsivo con CSS**
  - **RF**: RF‑4 (grid fluido), RF‑3 (opacity 0.4 para días sin sesión), RF‑2 (colores de intensidad), RF‑5 (tooltip visual)
  - **Hecho cuando.**: `.heat-map-section` tiene estilos de card (fondo blanco, padding, border-radius, box-shadow, max-width centrado). `.heat-map` usa media queries explícitas: `@media (min-width: 1024px) { grid-template-columns: repeat(7, 1fr); }` / `@media (min-width: 768px) and (max-width: 1023px) { repeat(3, 1fr); }` / `@media (min-width: 480px) and (max-width: 767px) { repeat(2, 1fr); }` / `@media (max-width: 479px) { 1fr; }`. `.cell` con `aspect-ratio: 1; border-radius: 4px;`. `.sessionless { opacity: 0.4; }`. Tooltip `::after` funcional.

- [x] **T3: Implementar `computeIntensity(minutos)` en app.js**
  - **RF**: RF‑2 (escala de 5 tonalidades de verde)
  - **Hecho cuando.**: Devuelve `#a5d6a7` (0‑60), `#81c784` (61‑120), `#66bb6a` (121‑180), `#4caf50` (181‑240), `#1b5e20` (241+). Código en app.js líneas 84‑90, verificado con tests.

- [x] **T4: Implementar `formatTooltipMinutos(minutos)` en app.js**
  - **RF**: RF‑5 (tooltip en español sin valores estáticos en celda)
  - **Hecho cuando.**: Devuelve `"0min estudiando"`, `"45min estudiando"`, `"1h 30min estudiando"`, etc. Código en app.js líneas 96‑103, verificado con tests.

- [x] **T5: Implementar `getHeatMapCells(hoy, sesiones)` en app.js**
  - **RF**: RF‑1 (grid de 28 celdas terminando hoy), RF‑2 (asignar intensidad), RF‑3 (marcar días sin sesión)
  - **Hecho cuando.**: Devuelve array de 28 objetos `{date, minutos, hasSession, color}`; `hasSession` es `false` cuando `minutos` es 0, y `color` usa `computeIntensity`. Suma minutos de múltiples sesiones en un mismo día (RF‑2). Código en app.js líneas 129‑145.

- [x] **T6: Integrar lógica de renderizado al cargar la página y al enviar el formulario**
  - **RF**: RF‑1‑RF‑5 (mostrar mapa, actualizar al nuevo dato)
  - **Hecho cuando.**: Al abrir `index.html` el mapa muestra celdas con colores y tooltips correctos según `localStorage` (vía `getSessions()` sanitizado). Al enviar el formulario, el mapa se actualiza sin recargar. `renderHeatMap()` en app.js líneas 340‑352 y event listener del formulario líneas 307‑337.

- [x] **T7: Probar las funciones puras con `node --test`**
  - **RF**: RNF‑2 (tests sin dependencias), RF‑1‑RF‑5 (cobertura de requisitos)
  - **Hecho cuando.**: Ejecutar `node --test test/heat-map.test.js` supera todos los asserts: `computeIntensity` rangos, `formatTooltipMinutos` formatos español, `sumMinutosPorDia` suma múltiples sesiones/día (RF‑2), casos límite. Tests de estructura HTML (T1a–T1d) verifican contenedor, 28 celdas, tooltips, orden DOM.

- [x] **T7b: Corregir visualización del mensaje "No hay sesiones registradas aún"**
  - **RF**: Funcionalidad core (mostrar/ocultar estado vacío correctamente)
  - **Hecho cuando.**: `renderSessions()` en app.js muestra/oculta `#empty-state` correctamente según sesiones en localStorage. Verificado manualmente.

- [x] **T8: Verificar responsividad visual en móviles y desktop**
  - **RF**: RF‑4 (adaptación del grid)
  - **Hecho cuando.**: Verificado con Chrome DevTools: >=1024px → 7 cols, >=768px → 3 cols, >=480px → 2 cols, <480px → 1 col. 28 celdas siempre se reacomodan sin romper layout.

- [x] **T9: Bug fix - Heat-map posicionado incorrectamente (dentro de `<header>`)**
  - **RF**: RF‑1 (mapa visible debajo del streak display)
  - **Hecho cuando.**: El heat-map estaba dentro del `<header>` (flex con `justify-content: space-between`), apareciendo a la derecha de los streaks. **Fix**: Movido a `<section id="heat-map-section">` tras `</header>` en index.html; añadido CSS `.heat-map-section` con estilos de card coherentes.

- [x] **T10: Bug fix - TypeError en renderHeatMap (27 vs 28 celdas)**
  - **RF**: RF‑1, RF‑2, RF‑3, RF‑4, RF‑5 (mapa funcional y stats actualizadas)
  - **Hecho cuando.**: HTML tenía 27 celdas hardcodeadas pero `getHeatMapCells` genera 28. `renderHeatMap` fallaba en `children[27]` → `TypeError`, deteniendo toda la ejecución JS (rachas/week-minutes/days-month se quedaban en 0). **Fix**: Añadida la celda 28 faltante en index.html (ahora 28 celdas).

- [x] **T11: Bug fix - Sanitización de datos en getSessions()**
  - **RF**: RNF‑4 (leer datos de localStorage), funcionalidad core (rachas/estadísticas correctas)
  - **Hecho cuando.**: Datos sucios en localStorage (fechas ISO con time, minutos como string, campos vacíos) hacían que cálculos devolvieran 0. **Fix**: `getSessions()` ahora sanitiza: trunca fecha a `YYYY-MM-DD`, `parseInt` en minutos, filtra inválidos (fecha malformada, tema vacío, minutos ≤ 0), try/catch en JSON.parse. Verificado con datos de prueba incluyendo formatos sucios.

---
*Checkboxes: [] pending, [x] done*