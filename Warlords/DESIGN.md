# WARLORDS · The Strategy Simulation
### by WindowDoom

> Build a civilization. Lead an army. Choose between total annihilation
> and total dominance. Pick any era from 3000 BC to 2100 AD. Pick any
> faction. Make every decision count.

---

## 0 · One-Paragraph Pitch

**Warlords** is a single-file, browser-based grand-strategy simulator
spanning eight historical eras and ~80 playable factions. The player
selects an era, picks a country/faction, then builds an economy, raises
an army, navigates diplomacy with AI rivals, fights battles, advances
tech, and faces era-appropriate events. Every choice — what to grow,
who to ally with, when to strike, whom to assassinate — drives toward
one of seven win states or one of five collapse states across a 60–200
turn campaign. Inspired by Civilization, Hearts of Iron, EU4, Total War,
and the user's own Empire: Echoes of Iron.

---

## 1 · Final Target Size

**File:** `Warlords/index.html` — single-file HTML/CSS/JS, no
dependencies, runs offline by double-clicking.

| Section | Target size | Lines |
|---|---|---|
| CSS | ~150 KB | ~3,500 |
| HTML structure | ~50 KB | ~1,000 |
| JS data tables (eras, factions, units, buildings, techs, events) | ~900 KB | ~22,000 |
| JS game engine (turn processor, AI, combat, economy) | ~250 KB | ~6,000 |
| JS UI / renderers | ~250 KB | ~6,000 |
| JS persistence / save / settings | ~50 KB | ~1,000 |
| **Total** | **~1.7 MB** | **~39,000 lines** |

Hard ceiling: 3 MB. Floor: 1 MB. Sweet spot: 1.5–2 MB.

---

## 2 · Inspirations & Anti-Inspirations

