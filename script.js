const panels = [...document.querySelectorAll(".panel")];
const nextButtons = [...document.querySelectorAll("[data-next]")];
const prevButtons = [...document.querySelectorAll("[data-prev]")];
const jumpButtons = [...document.querySelectorAll("[data-jump]")];
const clueButtons = [...document.querySelectorAll("[data-clue]")];
const progressStars = [...document.querySelectorAll(".progress-star")];
const ledgerItems = [...document.querySelectorAll(".ledger-item")];
const locationButtons = [...document.querySelectorAll(".location-card")];
const clueStatus = document.getElementById("clue-status");
const locationStatus = document.getElementById("location-status");
const celebrateButton = document.getElementById("celebrate-button");
const revealPanel = document.querySelector(".reveal-panel");
const reunionPhotoWrap = document.querySelector(".reunion-photo-wrap");
const stage = document.querySelector(".birthday-stage");
const introPanel = document.querySelector(".intro-panel");
const portalButton = document.getElementById("portal-button");
const entryPortal = document.getElementById("entry-portal");
const portalDoorframe = document.getElementById("portal-doorframe");
const effectsLayer = document.getElementById("effects-layer");
const fireworksLayer = document.getElementById("fireworks-layer");
const petalLayer = document.getElementById("petal-layer");

let activePanel = 0;
let fireworkTimer = null;
const foundClues = new Set();
let selectedLocation = "";

const clueMessages = {
  1: "Premier secret: quelque chose fera entrer les etoiles dans la piece.",
  2: "Deuxieme secret: quelque chose de dore et chocolate t'attend aussi.",
  3: "Dernier secret: le tresor n'est pas chez toi, il a ete garde ailleurs dans le building.",
};

const palettes = [
  ["#ffd8e6", "#ffe9a8", "#fff7f0", "#b8f0e0"],
  ["#f0a7c2", "#e7cb85", "#ffdfe8", "#b5ead6"],
  ["#ffe7ef", "#fff1bb", "#d6fbef", "#ffc1d8"],
];

function getCelebrationScale() {
  return window.innerWidth < 700 ? 0.68 : 1;
}

function restartIntroConstellation() {
  if (!introPanel) {
    return;
  }

  introPanel.classList.remove("is-animating");
  void introPanel.offsetWidth;
  introPanel.classList.add("is-animating");
}

function openPortal() {
  if (!stage || stage.classList.contains("portal-open")) {
    return;
  }

  stage.classList.add("portal-open");
  stage.classList.remove("is-locked");
  restartIntroConstellation();

  window.setTimeout(() => {
    entryPortal?.setAttribute("hidden", "true");
  }, 1200);
}

function showPanel(index) {
  activePanel = index;
  panels.forEach((panel, panelIndex) => {
    panel.classList.toggle("is-active", panelIndex === index);
  });

  if (index !== 3) {
    revealPanel?.classList.remove("show-reunion-photo");
    reunionPhotoWrap?.setAttribute("aria-hidden", "true");
  }

  if (index === 0) {
    restartIntroConstellation();
  } else {
    introPanel?.classList.remove("is-animating");
  }
}

function updateClueState() {
  progressStars.forEach((star, index) => {
    star.classList.toggle("is-on", index < foundClues.size);
  });

  ledgerItems.forEach((item, index) => {
    item.classList.toggle("is-on", foundClues.has(index + 1));
  });

  const huntNextButton = panels[2].querySelector("[data-next]");
  const cluesComplete = foundClues.size === clueButtons.length;
  const complete = cluesComplete && selectedLocation === "conciergerie";

  huntNextButton.disabled = !complete;

  if (complete) {
    clueStatus.textContent =
      "Bouquet complet: tu as trouve le bon lieu. Il ne reste plus qu'a descendre recuperer ton tresor.";
    return;
  }

  if (foundClues.size === 0) {
    clueStatus.textContent =
      "Appuie sur les 3 indices pour completer le bouquet des secrets.";
    return;
  }

  const latestClue = [...foundClues].at(-1);
  clueStatus.textContent = clueMessages[latestClue];

  if (cluesComplete && selectedLocation !== "conciergerie") {
    clueStatus.textContent =
      "Les indices sont complets. Il faut maintenant choisir le bon lieu pour debloquer la suite.";
  }
}

