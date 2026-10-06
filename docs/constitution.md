# Constitución del Diario de Estudio

1. **Stack simple**: Solo HTML/CSS/JS. Sin frameworks, sin librerías, sin compilación. Verificable: la página abre con doble clic sin instalación.

2. **Spec y código alineados**: El código implementa exactamente las 3 funcionalidades especificada sin features adicionales. Verificable: comparar features contra el spec.

3. **Lógica e interfaz separadas**: app.js gestiona lógica, index.html estructura, styles.css el estilo. Sin mezclado de capas. Verificable: cada archivo cumple su rol exclusivo.

4. **Tests sin dependencias**: Las pruebas se verifican abriendo index.html y completando el formulario. Sin instalar ningún framework. Verificable: recargar la página y comprobar persistencia.

5. **Protección de datos**: Los datos se guardan en localStorage con clave `study-sessions`. No se transmiten datos externos ni sensibles. Verificable: inspeccionar que solo usa localStorage con la clave definida.

6. **Idioma español**: Todos los textos de la interfaz y los comentarios del código están en español. Sin strings en inglés. Verificable: revisar visualmente que no hay textos en inglés.