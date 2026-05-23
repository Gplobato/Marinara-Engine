// ──────────────────────────────────────────────
// Procedural Loot Generator — Diablo-style
// ──────────────────────────────────────────────
import type {
  LootItem,
  LootRarity,
  LootAffix,
  LootEffect,
  LootStats,
  LootGenerationParams,
  LootDropResult,
  EquipmentSlot,
} from "../types/loot.js";

// ── Rarity weights (higher = more common) ──
const RARITY_WEIGHTS: Record<LootRarity, number> = {
  comum: 1000,
  mágico: 400,
  raro: 100,
  épico: 25,
  lendário: 5,
  mítico: 1,
};

// ── Rarity colors ──
export const RARITY_COLORS: Record<LootRarity, string> = {
  comum: "#9d9d9d",
  mágico: "#6969ff",
  raro: "#ffff66",
  épico: "#a335ee",
  lendário: "#ff8000",
  mítico: "#ff3333",
};

// ── Rarity labels PT-BR ──
export const RARITY_LABELS: Record<LootRarity, string> = {
  comum: "Comum",
  mágico: "Mágico",
  raro: "Raro",
  épico: "Épico",
  lendário: "Lendário",
  mítico: "Mítico",
};

// ── Base item pools ──
const ARMAS_PRINCIPAIS = [
  "Espada Longa", "Machado de Batalha", "Maça Pesada", "Lança",
  "Espada Curta", "Adaga", "Cimitarra", "Florete", "Katana",
  "Martelo de Guerra", "Foice", "Bastão Arcano", "Cajado",
  "Grimório", "Orbe Místico", "Arco Longo", "Besta", "Pistola Arcana",
];

const ARMAS_SECUNDARIAS = [
  "Escudo", "Broquel", "Adaga de Parry", "Foco Arcano",
  "Tomo de Feitiços", "Cruz Sagrada", "Totem Elemental",
];

const ARMADURAS: Record<EquipmentSlot, string[]> = {
  arma_principal: ARMAS_PRINCIPAIS,
  arma_secundaria: ARMAS_SECUNDARIAS,
  capacete: ["Elmo", "Capuz", "Coroa", "Diadema", "Gorro Arcano", "Máscara"],
  peitoral: ["Peitoral", "Túnica", "Cota de Malha", "Armadura de Placas", "Veste Arcana", "Couraça"],
  luvas: ["Manoplas", "Luvas de Couro", "Braçadeiras", "Garras", "Luvas Arcanas"],
  botas: ["Botas de Ferro", "Botas de Couro", "Sandálias", "Grevas", "Botas Aladas"],
  anel: ["Anel de Prata", "Anel de Ouro", "Anel de Platina", "Anel de Rubi", "Anel de Safira"],
  amuleto: ["Amuleto de Prata", "Amuleto de Ouro", "Pingente Místico", "Talismã", "Medalhão"],
  cinto: ["Cinto de Couro", "Cinto de Ferro", "Faixa Arcana", "Cordão Sagrado"],
  ombros: ["Ombreiras", "Espaldares", "Manto", "Pauldrons"],
  capa: ["Capa de Veludo", "Capa de Seda", "Manto Sombrio", "Capa do Andarilho"],
  consumivel: ["Poção de Vida", "Poção de Mana", "Elixir", "Pergaminho"],
  chave: ["Chave Enferrujada", "Chave de Prata", "Chave de Ouro"],
  outro: ["Pedra Rúnica", "Fragmento Estelar", "Essência Mágica"],
};

// ── Affix pools ──
const PREFIXOS: Record<number, string[]> = {
  1: ["Forte", "Ágil", "Resistente", "Afortunado", "Sábio"],
  2: ["Feroz", "Preciso", "Robusto", "Sortudo", "Iluminado"],
  3: ["Implacável", "Mortífero", "Inquebrável", "Abençoado", "Arcano"],
  4: ["Tempestuoso", "Forjado no Fogo", "Gélido", "Sombrio", "Sagrado"],
  5: ["Forjado na Tempestade", "Forjado no Abismo", "Celestial", "Dracônico", "Primordial"],
  6: ["Apocalíptico", "Divino", "Titânico", "Etéreo", "Ancestral"],
  7: ["Lendário", "Mítico", "Cósmico", "Transcendente", "Infinito"],
};

