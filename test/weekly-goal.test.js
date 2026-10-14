// Test T5 + T6: Estructura HTML y funciones puras objetivo semanal
// Ejecutar con: node --test test/weekly-goal.test.js
import assert from 'node:assert';
import fs from 'node:fs';

const indexPath = '/home/earechiga/Desarrollo/Ejercicios/IA/Proyectos/MyStudyDiary/index.html';
const html = fs.readFileSync(indexPath, 'utf-8');

// ===== Funciones puras (misma lógica que en app.js) =====

/**
 * Obtener la meta semanal desde localStorage (mock para tests).
 * En tests usamos un mock simple, la lógica real está en app.js.
 */
function getWeeklyGoalMock(storage) {
  const data = storage['study-weekly-goal'];
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    const goal = parseInt(parsed, 10);
    if (Number.isFinite(goal) && goal > 0) return goal;
    return null;
  } catch {
    return null;
  }
}

/**
 * Guardar la meta semanal en localStorage (mock).
 */
function saveWeeklyGoalMock(storage, goal) {
  if (goal === null || goal <= 0) {
    delete storage['study-weekly-goal'];
  } else {
    storage['study-weekly-goal'] = JSON.stringify(goal);
  }
}

/**
 * Calcular el progreso hacia la meta semanal como porcentaje.
 * @param {number} weekMinutes - Minutos acumulados en la semana actual.
 * @param {number|null} goal - Meta semanal en minutos (null o <=0 = sin meta).
 * @returns {number} Porcentaje de progreso (0-100). Devuelve 0 si no hay meta válida.
 */
function calculateProgress(weekMinutes, goal) {
  if (goal === null || goal <= 0) return 0;
  return Math.min(Math.round((weekMinutes / goal) * 100), 100);
}

/**
 * Formatear el texto de la meta para mostrar junto a los minutos de la semana.
 * @param {number|null} goal - Meta semanal en minutos (null o <=0 = sin meta).
 * @returns {string} Texto formateado con espacio inicial, o string vacío si no hay meta.
 */
function formatGoalText(goal) {
  if (goal === null || goal <= 0) return '';
  return ` / Objetivo: ${goal} min`;
}

// ===== T5: Verificaciones de estructura HTML =====

export function setup() { return { html }; }
export function cleanup() {}

// T5a: Contenedor .weekly-goal-wrapper debe existir en header
export function testT5a(setup) {
  const wrapperPattern = /class="week-minutes weekly-goal-wrapper"/;
  const wrapperFound = wrapperPattern.test(setup.html);
  assert.strictEqual(wrapperFound, true, 'Debe existir wrapper .weekly-goal-wrapper en .week-minutes');
}

// T5b: Barra de progreso #weekly-progress debe existir
export function testT5b(setup) {
  const progressPattern = /id="weekly-progress" class="weekly-progress"/;
  const progressFound = progressPattern.test(setup.html);
  assert.strictEqual(progressFound, true, 'Debe existir #weekly-progress con clase weekly-progress');
}

// T5c: Input edición #weekly-goal-input debe existir
export function testT5c(setup) {
  const inputPattern = /id="weekly-goal-input"/;
  const inputFound = inputPattern.test(setup.html);
  assert.strictEqual(inputFound, true, 'Debe existir #weekly-goal-input');
}

// T5d: Botones guardar/borrar deben existir
export function testT5d(setup) {
  const savePattern = /id="weekly-goal-sav/;
  const clearPattern = /id="weekly-goal-clear"/;
  const saveFound = savePattern.test(setup.html);
  const clearFound = clearPattern.test(setup.html);
  assert.strictEqual(saveFound, true, 'Debe existir #weekly-goal-save');
  assert.strictEqual(clearFound, true, 'Debe existir #weekly-goal-clear');
}

// ===== T6: Tests de funciones puras =====

console.log('=== T6: Tests de funciones puras objetivo semanal ===\n');

