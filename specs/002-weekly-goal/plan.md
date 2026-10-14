# Plan: Objetivo Semanal (specs/002-weekly-goal)

Documenta el plan para implementar la funcionalidad de objetivo semanal de minutos de estudio, cubriendo archivos, funciones puras, algoritmo, pintado en UI, decisiones técnicas, estrategia de tests y cobertura de RF.

## Archivos modificados/creados

- **index.html**: Modifica el `<span class="week-minutes">` en el header para incluir:
  - Contenedor wrapper `.weekly-goal-wrapper` que agrupa texto + barra + controles de edición.
  - Texto dinámico: "Esta semana: <strong id="week-minutes">0</strong> min" + (si hay objetivo) " / Objetivo: <strong id="weekly-goal-value">Y</strong> min".
  - Barra de progreso: `<div id="weekly-progress" class="weekly-progress"><div id="weekly-progress-fill" class="weekly-progress-fill"></div></div>`.
  - Icono check: `<span id="weekly-goal-check" class="weekly-goal-check" hidden>✓</span>`.
  - Controles de edición (ocultos por defecto): input number + botones guardar/borrar.

- **styles.css**: Añade estilos para:
  - `.weekly-goal-wrapper` (display: flex, flex-direction: column, gap: 0.25rem, align-items: flex-start).
  - `.weekly-progress` (width: 100%, height: 4px, background: #e2e8f0, border-radius: 2px, overflow: hidden).
  - `.weekly-progress-fill` (height: 100%, width: 0%, background: var(--success), border-radius: 2px, transition: width 0.3s, background-color 0.3s).
  - `.weekly-progress-fill.complete` (background: #276749).
  - `.weekly-goal-check` (font-size: 0.75rem, color: #276749, margin-left: 0.25rem).
  - Controles edición: `.weekly-goal-edit` (display: flex, gap: 0.25rem, width: 100%), input number compacto, botones pequeños.
  - Responsive: en móvil (<480px) la barra ocupa ancho completo; en desktop se limita a ancho del contenedor de texto.

- **app.js**: Añade las siguientes **funciones puras** (sin side-effects):
  1. `getWeeklyGoal(): number | null` — Lee `localStorage.getItem('study-weekly-goal')`, parsea a int, valida > 0, devuelve número o null.
  2. `saveWeeklyGoal(goal: number | null): void` — Guarda en localStorage (null borra la clave).
  3. `calculateProgress(weekMinutes: number, goal: number | null): number` — Devuelve porcentaje 0-100 (min(weekMinutes / goal * 100, 100)) o 0 si no hay objetivo.
  4. `formatGoalText(goal: number | null): string` — Devuelve string para mostrar: `goal ? \` / Objetivo: ${goal} min\` : ''`.
  5. `renderWeeklyGoal()`: Actualiza DOM del objetivo (texto, barra, icono, controles) — **tiene side-effects (DOM)**.

  **Integración con flujo existente**:
  - En `updateWeekMinutesDisplay()`: tras actualizar `weekMinutesSpan`, llamar a `renderWeeklyGoal()`.
  - En event listener del formulario: tras `saveSessions()` y `updateWeekMinutesDisplay()`, `renderWeeklyGoal()` se llama automáticamente.
  - Al cargar página: `renderWeeklyGoal()` en inicialización.

## Funciones puras de lógica

| Función | Parámetros | Devolución | RF |
|---|---|---|---|
| `getWeeklyGoal()` | — | `number \| null` | RF-6 |
| `saveWeeklyGoal(goal)` | `number \| null` | `void` | RF-6 |
| `calculateProgress(weekMinutes, goal)` | `number, number \| null` | `number` (0-100) | RF-3 |
| `formatGoalText(goal)` | `number \| null` | `string` | RF-2 |

**`calculateProgress(weekMinutes, goal)`**:
- Si `goal === null` o `goal <= 0` → return 0
- `progress = Math.min(Math.round((weekMinutes / goal) * 100), 100)`
- Return `progress`

**`formatGoalText(goal)`**:
- Si `goal === null` o `goal <= 0` → return `''`
- Return ` \` / Objetivo: ${goal} min\``

## Algoritmo de renderizado en pseudocódigo

```
function renderWeeklyGoal():
    weekMinutes = calculateWeekMinutes(getSessions())
    goal = getWeeklyGoal()
    progress = calculateProgress(weekMinutes, goal)

    # Actualizar texto "Esta semana: X min / Objetivo: Y min"
    weekMinutesSpan.textContent = weekMinutes
    if goal !== null:
        goalValueSpan.textContent = goal
        goalTextSpan.textContent = formatGoalText(goal)  # " / Objetivo: Y min"
        goalWrapper.style.display = 'flex'  # mostrar barra y controles
    else:
        goalTextSpan.textContent = ''
        goalWrapper.style.display = 'none'  # ocultar barra y controles

    # Actualizar barra de progreso
    progressFill.style.width = progress + '%'
    if progress >= 100:
        progressFill.classList.add('complete')
        goalCheck.hidden = false
    else:
        progressFill.classList.remove('complete')
        goalCheck.hidden = true
```

## Cómo se pinta en la interfaz

1. **HTML estructura** (dentro de header > .streaks > .week-minutes):
   ```html
   <span class="week-minutes weekly-goal-wrapper">
     <span>Esta semana: <strong id="week-minutes">0</strong> min</span>
     <span id="weekly-goal-text" class="weekly-goal-text"><span id="weekly-goal-value"></span></span>
     <div id="weekly-progress" class="weekly-progress" hidden>
       <div id="weekly-progress-fill" class="weekly-progress-fill"></div>
     </div>
     <span id="weekly-goal-check" class="weekly-goal-check" hidden>✓</span>
     <div id="weekly-goal-edit" class="weekly-goal-edit" hidden>
       <input type="number" id="weekly-goal-input" min="1" placeholder="Minutos">
       <button type="button" id="weekly-goal-save" class="btn-small">Guardar</button>
       <button type="button" id="weekly-goal-clear" class="btn-small">Borrar</button>
     </div>
   </span>
   ```

2. **Interacción edición**:
   - Click en `.weekly-goal-text` o `.weekly-goal-value` → muestra `.weekly-goal-edit`, oculta texto, foca input con valor actual.
   - Input: Enter o blur → valida > 0 → `saveWeeklyGoal(valor)` → `renderWeeklyGoal()`.
   - Botón "Borrar" → `saveWeeklyGoal(null)` → `renderWeeklyGoal()`.
   - Escape → cancela edición, restaura vista.

3. **Estados visuales**:
   - Sin objetivo: solo "Esta semana: X min", barra oculta.
   - Con objetivo < 100%: barra verde normal, sin ✓.
   - Con objetivo ≥ 100%: barra verde intenso (`.complete`), ✓ visible.

## Decisiones técnicas justificadas

| Decisión | Justificación | Alternativa descartada |
|---|---|---|
| **Edición inline en header** | Aprovecha espacio existente; no añade elementos que rompan layout responsive; coherente con diseño minimalista. | Modal/popup o sección aparte. Descartada: añade complejidad JS y rompe flujo visual simple. |
| **Barra horizontal 4px** | Compacta, legible en header, funciona en 1 columna móvil. | Anillo circular o badge porcentual. Descartada: ocupa más espacio vertical/horizontal. |
| **Clave localStorage separada** (`study-weekly-goal`) | Aislamiento: borrar sesiones no borra objetivo; migración independiente; debugging fácil. | Guardar dentro de array sesiones o misma clave. Descartada: acoplamiento innecesario. |
| **Icono ✓ + color cambio al 100%** | Cumple RNF-5 (accesibilidad): no solo color, también icono y texto implícito. | Solo cambio de color de barra. Descartada: no accesible para daltónicos. |
| **`calculateProgress` función pura** | Testable en Node sin DOM; reutilizable; separa lógica de render. | Lógica inline en `renderWeeklyGoal`. Descartada: dificulta tests unitarios. |
| **Input number min=1** | Validación nativa del navegador + validación JS redundante. | Input text + regex. Descartada: menos UX nativa. |

## Estrategia de tests con `node --test`

Se crea `test/weekly-goal.test.js` usando `node --test` nativo:

```js
// test/weekly-goal.test.js
import assert from 'node:assert';

// Funciones puras reimplementadas localmente (misma lógica que app.js)
function getWeeklyGoal() { /* leer localStorage mock */ }
function saveWeeklyGoal(goal) { /* mock */ }
function calculateProgress(weekMinutes, goal) { /* ... */ }
function formatGoalText(goal) { /* ... */ }

// Tests unitarios:
# T1: getWeeklyGoal - null, 0, negativo, positivo
# T2: saveWeeklyGoal - guarda número, borra con null
# T3: calculateProgress - 0%, 50%, 100%, 150% (cap at 100), sin objetivo
# T4: formatGoalText - null → '', 300 → ' / Objetivo: 300 min'

// Tests estructura HTML (similar a T1a-T1d heat-map):
# T5a: Contenedor .weekly-goal-wrapper existe en header
# T5b: Barra de progreso #weekly-progress existe
# T5c: Input edición #weekly-goal-input existe
# T5d: Botones guardar/borrar existen
```

**Ejecución**: `node --test test/weekly-goal.test.js` (sin servidor, sin build).

## Mapa de cobertura de Requisitos Funcionales

| RF | Parte del plan que la cubre |
|---|---|
| **RF‑1** | `getWeeklyGoal`/`saveWeeklyGoal` + input edition en `renderWeeklyGoal` |
| **RF‑2** | `formatGoalText` + actualización `weekly-goal-text` en `renderWeeklyGoal` |
| **RF‑3** | `calculateProgress` + barra `.weekly-progress-fill` + `.complete` + `✓` |
| **RF‑4** | Click en valor → muestra `.weekly-goal-edit` → input number → save |
| **RF‑5** | Botón "Borrar" → `saveWeeklyGoal(null)` → oculta barra/texto objetivo |
| **RF‑6** | `getWeeklyGoal`/`saveWeeklyGoal` usan `localStorage` clave `study-weekly-goal` |
| **RF‑7** | Usa `calculateWeekMinutes` existente (Lunes-Domingo local) |
| **RNF‑1** | Solo 3 archivos modificados, sin deps |
| **RNF‑2** | Funciona doble clic, tests Node |
| **RNF‑3** | Strings en español |
| **RNF‑4** | Hora local consistente |
| **RNF‑5** | Icono ✓ + color, focus visible, label accesible |
| **CC‑1** | Validación > 0 en save + input min=1 |
| **CC‑2** | Input vacío / botón Borrar → null |
| **CC‑3** | progress ≥ 100 → `.complete` + ✓ |
| **CC‑4** | `renderWeeklyGoal()` recalcula al cambiar goal |
| **CC‑5** | `getWeeklyGoal` try/catch + validación |
| **CC‑6** | `updateWeekMinutesDisplay` ya recalcula al cargar |

---

*Fin del plan.*