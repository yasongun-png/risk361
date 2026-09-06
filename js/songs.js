// Sample song chord sheets. Each line is an array of {chord, lyric} segments;
// chord is shown above the lyric segment that follows it (chord may be "").
const SONGS = [
  {
    title: "Yalnız Çiçek",
    artist: "Örnek Sanatçı",
    key: "Am",
    lines: [
      [{ chord: "Am", lyric: "Bir başına " }, { chord: "F", lyric: "büyüdü bahçede" }],
      [{ chord: "C", lyric: "Kimse su ver" }, { chord: "G", lyric: "medi ona hiç" }],
      [{ chord: "Am", lyric: "Yine de aç" }, { chord: "F", lyric: "tı yapraklarını" }],
      [{ chord: "C", lyric: "Güneşe doğ" }, { chord: "E", lyric: "ru uzandı" }],
    ],
  },
  {
    title: "Sahil Yolu",
    artist: "Örnek Sanatçı",
    key: "G",
    lines: [
      [{ chord: "G", lyric: "Kumsalda yürü" }, { chord: "D", lyric: "rüz elini tutup" }],
      [{ chord: "Em", lyric: "Deniz fısılda" }, { chord: "C", lyric: "r bize bir şarkı" }],
      [{ chord: "G", lyric: "Martılar uçar" }, { chord: "D", lyric: " gökyüzünde özgür" }],
      [{ chord: "C", lyric: "Bu an hep böyle " }, { chord: "D", lyric: "kalsın istedim" }],
    ],
  },
  {
    title: "Şehrin Işıkları",
    artist: "Örnek Sanatçı",
    key: "C",
    lines: [
      [{ chord: "C", lyric: "Şehrin ışıkları " }, { chord: "G", lyric: "yanar gece boyu" }],
      [{ chord: "Am", lyric: "Sokaklar sessiz" }, { chord: "F", lyric: ", yalnız bir gitar sesi" }],
      [{ chord: "C", lyric: "Pencereden bakar" }, { chord: "G", lyric: "ım uzaklara doğru" }],
      [{ chord: "Am", lyric: "Belki bir gün ge" }, { chord: "F", lyric: "ri dönerim buraya" }],
    ],
  },
];
