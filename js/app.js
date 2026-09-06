let currentSongIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  renderChordLibrary(CHORD_LIBRARY);
  renderSongList();
  setupSearch();
  setupNav();
});

// ---------- Chord library ----------

function renderChordLibrary(chords) {
  const grid = document.getElementById("chord-grid");
  grid.innerHTML = "";

  if (chords.length === 0) {
    grid.innerHTML = `<p class="empty-state">Aradığınız akor bulunamadı.</p>`;
    return;
  }

  chords.forEach((chord) => {
    const card = document.createElement("button");
    card.className = "chord-card";
    card.setAttribute("aria-label", `${chord.name} akorunu çal`);
    card.innerHTML = `
      <span class="chord-name">${chord.name}</span>
      ${renderFretboardSVG(chord, "small")}
      <span class="chord-play-hint">▶ Çal</span>
    `;
    card.addEventListener("click", () => {
      playChord(chord);
      pulseCard(card);
      showChordDetail(chord);
    });
    grid.appendChild(card);
  });
}

function pulseCard(card) {
  card.classList.add("is-playing");
  setTimeout(() => card.classList.remove("is-playing"), 400);
}

function showChordDetail(chord) {
  const detail = document.getElementById("chord-detail");
  detail.innerHTML = `
    <div class="chord-detail-inner">
      ${renderFretboardSVG(chord)}
      <div>
        <h3>${chord.name} Akoru</h3>
        <p>Yukarıdaki diyagramda parmak pozisyonlarını görebilir, kartın üzerine tıklayarak akorun sesini dinleyebilirsiniz.</p>
        <button class="btn btn-secondary" id="replay-chord">▶ Tekrar Çal</button>
      </div>
    </div>
  `;
  detail.hidden = false;
  document.getElementById("replay-chord").addEventListener("click", () => playChord(chord));
  detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function setupSearch() {
  const input = document.getElementById("chord-search");
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    const filtered = CHORD_LIBRARY.filter((c) => c.name.toLowerCase().includes(q));
    renderChordLibrary(filtered);
  });
}

// ---------- Song sheets ----------

function renderSongList() {
  const list = document.getElementById("song-list");
  list.innerHTML = "";

  SONGS.forEach((song, index) => {
    const item = document.createElement("button");
    item.className = "song-list-item";
    item.innerHTML = `
      <span class="song-title">${song.title}</span>
      <span class="song-meta">${song.artist} · ${song.key} akoru</span>
    `;
    item.addEventListener("click", () => selectSong(index));
    list.appendChild(item);
  });

  selectSong(0);
}

function selectSong(index) {
  stopPlayback(updatePlayButton);
  currentSongIndex = index;
  playbackState.transposeSteps = 0;
  playbackState.bpm = SONGS[index].bpm;
  playbackState.rhythmStyle = SONGS[index].rhythm || "pop";
  renderSongSheet(index);
}

function renderSongSheet(index) {
  const song = SONGS[index];
  const sheet = document.getElementById("song-sheet");

  document.querySelectorAll(".song-list-item").forEach((el, i) => {
    el.classList.toggle("active", i === index);
  });

  const sectionsHtml = song.sections
    .map((section, sIdx) => {
      const linesHtml = section.lines
        .map((line, lIdx) => renderLine(line, sIdx, lIdx))
        .join("");
      return `
        <div class="song-section ${section.repeat ? "song-section-repeat" : ""}">
          ${section.label ? `<h4 class="section-label">${section.label}</h4>` : ""}
          <div class="section-lines">${linesHtml}</div>
        </div>
      `;
    })
    .join("");

  sheet.innerHTML = `
    <div class="song-toolbar">
      <button id="play-btn" class="btn-icon btn-play" aria-label="Şarkıyı oynat">▶</button>

      <div class="control" title="Transpoze">
        <span class="control-label">T</span>
        <button class="control-btn" data-action="transpose-down" aria-label="Yarım ton aşağı">−</button>
        <span id="transpose-value" class="control-value">${playbackState.transposeSteps}</span>
        <button class="control-btn" data-action="transpose-up" aria-label="Yarım ton yukarı">+</button>
      </div>

      <div class="control" title="Tempo (BPM)">
        <span class="control-label">♩=</span>
        <button class="control-btn" data-action="tempo-down" aria-label="Tempoyu azalt">−</button>
        <span id="tempo-value" class="control-value">${playbackState.bpm}</span>
        <button class="control-btn" data-action="tempo-up" aria-label="Tempoyu artır">+</button>
      </div>

      <button id="autoscroll-toggle" class="btn-icon toggle ${playbackState.autoscroll ? "is-active" : ""}"
        aria-pressed="${playbackState.autoscroll}" title="Otomatik kaydırma">⇅</button>

      <select id="rhythm-select" class="control control-select" title="Ritim stili" aria-label="Ritim stili">
        ${Object.entries(RHYTHM_STYLES)
          .map(
            ([key, style]) =>
              `<option value="${key}" ${playbackState.rhythmStyle === key ? "selected" : ""}>🥁 ${style.label}</option>`
          )
          .join("")}
      </select>
    </div>

    <div class="song-sheet-header">
      <h3>${song.title}</h3>
      <p>${song.artist} · ${song.key} akoru</p>
    </div>
    <div class="song-lyrics">${sectionsHtml}</div>
  `;

  attachSongSheetEvents(song);
}

