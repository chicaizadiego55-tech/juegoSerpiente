// 🎮 CONFIGURACIÓN Y CONSTANTES
// ============================================================================
const TAMANIO_CELDA = 25;

// ============================================================================
// 🖼️ ELEMENTOS DEL DOM Y CONTEXTO
// ============================================================================
const canvas = document.getElementById("canvasJuego");
const ctx = canvas.getContext("2d");

// ============================================================================
// 🐍 ESTADO DEL JUEGO
// ============================================================================
let serpiente = [
  { x: 14, y: 13 },
  { x: 14, y: 14 },
  { x: 14, y: 15 },
  { x: 14, y: 16 },
  { x: 14, y: 17 }
];

let intervaloSerpiente;

let direccionActual = "derecha";

let comida = { x: 5, y: 5 };

let puntaje = 0;

let juegoTerminado = false;

let velocidadSerpiente = 300;

// ============================================================================
// 🚀 INICIALIZACIÓN
// ============================================================================
dibujarTablero();
actualizarJuego();

// ============================================================================
// 🎨 FUNCIONES DE DIBUJO
// ============================================================================

function actualizarJuego() {
  limpiarCanvas();
  dibujarComida();
  dibujarSerpiente();
}

function limpiarCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Redibujar cuadrícula ligera
  dibujarTablero();
}

function dibujarTablero() {

  // Líneas verticales
  for (let x = 0; x <= canvas.width; x += TAMANIO_CELDA) {

    ctx.strokeStyle = "rgba(0,255,255,0.1)";

    ctx.beginPath();

    ctx.moveTo(x, 0);

    ctx.lineTo(x, canvas.height);

    ctx.stroke();
  }

  // Líneas horizontales
  for (let y = 0; y <= canvas.height; y += TAMANIO_CELDA) {

    ctx.strokeStyle = "rgba(0,255,255,0.1)";

    ctx.beginPath();

    ctx.moveTo(0, y);

    ctx.lineTo(canvas.width, y);

    ctx.stroke();
  }
}

function pintarCoordenada(x, y, color) {

  const posicionX = x * TAMANIO_CELDA;
  const posicionY = y * TAMANIO_CELDA;

  ctx.fillStyle = color;

  ctx.fillRect(
    posicionX,
    posicionY,
    TAMANIO_CELDA,
    TAMANIO_CELDA
  );
}

function dibujarSerpiente() {

  for (let i = 0; i < serpiente.length; i++) {

    const serp = serpiente[i];

    if (i == 0) {
      pintarCoordenada(serp.x, serp.y, "red");
    } else {
      pintarCoordenada(serp.x, serp.y, "yellow");
    }
  }
}

function dibujarComida() {
  pintarCoordenada(comida.x, comida.y, "green");
}

// ============================================================================
// 🕹️ MOVIMIENTOS
// ============================================================================

function moverDerecha() {

  let nuevoElemento = { x: 0, y: 0 };

  if ((serpiente[0].x + 2) * TAMANIO_CELDA > canvas.width) {
    gameOver();
    return;
  }

  nuevoElemento.x = serpiente[0].x + 1;
  nuevoElemento.y = serpiente[0].y;

  serpiente.unshift(nuevoElemento);

  serpiente.pop();
}

function moverIzquierda() {

  let nuevoElemento = { x: 0, y: 0 };

  if ((serpiente[0].x - 1) * TAMANIO_CELDA < 0) {
    gameOver();
    return;
  }

  nuevoElemento.x = serpiente[0].x - 1;
  nuevoElemento.y = serpiente[0].y;

  serpiente.unshift(nuevoElemento);

  serpiente.pop();
}

function moverAbajo() {

  let nuevoElemento = { x: 0, y: 0 };

  if ((serpiente[0].y + 2) * TAMANIO_CELDA > canvas.height) {
    gameOver();
    return;
  }

  nuevoElemento.x = serpiente[0].x;
  nuevoElemento.y = serpiente[0].y + 1;

  serpiente.unshift(nuevoElemento);

  serpiente.pop();
}

