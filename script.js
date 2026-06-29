/* =========================================================
   CAKE CLICKER — script.js
   Toute la logique du jeu : données, état, calculs, rendu,
   sauvegarde et sons (synthétisés, aucun fichier audio requis).
   ========================================================= */

/* ----------------------------------------------------------
   1. DONNÉES DU JEU
   ---------------------------------------------------------- */

// Bâtiments : type "click" => bonus permanent sur le gain par clic
//             type "cps"   => production passive ($/seconde), ce sont les "employés"
const BUILDINGS = [
  { id: "apprenti",      name: "Apprenti pâtissier",        icon: "🧑‍🍳", type: "cps",   basePrice: 15,         baseValue: 0.1,
    desc: "Un débutant maladroit mais motivé." },
  { id: "fouet",         name: "Mini-fouet enchanté",       icon: "🥄", type: "click", basePrice: 60,         baseValue: 0.5,
    desc: "Fouette la pâte tout seul, ajoute du peps à vos clics." },
  { id: "stand",         name: "Stand de gâteaux",          icon: "🍰", type: "cps",   basePrice: 120,        baseValue: 1,
    desc: "Vend des parts au coin de la rue." },
  { id: "boulangere",    name: "Boulangère du quartier",    icon: "👩‍🌾", type: "cps",   basePrice: 600,        baseValue: 5,
    desc: "Pétrit la pâte depuis 20 ans, les yeux fermés." },
  { id: "spatule",       name: "Spatule dorée",             icon: "✨", type: "click", basePrice: 1200,       baseValue: 3,
    desc: "Chaque coup de spatule rapporte un peu plus." },
  { id: "camion",        name: "Camion à gâteaux",          icon: "🚚", type: "cps",   basePrice: 3000,       baseValue: 12,
    desc: "Livre des gâteaux dans toute la ville." },
  { id: "patissier",     name: "Pâtissier professionnel",   icon: "👨‍🍳", type: "cps",   basePrice: 8000,       baseValue: 30,
    desc: "Diplômé du CAP pâtisserie, mention très bien." },
  { id: "atelier",       name: "Atelier de glaçage",        icon: "🎨", type: "click", basePrice: 16000,      baseValue: 9,
    desc: "Des décorations plus belles, des clics plus payants." },
  { id: "chaine",        name: "Chaîne de production",      icon: "🏭", type: "cps",   basePrice: 35000,      baseValue: 70,
    desc: "Des gâteaux à la chaîne, jour et nuit." },
  { id: "boulangerieInd",name: "Boulangerie industrielle",  icon: "🏢", type: "cps",   basePrice: 80000,      baseValue: 150,
    desc: "Des fours par centaines." },
  { id: "labo",          name: "Laboratoire de saveurs",    icon: "🧪", type: "click", basePrice: 150000,     baseValue: 28,
    desc: "Des arômes si bons que chaque clic en profite." },
  { id: "drone",         name: "Drone livreur",             icon: "🚁", type: "cps",   basePrice: 300000,     baseValue: 450,
    desc: "Livraison de gâteaux par les airs." },
  { id: "usine",         name: "Usine à gâteaux",           icon: "🏗️", type: "cps",   basePrice: 650000,     baseValue: 950,
    desc: "Une usine entièrement dédiée au gâteau." },
  { id: "supermarche",   name: "Supermarché du gâteau",     icon: "🏬", type: "cps",   basePrice: 1300000,    baseValue: 1900,
    desc: "Un magasin, un seul rayon : le gâteau." },
  { id: "distribution",  name: "Centre de distribution",    icon: "📦", type: "cps",   basePrice: 2800000,    baseValue: 4000,
    desc: "Optimise la logistique sucrée mondiale." },
  { id: "mamie",         name: "Recette secrète de mamie",  icon: "👵", type: "click", basePrice: 5000000,    baseValue: 100,
    desc: "Un secret de famille jalousement gardé." },
  { id: "mega",          name: "Méga-boulangerie",          icon: "🏰", type: "cps",   basePrice: 10000000,   baseValue: 17000,
    desc: "Visible depuis l'espace, ça sent bon depuis l'espace aussi." },
  { id: "portail",       name: "Portail sucré",             icon: "🌌", type: "cps",   basePrice: 22000000,   baseValue: 40000,
    desc: "Ouvre un passage vers une dimension faite de sucre." },
  { id: "ia",            name: "IA pâtissière",             icon: "🤖", type: "cps",   basePrice: 48000000,   baseValue: 95000,
    desc: "A appris la pâtisserie en un milliardième de seconde." },
  { id: "singularite",   name: "Singularité du gâteau",     icon: "💥", type: "cps",   basePrice: 300000000,  baseValue: 230000,
    desc: "L'univers entier n'est plus que gâteau." },
];

// Améliorations : achat unique, effets variés
const UPGRADES = [
  { id: "plus_de_sucre", name: "Plus de sucre !", icon: "🍬", price: 750,
    desc: "Double le gain de base de chaque clic.",
    effect: (s) => { s.clickBaseMult *= 2; } },

  { id: "meilleur_four", name: "Meilleur four", icon: "🔥", price: 1800,
    desc: "Réduit le temps entre deux clics à 0.75s.",
    effect: (s) => { s.cooldown = Math.min(s.cooldown, 0.75); } },

  { id: "cafe_employes", name: "Café pour les employés", icon: "☕", price: 4000,
    desc: "Vos employés travaillent x1.3 plus vite, caféine oblige.",
    effect: (s) => { s.cpsMult *= 1.3; } },

  { id: "conseil_mamie", name: "Conseil de mamie", icon: "👵", price: 12000,
    desc: "x1.5 sur les bâtiments, les employés et le clic.",
    effect: (s) => { s.globalMult *= 1.5; } },

  { id: "four_pro", name: "Four professionnel", icon: "🔥", price: 20000,
    desc: "Réduit le temps entre deux clics à 0.40s.",
    effect: (s) => { s.cooldown = Math.min(s.cooldown, 0.40); } },

  { id: "recette_secrete", name: "Recette de grand-mère secrète", icon: "📜", price: 35000,
    desc: "x1.5 sur le gain de base par clic.",
    effect: (s) => { s.clickBaseMult *= 1.5; } },

  { id: "glacage_royal", name: "Glaçage royal", icon: "👑", price: 60000,
    desc: "x1.4 sur la production de tous les employés.",
    effect: (s) => { s.cpsMult *= 1.4; } },

  { id: "coup_critique", name: "Coup de fourchette critique", icon: "🍴", price: 90000,
    desc: "5% de chance qu'un clic rapporte x5.",
    effect: (s) => { s.critChance += 0.05; } },

  { id: "sucre_cristallise", name: "Sucre cristallisé", icon: "💎", price: 150000,
    desc: "x1.5 sur le bonus de clic apporté par les bâtiments.",
    effect: (s) => { s.buildingClickMult *= 1.5; } },

  { id: "four_lave", name: "Four à lave basaltique", icon: "🌋", price: 300000,
    desc: "Supprime totalement le temps d'attente entre deux clics.",
    effect: (s) => { s.cooldown = 0; } },

  { id: "pate_feuilletee", name: "Pâte feuilletée infinie", icon: "🥐", price: 600000,
    desc: "x1.3 sur les bâtiments, les employés et le clic.",
    effect: (s) => { s.globalMult *= 1.3; } },

  { id: "alchimie_sucree", name: "Alchimie sucrée", icon: "⚗️", price: 1200000,
    desc: "x2 sur la production de tous les employés.",
    effect: (s) => { s.cpsMult *= 2; } },

  { id: "benediction_doree", name: "Bénédiction du gâteau doré", icon: "🌟", price: 2500000,
    desc: "x1.5 sur les bâtiments, les employés et le clic.",
    effect: (s) => { s.globalMult *= 1.5; } },

  { id: "singularite_patissiere", name: "Singularité pâtissière", icon: "♾️", price: 18000000,
    desc: "x2 sur les bâtiments, les employés et le clic. Le bonus ultime.",
    effect: (s) => { s.globalMult *= 2; } },
];

