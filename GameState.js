// ============================================================
// GAME STATE — Forge & Fate
// ============================================================

export class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    // Run state
    this.selectedClass = null;
    this.wave = 0;
    this.baseHP = 100;
    this.maxBaseHP = 100;
    this.gold = 200;
    this.resources = { ore: 0, metal: 0, energy: 0, crystal: 0, essence: 0 };
    this.maxResources = { ore: 50, metal: 50, energy: 50, crystal: 30, essence: 20 };
    this.relics = [];
    this.placedBuildings = [];
    this.kills = 0;
    this.abilityLastUsed = 0;
    this.freeBuildsThisWave = 0;

    // Draft state
    this.draftOptions = 3;
    this.relicRerolls = 1;

    // Meta (persistent - load from storage)
    this.loadMeta();
  }

  loadMeta() {
    try {
      const saved = localStorage.getItem('forge_fate_meta');
      if (saved) {
        const data = JSON.parse(saved);
        this.metaEssence = data.essence || 0;
        this.metaUpgrades = data.upgrades || {};
        this.highestWave = data.highestWave || 0;
        this.totalRuns = data.totalRuns || 0;
        this.unlockedClasses = data.unlockedClasses || ['engineer', 'warlord'];
      } else {
        this.metaEssence = 0;
        this.metaUpgrades = {};
        this.highestWave = 0;
        this.totalRuns = 0;
        this.unlockedClasses = ['engineer', 'warlord'];
      }
    } catch (e) {
      this.metaEssence = 0;
      this.metaUpgrades = {};
      this.highestWave = 0;
      this.totalRuns = 0;
      this.unlockedClasses = ['engineer', 'warlord'];
    }
  }

  saveMeta() {
    try {
      const data = {
        essence: this.metaEssence,
        upgrades: this.metaUpgrades,
        highestWave: this.highestWave,
        totalRuns: this.totalRuns,
        unlockedClasses: this.unlockedClasses,
      };
      localStorage.setItem('forge_fate_meta', JSON.stringify(data));
    } catch (e) {}
  }

  applyMeta() {
    // Apply meta upgrades to current run
    const upgrades = this.metaUpgrades;

    if (upgrades.starting_gold) {
      this.gold += upgrades.starting_gold * 50;
    }
    if (upgrades.base_hp) {
      const bonus = upgrades.base_hp * 20;
      this.baseHP += bonus;
      this.maxBaseHP += bonus;
    }
    if (upgrades.draft_options) {
      this.draftOptions += upgrades.draft_options;
    }
    if (upgrades.relic_rerolls) {
      this.relicRerolls += upgrades.relic_rerolls;
    }
  }

  getMetaUpgradeRank(id) {
    return this.metaUpgrades[id] || 0;
  }

  addResource(resource, amount) {
    if (resource === 'gold') {
      this.gold += amount;
      return;
    }
    const max = this.maxResources[resource] || 50;
    this.resources[resource] = Math.min((this.resources[resource] || 0) + amount, max);
  }

  spendResource(resource, amount) {
    if (resource === 'gold') {
      if (this.gold < amount) return false;
      this.gold -= amount;
      return true;
    }
    if ((this.resources[resource] || 0) < amount) return false;
    this.resources[resource] -= amount;
    return true;
  }

  canAfford(cost) {
    for (const [resource, amount] of Object.entries(cost)) {
      if (resource === 'gold') {
        if (this.gold < amount) return false;
      } else {
        if ((this.resources[resource] || 0) < amount) return false;
      }
    }
    return true;
  }

  payCost(cost) {
    if (!this.canAfford(cost)) return false;
    for (const [resource, amount] of Object.entries(cost)) {
      this.spendResource(resource, amount);
    }
    return true;
  }

  hasRelic(id) {
    return this.relics.some(r => r.id === id);
  }

  addRelic(relic) {
    this.relics.push(relic);
  }

  getAbilityCooldownRemaining() {
    if (!this.selectedClass) return 0;
    const cooldown = this.selectedClass.ability.cooldown;
    const elapsed = Date.now() - this.abilityLastUsed;
    return Math.max(0, cooldown - elapsed);
  }

  isAbilityReady() {
    return this.getAbilityCooldownRemaining() === 0;
  }

  useAbility() {
    if (!this.isAbilityReady()) return false;
    this.abilityLastUsed = Date.now();
    return true;
  }

  takeDamage(amount) {
    // Check for shield relic effects
    let dmg = amount;
    this.baseHP = Math.max(0, this.baseHP - dmg);
    return this.baseHP <= 0;
  }

  onWaveComplete(wave, goldReward) {
    this.wave = wave;
    this.gold += goldReward;

    // Relic: wave_gold_bonus
    for (const relic of this.relics) {
      if (relic.effect.type === 'wave_gold_bonus') {
        this.gold += relic.effect.value;
      }
    }

    if (wave > this.highestWave) {
      this.highestWave = wave;
    }

    this.freeBuildsThisWave = 0;

    // free build relic
    for (const relic of this.relics) {
      if (relic.effect.type === 'free_build_per_wave') {
        this.freeBuildsThisWave += relic.effect.value;
      }
    }
  }

  endRun(won) {
    // Convert essence earned to meta
    const earned = Math.floor(this.resources.essence * 0.5 + this.wave * 2);
    this.metaEssence += earned;
    this.totalRuns++;

    // Unlock classes based on progress
    if (this.wave >= 3 && !this.unlockedClasses.includes('alchemist')) {
      this.unlockedClasses.push('alchemist');
    }
    if (this.wave >= 5 && !this.unlockedClasses.includes('naturalist')) {
      this.unlockedClasses.push('naturalist');
    }
    if (this.wave >= 7 && !this.unlockedClasses.includes('chronomancer')) {
      this.unlockedClasses.push('chronomancer');
    }

    this.saveMeta();
    return earned;
  }
}

// Singleton
export const gameState = new GameState();
