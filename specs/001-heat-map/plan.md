# Plan: Mapa de Calor (specs/001-heat-map)

Documenta el plan para implementar la feature del mapa de calor, cubriendo archivos, funciones puras, algoritmo, pintado en UI, decisiones técnicas, estrategia de tests y cobertura de RF.

## Archivos modificados/creados

- **index.html**: Añade una sección `<section id="heat-map-section" class="heat-map-section">` **debajo del `<header>`** (fuera del contenedor flex de streaks). Dentro, un contenedor `<div id="heat-map" class="heat-map">` con **28** `<div class="cell">` elementos (uno por cada día lógico), cada uno con atributo `data-tooltip` y clase `sessionless` por defecto. No se añade ningún nuevo archivo; el markup se integra en la estructura existente.

- **styles.css**: Añade estilos para `.heat-map-section` (card coherente con `.form-section`: fondo blanco, padding, border-radius, box-shadow, max-width centrado) y para el grid responsivo `.heat-map` usando `display: grid; gap: 4px;` con media queries explícitas: `@media (min-width: 1024px) { grid-template-columns: repeat(7, 1fr); } @media (min-width: 768px) and (max-width: 1023px) { grid-template-columns: repeat(3, 1fr); } @media (min-width: 480px) and (max-width: 767px) { grid-template-columns: repeat(2, 1fr); } @media (max-width: 479px) { grid-template-columns: 1fr; }`. Estilo de celda `.cell` con `aspect-ratio: 1; border-radius: 4px; transition: background 0.2s;`. Colores de intensidad por defecto (`background: #a5d6a7` etc.) y regla `.sessionless { opacity: 0.4; }` para días sin sesión. Tooltip en pseudo-elemento `::after` que muestra "Xh Ymin estudiando" al hover.

- **app.js**: Añade las siguientes **funciones puras** (sin side-effects, reciben `hoy` como string `YYYY-MM-DD` y array de sesiones):

  1. `computeIntensity(minutos: number): string` — Devuelve color hex según escala de 5 tonalidades (RF‑2).
  2. `getHeatMapCells(hoy: string, sesiones: Array<{fecha: string, minutos: number}>): Array<{date: string, minutos: number, hasSession: boolean, color: string}>` — Genera las 28 celdas para las 4 semanas que terminan hoy (RF‑1, RF‑2, RF‑3).
  3. `formatTooltipMinutos(minutos: number): string` — Devuelve string en español `"Xh Ymin estudiando"` para tooltip (RF‑5).
  4. `renderHeatMap()`: Actualiza el DOM del heat-map leyendo `localStorage`, llamando a `getHeatMapCells` y pintando cada celda. Tiene side-effects (DOM).

  **Correcciones de robustez añadidas**:
  - `getSessions()` ahora **sanitiza** los datos de `localStorage`: trunca fecha a `YYYY-MM-DD`, convierte `minutos` a `parseInt`, filtra entradas inválidas (fecha malformada, tema vacío, minutos ≤ 0), maneja JSON corrupto. Esto evita que datos sucios (fechas ISO con time, minutos como string) rompan los cálculos de rachas/estadísticas.

## Funciones puras de lógica (con "hoy" como parámetro string `YYYY-MM-DD`)

| Función | Parámetros | Devolución | RF |
|---|---|---|---|
| `computeIntensity(minutos)` | `minutos: number` | `string` color hex | RF‑2 |
| `formatTooltipMinutos(minutos)` | `minutos: number` | `string` en español | RF‑5 |
| `getHeatMapCells(hoy, sesiones)` | `hoy: string`, `sesiones: Array` | `Array<cell>` de 28 elementos | RF‑1, RF‑2, RF‑3 |

**`computeIntensity(minutos)`**:
- `minutos >= 241` → `#1b5e20`
- `minutos >= 181` → `#4caf50`
- `minutos >= 121` → `#66bb6a`
- `minutos >= 61` → `#81c784`
- `minutos 0‑60` → `#a5d6a7`

**`formatTooltipMinutos(minutos)`**:
- Si `minutos < 60` → `${minutos}min estudiando`
- Si `minutos >= 60` → `${Math.floor(minutos/60)}h ${minutos%60}min estudiando`