// Gâteaux (skins) : cosmétique + multiplicateur de clic. "Gâteau moisi" est gratuit et possédé au départ.
const SKINS = [
  { id: "moisi",   name: "Gâteau moisi",          icon: "🦠", price: 0,       mult: 1,
    desc: "Le tout premier gâteau. Personne ne sait depuis quand il est là." },
  { id: "chocolat",name: "Gâteau au chocolat",    icon: "🍫", price: 5000,    mult: 1.2,
    desc: "Un classique riche et fondant. x1.2 sur le gain par clic." },
  { id: "fraise",  name: "Gâteau à la fraise",    icon: "🍓", price: 25000,   mult: 1.4,
    desc: "Frais et fruité. x1.4 sur le gain par clic." },
  { id: "chocBlanc",name:"Gâteau au chocolat blanc", icon: "🤍", price: 120000, mult: 1.7,
    desc: "Doux et délicat. x1.7 sur le gain par clic." },
  { id: "parisBrest", name: "Gâteau paris-brest", icon: "🌰", price: 600000,  mult: 2.2,
    desc: "Praliné et noisettes. x2.2 sur le gain par clic." },
  { id: "dore",    name: "Gâteau doré",           icon: "👑", price: 3000000, mult: 3,
    desc: "Le gâteau ultime, recouvert de feuille d'or. x3 sur le gain par clic." },
];

const GROWTH = 1.15; // augmentation du prix d'un bâtiment à chaque achat

// Chaîne de bonus de renaissance (rebirth) : achat obligatoirement dans l'ordre,
// chaque nœud a 5 niveaux, payés en points de renaissance. Les bonus sont permanents
// et s'appliquent dès le début de chaque nouvelle partie après une renaissance.
const REBIRTH_CHAIN = [
  {
    id: "capital", name: "Capital de départ", icon: "💰", effectKey: "startMoney", baseValue: 0,
    levels: [
      { cost: 1, value: 50 },
      { cost: 2, value: 100 },
      { cost: 4, value: 250 },
      { cost: 7, value: 600 },
      { cost: 12, value: 1500 },
    ],
    describe: (v) => `Commencer chaque partie avec ${formatMoney(v)}`,
  },
  {
    id: "elan", name: "Élan initial", icon: "⚡", effectKey: "clickMult", baseValue: 1,
    levels: [
      { cost: 2, value: 1.1 },
      { cost: 4, value: 1.2 },
      { cost: 7, value: 1.35 },
      { cost: 12, value: 1.5 },
      { cost: 20, value: 1.75 },
    ],
    describe: (v) => `x${v} sur le gain par clic, dès le début de la partie`,
  },
  {
    id: "production", name: "Production accélérée", icon: "🏭", effectKey: "cpsMult", baseValue: 1,
    levels: [
      { cost: 2, value: 1.1 },
      { cost: 4, value: 1.2 },
      { cost: 7, value: 1.35 },
      { cost: 12, value: 1.5 },
      { cost: 20, value: 1.75 },
    ],
    describe: (v) => `x${v} sur la production passive, dès le début de la partie`,
  },
  {
    id: "four", name: "Four rapide", icon: "🔥", effectKey: "startCooldown", baseValue: 1.2,
    levels: [
      { cost: 3, value: 1.1 },
      { cost: 6, value: 1.0 },
      { cost: 10, value: 0.9 },
      { cost: 16, value: 0.8 },
      { cost: 25, value: 0.7 },
    ],
    describe: (v) => `Cooldown de base réduit à ${v}s (avant toute amélioration en jeu)`,
  },
  {
    id: "apprentis", name: "Bâtiments gratuits", icon: "🧑‍🍳", effectKey: "freeApprentis", baseValue: 0,
    levels: [
      { cost: 3, value: 1 },
      { cost: 6, value: 3 },
      { cost: 10, value: 6 },
      { cost: 16, value: 10 },
      { cost: 25, value: 15 },
    ],
    describe: (v) => `Commencer avec ${v} Apprenti(s) pâtissier(s) gratuit(s)`,
  },
  {
    id: "critique", name: "Chance critique éternelle", icon: "🍴", effectKey: "critBonus", baseValue: 0,
    levels: [
      { cost: 4, value: 0.01 },
      { cost: 8, value: 0.02 },
      { cost: 14, value: 0.03 },
      { cost: 22, value: 0.05 },
      { cost: 35, value: 0.08 },
    ],
    describe: (v) => `+${Math.round(v * 100)}% de chance de coup critique, dès le début`,
  },
  {
    id: "heritage", name: "Richesse héritée", icon: "🏺", effectKey: "keepPct", baseValue: 0,
    levels: [
      { cost: 5, value: 0.05 },
      { cost: 10, value: 0.10 },
      { cost: 18, value: 0.15 },
      { cost: 28, value: 0.20 },
      { cost: 45, value: 0.25 },
    ],
    describe: (v) => `Conserve ${Math.round(v * 100)}% de votre argent après une renaissance`,
  },
  {
    id: "maitre", name: "Maître pâtissier", icon: "👑", effectKey: "globalMult", baseValue: 1,
    levels: [
      { cost: 10, value: 1.2 },
      { cost: 20, value: 1.5 },
      { cost: 35, value: 2 },
      { cost: 55, value: 3 },
      { cost: 90, value: 5 },
    ],
    describe: (v) => `x${v} sur absolument tout (bâtiments, employés, clic), dès le début`,
  },
];

/* ----------------------------------------------------------
   2. ÉTAT DU JEU
   ---------------------------------------------------------- */

const SLOT_COUNT = 5;
const SAVE_PREFIX = "cakeClickerSave_v1_slot";
const ACTIVE_SLOT_KEY = "cakeClickerActiveSlot";
const LEGACY_SAVE_KEY = "cakeClickerSave_v1"; // ancienne sauvegarde unique, avant les emplacements

function slotKey(n) { return SAVE_PREFIX + n; }

function getActiveSlot() {
  const n = parseInt(localStorage.getItem(ACTIVE_SLOT_KEY), 10);
  return (n >= 1 && n <= SLOT_COUNT) ? n : 1;
}
function setActiveSlot(n) {
  try { localStorage.setItem(ACTIVE_SLOT_KEY, String(n)); } catch (e) { /* ignore */ }
}

// Récupère automatiquement une éventuelle ancienne sauvegarde (avant l'ajout des emplacements)
// vers l'emplacement 1, pour ne pas perdre la progression existante.
function migrateLegacySave() {
  try {
    const legacy = localStorage.getItem(LEGACY_SAVE_KEY);
    if (legacy && !localStorage.getItem(slotKey(1))) {
      localStorage.setItem(slotKey(1), legacy);
    }
    if (legacy) localStorage.removeItem(LEGACY_SAVE_KEY);
  } catch (e) { /* ignore */ }
}
migrateLegacySave();

let activeSlot = getActiveSlot();

