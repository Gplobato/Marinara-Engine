// ──────────────────────────────────────────────
// Game: Pet / Familiar Service
//
// Manages pet state persistence and actions.
// Pet generation delegates to @marinara-engine/shared.
// ──────────────────────────────────────────────

import {
  generatePet,
  generateWildPet,
  petAction,
  type Pet,
  type PetActionResult,
  type PetType,
  type PetRarity,
} from "@marinara-engine/shared";

export type { Pet, PetActionResult };

// ── In-memory pet store per chat (persisted via chat metadata) ──

export interface ChatPets {
  activePetId: string | null;
  pets: Pet[];
}

export function createEmptyChatPets(): ChatPets {
  return { activePetId: null, pets: [] };
}

export function parseChatPets(raw: unknown): ChatPets {
  if (!raw || typeof raw !== "object") return createEmptyChatPets();
  const r = raw as Record<string, unknown>;
  return {
    activePetId: typeof r.activePetId === "string" ? r.activePetId : null,
    pets: Array.isArray(r.pets) ? (r.pets as Pet[]) : [],
  };
}

// ── CRUD helpers ──

export function getPet(chatPets: ChatPets, petId: string): Pet | undefined {
  return chatPets.pets.find((p) => p.id === petId);
}

export function addPet(chatPets: ChatPets, pet: Pet): ChatPets {
  return {
    ...chatPets,
    pets: [...chatPets.pets, pet],
    activePetId: chatPets.activePetId ?? pet.id,
  };
}

export function removePet(chatPets: ChatPets, petId: string): ChatPets {
  const pets = chatPets.pets.filter((p) => p.id !== petId);
  const activePetId =
    chatPets.activePetId === petId ? (pets[0]?.id ?? null) : chatPets.activePetId;
  return { pets, activePetId };
}

export function updatePet(chatPets: ChatPets, updated: Pet): ChatPets {
  return {
    ...chatPets,
    pets: chatPets.pets.map((p) => (p.id === updated.id ? updated : p)),
  };
}

export function setActivePet(chatPets: ChatPets, petId: string | null): ChatPets {
  if (petId !== null && !chatPets.pets.find((p) => p.id === petId)) {
    throw new Error(`Pet ${petId} not found`);
  }
  return { ...chatPets, activePetId: petId };
}

// ── Generation ──

export interface GeneratePetOptions {
  tipo?: PetType;
  raridade?: PetRarity;
  nivel?: number;
  nome?: string;
}

export function generateNewPet(opts: GeneratePetOptions = {}): Pet {
  return generatePet(opts.tipo, opts.raridade, opts.nome);
}

export function generateEncounterPet(nivel: number = 1): Pet {
  return generateWildPet(nivel);
}

// ── Actions ──

export function performPetAction(
  chatPets: ChatPets,
  petId: string,
  acao: string,
): { result: PetActionResult; chatPets: ChatPets } {
  const pet = getPet(chatPets, petId);
  if (!pet) throw new Error(`Pet ${petId} not found`);

  const result = petAction(pet, acao);

  // Apply stat changes from the action result
  let updatedPet: Pet = { ...pet };
  if (result.mudancasStats) {
    updatedPet = {
      ...updatedPet,
      stats: {
        ...updatedPet.stats,
        hp: Math.min(
          updatedPet.stats.maxHp,
          updatedPet.stats.hp + (result.mudancasStats.hp ?? 0),
        ),
      },
    };
  }
  if (result.mudancaVinculo) {
    updatedPet = {
      ...updatedPet,
      vinculo: Math.max(0, Math.min(100, updatedPet.vinculo + result.mudancaVinculo)),
    };
  }

  return {
    result,
    chatPets: updatePet(chatPets, updatedPet),
  };
}

// ── Prompt context builder ──

export function buildPetsPromptContext(chatPets: ChatPets): string {
  if (chatPets.pets.length === 0) return "";

  const activePet = chatPets.activePetId
    ? getPet(chatPets, chatPets.activePetId)
    : null;

  const lines: string[] = ["## Pets / Familiares do Jogador"];

  if (activePet) {
    lines.push(
      `**Pet Ativo:** ${activePet.nome} (${activePet.especie}, Nível ${activePet.nivel}, ${activePet.raridade})`,
      `  HP: ${activePet.stats.hp}/${activePet.stats.maxHp} | Vínculo: ${activePet.vinculo}/100 | Status: ${activePet.status}`,
      `  Personalidade: ${activePet.personalidade}`,
    );
    if (activePet.habilidades.length > 0) {
      lines.push(
        `  Habilidades: ${activePet.habilidades.map((h) => h.nome).join(", ")}`,
      );
    }
  }

  const others = chatPets.pets.filter((p) => p.id !== chatPets.activePetId);
  if (others.length > 0) {
    lines.push(
      `**Outros Pets:** ${others.map((p) => `${p.nome} (${p.especie}, Nv.${p.nivel})`).join(", ")}`,
    );
  }

  return lines.join("\n");
}
