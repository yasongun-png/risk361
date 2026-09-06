// Chord data for standard guitar tuning (low E to high E).
// frets: -1 = muted string, 0 = open string, n = fret number.
// baseFret: the fret the diagram starts drawing from (for barre chords higher up the neck).
const CHORD_LIBRARY = [
  { name: "C", frets: [-1, 3, 2, 0, 1, 0], baseFret: 1 },
  { name: "D", frets: [-1, -1, 0, 2, 3, 2], baseFret: 1 },
  { name: "E", frets: [0, 2, 2, 1, 0, 0], baseFret: 1 },
  { name: "Em", frets: [0, 2, 2, 0, 0, 0], baseFret: 1 },
  { name: "E7", frets: [0, 2, 0, 1, 0, 0], baseFret: 1 },
  { name: "F", frets: [1, 3, 3, 2, 1, 1], baseFret: 1 },
  { name: "G", frets: [3, 2, 0, 0, 0, 3], baseFret: 1 },
  { name: "A", frets: [-1, 0, 2, 2, 2, 0], baseFret: 1 },
  { name: "Am", frets: [-1, 0, 2, 2, 1, 0], baseFret: 1 },
  { name: "A7", frets: [-1, 0, 2, 0, 2, 0], baseFret: 1 },
  { name: "Dm", frets: [-1, -1, 0, 2, 3, 1], baseFret: 1 },
  { name: "D7", frets: [-1, -1, 0, 2, 1, 2], baseFret: 1 },
  { name: "B7", frets: [-1, 2, 1, 2, 0, 2], baseFret: 1 },
  { name: "C7", frets: [-1, 3, 2, 3, 1, 0], baseFret: 1 },
  { name: "G7", frets: [3, 2, 0, 0, 0, 1], baseFret: 1 },
];

// Open-string frequencies (Hz), low E to high E.
const OPEN_STRING_FREQS = [82.41, 110.0, 146.83, 196.0, 246.94, 329.63];

// Flat-preferring chromatic scale (matches common Turkish chord-sheet notation).
const NOTE_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

function fretFrequency(stringIndex, fret) {
  return OPEN_STRING_FREQS[stringIndex] * Math.pow(2, fret / 12);
}

function chordFrequencies(chord) {
  return chord.frets
    .map((fret, i) => (fret === -1 ? null : fretFrequency(i, fret)))
    .filter((f) => f !== null);
}

function findChord(name) {
  return CHORD_LIBRARY.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

// Transposes a chord name by `steps` semitones (can be negative), e.g. "Am" + 2 -> "Bm".
function transposeChordName(name, steps) {
  if (!steps) return name;
  const m = name.match(/^([A-G])(b|#)?(.*)$/);
  if (!m) return name;
  const [, letter, accidental, suffix] = m;
  let idx = NOTE_NAMES.indexOf(letter + (accidental || ""));
  if (idx === -1) {
    // Normalize sharp spellings (e.g. "D#") to the flat equivalent used in NOTE_NAMES.
    const sharpToFlat = { "C#": "Db", "D#": "Eb", "F#": "Gb", "G#": "Ab", "A#": "Bb" };
    idx = NOTE_NAMES.indexOf(sharpToFlat[letter + accidental] || "");
  }
  if (idx === -1) return name;
  const newIdx = ((idx + steps) % 12 + 12) % 12;
  return NOTE_NAMES[newIdx] + suffix;
}

// Shifts a chord's fretted shape by `steps` frets — equivalent to what a capo does,
// so it stays musically correct even for open-string shapes.
function shiftChordShape(chord, steps) {
  if (!steps) return { frets: chord.frets.slice(), baseFret: chord.baseFret || 1 };
  let frets = chord.frets.map((f) => (f === -1 ? -1 : f + steps));
  while (frets.some((f) => f !== -1 && f < 0)) {
    frets = frets.map((f) => (f === -1 ? -1 : f + 12));
  }
  const positive = frets.filter((f) => f > 0);
  const base = positive.length ? Math.min(...positive) : 1;
  return { frets, baseFret: base };
}

// Resolves the chord to actually play/draw for a song chord name at a given transpose amount.
function getTransposedChord(name, steps) {
  const original = findChord(name);
  if (!original) return null;
  const shifted = shiftChordShape(original, steps);
  return {
    name: transposeChordName(name, steps),
    frets: shifted.frets,
    baseFret: shifted.baseFret,
  };
}