function defaultState() {
  return {
    money: 0,
    totalClicks: 0,
    totalEarned: 0,
    lastClickTime: 0,
    owned: Object.fromEntries(BUILDINGS.map(b => [b.id, 0])),
    upgradesBought: [],
    skinsOwned: ["moisi"],
    currentSkin: "moisi",
    musicOn: true,
    sfxOn: true,
    musicTrack: "house1", // house1 | house2 | house3 | house4
    // --- Renaissance (rebirth) ---
    rebirthPoints: 0,
    rebirthTree: {},   // { [nodeId]: niveau actuel (0 à 5) }
    rebirthCount: 0,
    // --- Effets temporaires (bonus / malus aléatoires), sauvegardés : ils survivent à un rechargement ---
    tempEffects: {
      noCooldownUntil: 0,      // bonus "curseur" : clic sans cooldown
      cooldownPenaltyUntil: 0, // malus : cooldown rallongé à 2.5s
      skinLockUntil: 0,        // malus : gâteau forcé sur "Gâteau moisi"
    },
    tempBuildingMods: {}, // { [buildingId]: { mult, until } }
    // valeurs calculées par recomputeStats() à partir des achats ci-dessus
    cooldown: 1.2,
    clickBaseMult: 1,
    cpsMult: 1,
    globalMult: 1,
    buildingClickMult: 1,
    critChance: 0,
  };
}

let state = loadGame(activeSlot) || defaultState();

// Statistiques dérivées, recalculées après chaque achat
let stats = { clickPower: 1, cps: 0 };

/* ----------------------------------------------------------
   2bis. EFFETS TEMPORAIRES (bonus / malus aléatoires)
   Stockés dans state.tempEffects / state.tempBuildingMods :
   ils sont sauvegardés et survivent donc à un rechargement de page.
   ---------------------------------------------------------- */

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function pickRandomBuilding() {
  const owned = BUILDINGS.filter(b => (state.owned[b.id] || 0) > 0);
  return pickRandom(owned.length > 0 ? owned : BUILDINGS);
}

/* ----------------------------------------------------------
   2ter. RENAISSANCE (REBIRTH)
   ---------------------------------------------------------- */

// Valeur actuelle de chaque bonus de la chaîne, selon le niveau atteint
function getRebirthBonuses() {
  const bonuses = {};
  for (const node of REBIRTH_CHAIN) {
    const level = (state.rebirthTree && state.rebirthTree[node.id]) || 0;
    bonuses[node.effectKey] = level > 0 ? node.levels[level - 1].value : node.baseValue;
  }
  return bonuses;
}

// Points de renaissance gagnés si le joueur renaît maintenant, basés sur le nombre
// total de bâtiments possédés et le nombre d'améliorations achetées cette partie
function calculateRebirthGain() {
  const totalBuildings = Object.values(state.owned).reduce((sum, n) => sum + n, 0);
  const totalUpgrades = state.upgradesBought.length;
  return Math.floor(Math.sqrt(totalBuildings) * 3 + totalUpgrades * 8);
}

function performRebirth() {
  const gain = calculateRebirthGain();
  if (gain <= 0) {
    alert("Pas encore assez de progression pour gagner des points de renaissance : achetez d'abord des bâtiments et des améliorations !");
    return;
  }
  const ok = confirm(
    `Renaître maintenant vous rapportera ${gain} points de renaissance.\n\n` +
    `Votre argent, vos bâtiments, vos améliorations et vos gâteaux seront remis à zéro. ` +
    `Vos points et votre chaîne de renaissance restent acquis pour toujours, ainsi que vos emplacements de sauvegarde.\n\n` +
    `Confirmer la renaissance ?`
  );
  if (!ok) return;

  const rb = getRebirthBonuses();
  const keepMoney = state.money * rb.keepPct;

  const preserved = {
    rebirthPoints: (state.rebirthPoints || 0) + gain,
    rebirthTree: state.rebirthTree,
    rebirthCount: (state.rebirthCount || 0) + 1,
    musicOn: state.musicOn,
    sfxOn: state.sfxOn,
    musicTrack: state.musicTrack,
    totalClicks: state.totalClicks,
    totalEarned: state.totalEarned,
  };

  state = Object.assign(defaultState(), preserved);
  state.money = rb.startMoney + keepMoney;
  if (rb.freeApprentis > 0) state.owned["apprenti"] = rb.freeApprentis;
  // note : defaultState() réinitialise déjà les effets temporaires (bonus/malus en cours)

  recomputeStats();
  fullRender();
  renderSlotsBar();
  showNotification("bonus", "🔄", `Renaissance réussie ! +${formatNumber(gain)} points de renaissance.`);
  saveGame();
}

function levelUpChainNode(id) {
  const index = REBIRTH_CHAIN.findIndex(n => n.id === id);
  if (index === -1) return;
  const node = REBIRTH_CHAIN[index];
  const level = (state.rebirthTree[id] || 0);
  if (level >= node.levels.length) return; // déjà au niveau max

  if (index > 0) {
    const prevLevel = state.rebirthTree[REBIRTH_CHAIN[index - 1].id] || 0;
    if (prevLevel < 1) return; // verrouillé : le nœud précédent doit être débloqué
  }

  const cost = node.levels[level].cost;
  if (state.rebirthPoints < cost) return;

  state.rebirthPoints -= cost;
  state.rebirthTree[id] = level + 1;
  Sound.playUpgrade();
  recomputeStats();
  renderRebirthTab();
  renderTopBar();
  saveGame();
}

function recomputeStats() {
  const now = Date.now();
  const rb = getRebirthBonuses();

  // réinitialise les multiplicateurs avant de ré-appliquer tous les effets achetés
  state.cooldown = rb.startCooldown;
  state.clickBaseMult = 1;
  state.cpsMult = rb.cpsMult;
  state.globalMult = rb.globalMult;
  state.buildingClickMult = 1;
  state.critChance = rb.critBonus;

  for (const up of UPGRADES) {
    if (state.upgradesBought.includes(up.id)) up.effect(state);
  }

  let buildingClickBonus = 0;
  let buildingCps = 0;
  for (const b of BUILDINGS) {
    const owned = state.owned[b.id] || 0;
    if (owned <= 0) continue;
    let contribution = b.baseValue * owned;
    const mod = state.tempBuildingMods[b.id];
    if (mod && now < mod.until) contribution *= mod.mult; // bonus/malus temporaire ciblé
    if (b.type === "click") buildingClickBonus += contribution;
    else buildingCps += contribution;
  }
  buildingClickBonus *= state.buildingClickMult;

  // malus "gâteau moisi" : force temporairement le skin équipé pour le calcul, sans le changer réellement
  const lockedToMoisi = now < state.tempEffects.skinLockUntil;
  const skin = lockedToMoisi
    ? SKINS.find(s => s.id === "moisi")
    : (SKINS.find(s => s.id === state.currentSkin) || SKINS[0]);

  stats.clickPower = (1 * state.clickBaseMult + buildingClickBonus) * state.globalMult * skin.mult * rb.clickMult;
  stats.cps = buildingCps * state.cpsMult * state.globalMult;
}

function buildingPrice(b) {
  const owned = state.owned[b.id] || 0;
  return Math.ceil(b.basePrice * Math.pow(GROWTH, owned));
}

