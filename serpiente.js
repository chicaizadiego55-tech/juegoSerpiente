// 1. Capturamos el canvas y su contexto de dibujo
    const canvas = document.getElementById("canvasJuego");
    const ctx = canvas.getContext("2d");

    // =========================
    // FUNCIONES DE DIBUJO
    // =========================

    function limpiarCanvas() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function dibujarTodo() {
      limpiarCanvas();
      dibujarTablero();
    }

    // =========================
    // PARTE 2 — TABLERO
    // =========================

    // PASO 4 — Tamaño de cada celda
    const TAMANIO_CELDA = 25;

    // PASO 5 — Función que dibuja el tablero
    function dibujarTablero() {

      // PASO 6 — Color de líneas
      ctx.strokeStyle = "rgba(0, 255, 255, 0.2)";

      // PASO 9 — Líneas VERTICALES
      for (let x = 0; x <= canvas.width; x += TAMANIO_CELDA) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // PASO 10 — Líneas HORIZONTALES
      for (let y = 0; y <= canvas.height; y += TAMANIO_CELDA) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

    }

    // =========================
    // PARTE 3 — PINTAR PARTES
    // =========================

    // PASO 1 — Función que pinta un cuadrado en la cuadrícula
    // lineaX: columna de la cuadrícula (eje horizontal)
    // lineaY: fila de la cuadrícula (eje vertical)
    function pintarParte(lineaX, lineaY) {

      // Calculamos la posición real en píxeles dentro del canvas
      const pixelX = lineaX * TAMANIO_CELDA;
      const pixelY = lineaY * TAMANIO_CELDA;

      // PASO 2 — Color de relleno y dibujar relleno
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(pixelX, pixelY, TAMANIO_CELDA, TAMANIO_CELDA);

      // PASO 3 — Color de borde y dibujar borde
      ctx.strokeStyle = "#052e16";
      ctx.strokeRect(pixelX, pixelY, TAMANIO_CELDA, TAMANIO_CELDA);
    }

    // =========================
    // PRUEBAS OBLIGATORIAS
    // =========================

    // Sobrescribimos dibujarTodo para incluir las pruebas SIN modificar el código original
    const _dibujarTodoOriginal = dibujarTodo;
    dibujarTodo = function() {
      _dibujarTodoOriginal();

      // ✅ PRUEBA 1 — Celda (5,5)
      pintarParte(5, 5);

      // ✅ PRUEBA 2 — Celda (10,2)
      pintarParte(10, 2);

      // ✅ PRUEBA 3 — Pegado al borde INFERIOR (fila 23 es la última)
      pintarParte(7, 23);

      // ✅ PRUEBA 4 — Pegado al borde DERECHO (columna 23 es la última)
      pintarParte(23, 10);

      // ✅ PRUEBA 5 — Pegado al borde IZQUIERDO (columna 0)
      pintarParte(0, 15);

      // ✅ PRUEBA 6 — Esquina inferior-derecha (la (0,0) sería demasiado fácil)
      pintarParte(23, 23);
    };

    // Primera pintura — va AL FINAL para que todas las funciones estén definidas
    dibujarTodo();