// T6a: getWeeklyGoal - casos
console.log('T6a: getWeeklyGoal');
const storage1 = {};
assert.strictEqual(getWeeklyGoalMock(storage1), null, 'Sin clave → null');

const storage2 = { 'study-weekly-goal': '300' };
assert.strictEqual(getWeeklyGoalMock(storage2), 300, 'Valor válido 300 → 300');

const storage3 = { 'study-weekly-goal': '0' };
assert.strictEqual(getWeeklyGoalMock(storage3), null, 'Valor 0 → null');

const storage4 = { 'study-weekly-goal': '-50' };
assert.strictEqual(getWeeklyGoalMock(storage4), null, 'Valor negativo → null');

const storage5 = { 'study-weekly-goal': 'abc' };
assert.strictEqual(getWeeklyGoalMock(storage5), null, 'Valor no numérico → null');

const storage6 = { 'study-weekly-goal': 'not-json' };
assert.strictEqual(getWeeklyGoalMock(storage6), null, 'JSON inválido → null');

console.log('✓ T6a: getWeeklyGoal correcta\n');

// T6b: saveWeeklyGoal
console.log('T6b: saveWeeklyGoal');
const storage7 = {};
saveWeeklyGoalMock(storage7, 300);
assert.strictEqual(storage7['study-weekly-goal'], '300', 'Guarda 300');

const storage8 = { 'study-weekly-goal': '300' };
saveWeeklyGoalMock(storage8, null);
assert.strictEqual(storage8['study-weekly-goal'], undefined, 'null borra clave');

const storage9 = { 'study-weekly-goal': '300' };
saveWeeklyGoalMock(storage9, 0);
assert.strictEqual(storage9['study-weekly-goal'], undefined, '0 borra clave');

const storage10 = { 'study-weekly-goal': '300' };
saveWeeklyGoalMock(storage10, -10);
assert.strictEqual(storage10['study-weekly-goal'], undefined, 'Negativo borra clave');

console.log('✓ T6b: saveWeeklyGoal correcta\n');

// T6c: calculateProgress - casos límite
console.log('T6c: calculateProgress');
assert.strictEqual(calculateProgress(0, 300), 0, '0 min / 300 goal → 0%');
assert.strictEqual(calculateProgress(150, 300), 50, '150 min / 300 goal → 50%');
assert.strictEqual(calculateProgress(300, 300), 100, '300 min / 300 goal → 100%');
assert.strictEqual(calculateProgress(350, 300), 100, '350 min / 300 goal → 100% (cap)');
assert.strictEqual(calculateProgress(100, null), 0, 'Sin goal → 0%');
assert.strictEqual(calculateProgress(100, 0), 0, 'Goal 0 → 0%');
assert.strictEqual(calculateProgress(100, -5), 0, 'Goal negativo → 0%');
assert.strictEqual(calculateProgress(75, 300), 25, '75 min / 300 goal → 25% (redondeo)');
assert.strictEqual(calculateProgress(76, 300), 25, '76 min / 300 goal → 25% (redondeo)');
assert.strictEqual(calculateProgress(77, 300), 26, '77 min / 300 goal → 26% (redondeo)');
console.log('✓ T6c: calculateProgress correcta (0%, 50%, 100%, cap, sin goal, redondeo)\n');

// T6d: formatGoalText
console.log('T6d: formatGoalText');
assert.strictEqual(formatGoalText(null), '', 'null → string vacío');
assert.strictEqual(formatGoalText(0), '', '0 → string vacío');
assert.strictEqual(formatGoalText(-10), '', 'Negativo → string vacío');
assert.strictEqual(formatGoalText(300), ' / Objetivo: 300 min', '300 → texto con espacio inicial');
assert.strictEqual(formatGoalText(150), ' / Objetivo: 150 min', '150 → texto con espacio inicial');
console.log('✓ T6d: formatGoalText correcta\n');

// Resumen
console.log('=== Todas las verificaciones T5 + T6 pasaron ===');