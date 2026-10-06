# MyStudyDiary — Diario de Estudio

## Propósito del proyecto

**MyStudyDiary** es una aplicación web simple para registrar sesiones de estudio y visualizar el progreso mediante:

- 📝 **Formulario de registro**: fecha (editable, por defecto hoy), tema (obligatorio), minutos (> 0, obligatorio)
- 🔥 **Racha actual**: días consecutivos con al menos una sesión, terminando hoy (hora local)
- 🏆 **Mejor racha**: máximo de días consecutivos en todo el historial
- 📊 **Minutos esta semana**: suma de minutos de Lunes a Domingo (semana calendario, hora local)
- 🗓️ **Días este mes**: días distintos con sesión en el mes actual
- 🌡️ **Mapa de calor**: grid 4×7 (28 celdas) con intensidad de color según minutos por día, tooltip al hover, totalmente responsivo

**Stack**: HTML, CSS y JavaScript plano — **sin frameworks, sin librerías, sin build**. Funciona abriendo `index.html` con doble clic. Datos en `localStorage` (clave `study-sessions`).

---

## Objetivo adicional: Desarrollo con IA + Spec Driven Development

Este proyecto sirve como **campo de práctica** para ejercitar el desarrollo asistido por IA usando **OpenCode** y la metodología **Spec Driven Development (SDD)**, adhiriéndose a mejores prácticas:

### Principios SDD aplicados
- **Spec-first**: Cada funcionalidad nueva comienza con una especificación (`specs/NNN-feature/spec.md`) que define requisitos funcionales (RF), no funcionales (RNF), casos límite, criterios de finalización y dudas resueltas **antes** de escribir código.
- **Plan explícito**: Un `plan.md` documenta arquitectura, algoritmos, decisiones técnicas (con justificación y alternativas descartadas), estrategia de tests y mapa de cobertura RF ↔ implementación.
- **Tasks accionables**: `tasks.md` desglosa el trabajo en pasos ordenados con dependencias, criterios de "hecho cuando" verificables y checkboxes.
- **Tests como verificación**: Pruebas automatizadas con `node --test` (sin frameworks externos) que validan funciones puras y estructura HTML, ejecutables sin servidor.
- **Verificación visual**: Uso de Chrome DevTools (MCP) para comprobar responsividad, vista móvil (375px) y comportamiento real en navegador.
- **Memoria viva**: `MEMORY.md` rastrea estado, decisiones, aprendizajes y errores entre sesiones; se actualiza al terminar cada tarea.

### Flujo de trabajo con OpenCode
1. Leer `AGENTS.md`, `Contexto.md`, `docs/constitution.md` y la spec activa.
2. Ejecutar tests existentes (`node --test`) para establecer baseline.
3. Implementar siguiendo el plan, tarea a tarea.
4. Ejecutar tests tras cada cambio; corregir si fallan.
5. Verificar en navegador (responsive, consola, localStorage).
6. Actualizar `MEMORY.md` y, si procede, `AGENTS.md`.
7. Commit atómico con mensaje convencional.

### Mejores prácticas reforzadas
- **Separación de capas**: `index.html` (estructura), `styles.css` (estilo), `app.js` (lógica) — sin mezclar responsabilidades.
- **Funciones puras testables**: Lógica de negocio (`computeIntensity`, `getHeatMapCells`, `calculateCurrentStreak`, etc.) recibe parámetros y devuelve valores; sin side-effects, fácil de probar en Node.
- **Hora local, nunca UTC**: Todas las fechas se manipulan en zona horaria del navegador para evitar bugs de día/racha.
- **Sanitización defensiva**: `getSessions()` valida y limpia datos de `localStorage` (trunca fechas, parsea enteros, filtra inválidos) para tolerar datos legacy/corruptos.
- **Accesibilidad y UX**: Focus visible, `prefers-reduced-motion`, tooltips sin JS extra, empty state informativo.
- **Responsive por diseño**: Media queries explícitas (1024/768/480) en lugar de `auto-fit` para control preciso del layout.
- **Sin dependencias externas**: Cero `npm install`, cero CDN — el proyecto es portable y auditable.

---

## Estructura del repositorio

```
MyStudyDiary/
├── index.html          # Estructura HTML (3 secciones: header, heat-map, main)
├── styles.css          # Estilos + variables CSS + media queries responsivas
├── app.js              # Lógica: localStorage, rachas, semana, heat-map, render
├── test/
│   └── heat-map.test.js   # Tests unitarios (node --test)
├── specs/
│   └── 001-heat-map/
│       ├── spec.md     # Especificación completa
│       ├── plan.md     # Plan técnico y decisiones
│       └── tasks.md    # Lista de tareas con checkboxes
├── docs/
│   └── constitution.md # Principios constitucionales del proyecto
├── AGENTS.md           # Instrucciones para agentes IA (este proyecto)
├── Contexto.md         # Contexto original de la tarea v1
├── MEMORY.md           # Memoria entre sesiones (estado, decisiones, bugs)
└── README.md           # Este archivo
```

---

## Cómo ejecutar

```bash
# Opción 1: Doble clic en index.html (recomendado, sin servidor)
# Opción 2: Servidor local simple (para probar en red local)
python3 -m http.server 8080
# Abrir http://localhost:8080
```

## Tests

```bash
node --test test/heat-map.test.js
```

Deben pasar: estructura HTML (T1a–T1d) + funciones puras (T7a–T7d).

---

## Verificación visual (Chrome DevTools)

1. Abrir `index.html` en Chrome.
2. Abrir DevTools (`F12`) → Toggle device toolbar (`Ctrl+Shift+M`).
3. Probar breakpoints: **375px** (móvil), **768px** (tablet), **1024px** (desktop), **1440px**.
4. Verificar: 28 celdas, tooltip al hover, streaks actualizados, empty state correcto, persistencia al recargar.

---

## Licencia

MIT — Libre para usar, modificar y aprender.