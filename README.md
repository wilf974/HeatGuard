# 🌡️ HeatGuard

**Open source heat-stroke prevention tool** — runs entirely in the browser, installable as a PWA, free weather API integration, no backend, no tracking.

> **Outil pédagogique uniquement — non certifié opérationnel.** Cet outil ne remplace ni l'avis médical, ni la médecine du travail, ni les obligations légales de l'employeur en cas de canicule.

---

## 🔗 Live demo

👉 **[wilf974.github.io/HeatGuard](https://wilf974.github.io/HeatGuard/)** (mobile-first, installable, géolocalisation auto)

---

## Problem

Le coup de chaleur tue **~500 000 personnes par an** dans le monde — un chiffre en hausse avec le réchauffement climatique. Pourtant, beaucoup l'ignorent :

- Les ouvriers BTP, sportifs, soignants en EHPAD travaillent avec des seuils flous
- Les indices officiels (Heat Index NOAA, WBGT) sont opaques pour le grand public
- Les seuils diffèrent selon la vulnérabilité (enfants, seniors, cardiaques)
- En vacances, en sport, au jardin — le risque se mesure rarement

**HeatGuard** transforme la météo locale en **action concrète immédiate** :
- combien de minutes peux-tu travailler ?
- combien d'eau boire par heure ?
- quels signes d'alerte surveiller ?

---

## Pipeline

```
Météo (auto ou manuel)
        │
        ▼
┌──────────────┐
│ Heat Index + │  Steadman / NOAA simplifié
│ WBGT estimé  │  + correction soleil / vent
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Profil       │  Pénalité vulnérabilité
│ vulnérabilité│  (acclimaté, senior, enfant, cardiaque…)
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  WBGT effectif       │
│  → Niveau de risque  │  OK / VIG / HIGH / DANGER / EXTREME
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Plan d'action       │  min/h travail · mL/h hydratation
│  + signes d'alerte   │  + conduite en cas de coup de chaleur
└──────────────────────┘
```

---

## Modules

| Module | Fonction |
|---|---|
| **🌡️ Météo** | Récupération auto via Open-Meteo (gratuit, sans clé) ou saisie manuelle slider+input numérique |
| **👤 Profil** | Sélection population (acclimaté / senior / enfant / cardiaque…) + niveau d'effort (léger / modéré / intense) |
| **⏱ Plan** | Travail/heure (NIOSH), hydratation, signes d'alerte adaptés au niveau, conduite urgence coup de chaleur |
| **📋 Synthèse** | Action prioritaire, audit log, export bilan radio + main courante (.txt ou clipboard) |
| **📖 Doctrine** | Toutes les formules et seuils en transparence (Steadman, ACGIH, NIOSH, OMS) |
| **🎯 Sim** | 6 scénarios pré-configurés : canicule EHPAD, chantier BTP, match foot, parc enfants, marathon, reset |

---

## Niveaux de risque & action

Le bandeau du haut affiche **toujours l'action concrète** à effectuer :

| Niveau | WBGT effectif | Action affichée |
|---|---|---|
| 🟢 **OK** | < 25°C | « Pas de précaution particulière » |
| 🟡 **VIGILANCE** | 25 – 28°C | « Boire toutes les 20 min, surveiller » |
| 🟠 **ÉLEVÉ** | 28 – 30°C | « Pauses imposées X min/h » |
| 🔴 **DANGER** | 30 – 32°C | « Travail uniquement essentiel » |
| ⚫ **EXTRÊME** | ≥ 32°C | « ARRÊT — risque mortel » |

---

## Architecture

```js
// Pure scoring engine — deterministic, no DOM, no side effects
engine.heat_index(t, rh)              → °C ressenti (Steadman simplifié)
engine.wbgt(t, rh, sun, wind)         → WBGT estimé (°C)
engine.risk_level(wbgt)               → 0=OK, 1=VIG, 2=HIGH, 3=DANGER, 4=EXTREME
engine.wbgt_adjusted(wbgt, penalty)   → WBGT effectif (clampé ≥ 0)
engine.work_minutes(wbgt, intensity)  → minutes travail/heure ∈ [0, 60]
engine.fluid_rate(wbgt, intensity)    → mL/heure ∈ [250, 1000]

// Conversions API météo (Open-Meteo)
geo.windCategory(kmh)                 → 0 calme, -1 léger, -2 soutenu
geo.sunCategory(uv, isDay)            → 0 ombre, 2 mi-soleil, 4 plein soleil
```

Chaque fonction est **pure** : pas d'accès DOM, pas d'effet de bord, **déterministe** sur ses entrées.

---

## Garanties formelles

```
@invariant  heat_index ≥ 0
@invariant  wbgt ≥ 0
@invariant  risk_level ∈ {0, 1, 2, 3, 4}
@invariant  wbgt_adjusted ≥ 0 (clampé même si pénalité > wbgt)
@invariant  work_minutes ∈ [0, 60]
@invariant  fluid_rate ∈ [250, 1000] mL/h
@invariant  wind_category ∈ {-2, -1, 0}
@invariant  sun_category ∈ {0, 2, 4}
```

Si un invariant est violé à l'exécution, un **toast d'erreur visible** s'affiche immédiatement (au lieu d'un crash silencieux).

