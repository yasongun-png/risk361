// Renders a chord diagram as an SVG fretboard (6 strings, 4 frets).
function renderFretboardSVG(chord, size = "normal") {
  const width = size === "small" ? 110 : 160;
  const height = size === "small" ? 130 : 190;
  const stringCount = 6;
  const fretCount = 4;
  const marginX = size === "small" ? 20 : 28;
  const marginTop = size === "small" ? 24 : 32;
  const marginBottom = size === "small" ? 14 : 18;
  const gridW = width - marginX * 2;
  const gridH = height - marginTop - marginBottom;
  const stringGap = gridW / (stringCount - 1);
  const fretGap = gridH / fretCount;

  const frettedFrets = chord.frets.filter((f) => f > 0);
  const maxFret = frettedFrets.length ? Math.max(...frettedFrets) : 0;
  const base = chord.baseFret && maxFret > fretCount ? chord.baseFret : 1;

  let svg = `<svg viewBox="0 0 ${width} ${height}" class="fretboard-svg" role="img" aria-label="${chord.name} akoru">`;

  // Nut or base-fret label
  if (base === 1) {
    svg += `<rect x="${marginX - 2}" y="${marginTop - 4}" width="${gridW + 4}" height="4" fill="currentColor" class="nut" />`;
  } else {
    svg += `<text x="${marginX - 12}" y="${marginTop + fretGap / 2 + 4}" class="fret-label">${base}fr</text>`;
  }

  // Strings (vertical lines)
  for (let s = 0; s < stringCount; s++) {
    const x = marginX + s * stringGap;
    svg += `<line x1="${x}" y1="${marginTop}" x2="${x}" y2="${marginTop + gridH}" class="string-line" />`;
  }

  // Frets (horizontal lines)
  for (let f = 0; f <= fretCount; f++) {
    const y = marginTop + f * fretGap;
    svg += `<line x1="${marginX}" y1="${y}" x2="${marginX + gridW}" y2="${y}" class="fret-line" />`;
  }

  // Open/muted markers above nut, and finger dots
  chord.frets.forEach((fret, i) => {
    const x = marginX + i * stringGap;
    if (fret === -1) {
      svg += `<text x="${x}" y="${marginTop - 10}" class="string-marker" text-anchor="middle">&times;</text>`;
    } else if (fret === 0) {
      svg += `<text x="${x}" y="${marginTop - 10}" class="string-marker" text-anchor="middle">&#9675;</text>`;
    } else {
      const relFret = fret - base + 1;
      const y = marginTop + (relFret - 0.5) * fretGap;
      svg += `<circle cx="${x}" cy="${y}" r="${size === "small" ? 6 : 8}" class="finger-dot" />`;
    }
  });

  svg += `</svg>`;
  return svg;
}
