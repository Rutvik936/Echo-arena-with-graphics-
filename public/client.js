const menu = document.querySelector("#menu");
const game = document.querySelector("#game");
const createBtn = document.querySelector("#createBtn");
const joinForm = document.querySelector("#joinForm");
const roomInput = document.querySelector("#roomInput");
const copyCode = document.querySelector("#copyCode");
const statusEl = document.querySelector("#status");
const timerEl = document.querySelector("#timer");
const echoTimerEl = document.querySelector("#echoTimer");
const p1Hp = document.querySelector("#p1Hp");
const p2Hp = document.querySelector("#p2Hp");
const banner = document.querySelector("#banner");
const rematch = document.querySelector("#rematch");
const leaveBtn = document.querySelector("#leaveBtn");
const pvpModeBtn = document.querySelector("#pvpModeBtn");
const aiModeBtn = document.querySelector("#aiModeBtn");
const pvpSection = document.querySelector("#pvpSection");
const aiSection = document.querySelector("#aiSection");
const startAiBtn = document.querySelector("#startAiBtn");
const diffButtons = document.querySelectorAll(".diff-btn");
const canvas = document.querySelector("#arena");
const ctx = canvas.getContext("2d");

let ws;
let playerId;
let roomCode = "";
let state = null;
let keys = {};
let lastInput = "";
let isAiMatch = false;
let aiDifficulty = "medium";
let selectedDifficulty = "medium";
let audioCtx = null;
let jumpAudioBuffer = null;
let jumpAudioFallback = null;
let punchAudioBuffer = null;
let punchAudioFallback = null;
let runAudioBuffer = null;
let runAudioFallback = null;
let kickAudioBuffer = null;
let kickAudioFallback = null;
let blockAudioBuffer = null;
let blockAudioFallback = null;
let victoryAudioBuffer = null;
let victoryAudioFallback = null;
let defeatAudioBuffer = null;
let defeatAudioFallback = null;
let matchEndSoundPlayed = false;
const runningFighters = new Set();
let activeRunSource = null;
let activeRunGain = null;

const arenaBackground = {
  image: new Image(),
  path: "/assets/background.jpg",
  loaded: false
};
arenaBackground.image.onload = () => {
  arenaBackground.loaded = true;
};
arenaBackground.image.src = arenaBackground.path;

const punchImpact = {
  image: new Image(),
  path: "/assets/punch_impact.png",
  loaded: false,
  frames: [
    { x: 35, y: 175, w: 21, h: 21 },
    { x: 83, y: 144, w: 73, h: 73 },
    { x: 167, y: 128, w: 108, h: 113 },
    { x: 285, y: 137, w: 85, h: 88 }
  ]
};
punchImpact.image.onload = () => {
  punchImpact.loaded = true;
};
punchImpact.image.src = punchImpact.path;

const kickImpact = {
  image: new Image(),
  path: "/assets/kick_impact.png",
  loaded: false,
  frames: [
    { x: 34, y: 110, w: 36, h: 71 },
    { x: 129, y: 110, w: 55, h: 68 },
    { x: 216, y: 106, w: 71, h: 74 },
    { x: 306, y: 101, w: 79, h: 82 },
    { x: 385, y: 100, w: 84, h: 86 },
    { x: 486, y: 105, w: 72, h: 79 },
    { x: 586, y: 111, w: 60, h: 70 },
    { x: 689, y: 111, w: 55, h: 67 },
    { x: 792, y: 112, w: 55, h: 65 }
  ]
};
kickImpact.image.onload = () => {
  kickImpact.loaded = true;
};
kickImpact.image.src = kickImpact.path;

const character1Idle = {
  image: new Image(),
  path: "/assets/character1/idle.png",
  source: null,
  loaded: false,
  valid: false,
  transparency: "unknown",
  frameCount: 4,
  columns: 4,
  rows: 1,
  frameWidth: 0,
  frameHeight: 0,
  sequence: [0, 1, 2, 3, 2, 1],
  frameMs: 190
};

const character1Kick = {
  image: new Image(),
  path: "/assets/character1/kick.png",
  source: null,
  loaded: false,
  valid: false,
  transparency: "unknown",
  frameCount: 4,
  columns: 4,
  rows: 1,
  frameWidth: 0,
  frameHeight: 0,
  sequence: [0, 1, 2, 3],
  frameMs: 58
};

const character1Punch = {
  image: new Image(),
  path: "/assets/character1/punch.png",
  source: null,
  loaded: false,
  valid: false,
  transparency: "unknown",
  frameCount: 4,
  columns: 4,
  rows: 1,
  frameWidth: 0,
  frameHeight: 0,
  sequence: [0, 1, 2, 3],
  frameMs: 40
};

const character1Walk = {
  image: new Image(),
  path: "/assets/character1/walk.png",
  source: null,
  loaded: false,
  valid: false,
  transparency: "unknown",
  frameCount: 8,
  columns: 8,
  rows: 1,
  frameWidth: 0,
  frameHeight: 0,
  sequence: [0, 1, 2, 3, 4, 5, 6, 7],
  frameMs: 80,
  targetH: 194,
  targetY: -159
};

const character1Jump = {
  image: new Image(),
  path: "/assets/character1/jump.png",
  source: null,
  loaded: false,
  valid: false,
  transparency: "unknown",
  frameCount: 2,
  columns: 2,
  rows: 1,
  frameWidth: 0,
  frameHeight: 0,
  sequence: [0, 1],
  frameMs: 90
};

const character1FallLand = {
  image: new Image(),
  path: "/assets/character1/land.png",
  source: null,
  loaded: false,
  valid: false,
  transparency: "unknown",
  frameCount: 2,
  columns: 2,
  rows: 1,
  frameWidth: 0,
  frameHeight: 0,
  sequence: [0, 1],
  frameMs: 90
};

const character1Knockback = {
  image: new Image(),
  path: "/assets/character1/knockback.png",
  source: null,
  loaded: false,
  valid: false,
  transparency: "unknown",
  frameCount: 3,
  columns: 3,
  rows: 1,
  frameWidth: 0,
  frameHeight: 0,
  sequence: [0, 1, 2],
  frameMs: 73
};

const character1Death = {
  image: new Image(),
  path: "/assets/character1/death.png",
  source: null,
  loaded: false,
  valid: false,
  transparency: "unknown",
  frameCount: 5,
  columns: 5,
  rows: 1,
  frameWidth: 0,
  frameHeight: 0,
  sequence: [0, 1, 2, 3, 4],
  frameMs: 90
};

const character1Victory = {
  image: new Image(),
  path: "/assets/character1/victory.png",
  source: null,
  loaded: false,
  valid: false,
  transparency: "unknown",
  frameCount: 3,
  columns: 3,
  rows: 1,
  frameWidth: 0,
  frameHeight: 0,
  sequence: [0, 1, 2],
  frameMs: 140
};

const character1Block = {
  image: new Image(),
  path: "/assets/character1/block.png",
  source: null,
  loaded: false,
  valid: false,
  transparency: "unknown",
  frameCount: 4,
  columns: 4,
  rows: 1,
  frameWidth: 0,
  frameHeight: 0,
  sequence: [0, 1],
  frameMs: 80
};

