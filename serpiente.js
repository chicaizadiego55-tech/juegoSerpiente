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
const serpiente = [
  { x: 14, y: 13 },
  { x: 14, y: 14 },
  { x: 14, y: 15 },
  { x: 14, y: 16 },
  { x: 14, y: 17 }
];
let intervaloSerpiente;
let direccionActual = "derecha";

let comida = { x: 5, y: 5 };

let puntaje = 0

// ============================================================================
// 🚀 INICIALIZACIÓN
// ============================================================================
// Primera pintura del juego al cargar la página
dibujarTodo();

// ============================================================================
// 🎨 FUNCIONES DE DIBUJO
// ============================================================================

/**
 * Función principal de renderizado
 */
function dibujarTodo() {
  limpiarCanvas();
  dibujarTablero();
  // pintarCoordenada(25, 25); // Debug
  dibujarComida()
  dibujarSerpiente();
}

/**
 * Limpia completamente el canvas
 */
function limpiarCanvas() {
  // 0, 0: Empieza a borrar desde la esquina superior izquierda
  // canvas.width, canvas.height: Borra hasta el ancho y alto total
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Dibuja el tablero completo (líneas y números)
 */
function dibujarTablero() {
  dibujarLineasVerticales();
  dibujarLineasHorizontales();
  dibujarNumerosEnY();
  dibujarNumerosEnX();
}

/**
 * Dibuja las líneas verticales de la cuadrícula
 */
function dibujarLineasVerticales() {
  for (let x = 0; x <= canvas.width; x += TAMANIO_CELDA) {
    ctx.strokeStyle = "rgba(0, 255, 255, 0.2)";
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
}

/**
 * Dibuja las líneas horizontales de la cuadrícula
 */
function dibujarLineasHorizontales() {
  for (let y = 0; y <= canvas.height; y += TAMANIO_CELDA) {
    ctx.strokeStyle = "rgba(0, 255, 255, 0.2)";
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

/**
 * Dibuja los números en el eje Y (izquierda)
 */
function dibujarNumerosEnY() {
  ctx.fillStyle = "white";
  ctx.font = "12px Arial";
  let contador = 0;
  
  for (let y = 0; y <= canvas.height; y += TAMANIO_CELDA) {
    ctx.fillText(contador, 5, y + 12);
    contador++;
  }
}

/**
 * Dibuja los números en el eje X (superior)
 */
function dibujarNumerosEnX() {
  ctx.fillStyle = "white";
  ctx.font = "12px Arial";
  let contador = 0;
  
  for (let x = 0; x <= canvas.width; x += TAMANIO_CELDA) {
    ctx.fillText(contador, x + 2, 12);
    contador++;
  }
}

/**
 * Pinta una celda en coordenadas lógicas (x, y)
 * @param {number} x - Coordenada X lógica
 * @param {number} y - Coordenada Y lógica
 * @param {string} color - Color de relleno
 */
function pintarCoordenada(x, y, color) {
  const posicionX = x * TAMANIO_CELDA;
  const posicionY = y * TAMANIO_CELDA;

  if (posicionX < canvas.width && posicionY < canvas.height) {
    ctx.fillStyle = color;
    ctx.fillRect(posicionX, posicionY, TAMANIO_CELDA, TAMANIO_CELDA);

    ctx.strokeStyle = "red";
    ctx.strokeRect(posicionX, posicionY, TAMANIO_CELDA, TAMANIO_CELDA);
  }
}

/**
 * Dibuja la serpiente completa
 */
function dibujarSerpiente() {
  const colorCabeza = "red";
  
  for (let i = 0; i < serpiente.length; i++) {
    const serp = serpiente[i];
    const color = (i === 0) ? colorCabeza : "yellow";
    pintarCoordenada(serp.x, serp.y, color);
  }
}

// ============================================================================
// 🕹️ FUNCIONES DE MOVIMIENTO
// ============================================================================

/**
 * Mueve la serpiente hacia la derecha
 */
function moverDerecha() {
  let nuevoElemento = { x: 0, y: 0 };
  if ((serpiente[0].x + 2) * TAMANIO_CELDA > canvas.width) return;
  
  nuevoElemento.x=serpiente[0].x+1
  nuevoElemento.y=serpiente[0].y

  serpiente.unshift(nuevoElemento)
  serpiente.pop()
}

/**
 * Mueve la serpiente hacia la izquierda
 */
function moverIzquierda() {
  let nuevoElemento = { x: 0, y: 0 };
  
  if ((serpiente[0].x - 1) * TAMANIO_CELDA < 0) return;
  
  nuevoElemento.x=serpiente[0].x-1
  nuevoElemento.y=serpiente[0].y

  serpiente.unshift(nuevoElemento)
  serpiente.pop()
}

/**
 * Mueve la serpiente hacia abajo
 */
function moverAbajo() {
  let nuevoElemento = { x: 0, y: 0 };
  
  if ((serpiente[0].y + 2) * TAMANIO_CELDA > canvas.height) return;
  
  nuevoElemento.x=serpiente[0].x
  nuevoElemento.y=serpiente[0].y+1

  serpiente.unshift(nuevoElemento)
  serpiente.pop()
  
}

/**
 * Mueve la serpiente hacia arriba
 */
function moverArriba() {
  let nuevoElemento = { x: 0, y: 0 };
  
  if ((serpiente[0].y - 1) * TAMANIO_CELDA < 0) return;
  
  nuevoElemento.x=serpiente[0].x
  nuevoElemento.y=serpiente[0].y-1

  serpiente.unshift(nuevoElemento)
  serpiente.pop()
}

// ============================================================================
// 🎮 CONTROL DE DIRECCIÓN Y EVENTOS
// ============================================================================

/**
 * Cambia la dirección de la serpiente y redibuja
 * @param {string} direccion - "derecha" | "izquierda" | "abajo" | "arriba"
 */
function cambiarDireccion(direccion) {
  direccionActual=direccion
}

/**
 * Listener para controlar la serpiente con las flechas del teclado
 */
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

function iniciarJuego(){
  intervaloSerpiente = setInterval(moverSerpiente, 300)
}

function pausarJuego(){
  clearInterval(intervaloSerpiente)
}

function moverSerpiente(){ 
  let atrapada = comidaAtrapada()
  let nuevoElemento = {x: serpiente[0].x, y: serpiente[0].y}
  switch (direccionActual) {
    case "derecha":
      moverDerecha();
      nuevoElemento.x++
      break;
    case "izquierda":
      moverIzquierda();
      nuevoElemento.x--
      break;
    case "abajo":
      moverAbajo();
      nuevoElemento.y++
      break;
    case "arriba":
      moverArriba();
      nuevoElemento.y--
      break;
  }
  if(atrapada){
    serpiente.unshift(nuevoElemento) 
    aumentarPuntaje()
    generarNuevaPosicionComida()
  }
  dibujarTodo();
}

function dibujarComida() {
  pintarCoordenada(comida.x, comida.y, "green");
}

function generarNuevaPosicionComida() {
  comida.x = Math.floor(Math.random() * (canvas.width / TAMANIO_CELDA));
  comida.y = Math.floor(Math.random() * (canvas.height / TAMANIO_CELDA));
}

function comidaAtrapada(){
  if(comida.x == serpiente[0].x && serpiente[0].y == comida.y)
    return true
  else 
    return false
}

function aumentarPuntaje(){
  puntaje++
  document.getElementById("puntaje").innerText = puntaje
}
