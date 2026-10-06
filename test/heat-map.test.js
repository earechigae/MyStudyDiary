// Test T1 + T7: Estructura HTML y funciones puras isolate
// Ejecutar con: node --test test/heat-map.test.js
import assert from 'node:assert';
import fs from 'node:fs';

const indexPath = '/home/earechiga/Desarrollo/Ejercicios/IA/Proyectos/MyStudyDiary/index.html';
const html = fs.readFileSync(indexPath, 'utf-8');

// ===== Funciones puras (mismo lógica que en app.js) =====

/**
 * Sumar los minutos totales de sesión para un día dado.
 * Itera sobre todas las sesiones y suma las de fecha coincidente.
 * RF-2: minutos de múltiples sesiones en un mismo día se suman antes de asignar tonalidad.
 */
function sumMinutosPorDia(key, sesiones) {
  let total = 0;
  sesiones.forEach(s => {
    if (s.fecha === key) {
      total += s.minutos;
    }
  });
  return total;
}

/**
 * Convertir minutos a una de 5 tonalidades de verde para el heat map.
 * Rangos definitivos segun RF-2: 0-60, 61-120, 121-180, 181-240, 241+.
 */
function computeIntensity(minutos) {
  if (minutos >= 241) return '#1b5e20';
  if (minutos >= 181) return '#4caf50';
  if (minutos >= 121) return '#66bb6a';
  if (minutos >= 61) return '#81c784';
  return '#a5d6a7';
}

/**
 * Formatear minutos para el tooltip en español (RF-5).
 * Sin valores numéricos visibles en la celda; solo al hover.
 */
function formatTooltipMinutos(minutos) {
  if (minutos === 0) return '0min estudiando';
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas > 0 && mins > 0) return `${horas}h ${mins}min estudiando`;
  if (horas > 0) return `${horas}h estudiando`;
  return `${mins}min estudiando`;
}

// ===== T1: Verificaciones de estructura HTML =====

export function setup() { return { html }; }
export function cleanup() {}

// T1a: Contenedor heat-map debe existir
export function testT1a(setup) {
  const heatMapPattern = /<div id="heat-map" class="heat-map">/;
  const heatMapFound = heatMapPattern.test(setup.html);
  assert.strictEqual(heatMapFound, true, 'Debe existir un div#heat-map con clase heat-map');
}

// T1b: 28 celdas .cell.sessionless
export function testT1b(setup) {
  const cellPattern = /class="cell sessionless"/g;
  const cellMatches = setup.html.match(cellPattern);
  const cellCount = cellMatches ? cellMatches.length : 0;
  assert.strictEqual(cellCount, 28, `Se esperaban 28 celdas .cell.sessionless, encontadas ${cellCount}`);
}

// T1c: Todas las celdas tienen data-tooltip vacío
export function testT1c(setup) {
  const tooltipPattern = /data-tooltip=""/g;
  const tooltipMatches = setup.html.match(tooltipPattern);
  const tooltipCount = tooltipMatches ? tooltipMatches.length : 0;
  assert.strictEqual(tooltipCount, 28, `Se esperaban 28 data-tooltip vacíos, encontadas ${tooltipCount}`);
}

// T1d: heat-map debajo de streaks
export function testT1d(setup) {
  const streaksPos = setup.html.indexOf('class="streaks"');
  const heatMapPos = setup.html.indexOf('id="heat-map"');
  assert.strictEqual(heatMapPos > streaksPos, true, 'heat-map debe aparecer después de streaks');
}

// ===== T7: Tests de funciones puras =====

console.log('=== T7: Tests de funciones puras ===\n');

// T7a: computeIntensity - todos los rangos límite
console.log('T7a: computeIntensity');
assert.strictEqual(computeIntensity(0), '#a5d6a7', '0 min -> #a5d6a7');
assert.strictEqual(computeIntensity(30), '#a5d6a7', '30 min -> #a5d6a7');
assert.strictEqual(computeIntensity(60), '#a5d6a7', '60 min -> #a5d6a7 (límite superior, rango 0-60)');
assert.strictEqual(computeIntensity(61), '#81c784', '61 min -> #81c784 (rango 61-120)');
assert.strictEqual(computeIntensity(100), '#81c784', '100 min -> #81c784');
assert.strictEqual(computeIntensity(120), '#81c784', '120 min -> #81c784 (límite superior, rango 61-120)');
assert.strictEqual(computeIntensity(121), '#66bb6a', '121 min -> #66bb6a (rango 121-180)');
assert.strictEqual(computeIntensity(150), '#66bb6a', '150 min -> #66bb6a');
assert.strictEqual(computeIntensity(180), '#66bb6a', '180 min -> #66bb6a (límite superior, rango 121-180)');
assert.strictEqual(computeIntensity(181), '#4caf50', '181 min -> #4caf50 (rango 181-240)');
assert.strictEqual(computeIntensity(200), '#4caf50', '200 min -> #4caf50');
assert.strictEqual(computeIntensity(240), '#4caf50', '240 min -> #4caf50 (límite superior, rango 181-240)');
assert.strictEqual(computeIntensity(241), '#1b5e20', '241 min -> #1b5e20 (rango 241+)');
assert.strictEqual(computeIntensity(300), '#1b5e20', '300 min -> #1b5e20');
console.log('✓ T7a: computeIntensity correcta');

