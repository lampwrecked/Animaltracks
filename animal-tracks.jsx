import { useState, useEffect, useRef, useCallback } from "react";

const ANIMAL_DEFS = {
  moose: {
    name: "Moose", naturalCadence: 38, legs: 4,
    pattern: [1, 0, 0, 0, 0, 1, 0, 0],
    printSize: 34, desc: "Bass Drum", strideMultiplier: 3.5, wanderAmount: 0.015,
    hindOffset: 1.2, hindScale: 0.88,
  },
  bear: {
    name: "Bear", naturalCadence: 45, legs: 4,
    pattern: [1, 0, 0, 0, 1, 0, 0, 0],
    printSize: 30, desc: "Floor Tom", strideMultiplier: 3.2, wanderAmount: 0.02,
    hindOffset: 1.0, hindScale: 0.85,
  },
  deer: {
    name: "Deer", naturalCadence: 80, legs: 4,
    pattern: [1, 0, 0, 1, 0, 1, 0, 0],
    printSize: 18, desc: "Kick", strideMultiplier: 2.4, wanderAmount: 0.04,
    hindOffset: 1.0, hindScale: 0.9,
  },
  wolf: {
    name: "Wolf", naturalCadence: 100, legs: 4,
    pattern: [1, 0, 1, 1, 0, 1, 0, 1],
    printSize: 16, desc: "Snare", strideMultiplier: 2.0, wanderAmount: 0.04,
    hindOffset: 0.9, hindScale: 0.88,
  },
  coyote: {
    name: "Coyote", naturalCadence: 115, legs: 4,
    pattern: [1, 0, 1, 0, 1, 1, 0, 1],
    printSize: 13, desc: "Side Stick", strideMultiplier: 1.7, wanderAmount: 0.06,
    hindOffset: 0.8, hindScale: 0.9,
  },
  fox: {
    name: "Fox", naturalCadence: 120, legs: 4,
    pattern: [1, 0, 0, 1, 0, 0, 1, 0],
    printSize: 11, desc: "Woodblock", strideMultiplier: 1.5, wanderAmount: 0.07,
    hindOffset: 0.75, hindScale: 0.9,
  },
  bobcat: {
    name: "Bobcat", naturalCadence: 110, legs: 4,
    pattern: [0, 1, 0, 1, 0, 0, 1, 0],
    printSize: 13, desc: "Mid Tom", strideMultiplier: 1.6, wanderAmount: 0.05,
    hindOffset: 0.8, hindScale: 0.88,
  },
  raccoon: {
    name: "Raccoon", naturalCadence: 130, legs: 4,
    pattern: [1, 0, 1, 0, 1, 0, 1, 0],
    printSize: 10, desc: "Hi-Hat", strideMultiplier: 1.2, wanderAmount: 0.08,
    hindOffset: 0.7, hindScale: 0.92,
  },
  porcupine: {
    name: "Porcupine", naturalCadence: 60, legs: 4,
    pattern: [1, 0, 0, 1, 0, 0, 0, 1],
    printSize: 12, desc: "Cabasa", strideMultiplier: 1.3, wanderAmount: 0.03,
    hindOffset: 0.8, hindScale: 0.9,
  },
  owl: {
    name: "Owl", naturalCadence: 90, legs: 2,
    pattern: [0, 1, 0, 0, 1, 0, 1, 0],
    printSize: 10, desc: "Clap", strideMultiplier: 1.0, wanderAmount: 0.1,
  },
  rabbit: {
    name: "Rabbit", naturalCadence: 160, legs: 4,
    pattern: [1, 1, 0, 0, 1, 1, 0, 0],
    printSize: 9, desc: "Rim Click", strideMultiplier: 1.3, wanderAmount: 0.09,
    hindOffset: 0.7, hindScale: 0.95,
  },
  skunk: {
    name: "Skunk", naturalCadence: 70, legs: 4,
    pattern: [1, 0, 0, 0, 1, 0, 1, 0],
    printSize: 10, desc: "Brush", strideMultiplier: 1.1, wanderAmount: 0.04,
    hindOffset: 0.75, hindScale: 0.9,
  },
  squirrel: {
    name: "Squirrel", naturalCadence: 200, legs: 4,
    pattern: [1, 1, 1, 0, 1, 1, 0, 1],
    printSize: 5, desc: "Tambourine", strideMultiplier: 0.8, wanderAmount: 0.15,
    hindOffset: 0.5, hindScale: 0.95,
  },
  bird: {
    name: "Bird", naturalCadence: 180, legs: 2,
    pattern: [1, 1, 0, 1, 1, 0, 1, 0],
    printSize: 6, desc: "Shaker", strideMultiplier: 0.9, wanderAmount: 0.12,
  },
};

/* ---- AUDIO ---- */
let _actx = null;
function getAudio() {
  if (!_actx) _actx = new (window.AudioContext || window.webkitAudioContext)();
  if (_actx.state === "suspended") _actx.resume();
  return _actx;
}
let _muted = false;