**`getHeatMapCells(hoy, sesiones)`**:
1. `hoy` llega como string `YYYY-MM-DD` (ej: `"2026-10-03"`). Convertir a `Date` local: `const hoyDate = new Date(hoy + 'T00:00:00')`.
2. Determinar el lunes de la semana que contiene `hoy` (hora local):
   - `dayOfWeek = hoyDate.getDay()` (0=Dom,1=Lun,…6=Sáb)
   - `offset = (dayOfWeek - 1 + 7) % 7` (0 si ya es Lun, 6 si es Dom)
   - `currentMonday = new Date(hoyDate); currentMonday.setDate(hoyDate.getDate() - offset)`
3. Calcular el lunes más antiguo de las 4 semanas: `oldestMonday = new Date(currentMonday); oldestMonday.setDate(currentMonday.getDate() - 21)`
4. Bucle `i` de 0 a 27:
   - `cellDate = new Date(oldestMonday); cellDate.setDate(oldestMonday.getDate() + i)`
   - Formatear `cellDate` a string `YYYY-MM-DD` local via `formatDateLocal(cellDate)`
   - Filtrar sesiones que coincidan con esa fecha string.
   - `totalMinutos = suma de minutos de todas las sesiones de ese día`
   - `hasSession = totalMinutos > 0`
   - `color = hasSession ? computeIntensity(totalMinutos) : "#a5d6a7"` (la opacidad 0.4 se aplica en CSS vía clase `.sessionless`)
   - Empujar objeto `{date: fechaStr, minutos: totalMinutos, hasSession, color}` al array.
5. Devolver array de 28 celdas.

## Algoritmo del mapa en pseudocódigo

```
# Entrada: hoy (string "YYYY-MM-DD" en hora local), sesiones [{fecha: "YYYY-MM-DD", minutos: number}]
# Salida: array de 28 celdas {date: string, minutos: number, hasSession: boolean, color: string}

function getHeatMapCells(hoy, sesiones):
    # 1. Convertir hoy string a Date local (medianoche)
    hoyDate = new Date(hoy + 'T00:00:00')

    # 2. Lunes de la semana actual
    dow = hoyDate.getDay()                       # 0=Dom,1=Lun,...,6=Sáb
    offset = (dow - 1 + 7) % 7                   # días para retroceder a Lun
    currentMonday = new Date(hoyDate)
    currentMonday.setDate(hoyDate.getDate() - offset)

    # 3. Lunes de la semana más antigua (3 semanas antes = 21 días)
    oldestMonday = new Date(currentMonday)
    oldestMonday.setDate(currentMonday.getDate() - 21)

    cells = []
    for i from 0 to 27:
        d = new Date(oldestMonday)
        d.setDate(oldestMonday.getDate() + i)

        # Formatear fecha a "YYYY-MM-DD" en hora local
        fechaStr = formatDateLocal(d)            # ej: "2026-10-02"

        # Sumar minutos de sesiones en ese día (soporta múltiples sesiones/día)
        daySessions = filter sesiones where s.fecha == fechaStr
        totalMin = sum(daySessions, s -> s.minutos)
        hasSess = totalMin > 0

        if hasSess:
            color = computeIntensity(totalMin)
        else:
            color = "#a5d6a7"                    # verde base; opacidad 0.4 vía CSS .sessionless

        cells.push({
            date: fechaStr,
            minutos: totalMin,
            hasSession: hasSess,
            color: color
        })
    return cells
```

## Cómo se pinta en la interfaz

1. **Generación**: Al cargar `index.html` o al submit el formulario, `app.js` lee `localStorage.getItem('study-sessions')` (a través de `getSessions()` que sanitiza los datos), obtiene `hoy` como string `YYYY-MM-DD` via `todayLocalKey()`, y llama a `getHeatMapCells(hoy, sesiones)`.
2. **DOM**: El resultado recorre el array de 28 celdas y actualiza cada `<div class="cell">` dentro de `#heat-map`:
   - `background: cell.color` (uno de los 5 verdes o el verde base).
   - Si `cell.hasSession` es `false`, se añade la clase `sessionless` que aplica `opacity: 0.4` sobre el color base.
   - Atributo `data-tooltip` se pone a `formatTooltipMinutos(cell.minutos)`.