**95 exemples / 18 invariants formels** ont été validés par tests d'invariants lors du développement.

---

## Fonctionnalités

- 🌐 **API météo gratuite** — Open-Meteo (sans clé, sans inscription, CC-BY 4.0)
- 📍 **Géolocalisation auto** — un tap pour remplir température/humidité/vent/UV
- ✋ **Mode manuel** — slider + input numérique synchronisés (saisir 217 bar exact)
- ⚡ **100 % offline** après la 1ʳᵉ visite (Service Worker, cache-first)
- 📱 **PWA installable** sur Android / iOS / Windows / ChromeOS
- 🟢 **Mode clair sobre** — palette médicale, lisible en plein soleil
- 📻 **Export bilan compact** (1 tap copie clipboard) + main courante `.txt`
- 📖 **Onglet Doctrine** — toutes les hypothèses pédagogiques affichées
- 🎯 **6 simulations** — entraînement / sensibilisation / test
- 🚫 **Zéro tracking, zéro backend, zéro pub**

---

## Inspirations doctrinales

| Référence | Usage dans HeatGuard |
|---|---|
| **NOAA Rothfusz** [📄](https://www.wpc.ncep.noaa.gov/heat_index/hi_equation.html) | Heat Index simplifié (température ressentie) |
| **ACGIH TLV** | Seuils WBGT (5 niveaux de risque) |
| **NIOSH 2016** [📄](https://www.cdc.gov/niosh/docs/2016-106/) | Cycles travail/repos par WBGT et intensité |
| **Plan canicule France** [📄](https://www.santepubliquefrance.fr/climat/fortes-chaleurs-canicule) | Populations vulnérables, signes d'alerte |
| **OMS Heat-Health** [📄](https://www.who.int/europe/activities/planning-heat-health-action) | Hydratation, pénalités vulnérabilité |

> ⚠️ Les valeurs et seuils utilisés dans HeatGuard sont des **simplifications pédagogiques** inspirées de ces références — ils ne constituent pas des seuils réglementaires absolus.

---

## Limites de validation

- **Hypothèses pédagogiques** — coefficients (50 mL/2°C, pénalités population, work-rest cycles) inspirés de doctrine mais simplifiés
- **Heat Index simplifié** — pas la formule complète Rothfusz (9 termes), version linéaire approchée pour clarté
- **WBGT estimé** — le WBGT vrai exige psychromètre + globe noir ; ici on l'approxime depuis T + RH + soleil + vent
- **Géolocalisation imprécise sur PC** — utilise l'IP/Wi-Fi (~10 km) ; sur mobile c'est plus précis (GPS)
- **Pas un dispositif médical** — ne remplace pas l'avis médical en cas de symptômes
- **Pas un outil RH** — ne remplace pas la médecine du travail ni les obligations légales

---

## Stack

- **HTML / CSS / Vanilla JS** — un seul fichier `index.html` (~76 KB)
- **PWA** — `manifest.webmanifest`, `sw.js` (cache-first + network-first pour API), 3 icônes SVG
- **API** — [Open-Meteo](https://open-meteo.com/) (météo + reverse geocoding) — gratuit, CC-BY 4.0
- **Polices** — DM Sans + JetBrains Mono (Google Fonts, mises en cache)
- **Aucune dépendance JS** — pas de framework, pas de build, pas de bundler

---

## Lancer en local

```bash
# Cloner
git clone https://github.com/wilf974/HeatGuard.git
cd HeatGuard

# Servir en HTTP (Python 3)
python -m http.server 8000
```

Puis ouvre `http://localhost:8000/`.

> ⚠️ La géolocalisation **ne fonctionne pas** sur HTTP non-localhost (ex. `http://192.168.x.x`). Utilise `localhost`, ou la version déployée HTTPS sur GitHub Pages.

---

## Installation PWA

- **Android (Chrome)** : un bouton « ⤓ Installer » apparaît dans le header. Sinon : menu ⋮ → « Installer ».
- **iOS (Safari)** : Partager ⎋ → « Sur l'écran d'accueil ».
- **Desktop (Chrome / Edge)** : icône d'installation dans la barre d'URL.

---

## Roadmap

- [ ] Validation métier avec un médecin du travail / urgentiste
- [ ] Mode multi-personnes (groupe sportif, équipe BTP)
- [ ] Rappels horaires (notifications push web pour boire)
- [ ] Historique local des bilans (IndexedDB)
- [ ] Export PDF
- [ ] Internationalisation (anglais, espagnol, allemand)

---

## License

[MIT](LICENSE) — © 2026 wilf974

---

## Crédits

Conçu en **Vanilla HTML/CSS/JS**. Inspiré du projet sœur [FireOps](https://github.com/wilf974/FireOps) (aide à la décision sapeurs-pompiers) et [MedTriage](https://github.com/wilf974/MedTriage) (scoring clinique).

API météo : [Open-Meteo](https://open-meteo.com/) (CC-BY 4.0). Si vous êtes médecin du travail, urgentiste ou formateur, **vos retours sont précieux** via les Issues.
