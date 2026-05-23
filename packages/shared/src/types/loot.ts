// ──────────────────────────────────────────────
// Loot / Inventory Types — Diablo-style
// ──────────────────────────────────────────────

export type LootRarity = "comum" | "mágico" | "raro" | "épico" | "lendário" | "mítico";

export type EquipmentSlot =
  | "arma_principal"
  | "arma_secundaria"
  | "capacete"
  | "peitoral"
  | "luvas"
  | "botas"
  | "anel"
  | "amuleto"
  | "cinto"
  | "ombros"
  | "capa"
  | "consumivel"
  | "chave"
  | "outro";

export type LootAffixType = "prefixo" | "sufixo";

export interface LootEffect {
  atributo: string;
  valor: number;
  tipo: "fixo" | "porcentagem";
}

export interface LootAffix {
  nome: string;
  tipo: LootAffixType;
  efeitos: LootEffect[];
  nivel: number; // 1-7 (tiers)
}

export interface LootStats {
  danoMin?: number;
  danoMax?: number;
  armadura?: number;
  forca?: number;
  destreza?: number;
  inteligencia?: number;
  vitalidade?: number;
  sorte?: number;
  velocidadeAtaque?: number;
  chanceCritico?: number;
  danoCritico?: number;
  resistenciaFogo?: number;
  resistenciaGelo?: number;
  resistenciaRaio?: number;
  resistenciaSombra?: number;
  resistenciaSagrada?: number;
  vidaPorGolpe?: number;
  manaPorGolpe?: number;
  experienciaExtra?: number;
  ouroExtra?: number;
}

export interface LootItem {
  id: string;
  nome: string;
  tipoBase: string;
  slot: EquipmentSlot;
  raridade: LootRarity;
  nivel: number;
  nivelRequerido: number;
  stats: LootStats;
  afixos: LootAffix[];
  textoFlavor: string;
  origem: string; // de onde veio (nome do inimigo, missão, baú)
  obtidoEm: number; // timestamp
  equipado: boolean;
  vinculado: boolean; // soulbound
  valorVenda: number;
  conjuntoId?: string; // set item
  conjuntoNome?: string;
  gemasEncaixadas: LootGem[];
  maxGemas: number;
}

export interface LootGem {
  nome: string;
  raridade: LootRarity;
  efeitos: LootEffect[];
  cor: string; // hex color
}

export interface LootDropResult {
  itens: LootItem[];
  ouro: number;
  experiencia: number;
  mensagemNarrativa: string;
}

export interface LootGenerationParams {
  nivelJogador: number;
  nivelZona: number;
  dificuldade: "normal" | "difícil" | "heroico" | "lendário";
  tipoInimigo?: string;
  sorteBonus?: number;
  raridadeMinima?: LootRarity;
  slotsPreferidos?: EquipmentSlot[];
  quantidadeItens?: number;
}

export interface InventoryState {
  itens: LootItem[];
  ouro: number;
  capacidade: number;
  capacidadeMaxima: number;
}

export interface LootFilter {
  raridades?: LootRarity[];
  slots?: EquipmentSlot[];
  apenasEquipados?: boolean;
  nivelMinimo?: number;
  nivelMaximo?: number;
  busca?: string;
  ordenarPor?: "raridade" | "nivel" | "nome" | "slot" | "recente";
  ordem?: "asc" | "desc";
}