// ──────────────────────────────────────────────
// Pet / Familiar Generator
// ──────────────────────────────────────────────
import type {
  Pet,
  PetType,
  PetRarity,
  PetStats,
  PetAbility,
  PetEvolution,
  PetActionResult,
  PetFeedResult,
  PetTrainResult,
} from "../types/pet.js";

// ── Species pools ──
const ESPECIES: Record<PetType, string[]> = {
  combat: [
    "Lobo Sombrio", "Urso de Ferro", "Pantera Fantasma",
    "Dragão Jovem", "Grifo de Batalha", "Escorpião de Aço",
    "Tigre Dente-de-Sabre", "Rinoceronte de Guerra",
    "Serpente de Fogo", "Golem de Pedra",
  ],
  companion: [
    "Raposa Ártica", "Coelho Lunar", "Corvo Mensageiro",
    "Gato Sombrio", "Cão de Caça", "Furão Mágico",
    "Esquilo Alado", "Texugo Protetor", "Lontra Brincalhona",
    "Ouriço de Cristal",
  ],
  mount: [
    "Cavalo Espectral", "Lobo Gigante", "Pégaso Jovem",
    "Lagarto de Montaria", "Avestruz de Guerra", "Cervo Sagrado",
    "Javali de Batalha", "Pantera Alada", "Cavalo Marinho",
    "Elefante Anão",
  ],
  familiar: [
    "Fada Luminosa", "Dragãozinho de Bolso", "Elemental de Fogo",
    "Espírito da Floresta", "Homúnculo Arcano", "Sombra Viva",
    "Fênix Filhote", "Golem de Cristal", "Salamandra Mágica",
    "Pequeno Observador",
  ],
};

// ── Personalities ──
const PERSONALIDADES = [
  "Corajoso", "Tímido", "Brincalhão", "Leal", "Teimoso",
  "Curioso", "Protetor", "Preguiçoso", "Energético", "Sábio",
  "Afetuoso", "Independente", "Desconfiado", "Amigável", "Feroz",
];

// ── Ability pools ──
const HABILIDADES_COMBATE: PetAbility[] = [
  { nome: "Mordida Feroz", descricao: "Uma mordida poderosa que causa dano extra.", tipo: "ataque", dano: 15, custo: 10, cooldown: 2 },
  { nome: "Garra Afiada", descricao: "Golpeia com garras afiadas.", tipo: "ataque", dano: 12, custo: 8, cooldown: 1 },
  { nome: "Investida", descricao: "Avança contra o inimigo com força total.", tipo: "ataque", dano: 20, custo: 15, cooldown: 3 },
  { nome: "Rugido Intimidador", descricao: "Um rugido que reduz o ataque do inimigo.", tipo: "defesa", custo: 5, cooldown: 3 },
  { nome: "Pele de Pedra", descricao: "Endurece a pele, aumentando a defesa.", tipo: "defesa", custo: 10, cooldown: 4 },
  { nome: "Fúria Selvagem", descricao: "Entra em fúria, aumentando o ataque.", tipo: "suporte", custo: 12, cooldown: 5 },
  { nome: "Presença Ameaçadora", descricao: "Intimida inimigos passivamente.", tipo: "passiva", custo: 0, cooldown: 0 },
];

const HABILIDADES_COMPANION: PetAbility[] = [
  { nome: "Faro Aguçado", descricao: "Encontra itens escondidos.", tipo: "suporte", custo: 5, cooldown: 3 },
  { nome: "Lamparina Viva", descricao: "Emite luz em áreas escuras.", tipo: "suporte", custo: 3, cooldown: 1 },
  { nome: "Intuição Animal", descricao: "Alerta sobre perigos próximos.", tipo: "passiva", custo: 0, cooldown: 0 },
  { nome: "Companhia Reconfortante", descricao: "Acalma o dono, restaurando energia.", tipo: "suporte", cura: 10, custo: 8, cooldown: 4 },
  { nome: "Busca Rápida", descricao: "Busca itens rapidamente.", tipo: "suporte", custo: 5, cooldown: 2 },
  { nome: "Sorte do Companheiro", descricao: "Aumenta passivamente a sorte.", tipo: "passiva", custo: 0, cooldown: 0 },
];