const SUFIXOS: Record<number, string[]> = {
  1: ["do Lobo", "da Coruja", "do Urso", "da Raposa", "do Corvo"],
  2: ["do Guerreiro", "do Mago", "do Ladrão", "do Paladino", "do Druida"],
  3: ["da Tempestade", "do Fogo", "do Gelo", "do Trovão", "da Sombra"],
  4: ["do Dragão", "da Fênix", "do Grifo", "da Hidra", "do Basilisco"],
  5: ["do Abismo", "dos Céus", "do Vazio", "da Aurora", "do Eclipse"],
  6: ["da Destruição", "da Criação", "da Eternidade", "do Destino", "do Caos"],
  7: ["dos Deuses", "dos Titãs", "do Cosmos", "da Realidade", "do Infinito"],
};

// ── Stat templates per slot ──
function getBaseStats(slot: EquipmentSlot, nivel: number): LootStats {
  const scale = 1 + (nivel - 1) * 0.15;
  const base: LootStats = {};

  switch (slot) {
    case "arma_principal":
      base.danoMin = Math.round(5 * scale);
      base.danoMax = Math.round(12 * scale);
      base.forca = Math.round(2 * scale);
      base.velocidadeAtaque = Math.round(3 * scale);
      break;
    case "arma_secundaria":
      base.armadura = Math.round(8 * scale);
      base.vitalidade = Math.round(2 * scale);
      base.destreza = Math.round(1 * scale);
      break;
    case "capacete":
      base.armadura = Math.round(6 * scale);
      base.inteligencia = Math.round(2 * scale);
      base.resistenciaSombra = Math.round(2 * scale);
      break;
    case "peitoral":
      base.armadura = Math.round(15 * scale);
      base.vitalidade = Math.round(4 * scale);
      base.forca = Math.round(2 * scale);
      break;
    case "luvas":
      base.armadura = Math.round(4 * scale);
      base.destreza = Math.round(3 * scale);
      base.velocidadeAtaque = Math.round(2 * scale);
      break;
    case "botas":
      base.armadura = Math.round(4 * scale);
      base.destreza = Math.round(2 * scale);
      base.velocidadeAtaque = Math.round(3 * scale);
      break;
    case "anel":
      base.sorte = Math.round(3 * scale);
      base.inteligencia = Math.round(2 * scale);
      base.chanceCritico = Math.round(1 * scale);
      break;
    case "amuleto":
      base.sorte = Math.round(4 * scale);
      base.vitalidade = Math.round(3 * scale);
      base.resistenciaSagrada = Math.round(2 * scale);
      break;
    case "cinto":
      base.armadura = Math.round(3 * scale);
      base.vitalidade = Math.round(3 * scale);
      base.forca = Math.round(1 * scale);
      break;
    case "ombros":
      base.armadura = Math.round(5 * scale);
      base.forca = Math.round(2 * scale);
      base.resistenciaFogo = Math.round(2 * scale);
      break;
    case "capa":
      base.armadura = Math.round(2 * scale);
      base.destreza = Math.round(2 * scale);
      base.resistenciaGelo = Math.round(2 * scale);
      break;
    default:
      base.sorte = Math.round(1 * scale);
      break;
  }

  return base;
}

// ── Random helpers ──
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)]!;
}

