# MyStudyDiary — AGENTS.md

## Proyecto
Una web app simple de diario de estudio: registrar sesiones, ver rachas (🔥) y listar sesiones. Los datos persisten en localStorage.

## Puntos de entrada
- Abre `index.html` directamente (doble clic). Sin servidor de desarrollo, sin build, sin instalación.

## Archivos (solo tres)
- `index.html` — estructura
- `styles.css` — estilos
- `app.js` — lógica, localStorage, cálculo de rachas

## Restricciones clave (de Contexto.md)
- **Sin frameworks, sin librerías, sin compilación** — solo HTML/CSS/JS plano.
- **Debe funcionar abriendo `index.html` con doble clic** — sin servidor requerido, sin restricciones CORS.
- **Los textos de la interfaz deben estar en español** — todos los strings visibles al usuario en español.
- **Solo las tres funcionalidades especificadas** — formulario (fecha por defecto hoy, tema obligatorio, minutos > 0 obligatorio), visualización de racha, lista de sesiones.
- **Sin añadidos fuera del spec** — no añadir extras no listados en Contexto.md.

## Esquema de localStorage
- Datos guardados bajo una clave (ver `app.js` para la clave exacta). Sesiones almacenadas como array de objetos con `fecha`, `tema`, `minutos`.

## Lógica de rachas (importante)
- Un día cuenta si tiene al menos una sesión.
- La racha = días consecutivos con sesiones terminando **hoy**, contando hacia atrás en hora local (nunca UTC).
- Si hoy no tiene sesión pero ayer sí, la racha continúa hasta un día sin sesión.

## Lógica de minutos de la semana
- Definición de semana: lunes a domingo en la zona horaria local del navegador.
- Calculado a partir de sesiones donde `fecha` cae entre lunes y domingo (inclusive) de la semana actual.
- Mostrado en el header junto a las rachas.

## Flujo de desarrollo
- Edita los tres archivos directamente.
- Sin `npm`, sin `git` hooks, sin lint/typecheck/formatter — el proyecto no tiene paso de build.
- Para probar: abre `index.html`, rellena el formulario, verifica que la racha y la lista se actualicen, recarga para confirmar persistencia en localStorage.
- Para lanzar Google Chrome en esta computadora ve a /usr/bin/google-chrome
- No hay tests automáticos. Después de cada cambio, verifica con el MCP de Chrome DevTools: abre `index.html`, prueba la funcionalidad, revisa la consola y comprueba la vista móvil.

## Qué evitar
- No importar librerías externas CSS/JS.
- No añadir servidor de desarrollo o configuración de build salvo que el spec cambie.
- **No usar UTC**; usar siempre hora local para cálculos de rachas y semanas.

## Memoria
- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales).

## Límites
- Siempre: actualizar `MEMORY.md` al terminar cada tarea.

## Comandos
- Tests: `node --test`

## Reglas
- Lee `docs/constitution.md` y la spec activa (`specs/NNN-*/`) antes de tocar código.