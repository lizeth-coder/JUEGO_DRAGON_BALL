import Personaje from './Personaje.js';

export default class Acciones extends Personaje {
  defendiendo = false;
  puedeAtacar(energia, ki) {
    return this.getEnergia() >= energia && this.getKi() >= ki;
  }
  recibirDanio(cantidad) {
    const danio = this.defendiendo ? Math.ceil(cantidad / 2) : cantidad;
    this.setVida(this.getVida() - danio);
    this.defendiendo = false;
    return danio;
  }
  atacar(rival, energia, ki, danio) {
    if (!this.puedeAtacar(energia, ki)) return false;
    this.setEnergia(this.getEnergia() - energia);
    this.setKi(this.getKi() - ki);
    return rival.recibirDanio(danio);
  }
  atkBasico(rival, config = this.getAtaqueBasico()) {
    return this.atacar(
      rival,
      config.energia ?? 5,
      config.ki ?? 10,
      config.daño ?? 15,
    );
  }
  atkEspecial(rival, config = this.getAtaqueEspecial()) {
    return this.atacar(
      rival,
      config.energia ?? 15,
      config.ki ?? 20,
      config.daño ?? 30,
    );
  }
  curacion() {
    if (this.getSemilla() === 0) return false;
    this.setVida(100);
    this.setKi(100);
    this.setEnergia(100);
    this.setSemilla(this.getSemilla() - 1);
    return true;
  }
  cargaEnergia() {
    this.setEnergia(this.getEnergia() + 15);
    this.setKi(this.getKi() + 10);
  }
  defensa() {
    this.defendiendo = true;
  }
}
