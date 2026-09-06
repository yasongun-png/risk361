// Drives "Oynat" (play-through) for a song: schedules rhythm-guitar strum
// accompaniment in time, highlights the current line, and auto-scrolls to
// keep it in view.
const playbackState = {
  playing: false,
  timeouts: [],
  transposeSteps: 0,
  bpm: 90,
  autoscroll: true,
  rhythmStyle: "pop",
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

// Highlights exactly which chord (by its position in the line) should be
// playing right now, so you can see the chord change happen in real time
// instead of just knowing which line you're on.
function highlightChord(lineKey, segIndex) {
  document.querySelectorAll(".chord-tag.active-chord").forEach((el) => el.classList.remove("active-chord"));
  const el = document.querySelector(`[data-line-key="${lineKey}"] .chord-tag[data-seg-index="${segIndex}"]`);
  if (el) el.classList.add("active-chord");
}

function stopPlayback(onStopped) {
  clearScheduledTimeouts();
  stopAllScheduledSound();
  playbackState.playing = false;
  document.querySelectorAll(".lyric-line.active-line").forEach((el) => el.classList.remove("active-line"));
  document.querySelectorAll(".chord-tag.active-chord").forEach((el) => el.classList.remove("active-chord"));
  if (onStopped) onStopped();
}

function startPlayback(song, onStopped) {
  clearScheduledTimeouts();
  playbackState.playing = true;

  const playlist = buildPlaylist(song);
  const secondsPerBeat = 60 / playbackState.bpm;
  const beatsPerLine = 4;
  const lineDuration = secondsPerBeat * beatsPerLine;

  // Web Audio's own clock schedules the actual strums sample-accurately;
  // setTimeout (imprecise, but fine for the UI) only drives the on-screen
  // line highlight/auto-scroll in sync with that same timeline.
  const ctx = getAudioContext();
  const audioStartTime = ctx.currentTime + 0.15;

  let elapsed = 0;
  playlist.forEach((line) => {
    // The app keeps the beat like a drummer; the chords stay on screen for
    // you to actually play on guitar along with it.
    scheduleDrumBar(audioStartTime + elapsed, lineDuration, playbackState.rhythmStyle);

    const lineTimeout = setTimeout(() => highlightLine(line.key), elapsed * 1000);
    playbackState.timeouts.push(lineTimeout);

    const chordSegments = line.chords
      .map((seg, segIndex) => ({ ...seg, segIndex }))
      .filter((seg) => seg.chord);
    const segGap = lineDuration / Math.max(chordSegments.length, 1);
    chordSegments.forEach((seg, i) => {
      const chordTimeout = setTimeout(
        () => highlightChord(line.key, seg.segIndex),
        (elapsed + i * segGap) * 1000
      );
      playbackState.timeouts.push(chordTimeout);
    });

    elapsed += lineDuration;
  });

  const endTimeout = setTimeout(() => {
    stopPlayback(onStopped);
  }, elapsed * 1000);
  playbackState.timeouts.push(endTimeout);
}