const character2Idle = {
  image: new Image(),
  path: "/assets/character2/idle.png",
  source: null,
  loaded: false,
  valid: false,
  transparency: "unknown",
  frameCount: 4,
  columns: 4,
  rows: 1,
  frameWidth: 0,
  frameHeight: 0,
  sequence: [0, 1, 2, 3, 2, 1],
  frameMs: 190
};

const character2Walk = {
  image: new Image(),
  path: "/assets/character2/run.png",
  source: null,
  loaded: false,
  valid: false,
  transparency: "unknown",
  frameCount: 8,
  columns: 8,
  rows: 1,
  frameWidth: 0,
  frameHeight: 0,
  sequence: [0, 1, 2, 3, 4, 5, 6, 7],
  frameMs: 80
};

const character2Jump = {
  image: new Image(),
  path: "/assets/character2/jump.png",
  source: null,
  loaded: false,
  valid: false,
  transparency: "unknown",
  frameCount: 2,
  columns: 2,
  rows: 1,
  frameWidth: 0,
  frameHeight: 0,
  sequence: [0, 1],
  frameMs: 90
};

const character2FallLand = {
  image: new Image(),
  path: "/assets/character2/land.png",
  source: null,
  loaded: false,
  valid: false,
  transparency: "unknown",
  frameCount: 2,
  columns: 2,
  rows: 1,
  frameWidth: 0,
  frameHeight: 0,
  sequence: [0, 1],
  frameMs: 90
};

const character2Punch = {
  image: new Image(),
  path: "/assets/character2/punch.png",
  source: null,
  loaded: false,
  valid: false,
  transparency: "unknown",
  frameCount: 4,
  columns: 4,
  rows: 1,
  frameWidth: 0,
  frameHeight: 0,
  sequence: [0, 1, 2, 3],
  frameMs: 40
};

const character2Kick = {
  image: new Image(),
  path: "/assets/character2/kick.png",
  source: null,
  loaded: false,
  valid: false,
  transparency: "unknown",
  frameCount: 4,
  columns: 4,
  rows: 1,
  frameWidth: 0,
  frameHeight: 0,
  sequence: [0, 1, 2, 3],
  frameMs: 55
};

const character2Knockback = {
  image: new Image(),
  path: "/assets/character2/knockback.png",
  source: null,
  loaded: false,
  valid: false,
  transparency: "unknown",
  frameCount: 3,
  columns: 3,
  rows: 1,
  frameWidth: 0,
  frameHeight: 0,
  sequence: [0, 1, 2],
  frameMs: 73
};

const character2Death = {
  image: new Image(),
  path: "/assets/character2/death.png",
  source: null,
  loaded: false,
  valid: false,
  transparency: "unknown",
  frameCount: 4,
  columns: 4,
  rows: 1,
  frameWidth: 0,
  frameHeight: 0,
  sequence: [0, 1, 2, 3],
  frameMs: 110
};

const character2Victory = {
  image: new Image(),
  path: "/assets/character2/victory.png",
  source: null,
  loaded: false,
  valid: false,
  transparency: "unknown",
  frameCount: 3,
  columns: 3,
  rows: 1,
  frameWidth: 0,
  frameHeight: 0,
  sequence: [0, 1, 2],
  frameMs: 140
};

const character2Block = {
  image: new Image(),
  path: "/assets/character2/block.png",
  source: null,
  loaded: false,
  valid: false,
  transparency: "unknown",
  frameCount: 4,
  columns: 4,
  rows: 1,
  frameWidth: 0,
  frameHeight: 0,
  sequence: [0, 1],
  frameMs: 80
};

const fighterVisualState = new Map();

loadSpriteSheet(character1Idle);
loadSpriteSheet(character1Kick);
loadSpriteSheet(character1Punch);
loadSpriteSheet(character1Walk);
loadSpriteSheet(character1Jump);
loadSpriteSheet(character1FallLand);
loadSpriteSheet(character1Knockback);
loadSpriteSheet(character1Death);
loadSpriteSheet(character1Victory);
loadSpriteSheet(character1Block);
loadSpriteSheet(character2Idle);
loadSpriteSheet(character2Walk);
loadSpriteSheet(character2Jump);
loadSpriteSheet(character2FallLand);
loadSpriteSheet(character2Punch);
loadSpriteSheet(character2Kick);
loadSpriteSheet(character2Knockback);
loadSpriteSheet(character2Death);
loadSpriteSheet(character2Victory);
loadSpriteSheet(character2Block);

window.addEventListener("pointerdown", unlockAudio, { passive: true });
window.addEventListener("keydown", unlockAudio, { passive: true });
window.addEventListener("touchstart", unlockAudio, { passive: true });

connect();
requestAnimationFrame(draw);
setInterval(sendInput, 1000 / 30);

createBtn.addEventListener("click", () => {
  unlockAudio();
  ensureSocket(() => send({ type: "createRoom" }));
});

joinForm.addEventListener("submit", (event) => {
  event.preventDefault();
  unlockAudio();
  const code = roomInput.value.trim().toUpperCase();
  if (code) ensureSocket(() => send({ type: "joinRoom", code }));
});

if (pvpModeBtn && aiModeBtn) {
  pvpModeBtn.addEventListener("click", () => {
    pvpModeBtn.classList.add("active");
    aiModeBtn.classList.remove("active");
    if (pvpSection) pvpSection.classList.remove("hidden");
    if (aiSection) aiSection.classList.add("hidden");
  });

  aiModeBtn.addEventListener("click", () => {
    aiModeBtn.classList.add("active");
    pvpModeBtn.classList.remove("active");
    if (aiSection) aiSection.classList.remove("hidden");
    if (pvpSection) pvpSection.classList.add("hidden");
  });
}

diffButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    diffButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedDifficulty = btn.dataset.difficulty || "medium";
  });
});

if (startAiBtn) {
  startAiBtn.addEventListener("click", () => {
    unlockAudio();
    ensureSocket(() => send({ type: "startAiMatch", difficulty: selectedDifficulty }));
  });
}

copyCode.addEventListener("click", async () => {
  if (!roomCode) return;
  await navigator.clipboard?.writeText(roomCode);
  copyCode.textContent = "Copied";
  setTimeout(() => (copyCode.textContent = roomCode), 900);
});

rematch.addEventListener("click", () => send({ type: "rematch" }));

if (leaveBtn) {
  leaveBtn.addEventListener("click", () => {
    send({ type: "leaveRoom" });
    game.classList.add("hidden");
    menu.classList.remove("hidden");
    state = null;
    playerId = null;
    roomCode = "";
    isAiMatch = false;
    stopAllRunSounds();
    updateHudPlayerNames();
  });
}

const pendingInputs = { jump: false, punch: false, kick: false };

window.addEventListener("keydown", (event) => {
  const k = event.key.toLowerCase();
  keys[k] = true;
  if (["w", "arrowup", " "].includes(k)) pendingInputs.jump = true;
  if (k === "j") pendingInputs.punch = true;
  if (k === "k") pendingInputs.kick = true;
  if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
    event.preventDefault();
  }
  sendInput();
});

window.addEventListener("keyup", (event) => {
  keys[event.key.toLowerCase()] = false;
  sendInput();
  updateControlButtons();
});

