// Drives "Oynat" (play-through) for a song: schedules chord audio in time,
// highlights the current line, and auto-scrolls to keep it in view.
const playbackState = {
  playing: false,
  timeouts: [],
  transposeSteps: 0,
  bpm: 90,
  autoscroll: true,
};

function buildPlaylist(song) {
  const playlist = [];
  song.sections.forEach((section, sIdx) => {
    const repeatCount = section.repeat ? 2 : 1;
    for (let r = 0; r < repeatCount; r++) {
      section.lines.forEach((line, lIdx) => {
        playlist.push({ key: `${sIdx}-${lIdx}`, chords: line });
      });
    }
  });
  return playlist;
}

function clearScheduledTimeouts() {
  playbackState.timeouts.forEach((t) => clearTimeout(t));
  playbackState.timeouts = [];
}

function highlightLine(key) {
  document.querySelectorAll(".lyric-line.active-line").forEach((el) => el.classList.remove("active-line"));
  const el = document.querySelector(`[data-line-key="${key}"]`);
  if (!el) return;
  el.classList.add("active-line");
  if (playbackState.autoscroll) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function stopPlayback(onStopped) {
  clearScheduledTimeouts();
  playbackState.playing = false;
  document.querySelectorAll(".lyric-line.active-line").forEach((el) => el.classList.remove("active-line"));
  if (onStopped) onStopped();
}

function startPlayback(song, onStopped) {
  clearScheduledTimeouts();
  playbackState.playing = true;

  const playlist = buildPlaylist(song);
  const secondsPerBeat = 60 / playbackState.bpm;
  const beatsPerLine = 4;
  const lineDuration = secondsPerBeat * beatsPerLine;

  let elapsed = 0;
  playlist.forEach((line) => {
    const lineStartMs = elapsed * 1000;
    const lineTimeout = setTimeout(() => highlightLine(line.key), lineStartMs);
    playbackState.timeouts.push(lineTimeout);

    const segGap = lineDuration / Math.max(line.chords.length, 1);
    line.chords.forEach((seg, i) => {
      if (!seg.chord) return;
      const chordTimeout = setTimeout(() => {
        playChordByName(seg.chord, playbackState.transposeSteps);
      }, lineStartMs + i * segGap * 1000);
      playbackState.timeouts.push(chordTimeout);
    });

    elapsed += lineDuration;
  });

  const endTimeout = setTimeout(() => {
    stopPlayback(onStopped);
  }, elapsed * 1000);
  playbackState.timeouts.push(endTimeout);
}
