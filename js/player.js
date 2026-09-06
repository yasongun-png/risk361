// Synthesized guitar-strum playback using the Web Audio API.
let audioCtx = null;
let noiseBuffer = null;

// Song playback schedules a whole bar's strums ahead of time on the audio
// clock (for sample-accurate timing), so stopping playback can't just clear
// setTimeouts — it has to explicitly silence any oscillators already
// scheduled for the future. This tracks them for that purpose.
let scheduledNodes = [];

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function getNoiseBuffer() {
  const ctx = getAudioContext();
  if (!noiseBuffer) {
    const length = ctx.sampleRate * 0.05;
    noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

function trackNode(node) {
  scheduledNodes.push(node);
  node.addEventListener("ended", () => {
    const i = scheduledNodes.indexOf(node);
    if (i !== -1) scheduledNodes.splice(i, 1);
  });
}

function stopAllScheduledSound() {
  const ctx = getAudioContext();
  scheduledNodes.forEach((node) => {
    try {
      node.stop(ctx.currentTime);
    } catch (e) {
      // Already stopped/ended — safe to ignore.
    }
  });
  scheduledNodes = [];
}

// A short, quickly-decaying pluck: a tone with a fast attack/decay plus a
// brief filtered noise "pick" transient layered on top for attack character
// — a plain sustained oscillator alone sounds like an organ pad, not a strum.
function playPluck(freq, startTime, duration, peakGain) {
  const ctx = getAudioContext();

  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.value = freq;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
  trackNode(osc);

  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer();
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = freq * 2;
  noiseFilter.Q.value = 0.7;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(peakGain * 0.5, startTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.03);
  noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
  noise.start(startTime);
  noise.stop(startTime + 0.05);
  trackNode(noise);
}

// direction: "down" strums low string to high (full, accented), "up" strums
// high to low (thinner, quieter) — mirrors how a real strum sounds.
function strumChord(chord, startTime, duration, direction = "down") {
  const freqs = chordFrequencies(chord);
  const ordered = direction === "up" ? [...freqs].reverse() : freqs;
  const strumGap = 0.012;
  const peakGain = direction === "up" ? 0.1 : 0.16;

  ordered.forEach((freq, i) => {
    playPluck(freq, startTime + i * strumGap, duration, peakGain);
  });
}

function playChord(chord, duration = 1.1) {
  const ctx = getAudioContext();
  strumChord(chord, ctx.currentTime, duration, "down");
}

function playChordByName(name, transposeSteps = 0) {
  const chord = getTransposedChord(name, transposeSteps);
  if (chord) playChord(chord);
  return chord;
}
