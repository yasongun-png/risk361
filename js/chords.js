// Chord data for standard guitar tuning (low E to high E).
// frets: -1 = muted string, 0 = open string, n = fret number.
// baseFret: the fret the diagram starts drawing from (for barre chords higher up the neck).
const CHORD_LIBRARY = [
  { name: "C", frets: [-1, 3, 2, 0, 1, 0], baseFret: 1 },
  { name: "D", frets: [-1, -1, 0, 2, 3, 2], baseFret: 1 },
  { name: "E", frets: [0, 2, 2, 1, 0, 0], baseFret: 1 },
  { name: "Em", frets: [0, 2, 2, 0, 0, 0], baseFret: 1 },
  { name: "F", frets: [1, 3, 3, 2, 1, 1], baseFret: 1 },
  { name: "G", frets: [3, 2, 0, 0, 0, 3], baseFret: 1 },
  { name: "A", frets: [-1, 0, 2, 2, 2, 0], baseFret: 1 },
  { name: "Am", frets: [-1, 0, 2, 2, 1, 0], baseFret: 1 },
  { name: "Dm", frets: [-1, -1, 0, 2, 3, 1], baseFret: 1 },
  { name: "B7", frets: [-1, 2, 1, 2, 0, 2], baseFret: 1 },
  { name: "C7", frets: [-1, 3, 2, 3, 1, 0], baseFret: 1 },
  { name: "G7", frets: [3, 2, 0, 0, 0, 1], baseFret: 1 },
];

// Open-string frequencies (Hz), low E to high E.
const OPEN_STRING_FREQS = [82.41, 110.0, 146.83, 196.0, 246.94, 329.63];

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