function playBassDrum() {
  if (_muted) return;
  const ctx = getAudio(), t = ctx.currentTime;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = "sine"; o.frequency.setValueAtTime(80, t); o.frequency.exponentialRampToValueAtTime(22, t + 0.2);
  g.gain.setValueAtTime(1, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.55);
  const o2 = ctx.createOscillator(), g2 = ctx.createGain();
  o2.type = "triangle"; o2.frequency.setValueAtTime(500, t); o2.frequency.exponentialRampToValueAtTime(30, t + 0.02);
  g2.gain.setValueAtTime(0.6, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  o2.connect(g2).connect(ctx.destination); o2.start(t); o2.stop(t + 0.04);
}

function playFloorTom() {
  if (_muted) return;
  const ctx = getAudio(), t = ctx.currentTime;
  const o = ctx.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(85, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.25);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.75, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.45);
  const o2 = ctx.createOscillator(); o2.type = "triangle"; o2.frequency.setValueAtTime(220, t); o2.frequency.exponentialRampToValueAtTime(45, t + 0.025);
  const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.35, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  o2.connect(g2).connect(ctx.destination); o2.start(t); o2.stop(t + 0.04);
}

function playKick() {
  if (_muted) return;
  const ctx = getAudio(), t = ctx.currentTime;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = "sine"; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(30, t + 0.15);
  g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.4);
  const o2 = ctx.createOscillator(), g2 = ctx.createGain();
  o2.type = "triangle"; o2.frequency.setValueAtTime(700, t); o2.frequency.exponentialRampToValueAtTime(45, t + 0.018);
  g2.gain.setValueAtTime(0.45, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
  o2.connect(g2).connect(ctx.destination); o2.start(t); o2.stop(t + 0.03);
}

function playSnare() {
  if (_muted) return;
  const ctx = getAudio(), t = ctx.currentTime;
  const bs = ctx.sampleRate * 0.12, buf = ctx.createBuffer(1, bs, ctx.sampleRate);
  const d = buf.getChannelData(0); for (let i = 0; i < bs; i++) d[i] = Math.random() * 2 - 1;
  const n = ctx.createBufferSource(); n.buffer = buf;
  const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 3800; f.Q.value = 0.8;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  n.connect(f).connect(g).connect(ctx.destination); n.start(t); n.stop(t + 0.12);
  const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.setValueAtTime(190, t); o.frequency.exponentialRampToValueAtTime(110, t + 0.035);
  const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.45, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
  o.connect(g2).connect(ctx.destination); o.start(t); o.stop(t + 0.07);
}

function playSideStick() {
  if (_muted) return;
  const ctx = getAudio(), t = ctx.currentTime;
  const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.setValueAtTime(1200, t); o.frequency.exponentialRampToValueAtTime(400, t + 0.008);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.04);
}

function playWoodblock() {
  if (_muted) return;
  const ctx = getAudio(), t = ctx.currentTime;
  const o = ctx.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(900, t); o.frequency.exponentialRampToValueAtTime(600, t + 0.02);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.4, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 800; bp.Q.value = 3;
  o.connect(bp).connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.06);
}

function playMidTom() {
  if (_muted) return;
  const ctx = getAudio(), t = ctx.currentTime;
  const o = ctx.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(80, t + 0.12);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.6, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.25);
  const o2 = ctx.createOscillator(); o2.type = "triangle"; o2.frequency.setValueAtTime(300, t); o2.frequency.exponentialRampToValueAtTime(80, t + 0.02);
  const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.3, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
  o2.connect(g2).connect(ctx.destination); o2.start(t); o2.stop(t + 0.03);
}

function playHihat() {
  if (_muted) return;
  const ctx = getAudio(), t = ctx.currentTime;
  const bs = ctx.sampleRate * 0.05, buf = ctx.createBuffer(1, bs, ctx.sampleRate);
  const d = buf.getChannelData(0); for (let i = 0; i < bs; i++) d[i] = Math.random() * 2 - 1;
  const n = ctx.createBufferSource(); n.buffer = buf;
  const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 7500;
  const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 10000; bp.Q.value = 1;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.22, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  n.connect(hp).connect(bp).connect(g).connect(ctx.destination); n.start(t); n.stop(t + 0.05);
}

function playCabasa() {
  if (_muted) return;
  const ctx = getAudio(), t = ctx.currentTime;
  const bs = ctx.sampleRate * 0.06, buf = ctx.createBuffer(1, bs, ctx.sampleRate);
  const d = buf.getChannelData(0); for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bs * 0.3));
  const n = ctx.createBufferSource(); n.buffer = buf;
  const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 5000;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  n.connect(hp).connect(g).connect(ctx.destination); n.start(t); n.stop(t + 0.06);
}

