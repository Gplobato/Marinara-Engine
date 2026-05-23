// ──────────────────────────────────────────────
// Loot / Inventory Zod Schemas
// ──────────────────────────────────────────────
import { z } from "zod";

export const lootRaritySchema = z.enum([
  "comum",
  "mágico",
  "raro",
  "épico",
  "lendário",
  "mítico",
]);

export const equipmentSlotSchema = z.enum([
  "arma_principal",
  "arma_secundaria",
  "capacete",
  "peitoral",
  "luvas",
  "botas",
  "anel",
  "amuleto",
  "cinto",
  "ombros",
  "capa",
  "consumivel",
  "chave",
  "outro",
]);

export const lootEffectSchema = z.object({
  atributo: z.string().min(1),
  valor: z.number(),
  tipo: z.enum(["fixo", "porcentagem"]),
});

export const lootAffixSchema = z.object({
  nome: z.string().min(1),
  tipo: z.enum(["prefixo", "sufixo"]),
  efeitos: z.array(lootEffectSchema),
  nivel: z.number().min(1).max(7),
});

export const lootStatsSchema = z.object({
  danoMin: z.number().optional(),
  danoMax: z.number().optional(),
  armadura: z.number().optional(),
  forca: z.number().optional(),
  destreza: z.number().optional(),
  inteligencia: z.number().optional(),
  vitalidade: z.number().optional(),
  sorte: z.number().optional(),
  velocidadeAtaque: z.number().optional(),
  chanceCritico: z.number().optional(),
  danoCritico: z.number().optional(),
  resistenciaFogo: z.number().optional(),
  resistenciaGelo: z.number().optional(),
  resistenciaRaio: z.number().optional(),
  resistenciaSombra: z.number().optional(),
  resistenciaSagrada: z.number().optional(),
  vidaPorGolpe: z.number().optional(),
  manaPorGolpe: z.number().optional(),
  experienciaExtra: z.number().optional(),
  ouroExtra: z.number().optional(),
});

export const lootGemSchema = z.object({
  nome: z.string().min(1),
  raridade: lootRaritySchema,
  efeitos: z.array(lootEffectSchema),
  cor: z.string(),
});

export const lootItemSchema = z.object({
  id: z.string().min(1),
  nome: z.string().min(1),
  tipoBase: z.string().min(1),
  slot: equipmentSlotSchema,
  raridade: lootRaritySchema,
  nivel: z.number().min(1),
  nivelRequerido: z.number().min(1),
  stats: lootStatsSchema,
  afixos: z.array(lootAffixSchema),
  textoFlavor: z.string(),
  origem: z.string(),
  obtidoEm: z.number(),
  equipado: z.boolean(),
  vinculado: z.boolean(),
  valorVenda: z.number().min(0),
  conjuntoId: z.string().optional(),
  conjuntoNome: z.string().optional(),
  gemasEncaixadas: z.array(lootGemSchema),
  maxGemas: z.number().min(0),
});

export const lootGenerationParamsSchema = z.object({
  nivelJogador: z.number().min(1),
  nivelZona: z.number().min(1),
  dificuldade: z.enum(["normal", "difícil", "heroico", "lendário"]),
  tipoInimigo: z.string().optional(),
  sorteBonus: z.number().min(0).optional(),
  raridadeMinima: lootRaritySchema.optional(),
  slotsPreferidos: z.array(equipmentSlotSchema).optional(),
  quantidadeItens: z.number().min(1).max(20).optional(),
});

export const lootFilterSchema = z.object({
  raridades: z.array(lootRaritySchema).optional(),
  slots: z.array(equipmentSlotSchema).optional(),
  apenasEquipados: z.boolean().optional(),
  nivelMinimo: z.number().optional(),
  nivelMaximo: z.number().optional(),
  busca: z.string().optional(),
  ordenarPor: z.enum(["raridade", "nivel", "nome", "slot", "recente"]).optional(),
  ordem: z.enum(["asc", "desc"]).optional(),
});

export const equipItemSchema = z.object({
  itemId: z.string().min(1),
});

export const unequipItemSchema = z.object({
  itemId: z.string().min(1),
});

export const discardItemSchema = z.object({
  itemId: z.string().min(1),
});

export const socketGemSchema = z.object({
  itemId: z.string().min(1),
  gema: lootGemSchema,
});

export type LootGenerationParamsInput = z.infer<typeof lootGenerationParamsSchema>;
export type LootFilterInput = z.infer<typeof lootFilterSchema>;