// Prix total pour acheter k unités d'affilée d'un bâtiment (somme géométrique)
function buildingBatchPrice(b, k) {
  if (k <= 0) return 0;
  const owned = state.owned[b.id] || 0;
  const firstPrice = b.basePrice * Math.pow(GROWTH, owned);
  return Math.ceil(firstPrice * (Math.pow(GROWTH, k) - 1) / (GROWTH - 1));
}

// Nombre maximum d'unités achetables d'un coup avec l'argent actuel
function maxAffordable(b) {
  const owned = state.owned[b.id] || 0;
  const firstPrice = b.basePrice * Math.pow(GROWTH, owned);
  if (state.money < firstPrice) return 0;
  let k = Math.floor(Math.log(1 + (state.money * (GROWTH - 1)) / firstPrice) / Math.log(GROWTH));
  k = Math.max(0, k);
  // petites corrections pour les imprécisions à virgule flottante
  while (k > 0 && buildingBatchPrice(b, k) > state.money) k--;
  while (buildingBatchPrice(b, k + 1) <= state.money) k++;
  return k;
}

// Quantité visée pour un bâtiment selon le mode d'achat sélectionné (x1 / x10 / x100 / Max)
function plannedAmount(b) {
  if (buyAmount === "max") return maxAffordable(b);
  return buyAmount;
}

/* ----------------------------------------------------------
   3. SAUVEGARDE
   ---------------------------------------------------------- */

function saveGame() {
  try {
    localStorage.setItem(slotKey(activeSlot), JSON.stringify(state));
  } catch (e) { /* stockage indisponible, on ignore */ }
}

function loadGame(slot) {
  try {
    const raw = localStorage.getItem(slotKey(slot));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Object.assign(defaultState(), parsed);
  } catch (e) { return null; }
}

function resetGame() {
  if (!confirm(`Réinitialiser l'emplacement ${activeSlot} ? Cette action est irréversible.`)) return;
  localStorage.removeItem(slotKey(activeSlot));
  state = defaultState();
  recomputeStats();
  fullRender();
  renderSlotsBar();
}

// Lit en lecture seule l'argent d'un emplacement sans le charger (pour l'aperçu)
function slotPreview(n) {
  if (n === activeSlot) return state.money;
  try {
    const raw = localStorage.getItem(slotKey(n));
    if (!raw) return null;
    return JSON.parse(raw).money || 0;
  } catch (e) { return null; }
}

function renderSlotsBar() {
  document.querySelectorAll(".slot-btn").forEach(btn => {
    const n = parseInt(btn.dataset.slot, 10);
    const preview = slotPreview(n);
    btn.classList.toggle("active", n === activeSlot);
    btn.querySelector(".slot-money").textContent = preview === null ? "Vide" : formatMoney(preview);
  });
}

function switchSlot(n) {
  if (n === activeSlot) return;
  saveGame(); // on sauvegarde l'emplacement courant avant de quitter
  activeSlot = n;
  setActiveSlot(n);
  state = loadGame(n) || defaultState();
  recomputeStats();
  fullRender();
  renderSlotsBar();
  // applique les préférences son/musique propres à cet emplacement
  Sound.setMusicOn(state.musicOn);
  Sound.setMusicTrack(state.musicTrack);
  Sound.setSfxOn(state.sfxOn);
  el.musicToggle.textContent = state.musicOn ? "🔊" : "🔇";
  el.sfxToggle.textContent = state.sfxOn ? "🔔" : "🔕";
  updateMusicTrackLabel();
}

function setupSlots() {
  document.querySelectorAll(".slot-btn").forEach(btn => {
    btn.addEventListener("click", () => switchSlot(parseInt(btn.dataset.slot, 10)));
  });
  renderSlotsBar();
}

/* ----------------------------------------------------------
   4. FORMATAGE DES NOMBRES
   ---------------------------------------------------------- */

const SUFFIXES = ["", "K", "M", "Md", "Bn", "Bi", "Tr", "Qa", "Qi"];
function formatNumber(n) {
  if (n < 0) n = 0;
  if (n < 1000) return (Math.floor(n * 100) / 100).toString().replace(".", ",");
  let tier = 0;
  let scaled = n;
  while (scaled >= 1000 && tier < SUFFIXES.length - 1) {
    scaled /= 1000;
    tier++;
  }
  return scaled.toFixed(scaled < 10 ? 2 : scaled < 100 ? 1 : 0).replace(".", ",") + SUFFIXES[tier];
}
function formatMoney(n) { return formatNumber(n) + "$"; }

/* ----------------------------------------------------------
   4bis. PISTES MUSICALES (house) — entièrement synthétisées
   ---------------------------------------------------------- */

const MUSIC_VOLUME = 0.30; // volume de la musique de fond (augmenté)

const HOUSE_TRACKS = {
  house1: {
    name: "House Classique", bpm: 124,
    bass: [65.41, 65.41, 73.42, 61.74],
    hatSteps: [2, 6, 10, 14],
    clap: true, riser: false,
  },
  house2: {
    name: "House Deep", bpm: 119,
    bass: [49.00, 49.00, 55.00, 49.00],
    hatSteps: [6, 14],
    clap: false, riser: false,
  },
  house3: {
    name: "House Funky", bpm: 128,
    bass: [61.74, 69.30, 61.74, 73.42],
    hatSteps: [2, 6, 10, 14, 1, 9],
    clap: true, riser: false,
  },
  house4: {
    name: "House Énergique", bpm: 132,
    bass: [65.41, 65.41, 77.78, 73.42],
    hatSteps: [2, 6, 10, 14, 1, 5, 9, 13],
    clap: true, riser: true,
  },
};
const HOUSE_ORDER = ["house1", "house2", "house3", "house4"];

/* ----------------------------------------------------------
   5. SONS (synthétisés via Web Audio API — aucun fichier requis)
   ---------------------------------------------------------- */

