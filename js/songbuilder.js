// "Yeni Şarkı" (add song) feature: lets you add your own songs from the
// browser instead of needing songs.js edited by hand. Saved to
// localStorage so they persist on this device across visits.
const USER_SONGS_KEY = "akoryolu_user_songs";
const CHORD_TOKEN_RE = /^[A-G](b|#)?(maj7|maj|m7|m|7|sus2|sus4|dim|aug|add9)?$/i;

let songFormMode = "simple"; // "simple" | "chordpro"
let parsedLines = [];

function loadUserSongs() {
  try {
    const raw = localStorage.getItem(USER_SONGS_KEY);
    const userSongs = raw ? JSON.parse(raw) : [];
    userSongs.forEach((song) => SONGS.push(song));
  } catch (e) {
    // Corrupt/unavailable storage — just start without saved songs.
  }
}

function saveUserSong(song) {
  let userSongs = [];
  try {
    const raw = localStorage.getItem(USER_SONGS_KEY);
    userSongs = raw ? JSON.parse(raw) : [];
  } catch (e) {
    userSongs = [];
  }
  userSongs.push(song);
  try {
    localStorage.setItem(USER_SONGS_KEY, JSON.stringify(userSongs));
  } catch (e) {
    // Storage full/unavailable — song still works for this session.
  }
}

// ---------- Chord-sheet parsing ----------

function isChordOnlyLine(line) {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  return tokens.length > 0 && tokens.every((t) => CHORD_TOKEN_RE.test(t));
}

function buildLineFromChordLyricPair(chordLine, lyricLine) {
  const matches = [...chordLine.matchAll(/\S+/g)];
  if (matches.length === 0) {
    return { bars: 1, segments: [{ chord: "", lyric: lyricLine }] };
  }
  const segments = [];
  matches.forEach((m, idx) => {
    const start = m.index;
    const end = idx + 1 < matches.length ? matches[idx + 1].index : lyricLine.length;
    if (idx === 0 && start > 0) {
      segments.push({ chord: "", lyric: lyricLine.slice(0, start) });
    }
    segments.push({ chord: m[0], lyric: lyricLine.slice(start, Math.max(start, end)) });
  });
  return { bars: 1, segments };
}

function parseSimpleChordSheet(text) {
  const rawLines = text.replace(/\r\n/g, "\n").split("\n");
  const lines = [];
  let i = 0;
  while (i < rawLines.length) {
    const line = rawLines[i];
    if (line.trim() === "") {
      i++;
      continue;
    }
    const chordLine = isChordOnlyLine(line);
    if (chordLine && i + 1 < rawLines.length && rawLines[i + 1].trim() !== "") {
      lines.push(buildLineFromChordLyricPair(line, rawLines[i + 1]));
      i += 2;
    } else if (chordLine) {
      lines.push({
        bars: 1,
        segments: line.trim().split(/\s+/).map((c) => ({ chord: c, lyric: " " })),
      });
      i++;
    } else {
      lines.push({ bars: 1, segments: [{ chord: "", lyric: line }] });
      i++;
    }
  }
  return lines;
}

function parseChordProSheet(text) {
  const rawLines = text.replace(/\r\n/g, "\n").split("\n");
  const lines = [];
  rawLines.forEach((line) => {
    if (line.trim() === "" || /^\{.*\}$/.test(line.trim())) return;
    const segments = [];
    const re = /\[([^\]]+)\]([^[]*)/g;
    let match;
    let found = false;
    const firstBracket = line.indexOf("[");
    if (firstBracket > 0) {
      segments.push({ chord: "", lyric: line.slice(0, firstBracket) });
    }
    while ((match = re.exec(line)) !== null) {
      found = true;
      segments.push({ chord: match[1], lyric: match[2] });
    }
    if (!found) {
      segments.push({ chord: "", lyric: line });
    }
    lines.push({ bars: 1, segments });
  });
  return lines;
}

// ---------- Modal wiring ----------

function setupSongBuilder() {
  const modal = document.getElementById("add-song-modal");
  const rhythmSelect = document.getElementById("song-form-rhythm");
  rhythmSelect.innerHTML = Object.entries(RHYTHM_STYLES)
    .map(([key, style]) => `<option value="${key}">🥁 ${style.label}</option>`)
    .join("");

  document.getElementById("add-song-btn").addEventListener("click", () => openSongBuilder());
  document.getElementById("add-song-close").addEventListener("click", () => closeSongBuilder());
  document.getElementById("add-song-cancel").addEventListener("click", () => closeSongBuilder());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeSongBuilder();
  });

  document.getElementById("mode-simple-btn").addEventListener("click", () => setSongFormMode("simple"));
  document.getElementById("mode-chordpro-btn").addEventListener("click", () => setSongFormMode("chordpro"));

  document.getElementById("parse-lyrics-btn").addEventListener("click", () => {
    const text = document.getElementById("song-form-lyrics").value;
    parsedLines = songFormMode === "simple" ? parseSimpleChordSheet(text) : parseChordProSheet(text);
    renderLyricsPreview();
  });

  document.getElementById("add-song-save").addEventListener("click", saveSongFromForm);
}

