// Synthesized drum backing track: keeps the beat so a guitarist can play
// the chords themselves along with it, instead of the app strumming for them.
function playKick(time) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.9, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

  osc.connect(gain).connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.3);
  trackNode(osc);
}

function playSnare(time) {
  const ctx = getAudioContext();

  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer();
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "highpass";
  noiseFilter.frequency.value = 1200;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.55, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);
  noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
  noise.start(time);
  noise.stop(time + 0.18);
  trackNode(noise);

  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.value = 190;
  const bodyGain = ctx.createGain();
  bodyGain.gain.setValueAtTime(0.3, time);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
  osc.connect(bodyGain).connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.12);
  trackNode(osc);
}

function playHiHat(time, accent = false) {
  const ctx = getAudioContext();
  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer();
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 7500;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(accent ? 0.22 : 0.12, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + (accent ? 0.06 : 0.04));
  noise.connect(filter).connect(gain).connect(ctx.destination);
  noise.start(time);
  noise.stop(time + 0.08);
  trackNode(noise);
}

// Selectable rhythm styles (like a keyboard's style selector) — each defines
// which of a bar's 8 eighth-note slots get a kick, snare, and hi-hat hit.
const RHYTHM_STYLES = {
  pop: { label: "Pop / Rock", kick: [0, 4], snare: [2, 6], hihat: [0, 1, 2, 3, 4, 5, 6, 7] },
  // Steady quarter-note kick on every beat + backbeat snare — fits marching/
  // anthem-like folk songs (e.g. Çanakkale İçinde) far better than a
  // syncopated pattern would.
  mars: { label: "Marş", kick: [0, 2, 4, 6], snare: [2, 6], hihat: [0, 1, 2, 3, 4, 5, 6, 7] },
  ballad: { label: "Yavaş (Balad)", kick: [0], snare: [4], hihat: [0, 2, 4, 6] },
  waltz: { label: "Vals Hissi", kick: [0], snare: [3, 6], hihat: [0, 1, 2, 3, 4, 5, 6, 7] },
};

// Schedules one bar (8 eighth-note slots) of the chosen rhythm style.
function scheduleDrumBar(startTime, barDuration, styleKey = "pop") {
  const style = RHYTHM_STYLES[styleKey] || RHYTHM_STYLES.pop;
  const slots = 8;
  const eighth = barDuration / slots;

  for (let slot = 0; slot < slots; slot++) {
    const t = startTime + slot * eighth;
    if (style.hihat.includes(slot)) playHiHat(t, slot % 2 === 0);
    if (style.kick.includes(slot)) playKick(t);
    if (style.snare.includes(slot)) playSnare(t);
  }
}