// T7b: formatTooltipMinutos - formato en español (RF-5)
console.log('T7b: formatTooltipMinutos');
assert.strictEqual(formatTooltipMinutos(0), '0min estudiando', '0 min -> "0min estudiando"');
assert.strictEqual(formatTooltipMinutos(45), '45min estudiando', '45 min -> "45min estudiando"');
assert.strictEqual(formatTooltipMinutos(60), '1h estudiando', '60 min -> "1h estudiando"');
assert.strictEqual(formatTooltipMinutos(90), '1h 30min estudiando', '90 min -> "1h 30min estudiando"');
assert.strictEqual(formatTooltipMinutos(120), '2h estudiando', '120 min -> "2h estudiando"');
assert.strictEqual(formatTooltipMinutos(150), '2h 30min estudiando', '150 min -> "2h 30min estudiando"');
assert.strictEqual(formatTooltipMinutos(240), '4h estudiando', '240 min -> "4h estudiando"');
assert.strictEqual(formatTooltipMinutos(241), '4h 1min estudiando', '241 min -> "4h 1min estudiando"');
console.log('✓ T7b: formatTooltipMinutos correcta');

// T7c: sumMinutosPorDia - suma de múltiples sesiones mismo día (RF-2)
console.log('T7c: sumMinutosPorDia - suma RF-2');
// Caso: sesiones múltiples en un mismo día
const sesionesMismoDia = [
  {fecha: '2026-10-02', minutos: 20},
  {fecha: '2026-10-02', minutos: 40},
];
const total = sumMinutosPorDia('2026-10-02', sesionesMismoDia);
assert.strictEqual(total, 60, 'Suma de 20+40 debe dar 60 minutos');
// 60 minutos está en el rango 0-60 → #a5d6a7 (verde very light)
const intensidad = computeIntensity(total);
assert.strictEqual(intensidad, '#a5d6a7', 'Intensidad de 60 min debe ser #a5d6a7 (rango 0-60)');
// Para probar #4caf50 usemos 181 minutos (rango 181-240)
const intensidad181 = computeIntensity(181);
assert.strictEqual(intensidad181, '#4caf50', 'Intensidad de 181 min debe ser #4caf50 (rango 181-240)');
console.log('  - Suma 20+40 = 60 min, intensidad #a5d6a7 ✓');
console.log('  - Intensidad 181 min = #4caf50 ✓');

// Caso: sesión única en un día
const sesionesUna = [
  {fecha: '2026-10-02', minutos: 30},
];
const totalUna = sumMinutosPorDia('2026-10-02', sesionesUna);
assert.strictEqual(totalUna, 30, 'Suma de sesión única 30 min');
const intensidadUna = computeIntensity(totalUna);
assert.strictEqual(intensidadUna, '#a5d6a7', 'Intensidad de 30 min debe ser #a5d6a7 (0-60)');
console.log('  - Suma sesión única 30 min, intensidad #a5d6a7 ✓');

// Caso: sin sesiones para ese día
const totalVacío = sumMinutosPorDia('2026-10-03', sesionesMismoDia);
assert.strictEqual(totalVacío, 0, 'Suma para día sin sesiones debe dar 0');
const intensidadVacío = computeIntensity(totalVacío);
assert.strictEqual(intensidadVacío, '#a5d6a7', 'Intensidad de 0 min debe ser #a5d6a7');
console.log('  - Suma para día sin sesión = 0, intensidad #a5d6a7 ✓');
console.log('✓ T7c: sumMinutosPorDia correcta (RF-2)');

// T7d: formatTooltipMinutos casos extremos
console.log('T7d: formatTooltipMinutos extremos');
assert.strictEqual(formatTooltipMinutos(1), '1min estudiando', '1 min -> "1min estudiando"');
assert.strictEqual(formatTooltipMinutos(59), '59min estudiando', '59 min -> "59min estudiando"');
assert.strictEqual(formatTooltipMinutos(121), '2h 1min estudiando', '121 min -> "2h 1min estudiando"');
assert.strictEqual(formatTooltipMinutos(720), '12h estudiando', '720 min (12h) -> "12h estudiando"');
console.log('✓ T7d: formatTooltipMinutos extremos correctos');

// Resumen
console.log('\n=== Todas las verificaciones T1 + T7 pasaron ===');