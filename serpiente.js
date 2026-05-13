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

  // PASO 5
  // Pintar únicamente la serpiente
  pintarSerpiente();
}

// =========================
// PARTE 2 — TABLERO
// =========================

// Tamaño de cada celda
const TAMANIO_CELDA = 25;

// Función que dibuja el tablero
function dibujarTablero() {

  // Color de líneas
  ctx.strokeStyle = "rgba(0, 255, 255, 0.2)";

  // Líneas verticales
  for (let x = 0; x <= canvas.width; x += TAMANIO_CELDA) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Líneas horizontales
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

// Función que pinta una parte
function pintarParte(lineaX, lineaY, color) {

  // Convertimos coordenadas a píxeles
  const pixelX = lineaX * TAMANIO_CELDA;
  const pixelY = lineaY * TAMANIO_CELDA;

  // Color de relleno
  ctx.fillStyle = color;

  // Dibujar cuadrado
  ctx.fillRect(pixelX, pixelY, TAMANIO_CELDA, TAMANIO_CELDA);

  // Borde
  ctx.strokeStyle = "#000";
  ctx.strokeRect(pixelX, pixelY, TAMANIO_CELDA, TAMANIO_CELDA);
}

// =========================
// CREACIÓN DE LA SERPIENTE
// =========================

// PASO 1 y 2
// Cada objeto representa una parte del cuerpo

const serpiente = [

  // ✅ EJERCICIO 1 — Horizontal
  { x: 5, y: 5 },
  { x: 6, y: 5 },
  { x: 7, y: 5 },
  { x: 8, y: 5 },
  { x: 9, y: 5 }

  /*
  ✅ EJERCICIO 2 — Vertical

  { x: 10, y: 2 },
  { x: 10, y: 3 },
  { x: 10, y: 4 },
  { x: 10, y: 5 },
  { x: 10, y: 6 }
  */

  /*
  ✅ EJERCICIO 3 — Pegada al borde izquierdo

  { x: 0, y: 10 },
  { x: 0, y: 11 },
  { x: 0, y: 12 },
  { x: 0, y: 13 },
  { x: 0, y: 14 }
  */
];

// =========================
// PASO 3 y 4
// FUNCIÓN PINTAR SERPIENTE
// =========================

function pintarSerpiente() {

  // Recorrer arreglo
  for (let i = 0; i < serpiente.length; i++) {

    // Parte actual
    const parte = serpiente[i];

    // EJERCICIO FINAL
    // Cabeza diferente color
    if (i === 0) {

      // Cabeza amarilla
      pintarParte(parte.x, parte.y, "yellow");

    } else {

      // Cuerpo rojo
      pintarParte(parte.x, parte.y, "red");
    }
  }
}

// Primera pintura
dibujarTodo();