function getEventPoint(event, fallbackElement) {
  if ("clientX" in event && "clientY" in event) {
    return { x: event.clientX, y: event.clientY };
  }

  const rect = fallbackElement.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function createBurst(x, y, palette = palettes[0], count = 12, distance = 58) {
  if (!effectsLayer) {
    return;
  }

  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * index) / count;
    const variance = 0.7 + Math.random() * 0.6;
    const dx = Math.cos(angle) * distance * variance;
    const dy = Math.sin(angle) * distance * variance;

    particle.className = "burst-particle";
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.background = `radial-gradient(circle, #fffdf8 0 26%, ${palette[index % palette.length]} 38%, transparent 72%)`;
    particle.style.boxShadow = `0 0 30px ${palette[index % palette.length]}`;
    particle.style.setProperty("--tx", `${dx}px`);
    particle.style.setProperty("--ty", `${dy}px`);
    particle.style.width = `${14 + Math.random() * 18}px`;
    particle.style.height = particle.style.width;

    effectsLayer.appendChild(particle);
    window.setTimeout(() => particle.remove(), 1000);
  }
}

function createFirework(x, y, palette = palettes[1], count = 18, distance = 120) {
  if (!fireworksLayer) {
    return;
  }

  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * index) / count;
    const variance = 0.72 + Math.random() * 0.6;
    const dx = Math.cos(angle) * distance * variance;
    const dy = Math.sin(angle) * distance * variance;

    particle.className = "firework-particle";
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.background = `radial-gradient(circle, #ffffff 0 28%, ${palette[index % palette.length]} 40%, transparent 78%)`;
    particle.style.boxShadow = `0 0 34px ${palette[index % palette.length]}`;
    particle.style.setProperty("--tx", `${dx}px`);
    particle.style.setProperty("--ty", `${dy}px`);
    particle.style.width = `${12 + Math.random() * 18}px`;
    particle.style.height = particle.style.width;

    fireworksLayer.appendChild(particle);
    window.setTimeout(() => particle.remove(), 1650);
  }
}

function createPetalBurst(x, y, count = 22, distance = 170) {
  if (!effectsLayer) {
    return;
  }

  const petalColors = ["#ffd8e6", "#ffe9a8", "#b8f0e0", "#fff7f0"];

  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * index) / count;
    const variance = 0.7 + Math.random() * 0.7;
    const dx = Math.cos(angle) * distance * variance;
    const dy = Math.sin(angle) * distance * variance;
    const size = 16 + Math.random() * 20;

    particle.className = "burst-particle";
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size * 1.35}px`;
    particle.style.borderRadius = "80% 10% 70% 20%";
    particle.style.background = `linear-gradient(180deg, #fff7f0, ${petalColors[index % petalColors.length]})`;
    particle.style.boxShadow = `0 0 26px ${petalColors[index % petalColors.length]}`;
    particle.style.setProperty("--tx", `${dx}px`);
    particle.style.setProperty("--ty", `${dy}px`);

    effectsLayer.appendChild(particle);
    window.setTimeout(() => particle.remove(), 1000);
  }
}

function createShockwave(x, y, color = "rgba(255, 240, 193, 0.9)") {
  if (!effectsLayer) {
    return;
  }

  const ring = document.createElement("span");
  ring.className = "shockwave-ring";
  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;
  ring.style.borderColor = color;
  ring.style.boxShadow = `0 0 34px ${color}, inset 0 0 18px rgba(255,255,255,0.28)`;

  effectsLayer.appendChild(ring);
  window.setTimeout(() => ring.remove(), 1550);
}

function createHeartBurst(x, y, count = 12, spreadX = 160, riseY = 220) {
  if (!effectsLayer) {
    return;
  }

  const heartColors = ["#ffd4de", "#fff1bb", "#ffc7da", "#fff8f1"];

  for (let index = 0; index < count; index += 1) {
    const heart = document.createElement("span");
    const dx = (Math.random() - 0.5) * spreadX;
    const dy = -(120 + Math.random() * riseY);

    heart.className = "heart-particle";
    heart.textContent = "❤";
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.color = heartColors[index % heartColors.length];
    heart.style.setProperty("--tx", `${dx}px`);
    heart.style.setProperty("--ty", `${dy}px`);
    heart.style.fontSize = `${22 + Math.random() * 22}px`;

    effectsLayer.appendChild(heart);
    window.setTimeout(() => heart.remove(), 3250);
  }
}

