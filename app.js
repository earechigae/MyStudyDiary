// Diario de Estudio — lógica y localStorage
// No frameworks, no compilación. Funciona abriendo index.html por doble clic.

const STORAGE_KEY = 'study-sessions'
const form = document.getElementById('session-form')
const fechaInput = document.getElementById('fecha')
const temaInput = document.getElementById('tema')
const minutosInput = document.getElementById('minutos')
const sessionsList = document.getElementById('sessions-list')
const currentStreakSpan = document.getElementById('current-streak')
const bestStreakSpan = document.getElementById('best-streak')
const weekMinutesSpan = document.getElementById('week-minutes')
const daysThisMonthSpan = document.getElementById('days-this-month')

/**
 * Obtener sesiones de localStorage. Devuelve array vacío si no hay datos.
 * Sanitiza los datos: asegura formato de fecha YYYY-MM-DD y minutos como número.
 */
function getSessions() {
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) return []
  try {
    const sessions = JSON.parse(data)
    if (!Array.isArray(sessions)) return []
    return sessions
      .filter(s => s && typeof s === 'object')
      .map(s => ({
        fecha: (s.fecha || '').toString().slice(0, 10), // Tomar solo YYYY-MM-DD
        tema: (s.tema || '').toString().trim(),
        minutos: parseInt(s.minutos, 10) || 0
      }))
      .filter(s => s.fecha.match(/^\d{4}-\d{2}-\d{2}$/) && s.tema && s.minutos > 0)
  } catch {
    return []
  }
}

/**
 * Guardar sesiones en localStorage.
 */
function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

/**
 * Convertir una clave de fecha AAAA-MM-DD en timestamp al mediodía UTC.
 * Usamos UTC para evitar problemas de huso horario; el valor absoluto
 * no importa, solo la diferencia entre fechas.
 */