function renderLine(line, sectionIndex, lineIndex) {
  const segmentsHtml = line
    .map((seg) => {
      const displayChord = seg.chord ? transposeChordName(seg.chord, playbackState.transposeSteps) : "";
      return `
        <span class="lyric-segment">
          ${
            seg.chord
              ? `<button class="chord-tag" data-chord="${seg.chord}">${displayChord}</button>`
              : `<span class="chord-tag chord-tag-empty">&nbsp;</span>`
          }
          <span class="lyric-word">${seg.lyric}</span>
        </span>`;
    })
    .join("");
  return `<div class="lyric-line" data-line-key="${sectionIndex}-${lineIndex}">${segmentsHtml}</div>`;
}

function attachSongSheetEvents(song) {
  const sheet = document.getElementById("song-sheet");

  sheet.querySelectorAll(".chord-tag[data-chord]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const chord = playChordByName(btn.dataset.chord, playbackState.transposeSteps);
      btn.classList.add("is-playing");
      setTimeout(() => btn.classList.remove("is-playing"), 400);
      if (chord) showChordDetail(chord);
    });
  });

  document.getElementById("play-btn").addEventListener("click", () => {
    if (playbackState.playing) {
      stopPlayback(updatePlayButton);
    } else {
      startPlayback(song, updatePlayButton);
      updatePlayButton();
    }
  });

  document.getElementById("autoscroll-toggle").addEventListener("click", (e) => {
    playbackState.autoscroll = !playbackState.autoscroll;
    e.currentTarget.classList.toggle("is-active", playbackState.autoscroll);
    e.currentTarget.setAttribute("aria-pressed", String(playbackState.autoscroll));
  });

  document.getElementById("rhythm-select").addEventListener("change", (e) => {
    playbackState.rhythmStyle = e.target.value;
  });

  sheet.querySelector('[data-action="transpose-down"]').addEventListener("click", () => adjustTranspose(-1, song));
  sheet.querySelector('[data-action="transpose-up"]').addEventListener("click", () => adjustTranspose(1, song));
  sheet.querySelector('[data-action="tempo-down"]').addEventListener("click", () => adjustTempo(-4));
  sheet.querySelector('[data-action="tempo-up"]').addEventListener("click", () => adjustTempo(4));
}

function adjustTranspose(delta, song) {
  playbackState.transposeSteps = Math.max(-6, Math.min(6, playbackState.transposeSteps + delta));
  document.getElementById("transpose-value").textContent = playbackState.transposeSteps;
  renderSongSheet(currentSongIndex);
}

function adjustTempo(delta) {
  playbackState.bpm = Math.max(40, Math.min(200, playbackState.bpm + delta));
  document.getElementById("tempo-value").textContent = playbackState.bpm;
}

function updatePlayButton() {
  const btn = document.getElementById("play-btn");
  if (!btn) return;
  btn.textContent = playbackState.playing ? "■" : "▶";
  btn.classList.toggle("is-active", playbackState.playing);
}

// ---------- Nav ----------

function setupNav() {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (targetId && targetId.startsWith("#")) {
        e.preventDefault();
        document.querySelector(targetId)?.scrollIntoView({ behavior: "smooth" });
        document.getElementById("nav-links").classList.remove("open");
      }
    });
  });

  document.getElementById("nav-toggle").addEventListener("click", () => {
    document.getElementById("nav-links").classList.toggle("open");
  });
}
