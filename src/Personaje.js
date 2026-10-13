const ATAQUES = {
  Goku: {
    basico: { nombre: 'Puñetazo rápido', daño: 15, energia: 5, ki: 10 },
    especial: { nombre: 'Kamehameha', daño: 30, energia: 15, ki: 20 },
  },
  Veguitto: {
    basico: { nombre: 'Golpe de energía', daño: 15, energia: 5, ki: 10 },
    especial: { nombre: 'Final Flash', daño: 30, energia: 15, ki: 20 },
  },
  Trunks: {
    basico: { nombre: 'Corte del futuro', daño: 15, energia: 5, ki: 10 },
    especial: { nombre: 'Burning Attack', daño: 30, energia: 15, ki: 20 },
  },
  Gohan: {
    basico: { nombre: 'Patada vertical', daño: 15, energia: 5, ki: 10 },
    especial: { nombre: 'Masenko', daño: 30, energia: 15, ki: 20 },
  },
  Veguetta: {
    basico: { nombre: 'Golpe galáctico', daño: 15, energia: 5, ki: 10 },
    especial: { nombre: 'Galick Gun', daño: 30, energia: 15, ki: 20 },
  },
  Cell: {
    basico: { nombre: 'Mordisco absorbente', daño: 15, energia: 5, ki: 10 },
    especial: { nombre: 'Rayo de energía', daño: 30, energia: 15, ki: 20 },
  },
  Pikoro: {
    basico: { nombre: 'Puño de escudo', daño: 15, energia: 5, ki: 10 },
    especial: { nombre: 'Explosión de energía', daño: 30, energia: 15, ki: 20 },
  },
  Gogeta: {
    basico: { nombre: 'Remolino fusionado', daño: 15, energia: 5, ki: 10 },
    especial: { nombre: 'Meteorito azul', daño: 30, energia: 15, ki: 20 },
  },
};

export default class Personaje {
  #vida = 100;
  #ki = 100;
  #energia = 100;
  #semilla = 2;
  constructor(nombre, personaje = '') {
    this.nombre = nombre;
    this.personaje = personaje;
  }
  getVida() {
    return this.#vida;
  }
  getKi() {
    return this.#ki;
  }
  getEnergia() {
    return this.#energia;
  }
  getSemilla() {
    return this.#semilla;
  }
  getNombre() {
    return this.nombre;
  }
  getAtaqueBasico() {
    return (
      ATAQUES[this.personaje]?.basico ?? {
        nombre: 'Puñetazo básico',
        daño: 15,
        energia: 5,
        ki: 10,
      }
    );
  }
  getAtaqueEspecial() {
    return (
      ATAQUES[this.personaje]?.especial ?? {
        nombre: 'Ataque especial',
        daño: 30,
        energia: 15,
        ki: 20,
      }
    );
  }
  setVida(value) {
    this.#vida = Math.max(0, Math.min(100, value));
  }
  setKi(value) {
    this.#ki = Math.max(0, Math.min(100, value));
  }
  setEnergia(value) {
    this.#energia = Math.max(0, Math.min(100, value));
  }
  setSemilla(value) {
    this.#semilla = Math.max(0, Math.min(2, value));
  }
}
