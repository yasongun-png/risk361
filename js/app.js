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
    item.addEventListener("click", () => renderSongSheet(index));
    list.appendChild(item);
  });

  renderSongSheet(0);
}

function renderSongSheet(index) {
  const song = SONGS[index];
  const sheet = document.getElementById("song-sheet");

  document.querySelectorAll(".song-list-item").forEach((el, i) => {
    el.classList.toggle("active", i === index);
  });

  const linesHtml = song.lines
    .map((line) => {
      const segmentsHtml = line
        .map(
          (seg) => `
          <span class="lyric-segment">
            ${
              seg.chord
                ? `<button class="chord-tag" data-chord="${seg.chord}">${seg.chord}</button>`
                : `<span class="chord-tag chord-tag-empty">&nbsp;</span>`
            }
            <span class="lyric-word">${seg.lyric}</span>
          </span>`
        )
        .join("");
      return `<div class="lyric-line">${segmentsHtml}</div>`;
    })
    .join("");

  sheet.innerHTML = `
    <div class="song-sheet-header">
      <h3>${song.title}</h3>
      <p>${song.artist} · Kapo yok · ${song.key} akoru</p>
    </div>
    <div class="song-lyrics">${linesHtml}</div>
  `;

  sheet.querySelectorAll(".chord-tag[data-chord]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const chord = playChordByName(btn.dataset.chord);
      btn.classList.add("is-playing");
      setTimeout(() => btn.classList.remove("is-playing"), 400);
      if (chord) showChordDetail(chord);
    });
  });
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
