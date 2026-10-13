import test from 'node:test';
import assert from 'node:assert/strict';
import Combate from '../src/Combate.js';
const nuevo = () =>
  new Combate([
    { nombre: 'Ana', personaje: 'Goku' },
    { nombre: 'Luis', personaje: 'Cell' },
  ]);
test('respeta turnos y cobra el ataque', () => {
  const c = nuevo();
  assert.ok(c.actuar(1, 'basico').error);
  assert.equal(c.turno, 0);
  c.actuar(0, 'basico');
  assert.equal(c.jugadores[1].getVida(), 85);
  assert.equal(c.jugadores[0].getKi(), 90);
  assert.equal(c.jugadores[0].getEnergia(), 95);
  assert.equal(c.turno, 1);
});
test('defensa reduce daño y expira tras un turno rival sin ataque', () => {
  const c = nuevo();
  c.actuar(0, 'defensa');
  c.actuar(1, 'basico');
  assert.equal(c.jugadores[0].getVida(), 92);
  c.actuar(0, 'basico');
  c.actuar(1, 'basico');
  assert.equal(c.jugadores[0].getVida(), 77);
});
test('recursos insuficientes no gastan turno y carga permite volver a atacar', () => {
  const c = nuevo();
  c.jugadores[0].setKi(0);
  assert.ok(c.actuar(0, 'especial').error);
  assert.equal(c.turno, 0);
  c.actuar(0, 'energia');
  c.actuar(1, 'energia');
  c.actuar(0, 'basico');
  assert.equal(c.jugadores[1].getVida(), 85);
});
test('semillas limitadas y estadísticas acotadas', () => {
  const c = nuevo();
  for (let i = 0; i < 2; i++) {
    c.jugadores[0].setVida(10);
    c.actuar(0, 'curar');
    assert.equal(c.jugadores[0].getVida(), 100);
    c.actuar(1, 'energia');
  }
  assert.equal(c.jugadores[0].getSemilla(), 0);
  assert.ok(c.actuar(0, 'curar').error);
  assert.equal(c.turno, 0);
  assert.equal(c.jugadores[1].getKi(), 100);
});
test('ataque especial se desbloquea tras dos turnos y usa el movimiento característico del personaje', () => {
  const c = nuevo();
  assert.ok(c.actuar(0, 'especial').error);
  c.actuar(0, 'basico');
  c.actuar(1, 'basico');
  const respuesta = c.actuar(0, 'especial');
  assert.equal(respuesta.error, undefined);
  assert.match(
    respuesta.mensaje,
    /Kamehameha|Final Flash|Masenko|Rayo de|Galick/,
  );
});
test('victoria bloquea acciones y nueva partida restaura estado', () => {
  const c = nuevo();
  c.actuar(0, 'basico');
  c.actuar(1, 'energia');
  c.actuar(0, 'basico');
  c.actuar(1, 'energia');
  for (let i = 0; i < 4; i++) {
    c.actuar(0, 'especial');
    if (c.ganador === null) c.actuar(1, 'energia');
  }
  assert.equal(c.ganador, 0);
  assert.equal(c.jugadores[1].getVida(), 0);
  assert.ok(c.actuar(0, 'curar').error);
  const r = nuevo();
  assert.equal(r.ganador, null);
  assert.equal(r.jugadores[0].getKi(), 100);
  assert.equal(r.jugadores[0].getSemilla(), 2);
});

test('Gogeta conserva su ataque característico en el combate', () => {
  const combate = new Combate([
    { nombre: 'Ana', personaje: 'Gogeta' },
    { nombre: 'Luis', personaje: 'Goku' },
  ]);
  combate.actuar(0, 'energia');
  combate.actuar(1, 'energia');
  const respuesta = combate.actuar(0, 'especial');
  assert.match(respuesta.mensaje, /Meteorito azul/);
  assert.equal(combate.jugadores[1].getVida(), 70);
  assert.equal(combate.jugadores[0].getKi(), 80);
});
