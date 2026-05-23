// ──────────────────────────────────────────────
// Hook: Pets / Familiars API calls
// ──────────────────────────────────────────────
import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { usePetStore } from "@/stores/pet.store";
import { useChatStore } from "@/stores/chat.store";
import type { Pet, PetType, PetRarity } from "@marinara-engine/shared";

// ── Query key factory ──

export const petKeys = {
  all: ["pets"] as const,
  list: (chatId: string) => ["pets", chatId] as const,
};

// ── Types ──

interface ChatPetsResponse {
  activePetId: string | null;
  pets: Pet[];
}

interface GeneratePetBody {
  chatId: string;
  tipo?: PetType;
  raridade?: PetRarity;
  nivel?: number;
  nome?: string;
  wild?: boolean;
}

interface PetActionBody {
  chatId: string;
  acao: string;
}

// ── Hooks ──

/** Fetch all pets for the active chat and sync into the store. */
export function usePets() {
  const activeChatId = useChatStore((s) => s.activeChatId);
  const setPets = usePetStore((s) => s.setPets);

  return useQuery({
    queryKey: petKeys.list(activeChatId ?? ""),
    queryFn: async () => {
      const data = await api.get<ChatPetsResponse>(`/game/pets?chatId=${activeChatId}`);
      setPets(data.pets, data.activePetId);
      return data;
    },
    enabled: !!activeChatId,
    staleTime: 30_000,
  });
}

/** Generate a new pet (tamed or wild encounter). */
export function useGeneratePet() {
  const qc = useQueryClient();
  const activeChatId = useChatStore((s) => s.activeChatId);
  const addPet = usePetStore((s) => s.addPet);

  return useMutation({
    mutationFn: (body: Omit<GeneratePetBody, "chatId">) =>
      api.post<{ pet: Pet; chatPets: ChatPetsResponse }>("/game/pets/generate", {
        ...body,
        chatId: activeChatId,
      }),
    onSuccess: ({ pet }) => {
      addPet(pet);
      qc.invalidateQueries({ queryKey: petKeys.list(activeChatId ?? "") });
    },
  });
}

/** Set the active (displayed) pet. */
export function useSetActivePet() {
  const qc = useQueryClient();
  const activeChatId = useChatStore((s) => s.activeChatId);
  const setActivePet = usePetStore((s) => s.setActivePet);

  return useMutation({
    mutationFn: (petId: string | null) =>
      api.post<ChatPetsResponse>("/game/pets/active", {
        chatId: activeChatId,
        petId,
      }),
    onSuccess: (data) => {
      setActivePet(data.activePetId);
      qc.invalidateQueries({ queryKey: petKeys.list(activeChatId ?? "") });
    },
  });
}

/** Perform an action on a pet (acariciar, brincar, explorar, etc.). */
export function usePetAction() {
  const qc = useQueryClient();
  const activeChatId = useChatStore((s) => s.activeChatId);
  const store = usePetStore();

  return useMutation({
    mutationFn: ({ petId, acao }: { petId: string; acao: string }) =>
      api.post<{ result: PetActionBody; pet: Pet }>(`/game/pets/${petId}/action`, {
        chatId: activeChatId,
        acao,
      }),
    onMutate: () => store.setActing(true),
    onSuccess: ({ result, pet }) => {
      store.updatePet(pet);
      store.setLastActionResult(result as never);
      qc.invalidateQueries({ queryKey: petKeys.list(activeChatId ?? "") });
    },
    onSettled: () => store.setActing(false),
  });
}

/** Remove a pet from the collection. */
export function useRemovePet() {
  const qc = useQueryClient();
  const activeChatId = useChatStore((s) => s.activeChatId);
  const removePet = usePetStore((s) => s.removePet);

  return useMutation({
    mutationFn: (petId: string) =>
      api.post<ChatPetsResponse>(`/game/pets/${petId}/remove`, { chatId: activeChatId }),
    onSuccess: (_data, petId) => {
      removePet(petId);
      qc.invalidateQueries({ queryKey: petKeys.list(activeChatId ?? "") });
    },
  });
}

/** Convenience hook: generate loot drops and add to inventory store. */
export function useGenerateLoot() {
  const activeChatId = useChatStore((s) => s.activeChatId);

  return useMutation({
    mutationFn: ({ count = 3 }: { count?: number }) =>
      api.post<{ drops: Array<{ item: unknown; quantity: number }> }>("/game/loot/generate", {
        chatId: activeChatId,
        count,
      }),
  });
}

/** Generate combat loot after an encounter. */
export function useCombatLoot() {
  const activeChatId = useChatStore((s) => s.activeChatId);

  return useMutation({
    mutationFn: ({ enemyCount }: { enemyCount: number }) =>
      api.post<{ drops: Array<{ item: unknown; quantity: number }> }>("/game/combat/loot", {
        chatId: activeChatId,
        enemyCount,
      }),
  });
}
