// ============================================================================
// 🐍 SNAKE.EXE — Lógica principal del juego
//
// MEJORAS aplicadas respecto al código original:
//  1. Bug fix: función dibujarComida() duplicada → eliminada la copia
//  2. Bug fix: no se detectaba colisión con el propio cuerpo → añadido
//  3. Mejora: la serpiente ya no puede retroceder sobre sí misma
//  4. Mejora: sistema de niveles con barra de progreso visual
//  5. Mejora: contador de tiempo en MM:SS mientras se juega
//  6. Mejora: sonido 8-bit sintetizado con Web Audio API (sin archivos externos)
//  7. Mejora: pantallas overlay de Inicio / Pausa / Game Over
//  8. Mejora: atajo de teclado P para pausar/reanudar y R para reiniciar
//  9. Mejora: dibujo mejorado con gradientes para la serpiente y efecto glow
// 10. Limpieza: variables agrupadas, comentarios por sección, sin duplicados
// ============================================================================


// ============================================================================
// ⚙️  CONFIGURACIÓN — constantes que definen el comportamiento del juego
// ============================================================================

const TAMANIO_CELDA = 25;   // Tamaño en px de cada celda del grid

/** Velocidades base por nivel (ms por tick). Menor = más rápido. */
const VELOCIDADES_NIVEL = [700, 500, 380, 280, 200, 140, 100];

/** Cuántos puntos se necesitan para subir de nivel */
const PUNTOS_POR_NIVEL = 5;

/** Número máximo de niveles */
const NIVEL_MAXIMO = VELOCIDADES_NIVEL.length;

/** Dirección opuesta de cada dirección — para bloquear el retroceso */
const OPUESTO = {
  derecha:   "izquierda",
  izquierda: "derecha",
  arriba:    "abajo",
  abajo:     "arriba",
};


// ============================================================================
// 🖼️  ELEMENTOS DEL DOM Y CONTEXTO
// ============================================================================

const canvas = document.getElementById("canvasJuego");
const ctx    = canvas.getContext("2d");

// Referencia a los elementos del HUD para actualizarlos desde JS
const elPuntaje       = document.getElementById("puntaje");
const elEstado        = document.getElementById("estado");
const elMensaje       = document.getElementById("mensaje");
const elNivelDisplay  = document.getElementById("nivelDisplay");
const elTiempoDisplay = document.getElementById("tiempoDisplay");
const elBarraProgreso = document.getElementById("barraProgreso");
const elProgresoLabel = document.getElementById("progresoLabel");
const elNivelBarra    = document.getElementById("nivelBarra");
const elNivelBarraSig = document.getElementById("nivelBarraSig");


// ============================================================================
// 🐍  ESTADO DEL JUEGO — variables mutables que se reinician en reiniciarJuego()
// ============================================================================

/** Segmentos de la serpiente en coordenadas lógicas (celdas, no px) */
let serpiente = [
  { x: 14, y: 13 },
  { x: 14, y: 14 },
  { x: 14, y: 15 },
  { x: 14, y: 16 },
  { x: 14, y: 17 },
];

let intervaloSerpiente;    // ID del setInterval del bucle principal
let intervaloTiempo;       // ID del setInterval del temporizador
let direccionActual = "derecha";
let comida          = { x: 5, y: 5 };
let puntaje         = 0;
let nivelActual     = 1;
let segundosJugados = 0;
let juegoTerminado  = false;
let juegoActivo     = false;   // true entre iniciar y gameOver/pausa
let enPausa         = false;

/** Velocidad actual en ms (tomada de VELOCIDADES_NIVEL según nivelActual) */
let velocidadSerpiente = VELOCIDADES_NIVEL[0];


// ============================================================================
// 🔊  AUDIO — síntesis 8-bit con Web Audio API (sin archivos externos)
// ============================================================================

/** Contexto de audio creado de forma lazy al primer sonido */
let audioCtx = null;

/**
 * Reproduce un pitido sintético de frecuencia y duración configurables.
 * @param {number} frecuencia  - Hz de la nota (p.ej. 440 = La4)
 * @param {number} duracion    - Duración en segundos
 * @param {string} [tipo]      - Tipo de onda: 'square' | 'sine' | 'sawtooth'
 * @param {number} [volumen]   - Ganancia inicial (0–1)
 */