const Sound = (() => {
  let ctx = null;
  let musicGain, sfxGain, masterGain;
  let musicStarted = false;
  let musicTimer = null;
  let noiseBuffer = null;

  function ensureCtx() {
    if (ctx) return ctx;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(ctx.destination);
    sfxGain = ctx.createGain();
    sfxGain.gain.value = state.sfxOn ? 1 : 0;
    sfxGain.connect(masterGain);
    musicGain = ctx.createGain();
    musicGain.gain.value = state.musicOn ? MUSIC_VOLUME : 0;
    musicGain.connect(masterGain);
    return ctx;
  }

  function tone(dest, freq, time, dur, type = "sine", vol = 0.22, glideTo = null) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, time + dur);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(vol, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(gain).connect(dest);
    osc.start(time);
    osc.stop(time + dur + 0.05);
  }

  // Bruit blanc filtré, utilisé pour les charleys/claps de la piste house
  function getNoiseBuffer() {
    if (noiseBuffer) return noiseBuffer;
    const size = ctx.sampleRate * 0.5;
    noiseBuffer = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    return noiseBuffer;
  }

  function noiseBurst(dest, time, dur, vol = 0.15, highpassFreq = 5000) {
    const src = ctx.createBufferSource();
    src.buffer = getNoiseBuffer();
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = highpassFreq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(vol, time + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    src.connect(filter).connect(gain).connect(dest);
    src.start(time);
    src.stop(time + dur + 0.02);
  }

  function playClick(isCrit) {
    ensureCtx();
    const t = ctx.currentTime;
    if (isCrit) {
      [880, 1175, 1568].forEach((f, i) => tone(sfxGain, f, t + i * 0.05, 0.18, "triangle", 0.18));
    } else {
      tone(sfxGain, 520, t, 0.09, "sine", 0.2, 360);
    }
  }

  function playBuilding() {
    ensureCtx();
    const t = ctx.currentTime;
    tone(sfxGain, 392, t, 0.1, "triangle", 0.2);
    tone(sfxGain, 523.25, t + 0.06, 0.16, "triangle", 0.2);
  }

  function playUpgrade() {
    ensureCtx();
    const t = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      tone(sfxGain, f, t + i * 0.07, 0.22, "sawtooth", 0.12));
  }

  function playSkin() {
    ensureCtx();
    const t = ctx.currentTime;
    [392, 523.25, 659.25, 783.99].forEach((f, i) =>
      tone(sfxGain, f, t + i * 0.09, 0.25, "triangle", 0.18));
    [783.99, 987.77, 1174.66].forEach(f => tone(sfxGain, f, t + 0.4, 0.6, "sine", 0.13));
  }

  function playDenied() {
    ensureCtx();
    const t = ctx.currentTime;
    tone(sfxGain, 180, t, 0.12, "square", 0.08);
  }

  // Son positif joué quand une notification de BONUS apparaît
  function playBonus() {
    ensureCtx();
    const t = ctx.currentTime;
    [659.25, 880, 1108.73].forEach((f, i) => tone(sfxGain, f, t + i * 0.08, 0.3, "triangle", 0.22));
    noiseBurst(sfxGain, t + 0.24, 0.15, 0.08, 6000);
  }

  // Son négatif ("womp womp") joué quand une notification de MALUS apparaît
  function playMalus() {
    ensureCtx();
    const t = ctx.currentTime;
    tone(sfxGain, 311.13, t, 0.4, "sawtooth", 0.18, 130);
    tone(sfxGain, 233.08, t + 0.32, 0.45, "sawtooth", 0.18, 90);
  }

  /* ---- Musique de fond : 4 pistes house au choix, entièrement synthétisées ---- */

  let houseStep = 0;
  let houseBar = 0;

  function scheduleMusicStep() {
    if (!ctx) return;
    const track = HOUSE_TRACKS[state.musicTrack] || HOUSE_TRACKS.house1;
    const stepDur = 60 / track.bpm / 4; // durée d'un seizième de note
    const t = ctx.currentTime + 0.05;

    if (houseStep % 4 === 0) tone(musicGain, 150, t, 0.18, "sine", 0.85, 42); // kick "four on the floor"
    if (track.hatSteps.includes(houseStep)) noiseBurst(musicGain, t, 0.045, 0.16, 6500); // charley
    if (houseStep === 0 || houseStep === 8) {
      const note = track.bass[houseBar % track.bass.length];
      tone(musicGain, note, t, 0.22, "sawtooth", 0.22); // basse
    }
    if (track.clap && houseStep === 12) noiseBurst(musicGain, t, 0.12, 0.12, 3000); // clap
    if (track.riser && houseStep === 0 && houseBar % 4 === 3) {
      tone(musicGain, 300, t, 0.9, "sawtooth", 0.05, 1800); // petit riser ascendant
    }

    houseStep = (houseStep + 1) % 16;
    if (houseStep === 0) houseBar++;
    musicTimer = setTimeout(scheduleMusicStep, stepDur * 1000);
  }

  function startMusic() {
    ensureCtx();
    if (ctx.state === "suspended") ctx.resume();
    if (!musicStarted) {
      musicStarted = true;
      scheduleMusicStep();
    }
  }

  // Change de piste à la volée (coupe la boucle en cours et relance immédiatement sur la nouvelle piste)
  function setMusicTrack(track) {
    state.musicTrack = track;
    if (musicTimer) clearTimeout(musicTimer);
    houseStep = 0;
    houseBar = 0;
    if (musicStarted) scheduleMusicStep();
  }

  function setMusicOn(on) {
    state.musicOn = on;
    if (musicGain) musicGain.gain.setTargetAtTime(on ? MUSIC_VOLUME : 0, ctx ? ctx.currentTime : 0, 0.05);
    if (on) startMusic();
  }

  function setSfxOn(on) {
    state.sfxOn = on;
    if (sfxGain) sfxGain.gain.setTargetAtTime(on ? 1 : 0, ctx ? ctx.currentTime : 0, 0.05);
  }

  return {
    playClick, playBuilding, playUpgrade, playSkin, playDenied, playBonus, playMalus,
    startMusic, setMusicOn, setSfxOn, setMusicTrack,
  };
})();

/* ----------------------------------------------------------
   6. RENDU — éléments DOM
   ---------------------------------------------------------- */

// Nombre d'unités achetées en un clic : 1, 10, 100 ou "max" (le plus possible)
let buyAmount = 1;

const el = {
  money: document.getElementById("moneyDisplay"),
  cps: document.getElementById("cpsDisplay"),
  clickPower: document.getElementById("clickPowerDisplay"),
  skinName: document.getElementById("currentSkinName"),
  cake: document.getElementById("cakeVisual"),
  cakeBtn: document.getElementById("cakeBtn"),
  cooldownRing: document.getElementById("cooldownRing"),
  particles: document.getElementById("particles"),
  buildingsList: document.getElementById("buildingsList"),
  upgradesTab: document.getElementById("upgradesTab"),
  skinsTab: document.getElementById("skinsTab"),
  rebirthSummary: document.getElementById("rebirthSummary"),
  rebirthChain: document.getElementById("rebirthChain"),
  musicToggle: document.getElementById("musicToggle"),
  musicTrackToggle: document.getElementById("musicTrackToggle"),
  sfxToggle: document.getElementById("sfxToggle"),
  resetBtn: document.getElementById("resetBtn"),
  eventLayer: document.getElementById("eventLayer"),
  notifications: document.getElementById("notifications"),
};

function renderTopBar() {
  el.money.textContent = formatMoney(state.money);
  el.cps.textContent = formatNumber(stats.cps);
  el.clickPower.textContent = formatMoney(stats.clickPower);
  const activeMoneyEl = document.querySelector(`.slot-btn[data-slot="${activeSlot}"] .slot-money`);
  if (activeMoneyEl) activeMoneyEl.textContent = formatMoney(state.money);
}

function renderCakeVisual() {
  const locked = Date.now() < state.tempEffects.skinLockUntil;
  const effectiveSkinId = locked ? "moisi" : state.currentSkin;
  el.cake.className = "cake skin-" + effectiveSkinId;
  const skin = SKINS.find(s => s.id === effectiveSkinId);
  el.skinName.textContent = locked ? `${skin.name} (forcé par un malus !)` : skin.name;
}

function buildingCardHTML(b) {
  const owned = state.owned[b.id] || 0;
  const price = buildingPrice(b);
  const tag = b.type === "click" ? "Bonus de clic" : "Production passive";
  return `
    <div class="card" data-id="${b.id}" data-kind="building">
      <div class="card-icon">${b.icon}</div>
      <div class="card-body">
        <div class="card-title-row">
          <span class="card-title">${b.name}</span>
          <span class="card-owned">x${owned}</span>
        </div>
        <p class="card-desc">${b.desc}</p>
        <span class="card-tag ${b.type}">${tag} · ${b.type === "click" ? "+" + formatMoney(b.baseValue) + "/clic" : "+" + formatMoney(b.baseValue) + "/s"}</span>
      </div>
      <button class="buy-btn" data-id="${b.id}" data-kind="building">
        <span class="buy-label">Acheter</span>
        <span class="buy-price">${formatMoney(price)}</span>
      </button>
    </div>`;
}

