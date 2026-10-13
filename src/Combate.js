import Acciones from './Acciones.js';

export default class Combate {
  constructor(seleccion) {
    this.jugadores = seleccion.map(
      ({ nombre, personaje }) => new Acciones(nombre, personaje),
    );
    this.turno = 0;
    this.ronda = 1;
    this.turnosTotales = 0;
    this.ganador = null;
  }
  actuar(indice, accion) {
    if (this.ganador !== null || indice !== this.turno)
      return { error: 'Espera tu turno.' };
    const jugador = this.jugadores[indice];
    const rival = this.jugadores[1 - indice];
    const acciones = ['basico', 'especial', 'defensa', 'energia', 'curar'];
    if (!acciones.includes(accion)) return { error: 'Acción no válida.' };
    if (accion === 'especial' && this.turnosTotales < 2) {
      return { error: 'El ataque especial se desbloquea tras dos turnos.' };
    }
    if (
      (accion === 'basico' && !jugador.puedeAtacar(5, 10)) ||
      (accion === 'especial' && !jugador.puedeAtacar(15, 20))
    ) {
      return {
        error: 'No tienes suficiente ki o energía. Usa Cargar energía.',
      };
    }
    if (accion === 'curar' && jugador.getSemilla() === 0)
      return { error: 'Ya no tienes semillas.' };
    jugador.defendiendo = false;
    let mensaje;
    if (accion === 'basico' || accion === 'especial') {
      const ataqueBasico = jugador.getAtaqueBasico();
      const ataqueEspecial = jugador.getAtaqueEspecial();
      const danio =
        accion === 'basico'
          ? jugador.atkBasico(rival, ataqueBasico)
          : jugador.atkEspecial(rival, ataqueEspecial);
      const nombreAtaque =
        accion === 'basico' ? ataqueBasico.nombre : ataqueEspecial.nombre;
      mensaje = `${jugador.nombre} usa ${nombreAtaque}: ${danio} de daño a ${rival.nombre}.`;
    } else if (accion === 'defensa') {
      jugador.defensa();
      mensaje = `${jugador.nombre} se defiende: reduce a la mitad el próximo ataque.`;
    } else if (accion === 'energia') {
      jugador.cargaEnergia();
      mensaje = `${jugador.nombre} recupera 15 de energía y 10 de ki, hasta 100.`;
    } else {
      jugador.curacion();
      mensaje = `${jugador.nombre} usa una semilla y recupera vida, ki y energía.`;
    }
    this.turnosTotales += 1;
    if (rival.getVida() === 0) this.ganador = indice;
    else {
      this.turno = 1 - indice;
      this.ronda++;
    }
    return { mensaje, ganador: this.ganador };
  }
}