function reproducirSonido(frecuencia, duracion, tipo = "square", volumen = 0.15) {
  try {
    // El AudioContext se crea la primera vez para respetar las políticas
    // de autoplay de los navegadores modernos.
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    const oscilador  = audioCtx.createOscillator();
    const ganancia   = audioCtx.createGain();

    oscilador.connect(ganancia);
    ganancia.connect(audioCtx.destination);

    oscilador.type      = tipo;
    oscilador.frequency.setValueAtTime(frecuencia, audioCtx.currentTime);

    // Fade-out suave al final para evitar "clicks" de audio
    ganancia.gain.setValueAtTime(volumen, audioCtx.currentTime);
    ganancia.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duracion);

    oscilador.start(audioCtx.currentTime);
    oscilador.stop(audioCtx.currentTime + duracion);
  } catch {
    // Si el navegador no soporta Web Audio API, se ignora silenciosamente
  }
}

/** Sonido al comer una manzana */
const sonidoComer     = () => reproducirSonido(880, 0.12, "square", 0.18);

/** Sonido de game over (tono descendente) */
const sonidoGameOver  = () => {
  reproducirSonido(300, 0.15, "sawtooth", 0.2);
  setTimeout(() => reproducirSonido(200, 0.2, "sawtooth", 0.18), 150);
  setTimeout(() => reproducirSonido(100, 0.35, "sawtooth", 0.15), 300);
};

/** Sonido de subida de nivel (acorde ascendente) */
const sonidoNivel     = () => {
  reproducirSonido(523, 0.1, "square", 0.15);
  setTimeout(() => reproducirSonido(659, 0.1, "square", 0.15), 100);
  setTimeout(() => reproducirSonido(784, 0.2, "square", 0.15), 200);
};


// ============================================================================
// 🚀  INICIALIZACIÓN — dibuja el tablero vacío al cargar la página
// ============================================================================

dibujarTablero();
actualizarJuego();


// ============================================================================
// 🎨  FUNCIONES DE DIBUJO
// ============================================================================

/**
 * Ciclo de renderizado: limpia el canvas y redibuja todos los elementos.
 * Se llama al final de cada tick del intervalo.
 */
function actualizarJuego() {
  limpiarCanvas();
  dibujarComida();
  dibujarSerpiente();
}

/** Borra el canvas y redibuja la cuadrícula de fondo */
function limpiarCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  dibujarTablero();
}

/** Dibuja la cuadrícula de líneas y los números de referencia de ejes */
function dibujarTablero() {
  ctx.strokeStyle = "rgba(0,255,255,0.1)";
  ctx.lineWidth   = 0.5;

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

  dibujarNumerosEnY();
  dibujarNumerosEnX();
}

/**
 * Dibuja los números de referencia en el eje Y (lado izquierdo).
 * Útil para depuración en el contexto educativo del taller.
 */
function dibujarNumerosEnY() {
  ctx.fillStyle = "rgba(0,255,255,0.3)";
  ctx.font      = "10px 'Share Tech Mono', monospace";
  let contador  = 0;

  for (let y = 0; y <= canvas.height; y += TAMANIO_CELDA) {
    ctx.fillText(contador, 3, y + 11);
    contador++;
  }
}

/**
 * Dibuja los números de referencia en el eje X (parte superior).
 */
function dibujarNumerosEnX() {
  ctx.fillStyle = "rgba(0,255,255,0.3)";
  ctx.font      = "10px 'Share Tech Mono', monospace";
  let contador  = 0;

  for (let x = 0; x <= canvas.width; x += TAMANIO_CELDA) {
    ctx.fillText(contador, x + 2, 10);
    contador++;
  }
}

/**
 * Pinta una celda con gradiente y efecto glow en coordenadas lógicas.
 * @param {number} x        - Coordenada X lógica (columna)
 * @param {number} y        - Coordenada Y lógica (fila)
 * @param {string} colorA   - Color principal del gradiente
 * @param {string} colorB   - Color secundario del gradiente
 * @param {number} [radio]  - Radio de la sombra glow
 */
function pintarCeldaGradiente(x, y, colorA, colorB, radio = 8) {
  const px = x * TAMANIO_CELDA;
  const py = y * TAMANIO_CELDA;
  const s  = TAMANIO_CELDA;
  const margen = 1;   // separación entre celdas para que se vea el grid

  const grad = ctx.createLinearGradient(px, py, px + s, py + s);
  grad.addColorStop(0, colorA);
  grad.addColorStop(1, colorB);

  ctx.shadowColor = colorA;
  ctx.shadowBlur  = radio;
  ctx.fillStyle   = grad;
  ctx.fillRect(px + margen, py + margen, s - margen * 2, s - margen * 2);
  ctx.shadowBlur  = 0;   // resetear para no afectar otros elementos
}

/**
 * Pinta una celda con un color sólido (API pública mantenida por compatibilidad).
 * @param {number} x      - Coordenada X lógica
 * @param {number} y      - Coordenada Y lógica
 * @param {string} color  - Color de relleno CSS
 */
