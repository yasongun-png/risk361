// Synthesized guitar-strum playback using the Web Audio API.
let audioCtx = null;

// Song playback schedules a whole bar's strums ahead of time on the audio
// clock (for sample-accurate timing), so stopping playback can't just clear
// setTimeouts — it has to explicitly silence any oscillators already
// scheduled for the future. This tracks them for that purpose.
let scheduledOscillators = [];

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function stopAllScheduledSound() {
  const ctx = getAudioContext();
  scheduledOscillators.forEach((osc) => {
    try {
      osc.stop(ctx.currentTime);
    } catch (e) {
      // Already stopped/ended — safe to ignore.
    }
  });
  scheduledOscillators = [];
}

function playNote(freq, startTime, duration, peakGain = 0.18) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain).connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);

  scheduledOscillators.push(osc);
  osc.addEventListener("ended", () => {
    const i = scheduledOscillators.indexOf(osc);
    if (i !== -1) scheduledOscillators.splice(i, 1);
  });
}

// direction: "down" strums low string to high (full, accented), "up" strums
// high to low (thinner, quieter) — mirrors how a real strum sounds.
function strumChord(chord, startTime, duration, direction = "down") {
  const freqs = chordFrequencies(chord);
  const ordered = direction === "up" ? [...freqs].reverse() : freqs;
  const strumGap = 0.018;
  const peakGain = direction === "up" ? 0.12 : 0.18;

  ordered.forEach((freq, i) => {
    playNote(freq, startTime + i * strumGap, duration, peakGain);
  });
}

function playChord(chord, duration = 1.4) {
  const ctx = getAudioContext();
  strumChord(chord, ctx.currentTime, duration, "down");
}

function playChordByName(name, transposeSteps = 0) {
  const chord = getTransposedChord(name, transposeSteps);
  if (chord) playChord(chord);
  return chord;
}

// A basic "D - DU - UDU" eighth-note strum pattern (one 4-beat bar, 8 slots).
// null = rest (swing through without striking, like a real strummer would).
const STRUM_PATTERN = ["D", null, "D", "U", null, "U", "D", "U"];

// Schedules a full bar of rhythm guitar accompaniment for one lyric line.
// `segments` is the line's [{chord, lyric}, ...]; each of the 8 strum slots
// is assigned whichever chord is "active" at that point in the bar, so chord
// changes mid-bar are followed just like a real player would.
function scheduleLineRhythm(segments, startTime, barDuration, transposeSteps) {
  const chordSegments = segments.filter((s) => s.chord);
  if (chordSegments.length === 0) return;

  const eighth = barDuration / STRUM_PATTERN.length;
  const strumDuration = eighth * 1.7;

  STRUM_PATTERN.forEach((stroke, slot) => {
    if (!stroke) return;
    const segIndex = Math.min(
      chordSegments.length - 1,
      Math.floor((slot * chordSegments.length) / STRUM_PATTERN.length)
    );
    const chord = getTransposedChord(chordSegments[segIndex].chord, transposeSteps);
    if (!chord) return;
    const strokeTime = startTime + slot * eighth;
    strumChord(chord, strokeTime, strumDuration, stroke === "D" ? "down" : "up");
  });
}