function weightedRandom<T extends string>(weights: Record<T, number>): T {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * total;
  for (const [key, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return key;
  }
  return entries[entries.length - 1]![0];
}

// ── Rarity rolling ──
function rollRarity(
  params: LootGenerationParams,
): LootRarity {
  const difficultyMultiplier: Record<string, number> = {
    normal: 1,
    difícil: 1.5,
    heroico: 2.5,
    lendário: 5,
  };

  const luckBonus = (params.sorteBonus ?? 0) * 0.02;
  const diffMult = difficultyMultiplier[params.dificuldade] ?? 1;
  const totalMult = diffMult + luckBonus;

  const adjustedWeights: Record<LootRarity, number> = { ...RARITY_WEIGHTS };
  const rarityOrder: LootRarity[] = ["comum", "mágico", "raro", "épico", "lendário", "mítico"];

  for (let i = 1; i < rarityOrder.length; i++) {
    const rarity = rarityOrder[i]!;
    adjustedWeights[rarity] = Math.round(adjustedWeights[rarity] * totalMult);
  }

  if (params.raridadeMinima) {
    const minIndex = rarityOrder.indexOf(params.raridadeMinima);
    for (let i = 0; i < minIndex; i++) {
      adjustedWeights[rarityOrder[i]!] = 0;
    }
  }

  return weightedRandom(adjustedWeights);
}

// ── Affix generation ──
function getAffixCount(rarity: LootRarity): number {
  switch (rarity) {
    case "comum": return 0;
    case "mágico": return randomInt(1, 2);
    case "raro": return randomInt(3, 4);
    case "épico": return randomInt(4, 5);
    case "lendário": return randomInt(5, 6);
    case "mítico": return randomInt(6, 7);
  }
}

function generateAffix(nivel: number, tipo: "prefixo" | "sufixo"): LootAffix {
  const tier = Math.min(7, Math.ceil(nivel / 15));
  const pool = tipo === "prefixo" ? PREFIXOS : SUFIXOS;
  const names = pool[tier] ?? pool[1]!;
  const nome = pickRandom(names);

  const efeitos: LootEffect[] = [];
  const numEffects = randomInt(1, Math.min(3, tier));

  const possibleAttrs = [
    "Força", "Destreza", "Inteligência", "Vitalidade", "Sorte",
    "Dano", "Armadura", "Velocidade de Ataque", "Chance Crítico",
    "Dano Crítico", "Resistência a Fogo", "Resistência a Gelo",
    "Resistência a Raio", "Resistência a Sombra", "Resistência Sagrada",
    "Vida por Golpe", "Mana por Golpe", "Experiência Extra", "Ouro Extra",
  ];

  for (let i = 0; i < numEffects; i++) {
    const attr = pickRandom(possibleAttrs);
    const isPercent = ["Chance Crítico", "Velocidade de Ataque", "Experiência Extra", "Ouro Extra"].includes(attr);
    const valor = isPercent
      ? randomInt(1, 3 + tier * 2)
      : randomInt(1 + tier * 2, 5 + tier * 5);

    efeitos.push({
      atributo: attr,
      valor,
      tipo: isPercent ? "porcentagem" : "fixo",
    });
  }

  return { nome, tipo, efeitos, nivel: tier };
}

// ── Item name generation ──
function generateItemName(
  tipoBase: string,
  afixos: LootAffix[],
  _rarity: LootRarity,
): string {
  const prefixo = afixos.find((a) => a.tipo === "prefixo");
  const sufixo = afixos.find((a) => a.tipo === "sufixo");

  const parts: string[] = [];
  if (prefixo) parts.push(prefixo.nome);
  parts.push(tipoBase);
  if (sufixo) parts.push(sufixo.nome);

  return parts.join(" ");
}

// ── Flavor text generation ──
const FLAVOR_TEMPLATES: Record<LootRarity, string[]> = {
  comum: [
    "Um item simples, mas funcional.",
    "Forjado por um ferreiro de vila.",
    "Nada de especial, mas cumpre seu propósito.",
  ],
  mágico: [
    "Emana uma leve aura mágica.",
    "Encantado por um mago aprendiz.",
    "Sussurros de poder residem neste item.",
  ],
  raro: [
    "Uma peça de notável qualidade e poder.",
    "Forjado nas profundezas das masmorras antigas.",
    "Carrega consigo ecos de batalhas passadas.",
  ],
  épico: [
    "Lendas são contadas sobre itens como este.",
    "Forjado por mestres artesãos em eras esquecidas.",
    "O poder que emana deste item é palpável.",
  ],
  lendário: [
    "Poucos itens no mundo possuem tal magnitude.",
    "Dizem que foi forjado por deuses antigos.",
    "Heróis de eras passadas empunharam este artefato.",
  ],
  mítico: [
    "Um artefato de poder incomensurável.",
    "A própria realidade parece se curvar ao seu redor.",
    "Ninguém sabe sua verdadeira origem — e talvez nunca saiba.",
  ],
};

function generateFlavorText(rarity: LootRarity): string {
  const templates = FLAVOR_TEMPLATES[rarity];
  return pickRandom(templates);
}

// ── Main generation function ──
export function generateLoot(params: LootGenerationParams): LootDropResult {
  const quantidade = params.quantidadeItens ?? randomInt(1, 4);
  const itens: LootItem[] = [];

  for (let i = 0; i < quantidade; i++) {
    const rarity = rollRarity(params);

    let slot: EquipmentSlot;
    if (params.slotsPreferidos && params.slotsPreferidos.length > 0) {
      slot = pickRandom(params.slotsPreferidos);
    } else {
      const allSlots = Object.keys(ARMADURAS) as EquipmentSlot[];
      const combatSlots = allSlots.filter(
        (s) => !["consumivel", "chave", "outro"].includes(s),
      );
      slot = pickRandom(combatSlots);
    }

    const tipoBase = pickRandom(ARMADURAS[slot] ?? ARMADURAS.outro);

    const numAffixes = getAffixCount(rarity);
    const afixos: LootAffix[] = [];
    const hasPrefix = numAffixes > 0 && Math.random() > 0.3;
    const hasSuffix = numAffixes > 0 && Math.random() > 0.3;

    if (hasPrefix) {
      afixos.push(generateAffix(params.nivelZona, "prefixo"));
    }
    if (hasSuffix) {
      afixos.push(generateAffix(params.nivelZona, "sufixo"));
    }

    const extraAffixes = numAffixes - afixos.length;
    for (let j = 0; j < extraAffixes; j++) {
      afixos.push(generateAffix(params.nivelZona, Math.random() > 0.5 ? "prefixo" : "sufixo"));
    }

    const stats = getBaseStats(slot, params.nivelZona);

    for (const affix of afixos) {
      for (const effect of affix.efeitos) {
        const attrMap: Record<string, keyof LootStats> = {
          "Força": "forca",
          "Destreza": "destreza",
          "Inteligência": "inteligencia",
          "Vitalidade": "vitalidade",
          "Sorte": "sorte",
          "Dano": "danoMin",
          "Armadura": "armadura",
          "Velocidade de Ataque": "velocidadeAtaque",
          "Chance Crítico": "chanceCritico",
          "Dano Crítico": "danoCritico",
          "Resistência a Fogo": "resistenciaFogo",
          "Resistência a Gelo": "resistenciaGelo",
          "Resistência a Raio": "resistenciaRaio",
          "Resistência a Sombra": "resistenciaSombra",
          "Resistência Sagrada": "resistenciaSagrada",
          "Vida por Golpe": "vidaPorGolpe",
          "Mana por Golpe": "manaPorGolpe",
          "Experiência Extra": "experienciaExtra",
          "Ouro Extra": "ouroExtra",
        };

        const statKey = attrMap[effect.atributo];
        if (statKey) {
          const current = stats[statKey] ?? 0;
          stats[statKey] = current + effect.valor;
        }
      }
    }

    if (stats.danoMin && !stats.danoMax) {
      stats.danoMax = Math.round(stats.danoMin * 2.2);
    }

    const nome = generateItemName(tipoBase, afixos, rarity);
    const textoFlavor = generateFlavorText(rarity);

    const item: LootItem = {
      id: `loot_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 8)}`,
      nome,
      tipoBase,
      slot,
      raridade: rarity,
      nivel: params.nivelZona + randomInt(-2, 3),
      nivelRequerido: Math.max(1, params.nivelZona - randomInt(0, 5)),
      stats,
      afixos,
      textoFlavor,
      origem: params.tipoInimigo ?? "Desconhecido",
      obtidoEm: Date.now(),
      equipado: false,
      vinculado: rarity === "mítico" || (rarity === "lendário" && Math.random() > 0.5),
      valorVenda: calculateSellValue(rarity, params.nivelZona),
      gemasEncaixadas: [],
      maxGemas: slot === "peitoral" ? 3 : slot === "arma_principal" ? 2 : 1,
    };

    itens.push(item);
  }

  const ouroBase = params.nivelZona * randomInt(5, 20);
  const ouroMult = params.dificuldade === "lendário" ? 5 :
    params.dificuldade === "heroico" ? 3 :
    params.dificuldade === "difícil" ? 2 : 1;
  const ouro = Math.round(ouroBase * ouroMult * (1 + (params.sorteBonus ?? 0) * 0.05));

  const experiencia = params.nivelZona * randomInt(10, 30) * ouroMult;

  const raridadeMaisAlta = itens.reduce((max, item) => {
    const order: LootRarity[] = ["comum", "mágico", "raro", "épico", "lendário", "mítico"];
    return order.indexOf(item.raridade) > order.indexOf(max) ? item.raridade : max;
  }, "comum" as LootRarity);

  const mensagemNarrativa = generateDropMessage(itens, ouro, raridadeMaisAlta, params.tipoInimigo);

  return { itens, ouro, experiencia, mensagemNarrativa };
}

function calculateSellValue(rarity: LootRarity, nivel: number): number {
  const baseValues: Record<LootRarity, number> = {
    comum: 5,
    mágico: 25,
    raro: 100,
    épico: 500,
    lendário: 2500,
    mítico: 10000,
  };
  return Math.round((baseValues[rarity] ?? 5) * (1 + nivel * 0.1));
}

function generateDropMessage(
  itens: LootItem[],
  ouro: number,
  raridadeMaisAlta: LootRarity,
  origem?: string,
): string {
  const origemStr = origem ? `derrotar ${origem}` : "explorar a área";
  const itemList = itens.map((i) => i.nome).join(", ");

  if (raridadeMaisAlta === "mítico") {
    return `✨ Um brilho vermelho-dourado ilumina o chão! Após ${origemStr}, você encontra: ${itemList}. Também obtém ${ouro} ouro.`;
  }
  if (raridadeMaisAlta === "lendário") {
    return `🌟 Um feixe de luz alaranjada surge! Após ${origemStr}, você descobre: ${itemList}. Também obtém ${ouro} ouro.`;
  }
  if (raridadeMaisAlta === "épico") {
    return `💜 Um brilho púrpura chama sua atenção! Após ${origemStr}, você encontra: ${itemList}. Também obtém ${ouro} ouro.`;
  }
  if (raridadeMaisAlta === "raro") {
    return `💛 Após ${origemStr}, você encontra: ${itemList}. Também obtém ${ouro} ouro.`;
  }
  return `Após ${origemStr}, você encontra: ${itemList}. Também obtém ${ouro} ouro.`;
}

// ── Utility: generate loot for combat victory ──
export function generateCombatLoot(
  nivelJogador: number,
  nivelInimigo: number,
  tipoInimigo: string,
  dificuldade: LootGenerationParams["dificuldade"] = "normal",
  sorteBonus = 0,
): LootDropResult {
  return generateLoot({
    nivelJogador,
    nivelZona: nivelInimigo,
    dificuldade,
    tipoInimigo,
    sorteBonus,
    quantidadeItens: randomInt(1, 4),
  });
}

// ── Utility: generate quest reward ──
export function generateQuestReward(
  nivelJogador: number,
  nivelMissao: number,
  nomeMissao: string,
  raridadeMinima: LootRarity = "mágico",
): LootDropResult {
  return generateLoot({
    nivelJogador,
    nivelZona: nivelMissao,
    dificuldade: "heroico",
    tipoInimigo: `Missão: ${nomeMissao}`,
    raridadeMinima,
    quantidadeItens: randomInt(1, 3),
    sorteBonus: 10,
  });
}