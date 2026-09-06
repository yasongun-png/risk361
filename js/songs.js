// Public-domain Turkish folk songs (türkü) — safe to reproduce lyrics in full,
// unlike current copyrighted commercial songs.
//
// Song shape:
//   { title, artist, key, bpm, sections: [ { label, repeat, lines: [ { bars, segments: [ {chord, lyric}, ... ] }, ... ] } ] }
// `bars` is how many 4-beat bars that line actually takes to sing (at the
// song's bpm) — get this wrong and the highlight/rhythm races ahead of or
// lags behind the actual singing. The chorus is listed as its own section
// once per verse (not doubled with `repeat`) so nothing gets skipped.
const SONGS = [
  {
    title: "Üsküdar'a Gider İken (Kâtibim)",
    artist: "Anonim — İstanbul Türküsü",
    key: "Am",
    // 92 BPM: cross-checked two ways — songbpm.com lists this song around
    // this tempo, and autocorrelation of the onset envelope from a Safiye
    // Ayla reference recording of it shows a strong beat-period peak at the
    // same tempo.
    bpm: 92,
    rhythm: "pop",
    sections: [
      {
        label: "1. Kıta",
        lines: [
          {
            bars: 2,
            segments: [
              { chord: "Am", lyric: "Üsküdar'a gider iken " },
              { chord: "E7", lyric: "aldı da bir yağmur" },
            ],
          },
          {
            bars: 2,
            segments: [
              { chord: "Am", lyric: "Kâtibimin setresi " },
              { chord: "Dm", lyric: "uzun " },
              { chord: "E7", lyric: "eteği çamur" },
            ],
          },
          {
            bars: 2,
            segments: [
              { chord: "Am", lyric: "Kâtip uykudan uyanmış " },
              { chord: "E7", lyric: "gözleri mahmur" },
            ],
          },
          {
            bars: 2,
            segments: [
              { chord: "Am", lyric: "Kâtip benim ben kâtibin " },
              { chord: "Dm", lyric: "el ne " },
              { chord: "E7", lyric: "karışır" },
            ],
          },
        ],
      },
      {
        label: "Nakarat",
        lines: [
          {
            bars: 2,
            segments: [
              { chord: "Am", lyric: "Kâtibime kolalı da " },
              { chord: "Dm", lyric: "gömlek " },
              { chord: "E7", lyric: "ne güzel " },
              { chord: "Am", lyric: "yakışır" },
            ],
          },
        ],
      },
      {
        label: "2. Kıta",
        lines: [
          {
            bars: 2,
            segments: [
              { chord: "Am", lyric: "Üsküdar'a gider iken " },
              { chord: "E7", lyric: "bir mendil buldum" },
            ],
          },
          {
            bars: 2,
            segments: [
              { chord: "Am", lyric: "Mendilimin içine " },
              { chord: "Dm", lyric: "lokum " },
              { chord: "E7", lyric: "doldurdum" },
            ],
          },
          {
            bars: 2,
            segments: [
              { chord: "Am", lyric: "Ben bir güzele tutuldum " },
              { chord: "Dm", lyric: "meğer " },
              { chord: "E7", lyric: "nişanlıymış" },
            ],
          },
        ],
      },
      {
        label: "Nakarat",
        lines: [
          {
            bars: 2,
            segments: [
              { chord: "Am", lyric: "Kâtibime kolalı da " },
              { chord: "Dm", lyric: "gömlek " },
              { chord: "E7", lyric: "ne güzel " },
              { chord: "Am", lyric: "yakışır" },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Çanakkale İçinde",
    artist: "Anonim — Çanakkale Türküsü",
    key: "Am",
    bpm: 88,
    rhythm: "mars",
    // Chord progression verified against real published chord sheets
    // (akorlar.com / repertuarim.com): Am - C - D - C - G - D - Am,
    // rather than a guessed one.
    sections: [
      {
        label: "1. Kıta",
        lines: [
          {
            bars: 1,
            segments: [
              { chord: "Am", lyric: "Çanakkale içinde " },
              { chord: "C", lyric: "aynalı çarşı" },
            ],
          },
          {
            bars: 1,
            segments: [
              { chord: "D", lyric: "Ana ben gidiyom " },
              { chord: "C", lyric: "düşmana karşı" },
            ],
          },
        ],
      },
      {
        label: "Nakarat",
        lines: [
          {
            bars: 1,
            segments: [
              { chord: "G", lyric: "Of gençliğim " },
              { chord: "D", lyric: "eyvah" },
            ],
          },
        ],
      },
      {
        label: "2. Kıta",
        lines: [
          {
            bars: 1,
            segments: [
              { chord: "Am", lyric: "Çanakkale içinde " },
              { chord: "C", lyric: "bir dolu testi" },
            ],
          },
          {
            bars: 1,
            segments: [
              { chord: "D", lyric: "Analar babalar " },
              { chord: "Am", lyric: "ümidi kesti" },
            ],
          },
        ],
      },
      {
        label: "Nakarat",
        lines: [
          {
            bars: 1,
            segments: [
              { chord: "G", lyric: "Of gençliğim " },
              { chord: "D", lyric: "eyvah" },
            ],
          },
        ],
      },
      {
        label: "3. Kıta",
        lines: [
          {
            bars: 1,
            segments: [
              { chord: "Am", lyric: "Çanakkale üstünde " },
              { chord: "C", lyric: "vurdular beni" },
            ],
          },
          {
            bars: 1,
            segments: [
              { chord: "D", lyric: "Ölmeden mezara " },
              { chord: "Am", lyric: "koydular beni" },
            ],
          },
        ],
      },
      {
        label: "Nakarat",
        lines: [
          {
            bars: 1,
            segments: [
              { chord: "G", lyric: "Of gençliğim " },
              { chord: "D", lyric: "eyvah" },
            ],
          },
        ],
      },
    ],
  },
];
