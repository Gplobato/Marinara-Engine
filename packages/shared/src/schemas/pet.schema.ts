// ──────────────────────────────────────────────
// Pet / Familiar Zod Schemas
// ──────────────────────────────────────────────
import { z } from "zod";

export const petTypeSchema = z.enum(["combat", "companion", "mount", "familiar"]);

export const petRaritySchema = z.enum(["comum", "incomum", "raro", "épico", "lendário"]);

export const petStatusSchema = z.enum(["ativo", "descansando", "ferido", "evoluindo"]);

export const petStatsSchema = z.object({
  hp: z.number().min(0),
  maxHp: z.number().min(1),
  ataque: z.number().min(0),
  defesa: z.number().min(0),
  velocidade: z.number().min(0),
  lealdade: z.number().min(0).max(100),
});

export const petAbilitySchema = z.object({
  nome: z.string().min(1),
  descricao: z.string().min(1),
  tipo: z.enum(["ataque", "defesa", "suporte", "passiva"]),
  dano: z.number().min(0).optional(),
  cura: z.number().min(0).optional(),
  custo: z.number().min(0),
  cooldown: z.number().min(0),
});

export const petEvolutionSchema = z.object({
  nivelNecessario: z.number().min(1).max(100),
  vinculoNecessario: z.number().min(0).max(100),
  evoluiPara: z.string().min(1),
  novasHabilidades: z.array(z.string()),
  bonusStats: petStatsSchema.partial(),
});

export const petSchema = z.object({
  id: z.string().min(1),
  nome: z.string().min(1).max(50),
  especie: z.string().min(1),
  tipo: petTypeSchema,
  raridade: petRaritySchema,
  nivel: z.number().min(1).max(100),
  experiencia: z.number().min(0),
  experienciaParaProximo: z.number().min(1),
  stats: petStatsSchema,
  habilidades: z.array(petAbilitySchema),
  personalidade: z.string(),
  vinculo: z.number().min(0).max(100),
  status: petStatusSchema,
  sprite: z.string().optional(),
  evolucao: petEvolutionSchema.optional(),
  historia: z.array(z.string()),
  favorito: z.boolean(),
  obtidoEm: z.number(),
});

export const petCreateSchema = z.object({
  nome: z.string().min(1).max(50),
  especie: z.string().min(1),
  tipo: petTypeSchema,
  raridade: petRaritySchema,
  personalidade: z.string().optional(),
  sprite: z.string().optional(),
});

export const petUpdateSchema = petSchema.partial().omit({ id: true, obtidoEm: true });

export const petFeedSchema = z.object({
  petId: z.string().min(1),
  comida: z.string().min(1).optional(),
});

export const petTrainSchema = z.object({
  petId: z.string().min(1),
  foco: z.enum(["ataque", "defesa", "velocidade", "lealdade"]).optional(),
});

export const petActionSchema = z.object({
  petId: z.string().min(1),
  acao: z.string().min(1),
  alvo: z.string().optional(),
});

export type PetCreateInput = z.infer<typeof petCreateSchema>;
export type PetUpdateInput = z.infer<typeof petUpdateSchema>;