function upgradeCardHTML(u) {
  const bought = state.upgradesBought.includes(u.id);
  return `
    <div class="card upgrade-card ${bought ? "bought" : ""}" data-id="${u.id}" data-kind="upgrade">
      <div class="card-icon">${u.icon}</div>
      <div class="card-body">
        <div class="card-title-row"><span class="card-title">${u.name}</span></div>
        <p class="card-desc">${u.desc}</p>
      </div>
      ${bought
        ? `<span class="bought-tag">Acquis ✓</span>`
        : `<button class="buy-btn" data-id="${u.id}" data-kind="upgrade">
             <span class="buy-label">Débloquer</span>
             <span class="buy-price">${formatMoney(u.price)}</span>
           </button>`}
    </div>`;
}

function skinCardHTML(s) {
  const owned = state.skinsOwned.includes(s.id);
  const equipped = state.currentSkin === s.id;
  let action;
  if (equipped) action = `<span class="bought-tag">Équipé ✓</span>`;
  else if (owned) action = `<button class="buy-btn equip-btn" data-id="${s.id}" data-kind="equip"><span class="buy-label">Équiper</span></button>`;
  else action = `<button class="buy-btn" data-id="${s.id}" data-kind="skin">
                   <span class="buy-label">Acheter</span>
                   <span class="buy-price">${formatMoney(s.price)}</span>
                 </button>`;
  return `
    <div class="card skin-card ${equipped ? "bought" : ""}" data-id="${s.id}" data-kind="skinCard">
      <div class="card-icon">${s.icon}</div>
      <div class="card-body">
        <div class="card-title-row"><span class="card-title">${s.name}</span></div>
        <p class="card-desc">${s.desc}</p>
        <span class="card-tag click">x${s.mult} sur le gain par clic</span>
      </div>
      ${action}
    </div>`;
}

function rebirthSummaryHTML() {
  const gain = calculateRebirthGain();
  return `
    <div class="rebirth-points">🔄 Points de renaissance : <strong>${formatNumber(state.rebirthPoints)}</strong>${state.rebirthCount ? ` <span class="rebirth-count">(renaissance n°${state.rebirthCount})</span>` : ""}</div>
    <p class="rebirth-desc">Renaître réinitialise votre argent, vos bâtiments, vos améliorations et vos gâteaux — mais rapporte des points permanents à investir dans la chaîne ci-dessous. Les bonus débloqués restent acquis pour toujours.</p>
    <p class="rebirth-gain">Renaître maintenant rapporterait : <strong id="rebirthGainPreview">${formatNumber(gain)}</strong> points</p>
    <button class="rebirth-btn" id="rebirthBtn" ${gain <= 0 ? "disabled" : ""}>🔄 Renaître</button>
  `;
}

function rebirthNodeHTML(node, index) {
  const level = state.rebirthTree[node.id] || 0;
  const maxLevel = node.levels.length;
  const isMax = level >= maxLevel;
  const prevNode = index > 0 ? REBIRTH_CHAIN[index - 1] : null;
  const unlocked = index === 0 || (state.rebirthTree[prevNode.id] || 0) >= 1;
  const currentValue = level > 0 ? node.levels[level - 1].value : node.baseValue;

  const dots = Array.from({ length: maxLevel }, (_, i) =>
    `<span class="level-dot ${i < level ? "filled" : ""}"></span>`).join("");

  let actionHTML;
  if (!unlocked) {
    actionHTML = `<span class="chain-locked">🔒 Débloquer "${prevNode.name}" d'abord</span>`;
  } else if (isMax) {
    actionHTML = `<span class="chain-max">Niveau MAX ✓</span>`;
  } else {
    const cost = node.levels[level].cost;
    actionHTML = `<button class="chain-btn" data-node="${node.id}" ${state.rebirthPoints < cost ? "disabled" : ""}>
                     Niveau ${level + 1} — ${cost} pt${cost > 1 ? "s" : ""}
                   </button>`;
  }

  return `
    <div class="chain-node ${unlocked ? "" : "locked"} ${isMax ? "maxed" : ""}" data-id="${node.id}">
      <div class="chain-icon">${node.icon}</div>
      <div class="chain-body">
        <div class="chain-title-row">
          <span class="chain-title">${node.name}</span>
          <span class="chain-dots">${dots}</span>
        </div>
        <p class="chain-desc">${level > 0 ? node.describe(currentValue) : "Pas encore débloqué"}</p>
      </div>
      ${actionHTML}
    </div>`;
}

function renderRebirthTab() {
  el.rebirthSummary.innerHTML = rebirthSummaryHTML();
  el.rebirthChain.innerHTML = REBIRTH_CHAIN.map((n, i) => rebirthNodeHTML(n, i)).join("");
}

// Met à jour juste l'aperçu de gain potentiel (appelé en continu, léger)
function updateRebirthPreview() {
  const gainEl = document.getElementById("rebirthGainPreview");
  if (!gainEl) return;
  const gain = calculateRebirthGain();
  gainEl.textContent = formatNumber(gain);
  const btn = document.getElementById("rebirthBtn");
  if (btn) btn.disabled = gain <= 0;
}

function fullRender() {
  recomputeStats();
  el.buildingsList.innerHTML = BUILDINGS.map(buildingCardHTML).join("");
  el.upgradesTab.innerHTML = UPGRADES.map(upgradeCardHTML).join("");
  el.skinsTab.innerHTML = SKINS.map(skinCardHTML).join("");
  renderRebirthTab();
  renderCakeVisual();
  renderTopBar();
  updateAffordability();
}

// Met à jour l'état activé/désactivé et le prix/libellé des boutons d'achat (appelé souvent, pas coûteux)
function updateAffordability() {
  document.querySelectorAll(".buy-btn[data-kind='building']").forEach(btn => {
    const b = BUILDINGS.find(x => x.id === btn.dataset.id);
    const amount = plannedAmount(b);
    const price = buildingBatchPrice(b, Math.max(amount, 1));
    btn.querySelector(".buy-label").textContent = buyAmount === "max" ? `Acheter Max (x${amount})` : `Acheter x${amount}`;
    btn.querySelector(".buy-price").textContent = formatMoney(price);
    btn.disabled = amount < 1 || state.money < price;
  });
  document.querySelectorAll(".buy-btn[data-kind='upgrade']").forEach(btn => {
    const u = UPGRADES.find(x => x.id === btn.dataset.id);
    btn.disabled = state.money < u.price;
  });
  document.querySelectorAll(".buy-btn[data-kind='skin']").forEach(btn => {
    const s = SKINS.find(x => x.id === btn.dataset.id);
    btn.disabled = state.money < s.price;
  });
}

function updateOwnedCounts() {
  document.querySelectorAll(".card[data-kind='building']").forEach(card => {
    const owned = state.owned[card.dataset.id] || 0;
    card.querySelector(".card-owned").textContent = "x" + owned;
  });
}

/* ----------------------------------------------------------
   7. ACHATS
   ---------------------------------------------------------- */

function buyBuilding(id) {
  const b = BUILDINGS.find(x => x.id === id);
  const amount = plannedAmount(b);
  if (amount < 1) { Sound.playDenied(); return; }
  const price = buildingBatchPrice(b, amount);
  if (state.money < price) { Sound.playDenied(); return; }
  state.money -= price;
  state.owned[id] = (state.owned[id] || 0) + amount;
  Sound.playBuilding();
  recomputeStats();
  renderTopBar();
  updateAffordability();
  updateOwnedCounts();
  saveGame();
}

