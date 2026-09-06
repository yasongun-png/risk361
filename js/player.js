// Simple synthesized guitar-strum playback using the Web Audio API.
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function playNote(freq, startTime, duration) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.18, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain).connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

function playChord(chord) {
  const ctx = getAudioContext();
  const freqs = chordFrequencies(chord);
  const strumGap = 0.035;
  const now = ctx.currentTime;

  freqs.forEach((freq, i) => {
    playNote(freq, now + i * strumGap, 1.4);
  });
}

function playChordByName(name) {
  const chord = findChord(name);
  if (chord) playChord(chord);
  return chord;
}