function playClap() {
  if (_muted) return;
  const ctx = getAudio(), t = ctx.currentTime;
  for (let i = 0; i < 3; i++) {
    const dt = i * 0.012;
    const bs = ctx.sampleRate * 0.015, buf = ctx.createBuffer(1, bs, ctx.sampleRate);
    const d = buf.getChannelData(0); for (let j = 0; j < bs; j++) d[j] = (Math.random() * 2 - 1);
    const n = ctx.createBufferSource(); n.buffer = buf;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 2400; bp.Q.value = 1.2;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.25, t + dt); g.gain.exponentialRampToValueAtTime(0.001, t + dt + 0.02);
    n.connect(bp).connect(g).connect(ctx.destination); n.start(t + dt); n.stop(t + dt + 0.02);
  }
  // tail
  const bs2 = ctx.sampleRate * 0.08, buf2 = ctx.createBuffer(1, bs2, ctx.sampleRate);
  const d2 = buf2.getChannelData(0); for (let i = 0; i < bs2; i++) d2[i] = Math.random() * 2 - 1;
  const n2 = ctx.createBufferSource(); n2.buffer = buf2;
  const bp2 = ctx.createBiquadFilter(); bp2.type = "bandpass"; bp2.frequency.value = 2000; bp2.Q.value = 0.6;
  const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.18, t + 0.035); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  n2.connect(bp2).connect(g2).connect(ctx.destination); n2.start(t + 0.035); n2.stop(t + 0.1);
}

function playRim() {
  if (_muted) return;
  const ctx = getAudio(), t = ctx.currentTime;
  const o = ctx.createOscillator(); o.type = "square"; o.frequency.setValueAtTime(1600, t); o.frequency.exponentialRampToValueAtTime(500, t + 0.006);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.025);
  const bs = ctx.sampleRate * 0.012, buf = ctx.createBuffer(1, bs, ctx.sampleRate);
  const d = buf.getChannelData(0); for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bs) * 0.7;
  const n = ctx.createBufferSource(); n.buffer = buf;
  const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 3200; bp.Q.value = 2;
  const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.18, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.012);
  n.connect(bp).connect(g2).connect(ctx.destination); n.start(t); n.stop(t + 0.012);
}

function playBrush() {
  if (_muted) return;
  const ctx = getAudio(), t = ctx.currentTime;
  const bs = ctx.sampleRate * 0.1, buf = ctx.createBuffer(1, bs, ctx.sampleRate);
  const d = buf.getChannelData(0); for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bs) * 0.5;
  const n = ctx.createBufferSource(); n.buffer = buf;
  const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 3000; bp.Q.value = 0.4;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.15, t); g.gain.linearRampToValueAtTime(0.08, t + 0.04);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  n.connect(bp).connect(g).connect(ctx.destination); n.start(t); n.stop(t + 0.1);
}

function playTambourine() {
  if (_muted) return;
  const ctx = getAudio(), t = ctx.currentTime;
  const bs = ctx.sampleRate * 0.04, buf = ctx.createBuffer(1, bs, ctx.sampleRate);
  const d = buf.getChannelData(0); for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bs * 0.15));
  const n = ctx.createBufferSource(); n.buffer = buf;
  const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 8000;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  n.connect(hp).connect(g).connect(ctx.destination); n.start(t); n.stop(t + 0.04);
  // jingle
  const o = ctx.createOscillator(); o.type = "square"; o.frequency.setValueAtTime(6000, t);
  const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.04, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
  o.connect(g2).connect(ctx.destination); o.start(t); o.stop(t + 0.03);
}

function playShaker() {
  if (_muted) return;
  const ctx = getAudio(), t = ctx.currentTime;
  const bs = ctx.sampleRate * 0.035, buf = ctx.createBuffer(1, bs, ctx.sampleRate);
  const d = buf.getChannelData(0); for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bs);
  const n = ctx.createBufferSource(); n.buffer = buf;
  const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 9000;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.16, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
  n.connect(hp).connect(g).connect(ctx.destination); n.start(t); n.stop(t + 0.035);
}

const SOUNDS = {
  moose: playBassDrum, bear: playFloorTom, deer: playKick, wolf: playSnare,
  coyote: playSideStick, fox: playWoodblock, bobcat: playMidTom, raccoon: playHihat,
  porcupine: playCabasa, owl: playClap, rabbit: playRim, skunk: playBrush,
  squirrel: playTambourine, bird: playShaker,
};

/* ---- FOOTPRINT DRAWING ---- */
// toes toward -Y, rotated by angle + PI/2

