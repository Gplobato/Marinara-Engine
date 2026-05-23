// ──────────────────────────────────────────────
// Panel: Inventory (Diablo-style loot)
// ──────────────────────────────────────────────
import { useState } from "react";
import { Backpack, Coins, X, ShoppingBag, Shield, Sword } from "lucide-react";
import { useLootStore, type InventoryEntry } from "../../stores/loot.store";
import { useGenerateLoot, useCombatLoot } from "../../hooks/use-pets";
import { RARITY_COLORS, RARITY_LABELS } from "@marinara-engine/shared";
import type { LootRarity, LootItem } from "@marinara-engine/shared";
import { cn } from "../../lib/utils";

// ── Rarity colour map (Tailwind classes) ──
const RARITY_BORDER: Record<LootRarity, string> = {
  comum: "border-gray-400/50",
  mágico: "border-blue-400/70",
  raro: "border-yellow-400/70",
  épico: "border-purple-400/70",
  lendário: "border-orange-400/80",
  mítico: "border-red-400/90",
};

const RARITY_BG: Record<LootRarity, string> = {
  comum: "bg-gray-500/10",
  mágico: "bg-blue-500/10",
  raro: "bg-yellow-500/10",
  épico: "bg-purple-500/10",
  lendário: "bg-orange-500/15",
  mítico: "bg-red-500/20",
};

const RARITY_TEXT: Record<LootRarity, string> = {
  comum: "text-gray-300",
  mágico: "text-blue-300",
  raro: "text-yellow-300",
  épico: "text-purple-300",
  lendário: "text-orange-300",
  mítico: "text-red-300",
};

// ── Item tooltip ──
function ItemTooltip({ item }: { item: LootItem }) {
  return (
    <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 shadow-xl">
      <p className={cn("text-sm font-semibold", RARITY_TEXT[item.raridade])}>{item.nome}</p>
      <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
        {RARITY_LABELS[item.raridade]} · {item.slot}
      </p>
      {item.stats && Object.keys(item.stats).length > 0 && (
        <div className="mt-2 space-y-0.5 border-t border-[var(--border)] pt-2">
          {(Object.entries(item.stats) as [string, number][])
            .filter(([, v]) => v !== 0)
            .map(([k, v]) => (
              <p key={k} className="text-xs text-[var(--muted-foreground)]">
                <span className="text-[var(--foreground)]">+{v}</span> {k}
              </p>
            ))}
        </div>
      )}
      {item.afixos && item.afixos.length > 0 && (
        <div className="mt-2 space-y-0.5 border-t border-[var(--border)] pt-2">
          {item.afixos.map((a, i) => (
            <p key={i} className="text-xs text-blue-300">
              {a.nome}
            </p>
          ))}
        </div>
      )}
      {item.textoFlavor && (
        <p className="mt-2 border-t border-[var(--border)] pt-2 text-xs italic text-[var(--muted-foreground)]">
          {item.textoFlavor}
        </p>
      )}
      <p className="mt-2 text-xs text-yellow-400">
        <Coins size="0.625rem" className="mr-0.5 inline" />
        {Math.floor(item.valorVenda * 0.4)} ouro
      </p>
    </div>
  );
}

// ── Single inventory cell ──
function ItemCell({ entry, selected, onSelect }: { entry: InventoryEntry; selected: boolean; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);
  const item = entry.item;

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex aspect-square flex-col items-center justify-center rounded-lg border p-1 transition-all active:scale-95",
        RARITY_BORDER[item.raridade],
        RARITY_BG[item.raridade],
        selected && "ring-2 ring-[var(--primary)] ring-offset-1 ring-offset-[var(--background)]",
      )}
    >
      {/* Item icon placeholder — use first letter of slot */}
      <span className={cn("text-lg font-bold leading-none", RARITY_TEXT[item.raridade])}>
        {item.slot === "arma_principal" || item.slot === "arma_secundaria" ? (
          <Sword size="1.25rem" />
        ) : item.slot === "peitoral" || item.slot === "capacete" ? (
          <Shield size="1.25rem" />
        ) : (
          item.nome.charAt(0).toUpperCase()
        )}
      </span>
      {entry.quantity > 1 && (
        <span className="absolute bottom-0.5 right-1 text-[0.6rem] font-bold text-[var(--muted-foreground)]">
          {entry.quantity}
        </span>
      )}
      {/* Rarity glow dot */}
      <span
        className={cn(
          "absolute left-1 top-1 h-1.5 w-1.5 rounded-full",
          item.raridade === "mítico"
            ? "bg-red-400"
            : item.raridade === "lendário"
              ? "bg-orange-400"
              : item.raridade === "épico"
                ? "bg-purple-400"
                : item.raridade === "raro"
                  ? "bg-yellow-400"
                  : item.raridade === "mágico"
                    ? "bg-blue-400"
                    : "bg-gray-400",
        )}
      />
      {hovered && <ItemTooltip item={item} />}
    </button>
  );
}