function buyUpgrade(id) {
  const u = UPGRADES.find(x => x.id === id);
  if (state.upgradesBought.includes(id) || state.money < u.price) { Sound.playDenied(); return; }
  state.money -= u.price;
  state.upgradesBought.push(id);
  Sound.playUpgrade();
  recomputeStats();
  el.upgradesTab.innerHTML = UPGRADES.map(upgradeCardHTML).join("");
  renderTopBar();
  updateAffordability();
  saveGame();
}

function buySkin(id) {
  const s = SKINS.find(x => x.id === id);
  if (state.skinsOwned.includes(id) || state.money < s.price) { Sound.playDenied(); return; }
  state.money -= s.price;
  state.skinsOwned.push(id);
  state.currentSkin = id;
  Sound.playSkin();
  recomputeStats();
  el.skinsTab.innerHTML = SKINS.map(skinCardHTML).join("");
  renderCakeVisual();
  renderTopBar();
  updateAffordability();
  saveGame();
}

function equipSkin(id) {
  if (!state.skinsOwned.includes(id)) return;
  state.currentSkin = id;
  recomputeStats();
  el.skinsTab.innerHTML = SKINS.map(skinCardHTML).join("");
  renderCakeVisual();
  renderTopBar();
  saveGame();
}

/* ----------------------------------------------------------
   8. CLIC SUR LE GÂTEAU + COOLDOWN
   ---------------------------------------------------------- */

let cooldownEnd = 0;

// Cooldown réellement appliqué à l'instant T, en tenant compte des bonus/malus actifs
function effectiveCooldown() {
  const now = Date.now();
  if (now < state.tempEffects.noCooldownUntil) return 0;       // bonus "curseur"
  if (now < state.tempEffects.cooldownPenaltyUntil) return 2.5; // malus
  return state.cooldown;
}

function spawnParticle(x, y, text, crit) {
  const span = document.createElement("span");
  span.className = "particle" + (crit ? " crit" : "");
  span.textContent = text;
  span.style.left = x + "px";
  span.style.top = y + "px";
  el.particles.appendChild(span);
  span.addEventListener("animationend", () => span.remove());
}

function handleCakeClick(ev) {
  Sound.startMusic(); // démarre la musique au premier clic (politique navigateur)
  const now = Date.now();

  if (now < cooldownEnd) {
    // trop rapide : pas de gain, petit retour visuel
    el.cakeBtn.classList.remove("shake");
    void el.cakeBtn.offsetWidth; // force le redémarrage de l'animation
    el.cakeBtn.classList.add("shake");
    return;
  }

  const isCrit = Math.random() < state.critChance;
  const gain = stats.clickPower * (isCrit ? 5 : 1);

  state.money += gain;
  state.totalEarned += gain;
  state.totalClicks += 1;

  const cd = effectiveCooldown();
  cooldownEnd = now + cd * 1000;
  animateCooldownRing(cd);

  Sound.playClick(isCrit);

  const rect = el.cakeBtn.getBoundingClientRect();
  const stageRect = el.cakeBtn.parentElement.getBoundingClientRect();
  const x = (ev.clientX ?? (rect.left + rect.width / 2)) - stageRect.left + (Math.random() * 40 - 20);
  const y = (ev.clientY ?? (rect.top + rect.height / 2)) - stageRect.top;
  spawnParticle(x, y, "+" + formatMoney(gain), isCrit);

  el.cakeBtn.classList.remove("pop");
  void el.cakeBtn.offsetWidth;
  el.cakeBtn.classList.add("pop");

  renderTopBar();
  updateAffordability();
}

function animateCooldownRing(duration) {
  if (duration <= 0) {
    el.cooldownRing.style.setProperty("--progress", "360deg");
    el.cooldownRing.classList.remove("active");
    return;
  }
  const start = performance.now();
  el.cooldownRing.classList.add("active");
  function frame(t) {
    const elapsed = t - start;
    const pct = Math.min(elapsed / (duration * 1000), 1);
    el.cooldownRing.style.setProperty("--progress", (pct * 360) + "deg");
    if (pct < 1) requestAnimationFrame(frame);
    else el.cooldownRing.classList.remove("active");
  }
  requestAnimationFrame(frame);
}

/* ----------------------------------------------------------
   9. BOUCLE PRINCIPALE (production passive, affichage, sauvegarde)
   ---------------------------------------------------------- */

let lastTick = performance.now();
let lastSave = performance.now();

function gameLoop(now) {
  const dt = (now - lastTick) / 1000;
  lastTick = now;

  recomputeStats(); // tient compte des bonus/malus temporaires en continu

  if (stats.cps > 0) {
    const gain = stats.cps * dt;
    state.money += gain;
    state.totalEarned += gain;
  }

  renderCakeVisual();
  renderTopBar();
  updateAffordability();
  updateRebirthPreview();

  if (now - lastSave > 5000) {
    saveGame();
    lastSave = now;
  }

  requestAnimationFrame(gameLoop);
}

/* ----------------------------------------------------------
   9bis. BONUS & MALUS ALÉATOIRES
   ---------------------------------------------------------- */

// --- Bonus : icône cliquable qui apparaît aléatoirement toutes les 5 à 15 minutes ---
const BONUS_TYPES = [
  { id: "cursor", weight: 45 },   // clic sans cooldown 15s
  { id: "building", weight: 50 }, // +20% sur un bâtiment pendant 2 min
  { id: "golden", weight: 5 },    // gâteau en or, très rare : +10% de la richesse
];

const BONUS_BUILDING_PHRASES = [
  "{b} carbure à la magie pâtissière : +20% de production pendant 2 minutes !",
  "Une fée pâtissière a saupoudré {b} de paillettes magiques (+20%, 2 min) !",
  "{b} vient de remporter le concours du meilleur four : +20% pendant 2 minutes !",
  "Un chef mystère est passé filer un coup de main à {b} (+20%, 2 min) !",
  "{b} carbure au café : +20% de production pendant 2 minutes !",
];

function pickWeighted(types) {
  const total = types.reduce((sum, t) => sum + t.weight, 0);
  let r = Math.random() * total;
  for (const t of types) {
    if (r < t.weight) return t.id;
    r -= t.weight;
  }
  return types[types.length - 1].id;
}

function claimBonus(type) {
  const now = Date.now();
  if (type === "cursor") {
    state.tempEffects.noCooldownUntil = now + 15000;
    showNotification("bonus", "🖱️", "Clics surchauffés ! Pas de cooldown pendant 15 secondes !");
  } else if (type === "golden") {
    const gain = state.money * 0.10;
    state.money += gain;
    state.totalEarned += gain;
    showNotification("bonus", "🎂", `GÂTEAU EN OR ! +${formatMoney(gain)} (10% de votre richesse) !`);
  } else if (type === "building") {
    const b = pickRandomBuilding();
    state.tempBuildingMods[b.id] = { mult: 1.2, until: now + 120000 };
    showNotification("bonus", b.icon, pickRandom(BONUS_BUILDING_PHRASES).replace("{b}", b.name));
  }
  recomputeStats();
  renderTopBar();
  updateAffordability();
  saveGame();
}

