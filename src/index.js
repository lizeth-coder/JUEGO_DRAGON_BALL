import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
import '@fortawesome/fontawesome-free/css/solid.min.css';
import Swal from 'sweetalert2';
import Combate from './Combate.js';
import './style.css';

const $ = (id) => document.getElementById(id);

const seleccion = [
  { nombre: '', personaje: '' },
  { nombre: '', personaje: '' },
];
const listos = [false, false];
let combate;
let bloqueado = false;
let temporizador;
let battleMusicTimer = null;
let battleMusicContext = null;

const carpetas = {
  Veguitto: 'Veguito',
  Trunks: 'Trunks',
  Gohan: 'Gohan',
  Goku: 'Goku',
  Veguetta: 'Veguetta',
  Cell: 'Cell',
  Pikoro: 'Pikoro',
  Gogeta: 'Gogueta',
};

const imagen = (personaje, pose = 'base') =>
  `./public/img/DB/${carpetas[personaje] || 'Goku'}/${pose}.png`;

const aviso = (text) =>
  Swal.fire({
    title: 'Revisa tu jugada',
    text,
    icon: 'info',
    confirmButtonColor: '#b02a37',
  });

function mostrarSeleccionPersonaje(indice, imagenSeleccionada) {
  const contenedor = $(`py${indice + 1}`);
  const fotos = contenedor.querySelectorAll('.row img');

  fotos.forEach((img) => {
    const activo = img === imagenSeleccionada;
    img.classList.toggle('bg-warning', activo);
    img.setAttribute('aria-pressed', String(activo));
  });

  const preview = $(`img_preview_p${indice + 1}`);
  const nombrePreview = $(`name_preview_p${indice + 1}`);
  preview.src = imagen(imagenSeleccionada.alt);
  preview.alt = imagenSeleccionada.alt;
  nombrePreview.textContent = imagenSeleccionada.alt;
  $(`preview_p${indice + 1}`).classList.remove('d-none');
}

function guardarJugador(indice) {
  const input = $(`player${indice + 1}`);
  const nombre = input.value.trim();

  if (!nombre) return aviso(`Escribe el nombre del jugador ${indice + 1}.`);
  if (!seleccion[indice].personaje)
    return aviso(`Elige el personaje del jugador ${indice + 1}.`);

  seleccion[indice].nombre = nombre;
  listos[indice] = true;
  input.disabled = true;
  $(`btn_player${indice + 1}`).disabled = true;
  $(`btn_player${indice + 1}`).textContent = '¡Listo!';

  const fotos = $(`py${indice + 1}`).querySelectorAll('.row img');
  fotos.forEach((img) => {
    img.tabIndex = -1;
    img.setAttribute('aria-disabled', 'true');
  });

  $('estado').textContent = `Jugador ${indice + 1} listo. Esperando al otro jugador…`;

  if (listos.every(Boolean)) iniciar();
}

function iniciarMusicaDeBatalla() {
  if (battleMusicTimer) return;

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  battleMusicContext = new AudioCtx();
  const gain = battleMusicContext.createGain();
  gain.gain.value = 0.03;
  gain.connect(battleMusicContext.destination);

  const riff = [
    220, 247, 293.66, 329.63, 293.66, 247, 196, 220, 174.61, 196, 246.94,
    293.66,
  ];
  let indice = 0;

  const tocarNota = (frecuencia, inicio, duracion, forma = 'square') => {
    const oscilador = battleMusicContext.createOscillator();
    const volumen = battleMusicContext.createGain();
    oscilador.type = forma;
    oscilador.frequency.setValueAtTime(
      frecuencia,
      battleMusicContext.currentTime + inicio,
    );
    volumen.gain.setValueAtTime(0.0001, battleMusicContext.currentTime + inicio);
    volumen.gain.linearRampToValueAtTime(
      0.22,
      battleMusicContext.currentTime + inicio + 0.02,
    );
    volumen.gain.exponentialRampToValueAtTime(
      0.0001,
      battleMusicContext.currentTime + inicio + duracion,
    );
    oscilador.connect(volumen).connect(gain);
    oscilador.start(battleMusicContext.currentTime + inicio);
    oscilador.stop(battleMusicContext.currentTime + inicio + duracion);
  };

  const siguientePaso = () => {
    if (!battleMusicContext) return;
    const nota = riff[indice % riff.length];
    tocarNota(nota, 0, 0.22, 'square');
    if (indice % 2 === 0) tocarNota(nota / 2, 0.04, 0.28, 'sawtooth');
    indice += 1;
    battleMusicTimer = setTimeout(siguientePaso, 240);
  };

  battleMusicTimer = setTimeout(siguientePaso, 240);
}