// ── Item detail sidebar ──
function ItemDetail({ entry, onEquip, onSell, onDrop }: {
  entry: InventoryEntry;
  onEquip: () => void;
  onSell: () => void;
  onDrop: () => void;
}) {
  const item = entry.item;
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
      <div>
        <p className={cn("font-semibold", RARITY_TEXT[item.raridade])}>{item.nome}</p>
        <p className="text-xs text-[var(--muted-foreground)]">
          {RARITY_LABELS[item.raridade]} · {item.slot}
        </p>
      </div>

      {item.stats && Object.keys(item.stats).length > 0 && (
        <div className="space-y-1 rounded-md bg-[var(--accent)]/30 p-2">
          {(Object.entries(item.stats) as [string, number][])
            .filter(([, v]) => v !== 0)
            .map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-[var(--muted-foreground)]">{k}</span>
                <span className="font-medium text-green-400">+{v}</span>
              </div>
            ))}
        </div>
      )}

      {item.afixos && item.afixos.length > 0 && (
        <div className="space-y-1">
          {item.afixos.map((a, i) => (
            <p key={i} className="text-xs text-blue-300">
              ◆ {a.nome}
            </p>
          ))}
        </div>
      )}

      {item.textoFlavor && (
        <p className="text-xs italic text-[var(--muted-foreground)]">"{item.textoFlavor}"</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={onEquip}
          className="flex-1 rounded-md bg-[var(--primary)] px-2 py-1.5 text-xs font-medium text-[var(--primary-foreground)] transition-all hover:opacity-90 active:scale-95"
        >
          Equipar
        </button>
        <button
          onClick={onSell}
          className="flex items-center gap-1 rounded-md bg-yellow-500/20 px-2 py-1.5 text-xs font-medium text-yellow-300 transition-all hover:bg-yellow-500/30 active:scale-95"
        >
          <Coins size="0.75rem" />
          {Math.floor(item.valorVenda * 0.4)}
        </button>
        <button
          onClick={onDrop}
          className="rounded-md p-1.5 text-[var(--destructive)] transition-all hover:bg-[var(--destructive)]/10 active:scale-95"
          title="Descartar"
        >
          <X size="0.875rem" />
        </button>
      </div>
    </div>
  );
}

// ── Main panel ──
export function InventoryPanel() {
  const inventory = useLootStore((s) => s.inventory);
  const equipped = useLootStore((s) => s.equipped);
  const gold = useLootStore((s) => s.gold);
  const selectedItemSlot = useLootStore((s) => s.selectedItemSlot);
  const filterRarity = useLootStore((s) => s.filterRarity);
  const { selectItem, equipItem, sellItem, removeItem, setFilterRarity } = useLootStore();

  const generateLoot = useGenerateLoot();
  const combatLoot = useCombatLoot();

  const rarities: Array<LootRarity | "all"> = ["all", "comum", "mágico", "raro", "épico", "lendário", "mítico"];

  const filtered = filterRarity === "all"
    ? inventory
    : inventory.filter((e) => e.item.raridade === filterRarity);

  const selectedEntry = selectedItemSlot !== null
    ? inventory.find((e) => e.slot === selectedItemSlot) ?? null
    : null;

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Backpack size="0.875rem" className="text-[var(--muted-foreground)]" />
          <span className="text-sm font-medium">Inventário</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-yellow-400">
          <Coins size="0.75rem" />
          <span>{gold}</span>
        </div>
      </div>

      {/* Rarity filter */}
      <div className="flex flex-wrap gap-1">
        {rarities.map((r) => (
          <button
            key={r}
            onClick={() => setFilterRarity(r)}
            className={cn(
              "rounded-md px-2 py-0.5 text-[0.65rem] font-medium transition-all",
              filterRarity === r
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "bg-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
            )}
          >
            {r === "all" ? "Todos" : RARITY_LABELS[r as LootRarity]}
          </button>
        ))}
      </div>

      {/* Equipped slots summary */}
      {Object.keys(equipped).length > 0 && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--accent)]/20 p-2">
          <p className="mb-1.5 text-[0.65rem] font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
            Equipado
          </p>
          <div className="space-y-1">
            {Object.entries(equipped).map(([slot, item]) => item && (
              <div key={slot} className="flex items-center justify-between text-xs">
                <span className="text-[var(--muted-foreground)]">{slot}</span>
                <span className={RARITY_TEXT[item.raridade]}>{item.nome}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <ShoppingBag size="2rem" className="text-[var(--muted-foreground)]/40" />
          <p className="text-sm text-[var(--muted-foreground)]">Inventário vazio</p>
          <button
            onClick={() => generateLoot.mutate({ count: 3 })}
            disabled={generateLoot.isPending}
            className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--primary-foreground)] transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
          >
            {generateLoot.isPending ? "Gerando..." : "Gerar Loot"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-1.5">
          {filtered.map((entry) => (
            <ItemCell
              key={entry.slot}
              entry={entry}
              selected={selectedItemSlot === entry.slot}
              onSelect={() => selectItem(selectedItemSlot === entry.slot ? null : entry.slot)}
            />
          ))}
        </div>
      )}

      {/* Selected item detail */}
      {selectedEntry && (
        <ItemDetail
          entry={selectedEntry}
          onEquip={() => { equipItem(selectedEntry.slot); selectItem(null); }}
          onSell={() => { sellItem(selectedEntry.slot); selectItem(null); }}
          onDrop={() => { removeItem(selectedEntry.slot); selectItem(null); }}
        />
      )}

      {/* Actions */}
      {inventory.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={() => generateLoot.mutate({ count: 3 })}
            disabled={generateLoot.isPending}
            className="flex-1 rounded-lg bg-[var(--accent)] px-2 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-all hover:text-[var(--foreground)] active:scale-95 disabled:opacity-50"
          >
            {generateLoot.isPending ? "..." : "+ Loot"}
          </button>
          <button
            onClick={() => combatLoot.mutate({ enemyCount: 3 })}
            disabled={combatLoot.isPending}
            className="flex-1 rounded-lg bg-[var(--accent)] px-2 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-all hover:text-[var(--foreground)] active:scale-95 disabled:opacity-50"
          >
            {combatLoot.isPending ? "..." : "Loot Combate"}
          </button>
        </div>
      )}
    </div>
  );
}