function createRoyalPetalRain(count = 28) {
  if (!effectsLayer) {
    return;
  }

  const petalColors = ["#ffd8e6", "#ffe9a8", "#b8f0e0", "#fff7f0", "#ffcce0"];

  for (let index = 0; index < count; index += 1) {
    const petal = document.createElement("span");
    const x = Math.random() * window.innerWidth;
    const y = window.innerHeight * (0.12 + Math.random() * 0.3);
    const dx = (Math.random() - 0.5) * 260;
    const dy = 220 + Math.random() * 320;
    const size = 18 + Math.random() * 20;

    petal.className = "royal-petal";
    petal.style.left = `${x}px`;
    petal.style.top = `${y}px`;
    petal.style.width = `${size}px`;
    petal.style.height = `${size * 1.45}px`;
    petal.style.background = `linear-gradient(180deg, #fff7f0, ${petalColors[index % petalColors.length]})`;
    petal.style.boxShadow = `0 0 24px ${petalColors[index % petalColors.length]}`;
    petal.style.setProperty("--tx", `${dx}px`);
    petal.style.setProperty("--ty", `${dy}px`);
    petal.style.animationDelay = `${Math.random() * 120}ms`;

    effectsLayer.appendChild(petal);
    window.setTimeout(() => petal.remove(), 2650);
  }
}

function createRoyalBloom(x, y, palette) {
  createShockwave(x, y, palette[1]);
  createBurst(x, y, palette, 40, 220);
  createFirework(x, y, palette, 44, 320);
  createPetalBurst(x, y, 26, 180);
  createHeartBurst(x, y, 10, 180, 240);
}

function launchCelebrationSequence() {
  stage.classList.add("celebration");
  const scale = getCelebrationScale();

  const salvos = window.innerWidth < 700
    ? [
        { x: window.innerWidth * 0.18, y: window.innerHeight * 0.24, palette: palettes[0] },
        { x: window.innerWidth * 0.78, y: window.innerHeight * 0.2, palette: palettes[1] },
        { x: window.innerWidth * 0.24, y: window.innerHeight * 0.48, palette: palettes[2] },
        { x: window.innerWidth * 0.76, y: window.innerHeight * 0.48, palette: palettes[1] },
        { x: window.innerWidth * 0.5, y: window.innerHeight * 0.34, palette: palettes[0] },
      ]
    : [
        { x: window.innerWidth * 0.2, y: window.innerHeight * 0.24, palette: palettes[0] },
        { x: window.innerWidth * 0.75, y: window.innerHeight * 0.18, palette: palettes[1] },
        { x: window.innerWidth * 0.52, y: window.innerHeight * 0.34, palette: palettes[2] },
        { x: window.innerWidth * 0.32, y: window.innerHeight * 0.46, palette: palettes[1] },
        { x: window.innerWidth * 0.82, y: window.innerHeight * 0.42, palette: palettes[0] },
        { x: window.innerWidth * 0.12, y: window.innerHeight * 0.5, palette: palettes[2] },
        { x: window.innerWidth * 0.9, y: window.innerHeight * 0.54, palette: palettes[1] },
      ];

  salvos.forEach((burst, index) => {
    window.setTimeout(() => {
      createShockwave(burst.x, burst.y, burst.palette[1]);
      createBurst(burst.x, burst.y, burst.palette, Math.round(34 * scale), 180 * scale);
      createFirework(burst.x, burst.y, burst.palette, Math.round(36 * scale), 280 * scale);
      createPetalBurst(burst.x, burst.y, Math.round(22 * scale), 170 * scale);
      createHeartBurst(burst.x, burst.y, Math.max(6, Math.round(10 * scale)), 160 * scale, 180 * scale);
    }, index * 260);
  });

  window.setTimeout(() => {
    createRoyalBloom(window.innerWidth * 0.5, window.innerHeight * 0.54, palettes[2]);
    createRoyalPetalRain(Math.round(36 * scale));
    createHeartBurst(window.innerWidth * 0.5, window.innerHeight * 0.56, Math.round(18 * scale), 220 * scale, 260 * scale);
  }, 1200);

  window.setTimeout(() => {
    createRoyalBloom(window.innerWidth * 0.38, window.innerHeight * 0.34, palettes[0]);
    createRoyalBloom(window.innerWidth * 0.64, window.innerHeight * 0.32, palettes[1]);
  }, 2050);

  window.setTimeout(() => {
    createRoyalPetalRain(Math.round(44 * scale));
    createHeartBurst(window.innerWidth * 0.5, window.innerHeight * 0.44, Math.round(22 * scale), 280 * scale, 320 * scale);
    createShockwave(window.innerWidth * 0.5, window.innerHeight * 0.42, "rgba(255, 225, 168, 0.92)");
  }, 3000);

  window.setTimeout(() => {
    createRoyalBloom(window.innerWidth * 0.5, window.innerHeight * 0.46, palettes[1]);
    createRoyalPetalRain(Math.round(54 * scale));
    createHeartBurst(window.innerWidth * 0.5, window.innerHeight * 0.48, Math.round(28 * scale), 340 * scale, 360 * scale);
  }, 4050);

  if (fireworkTimer) {
    window.clearTimeout(fireworkTimer);
  }

  fireworkTimer = window.setTimeout(() => {
    stage.classList.remove("celebration");
  }, 6200);
}