function dateKeyToTimestamp(key) {
  const [year, month, day] = key.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

/**
 * Fecha en formato AAAA-MM-DD (siempre local). */
function formatDateLocal(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Día de hoy en formato AAAA-MM-DD, hora local (nunca UTC). */
function todayLocalKey() {
  const now = new Date()
  return formatDateLocal(now)
}

/**
 * Obtener el lunes de la semana actual (hora local).
 * Semana: Lunes a Domingo.
 */
function getMondayOfWeek(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay() // 0=Domingo, 1=Lunes, ..., 6=Sábado
  const diff = day === 0 ? -6 : 1 - day // Si domingo, restar 6; sino, mover a lunes
  d.setDate(d.getDate() + diff)
  return d
}

/**
 * Obtener el domingo de la semana actual (hora local).
 */
function getSundayOfWeek(date = new Date()) {
  const monday = getMondayOfWeek(date)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return sunday
}

/**
 * Convertir minutos a una de 5 tonalidades de verde para el heat map.
 * Rangos: 0-60, 61-120, 121-180, 181-240, 241+.
 */
function computeIntensity(minutos) {
  if (minutos >= 241) return '#1b5e20'
  if (minutos >= 181) return '#4caf50'
  if (minutos >= 121) return '#66bb6a'
  if (minutos >= 61) return '#81c784'
  return '#a5d6a7'
}

/**
 * Formatear minutos para el tooltip en español.
 * Ejemplos: "0min estudiando", "45min estudiando", "1h 30min estudiando", etc.
 */
function formatTooltipMinutos(minutos) {
  if (minutos === 0) return '0min estudiando'
  const horas = Math.floor(minutos / 60)
  const mins = minutos % 60
  if (horas > 0 && mins > 0) return `${horas}h ${mins}min estudiando`
  if (horas > 0) return `${horas}h estudiando`
  return `${mins}min estudiando`
}

/**
 * Sumar los minutos totales de sesión para un día dado.
 * Itera sobre todas las sesiones y suma los de fecha coincidente.
 */
function sumMinutosPorDia(key, sesiones) {
  let total = 0
  sesiones.forEach(s => {
    if (s.fecha === key) {
      total += s.minutos
    }
  })
  return total
}

/**
 * Generar los 28 celdas del heat map para las 4 semanas que terminan hoy.
 * Devuelve array de 28 objetos {date, minutos, hasSession, color}.
 * - `hoy` es el string AAAA-MM-DD de hoy en hora local.
 * - `sesiones` es el array completo de sesiones.
 * Las 28 celdas representan 4 semanas × 7 días (Lunes-Domingo),
 * terminando en la semana que contiene a hoy.
 * Cada celda tiene minutos=0 si no hay sesión ese día.
 * Si hay múltiples sesiones en un mismo día, sus minutos se suman antes
 * de asignar la tonalidad (RF‑2).
 */
function getHeatMapCells(hoy, sesiones) {
  const cells = []

  // 1. Convertir hoy string a Date local (medianoche)
  const hoyDate = new Date(hoy + 'T00:00:00')

  // 2. Determinar el lunes de la semana que contiene hoy (hora local)
  // getDay(): 0=Dom, 1=Lun, ..., 6=Sáb
  const dayOfWeek = hoyDate.getDay()
  // Días para retroceder al lunes: 0 si es lunes, 1 si martes, ..., 6 si domingo
  const offset = (dayOfWeek - 1 + 7) % 7
  const currentMonday = new Date(hoyDate)
  currentMonday.setDate(hoyDate.getDate() - offset)

  // 3. Calcular el lunes más antiguo de las 4 semanas (3 semanas antes = 21 días)
  const oldestMonday = new Date(currentMonday)
  oldestMonday.setDate(currentMonday.getDate() - 21)

  // 4. Generar 28 celdas hacia adelante desde el lunes más antiguo
  for (let i = 0; i < 28; i++) {
    const cellDate = new Date(oldestMonday)
    cellDate.setDate(oldestMonday.getDate() + i)
    const key = formatDateLocal(cellDate)

    // Sumar minutos de todas las sesiones de ese día
    const totalMinutos = sumMinutosPorDia(key, sesiones)
    const hasSession = totalMinutos > 0
    const color = hasSession ? computeIntensity(totalMinutos) : '#a5d6a7'

    cells.push({
      date: key,
      minutos: totalMinutos,
      hasSession,
      color
    })
  }
  return cells
}

/**
 * Calcular minutos totales de la semana actual (Lunes-Domingo, hora local).
 */
function calculateWeekMinutes(sessions) {
  const monday = formatDateLocal(getMondayOfWeek())
  const sunday = formatDateLocal(getSundayOfWeek())

  return sessions
    .filter(s => s.fecha >= monday && s.fecha <= sunday)
    .reduce((sum, s) => sum + s.minutos, 0)
}

/**
 * Calcular racha actual: días consecutivos con sesión terminando hoy, en hora local.
 * Una día cuenta si tiene al menos una sesión.
 * Contamos backwards from hoy: empezamos desde hoy y vamos hacia atrás,
 * incrementando el conteo por cada día consecutivo que tenga sesión.
 * La racha se detiene al encontrar un día sin sesión.
 * Si hoy no tiene sesión pero ayer sí, la racha empieza/en continúa desde ayer.
 */
function calculateCurrentStreak(sessions) {
  const today = todayLocalKey()
  // Obtener conjunto de fechas que tienen sesión
  const days = new Set()
  sessions.forEach(s => days.add(s.fecha))

  // Empezar desde hoy y contar backwards
  let streak = 0
  let check = new Date(new Date().setHours(0, 0, 0, 0)) // medianoche de hoy en local

  // Iterar hacia atrás día por día (máximo un año)
  for (let i = 0; i < 365; i++) {
    const key = formatDateLocal(check)
    if (days.has(key)) {
      streak++
    } else if (streak > 0) {
      // Ya habíamos encontrado días con sesión y ahora hay uno sin sesión: racha terminada
      break
    }
    // Si streak aún es 0 y hoy no tiene sesión, continuamos yendo hacia atrás
    // para ver si ayer o días anteriores tenían sesión (caso: "si hoy no hay pero ayer sí")
    check = new Date(check.getTime() - 24 * 60 * 60 * 1000)
  }

  return streak
}

/**
 * Calcular la mejor racha: máximo de días consecutivos en todo el historial.
 * Convierte cada fecha a un timestamp (día entero UTC) y compara diferencias.
 * Las fechas consecutivas diferirán exactamente en 86400000 ms (un día).
 */
function calculateBestStreak(sessions) {
  if (sessions.length === 0) return 0

  // Obtener todas las fechas únicas como timestamps de mediodía UTC
  const uniqueTimestamps = [...new Set(sessions.map(s => dateKeyToTimestamp(s.fecha)))].sort()

  let best = 0
  let current = 1
  const oneDay = 24 * 60 * 60 * 1000 // 86400000

  for (let i = 1; i < uniqueTimestamps.length; i++) {
    const diff = uniqueTimestamps[i] - uniqueTimestamps[i - 1]
    // Diferencia exacta de un día (o muy cercana, tolerancia menor)
    if (diff === oneDay) {
      // Días consecutivos
      current++
      best = Math.max(best, current)
    } else if (diff > oneDay) {
      // Brecha: registramos la racha actual y reiniciamos
      best = Math.max(best, current)
      current = 1
    }
    // Si diff < oneDay algo raro pasó (fechas duplicadas), lo ignoramos
  }
  // Última racha
  best = Math.max(best, current)

  return best
}

/**
 * Renderizar la lista de sesiones (más reciente a más antigua). */
function renderSessions() {
  const sessions = getSessions()

  // Mostrar/ocultar el estado vacío
  const emptyState = document.getElementById('empty-state')
  if (sessions.length === 0) {
    emptyState.style.display = 'block'
    sessionsList.innerHTML = ''
    return
  } else {
    emptyState.style.display = 'none'
  }

  sessionsList.innerHTML = ''

  // Ordenar de más reciente a más antigua (las fechas AAAA-MM-DD ordenadas lexicográficamente)
  const sorted = [...sessions].sort((a, b) => b.fecha.localeCompare(a.fecha))

  sorted.forEach(s => {
    const li = document.createElement('li')
    li.innerHTML = `<span class="fecha">${s.fecha}</span><span class="tema">${s.tema}</span><span class="minutos">${s.minutos} min</span>`
    sessionsList.appendChild(li)
  })
}

/**
 * Actualizar la visualización de ambas rachas. */
function updateStreakDisplay() {
  const sessions = getSessions()
  const current = calculateCurrentStreak(sessions)
  const best = calculateBestStreak(sessions)
  const daysThisMonth = calculateDaysStudiedThisMonth(sessions)

  currentStreakSpan.textContent = current
  bestStreakSpan.textContent = best
  daysThisMonthSpan.textContent = daysThisMonth
}

/**
 * Actualizar la visualización de minutos de esta semana. */
function updateWeekMinutesDisplay() {
  const sessions = getSessions()
  const weekMinutes = calculateWeekMinutes(sessions)
  weekMinutesSpan.textContent = weekMinutes
}

/**
 * Calcular cuántos días distintos se ha estudiado en el mes actual (hora local).
 * Filtrada por mes calendario (del 1 al último día del mes actual).
 */
function calculateDaysStudiedThisMonth(sessions) {
  const now = new Date()
  const nowKey = formatDateLocal(now)
  const [year, month] = nowKey.split('-').map(Number) // month es 1-12

  // Primer día del mes actual y primer día del siguiente mes (para rango exclusivo)
  const firstDayOfMonth = `${year}-${String(month).padStart(2, '0')}-01`
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const firstDayOfNextMonth = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

  // Filtrar sesiones que caen en el mes actual (comparación lexicográfica de strings AAAA-MM-DD)
  const monthSessions = sessions.filter(s => s.fecha >= firstDayOfMonth && s.fecha < firstDayOfNextMonth)

  // Colección de días únicos (solo el día del mes)
  const days = new Set()
  monthSessions.forEach(s => {
    const day = s.fecha.substring(8) // últimos 2 chars: "DD"
    days.add(day)
  })

  return days.size
}

/**
 * Manejar envío del formulario. */
form.addEventListener('submit', e => {
  e.preventDefault()

  const fecha = fechaInput.value || todayLocalKey()
  const tema = temaInput.value.trim()
  const minutos = parseInt(minutosInput.value, 10)

  if (!tema || minutos <= 0) {
    alert('Por favor completa todos los campos correctamente.')
    return
  }

  const newSession = {
    fecha,
    tema,
    minutos
  }

  const sessions = getSessions()
  sessions.push(newSession)
  saveSessions(sessions)

  // Reset form (fecha vuelve a hoy)
  temaInput.value = ''
  minutosInput.value = ''

  renderSessions()
  renderHeatMap()
  updateStreakDisplay()
  updateWeekMinutesDisplay()
})

// Renderizar el mapa de calor
function renderHeatMap() {
  const sessions = getSessions()
  const hoy = todayLocalKey()
  const cells = getHeatMapCells(hoy, sessions)
  const heatMap = document.getElementById('heat-map')

  cells.forEach((cell, idx) => {
    const element = heatMap.children[idx]
    element.className = 'cell' + (cell.hasSession ? '' : ' sessionless')
    element.dataset.tooltip = formatTooltipMinutos(cell.minutos)
    element.style.background = cell.color
  })
}

/**
 * Inicializar
 */
renderSessions()
renderHeatMap()
updateStreakDisplay()
updateWeekMinutesDisplay()
