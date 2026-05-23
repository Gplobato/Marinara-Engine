// ──────────────────────────────────────────────
// Zustand Store: Pets / Familiars
// ──────────────────────────────────────────────
import { create } from "zustand";
import type { Pet, PetActionResult } from "@marinara-engine/shared";

export interface PetState {
  // ── Data ──
  pets: Pet[];
  activePetId: string | null;

  // ── UI state ──
  isOpen: boolean;
  selectedPetId: string | null;
  lastActionResult: PetActionResult | null;
  isActing: boolean;

  // ── Actions ──
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;

  setPets: (pets: Pet[], activePetId: string | null) => void;
  addPet: (pet: Pet) => void;
  removePet: (petId: string) => void;
  updatePet: (pet: Pet) => void;
  setActivePet: (petId: string | null) => void;
  selectPet: (petId: string | null) => void;

  setActing: (acting: boolean) => void;
  setLastActionResult: (result: PetActionResult | null) => void;

  reset: () => void;
}

const INITIAL_STATE = {
  pets: [] as Pet[],
  activePetId: null as string | null,
  isOpen: false,
  selectedPetId: null as string | null,
  lastActionResult: null as PetActionResult | null,
  isActing: false,
};

export const usePetStore = create<PetState>((set) => ({
  ...INITIAL_STATE,

  openPanel: () => set({ isOpen: true }),
  closePanel: () => set({ isOpen: false }),
  togglePanel: () => set((s) => ({ isOpen: !s.isOpen })),

  setPets: (pets, activePetId) => set({ pets, activePetId }),

  addPet: (pet) =>
    set((s) => ({
      pets: [...s.pets, pet],
      activePetId: s.activePetId ?? pet.id,
    })),

  removePet: (petId) =>
    set((s) => {
      const pets = s.pets.filter((p) => p.id !== petId);
      const activePetId = s.activePetId === petId ? (pets[0]?.id ?? null) : s.activePetId;
      const selectedPetId = s.selectedPetId === petId ? null : s.selectedPetId;
      return { pets, activePetId, selectedPetId };
    }),

  updatePet: (updated) =>
    set((s) => ({
      pets: s.pets.map((p) => (p.id === updated.id ? updated : p)),
    })),

  setActivePet: (petId) => set({ activePetId: petId }),
  selectPet: (petId) => set({ selectedPetId: petId }),

  setActing: (acting) => set({ isActing: acting }),
  setLastActionResult: (result) => set({ lastActionResult: result }),

  reset: () => set(INITIAL_STATE),
}));