window.addEventListener("blur", () => {
  keys = {};
  sendInput();
  updateControlButtons();
});

document.querySelectorAll("[data-control]").forEach((button) => {
  const control = button.dataset.control;
  const set = (value) => {
    keys[`touch:${control}`] = value;
    if (value) {
      if (control === "jump") pendingInputs.jump = true;
      if (control === "punch") pendingInputs.punch = true;
      if (control === "kick") pendingInputs.kick = true;
    }
    sendInput();
  };
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    set(true);
  });
  button.addEventListener("pointerup", () => set(false));
  button.addEventListener("pointercancel", () => set(false));
  button.addEventListener("pointerleave", () => set(false));
});

function connect() {
  const protocol = location.protocol === "https:" ? "wss" : "ws";
  ws = new WebSocket(`${protocol}://${location.host}`);
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "joined") {
      playerId = message.playerId;
      roomCode = message.code;
      isAiMatch = Boolean(message.isAi);
      aiDifficulty = message.difficulty || "medium";
      copyCode.textContent = roomCode;
      menu.classList.add("hidden");
      game.classList.remove("hidden");
      updateHudPlayerNames();
    }
    if (message.type === "room") {
      roomCode = message.code;
      isAiMatch = Boolean(message.isAi);
      aiDifficulty = message.difficulty || aiDifficulty || "medium";
      copyCode.textContent = roomCode;
      if (isAiMatch) {
        statusEl.textContent = `VS CPU (${capitalize(aiDifficulty)})`;
      } else {
        statusEl.textContent = message.players < 2 ? "Waiting for opponent" : "Connected";
      }
      updateHudPlayerNames();
    }
    if (message.type === "state") {
      state = message;
      updateHud();
    }
    if (message.type === "error") {
      statusEl.textContent = message.message;
      alert(message.message);
    }
  });
  ws.addEventListener("close", () => {
    statusEl.textContent = "Reconnecting";
    setTimeout(connect, 700);
  });
}

function updateHudPlayerNames() {
  const p1El = document.querySelector("#p1Name");
  const p2El = document.querySelector("#p2Name");
  if (isAiMatch) {
    if (p1El) p1El.textContent = "Player 1";
    if (p2El) p2El.textContent = `CPU (${capitalize(aiDifficulty)})`;
  } else {
    if (p1El) p1El.textContent = "Player 1";
    if (p2El) p2El.textContent = "Player 2";
  }
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function ensureSocket(callback) {
  if (ws?.readyState === WebSocket.OPEN) callback();
  else {
    connect();
    setTimeout(callback, 400);
  }
}

function send(message) {
  if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
}

function currentInput() {
  const input = {
    left: Boolean(keys.a || keys.arrowleft || keys["touch:left"]),
    right: Boolean(keys.d || keys.arrowright || keys["touch:right"]),
    jump: Boolean(keys.w || keys.arrowup || keys[" "] || keys["touch:jump"] || pendingInputs.jump),
    punch: Boolean(keys.j || keys["touch:punch"] || pendingInputs.punch),
    kick: Boolean(keys.k || keys["touch:kick"] || pendingInputs.kick),
    block: Boolean(keys.l || keys.shift || keys["touch:block"])
  };
  pendingInputs.jump = false;
  pendingInputs.punch = false;
  pendingInputs.kick = false;
  return input;
}


function sendInput() {
  if (!playerId) return;
  const input = currentInput();
  const encoded = JSON.stringify(input);
  if (encoded !== lastInput) {
    lastInput = encoded;
    send({ type: "input", input });
  }
  updateControlButtons(input);
}

function updateControlButtons(input = currentInput()) {
  document.querySelectorAll("[data-control]").forEach((b) => {
    const ctrl = b.dataset.control;
    if (ctrl && input[ctrl]) {
      b.classList.add("active-key");
    } else {
      b.classList.remove("active-key");
    }
  });
}

function updateHud() {
  if (!state) return;
  timerEl.textContent = Math.ceil(state.timer);
  echoTimerEl.textContent = state.phase === "playing" ? `Echo in ${Math.ceil(state.nextEchoIn)}s` : "Echo armed";
  p1Hp.style.width = `${state.players.p1.hp}%`;
  p2Hp.style.width = `${state.players.p2.hp}%`;
  rematch.classList.toggle("hidden", state.phase !== "ended");
  if (leaveBtn) leaveBtn.classList.toggle("hidden", state.phase !== "ended");
  banner.classList.toggle("hidden", state.phase === "playing");
  if (state.phase === "waiting") banner.textContent = "Waiting";
  if (state.phase === "paused") banner.textContent = "Opponent left";
  if (state.phase === "countdown") banner.textContent = Math.ceil(state.countdown) || "Fight";
  if (state.phase === "ended") {
    if (state.winner === "draw") banner.textContent = "Draw";
    else banner.textContent = state.winner === playerId ? "You win" : "You lose";
  }
  if (state.phase !== "ended") {
    matchEndSoundPlayed = false;
  } else if (!matchEndSoundPlayed && state.winner && state.winner !== "draw") {
    matchEndSoundPlayed = true;
    if (playerId && state.winner !== playerId) {
      playDefeatSound();
    } else {
      playVictorySound();
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawArena();
  if (state) {
    if (state.phase !== "playing") {
      stopAllRunSounds();
    }
    if (fighterVisualState.size > 30) {
      const activeIds = new Set(["p1", "p2", ...state.echoes.map((e) => e.id)]);
      for (const k of fighterVisualState.keys()) {
        if (!activeIds.has(k)) {
          fighterVisualState.delete(k);
        }
      }
    }
    drawFighter(state.players.p1, "#37d39a", false);
    drawFighter(state.players.p2, "#ef6262", false);
    for (const echo of state.echoes) drawFighter(echo, echo.owner === "p1" ? "#8bd3d0" : "#f0c15a", true);
    for (const spark of state.sparks) drawSpark(spark);
  } else {
    stopAllRunSounds();
  }
  requestAnimationFrame(draw);
}

function getAudioContext() {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
  } catch {}
  return audioCtx;
}

function initAudio() {
  try {
    const ctx = getAudioContext();
    if (!jumpAudioBuffer) {
      fetch("/assets/sounds/jump.ogg")
        .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject()))
        .then((buf) => (ctx ? ctx.decodeAudioData(buf) : Promise.reject()))
        .then((decoded) => {
          jumpAudioBuffer = decoded;
        })
        .catch(() => {
          setupFallbackAudio("jump");
        });
    }
    if (!punchAudioBuffer) {
      fetch("/assets/sounds/punch.mp3")
        .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject()))
        .then((buf) => (ctx ? ctx.decodeAudioData(buf) : Promise.reject()))
        .then((decoded) => {
          punchAudioBuffer = decoded;
        })
        .catch(() => {
          setupFallbackAudio("punch");
        });
    }
    if (!runAudioBuffer) {
      fetch("/assets/sounds/run.mp3")
        .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject()))
        .then((buf) => (ctx ? ctx.decodeAudioData(buf) : Promise.reject()))
        .then((decoded) => {
          runAudioBuffer = decoded;
        })
        .catch(() => {
          setupFallbackAudio("run");
        });
    }
    if (!kickAudioBuffer) {
      fetch("/assets/sounds/kick.mp3")
        .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject()))
        .then((buf) => (ctx ? ctx.decodeAudioData(buf) : Promise.reject()))
        .then((decoded) => {
          kickAudioBuffer = decoded;
        })
        .catch(() => {
          setupFallbackAudio("kick");
        });
    }
    if (!blockAudioBuffer) {
      fetch("/assets/sounds/block.mp3")
        .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject()))
        .then((buf) => (ctx ? ctx.decodeAudioData(buf) : Promise.reject()))
        .then((decoded) => {
          blockAudioBuffer = decoded;
        })
        .catch(() => {
          setupFallbackAudio("block");
        });
    }
    if (!victoryAudioBuffer) {
      fetch("/assets/sounds/victory.mp3")
        .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject()))
        .then((buf) => (ctx ? ctx.decodeAudioData(buf) : Promise.reject()))
        .then((decoded) => {
          victoryAudioBuffer = decoded;
        })
        .catch(() => {
          setupFallbackAudio("victory");
        });
    }
    if (!defeatAudioBuffer) {
      fetch("/assets/sounds/defeat.mp3")
        .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject()))
        .then((buf) => (ctx ? ctx.decodeAudioData(buf) : Promise.reject()))
        .then((decoded) => {
          defeatAudioBuffer = decoded;
        })
        .catch(() => {
          setupFallbackAudio("defeat");
        });
    }
  } catch {
    setupFallbackAudio("jump");
    setupFallbackAudio("punch");
    setupFallbackAudio("run");
    setupFallbackAudio("kick");
    setupFallbackAudio("block");
    setupFallbackAudio("victory");
    setupFallbackAudio("defeat");
  }
}