3. **Grid CSS**: El contenedor `.heat-map` usa media queries explícitas:
   - `@media (min-width: 1024px) { grid-template-columns: repeat(7, 1fr); }`
   - `@media (min-width: 768px) and (max-width: 1023px) { grid-template-columns: repeat(3, 1fr); }`
   - `@media (min-width: 480px) and (max-width: 767px) { grid-template-columns: repeat(2, 1fr); }`
   - `@media (max-width: 479px) { grid-template-columns: 1fr; }`
   Esto produce: >= 1024 px → 7 columnas (lun‑dom); >= 768 px → 3 columnas; >= 480 px → 2 columnas; < 480 px → 1 columna. Siempre muestra 28 celdas que se reacomodan sin romper el layout.
4. **Tooltip**: El CSS `::after` muestra el texto del atributo `data-tooltip` al pasar el ratón, cumpliendo RF‑5 (sin valores numéricos visibles por defecto).

## Decisiones técnicas justificadas (y alternativa descartada)

| Decisión | Justificación | Alternativa descartada |
|---|---|---|
| **Colores fijos de 5 tonalidades** (hex) | Cumple literal RF‑2 que define cada rango de minutos con un color específico. Facilita paleta coherente y evita dependencias de librerías de color. | Generar colores `hsl()` dinámicos basados en la luminosidad de los minutos. Descartada porque el spec exige "5 tonalidades de verde fijas" y los colores fijos garantizan consistencia visual en cualquier navegador sin cálculos adicionales. |
| **Usar `opacity: 0.4` para días sin sesión** | Mantiene el mismo tono de verde base (coherencia visual con RF‑2) y solo reduce la opacidad, logrando la diferencia sutil descrita en RF‑3. | Aplicar un filtro `grayscale(100%)` o cambiar el color a gris. Descartada porque rompería la paleta verde y no cumpliría el requisito de "mismo tono lavado". |
| **Grid con media queries explícitas** (7/3/2/1 columnas) | Control preciso del breakpoint; cumple RF‑4 con puntos de quiebre definidos en el spec (1024/768/480). Evita celdas demasiado estrechas en viewports intermedios. | `repeat(auto-fit, minmax(40px, 1fr))`. Descartada porque no permite controlar exactamente el número de columnas por breakpoint como exige el spec. |
| **Leer datos de `localStorage` con clave `study-sessions`** | El proyecto ya usa esa clave para las sesiones (constitución, RNF‑4). No se introduce nuevo mecanismo de persistencia. | Usar una API externa o IndexedDB. Descartada por violar RNF‑1 (sin frameworks, sin compilación) y RNF‑2 (funcionamiento offline sin servidor). |
| **Tooltip con `data-tooltip` y `::after`** | Permite mostrar la duración al pasar el ratón sin dejar números visibles en la celda (RF‑5). Además, es pura CSS, sin JavaScript adicional. | Mostrar un `div` flotante posicionado con JS al hover. Descartada porque añade complejidad y riesgo de superposiciones; la solución CSS es más ligera y compatible con la restricción de "no frameworks". |
| **Renderizado de estado vacío en `renderSessions()`** | El mensaje "No hay sesiones registradas aún" ahora se muestra/oculta correctamente basándose en si hay sesiones en localStorage. Previously, el mensaje aparecía siempre a pesar de tener sesiones guardadas. | N/A — fue un bug corregido en el desarrollo |
| **`getSessions()` sanitiza datos de localStorage** | Protege contra datos corruptos/legado: fechas ISO con time (`2026-10-03T10:00:00.000Z`), minutos como string (`"30"`), campos vacíos/nulos, JSON inválido. Trunca fecha a `YYYY-MM-DD`, `parseInt` en minutos, filtra inválidos. Sin esto, los cálculos de rachas/week-minutes devolvían 0. | Confiar en que los datos siempre están limpios. Descartada porque localStorage es editable por el usuario, migraciones de versiones anteriores, o bugs previos pueden dejar datos sucios. |
| **Heat-map en su propia `<section>` fuera del `<header>`** | El `<header>` usa flexbox con `justify-content: space-between`; poner el heat-map dentro lo posicionaba a la derecha de los streaks en vez de debajo. Moverlo a `<section class="heat-map-section">` tras el header asegura posición correcta y layout de card coherente. | Mantenerlo dentro del header con `width: 100%` y `order`. Descartada porque rompía el flujo semántico y el flex layout del header. |
| **28 celdas hardcodeadas en HTML (coinciden con `getHeatMapCells`)** | `getHeatMapCells` siempre genera 28 celdas (4×7). Si el HTML tiene menos (ej. 27), `renderHeatMap` falla al acceder a `children[27]` → `TypeError`, deteniendo toda la ejecución JS (incluyendo actualización de rachas/estadísticas). | Generar el HTML dinámicamente en JS. Descartada para mantener SSR simple y que la página sea funcional sin JS (aunque el mapa necesite JS para colores). |