const HABILIDADES_MONTARIA: PetAbility[] = [
  { nome: "Galope Veloz", descricao: "Aumenta a velocidade de viagem.", tipo: "suporte", custo: 5, cooldown: 2 },
  { nome: "Carga de Montaria", descricao: "Atropela inimigos causando dano.", tipo: "ataque", dano: 18, custo: 12, cooldown: 3 },
  { nome: "Salto Poderoso", descricao: "Salta sobre obstáculos e inimigos.", tipo: "suporte", custo: 8, cooldown: 3 },
  { nome: "Resistência de Montaria", descricao: "Aumenta a defesa enquanto montado.", tipo: "defesa", custo: 10, cooldown: 4 },
  { nome: "Pisoteada", descricao: "Pisoteia inimigos no chão.", tipo: "ataque", dano: 14, custo: 10, cooldown: 2 },
  { nome: "Vínculo de Montaria", descricao: "Fortalece o vínculo com o cavaleiro.", tipo: "passiva", custo: 0, cooldown: 0 },
];

const HABILIDADES_FAMILIAR: PetAbility[] = [
  { nome: "Bola de Fogo", descricao: "Lança uma pequena bola de fogo.", tipo: "ataque", dano: 10, custo: 8, cooldown: 2 },
  { nome: "Escudo Arcano", descricao: "Cria um escudo mágico protetor.", tipo: "defesa", custo: 10, cooldown: 3 },
  { nome: "Toque Curativo", descricao: "Cura ferimentos leves.", tipo: "suporte", cura: 15, custo: 12, cooldown: 4 },
  { nome: "Telecinese Menor", descricao: "Move objetos pequenos à distância.", tipo: "suporte", custo: 5, cooldown: 1 },
  { nome: "Aura Mágica", descricao: "Aumenta passivamente o poder mágico.", tipo: "passiva", custo: 0, cooldown: 0 },
  { nome: "Rajada de Gelo", descricao: "Dispara fragmentos de gelo.", tipo: "ataque", dano: 8, custo: 6, cooldown: 1 },
  { nome: "Invisibilidade", descricao: "Fica invisível por um curto período.", tipo: "suporte", custo: 15, cooldown: 6 },
];

const HABILIDADES_POR_TIPO: Record<PetType, PetAbility[]> = {
  combat: HABILIDADES_COMBATE,
  companion: HABILIDADES_COMPANION,
  mount: HABILIDADES_MONTARIA,
  familiar: HABILIDADES_FAMILIAR,
};

// ── Evolution chains ──
const EVOLUCOES: Record<string, PetEvolution> = {
  "Lobo Sombrio": {
    nivelNecessario: 15,
    vinculoNecessario: 50,
    evoluiPara: "Lobo Espectral",
    novasHabilidades: ["Uivo Fantasma", "Sombra Voraz"],
    bonusStats: { ataque: 10, velocidade: 8, maxHp: 20 },
  },
  "Dragão Jovem": {
    nivelNecessario: 20,
    vinculoNecessario: 60,
    evoluiPara: "Dragão Adulto",
    novasHabilidades: ["Sopro de Fogo", "Escama Dracônica"],
    bonusStats: { ataque: 15, defesa: 10, maxHp: 30 },
  },
  "Fada Luminosa": {
    nivelNecessario: 12,
    vinculoNecessario: 40,
    evoluiPara: "Fada Radiante",
    novasHabilidades: ["Luz Curativa", "Bênção da Fada"],
    bonusStats: { ataque: 8, velocidade: 6, maxHp: 10 },
  },
  "Cavalo Espectral": {
    nivelNecessario: 18,
    vinculoNecessario: 55,
    evoluiPara: "Corcel Fantasma",
    novasHabilidades: ["Galope Fantasma", "Névoa Protetora"],
    bonusStats: { velocidade: 15, defesa: 8, maxHp: 25 },
  },
  "Raposa Ártica": {
    nivelNecessario: 14,
    vinculoNecessario: 45,
    evoluiPara: "Raposa de Gelo",
    novasHabilidades: ["Sopro Congelante", "Pele de Gelo"],
    bonusStats: { ataque: 6, defesa: 6, maxHp: 15 },
  },
};