function buildPetals() {
  if (!petalLayer) {
    return;
  }

  const petalCount = window.innerWidth < 700 ? 10 : 18;
  petalLayer.replaceChildren();

  for (let index = 0; index < petalCount; index += 1) {
    const petal = document.createElement("span");
    const variants = ["", "petal-mint", "petal-cream"];
    const delay = Math.random() * -12;
    const duration = 11 + Math.random() * 11;
    const drift = `${Math.round((Math.random() - 0.5) * 140)}px`;
    const width = 12 + Math.random() * 10;
    const height = width * (1.35 + Math.random() * 0.2);

    petal.className = `petal ${variants[index % variants.length]}`.trim();
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.animationDelay = `${delay}s`;
    petal.style.animationDuration = `${duration}s`;
    petal.style.setProperty("--petal-drift", drift);
    petal.style.width = `${width}px`;
    petal.style.height = `${height}px`;

    petalLayer.appendChild(petal);
  }
}

function handleBurstClick(event) {
  const target = event.currentTarget;
  const point = getEventPoint(event, target);
  const palette = target.classList.contains("clue-card") ? palettes[2] : palettes[0];
  const count = target.classList.contains("clue-card") ? 18 : 14;
  const distance = target.classList.contains("clue-card") ? 92 : 76;
  createBurst(point.x, point.y, palette, count, distance);
}

function updateLocationState(choice) {
  selectedLocation = choice;

  locationButtons.forEach((button) => {
    const isSelected = button.dataset.location === choice;
    button.classList.toggle("is-selected", isSelected);
    button.classList.remove("is-correct", "is-wrong");
  });

  if (choice === "conciergerie") {
    locationStatus.textContent =
      "Bien vu. C'est exactement le genre d'endroit discret ou un tresor peut attendre.";
    locationButtons
      .find((button) => button.dataset.location === choice)
      ?.classList.add("is-correct");
  } else if (choice) {
    locationStatus.textContent =
      "Joli essai, mais ce lieu est trop evident. La haute societe a choisi quelque chose de plus officiel.";
    locationButtons
      .find((button) => button.dataset.location === choice)
      ?.classList.add("is-wrong");
  } else {
    locationStatus.textContent =
      "Choisis le lieu ou la haute societe aurait depose ton tresor.";
  }

  updateClueState();
}

nextButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    handleBurstClick(event);
    const panel = button.closest(".panel");
    const current = Number(panel.dataset.panel);
    showPanel(Math.min(current + 1, panels.length - 1));
  });
});

prevButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    handleBurstClick(event);
    const panel = button.closest(".panel");
    const current = Number(panel.dataset.panel);
    showPanel(Math.max(current - 1, 0));
  });
});

jumpButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    handleBurstClick(event);
    showPanel(Number(button.dataset.jump));
  });
});

clueButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    handleBurstClick(event);

    const clueId = Number(button.dataset.clue);
    if (!foundClues.has(clueId)) {
      foundClues.add(clueId);
    }

    button.classList.add("is-found");
    updateClueState();
  });
});

locationButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    handleBurstClick(event);
    updateLocationState(button.dataset.location);
  });
});

celebrateButton?.addEventListener("click", (event) => {
  const point = getEventPoint(event, celebrateButton);
  const scale = getCelebrationScale();
  revealPanel?.classList.add("show-reunion-photo");
  reunionPhotoWrap?.setAttribute("aria-hidden", "false");
  createShockwave(point.x, point.y, "rgba(255, 225, 168, 0.92)");
  createBurst(point.x, point.y, palettes[1], Math.round(32 * scale), 140 * scale);
  createPetalBurst(point.x, point.y, Math.round(28 * scale), 150 * scale);
  createHeartBurst(point.x, point.y, Math.round(14 * scale), 150 * scale, 200 * scale);
  launchCelebrationSequence();
});

portalButton?.addEventListener("click", (event) => {
  handleBurstClick(event);
  createShockwave(
    window.innerWidth * 0.5,
    window.innerHeight * 0.46,
    "rgba(255, 225, 168, 0.92)",
  );
  openPortal();
});

portalDoorframe?.addEventListener("click", () => {
  createShockwave(
    window.innerWidth * 0.5,
    window.innerHeight * 0.46,
    "rgba(255, 225, 168, 0.92)",
  );
  openPortal();
});

portalDoorframe?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    createShockwave(
      window.innerWidth * 0.5,
      window.innerHeight * 0.46,
      "rgba(255, 225, 168, 0.92)",
    );
    openPortal();
  }
});

window.addEventListener("resize", () => {
  buildPetals();
});

buildPetals();
updateClueState();
showPanel(activePanel);