function setupFallbackAudio(type) {
  try {
    if ((type === "jump" || !type) && !jumpAudioFallback) {
      jumpAudioFallback = new Audio("/assets/sounds/jump.ogg");
      jumpAudioFallback.preload = "auto";
    }
    if ((type === "punch" || !type) && !punchAudioFallback) {
      punchAudioFallback = new Audio("/assets/sounds/punch.mp3");
      punchAudioFallback.preload = "auto";
    }
    if ((type === "run" || !type) && !runAudioFallback) {
      runAudioFallback = new Audio("/assets/sounds/run.mp3");
      runAudioFallback.preload = "auto";
      runAudioFallback.loop = true;
    }
    if ((type === "kick" || !type) && !kickAudioFallback) {
      kickAudioFallback = new Audio("/assets/sounds/kick.mp3");
      kickAudioFallback.preload = "auto";
    }
    if ((type === "block" || !type) && !blockAudioFallback) {
      blockAudioFallback = new Audio("/assets/sounds/block.mp3");
      blockAudioFallback.preload = "auto";
    }
    if ((type === "victory" || !type) && !victoryAudioFallback) {
      victoryAudioFallback = new Audio("/assets/sounds/victory.mp3");
      victoryAudioFallback.preload = "auto";
    }
    if ((type === "defeat" || !type) && !defeatAudioFallback) {
      defeatAudioFallback = new Audio("/assets/sounds/defeat.mp3");
      defeatAudioFallback.preload = "auto";
    }
  } catch {}
}

function unlockAudio() {
  getAudioContext();
  if (!jumpAudioBuffer || !punchAudioBuffer || !runAudioBuffer || !kickAudioBuffer || !blockAudioBuffer || !victoryAudioBuffer || !defeatAudioBuffer) {
    initAudio();
  }
}

function playJumpSound(isEcho = false) {
  const ctx = getAudioContext();
  if (ctx && jumpAudioBuffer) {
    try {
      const source = ctx.createBufferSource();
      source.buffer = jumpAudioBuffer;
      const gainNode = ctx.createGain();
      gainNode.gain.value = isEcho ? 0.35 : 0.65;
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(0);
      return;
    } catch {}
  }
  setupFallbackAudio("jump");
  if (jumpAudioFallback) {
    try {
      const clone = jumpAudioFallback.cloneNode();
      clone.volume = isEcho ? 0.35 : 0.65;
      clone.play().catch(() => {});
    } catch {}
  }
}

function playPunchSound(isEcho = false) {
  const ctx = getAudioContext();
  if (ctx && punchAudioBuffer) {
    try {
      const source = ctx.createBufferSource();
      source.buffer = punchAudioBuffer;
      const gainNode = ctx.createGain();
      gainNode.gain.value = isEcho ? 0.35 : 0.7;
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(0);
      return;
    } catch {}
  }
  setupFallbackAudio("punch");
  if (punchAudioFallback) {
    try {
      const clone = punchAudioFallback.cloneNode();
      clone.volume = isEcho ? 0.35 : 0.7;
      clone.play().catch(() => {});
    } catch {}
  }
}

function playKickSound(isEcho = false) {
  const ctx = getAudioContext();
  if (ctx && kickAudioBuffer) {
    try {
      const source = ctx.createBufferSource();
      source.buffer = kickAudioBuffer;
      const gainNode = ctx.createGain();
      gainNode.gain.value = isEcho ? 0.35 : 0.75;
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(0);
      return;
    } catch {}
  }
  setupFallbackAudio("kick");
  if (kickAudioFallback) {
    try {
      const clone = kickAudioFallback.cloneNode();
      clone.volume = isEcho ? 0.35 : 0.75;
      clone.play().catch(() => {});
    } catch {}
  }
}

function playBlockSound(isEcho = false) {
  const ctx = getAudioContext();
  if (ctx && blockAudioBuffer) {
    try {
      const source = ctx.createBufferSource();
      source.buffer = blockAudioBuffer;
      const gainNode = ctx.createGain();
      gainNode.gain.value = isEcho ? 0.35 : 0.75;
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(0);
      return;
    } catch {}
  }
  setupFallbackAudio("block");
  if (blockAudioFallback) {
    try {
      const clone = blockAudioFallback.cloneNode();
      clone.volume = isEcho ? 0.35 : 0.75;
      clone.play().catch(() => {});
    } catch {}
  }
}

function playVictorySound() {
  const ctx = getAudioContext();
  if (ctx && victoryAudioBuffer) {
    try {
      const source = ctx.createBufferSource();
      source.buffer = victoryAudioBuffer;
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.85;
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(0);
      return;
    } catch {}
  }
  setupFallbackAudio("victory");
  if (victoryAudioFallback) {
    try {
      const clone = victoryAudioFallback.cloneNode();
      clone.volume = 0.85;
      clone.play().catch(() => {});
    } catch {}
  }
}

function playDefeatSound() {
  const ctx = getAudioContext();
  if (ctx && defeatAudioBuffer) {
    try {
      const source = ctx.createBufferSource();
      source.buffer = defeatAudioBuffer;
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.85;
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(0);
      return;
    } catch {}
  }
  setupFallbackAudio("defeat");
  if (defeatAudioFallback) {
    try {
      const clone = defeatAudioFallback.cloneNode();
      clone.volume = 0.85;
      clone.play().catch(() => {});
    } catch {}
  }
}

function syncRunSound() {
  if (!state || state.phase !== "playing" || runningFighters.size === 0) {
    stopRunSound();
    return;
  }
  const volume = runningFighters.size > 1 ? 0.6 : 0.45;
  startRunSound(volume);
}