// ── Rarity weights ──
const RARITY_WEIGHTS: Record<PetRarity, number> = {
  comum: 1000,
  incomum: 400,
  raro: 100,
  épico: 25,
  lendário: 5,
};

// ── Rarity colors ──
export const PET_RARITY_COLORS: Record<PetRarity, string> = {
  comum: "#9d9d9d",
  incomum: "#4caf50",
  raro: "#2196f3",
  épico: "#9c27b0",
  lendário: "#ff9800",
};

// ── Rarity labels PT-BR ──
export const PET_RARITY_LABELS: Record<PetRarity, string> = {
  comum: "Comum",
  incomum: "Incomum",
  raro: "Raro",
  épico: "Épico",
  lendário: "Lendário",
};

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

// ── Base stats per type ──
function getBaseStats(tipo: PetType, rarity: PetRarity): PetStats {
  const rarityMult: Record<PetRarity, number> = {
    comum: 1,
    incomum: 1.2,
    raro: 1.5,
    épico: 2,
    lendário: 3,
  };

  const mult = rarityMult[rarity];

  switch (tipo) {
    case "combat":
      return {
        hp: Math.round(80 * mult),
        maxHp: Math.round(80 * mult),
        ataque: Math.round(15 * mult),
        defesa: Math.round(10 * mult),
        velocidade: Math.round(8 * mult),
        lealdade: 50,
      };
    case "companion":
      return {
        hp: Math.round(50 * mult),
        maxHp: Math.round(50 * mult),
        ataque: Math.round(5 * mult),
        defesa: Math.round(8 * mult),
        velocidade: Math.round(10 * mult),
        lealdade: 60,
      };
    case "mount":
      return {
        hp: Math.round(100 * mult),
        maxHp: Math.round(100 * mult),
        ataque: Math.round(10 * mult),
        defesa: Math.round(12 * mult),
        velocidade: Math.round(15 * mult),
        lealdade: 40,
      };
    case "familiar":
      return {
        hp: Math.round(40 * mult),
        maxHp: Math.round(40 * mult),
        ataque: Math.round(12 * mult),
        defesa: Math.round(6 * mult),
        velocidade: Math.round(12 * mult),
        lealdade: 55,
      };
  }
}