function pintarCoordenada(x, y, color) {
  const px = x * TAMANIO_CELDA;
  const py = y * TAMANIO_CELDA;
  ctx.fillStyle = color;
  ctx.fillRect(px, py, TAMANIO_CELDA, TAMANIO_CELDA);
}

/**
 * Dibuja todos los segmentos de la serpiente.
 * El segmento 0 (cabeza) se distingue visualmente con un color diferente.
 */
function dibujarSerpiente() {
  serpiente.forEach((segmento, indice) => {
    if (indice === 0) {
      // Cabeza: cian brillante
      pintarCeldaGradiente(segmento.x, segmento.y, "#00ffff", "#00aacc", 14);
    } else {
      // Cuerpo: magenta/púrpura, más opaco hacia la cola
      const opacidad = Math.max(0.4, 1 - indice / serpiente.length);
      pintarCeldaGradiente(
        segmento.x, segmento.y,
        `rgba(180, 0, 255, ${opacidad})`,
        `rgba(100, 0, 180, ${opacidad * 0.7})`,
        6
      );
    }
  });
}

/** Dibuja la manzana (comida) en el canvas */
function dibujarComida() {
  pintarCeldaGradiente(comida.x, comida.y, "#00ff88", "#00cc66", 12);
}


// ============================================================================
// 🕹️  MOVIMIENTOS — cada función calcula la nueva cabeza y detecta colisiones
// ============================================================================

/**
 * Calcula las columnas/filas disponibles en el grid.
 * @returns {{ cols: number, filas: number }}
 */
function dimensionesGrid() {
  return {
    cols:  Math.floor(canvas.width  / TAMANIO_CELDA),
    filas: Math.floor(canvas.height / TAMANIO_CELDA),
  };
}

/**
 * Intenta mover la serpiente una celda hacia la derecha.
 * Llama a gameOver() si hay colisión con la pared.
 */
function moverDerecha() {
  const { cols } = dimensionesGrid();
  const nuevaX   = serpiente[0].x + 1;

  if (nuevaX >= cols) { gameOver(); return; }

  serpiente.unshift({ x: nuevaX, y: serpiente[0].y });
  serpiente.pop();
}

/**
 * Intenta mover la serpiente una celda hacia la izquierda.
 */
function moverIzquierda() {
  const nuevaX = serpiente[0].x - 1;

  if (nuevaX < 0) { gameOver(); return; }

  serpiente.unshift({ x: nuevaX, y: serpiente[0].y });
  serpiente.pop();
}

/**
 * Intenta mover la serpiente una celda hacia abajo.
 */
function moverAbajo() {
  const { filas } = dimensionesGrid();
  const nuevaY    = serpiente[0].y + 1;

  if (nuevaY >= filas) { gameOver(); return; }

  serpiente.unshift({ x: serpiente[0].x, y: nuevaY });
  serpiente.pop();
}

/**
 * Intenta mover la serpiente una celda hacia arriba.
 */
function moverArriba() {
  const nuevaY = serpiente[0].y - 1;

  if (nuevaY < 0) { gameOver(); return; }

  serpiente.unshift({ x: serpiente[0].x, y: nuevaY });
  serpiente.pop();
}


// ============================================================================
// 🎮  CONTROL — teclado, botones táctiles y gestión del intervalo
// ============================================================================

/**
 * Cambia la dirección de movimiento.
 * MEJORA: ignora la dirección si es la opuesta a la actual
 *         para evitar que la serpiente se coma a sí misma al retroceder.
 * @param {string} nuevaDireccion - 'arriba' | 'abajo' | 'izquierda' | 'derecha'
 */
function cambiarDireccion(nuevaDireccion) {
  if (nuevaDireccion === OPUESTO[direccionActual]) return;
  direccionActual = nuevaDireccion;
}

/** Escucha las teclas de flecha, P (pausa) y R (reiniciar) */
window.addEventListener("keydown", (evento) => {
  switch (evento.key) {
    case "ArrowRight": cambiarDireccion("derecha");   break;
    case "ArrowLeft":  cambiarDireccion("izquierda"); break;
    case "ArrowUp":    cambiarDireccion("arriba");    break;
    case "ArrowDown":  cambiarDireccion("abajo");     break;
    case "p":
    case "P":          alternarPausa();               break;
    case "r":
    case "R":          reiniciarJuego();              break;
  }
});

/**
 * Inicia (o reinicia) el intervalo del bucle de juego.
 * Se llama también al subir de nivel para ajustar la velocidad.
 */