function drawClovenHoof(ctx, x, y, size, alpha, angle, wide) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI / 2);
  ctx.globalAlpha = alpha; ctx.fillStyle = `rgba(0,0,0,${0.88 * alpha})`;
  const sp = wide ? 0.05 : 0.03;
  // left half
  ctx.beginPath();
  ctx.moveTo(-sp * size, size * 0.2);
  ctx.quadraticCurveTo(-sp * size * 1.3, -size * 0.05, -size * 0.12, -size * 0.35);
  ctx.quadraticCurveTo(-size * (wide ? 0.26 : 0.22), -size * 0.45, -size * (wide ? 0.32 : 0.28), -size * 0.3);
  ctx.quadraticCurveTo(-size * 0.3, -size * 0.1, -size * 0.2, size * 0.15);
  ctx.quadraticCurveTo(-size * 0.12, size * 0.25, -sp * size, size * 0.2);
  ctx.fill();
  // right half
  ctx.beginPath();
  ctx.moveTo(sp * size, size * 0.2);
  ctx.quadraticCurveTo(sp * size * 1.3, -size * 0.05, size * 0.12, -size * 0.35);
  ctx.quadraticCurveTo(size * (wide ? 0.26 : 0.22), -size * 0.45, size * (wide ? 0.32 : 0.28), -size * 0.3);
  ctx.quadraticCurveTo(size * 0.3, -size * 0.1, size * 0.2, size * 0.15);
  ctx.quadraticCurveTo(size * 0.12, size * 0.25, sp * size, size * 0.2);
  ctx.fill();
  // dewclaws
  if (wide) {
    ctx.beginPath(); ctx.ellipse(-size * 0.18, size * 0.35, size * 0.05, size * 0.06, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(size * 0.18, size * 0.35, size * 0.05, size * 0.06, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawCanidPrint(ctx, x, y, size, alpha, angle, spread, clawLen) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI / 2);
  ctx.globalAlpha = alpha; ctx.fillStyle = `rgba(0,0,0,${0.82 * alpha})`;
  // metacarpal
  ctx.beginPath();
  ctx.moveTo(-size * 0.25, size * 0.12);
  ctx.quadraticCurveTo(-size * 0.28, -size * 0.06, -size * 0.15, -size * 0.16);
  ctx.quadraticCurveTo(0, -size * 0.22, size * 0.15, -size * 0.16);
  ctx.quadraticCurveTo(size * 0.28, -size * 0.06, size * 0.25, size * 0.12);
  ctx.quadraticCurveTo(0, size * 0.22, -size * 0.25, size * 0.12);
  ctx.fill();
  const sp = spread;
  const toes = [
    [-size*sp*2, -size*0.32, size*0.09, size*0.13, -sp],
    [-size*sp*0.6, -size*0.47, size*0.085, size*0.12, -sp*0.3],
    [size*sp*0.6, -size*0.45, size*0.085, size*0.12, sp*0.3],
    [size*sp*2, -size*0.3, size*0.09, size*0.12, sp],
  ];
  toes.forEach(([tx, ty, rx, ry, rot]) => {
    ctx.beginPath(); ctx.ellipse(tx, ty, rx, ry, rot, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `rgba(0,0,0,${alpha * 0.7})`; ctx.lineWidth = size * 0.04; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(tx + Math.sin(rot) * ry * 0.4, ty - Math.cos(rot) * ry * 0.4);
    ctx.lineTo(tx + Math.sin(rot) * ry * clawLen, ty - Math.cos(rot) * ry * clawLen);
    ctx.stroke();
  });
  ctx.restore();
}

function drawFelinePrint(ctx, x, y, size, alpha, angle) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI / 2);
  ctx.globalAlpha = alpha; ctx.fillStyle = `rgba(0,0,0,${0.85 * alpha})`;
  // triangular pad
  ctx.beginPath();
  ctx.moveTo(-size * 0.28, size * 0.08);
  ctx.quadraticCurveTo(-size * 0.3, -size * 0.12, -size * 0.1, -size * 0.18);
  ctx.quadraticCurveTo(0, -size * 0.25, size * 0.1, -size * 0.18);
  ctx.quadraticCurveTo(size * 0.3, -size * 0.12, size * 0.28, size * 0.08);
  ctx.quadraticCurveTo(0, size * 0.22, -size * 0.28, size * 0.08);
  ctx.fill();
  // no claws — retracted
  [[-size*0.26,-size*0.32,size*0.09,size*0.11],[-size*0.08,-size*0.44,size*0.08,size*0.1],[size*0.1,-size*0.42,size*0.08,size*0.1],[size*0.26,-size*0.28,size*0.09,size*0.1]].forEach(([tx,ty,rx,ry]) => {
    ctx.beginPath(); ctx.ellipse(tx,ty,rx,ry,0,0,Math.PI*2); ctx.fill();
  });
  ctx.restore();
}