function startRunSound(targetVolume = 0.45) {
  const ctx = getAudioContext();
  if (ctx && runAudioBuffer) {
    if (activeRunSource && activeRunGain) {
      try {
        activeRunGain.gain.setValueAtTime(targetVolume, ctx.currentTime);
      } catch {}
      return;
    }
    try {
      const source = ctx.createBufferSource();
      source.buffer = runAudioBuffer;
      source.loop = true;
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(targetVolume, ctx.currentTime);
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(0);
      activeRunSource = source;
      activeRunGain = gainNode;
      return;
    } catch {}
  }

  setupFallbackAudio("run");
  if (runAudioFallback) {
    try {
      runAudioFallback.volume = targetVolume;
      if (runAudioFallback.paused) {
        runAudioFallback.play().catch(() => {});
      }
    } catch {}
  }
}

function stopRunSound() {
  if (activeRunSource) {
    const src = activeRunSource;
    const gain = activeRunGain;
    activeRunSource = null;
    activeRunGain = null;
    const ctx = getAudioContext();
    if (ctx && gain) {
      try {
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        setTimeout(() => {
          try {
            src.stop();
            src.disconnect();
          } catch {}
        }, 50);
      } catch {
        try {
          src.stop();
          src.disconnect();
        } catch {}
      }
    } else {
      try {
        src.stop();
        src.disconnect();
      } catch {}
    }
  }

  if (runAudioFallback && !runAudioFallback.paused) {
    try {
      runAudioFallback.pause();
      runAudioFallback.currentTime = 0;
    } catch {}
  }
}

function stopAllRunSounds() {
  runningFighters.clear();
  stopRunSound();
}

function loadSpriteSheet(sheet) {
  sheet.image.onload = () => {
    try {
      const image = sheet.image;
      const frameWidth = image.naturalWidth / sheet.columns;
      const frameHeight = image.naturalHeight / sheet.rows;
      if (!Number.isFinite(frameWidth) || !Number.isFinite(frameHeight) || frameWidth <= 0 || frameHeight <= 0) {
        sheet.valid = false;
        return;
      }
      sheet.frameWidth = frameWidth;
      sheet.frameHeight = frameHeight;
      const transparency = inspectTransparency(image);
      sheet.transparency = transparency.hasAlpha ? "alpha" : "baked-or-opaque";
      sheet.source = transparency.hasAlpha ? image : (maskCheckerboard(image, transparency.cornerColors) || image);
      sheet.loaded = true;
      sheet.valid = Boolean(sheet.source);
    } catch (e) {
      console.warn("Falling back for sprite sheet:", sheet.path, e);
      sheet.frameWidth = sheet.image.naturalWidth / sheet.columns;
      sheet.frameHeight = sheet.image.naturalHeight / sheet.rows;
      sheet.source = sheet.image;
      sheet.loaded = true;
      sheet.valid = true;
    }
  };
  sheet.image.onerror = (e) => {
    console.error("Sprite load error:", sheet.path, e);
    sheet.loaded = true;
    sheet.valid = false;
  };
  sheet.image.src = sheet.path;
}

function inspectTransparency(image) {
  try {
    const probe = document.createElement("canvas");
    probe.width = image.naturalWidth;
    probe.height = image.naturalHeight;
    const probeCtx = probe.getContext("2d", { willReadFrequently: true });
    probeCtx.drawImage(image, 0, 0);
    const data = probeCtx.getImageData(0, 0, probe.width, probe.height).data;
    let hasAlpha = false;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 250) {
        hasAlpha = true;
        break;
      }
    }
    return {
      hasAlpha,
      cornerColors: [
        colorAt(probeCtx, 0, 0),
        colorAt(probeCtx, probe.width - 1, 0),
        colorAt(probeCtx, 0, probe.height - 1),
        colorAt(probeCtx, probe.width - 1, probe.height - 1)
      ]
    };
  } catch (err) {
    console.warn("inspectTransparency failed, using direct image:", err);
    return {
      hasAlpha: true,
      cornerColors: []
    };
  }
}


function colorAt(sourceCtx, x, y) {
  const data = sourceCtx.getImageData(x, y, 1, 1).data;
  return [data[0], data[1], data[2]];
}

function maskCheckerboard(image, cornerColors) {
  const sheet = document.createElement("canvas");
  sheet.width = image.naturalWidth;
  sheet.height = image.naturalHeight;
  const sheetCtx = sheet.getContext("2d", { willReadFrequently: true });
  sheetCtx.drawImage(image, 0, 0);
  const pixels = sheetCtx.getImageData(0, 0, sheet.width, sheet.height);
  const data = pixels.data;
  for (let i = 0; i < data.length; i += 4) {
    const color = [data[i], data[i + 1], data[i + 2]];
    if (cornerColors.some((corner) => colorDistance(color, corner) < 18)) {
      data[i + 3] = 0;
    }
  }
  sheetCtx.putImageData(pixels, 0, 0);
  return sheet;
}

function colorDistance(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
}

function drawArena() {
  if (arenaBackground.loaded || (arenaBackground.image.complete && arenaBackground.image.naturalWidth > 0)) {
    ctx.drawImage(arenaBackground.image, 0, 0, canvas.width, canvas.height);
    return;
  }
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, "#20272c");
  g.addColorStop(1, "#151719");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#293036";
  ctx.fillRect(0, 452, canvas.width, 88);
  ctx.strokeStyle = "rgba(139, 211, 208, 0.24)";
  ctx.lineWidth = 2;
  for (let x = 0; x < canvas.width; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 452);
    ctx.lineTo(x + 44, 540);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(90, 118, 780, 4);
  ctx.fillRect(130, 160, 700, 2);
}

function fighterCharacterId(f) {
  if (f.owner) return f.owner;
  if (f.id === "p1" || f.id === "p2") return f.id;
  if (typeof f.id === "string" && f.id.startsWith("echo-")) {
    return f.id.split("-")[1] || "p1";
  }
  return "p1";
}

function getPlayerDisplayName(ownerId) {
  if (ownerId === "p1") {
    const el = document.querySelector("#p1Name");
    return (el && el.textContent.trim()) ? el.textContent.trim() : "Player 1";
  }
  if (ownerId === "p2") {
    const el = document.querySelector("#p2Name");
    return (el && el.textContent.trim()) ? el.textContent.trim() : "Player 2";
  }
  return ownerId === "p1" ? "Player 1" : "Player 2";
}

function drawEchoLabel(f) {
  const owner = fighterCharacterId(f);
  const playerName = getPlayerDisplayName(owner);
  const text = `ECHO • ${playerName}`;
  const isP1 = owner === "p1";
  const accentColor = isP1 ? "#8bd3d0" : "#f0c15a";

  ctx.save();
  ctx.font = "bold 10px Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  const textWidth = ctx.measureText(text).width;
  const paddingX = 8;
  const badgeW = Math.round(textWidth + paddingX * 2);
  const badgeH = 18;
  const badgeX = Math.round(Math.max(8, Math.min(canvas.width - badgeW - 8, f.x - badgeW / 2)));
  const badgeY = Math.round(Math.max(12, f.y - 144));

  ctx.fillStyle = "rgba(12, 16, 20, 0.88)";
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
  ctx.fill();

  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 4;
  ctx.fillText(text, badgeX + badgeW / 2, badgeY + badgeH / 2);

  ctx.restore();
}