function iniciarJuego() {
  if (juegoTerminado) reiniciarJuego();   // si ya murió, reiniciar primero

  clearInterval(intervaloSerpiente);

  intervaloSerpiente = setInterval(moverSerpiente, velocidadSerpiente);

  juegoActivo = true;
  enPausa     = false;

  // Iniciar temporizador si no estaba corriendo
  if (!intervaloTiempo) {
    intervaloTiempo = setInterval(actualizarTiempo, 1000);
  }

  ocultarTodasLasPantallas();
  cambiarEstado("Jugando");
  elMensaje.textContent = "¡Muévete! Come todas las manzanas que puedas.";
}

/** Pausa el juego y muestra la pantalla de pausa */
function pausarJuego() {
  if (!juegoActivo || juegoTerminado) return;

  clearInterval(intervaloSerpiente);
  clearInterval(intervaloTiempo);
  intervaloTiempo = null;

  enPausa     = true;
  juegoActivo = false;

  mostrarPantalla("pantallaPausa");
  cambiarEstado("Pausado");
}

/** Reanuda el juego desde la pausa */
function reanudarJuego() {
  if (!enPausa) return;
  iniciarJuego();
}

/** Alterna entre pausar y reanudar — usado por la tecla P */
function alternarPausa() {
  if (juegoTerminado) return;
  enPausa ? reanudarJuego() : pausarJuego();
}

/**
 * Ejecuta un tick del juego: mueve la serpiente, detecta colisiones
 * con el cuerpo y con la comida.
 */
function moverSerpiente() {
  if (juegoTerminado) return;

  // Guardamos la posición de la nueva cabeza ANTES de mover,
  // para saber si coincide con la comida tras el movimiento.
  const cabezaAntes = { x: serpiente[0].x, y: serpiente[0].y };

  // Ejecutar el movimiento según la dirección (puede llamar a gameOver)
  switch (direccionActual) {
    case "derecha":   moverDerecha();   break;
    case "izquierda": moverIzquierda(); break;
    case "abajo":     moverAbajo();     break;
    case "arriba":    moverArriba();    break;
  }

  if (juegoTerminado) return;   // gameOver() fue llamado dentro del movimiento

  // Detectar colisión con el propio cuerpo (excluye la cabeza, índice 0)
  if (colisionConCuerpo()) {
    gameOver();
    return;
  }

  // Si la nueva cabeza está sobre la comida, crecer y generar nueva comida
  if (comidaAtrapada()) {
    // Añadir un segmento extra en la posición anterior de la cabeza
    serpiente.push({ ...serpiente[serpiente.length - 1] });

    aumentarPuntaje();
    generarNuevaPosicionComida();
    sonidoComer();
  }

  actualizarJuego();
}


// ============================================================================
// 🍎  COMIDA
// ============================================================================

/**
 * Genera una nueva posición aleatoria para la comida.
 * MEJORA: garantiza que la comida no aparezca sobre la serpiente.
 */
function generarNuevaPosicionComida() {
  const { cols, filas } = dimensionesGrid();

  let nueva;
  let intentos = 0;

  do {
    nueva = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * filas),
    };
    intentos++;
  } while (
    // Evitar que aparezca sobre un segmento de la serpiente
    serpiente.some(s => s.x === nueva.x && s.y === nueva.y) &&
    intentos < 200   // límite de seguridad por si el tablero está lleno
  );

  comida = nueva;
}

/**
 * Comprueba si la cabeza de la serpiente está sobre la comida.
 * @returns {boolean}
 */
function comidaAtrapada() {
  return comida.x === serpiente[0].x && comida.y === serpiente[0].y;
}

/**
 * Comprueba si la cabeza colisiona con algún segmento del cuerpo.
 * @returns {boolean}
 */
function colisionConCuerpo() {
  const cabeza = serpiente[0];
  // slice(1) excluye la propia cabeza
  return serpiente.slice(1).some(s => s.x === cabeza.x && s.y === cabeza.y);
}


// ============================================================================
// 📈  PUNTAJE Y NIVELES
// ============================================================================

/**
 * Incrementa el puntaje, comprueba si hay subida de nivel y
 * actualiza todos los elementos del HUD relacionados.
 */
function aumentarPuntaje() {
  puntaje++;
  elPuntaje.textContent = puntaje;

  actualizarBarraNivel();

  // Subir de nivel cuando se alcanzan los puntos necesarios
  const nivelCalculado = Math.min(
    Math.floor(puntaje / PUNTOS_POR_NIVEL) + 1,
    NIVEL_MAXIMO
  );

  if (nivelCalculado > nivelActual) {
    nivelActual        = nivelCalculado;
    velocidadSerpiente = VELOCIDADES_NIVEL[nivelActual - 1];

    elNivelDisplay.textContent = nivelActual;
    elMensaje.textContent      = `⬆️ ¡Nivel ${nivelActual}! La serpiente acelera...`;

    // Reiniciar el intervalo con la nueva velocidad
    clearInterval(intervaloSerpiente);
    intervaloSerpiente = setInterval(moverSerpiente, velocidadSerpiente);

    sonidoNivel();
  }
}