function drawSmallPadPrint(ctx, x, y, size, alpha, angle, toeCount) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI / 2);
  ctx.globalAlpha = alpha; ctx.fillStyle = `rgba(0,0,0,${0.78 * alpha})`;
  ctx.beginPath(); ctx.ellipse(0, size * 0.05, size * 0.22, size * 0.15, 0, 0, Math.PI * 2); ctx.fill();
  const spread = Math.PI * 0.7;
  const startAngle = -Math.PI / 2 - spread / 2;
  for (let i = 0; i < toeCount; i++) {
    const a = startAngle + (spread / (toeCount - 1)) * i;
    const dist = size * 0.38;
    const tx = Math.cos(a) * dist;
    const ty = Math.sin(a) * dist;
    ctx.beginPath(); ctx.ellipse(tx, ty, size * 0.06, size * 0.1, a + Math.PI / 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawHandPrint(ctx, x, y, size, alpha, angle) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI / 2);
  ctx.globalAlpha = alpha; ctx.fillStyle = `rgba(0,0,0,${0.78 * alpha})`;
  ctx.beginPath(); ctx.ellipse(0, size * 0.05, size * 0.22, size * 0.15, 0, 0, Math.PI * 2); ctx.fill();
  [[-size*0.32,-size*0.2,size*0.055,size*0.2,-0.3],[-size*0.16,-size*0.38,size*0.05,size*0.2,-0.1],[0,-size*0.44,size*0.05,size*0.2,0],[size*0.16,-size*0.38,size*0.05,size*0.2,0.1],[size*0.3,-size*0.22,size*0.05,size*0.18,0.25]].forEach(([fx,fy,rx,ry,rot]) => {
    ctx.beginPath(); ctx.ellipse(fx,fy,rx,ry,rot,0,Math.PI*2); ctx.fill();
  });
  ctx.restore();
}

function drawBirdFoot(ctx, x, y, size, alpha, angle) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI / 2);
  ctx.globalAlpha = alpha; ctx.strokeStyle = `rgba(0,0,0,${alpha * 0.75})`;
  ctx.lineWidth = size * 0.13; ctx.lineCap = "round";
  [[-0.38,-0.8],[0,-1.0],[0.38,-0.8]].forEach(([dx,dy]) => {
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(dx*size, dy*size); ctx.stroke();
  });
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0, size*0.45); ctx.stroke();
  ctx.restore();
}

function drawTalonPrint(ctx, x, y, size, alpha, angle) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI / 2);
  ctx.globalAlpha = alpha; ctx.strokeStyle = `rgba(0,0,0,${alpha * 0.8})`;
  ctx.lineWidth = size * 0.11; ctx.lineCap = "round";
  // zygodactyl: 2 forward, 2 back
  [[-0.3, -0.85], [0.3, -0.85]].forEach(([dx, dy]) => {
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(dx * size, dy * size); ctx.stroke();
  });
  [[-0.25, 0.7], [0.25, 0.7]].forEach(([dx, dy]) => {
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(dx * size, dy * size); ctx.stroke();
  });
  // talon tips
  ctx.fillStyle = `rgba(0,0,0,${alpha * 0.6})`;
  [[-0.3,-0.85],[0.3,-0.85],[-0.25,0.7],[0.25,0.7]].forEach(([dx,dy]) => {
    ctx.beginPath(); ctx.ellipse(dx*size, dy*size, size*0.06, size*0.08, 0, 0, Math.PI*2); ctx.fill();
  });
  ctx.restore();
}

function drawBearPrint(ctx, x, y, size, alpha, angle) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI / 2);
  ctx.globalAlpha = alpha; ctx.fillStyle = `rgba(0,0,0,${0.8 * alpha})`;
  ctx.beginPath();
  ctx.moveTo(-size*0.35, size*0.15);
  ctx.quadraticCurveTo(-size*0.4, -size*0.05, -size*0.25, -size*0.15);
  ctx.quadraticCurveTo(0, -size*0.22, size*0.25, -size*0.15);
  ctx.quadraticCurveTo(size*0.4, -size*0.05, size*0.35, size*0.15);
  ctx.quadraticCurveTo(size*0.15, size*0.35, -size*0.15, size*0.35);
  ctx.quadraticCurveTo(-size*0.35, size*0.3, -size*0.35, size*0.15);
  ctx.fill();
  [[-size*0.35,-size*0.32,size*0.1,size*0.12],[-size*0.17,-size*0.45,size*0.09,size*0.11],[size*0.02,-size*0.5,size*0.09,size*0.11],[size*0.2,-size*0.44,size*0.09,size*0.11],[size*0.36,-size*0.3,size*0.1,size*0.11]].forEach(([tx,ty,rx,ry]) => {
    ctx.beginPath(); ctx.ellipse(tx,ty,rx,ry,0,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = `rgba(0,0,0,${alpha*0.65})`; ctx.lineWidth = size*0.04; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(tx, ty-ry); ctx.lineTo(tx, ty-ry-size*0.12); ctx.stroke();
  });
  ctx.restore();
}