function detenerMusicaDeBatalla() {
  if (battleMusicTimer) {
    clearTimeout(battleMusicTimer);
    battleMusicTimer = null;
  }

  if (battleMusicContext) {
    battleMusicContext.close();
    battleMusicContext = null;
  }
}

function activarAnimacionPoder(indice, accion = 'basico') {
  const arena = $('arena');
  const luchador = $(`fighter-${indice}`);
  const overlay = $('attack-overlay');
  const visual = $('attack-visual');
  if (!arena || !luchador || !overlay || !visual) return;

  const personaje = seleccion[indice]?.personaje;
  const pose = accion === 'especial' ? 'especial' : 'basico';
  visual.src = personaje ? imagen(personaje, pose) : '';
  visual.alt = `${personaje || 'Personaje'} usando ${accion}`;

  arena.classList.remove('powering');
  luchador.classList.remove('powering');
  overlay.classList.remove('show');
  visual.style.animation = 'none';

  void arena.offsetWidth;
  void luchador.offsetWidth;
  void overlay.offsetWidth;

  requestAnimationFrame(() => {
    visual.style.animation = '';
    arena.classList.add('powering');
    luchador.classList.add('powering');
    overlay.classList.add('show');
  });

  setTimeout(() => {
    arena.classList.remove('powering');
    luchador.classList.remove('powering');
    overlay.classList.remove('show');
  }, 650);
}

function prepararSeleccion() {
  seleccion.forEach((jugador, indice) => {
    const numero = indice + 1;
    const contenedor = $(`py${numero}`);
    const fotos = contenedor.querySelectorAll('.row img');

    fotos.forEach((img) => {
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', `Elegir ${img.alt}, jugador ${numero}`);
      img.setAttribute('aria-pressed', 'false');

      const elegir = () => {
        if (listos[indice]) return;
        jugador.personaje = img.alt;
        mostrarSeleccionPersonaje(indice, img);
      };

      img.addEventListener('click', elegir);
      img.addEventListener('keydown', (evento) => {
        if (evento.key === 'Enter' || evento.key === ' ') {
          evento.preventDefault();
          elegir();
        }
      });
    });

    $(`btn_player${numero}`).addEventListener('click', () => guardarJugador(indice));
  });
}

function iniciar() {
  clearTimeout(temporizador);
  detenerMusicaDeBatalla();
  combate = new Combate(seleccion);
  bloqueado = false;

  $('seleccion').classList.add('d-none');
  $('arena').classList.remove('d-none');
  $('estado').textContent = 'Elige una acción cuando sea tu turno.';
  $('resultado').textContent = '';
  $('revancha').classList.add('d-none');

  $('luchadores').innerHTML = seleccion
    .map((jugador, indice) => {
      const basico = combate.jugadores[indice].getAtaqueBasico().nombre;
      const especial = combate.jugadores[indice].getAtaqueEspecial().nombre;
      return `
        <div class="col-md-6">
          <article id="fighter-${indice}" class="fighter p-3 p-lg-4">
            <h3 id="nombre-${indice}" class="h4"></h3>
            <p id="personaje-${indice}" class="text-secondary"></p>
            <img id="sprite-${indice}" class="battle-sprite" alt="">

            ${['vida', 'ki', 'energia']
              .map(
                (stat) => `
                  <div class="stat-label">${{ vida: 'Vida', ki: 'Ki', energia: 'Energía' }[stat]}</div>
                  <div class="progress mb-2">
                    <div id="battle-${indice}-${stat}" class="progress-bar bg-${{ vida: 'success', ki: 'info', energia: 'warning' }[stat]} text-dark fw-bold" role="progressbar" aria-label="${stat}" aria-valuemin="0" aria-valuemax="100"></div>
                  </div>
                `,
              )
              .join('')}

            <p id="semillas-${indice}" class="mt-3"></p>
            <p id="escudo-${indice}" class="shield-status"></p>

            <div class="actions">
              <button class="btn btn-outline-light" data-player="${indice}" data-action="basico">${basico} <small>15 daño · −5 energía / −10 ki</small></button>
              <button class="btn btn-warning" data-player="${indice}" data-action="especial">${especial} <small>30 daño · −15 energía / −20 ki</small></button>
              <button class="btn btn-outline-info" data-player="${indice}" data-action="defensa">Defender <small>Reduce el daño a la mitad</small></button>
              <button class="btn btn-outline-warning" data-player="${indice}" data-action="energia">Cargar energía <small>+15 energía / +10 ki</small></button>
              <button class="btn btn-outline-success" data-player="${indice}" data-action="curar">Semilla del ermitaño <small>Recupera vida, ki y energía</small></button>
            </div>
          </article>
        </div>`;
    })
    .join('');

  seleccion.forEach((jugador, indice) => {
    $(`nombre-${indice}`).textContent = `${jugador.nombre} · J${indice + 1}`;
    $(`personaje-${indice}`).textContent = jugador.personaje;
    const sprite = $(`sprite-${indice}`);
    sprite.src = imagen(jugador.personaje);
    sprite.alt = jugador.personaje;
  });

  actualizarPantalla();
  $('turno').focus();
}