function moverArriba() {

  let nuevoElemento = { x: 0, y: 0 };

  if ((serpiente[0].y - 1) * TAMANIO_CELDA < 0) {
    gameOver();
    return;
  }

  nuevoElemento.x = serpiente[0].x;
  nuevoElemento.y = serpiente[0].y - 1;

  serpiente.unshift(nuevoElemento);

  serpiente.pop();
}

// ============================================================================
// 🎮 CONTROL
// ============================================================================

function cambiarDireccion(direccion) {
  direccionActual = direccion;
}

window.addEventListener("keydown", (evento) => {

  switch (evento.key) {

    case "ArrowRight":
      cambiarDireccion("derecha");
      break;

    case "ArrowLeft":
      cambiarDireccion("izquierda");
      break;

    case "ArrowUp":
      cambiarDireccion("arriba");
      break;

    case "ArrowDown":
      cambiarDireccion("abajo");
      break;
  }
});

function iniciarJuego() {

  clearInterval(intervaloSerpiente);

  intervaloSerpiente = setInterval(
    moverSerpiente,
    1000 - velocidadSerpiente
  );

  cambiarEstado("Jugando");
}

function pausarJuego() {

  clearInterval(intervaloSerpiente);

  cambiarEstado("Descansando");
}

function moverSerpiente() {

  if (juegoTerminado) {
    return;
  }

  let nuevoElemento = {
    x: serpiente[0].x,
    y: serpiente[0].y
  };

  switch (direccionActual) {

    case "derecha":
      moverDerecha();
      nuevoElemento.x++;
      break;

    case "izquierda":
      moverIzquierda();
      nuevoElemento.x--;
      break;

    case "abajo":
      moverAbajo();
      nuevoElemento.y++;
      break;

    case "arriba":
      moverArriba();
      nuevoElemento.y--;
      break;
  }

  if (comidaAtrapada()) {

    serpiente.unshift(nuevoElemento);

    aumentarPuntaje();

    generarNuevaPosicionComida();
  }

  actualizarJuego();
}

// ============================================================================
// 🍎 COMIDA
// ============================================================================

function generarNuevaPosicionComida() {

  comida.x = Math.floor(
    Math.random() * (canvas.width / TAMANIO_CELDA)
  );

  comida.y = Math.floor(
    Math.random() * (canvas.height / TAMANIO_CELDA)
  );
}

function comidaAtrapada() {

  if (
    comida.x == serpiente[0].x &&
    comida.y == serpiente[0].y
  ) {
    return true;
  } else {
    return false;
  }
}

// ============================================================================
// 📈 PUNTAJE
// ============================================================================

function aumentarPuntaje() {

  puntaje++;

  // DUPLICAR VELOCIDAD
  if (puntaje % 2 == 0) {

    velocidadSerpiente = velocidadSerpiente * 2;

    if (velocidadSerpiente > 900) {
      velocidadSerpiente = 900;
    }

    clearInterval(intervaloSerpiente);

    intervaloSerpiente = setInterval(
      moverSerpiente,
      1000 - velocidadSerpiente
    );
  }

  document.getElementById("puntaje").innerText = puntaje;
}

function cambiarEstado(estado) {
  document.getElementById("estado").innerText = estado;
}

// ============================================================================
// 💀 GAME OVER
// ============================================================================

function gameOver() {

  juegoTerminado = true;

  clearInterval(intervaloSerpiente);

  cambiarEstado("Game Over");
}

// ============================================================================
// 🔄 REINICIAR
// ============================================================================

function reiniciarJuego() {

  clearInterval(intervaloSerpiente);

  serpiente = [
    { x: 14, y: 13 },
    { x: 14, y: 14 },
    { x: 14, y: 15 },
    { x: 14, y: 16 },
    { x: 14, y: 17 }
  ];

  comida = { x: 5, y: 5 };

  puntaje = 0;

  velocidadSerpiente = 300;

  direccionActual = "derecha";

  juegoTerminado = false;

  document.getElementById("puntaje").innerText = puntaje;

  cambiarEstado("Listo");

  actualizarJuego();
}