function drawRabbitPrint(ctx, x, y, size, alpha, angle) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI / 2);
  ctx.globalAlpha = alpha; ctx.fillStyle = `rgba(0,0,0,${0.75 * alpha})`;
  ctx.beginPath(); ctx.ellipse(0, size*0.05, size*0.2, size*0.16, 0, 0, Math.PI*2); ctx.fill();
  [[-size*0.2,-size*0.28,size*0.07,size*0.18],[-size*0.05,-size*0.38,size*0.065,size*0.2],[size*0.08,-size*0.36,size*0.065,size*0.19],[size*0.22,-size*0.25,size*0.07,size*0.17]].forEach(([tx,ty,rx,ry]) => {
    ctx.beginPath(); ctx.ellipse(tx,ty,rx,ry,0,0,Math.PI*2); ctx.fill();
  });
  ctx.restore();
}

const PRINT_DRAW = {
  moose: (c,x,y,s,a,ang) => drawClovenHoof(c,x,y,s,a,ang,true),
  deer: (c,x,y,s,a,ang) => drawClovenHoof(c,x,y,s,a,ang,false),
  bear: drawBearPrint,
  wolf: (c,x,y,s,a,ang) => drawCanidPrint(c,x,y,s,a,ang,0.15,1.4),
  coyote: (c,x,y,s,a,ang) => drawCanidPrint(c,x,y,s,a,ang,0.13,1.2),
  fox: (c,x,y,s,a,ang) => drawCanidPrint(c,x,y,s,a,ang,0.1,1.0),
  bobcat: drawFelinePrint,
  raccoon: drawHandPrint,
  porcupine: (c,x,y,s,a,ang) => drawSmallPadPrint(c,x,y,s,a,ang,5),
  skunk: (c,x,y,s,a,ang) => drawSmallPadPrint(c,x,y,s,a,ang,5),
  owl: drawTalonPrint,
  rabbit: drawRabbitPrint,
  squirrel: (c,x,y,s,a,ang) => drawSmallPadPrint(c,x,y,s,a,ang,4),
  bird: drawBirdFoot,
};