function actualizarPantalla() {
  const terminado = combate.ganador !== null;
  $('turno').textContent = terminado
    ? '¡Combate terminado!'
    : `Turno ${combate.ronda}: ${combate.jugadores[combate.turno].nombre} · J${combate.turno + 1}`;

  combate.jugadores.forEach((jugador, indice) => {
    const peleador = $(`fighter-${indice}`);
    peleador.classList.toggle('active-turn', !terminado && combate.turno === indice);

    ['vida', 'ki', 'energia'].forEach((stat) => {
      const valor = jugador[`get${stat.charAt(0).toUpperCase() + stat.slice(1)}`]();
      const barra = $(`battle-${indice}-${stat}`);
      barra.style.width = `${valor}%`;
      barra.textContent = `${valor}`;
      barra.setAttribute('aria-valuenow', valor);
    });

    $(`semillas-${indice}`).textContent = `Semillas disponibles: ${jugador.getSemilla()} / 2`;
    $(`escudo-${indice}`).textContent = jugador.defendiendo ? '🛡 Defensa activa' : '';

    document.querySelectorAll(`[data-player="${indice}"]`).forEach((btn) => {
      const accion = btn.dataset.action;
      const falta =
        (accion === 'basico' && !jugador.puedeAtacar(5, 10)) ||
        (accion === 'especial' &&
          (combate.turnosTotales < 2 || !jugador.puedeAtacar(15, 20))) ||
        (accion === 'curar' && jugador.getSemilla() === 0);

      btn.disabled = bloqueado || terminado || combate.turno !== indice || falta;
    });
  });

  if (terminado) detenerMusicaDeBatalla();
  else if (combate.turnosTotales >= 2) iniciarMusicaDeBatalla();
}

$('luchadores').addEventListener('click', (evento) => {
  const boton = evento.target.closest('button[data-action]');
  if (!boton || bloqueado || boton.disabled) return;

  const indice = Number(boton.dataset.player);
  const accion = boton.dataset.action;
  const respuesta = combate.actuar(indice, accion);

  if (respuesta.error) return aviso(respuesta.error);

  $(`sprite-${indice}`).src = imagen(seleccion[indice].personaje, 'base');

  if (accion === 'basico' || accion === 'especial') {
    activarAnimacionPoder(indice, accion);
  }

  bloqueado = true;

  if (respuesta.ganador !== null) {
    $('resultado').textContent = `🏆 ¡${seleccion[indice].nombre} gana con ${seleccion[indice].personaje}!`;
    $('revancha').classList.remove('d-none');
    $('estado').textContent = 'Puedes jugar la revancha o elegir nuevos personajes.';
  }

  actualizarPantalla();

  temporizador = setTimeout(() => {
    seleccion.forEach((jugador, posicion) => {
      $(`sprite-${posicion}`).src = imagen(jugador.personaje);
    });
    bloqueado = false;
    actualizarPantalla();
  }, 500);
});

$('revancha').addEventListener('click', iniciar);

$('cambiar').addEventListener('click', async () => {
  if (combate && combate.ganador === null) {
    const respuesta = await Swal.fire({
      title: '¿Salir del combate?',
      text: 'Se perderá el progreso de esta partida.',
      showCancelButton: true,
      confirmButtonText: 'Cambiar personajes',
      cancelButtonText: 'Seguir jugando',
    });

    if (!respuesta.isConfirmed) return;
  }

  clearTimeout(temporizador);
  detenerMusicaDeBatalla();

  $('arena').classList.add('d-none');
  $('seleccion').classList.remove('d-none');
  $('estado').textContent = 'Elige tus personajes y pulsa Aceptar.';
  listos.fill(false);

  seleccion.forEach((_, indice) => {
    const numero = indice + 1;
    $(`player${numero}`).disabled = false;
    $(`btn_player${numero}`).disabled = false;
    $(`btn_player${numero}`).textContent = 'Aceptar';

    $(`py${numero}`).querySelectorAll('.row img').forEach((img) => {
      img.tabIndex = 0;
      img.removeAttribute('aria-disabled');
    });
  });

  $('player1').focus();
});

prepararSeleccion();