// ── Main pet generation ──
export function generatePet(
  tipo?: PetType,
  rarity?: PetRarity,
  nome?: string,
): Pet {
  const petTipo = tipo ?? weightedRandom({ combat: 3, companion: 4, mount: 2, familiar: 3 } as Record<PetType, number>);
  const petRarity = rarity ?? weightedRandom(RARITY_WEIGHTS);
  const especie = pickRandom(ESPECIES[petTipo]);
  const personalidade = pickRandom(PERSONALIDADES);

  // Generate abilities
  const pool = HABILIDADES_POR_TIPO[petTipo];
  const numHabilidades = petRarity === "lendário" ? 4 :
    petRarity === "épico" ? 3 :
    petRarity === "raro" ? 2 : 1;
  const habilidades = pickRandomN(pool, numHabilidades);

  const stats = getBaseStats(petTipo, petRarity);

  // Check for evolution
  const evolucao = EVOLUCOES[especie];

  const pet: Pet = {
    id: `pet_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    nome: nome ?? especie,
    especie,
    tipo: petTipo,
    raridade: petRarity,
    nivel: 1,
    experiencia: 0,
    experienciaParaProximo: 100,
    stats,
    habilidades,
    personalidade,
    vinculo: randomInt(20, 40),
    status: "ativo",
    historia: [`Nascido em ${new Date().toLocaleDateString("pt-BR")}`],
    favorito: false,
    obtidoEm: Date.now(),
    evolucao,
  };

  return pet;
}

function pickRandomN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

// ── Pet actions ──
export function petAction(
  pet: Pet,
  acao: string,
  _alvo?: string,
): PetActionResult {
  const resultado: PetActionResult = {
    petId: pet.id,
    acao,
    resultado: "sucesso",
    narrativa: "",
  };

  switch (acao) {
    case "acariciar": {
      const vinculoGanho = randomInt(1, 5);
      pet.vinculo = Math.min(100, pet.vinculo + vinculoGanho);
      resultado.mudancaVinculo = vinculoGanho;
      resultado.narrativa = `${pet.nome} ronrona de felicidade com seu carinho. Vínculo +${vinculoGanho}!`;
      break;
    }
    case "brincar": {
      const vinculoGanho = randomInt(3, 8);
      const expGanha = randomInt(5, 15);
      pet.vinculo = Math.min(100, pet.vinculo + vinculoGanho);
      pet.experiencia += expGanha;
      resultado.mudancaVinculo = vinculoGanho;
      resultado.mudancasStats = { velocidade: 1 };
      resultado.narrativa = `${pet.nome} se diverte muito brincando com você! Vínculo +${vinculoGanho}, Experiência +${expGanha}.`;
      break;
    }
    case "explorar": {
      const expGanha = randomInt(10, 30);
      pet.experiencia += expGanha;
      resultado.narrativa = `${pet.nome} explora os arredores e descobre coisas interessantes! Experiência +${expGanha}.`;
      break;
    }
    case "descansar": {
      const hpRecuperado = Math.round(pet.stats.maxHp * 0.3);
      pet.stats.hp = Math.min(pet.stats.maxHp, pet.stats.hp + hpRecuperado);
      pet.status = "descansando";
      resultado.mudancasStats = { hp: pet.stats.hp };
      resultado.narrativa = `${pet.nome} descansa tranquilamente, recuperando ${hpRecuperado} de HP.`;
      break;
    }
    default: {
      resultado.narrativa = `${pet.nome} olha para você curiosamente.`;
      break;
    }
  }

  // Check for level up
  if (pet.experiencia >= pet.experienciaParaProximo) {
    pet.nivel += 1;
    pet.experiencia -= pet.experienciaParaProximo;
    pet.experienciaParaProximo = Math.round(pet.experienciaParaProximo * 1.5);

    // Stat gains on level up
    pet.stats.maxHp += randomInt(3, 8);
    pet.stats.hp = pet.stats.maxHp;
    pet.stats.ataque += randomInt(1, 3);
    pet.stats.defesa += randomInt(1, 3);
    pet.stats.velocidade += randomInt(1, 2);

    resultado.narrativa += ` ${pet.nome} subiu para o nível ${pet.nivel}!`;

    // Check evolution
    if (pet.evolucao && pet.nivel >= pet.evolucao.nivelNecessario && pet.vinculo >= pet.evolucao.vinculoNecessario) {
      const evolucao = pet.evolucao;
      pet.especie = evolucao.evoluiPara;
      pet.nome = evolucao.evoluiPara;
      pet.stats.maxHp += evolucao.bonusStats.maxHp ?? 0;
      pet.stats.hp = pet.stats.maxHp;
      pet.stats.ataque += evolucao.bonusStats.ataque ?? 0;
      pet.stats.defesa += evolucao.bonusStats.defesa ?? 0;
      pet.stats.velocidade += evolucao.bonusStats.velocidade ?? 0;

      resultado.evoluiu = true;
      resultado.novaEspecie = evolucao.evoluiPara;
      resultado.narrativa += ` ✨ ${pet.nome} evoluiu para ${evolucao.evoluiPara}!`;
      pet.historia.push(`Evoluiu para ${evolucao.evoluiPara} no nível ${pet.nivel}`);
    }
  }

  return resultado;
}

// ── Feed pet ──
export function feedPet(pet: Pet, comida?: string): PetFeedResult {
  const vinculoGanho = randomInt(2, 6);
  const hpRecuperado = Math.round(pet.stats.maxHp * 0.15);

  pet.vinculo = Math.min(100, pet.vinculo + vinculoGanho);
  pet.stats.hp = Math.min(pet.stats.maxHp, pet.stats.hp + hpRecuperado);

  const comidaStr = comida ?? "ração";
  const mensagem = `${pet.nome} come ${comidaStr} com gosto! Vínculo +${vinculoGanho}, HP +${hpRecuperado}.`;

  return {
    petId: pet.id,
    vinculoGanho,
    statsRecuperados: { hp: pet.stats.hp },
    mensagem,
  };
}

// ── Train pet ──
export function trainPet(
  pet: Pet,
  foco?: "ataque" | "defesa" | "velocidade" | "lealdade",
): PetTrainResult {
  const focoEscolhido = foco ?? pickRandom(["ataque", "defesa", "velocidade", "lealdade"] as const);
  const experienciaGanha = randomInt(15, 40);
  const statsGanhos: Partial<PetStats> = {};

  switch (focoEscolhido) {
    case "ataque":
      statsGanhos.ataque = randomInt(1, 3);
      break;
    case "defesa":
      statsGanhos.defesa = randomInt(1, 3);
      break;
    case "velocidade":
      statsGanhos.velocidade = randomInt(1, 3);
      break;
    case "lealdade":
      statsGanhos.lealdade = randomInt(2, 5);
      break;
  }

  pet.experiencia += experienciaGanha;
  if (statsGanhos.ataque) pet.stats.ataque += statsGanhos.ataque;
  if (statsGanhos.defesa) pet.stats.defesa += statsGanhos.defesa;
  if (statsGanhos.velocidade) pet.stats.velocidade += statsGanhos.velocidade;
  if (statsGanhos.lealdade) pet.stats.lealdade = Math.min(100, pet.stats.lealdade + statsGanhos.lealdade);

  const mensagem = `${pet.nome} treinou ${focoEscolhido} diligentemente! Experiência +${experienciaGanha}.`;

  return {
    petId: pet.id,
    experienciaGanha,
    statsGanhos,
    mensagem,
  };
}

// ── Generate wild pet encounter ──
export function generateWildPet(
  nivelJogador: number,
  bioma?: string,
): Pet {
  const tipos: PetType[] = ["combat", "companion", "familiar"];
  const tipo = pickRandom(tipos);

  // Higher level = better rarity chance
  const rarityMult = 1 + nivelJogador * 0.05;
  const adjustedWeights: Record<PetRarity, number> = { ...RARITY_WEIGHTS };
  adjustedWeights.raro = Math.round(adjustedWeights.raro * rarityMult);
  adjustedWeights.épico = Math.round(adjustedWeights.épico * rarityMult);
  adjustedWeights.lendário = Math.round(adjustedWeights.lendário * rarityMult);

  const rarity = weightedRandom(adjustedWeights);
  const pet = generatePet(tipo, rarity);

  // Scale to player level
  pet.nivel = Math.max(1, nivelJogador + randomInt(-3, 2));
  pet.stats.maxHp += pet.nivel * 5;
  pet.stats.hp = pet.stats.maxHp;
  pet.stats.ataque += pet.nivel * 2;
  pet.stats.defesa += pet.nivel * 2;
  pet.stats.velocidade += pet.nivel;

  if (bioma) {
    pet.historia.push(`Encontrado no bioma: ${bioma}`);
  }

  return pet;
}

// ── Level Up ──

/** Applies a level-up to a pet, scaling stats and checking evolution. */
export function petLevelUp(pet: Pet): Pet {
  const novoNivel = pet.nivel + 1;
  const xpExcedente = pet.experiencia - pet.experienciaParaProximo;
  const proximoXp = Math.floor(pet.experienciaParaProximo * 1.4);

  const updated: Pet = {
    ...pet,
    nivel: novoNivel,
    experiencia: Math.max(0, xpExcedente),
    experienciaParaProximo: proximoXp,
    stats: {
      ...pet.stats,
      maxHp: pet.stats.maxHp + 10,
      hp: pet.stats.maxHp + 10, // full heal on level up
      ataque: pet.stats.ataque + 2,
      defesa: pet.stats.defesa + 1,
      velocidade: pet.stats.velocidade + 1,
    },
    historia: [...pet.historia, `Alcançou o nível ${novoNivel}!`],
  };

  // Check evolution
  if (
    updated.evolucao &&
    novoNivel >= updated.evolucao.nivelNecessario &&
    updated.vinculo >= updated.evolucao.vinculoNecessario
  ) {
    const evo = updated.evolucao;
    return {
      ...updated,
      especie: evo.evoluiPara,
      stats: {
        ...updated.stats,
        ...evo.bonusStats,
        hp: (evo.bonusStats.maxHp ?? updated.stats.maxHp),
        maxHp: (evo.bonusStats.maxHp ?? updated.stats.maxHp),
      },
      status: "evoluindo" as const,
      historia: [...updated.historia, `Evoluiu para ${evo.evoluiPara}!`],
      evolucao: undefined,
    };
  }

  return updated;
}