/* ---- COMPONENT ---- */
export default function AnimalTracks() {
  const initCounts = {};
  Object.keys(ANIMAL_DEFS).forEach(k => initCounts[k] = 0);
  initCounts.deer = 1; initCounts.wolf = 1; initCounts.bear = 1;

  const [counts, setCounts] = useState(initCounts);
  const [bpm, setBpm] = useState(120);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);
  const canvasRef = useRef(null);
  const printsRef = useRef([]);
  const walkersRef = useRef([]);
  const timersRef = useRef({});
  const stepIdxRef = useRef({});
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const bpmRef = useRef(120);
  const nextId = useRef(0);
  const scrollRef = useRef(null);

  const PRINT_LIFE = 10000;

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { _muted = muted; }, [muted]);

  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current; if (!c) return;
      const dpr = window.devicePixelRatio || 1;
      const r = c.getBoundingClientRect();
      c.width = r.width * dpr; c.height = r.height * dpr;
      sizeRef.current = { w: r.width, h: r.height, dpr };
      c.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    let raf;
    const draw = () => {
      const c = canvasRef.current;
      if (!c) { raf = requestAnimationFrame(draw); return; }
      const { w, h } = sizeRef.current;
      if (!w) { raf = requestAnimationFrame(draw); return; }
      const ctx = c.getContext("2d");
      ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,c.width,c.height); ctx.restore();
      const now = Date.now();
      const alive = [];
      for (const p of printsRef.current) {
        const age = now - p.born;
        if (age > PRINT_LIFE) continue;
        alive.push(p);
        const alpha = Math.max(0, (1 - age / PRINT_LIFE)) * 0.88;
        PRINT_DRAW[p.type]?.(ctx, p.x, p.y, p.size || ANIMAL_DEFS[p.type].printSize, alpha, p.angle);
      }
      printsRef.current = alive;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const makeWalker = useCallback((type) => {
    const { w, h } = sizeRef.current;
    if (!w) return null;
    const id = `w${nextId.current++}`;
    const edge = Math.floor(Math.random() * 4);
    let x, y, angle; const m = 40;
    if (edge === 0) { x = -m; y = Math.random() * h; angle = (Math.random() - 0.5) * 0.8; }
    else if (edge === 1) { x = w + m; y = Math.random() * h; angle = Math.PI + (Math.random() - 0.5) * 0.8; }
    else if (edge === 2) { x = Math.random() * w; y = -m; angle = Math.PI / 2 + (Math.random() - 0.5) * 0.8; }
    else { x = Math.random() * w; y = h + m; angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8; }
    return { id, type, x, y, angle, leftFoot: true };
  }, []);

  const stepWalker = useCallback((w) => {
    const { w: cw, h: ch } = sizeRef.current;
    const def = ANIMAL_DEFS[w.type];
    const lat = w.leftFoot ? -def.printSize * 0.35 : def.printSize * 0.35;
    const jitter = (Math.random() - 0.5) * 0.08;
    printsRef.current.push({ type: w.type, x: w.x + Math.sin(w.angle) * lat, y: w.y - Math.cos(w.angle) * lat, angle: w.angle + jitter, born: Date.now(), size: def.printSize });
    if (def.legs === 4) {
      const hd = def.printSize * (def.hindOffset || 0.9);
      const hl = w.leftFoot ? def.printSize * 0.28 : -def.printSize * 0.28;
      printsRef.current.push({ type: w.type, x: w.x - Math.cos(w.angle) * hd + Math.sin(w.angle) * hl, y: w.y - Math.sin(w.angle) * hd - Math.cos(w.angle) * hl, angle: w.angle + jitter * 0.7, born: Date.now(), size: def.printSize * (def.hindScale || 0.9) });
    }
    w.leftFoot = !w.leftFoot;
    const stride = def.printSize * def.strideMultiplier + Math.random() * def.printSize * 0.3;
    w.x += Math.cos(w.angle) * stride; w.y += Math.sin(w.angle) * stride;
    w.angle += (Math.random() - 0.5) * def.wanderAmount;
    const m = 60;
    if (w.x < -m) { w.x = cw + m * 0.5; w.y = Math.random() * ch; w.angle = Math.PI + (Math.random()-0.5)*0.6; }
    else if (w.x > cw + m) { w.x = -m * 0.5; w.y = Math.random() * ch; w.angle = (Math.random()-0.5)*0.6; }
    if (w.y < -m) { w.y = ch + m * 0.5; w.x = Math.random() * cw; w.angle = -Math.PI/2 + (Math.random()-0.5)*0.6; }
    else if (w.y > ch + m) { w.y = -m * 0.5; w.x = Math.random() * cw; w.angle = Math.PI/2 + (Math.random()-0.5)*0.6; }
  }, []);

  const startTimer = useCallback((walker) => {
    const def = ANIMAL_DEFS[walker.type];
    const getMs = () => 60000 / (def.naturalCadence * (bpmRef.current / 120));
    stepIdxRef.current[walker.id] = 0;
    const tick = () => {
      const idx = stepIdxRef.current[walker.id] || 0;
      if (def.pattern[idx % def.pattern.length]) { SOUNDS[walker.type](); stepWalker(walker); }
      stepIdxRef.current[walker.id] = idx + 1;
      timersRef.current[walker.id] = setTimeout(tick, getMs());
    };
    timersRef.current[walker.id] = setTimeout(tick, Math.random() * getMs() * 0.8);
  }, [stepWalker]);

  const stopTimer = useCallback((id) => { clearTimeout(timersRef.current[id]); delete timersRef.current[id]; delete stepIdxRef.current[id]; }, []);

  const handleStart = useCallback(() => { if (started) return; getAudio(); setStarted(true); }, [started]);

  useEffect(() => {
    if (!started) return;
    const ws = [];
    Object.entries(counts).forEach(([type, count]) => {
      for (let i = 0; i < count; i++) { const w = makeWalker(type); if (w) { ws.push(w); startTimer(w); } }
    });
    walkersRef.current = ws;
    return () => { Object.keys(timersRef.current).forEach(id => clearTimeout(timersRef.current[id])); timersRef.current = {}; };
  }, [started]);

  const prevCountsRef = useRef(null);
  useEffect(() => {
    if (!started) return;
    if (!prevCountsRef.current) { prevCountsRef.current = { ...counts }; return; }
    const prev = prevCountsRef.current;
    Object.keys(ANIMAL_DEFS).forEach((type) => {
      const diff = (counts[type] || 0) - (prev[type] || 0);
      if (diff > 0) { for (let i = 0; i < diff; i++) { const w = makeWalker(type); if (w) { walkersRef.current.push(w); startTimer(w); } } }
      else if (diff < 0) { let rem = -diff; const ws = walkersRef.current; for (let i = ws.length - 1; i >= 0 && rem > 0; i--) { if (ws[i].type === type) { stopTimer(ws[i].id); ws.splice(i, 1); rem--; } } }
    });
    prevCountsRef.current = { ...counts };
  }, [counts, started, makeWalker, startTimer, stopTimer]);

  const handleReset = useCallback(() => {
    // stop all walkers
    Object.keys(timersRef.current).forEach(id => clearTimeout(timersRef.current[id]));
    timersRef.current = {};
    stepIdxRef.current = {};
    walkersRef.current = [];
    printsRef.current = [];
    const zeroed = {};
    Object.keys(ANIMAL_DEFS).forEach(k => zeroed[k] = 0);
    prevCountsRef.current = { ...zeroed };
    setCounts(zeroed);
    setBpm(120);
  }, []);

  const changeCount = (type, delta) => { setCounts(prev => ({ ...prev, [type]: Math.max(0, Math.min(8, prev[type] + delta)) })); };

  const animalKeys = Object.keys(ANIMAL_DEFS);

  return (
    <div onClick={!started ? handleStart : undefined} style={{
      width: "100vw", height: "100vh", background: "#ede6d6",
      display: "flex", flexDirection: "column",
      fontFamily: "'Courier New', monospace",
      overflow: "hidden", position: "relative", userSelect: "none",
      cursor: !started ? "pointer" : "default",
    }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.25,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E\")",
      }} />

      {!started && (
        <div style={{ position: "absolute", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(237,230,214,0.94)" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 26, color: "#1a1410", letterSpacing: 5, fontWeight: "bold" }}>ANIMAL TRACKS</div>
            <div style={{ fontSize: 10, color: "#6a5e50", letterSpacing: 3, marginTop: 8 }}>TAP ANYWHERE TO BEGIN</div>
            <div style={{ fontSize: 8, color: "#9a8e7e", letterSpacing: 2, marginTop: 20 }}>LAMPWRECKED 2026</div>
          </div>
        </div>
      )}

      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 10px 3px", zIndex: 2, borderBottom: "1px solid rgba(0,0,0,0.06)", flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: "bold", color: "#1a1410", letterSpacing: 3 }}>ANIMAL TRACKS</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={() => setMuted(m => !m)} style={{
            background: muted ? "rgba(180,60,50,0.12)" : "none", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 4,
            padding: "2px 7px", fontSize: 8, letterSpacing: 1, color: muted ? "#b33" : "#1a1410", cursor: "pointer",
            fontFamily: "'Courier New', monospace", fontWeight: "bold",
          }}>{muted ? "MUTED" : "MUTE"}</button>
          <button onClick={handleReset} style={{
            background: "none", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 4,
            padding: "2px 7px", fontSize: 8, letterSpacing: 1, color: "#1a1410", cursor: "pointer",
            fontFamily: "'Courier New', monospace", fontWeight: "bold",
          }}>RESET</button>
          <span style={{ fontSize: 7, color: "#8a7e6e", letterSpacing: 1 }}>BPM</span>
          <input type="range" min={40} max={200} value={bpm} onChange={e => setBpm(Number(e.target.value))}
            style={{ width: 60, height: 2, appearance: "none", background: "#c8bfad", borderRadius: 1, outline: "none", cursor: "pointer", accentColor: "#1a1410" }} />
          <span style={{ fontSize: 10, color: "#1a1410", fontWeight: "bold", minWidth: 24, textAlign: "right" }}>{bpm}</span>
        </div>
        <span style={{ fontSize: 6, color: "#8a7e6e", letterSpacing: 2 }}>LAMPWRECKED 2026</span>
      </div>

      <canvas ref={canvasRef} style={{ flex: 1, width: "100%", display: "block", zIndex: 1 }} />

      {/* scrollable animal wheel */}
      <div style={{ background: "rgba(26,20,16,0.93)", borderTop: "1px solid rgba(255,255,255,0.04)", flexShrink: 0, zIndex: 2, position: "relative" }}>
        {/* fade edges */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 20, background: "linear-gradient(90deg, rgba(26,20,16,0.95) 0%, transparent 100%)", zIndex: 3, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 20, background: "linear-gradient(-90deg, rgba(26,20,16,0.95) 0%, transparent 100%)", zIndex: 3, pointerEvents: "none" }} />
        <div ref={scrollRef} style={{
          display: "flex", overflowX: "auto", overflowY: "hidden",
          padding: "5px 16px 7px", gap: 4,
          scrollbarWidth: "none", msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}>
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>
          {animalKeys.map((key) => {
            const def = ANIMAL_DEFS[key];
            const count = counts[key];
            return (
              <div key={key} style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                minWidth: 52, flexShrink: 0,
                padding: "3px 4px 2px", borderRadius: 6,
                background: count > 0 ? "rgba(255,255,255,0.06)" : "transparent",
                border: count > 0 ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
                transition: "background 0.15s",
              }}>
                <button onClick={() => changeCount(key, 1)} disabled={count >= 8}
                  style={{ background: "none", border: "none", padding: "0 3px", lineHeight: 1, color: count >= 8 ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.4)", fontSize: 12, cursor: count >= 8 ? "default" : "pointer" }}>▲</button>
                <div style={{ fontSize: 7, color: count > 0 ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.3)", letterSpacing: 0.8, textTransform: "uppercase", lineHeight: 1.2, textAlign: "center", whiteSpace: "nowrap" }}>{def.name}</div>
                <div style={{ fontSize: 16, fontWeight: "bold", lineHeight: 1.3, color: count > 0 ? "#e0d8c8" : "rgba(255,255,255,0.12)" }}>{count}</div>
                <button onClick={() => changeCount(key, -1)} disabled={count <= 0}
                  style={{ background: "none", border: "none", padding: "0 3px", lineHeight: 1, color: count <= 0 ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.4)", fontSize: 12, cursor: count <= 0 ? "default" : "pointer" }}>▼</button>
                <div style={{ fontSize: 5, color: "rgba(255,255,255,0.2)", letterSpacing: 0.4, textTransform: "uppercase", marginTop: 1, textAlign: "center", whiteSpace: "nowrap" }}>{def.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}