function drawFighter(f, color, echo) {
  updateFighterVisualState(f, echo);
  const rendered =
    drawCharacter1VictorySprite(f, echo) ||
    drawCharacter1DeathSprite(f, echo) ||
    drawCharacter1KnockbackSprite(f, echo) ||
    drawCharacter1BlockSprite(f, echo) ||
    drawCharacter1KickSprite(f, echo) ||
    drawCharacter1PunchSprite(f, echo) ||
    drawCharacter1LandSprite(f, echo) ||
    drawCharacter1JumpSprite(f, echo) ||
    drawCharacter1WalkSprite(f, echo) ||
    drawCharacter1IdleSprite(f, echo) ||
    drawCharacter2VictorySprite(f, echo) ||
    drawCharacter2DeathSprite(f, echo) ||
    drawCharacter2KnockbackSprite(f, echo) ||
    drawCharacter2BlockSprite(f, echo) ||
    drawCharacter2KickSprite(f, echo) ||
    drawCharacter2PunchSprite(f, echo) ||
    drawCharacter2LandSprite(f, echo) ||
    drawCharacter2JumpSprite(f, echo) ||
    drawCharacter2WalkSprite(f, echo) ||
    drawCharacter2IdleSprite(f, echo);

  if (!rendered) {
    drawProceduralFighter(f, color, echo);
  }

  if (echo || f.echo) {
    drawEchoLabel(f);
  }
}

function drawCharacter1VictorySprite(f, echo) {
  if (fighterCharacterId(f) !== "p1") return false;
  const isWinning = f.action === "victory" || (!echo && state && state.phase === "ended" && state.winner === f.id && f.hp > 0);
  if (!isWinning || !character1Victory.valid) return false;
  const visual = fighterVisualState.get(f.id);
  const elapsed = visual ? performance.now() - visual.startedAt : 0;
  const frameIndex = Math.min(character1Victory.sequence.length - 1, Math.floor(elapsed / character1Victory.frameMs));
  const frame = character1Victory.sequence[frameIndex];
  return drawCharacter1SpriteSheetFrame(f, character1Victory, frame, echo);
}

function drawCharacter1DeathSprite(f, echo) {
  if (fighterCharacterId(f) !== "p1") return false;
  if (f.hp > 0 && f.action !== "death") return false;
  if (!character1Death.valid) return false;
  const visual = fighterVisualState.get(f.id);
  const elapsed = visual ? performance.now() - visual.startedAt : 0;
  const frameIndex = Math.min(character1Death.sequence.length - 1, Math.floor(elapsed / character1Death.frameMs));
  const frame = character1Death.sequence[frameIndex];
  return drawCharacter1SpriteSheetFrame(f, character1Death, frame, echo);
}

function drawCharacter1KnockbackSprite(f, echo) {
  if (fighterCharacterId(f) !== "p1") return false;
  if (f.action !== "knockback" && f.action !== "hit") return false;
  if (!character1Knockback.valid) return false;
  const visual = fighterVisualState.get(f.id);
  const elapsed = visual ? performance.now() - visual.startedAt : 0;
  const frameIndex = Math.min(character1Knockback.sequence.length - 1, Math.floor(elapsed / character1Knockback.frameMs));
  const frame = character1Knockback.sequence[frameIndex];
  return drawCharacter1SpriteSheetFrame(f, character1Knockback, frame, echo);
}

function drawCharacter1BlockSprite(f, echo) {
  if (fighterCharacterId(f) !== "p1") return false;
  if (f.action !== "block" && !f.blocking) return false;
  if (!character1Block.valid) return false;
  const visual = fighterVisualState.get(f.id);
  const elapsed = visual ? performance.now() - visual.startedAt : 0;
  const frameIndex = Math.min(character1Block.sequence.length - 1, Math.floor(elapsed / character1Block.frameMs));
  const frame = character1Block.sequence[frameIndex];
  return drawCharacter1SpriteSheetFrame(f, character1Block, frame, echo);
}

function updateFighterVisualState(f, echo) {
  const key = f.id;
  const previous = fighterVisualState.get(key);
  const now = performance.now();
  const isDead = f.hp <= 0 || f.action === "death";
  const isVictory = !isDead && (f.action === "victory" || (state && state.phase === "ended" && state.winner === f.id && f.hp > 0));
  const effectiveAction = isDead ? "death" : isVictory ? "victory" : f.action;
  if (!previous) {
    fighterVisualState.set(key, {
      action: effectiveAction,
      startedAt: now,
      prevY: f.y,
      yVelocity: 0,
      landedAt: 0
    });
    return;
  }
  let landedAt = previous.landedAt || 0;
  if (
    (previous.action === "jump" || previous.action === "fall" || (previous.prevY != null && previous.prevY < 452)) &&
    f.y >= 452 &&
    f.action !== "jump" &&
    f.action !== "fall"
  ) {
    landedAt = now;
  }
  const dy = f.y - (previous.prevY ?? f.y);
  const yVelocity = dy !== 0 ? dy : (previous.yVelocity || 0);
  if (previous.action !== effectiveAction) {
    if (state && state.phase === "playing") {
      if (effectiveAction === "jump" && (previous.prevY == null || previous.prevY >= 445)) {
        playJumpSound(Boolean(echo));
      } else if (effectiveAction === "punch") {
        playPunchSound(Boolean(echo));
      } else if (effectiveAction === "kick") {
        playKickSound(Boolean(echo));
      } else if (effectiveAction === "block") {
        playBlockSound(Boolean(echo));
      }
    } else if (effectiveAction === "victory" && !echo && !matchEndSoundPlayed) {
      if (!playerId || playerId === f.id) {
        matchEndSoundPlayed = true;
        playVictorySound();
      }
    } else if (effectiveAction === "death" && !echo && !matchEndSoundPlayed) {
      if (!playerId || playerId === f.id) {
        matchEndSoundPlayed = true;
        playDefeatSound();
      }
    }
    fighterVisualState.set(key, {
      action: effectiveAction,
      startedAt: now,
      prevY: f.y,
      yVelocity,
      landedAt
    });
  } else {
    previous.prevY = f.y;
    previous.yVelocity = yVelocity;
    previous.landedAt = landedAt;
  }

  if (!echo && !isDead && state && state.phase === "playing") {
    if (effectiveAction === "run" && f.y >= 445) {
      runningFighters.add(f.id);
    } else {
      runningFighters.delete(f.id);
    }
    syncRunSound();
  } else if (runningFighters.has(f.id)) {
    runningFighters.delete(f.id);
    syncRunSound();
  }
}

function drawCharacter1IdleSprite(f, echo) {
  if (fighterCharacterId(f) !== "p1" || f.action !== "idle" || !character1Idle.valid) return false;
  const frame = currentIdleFrame();
  return drawCharacter1SpriteSheetFrame(f, character1Idle, frame, echo);
}

function drawCharacter2IdleSprite(f, echo) {
  if (fighterCharacterId(f) !== "p2" || f.action !== "idle" || !character2Idle.valid) return false;
  const frame = currentLoopFrame(character2Idle);
  return drawCharacter1SpriteSheetFrame(f, character2Idle, frame, echo);
}