/**
 * Actualiza la barra de progreso de nivel en el HUD.
 */
function actualizarBarraNivel() {
  const puntosEnNivel = puntaje % PUNTOS_POR_NIVEL;
  const porcentaje    = (puntosEnNivel / PUNTOS_POR_NIVEL) * 100;
  const sigNivel      = Math.min(nivelActual + 1, NIVEL_MAXIMO);

  elBarraProgreso.style.width   = `${porcentaje}%`;
  elProgresoLabel.textContent   = nivelActual < NIVEL_MAXIMO
    ? `${puntosEnNivel} / ${PUNTOS_POR_NIVEL} pts al siguiente nivel`
    : "¡Nivel máximo alcanzado!";
  elNivelBarra.textContent      = nivelActual;
  elNivelBarraSig.textContent   = sigNivel;
}

/** Actualiza el texto de estado en el HUD */
function cambiarEstado(estado) {
  elEstado.textContent = estado;
}


// ============================================================================
// ⏱️  TEMPORIZADOR
// ============================================================================

/**
 * Incrementa los segundos jugados y actualiza el HUD de tiempo.
 * Formato: MM:SS
 */
function actualizarTiempo() {
  segundosJugados++;
  const min = String(Math.floor(segundosJugados / 60)).padStart(2, "0");
  const seg = String(segundosJugados % 60).padStart(2, "0");
  elTiempoDisplay.textContent = `${min}:${seg}`;
}


// ============================================================================
// 💀  GAME OVER
// ============================================================================

/** Finaliza la partida, muestra el overlay de game over y reproduce sonido */
function gameOver() {
  juegoTerminado = true;
  juegoActivo    = false;

  clearInterval(intervaloSerpiente);
  clearInterval(intervaloTiempo);
  intervaloTiempo = null;

  cambiarEstado("Game Over");
  sonidoGameOver();

  // Actualizar el overlay con la puntuación y nivel alcanzado
  document.getElementById("puntajeFinalOverlay").textContent = puntaje;
  document.getElementById("mensajeNivelAlcanzado").textContent =
    `Nivel alcanzado: ${nivelActual} — Tiempo: ${elTiempoDisplay.textContent}`;

  // Pequeña pausa antes de mostrar el overlay para que el jugador vea la colisión
  setTimeout(() => mostrarPantalla("pantallaGameOver"), 400);
}


// ============================================================================
// 🔄  REINICIAR
// ============================================================================

/** Reinicia el estado completo del juego a los valores iniciales */
function reiniciarJuego() {
  clearInterval(intervaloSerpiente);
  clearInterval(intervaloTiempo);
  intervaloTiempo = null;

  // Restaurar estado
  serpiente = [
    { x: 14, y: 13 },
    { x: 14, y: 14 },
    { x: 14, y: 15 },
    { x: 14, y: 16 },
    { x: 14, y: 17 },
  ];

  comida             = { x: 5, y: 5 };
  puntaje            = 0;
  nivelActual        = 1;
  segundosJugados    = 0;
  velocidadSerpiente = VELOCIDADES_NIVEL[0];
  direccionActual    = "derecha";
  juegoTerminado     = false;
  juegoActivo        = false;
  enPausa            = false;

  // Resetear HUD
  elPuntaje.textContent       = 0;
  elNivelDisplay.textContent  = 1;
  elTiempoDisplay.textContent = "00:00";
  elBarraProgreso.style.width = "0%";
  actualizarBarraNivel();
  cambiarEstado("Listo");
  elMensaje.textContent = "Presiona iniciar para comenzar.";

  ocultarTodasLasPantallas();
  actualizarJuego();
}


// ============================================================================
// 🪟  GESTIÓN DE PANTALLAS OVERLAY
// ============================================================================

/**
 * 
 * @param {string} idPantalla - ID del elemento a mostrar
 */
function mostrarPantalla(idPantalla) {
  ["pantallaInicio", "pantallaPausa", "pantallaGameOver"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("activa", id === idPantalla);
  });
}

/** Oculta todas las pantallas overlay */
function ocultarTodasLasPantallas() {
  ["pantallaInicio", "pantallaPausa", "pantallaGameOver"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("activa");
  });
}