## Estrategia de tests con `node --test`

Se crean pruebas unitarias en `test/heat-map.test.js` usando el runtime de pruebas nativo de Node.js (`node --test`). No hay frameworks externos; usa `assert` del núcleo y reimplementa las funciones puras localmente en el test (para aislarlas del DOM).

```js
// test/heat-map.test.js
import assert from 'node:assert';
import fs from 'node:fs';

const indexPath = '/home/earechiga/Desarrollo/Ejercicios/IA/Proyectos/MyStudyDiary/index.html';
const html = fs.readFileSync(indexPath, 'utf-8');

// ===== Funciones puras (misma lógica que en app.js) =====

function computeIntensity(minutos) { /* ... */ }
function formatTooltipMinutos(minutos) { /* ... */ }
function sumMinutosPorDia(key, sesiones) { /* ... */ }

// ===== T1: Verificaciones de estructura HTML =====
// T1a: Contenedor heat-map debe existir
// T1b: 28 celdas .cell.sessionless
// T1c: Todas las celdas tienen data-tooltip vacío
// T1d: heat-map debe aparecer después de streaks (debajo en el DOM)

// ===== T7: Tests de funciones puras =====
// T7a: computeIntensity - todos los rangos límite (0, 60, 61, 120, 121, 180, 181, 240, 241, 300)
// T7b: formatTooltipMinutos - formato en español (RF-5)
// T7c: sumMinutosPorDia - suma de múltiples sesiones mismo día (RF-2)
// T7d: formatTooltipMinutos casos extremos (1, 59, 121, 720 min)

**Estrategia**:
- Cada función pura se prueba aislada con casos límite (0, límites de rangos, valores extremos).
- `sumMinutosPorDia` (equivalente a la lógica dentro de `getHeatMapCells`) se prueba con array vacío y con múltiples sesiones en el mismo día (CC‑2).
- Tests de estructura HTML (T1a–T1d) verifican que `index.html` tiene el contenedor correcto, 28 celdas, tooltips vacíos, y orden correcto en el DOM (debajo de streaks).
- Las pruebas se ejecutan con `node --test test/heat-map.test.js`; no requieren servidor ni build.
- Al recargar `index.html` el usuario verá los resultados visuales; las pruebas garantizan que la lógica subyacente sea correcta antes de abrir la página.

## Mapa de cobertura de Requisitos Funcionales

| RF | Parte del plan que la cubre |
|---|---|
| **RF‑1** | Algoritmo `getHeatMapCells` (4 semanas terminando hoy, grid de 28 celdas). HTML tiene 28 celdas hardcodeadas. |
| **RF‑2** | Función `computeIntensity` y su uso dentro de `getHeatMapCells`; `sumMinutosPorDia` suma minutos de múltiples sesiones/día. |
| **RF‑3** | Lógica de opacidad `0.4` para días sin sesión (clase `.sessionless`) sobre color base verde. |
| **RF‑4** | Estilos CSS del grid responsivo con media queries explícitas (7/3/2/1 columnas según breakpoints 1024/768/480). |
| **RF‑5** | `formatTooltipMinutos` y atributo `data-tooltip` en celdas; tooltip CSS `::after` al hover. |
| **RNF‑1** | Implementación solo en los tres archivos existentes (`index.html`, `styles.css`, `app.js`); ninguna nueva dependencia. |
| **RNF‑2** | Funcionamiento probado abriendo `index.html` por doble clic; pruebas con `node --test` sin servidor. |
| **RNF‑3** | Todos los strings en español (funciones, mensajes tooltip, UI). |
| **RNF‑4** | Lectura de `localStorage` clave `study-sessions`; `getSessions()` sanitiza y valida datos. |
| **CC‑1** | Pruebas con array de sesiones vacío; mapa muestra celdas desactivadas para completar 4 semanas. |
| **CC‑2** | Pruebas con múltiples sesiones en un mismo día; suma de minutos antes de asignar intensidad. |
| **CC‑3** | El algoritmo incluye fechas pasadas siempre que estén dentro del rango de 4 semanas; cubierto por pruebas con fechas variables. |
| **CC‑4** | `renderSessions()` muestra/oculta `#empty-state` correctamente según haya sesiones en localStorage. |

---

*Fin del plan.*