function drawCharacter2WalkSprite(f, echo) {
  if (fighterCharacterId(f) !== "p2" || f.action !== "run" || !character2Walk.valid) return false;
  const visual = fighterVisualState.get(f.id);
  const elapsed = visual ? performance.now() - visual.startedAt : 0;
  const frame = currentTimedLoopFrame(character2Walk, elapsed);
  return drawCharacter1SpriteSheetFrame(f, character2Walk, frame, echo);
}

function drawCharacter2VictorySprite(f, echo) {
  if (fighterCharacterId(f) !== "p2") return false;
  const isWinning = f.action === "victory" || (!echo && state && state.phase === "ended" && state.winner === f.id && f.hp > 0);
  if (!isWinning || !character2Victory.valid) return false;
  const visual = fighterVisualState.get(f.id);
  const elapsed = visual ? performance.now() - visual.startedAt : 0;
  const frameIndex = Math.min(character2Victory.sequence.length - 1, Math.floor(elapsed / character2Victory.frameMs));
  const frame = character2Victory.sequence[frameIndex];
  return drawCharacter1SpriteSheetFrame(f, character2Victory, frame, echo);
}

function drawCharacter2DeathSprite(f, echo) {
  if (fighterCharacterId(f) !== "p2") return false;
  if (f.hp > 0 && f.action !== "death") return false;
  if (!character2Death.valid) return false;
  const visual = fighterVisualState.get(f.id);
  const elapsed = visual ? performance.now() - visual.startedAt : 0;
  const frameIndex = Math.min(character2Death.sequence.length - 1, Math.floor(elapsed / character2Death.frameMs));
  const frame = character2Death.sequence[frameIndex];
  return drawCharacter1SpriteSheetFrame(f, character2Death, frame, echo);
}

function drawCharacter2KnockbackSprite(f, echo) {
  if (fighterCharacterId(f) !== "p2") return false;
  if (f.action !== "knockback" && f.action !== "hit") return false;
  if (!character2Knockback.valid) return false;
  const visual = fighterVisualState.get(f.id);
  const elapsed = visual ? performance.now() - visual.startedAt : 0;
  const frameIndex = Math.min(character2Knockback.sequence.length - 1, Math.floor(elapsed / character2Knockback.frameMs));
  const frame = character2Knockback.sequence[frameIndex];
  return drawCharacter1SpriteSheetFrame(f, character2Knockback, frame, echo);
}

function drawCharacter2BlockSprite(f, echo) {
  if (fighterCharacterId(f) !== "p2") return false;
  if (f.action !== "block" && !f.blocking) return false;
  if (!character2Block.valid) return false;
  const visual = fighterVisualState.get(f.id);
  const elapsed = visual ? performance.now() - visual.startedAt : 0;
  const frameIndex = Math.min(character2Block.sequence.length - 1, Math.floor(elapsed / character2Block.frameMs));
  const frame = character2Block.sequence[frameIndex];
  return drawCharacter1SpriteSheetFrame(f, character2Block, frame, echo);
}

function drawCharacter2KickSprite(f, echo) {
  if (fighterCharacterId(f) !== "p2" || f.action !== "kick" || !character2Kick.valid) return false;
  const visual = fighterVisualState.get(f.id);
  const elapsed = visual ? performance.now() - visual.startedAt : 0;
  const frameIndex = Math.min(character2Kick.sequence.length - 1, Math.floor(elapsed / character2Kick.frameMs));
  const frame = character2Kick.sequence[frameIndex];
  return drawCharacter1SpriteSheetFrame(f, character2Kick, frame, echo);
}

function drawCharacter2PunchSprite(f, echo) {
  if (fighterCharacterId(f) !== "p2" || f.action !== "punch" || !character2Punch.valid) return false;
  const visual = fighterVisualState.get(f.id);
  const elapsed = visual ? performance.now() - visual.startedAt : 0;
  const frameIndex = Math.min(character2Punch.sequence.length - 1, Math.floor(elapsed / character2Punch.frameMs));
  const frame = character2Punch.sequence[frameIndex];
  return drawCharacter1SpriteSheetFrame(f, character2Punch, frame, echo);
}

function drawCharacter2LandSprite(f, echo) {
  if (fighterCharacterId(f) !== "p2" || !character2FallLand.valid) return false;
  const visual = fighterVisualState.get(f.id);
  const isExplicitLand = f.action === "land";
  const isLandingRecovery = f.action === "idle" && visual && visual.landedAt > 0 && performance.now() - visual.landedAt < 95;
  if (!isExplicitLand && !isLandingRecovery) return false;
  return drawCharacter1SpriteSheetFrame(f, character2FallLand, 1, echo);
}

function drawCharacter2JumpSprite(f, echo) {
  if (fighterCharacterId(f) !== "p2") return false;
  if (f.action !== "jump" && f.action !== "fall") return false;
  const visual = fighterVisualState.get(f.id);
  const elapsed = visual ? performance.now() - visual.startedAt : 0;
  const isFalling = f.action === "fall" || (character2FallLand.valid && visual && visual.yVelocity > 0 && elapsed > 260);
  if (isFalling && character2FallLand.valid) {
    return drawCharacter1SpriteSheetFrame(f, character2FallLand, 0, echo);
  }
  if (!character2Jump.valid) return false;
  const frameIndex = Math.min(character2Jump.sequence.length - 1, Math.floor(elapsed / character2Jump.frameMs));
  const frame = character2Jump.sequence[frameIndex];
  return drawCharacter1SpriteSheetFrame(f, character2Jump, frame, echo);
}

function drawCharacter1KickSprite(f, echo) {
  if (fighterCharacterId(f) !== "p1" || f.action !== "kick" || !character1Kick.valid) return false;
  const visual = fighterVisualState.get(f.id);
  const elapsed = visual ? performance.now() - visual.startedAt : 0;
  const frameIndex = Math.min(character1Kick.sequence.length - 1, Math.floor(elapsed / character1Kick.frameMs));
  const frame = character1Kick.sequence[frameIndex];
  return drawCharacter1SpriteSheetFrame(f, character1Kick, frame, echo);
}

function drawCharacter1PunchSprite(f, echo) {
  if (fighterCharacterId(f) !== "p1" || f.action !== "punch" || !character1Punch.valid) return false;
  const visual = fighterVisualState.get(f.id);
  const elapsed = visual ? performance.now() - visual.startedAt : 0;
  const frameIndex = Math.min(character1Punch.sequence.length - 1, Math.floor(elapsed / character1Punch.frameMs));
  const frame = character1Punch.sequence[frameIndex];
  return drawCharacter1SpriteSheetFrame(f, character1Punch, frame, echo);
}

function drawCharacter1LandSprite(f, echo) {
  if (fighterCharacterId(f) !== "p1" || !character1FallLand.valid) return false;
  const visual = fighterVisualState.get(f.id);
  const isExplicitLand = f.action === "land";
  const isLandingRecovery = f.action === "idle" && visual && visual.landedAt > 0 && performance.now() - visual.landedAt < 95;
  if (!isExplicitLand && !isLandingRecovery) return false;
  return drawCharacter1SpriteSheetFrame(f, character1FallLand, 1, echo);
}