function setSongFormMode(mode) {
  songFormMode = mode;
  document.getElementById("mode-simple-btn").classList.toggle("is-active", mode === "simple");
  document.getElementById("mode-chordpro-btn").classList.toggle("is-active", mode === "chordpro");
  document.getElementById("mode-hint").textContent =
    mode === "simple"
      ? "Şarkı sözlerini buraya yapıştırın — akorsuz olabilir, ya da akor satırı sözün tam üstünde olacak şekilde yapıştırırsanız akorlar otomatik yerleşir."
      : "ChordPro biçimi: akoru köşeli parantez içinde, tam sözün üstüne değil tam yanına yazın. Örn: [Am]Üsküdar'a [E7]gider iken";
  document.getElementById("song-form-lyrics").placeholder =
    mode === "simple"
      ? "Dm         C         Bb        Am\nBak neler oldu, zor zamanlar bizi buldu"
      : "[Am]Üsküdar'a [E7]gider iken";
}

function renderLyricsPreview() {
  const preview = document.getElementById("lyrics-preview");
  if (parsedLines.length === 0) {
    preview.innerHTML = `<p class="empty-state">Önizlemek için önce sözleri yükleyin.</p>`;
    return;
  }
  preview.innerHTML = parsedLines
    .map((line) => {
      const segs = line.segments
        .map(
          (seg) =>
            `<span class="preview-segment">${
              seg.chord ? `<span class="preview-chord">${escapeHtml(seg.chord)}</span>` : ""
            }<span class="preview-lyric">${escapeHtml(seg.lyric || "")}</span></span>`
        )
        .join("");
      return `<div class="preview-line">${segs}</div>`;
    })
    .join("");
}

function openSongBuilder() {
  document.getElementById("song-form-title").value = "";
  document.getElementById("song-form-artist").value = "";
  document.getElementById("song-form-key").value = "C";
  document.getElementById("song-form-bpm").value = "100";
  document.getElementById("song-form-rhythm").value = "pop";
  document.getElementById("song-form-tags").value = "";
  document.getElementById("song-form-youtube").value = "";
  document.getElementById("song-form-lyrics").value = "";
  parsedLines = [];
  renderLyricsPreview();
  setSongFormMode("simple");
  document.getElementById("add-song-modal").hidden = false;
}

function closeSongBuilder() {
  document.getElementById("add-song-modal").hidden = true;
}

function saveSongFromForm() {
  const title = document.getElementById("song-form-title").value.trim();
  if (!title) {
    document.getElementById("song-form-title").focus();
    return;
  }

  // Parse whatever is currently in the textarea even if "Yükle" wasn't
  // clicked, so saving always reflects the latest text.
  const text = document.getElementById("song-form-lyrics").value;
  const lines =
    (songFormMode === "simple" ? parseSimpleChordSheet(text) : parseChordProSheet(text)) || [];

  if (lines.length === 0) {
    document.getElementById("song-form-lyrics").focus();
    return;
  }

  const artist = document.getElementById("song-form-artist").value.trim() || "Bilinmiyor";
  const key = document.getElementById("song-form-key").value.trim() || "C";
  const bpm = Number(document.getElementById("song-form-bpm").value) || 100;
  const rhythm = document.getElementById("song-form-rhythm").value;
  const tags = document
    .getElementById("song-form-tags")
    .value.split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const youtube = document.getElementById("song-form-youtube").value.trim();

  const song = {
    title,
    artist,
    key,
    bpm,
    rhythm,
    tags,
    youtube: youtube || undefined,
    sections: [{ label: "Sözler", lines }],
  };

  SONGS.push(song);
  saveUserSong(song);
  closeSongBuilder();
  renderHeroSongList();
  renderSongList();
  selectSong(SONGS.length - 1);
  document.querySelector("#sarkilar").scrollIntoView({ behavior: "smooth" });
}
