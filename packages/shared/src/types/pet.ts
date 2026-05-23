// ──────────────────────────────────────────────
// Pet / Familiar Types
// ──────────────────────────────────────────────

export type PetType = "combat" | "companion" | "mount" | "familiar";

export type PetRarity = "comum" | "incomum" | "raro" | "épico" | "lendário";

export type PetStatus = "ativo" | "descansando" | "ferido" | "evoluindo";

export interface PetStats {
  hp: number;
  maxHp: number;
  ataque: number;
  defesa: number;
  velocidade: number;
  lealdade: number;
}

export interface PetAbility {
  nome: string;
  descricao: string;
  tipo: "ataque" | "defesa" | "suporte" | "passiva";
  dano?: number;
  cura?: number;
  custo: number; // energia/stamina
  cooldown: number; // turnos
}

export interface PetEvolution {
  nivelNecessario: number;
  vinculoNecessario: number;
  evoluiPara: string; // nome da espécie evoluída
  novasHabilidades: string[]; // nomes das habilidades
  bonusStats: Partial<PetStats>;
}

export interface Pet {
  id: string;
  nome: string;
  especie: string;
  tipo: PetType;
  raridade: PetRarity;
  nivel: number;
  experiencia: number;
  experienciaParaProximo: number;
  stats: PetStats;
  habilidades: PetAbility[];
  personalidade: string;
  vinculo: number; // 0-100
  status: PetStatus;
  sprite?: string;
  evolucao?: PetEvolution;
  historia: string[]; // eventos importantes
  favorito: boolean;
  obtidoEm: number; // timestamp
}

export interface PetActionResult {
  petId: string;
  acao: string;
  resultado: string;
  narrativa: string;
  mudancasStats?: Partial<PetStats>;
  mudancaVinculo?: number;
  novaHabilidade?: PetAbility;
  evoluiu?: boolean;
  novaEspecie?: string;
}

export interface PetFeedResult {
  petId: string;
  vinculoGanho: number;
  statsRecuperados: Partial<PetStats>;
  mensagem: string;
}

export interface PetTrainResult {
  petId: string;
  experienciaGanha: number;
  statsGanhos: Partial<PetStats>;
  mensagem: string;
}