function drawCharacter1JumpSprite(f, echo) {
  if (fighterCharacterId(f) !== "p1") return false;
  if (f.action !== "jump" && f.action !== "fall") return false;
  const visual = fighterVisualState.get(f.id);
  const elapsed = visual ? performance.now() - visual.startedAt : 0;
  const isFalling = f.action === "fall" || (character1FallLand.valid && visual && visual.yVelocity > 0 && elapsed > 260);
  if (isFalling && character1FallLand.valid) {
    return drawCharacter1SpriteSheetFrame(f, character1FallLand, 0, echo);
  }
  if (!character1Jump.valid) return false;
  const frameIndex = Math.min(character1Jump.sequence.length - 1, Math.floor(elapsed / character1Jump.frameMs));
  const frame = character1Jump.sequence[frameIndex];
  return drawCharacter1SpriteSheetFrame(f, character1Jump, frame, echo);
}

function drawCharacter1WalkSprite(f, echo) {
  if (fighterCharacterId(f) !== "p1" || f.action !== "run" || !character1Walk.valid) return false;
  const visual = fighterVisualState.get(f.id);
  const elapsed = visual ? performance.now() - visual.startedAt : 0;
  const frame = currentTimedLoopFrame(character1Walk, elapsed);
  return drawCharacter1SpriteSheetFrame(f, character1Walk, frame, echo);
}

function currentIdleFrame() {
  return currentLoopFrame(character1Idle);
}

function currentLoopFrame(sheet) {
  const index = Math.floor(performance.now() / sheet.frameMs) % sheet.sequence.length;
  return sheet.sequence[index];
}

function currentTimedLoopFrame(sheet, elapsed) {
  const index = Math.floor(elapsed / sheet.frameMs) % sheet.sequence.length;
  return sheet.sequence[index];
}

function drawCharacter1SpriteSheetFrame(f, sheet, frame, echo = false) {
  let sourceX = (frame % sheet.columns) * sheet.frameWidth;
  let sourceY = Math.floor(frame / sheet.columns) * sheet.frameHeight;
  let sourceW = sheet.frameWidth;
  let sourceH = sheet.frameHeight;
  if (sheet.frames && sheet.frames[frame]) {
    const custom = sheet.frames[frame];
    sourceX = custom.x;
    sourceY = custom.y ?? 0;
    sourceW = custom.w;
    sourceH = custom.h ?? (sheet.image.naturalHeight || sheet.frameHeight);
  }
  const targetH = sheet.targetH || 126;
  const targetW = targetH * (sourceW / sourceH);
  const targetX = sheet.targetX ?? (-targetW / 2);
  const targetY = sheet.targetY ?? (-targetH);
  ctx.save();
  const isEcho = Boolean(echo || f.echo);
  if (isEcho) {
    ctx.globalAlpha = 0.45;
  }
  ctx.translate(f.x, f.y);
  ctx.scale(f.face, 1);
  ctx.fillStyle = isEcho ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 8, 32, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  try {
    ctx.drawImage(sheet.source, sourceX, sourceY, sourceW, sourceH, targetX, targetY, targetW, targetH);
  } catch {
    ctx.restore();
    sheet.valid = false;
    return false;
  }
  ctx.restore();
  return true;
}

function drawProceduralFighter(f, color, echo) {
  ctx.save();
  ctx.globalAlpha = (echo || f.echo) ? 0.45 : 1;
  const x = f.x;
  const y = f.y;
  ctx.translate(x, y);
  ctx.scale(f.face, 1);
  ctx.fillStyle = (echo || f.echo) ? "rgba(139, 211, 208, 0.18)" : "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 8, 32, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  roundRect(-18, -78, 36, 58, 8);
  ctx.fill();
  ctx.fillStyle = echo ? "#effffc" : "#f4f0e8";
  roundRect(-14, -108, 28, 28, 8);
  ctx.fill();
  ctx.strokeStyle = f.blocking ? "#ffffff" : color;
  ctx.lineWidth = echo ? 5 : 7;
  limb(-15, -58, -31, -30);
  limb(15, -58, 31, -30);
  limb(-10, -20, -22, 0);
  limb(10, -20, 22, 0);
  if (f.action === "punch") limb(14, -58, 56, -56);
  if (f.action === "kick") limb(12, -21, 62, -24);
  if (echo) {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 7]);
    ctx.strokeRect(-25, -116, 50, 124);
  }
  ctx.restore();
}

function limb(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawSpark(spark) {
  ctx.save();
  ctx.translate(spark.x, spark.y);

  if (spark.kind === "kick" && (kickImpact.loaded || (kickImpact.image.complete && kickImpact.image.naturalWidth > 0))) {
    if (spark.face) {
      ctx.scale(spark.face, 1);
    }
    const maxLife = spark.maxLife || 0.28;
    const progress = Math.max(0, Math.min(1, 1 - (spark.life / maxLife)));
    const frameIndex = Math.min(kickImpact.frames.length - 1, Math.floor(progress * kickImpact.frames.length));
    const frame = kickImpact.frames[frameIndex];

    const scale = spark.blocked ? 0.82 : 1.15;
    const targetW = frame.w * scale;
    const targetH = frame.h * scale;

    let alpha = 1;
    if (frameIndex >= kickImpact.frames.length - 2) {
      alpha = Math.max(0, Math.min(1, spark.life / (maxLife * 0.25)));
    }
    if (spark.echo) alpha *= 0.75;
    ctx.globalAlpha = alpha;

    ctx.drawImage(
      kickImpact.image,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      -targetW / 2,
      -targetH / 2,
      targetW,
      targetH
    );
    ctx.restore();
    return;
  }

  const isPunch = spark.kind === "punch" || (!spark.kind && !spark.blocked);
  if (isPunch && (punchImpact.loaded || (punchImpact.image.complete && punchImpact.image.naturalWidth > 0))) {
    if (spark.face) {
      ctx.scale(spark.face, 1);
    }
    const maxLife = spark.maxLife || 0.24;
    const progress = Math.max(0, Math.min(1, 1 - (spark.life / maxLife)));
    const frameIndex = Math.min(punchImpact.frames.length - 1, Math.floor(progress * punchImpact.frames.length));
    const frame = punchImpact.frames[frameIndex];

    const scale = spark.blocked ? 0.78 : 1.1;
    const targetW = frame.w * scale;
    const targetH = frame.h * scale;

    let alpha = 1;
    if (frameIndex === punchImpact.frames.length - 1) {
      alpha = Math.max(0, Math.min(1, spark.life / (maxLife * 0.3)));
    }
    if (spark.echo) alpha *= 0.75;
    ctx.globalAlpha = alpha;

    ctx.drawImage(
      punchImpact.image,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      -targetW / 2,
      -targetH / 2,
      targetW,
      targetH
    );
    ctx.restore();
    return;
  }

  ctx.globalAlpha = Math.max(0, spark.life / 0.22);
  ctx.fillStyle = spark.blocked ? "#8bd3d0" : spark.echo ? "#f0c15a" : "#ffffff";
  for (let i = 0; i < 8; i++) {
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(0, -2, 28, 4);
  }
  ctx.restore();
}
