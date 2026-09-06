// Public-domain Turkish folk songs (türkü) — safe to reproduce lyrics in full,
// unlike current copyrighted commercial songs.
//
// Song shape:
//   { title, artist, key, bpm, sections: [ { label, repeat, lines: [ { bars, segments: [ {chord, lyric}, ... ] }, ... ] } ] }
// `bars` is how many 4-beat bars that line actually takes to sing (at the
// song's bpm) — get this wrong and the highlight/rhythm races ahead of or
// lags behind the actual singing. `repeat: true` on a section renders |: :|
// repeat bars and plays that section's lines twice.
const SONGS = [
  {
    title: "Üsküdar'a Gider İken (Kâtibim)",
    artist: "Anonim — İstanbul Türküsü",
    key: "Am",
    bpm: 96, // verified against songbpm.com's listing for this song (Am, 4/4)
    rhythm: "pop",
    sections: [
      {
        label: "Bölüm 1",
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
        ],
      },
      {
        label: "Bölüm 2",
        lines: [
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
        repeat: true,
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
        label: "Bölüm 1",
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
        repeat: true,
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
        label: "Bölüm 2",
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
    ],
  },
];
