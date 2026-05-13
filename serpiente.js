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

    // Primera pintura — va AL FINAL para que todas las funciones estén definidas
    dibujarTodo();