function spawnBonusIcon() {
  const type = pickWeighted(BONUS_TYPES);
  const iconChar = type === "cursor" ? "🖱️" : type === "golden" ? "🎂" : "🏗️";

  const wrapper = document.createElement("button");
  wrapper.className = "event-icon" + (type === "golden" ? " golden" : "");
  wrapper.innerHTML = `<span>${iconChar}</span>`;
  wrapper.setAttribute("aria-label", "Bonus à récupérer");

  // position aléatoire dans la fenêtre visible, en évitant les bords
  const margin = 70;
  const x = margin + Math.random() * Math.max(window.innerWidth - margin * 2, 100);
  const y = margin + Math.random() * Math.max(window.innerHeight - margin * 2, 100);
  wrapper.style.left = x + "px";
  wrapper.style.top = y + "px";

  let claimed = false;
  const lifeTimer = setTimeout(() => { if (!claimed) wrapper.remove(); }, 12000);

  wrapper.addEventListener("click", () => {
    if (claimed) return;
    claimed = true;
    clearTimeout(lifeTimer);
    claimBonus(type);
    wrapper.remove();
  });

  el.eventLayer.appendChild(wrapper);
}

// --- Malus : se déclenchent automatiquement, sans clic, toutes les 5 à 15 minutes ---
const MALUS_BUILDING_PHRASES = [
  "Un apprenti a fait exploser {b} ! -20% de production pendant 1min30.",
  "{b} est en grève surprise : -20% de production pendant 1min30.",
  "Une mouette a volé les ingrédients de {b} ! -20% pendant 1min30.",
  "{b} a cramé une fournée entière... -20% pendant 1min30.",
  "Le four de {b} fait une sieste imprévue : -20% pendant 1min30.",
];
const MALUS_COOLDOWN_PHRASES = [
  "Le four a refroidi d'un coup : cooldown rallongé à 2.5s pendant 1 minute !",
  "Coupure de courant en cuisine : cooldown à 2.5s pendant 1 minute !",
  "Le pâtissier s'est endormi sur le pétrin... cooldown à 2.5s pendant 1 minute !",
];
const MALUS_SKIN_PHRASES = [
  "Une moisissure mystérieuse envahit votre gâteau ! Bloqué sur le Gâteau moisi pendant 1 minute.",
  "Oups, votre beau gâteau a pris un coup de moisi pendant 1 minute !",
  "Un sortilège ringard transforme votre gâteau en Gâteau moisi pendant 1 minute !",
];

function spawnMalus() {
  const now = Date.now();
  const type = pickRandom(["skin", "cooldown", "building"]);

  if (type === "skin") {
    state.tempEffects.skinLockUntil = now + 60000;
    showNotification("malus", "🦠", pickRandom(MALUS_SKIN_PHRASES));
  } else if (type === "cooldown") {
    state.tempEffects.cooldownPenaltyUntil = now + 60000;
    showNotification("malus", "🐌", pickRandom(MALUS_COOLDOWN_PHRASES));
  } else {
    const b = pickRandomBuilding();
    state.tempBuildingMods[b.id] = { mult: 0.8, until: now + 90000 };
    showNotification("malus", "💥", pickRandom(MALUS_BUILDING_PHRASES).replace("{b}", b.name));
  }
  recomputeStats();
  renderCakeVisual();
  renderTopBar();
  saveGame();
}

// --- Notifications visuelles + sonores ---
function showNotification(kind, icon, text) {
  if (kind === "bonus") Sound.playBonus(); else Sound.playMalus();

  const div = document.createElement("div");
  div.className = "toast " + kind;
  div.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-text">${text}</span>`;
  el.notifications.appendChild(div);

  requestAnimationFrame(() => div.classList.add("show"));
  setTimeout(() => {
    div.classList.remove("show");
    div.addEventListener("transitionend", () => div.remove(), { once: true });
    setTimeout(() => div.remove(), 600); // filet de sécurité si transitionend ne se déclenche pas
  }, 5000);
}

// --- Planification : un délai aléatoire entre 5 et 15 minutes, indépendant pour bonus et malus ---
function randomEventDelay() {
  const MIN = 5 * 60 * 1000;
  const MAX = 15 * 60 * 1000;
  return MIN + Math.random() * (MAX - MIN);
}

function scheduleNextBonus() {
  setTimeout(() => { spawnBonusIcon(); scheduleNextBonus(); }, randomEventDelay());
}
function scheduleNextMalus() {
  setTimeout(() => { spawnMalus(); scheduleNextMalus(); }, randomEventDelay());
}

/* ----------------------------------------------------------
   10. ÉVÉNEMENTS / INITIALISATION
   ---------------------------------------------------------- */

function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".tab-content").forEach(c => c.classList.add("hidden"));
      document.getElementById(btn.dataset.tab + "Tab").classList.remove("hidden");
    });
  });
}

function setupShopClicks() {
  document.querySelector(".shop-panel").addEventListener("click", (e) => {
    const btn = e.target.closest(".buy-btn");
    if (!btn) return;
    const { id, kind } = btn.dataset;
    if (kind === "building") buyBuilding(id);
    else if (kind === "upgrade") buyUpgrade(id);
    else if (kind === "skin") buySkin(id);
    else if (kind === "equip") equipSkin(id);
  });
}

function setupRebirth() {
  el.rebirthSummary.addEventListener("click", (e) => {
    if (e.target.closest("#rebirthBtn")) performRebirth();
  });
  el.rebirthChain.addEventListener("click", (e) => {
    const btn = e.target.closest(".chain-btn");
    if (btn) levelUpChainNode(btn.dataset.node);
  });
}

function setupBuyAmount() {
  document.querySelectorAll(".amount-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.dataset.amount;
      buyAmount = val === "max" ? "max" : parseInt(val, 10);
      document.querySelectorAll(".amount-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      updateAffordability();
    });
  });
}

function updateMusicTrackLabel() {
  const track = HOUSE_TRACKS[state.musicTrack] || HOUSE_TRACKS.house1;
  const trackNum = HOUSE_ORDER.indexOf(state.musicTrack) + 1;
  el.musicTrackToggle.textContent = "🎧";
  el.musicTrackToggle.title = `Musique actuelle : ${track.name} (${trackNum}/${HOUSE_ORDER.length}) — cliquer pour changer de piste`;
}

function setupControls() {
  el.musicToggle.addEventListener("click", () => {
    const on = !state.musicOn;
    Sound.setMusicOn(on);
    el.musicToggle.textContent = on ? "🔊" : "🔇";
    saveGame();
  });
  el.musicTrackToggle.addEventListener("click", () => {
    const idx = HOUSE_ORDER.indexOf(state.musicTrack);
    const next = HOUSE_ORDER[(idx + 1) % HOUSE_ORDER.length];
    Sound.setMusicTrack(next);
    updateMusicTrackLabel();
    saveGame();
  });
  el.sfxToggle.addEventListener("click", () => {
    const on = !state.sfxOn;
    Sound.setSfxOn(on);
    el.sfxToggle.textContent = on ? "🔔" : "🔕";
    saveGame();
  });
  el.resetBtn.addEventListener("click", resetGame);
}

function init() {
  el.cakeBtn.addEventListener("click", handleCakeClick);
  setupTabs();
  setupShopClicks();
  setupControls();
  setupSlots();
  setupBuyAmount();
  setupRebirth();

  el.musicToggle.textContent = state.musicOn ? "🔊" : "🔇";
  el.sfxToggle.textContent = state.sfxOn ? "🔔" : "🔕";
  updateMusicTrackLabel();

  fullRender();
  requestAnimationFrame(gameLoop);
  scheduleNextBonus();
  scheduleNextMalus();

  window.addEventListener("beforeunload", saveGame);
}

document.addEventListener("DOMContentLoaded", init);
