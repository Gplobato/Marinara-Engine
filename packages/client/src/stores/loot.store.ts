// ──────────────────────────────────────────────
// Zustand Store: Loot / Inventory
// ──────────────────────────────────────────────
import { create } from "zustand";
import type { LootItem, LootRarity } from "@marinara-engine/shared";

export interface InventoryEntry {
  item: LootItem;
  quantity: number;
  /** Slot index in the inventory grid (0-based) */
  slot: number;
}

export interface LootState {
  // ── Inventory ──
  inventory: InventoryEntry[];
  equipped: Partial<Record<string, LootItem>>; // slot name → item
  gold: number;

  // ── Pending loot (drop animation queue) ──
  pendingDrops: LootItem[];

  // ── UI state ──
  selectedItemSlot: number | null;
  isOpen: boolean;
  filterRarity: LootRarity | "all";

  // ── Actions ──
  openInventory: () => void;
  closeInventory: () => void;
  toggleInventory: () => void;

  addItems: (items: Array<{ item: LootItem; quantity: number }>) => void;
  removeItem: (slot: number, quantity?: number) => void;
  equipItem: (inventorySlot: number) => void;
  unequipItem: (equipSlot: string) => void;
  sellItem: (inventorySlot: number) => void;
  selectItem: (slot: number | null) => void;
  setFilterRarity: (rarity: LootRarity | "all") => void;

  clearPendingDrops: () => void;
  addGold: (amount: number) => void;
  reset: () => void;
}

const INITIAL_STATE = {
  inventory: [] as InventoryEntry[],
  equipped: {} as Partial<Record<string, LootItem>>,
  gold: 0,
  pendingDrops: [] as LootItem[],
  selectedItemSlot: null as number | null,
  isOpen: false,
  filterRarity: "all" as LootRarity | "all",
};

function nextFreeSlot(inventory: InventoryEntry[]): number {
  const used = new Set(inventory.map((e) => e.slot));
  let i = 0;
  while (used.has(i)) i++;
  return i;
}

export const useLootStore = create<LootState>((set, get) => ({
  ...INITIAL_STATE,

  openInventory: () => set({ isOpen: true }),
  closeInventory: () => set({ isOpen: false, selectedItemSlot: null }),
  toggleInventory: () => set((s) => ({ isOpen: !s.isOpen, selectedItemSlot: null })),

  addItems: (items) =>
    set((s) => {
      const inventory = [...s.inventory];
      const newDrops: LootItem[] = [];

      for (const { item, quantity } of items) {
        // Stack consumables/misc by name
        const existing = inventory.find(
          (e) =>
            e.item.nome === item.nome &&
            (item.slot === "consumivel" || item.slot === "outro"),
        );
        if (existing) {
          existing.quantity += quantity;
        } else {
          inventory.push({ item, quantity, slot: nextFreeSlot(inventory) });
        }
        newDrops.push(item);
      }

      return { inventory, pendingDrops: [...s.pendingDrops, ...newDrops] };
    }),

  removeItem: (slot, quantity = 1) =>
    set((s) => {
      const inventory = s.inventory
        .map((e) => (e.slot === slot ? { ...e, quantity: e.quantity - quantity } : e))
        .filter((e) => e.quantity > 0);
      return { inventory, selectedItemSlot: s.selectedItemSlot === slot ? null : s.selectedItemSlot };
    }),

  equipItem: (inventorySlot) =>
    set((s) => {
      const entry = s.inventory.find((e) => e.slot === inventorySlot);
      if (!entry) return {};

      const item = entry.item;
      const equipSlot = item.slot;
      const equipped = { ...s.equipped };

      // Unequip whatever is in that slot first
      const currentlyEquipped = equipped[equipSlot];
      let inventory = s.inventory.filter((e) => e.slot !== inventorySlot);

      if (currentlyEquipped) {
        inventory = [...inventory, { item: currentlyEquipped, quantity: 1, slot: nextFreeSlot(inventory) }];
      }

      equipped[equipSlot] = item;
      return { equipped, inventory };
    }),

  unequipItem: (equipSlot) =>
    set((s) => {
      const item = s.equipped[equipSlot];
      if (!item) return {};
      const equipped = { ...s.equipped };
      delete equipped[equipSlot];
      const inventory = [...s.inventory, { item, quantity: 1, slot: nextFreeSlot(s.inventory) }];
      return { equipped, inventory };
    }),

  sellItem: (inventorySlot) =>
    set((s) => {
      const entry = s.inventory.find((e) => e.slot === inventorySlot);
      if (!entry) return {};
      const sellPrice = Math.floor(entry.item.valorVenda * 0.4);
      const inventory = s.inventory
        .map((e) => (e.slot === inventorySlot ? { ...e, quantity: e.quantity - 1 } : e))
        .filter((e) => e.quantity > 0);
      return {
        inventory,
        gold: s.gold + sellPrice,
        selectedItemSlot: s.selectedItemSlot === inventorySlot ? null : s.selectedItemSlot,
      };
    }),

  selectItem: (slot) => set({ selectedItemSlot: slot }),
  setFilterRarity: (rarity) => set({ filterRarity: rarity }),
  clearPendingDrops: () => set({ pendingDrops: [] }),
  addGold: (amount) => set((s) => ({ gold: s.gold + amount })),

  reset: () => set(INITIAL_STATE),
}));
