# tasks.md - Objetivo Semanal

## Orden de dependencia

- [x] **T1: Añadir estructura HTML del objetivo semanal en el header**
  - **RF**: RF‑1, RF‑2, RF‑3, RF‑4, RF‑5
  - **Hecho cuando**: El `index.html` incluye dentro de `.week-minutes` (en header): wrapper `.weekly-goal-wrapper`, texto "Esta semana: X min / Objetivo: Y min" con spans `#week-minutes`, `#weekly-goal-text`, `#weekly-goal-value`, barra `#weekly-progress` con fill `#weekly-progress-fill`, icono `#weekly-goal-check`, y controles edición `#weekly-goal-edit` con input `#weekly-goal-input` (min=1) y botones `#weekly-goal-save` / `#weekly-goal-clear`. Verificado con `node --test` (T5a–T5d).

- [x] **T2: Estilar objetivo semanal y barra de progreso en CSS**
  - **RF**: RF‑3 (barra, colores, icono), RF‑4/RF‑5 (controles edición), RNF‑5 (accesibilidad)
  - **Hecho cuando**: `.weekly-goal-wrapper` (flex column, gap). `.weekly-progress` (height 4px, bg #e2e8f0, border-radius 2px). `.weekly-progress-fill` (height 100%, width 0%, bg var(--success), transition width 0.3s). `.complete` (bg #276749). `.weekly-goal-check` (verde intenso, hidden por defecto). Controles edición: input compacto, botones `.btn-small` (padding reducido). Focus visible en input y botones. Responsive: barra 100% ancho en móvil. Verificado visualmente en Chrome DevTools (375px, 768px, 1024px+).

- [x] **T3: Implementar `getWeeklyGoal()` y `saveWeeklyGoal(goal)` en app.js**
  - **RF**: RF‑6 (persistencia localStorage)
  - **Hecho cuando**: `getWeeklyGoal()` lee `study-weekly-goal`, parseInt, valida > 0, devuelve number|null (try/catch JSON). `saveWeeklyGoal(goal)` guarda number o borra clave si null. Código en app.js, verificado con tests unitarios (T1, T2).

- [x] **T4: Implementar `calculateProgress(weekMinutes, goal)` y `formatGoalText(goal)` en app.js**
  - **RF**: RF‑3 (progreso 0-100%), RF‑2 (texto objetivo)
  - **Hecho cuando**: `calculateProgress` devuelve 0 si goal null/≤0, sino `Math.min(Math.round(weekMinutes/goal*100), 100)`. `formatGoalText` devuelve '' si goal null/≤0, sino ` / Objetivo: ${goal} min`. Código en app.js, verificado con tests unitarios (T3, T4).

- [x] **T5: Implementar `renderWeeklyGoal()` e integrar en flujo existente**
  - **RF**: RF‑1 a RF‑7 (render completo, actualización automática)
  - **Hecho cuando**: `renderWeeklyGoal()` lee sesiones, calcula weekMinutes, goal, progress; actualiza DOM: textos, barra width, clase `.complete`, icono hidden, muestra/oculta controles. Se llama en: (1) inicialización al cargar página, (2) `updateWeekMinutesDisplay()` tras actualizar week-minutes, (3) event listener formulario tras `saveSessions()`. Edición inline: click en texto objetivo → muestra input con valor actual → Enter/blur guarda (`saveWeeklyGoal` + `renderWeeklyGoal`) → Escape cancela. Botón "Borrar" → `saveWeeklyGoal(null)` + `renderWeeklyGoal()`. Verificado manualmente: fijar objetivo, ver barra, editar, borrar, recargar persiste.

- [x] **T6: Probar funciones puras con `node --test`**
  - **RF**: RNF‑2, RF‑1 a RF‑7 (cobertura)
  - **Hecho cuando**: Ejecutar `node --test test/weekly-goal.test.js` supera todos los asserts: `getWeeklyGoal` casos, `saveWeeklyGoal`, `calculateProgress` (0%, 50%, 100%, 150%→100%, sin objetivo), `formatGoalText`, tests estructura HTML (T5a–T5d).

- [ ] **T7: Verificar responsividad y UX en Chrome DevTools**
  - **RF**: RF‑3 (barra visible), RF‑4/RF‑5 (edición usable en móvil), RNF‑5
  - **Hecho cuando**: Verificado en Chrome DevTools: 375px (móvil) → barra ancho completo, input usable, botones tocables; 768px (tablet) → layout correcto; 1024px+ (desktop) → barra ancho contenido. Progreso ≥100% muestra verde intenso + ✓. Edición inline fluida. Sin errores en consola.

---

*Checkboxes: [x] T1-T6 done, [ ] T7 pending*