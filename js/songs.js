// Public-domain Turkish folk songs (türkü) — safe to reproduce lyrics in full,
// unlike current copyrighted commercial songs.
//
// Song shape:
//   { title, artist, key, bpm, sections: [ { label, repeat, lines: [ [ {chord, lyric}, ... ], ... ] } ] }
// `repeat: true` on a section renders |: :| repeat bars and plays that section's lines twice.
const SONGS = [
  {
    title: "Üsküdar'a Gider İken (Kâtibim)",
    artist: "Anonim — İstanbul Türküsü",
    key: "Am",
    bpm: 92,
    rhythm: "pop",
    sections: [
      {
        label: "Bölüm 1",
        lines: [
          [
            { chord: "Am", lyric: "Üsküdar'a gider iken " },
            { chord: "E7", lyric: "aldı da bir yağmur" },
          ],
          [
            { chord: "Am", lyric: "Kâtibimin setresi " },
            { chord: "Dm", lyric: "uzun " },
            { chord: "E7", lyric: "eteği çamur" },
          ],
        ],
      },
      {
        label: "Bölüm 2",
        lines: [
          [
            { chord: "Am", lyric: "Kâtip uykudan uyanmış " },
            { chord: "E7", lyric: "gözleri mahmur" },
          ],
          [
            { chord: "Am", lyric: "Kâtip benim ben kâtibin " },
            { chord: "Dm", lyric: "el ne " },
            { chord: "E7", lyric: "karışır" },
          ],
        ],
      },
      {
        label: "Nakarat",
        repeat: true,
        lines: [
          [
            { chord: "Am", lyric: "Kâtibime kolalı da " },
            { chord: "Dm", lyric: "gömlek " },
            { chord: "E7", lyric: "ne güzel " },
            { chord: "Am", lyric: "yakışır" },
          ],
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
    sections: [
      {
        label: "Bölüm 1",
        lines: [
          [
            { chord: "Am", lyric: "Çanakkale içinde " },
            { chord: "Dm", lyric: "aynalı çarşı" },
          ],
          [
            { chord: "E7", lyric: "Ana ben gidiyom " },
            { chord: "Am", lyric: "düşmana karşı" },
          ],
        ],
      },
      {
        label: "Nakarat",
        repeat: true,
        lines: [
          [
            { chord: "Dm", lyric: "Of gençliğim " },
            { chord: "E7", lyric: "eyvah" },
          ],
        ],
      },
      {
        label: "Bölüm 2",
        lines: [
          [
            { chord: "Am", lyric: "Çanakkale içinde " },
            { chord: "Dm", lyric: "bir dolu testi" },
          ],
          [
            { chord: "E7", lyric: "Analar babalar " },
            { chord: "Am", lyric: "ümidi kesti" },
          ],
        ],
      },
    ],
  },
];