**Steal from:**
- *Civilization VI* — tech tree, wonders, golden ages
- *Hearts of Iron IV* — focus trees, war planning
- *EU4* — provinces, vassal states, dynasties
- *Total War: Warhammer* — campaign map + heroes
- *Crusader Kings III* — characters, traits, intrigue
- *Empire: Echoes of Iron* (user's own game) — era progression, traits
- *Republic.exe* (user's reference) — decision trees with cascading consequences
- *Alternate Realities v8* (user's reference) — dynasty mode, multi-generation

**Avoid:**
- Pay-to-win timers
- MMO live-server complexity
- Real-time RTS clicking (we go turn-based)
- Sandbox bloat without payoff

---

## 3 · Player Journey

### 3.1 Onboarding (≤ 2 min)

1. **Splash:** *Warlords · The Strategy Simulation · by WindowDoom*
2. **Era Pick:** 8 era cards laid out, each showing era flag, year range, faction count, difficulty tier.
3. **Faction Pick:** within that era, ~10 factions presented as cards with stat preview, lore blurb, starting region, traits.
4. **Leader Pick:** 3 leader portraits per faction with different starting traits & bonuses.
5. **Victory Condition Pick:** "Choose your path" — Conquest / Cultural / Tech / Diplomatic / Economic / Survival / Legacy. Some are unlocked by faction.
6. **Difficulty:** Cadet / Captain / General / Marshal / Caesar.

### 3.2 First Turn Tutorial (turn 1–5)

- Build first farm, first quarry, first barracks.
- Recruit first unit, scout neighbor.
- Meet AI diplomat for the first time.
- Cabinet advisors introduce themselves.

### 3.3 Mid Game (turn 20–80)

- Tech advances, units obsolete, new buildings unlock.
- Major events fire (plague, famine, dynasty crisis, foreign invasion).
- Alliances form and break.
- Wars are won and lost.

### 3.4 End Game (turn 80–200)

- Reach a victory condition or collapse.
- Score awarded based on path taken, decisions made, atrocities committed.
- Achievement / Legacy unlock — carries to next playthrough.

---

## 4 · The Eight Eras

Each era has its own visual palette, music feel, available units,
buildings, techs, events, and faction roster. Switching eras is the
single biggest mechanical change in the game.

### 4.1 ANCIENT (3000 BC – 500 AD) · "The Foundations"
Resources: grain, wood, stone, bronze, iron, slaves.
Units: warband, hoplite, legionary, archer, charioteer, war elephant, trireme.
Buildings: village, granary, walls, forum, amphitheater, aqueduct, temple, library of Alexandria (wonder).
Tech: bronze working, iron working, writing, code of laws, monarchy, philosophy, masonry.
Factions (12):
1. Roman Republic / Empire (military, civics)
2. Egyptian Kingdom (wonders, granary)
3. Persian Empire (cavalry, diplomacy)
4. Greek City-States — Athens (philosophy, navy)
5. Greek City-States — Sparta (military)
6. Carthage (trade, navy)
7. Macedon / Alexander (conquest)
8. Qin / Han China (population, walls)
9. Mauryan India (culture, elephants)
10. Celtic Tribes (raiding)
11. Aksum (trade)
12. Assyrian Empire (siege)

### 4.2 MEDIEVAL (500 – 1500 AD) · "The Long Night"
Resources: grain, wood, stone, iron, gold, silk, spices, holy relics.
Units: levy spearman, men-at-arms, longbowman, knight, crossbowman, paladin, siege tower, cog.
Buildings: castle, cathedral, monastery, marketplace, port, blacksmith, university.
Tech: feudalism, chivalry, gunpowder, banking, theology, scholasticism.
Wonders: Hagia Sophia, Notre-Dame, Great Mosque of Córdoba, Tower of London.
Factions (12):
1. Byzantine Empire
2. Holy Roman Empire
3. Kingdom of England
4. Kingdom of France
5. Kingdom of Castile / Aragon
6. Caliphate (Umayyad, Abbasid, Fatimid)
7. Ottoman Beylik → Empire
8. Mongol Empire
9. Yuan / Ming China
10. Kievan Rus
11. Norse / Vikings (raiders)
12. Mali Empire (gold)

### 4.3 RENAISSANCE / EARLY MODERN (1500 – 1800) · "Powder & Print"
Resources: grain, lumber, iron, gold, silver (New World), tobacco, sugar, cotton, gunpowder, books.
Units: pikemen, musketeers, hussars, dragoons, line infantry, frigate, ship of the line.
Buildings: shipyard, gunpowder mill, printing press, opera house, joint-stock company, observatory.
Tech: printing, double-entry bookkeeping, gunpowder warfare, ocean navigation, scientific method.
Wonders: Sistine Chapel, Versailles, Forbidden City, Taj Mahal.
Factions (12):
1. Spanish Empire (gold + conquistadors)
2. Portuguese Empire (trade routes)
3. French Bourbon Monarchy
4. British Empire (rising)
5. Dutch Republic (trade)
6. Habsburg Austria
7. Ottoman Empire (peak)
8. Tsardom of Russia (Peter the Great)
9. Mughal India
10. Qing China
11. Edo Japan (isolation strategy)
12. Aztec / Inca (defenders)

### 4.4 INDUSTRIAL / NAPOLEONIC (1800 – 1914) · "Steel & Steam"
Resources: coal, iron, steel, oil (later), rubber, textiles, electricity.
Units: line infantry, grenadier, lancer, dragoon, artillery train, ironclad, dreadnought, biplane.
Buildings: factory, railroad station, telegraph office, parliament, museum, university.
Tech: steam engine, railroad, telegraph, industrialization, conscription, nationalism, electricity, radio.
Wonders: Eiffel Tower, Statue of Liberty, Suez Canal, Trans-Siberian Railway.
Factions (12):
1. Napoleonic France
2. British Empire (peak)
3. Prussia → German Empire
4. Russian Empire
5. Habsburg Austria-Hungary
6. Ottoman Empire (declining)
7. Italian Unification (Risorgimento)
8. Spanish Empire (declining)
9. United States (Civil War branch)
10. Empire of Japan (Meiji Restoration)
11. Qing China (Opium War-era)
12. Confederate States (alternate-history option)

### 4.5 WORLD WARS (1914 – 1945) · "The Industrial Slaughter"
Resources: oil, iron, coal, steel, aluminum, rubber, food.
Units: infantry, machine gun nest, tank, fighter, bomber, U-boat, battleship, carrier.
Buildings: munitions factory, oil refinery, airbase, radar station, propaganda office.
Tech: assembly line, radar, code breaking, jet engine, atomic theory, antibiotics, total war.
Wonders: Manhattan Project, Hoover Dam, Maginot Line.
Factions (16):
1. United States
2. United Kingdom + Dominions
3. Soviet Union
4. France (Third Republic / Vichy)
5. Nazi Germany
6. Fascist Italy
7. Imperial Japan
8. Republic of China
9. Communist China (Mao)
10. Poland
11. Finland
12. Yugoslavia (partisans)
13. Free France
14. Ottoman Successors (Turkey)
15. Brazil
16. Pre-Independence India (subject)

### 4.6 COLD WAR (1945 – 1991) · "Mutually Assured"
Resources: oil, uranium, electronics, food, propaganda.
Units: motor rifle, M1/T-72 tank, fighter jet, ICBM, SSBN submarine, spy, paratrooper.
Buildings: missile silo, radar network, propaganda ministry, intelligence agency, space center.
Tech: nuclear weapons, jet age, computers, space race, ICBMs, satellites, MIRVs, the internet.
Wonders: Apollo Program, ISS, Three Gorges Dam.
Factions (12):
1. United States
2. Soviet Union
3. People's Republic of China
4. United Kingdom (nuclear)
5. France (nuclear)
6. India (non-aligned)
7. Israel (covert nuclear)
8. Brazil
9. Yugoslavia (non-aligned)
10. South Africa (apartheid)
11. Iran (pre/post revolution)
12. Cuba (Soviet client)

### 4.7 MODERN (1991 – 2030) · "Asymmetric"
Resources: oil, lithium, rare earths, semiconductors, data, energy.
Units: F-22, Abrams, drone, cyber-warrior, special forces, hypersonic missile.
Buildings: data center, cyber-command, special forces base, drone airbase, semiconductor fab.
Tech: GPS, internet, drones, AI, cyber warfare, hypersonics, biotech, blockchain.
Wonders: Burj Khalifa, ITER fusion reactor, Starlink constellation.
Factions (15):
1. United States
2. China (rising)
3. Russia
4. EU bloc (France/Germany)
5. United Kingdom
6. Japan
7. India
8. Israel
9. South Korea
10. Iran
11. North Korea
12. Brazil
13. Indonesia
14. Turkey
15. Non-State Actors (terrorism path)

### 4.8 NEAR-FUTURE (2030 – 2100) · "The Convergence"
Resources: rare earths, lithium, helium-3, fusion fuel, AI compute, ocean nodes.
Units: combat drone swarm, autonomous mech, hypersonic, orbital strike platform, AGI brain.
Buildings: fusion reactor, space elevator, AGI lab, lunar mining base, orbital weapons platform.
Tech: AGI, fusion power, space colonization, brain-computer interface, climate engineering, quantum supremacy.
Wonders: AGI Singularity, Mars Colony, Dyson Swarm Phase I.
Factions (10):
1. United States Federal Republic
2. Chinese Hegemony
3. Russian Federation (resurgent)
4. Pan-European Union
5. Indian Union
6. Pacific Tigers Bloc
7. Brazil-led South American Bloc
8. African Union (resource-rich)
9. Independent Mars Colony
10. The AGI (player can choose to play AS the AGI for transcendence ending)

---

## 5 · Core Mechanics

### 5.1 Resources

**Universal:** Food, Water, Manpower, Treasury, Influence, Stability.

**Era-Gated:** Bronze/Iron/Steel, Gold/Silver, Oil, Uranium, Rare-Earths, AI-Compute.

**Strategic:** Horses, Spices, Silk, Tobacco, Rubber, Lithium — needed for specific units/buildings, limited deposits per province.

### 5.2 Population

- **Citizens:** taxed, eaten food
- **Soldiers:** drafted from citizens, costs manpower
- **Specialists:** scholars, priests, merchants, engineers
- **Slaves / Serfs / Workers:** era-appropriate labor pool

### 5.3 Provinces / Territories

The world map is divided into ~200 provinces. Each has:
- Owner faction
- Population (citizens × 1000)
- Terrain (plains, hills, mountains, desert, forest, jungle, tundra, coast, river)
- Resources present
- Buildings constructed
- Loyalty / unrest level
- Garrison

Provinces are the atom of conquest. Capture a province → control its
population, resources, and buildings. Lose your capital province →
collapse.

### 5.4 Buildings

| Tier | Examples |
|---|---|
| Subsistence | Farm, Well, Granary, Lumber Yard |
| Industry | Quarry, Mine, Forge, Workshop, Factory |
| Military | Barracks, Stable, Castle, Naval Yard, Airbase, Silo |
| Civic | Forum, Market, University, Hospital, Bank |
| Cultural | Temple, Cathedral, Opera House, Museum |
| Wonders | Era-specific, one per faction, huge bonuses |

Each building has cost, build time, upkeep, era requirement, prerequisite tech.

### 5.5 Units (per era, ~30 per era)

Each unit has: name, tier, attack, defense, speed, range, era, cost
(manpower + resources), upkeep, unique abilities, counters (e.g.
spearman counters cavalry).

### 5.6 Tech Tree

~40 techs per era. Each unlocks units, buildings, wonders, decisions.
Costs research points generated by libraries/universities/scholars.

### 5.7 Diplomacy

- Embassies → +relations / spy network
- Trade Deal → mutual gold/resources
- Alliance → defensive pact
- Marriage → dynastic union (medieval)
- Vassalize → tributary
- Declare War → cassus belli required (or take stability hit)
- Sign Peace → terms
- Coalition → multiple powers band against you if you're too big

AI factions have their own goals, personalities (aggressive, isolationist, expansionist, mercantile, religious, paranoid).

### 5.8 Combat

**Two layers:**
1. **Strategic** — armies on the map move province-by-province, encounter enemy armies, fight resolved as a single battle round with modifiers.
2. **Tactical (optional)** — for major battles, open a tactical screen with terrain, formation, flanking, leader bonuses.

Modifiers: terrain, leader, morale, technology gap, fortifications, fatigue, supply lines.

### 5.9 Events & Decisions

Each turn: 0–3 events fire. Examples:
- **Famine:** -20% food for 5 turns. Choose: cull livestock / import / pray / nothing.
- **Plague:** -10% population. Choose: quarantine / care for sick / scapegoat foreigners.
- **Heir Crisis:** ruler dies without heir. Choose: civil war / elder son / younger daughter / consult Pope.
- **Foreign Invasion:** AI declares war. Choose: fight / negotiate / sacrifice province / call allies.
- **Scientific Breakthrough:** +5 research. Choose: publish / classify / patent.

~150 events per era × 8 eras = ~1,200 unique events.

### 5.10 Fame, Power, Legacy

Three meta-scores:
- **Fame** — how known is your faction (drives diplomatic weight)
- **Power** — military + economic strength
- **Legacy** — final score, transfers to ancestor archive between playthroughs

---

## 6 · Victory Conditions

| Path | Trigger | Score Mod |
|---|---|---|
| **Total Domination** | Control ≥ 75% of map provinces | +50 |
| **Cultural** | Highest culture across all factions for 20 turns | +35 |
| **Scientific** | First to reach final tech of era | +40 |
| **Diplomatic** | Form world alliance with all major powers | +45 |
| **Economic** | Treasury > 10× nearest rival for 10 turns | +30 |
| **Survival** | Reach turn 200 alive | +20 |
| **Legacy** | Highest cumulative score across dynasty | +25 |

## 7 · Defeat Conditions

| Collapse | Trigger |
|---|---|
| **Total Annihilation** | Lose all provinces |
| **Famine Collapse** | Food < 0 for 10 turns |
| **Revolt** | Stability < 10 for 10 turns |
| **Nuclear Winter** | Atomic exchange wipes you out |
| **Heir Failure** | No heir + civil war loss (medieval era) |

---

## 8 · UI Design

### 8.1 Layout (1920×1080 target)

```
┌──────────────────────────────────────────────────────────────────┐
│  WARLORDS · [Faction Flag] [Leader] [Era · Turn]   [Tutorial][?] │ ← Topbar 48px
├────────────────┬─────────────────────────────────┬───────────────┤
│ LEFT PANEL     │                                 │ RIGHT PANEL   │
│ - Resources    │                                 │ - Rivals list │
│ - Population   │     WORLD MAP                   │ - War status  │
│ - Manpower     │     (hex or province SVG)       │ - Events feed │
│ - Treasury     │                                 │ - Diplomacy   │
│ - Stability    │                                 │ - Trade       │
│ - Fame/Power   │                                 │ - Coalition   │
│ - Advisors     │                                 │   warnings    │
│ - Cabinet      │                                 │               │
├────────────────┴─────────────────────────────────┴───────────────┤
│  [Build] [Recruit] [Research] [Decree] [Diplomat] [End Turn ▶]   │ ← Action bar
└──────────────────────────────────────────────────────────────────┘
```

### 8.2 Color Palette

Same vibrant Tailwind-neon as Lyfe — `#a855f7` purple primary, gold/teal/magenta/lime accents — but with era-specific accent overrides (ancient = ochre/bronze, medieval = crimson/gold, modern = neon green/cyan, future = electric blue/magenta).

### 8.3 Map Rendering

- **Approach A (simpler):** province-based SVG with colored fills per faction.
- **Approach B (denser):** hex-grid canvas with terrain sprites.
- **Approach C (planned):** **A first, B as v2.**

### 8.4 Modal Overlays

- Tech tree (zoomable canvas)
- Battle results
- Event decisions (cards)
- Wonder construction
- Diplomatic council
- Pause / settings / save

---

## 9 · File Architecture (single-file `Warlords/index.html`)

```
<!DOCTYPE html>
<html>
<head>
  <title>Warlords · The Strategy Simulation by WindowDoom</title>
  <style>
    [~3500 lines CSS]
    - Reset, root vars, era-specific palette overrides
    - Topbar, panels, action bar
    - World map SVG styling
    - Modal overlays (tech tree, battle, events)
    - Buildings, units, tech cards
    - Animations (turn transitions, battle flashes, dynasty deaths)
    - Responsive breakpoints
  </style>
</head>
<body>
  <div id="splash">...</div>
  <div id="era-pick">...</div>
  <div id="faction-pick">...</div>
  <div id="leader-pick">...</div>
  <div id="game">
    <div id="topbar">...</div>
    <div id="main">
      <div id="left-panel">...</div>
      <div id="map">...</div>
      <div id="right-panel">...</div>
    </div>
    <div id="action-bar">...</div>
  </div>
  <div class="modal" id="modal">...</div>

  <script>
    // ─── DATA TABLES ────────────────────────────────────────────────
    const ERAS = {...};                  // 8 entries
    const FACTIONS = {ancient:[...], medieval:[...], ...};   // ~100 total
    const LEADERS = {...};               // 3 per faction × 100 = 300
    const UNITS = {...};                 // ~240 (30 per era × 8)
    const BUILDINGS = {...};             // ~120
    const TECHS = {...};                 // ~320 (40 per era × 8)
    const RESOURCES = {...};             // ~20
    const PROVINCES = {...};             // ~200 provinces, varying ownership per era
    const EVENTS = {...};                // ~1200 events (150 × 8)
    const WONDERS = {...};               // ~40
    const TRAITS = {...};                // ~60 leader traits
    const DECISIONS = {...};             // ~400 decision branches

    // ─── GAME STATE ─────────────────────────────────────────────────
    let GAME = null;  // {era, player:{faction, leader, provinces, resources, ...}, ai:[...], turn, events, dynasty}

    // ─── ENGINE ─────────────────────────────────────────────────────
    function endTurn() {...}
    function processAI() {...}
    function resolveCombat() {...}
    function applyResources() {...}
    function checkVictory() {...}
    function rollEvents() {...}
    function fireDecision(id) {...}

    // ─── RENDERERS ──────────────────────────────────────────────────
    function renderTopbar() {...}
    function renderLeftPanel() {...}
    function renderMap() {...}
    function renderRightPanel() {...}
    function renderActionBar() {...}
    function renderEventModal(ev) {...}
    function renderTechTree() {...}
    function renderBattleResult(b) {...}

    // ─── PERSISTENCE ────────────────────────────────────────────────
    function save() {...}
    function load() {...}
    function exportSave() {...}
    function importSave(str) {...}

    // ─── BOOT ───────────────────────────────────────────────────────
    initSplash();
  </script>
</body>
</html>
```

---

## 10 · Chunk Roadmap (each chunk ≈ 1 commit/turn)

### Phase 1 — Foundation (already done in this turn)
- ✅ **Chunk 0:** Design document (this file)

### Phase 2 — Bootstrap (next 3 chunks)
- **Chunk 1:** HTML shell, CSS skeleton, era-pick screen, faction-pick screen, leader-pick screen. ~3,000 lines.
- **Chunk 2:** Core game state, basic topbar + left panel + action bar + end-turn loop. Static map showing provinces. ~3,000 lines.
- **Chunk 3:** Resource production / consumption per turn. Building list and construction. ~2,500 lines.

### Phase 3 — Content (next 8 chunks, one per era)
- **Chunk 4:** Ancient era full data (12 factions, 36 leaders, 30 units, 15 buildings, 150 events, 40 techs, 25 provinces). ~5,000 lines.
- **Chunk 5:** Medieval era full data. ~5,000 lines.
- **Chunk 6:** Renaissance era full data. ~5,000 lines.
- **Chunk 7:** Industrial era full data. ~5,000 lines.
- **Chunk 8:** World Wars era full data. ~5,500 lines (more factions).
- **Chunk 9:** Cold War era full data. ~5,000 lines.
- **Chunk 10:** Modern era full data. ~5,000 lines.
- **Chunk 11:** Near-Future era full data. ~4,500 lines.

### Phase 4 — Systems (next 4 chunks)
- **Chunk 12:** Combat resolver (strategic + tactical), unit-vs-unit modifiers, terrain effects. ~2,000 lines.
- **Chunk 13:** Diplomacy engine, AI personalities, alliance / war / trade / vassalize logic. ~2,500 lines.
- **Chunk 14:** Tech tree (per era), research point generation, unlocks. ~2,000 lines.
- **Chunk 15:** Event system, decision modal, consequence cascades. ~2,000 lines.

### Phase 5 — Polish (next 3 chunks)
- **Chunk 16:** Victory + defeat conditions, scoring, dynasty/legacy archive. ~1,500 lines.
- **Chunk 17:** Save/load, export string, settings, sound (optional), keyboard shortcuts. ~1,000 lines.
- **Chunk 18:** Final balance pass, bug fixes, content top-ups to hit 1.5–2 MB. ~variable.

**Cumulative target after Chunk 18: ~1.7 MB / ~39,000 lines.**

---

## 11 · Open Questions to Resolve Before Coding Begins

These are the choices the user should weigh in on before I start
Chunk 1:

1. **Map style — A or B?** Province SVG (simpler, faster to build) or
   hex grid (more tactical depth, slower to build). Recommend **A**
   first, with hex-grid as a v2 upgrade.

2. **Combat — single-round or tactical?** Single-round resolution
   (faster, less code) or open a tactical mini-game for major battles
   (slower, more flavor). Recommend **single-round** with optional
   replay animation.

3. **Turn pace — fixed or real-time?** Turn-based with manual "End
   Turn" (standard) or auto-advance every N seconds (mobile-friendly).
   Recommend **turn-based**.

4. **Save persistence — local-only or shareable?** localStorage only
   (simple) or export-string for sharing campaigns. Recommend **both**.

5. **Multi-faction play — can you play as multiple in one session?**
   No (single playthrough per save) or yes (Civilization-style
   multi-civ). Recommend **single-faction per save**, dynasty mode
   across saves.

6. **Era unlocks — all eras open from start, or progression?** Open
   all (immediate replayability) or unlock progressively (sense of
   journey). Recommend **all open from start**.

7. **Difficulty AI behavior — purely scaling stats, or smarter
   decisions?** Stats-only is easier to build, smarter AI is more
   interesting. Recommend **stats scaling first, smarter AI in Chunk
   13**.

8. **Branding — keep "Warlords"?** Or rename to "Empires" / "Sovereign" /
   "Dominion" / something else? User pick.

---

## 12 · Risk Register

| Risk | Likelihood | Mitigation |
|---|---|---|
| File hits 3 MB limit too early | Medium | Trim Chunk 18 content, push to v2 |
| Performance on phones | Medium | Lazy-render map provinces, virtualize event log |
| AI feels dumb | High | Personality presets + scripted rivalries, not full minimax |
| Combat unfun | Medium | Single-round + flavor text > complicated formulas |
| Too many factions, can't balance | Medium | Faction = preset stat package, no deep tuning |
| Eras feel interchangeable | High | Each era has unique mechanic (medieval = dynasty, modern = cyber) |

---

## 13 · "Done" Definition

The game is shippable when:
- ✅ All 8 eras playable to a victory condition
- ✅ All 7 victory + 5 defeat paths reachable
- ✅ ≥ 80 playable factions
- ✅ ≥ 240 unit types across eras
- ✅ ≥ 1,200 events
- ✅ ≥ 320 techs
- ✅ Save/load works
- ✅ File parses, all onclick handlers wired, no console errors
- ✅ Smoke-tested through a full 200-turn campaign

---

*End of design document. Next chunk = HTML shell + era/faction/leader
picker. Awaiting user sign-off on the 8 open questions in §11.*
