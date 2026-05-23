// ──────────────────────────────────────────────
// Panel: Pets / Familiars
// ──────────────────────────────────────────────
import { useState } from "react";
import { Heart, Zap, Shield, Swords, Star, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { usePetStore } from "../../stores/pet.store";
import { usePets, useGeneratePet, usePetAction, useSetActivePet, useRemovePet } from "../../hooks/use-pets";
import { PET_RARITY_COLORS, PET_RARITY_LABELS } from "@marinara-engine/shared";
import type { Pet } from "@marinara-engine/shared";
import { cn } from "../../lib/utils";

// ── Rarity text colours ──
const RARITY_TEXT: Record<string, string> = {
  comum: "text-gray-300",
  incomum: "text-green-300",
  raro: "text-blue-300",
  épico: "text-purple-300",
  lendário: "text-orange-300",
};

// ── HP bar ──
function HpBar({ hp, maxHp }: { hp: number; maxHp: number }) {
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--accent)]">
      <div
        className={cn(
          "h-full rounded-full transition-all",
          pct > 60 ? "bg-green-500" : pct > 30 ? "bg-yellow-500" : "bg-red-500",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Bond bar ──
function BondBar({ vinculo }: { vinculo: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--accent)]">
      <div
        className="h-full rounded-full bg-pink-500 transition-all"
        style={{ width: `${vinculo}%` }}
      />
    </div>
  );
}

// ── XP bar ──
function XpBar({ xp, xpMax }: { xp: number; xpMax: number }) {
  const pct = Math.max(0, Math.min(100, (xp / xpMax) * 100));
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--accent)]">
      <div
        className="h-full rounded-full bg-cyan-500 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Pet card (compact list item) ──
function PetCard({
  pet,
  isActive,
  isSelected,
  onSelect,
  onSetActive,
}: {
  pet: Pet;
  isActive: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onSetActive: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative w-full rounded-lg border p-2.5 text-left transition-all",
        isSelected
          ? "border-[var(--primary)]/60 bg-[var(--accent)]"
          : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--border)]/80 hover:bg-[var(--accent)]/50",
      )}
    >
      {isActive && (
        <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-green-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
        </span>
      )}

      <div className="flex items-start gap-2">
        {/* Avatar placeholder */}
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-lg">
          {pet.especie.charAt(0)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className={cn("text-sm font-semibold", RARITY_TEXT[pet.raridade] ?? "text-[var(--foreground)]")}>
              {pet.nome}
            </span>
            <span className="text-[0.65rem] text-[var(--muted-foreground)]">Nv.{pet.nivel}</span>
          </div>
          <p className="text-[0.65rem] text-[var(--muted-foreground)]">
            {pet.especie} · {PET_RARITY_LABELS[pet.raridade]}
          </p>

          <div className="mt-1.5 space-y-1">
            <div className="flex items-center gap-1.5">
              <Heart size="0.625rem" className="flex-shrink-0 text-red-400" />
              <HpBar hp={pet.stats.hp} maxHp={pet.stats.maxHp} />
              <span className="text-[0.6rem] text-[var(--muted-foreground)]">
                {pet.stats.hp}/{pet.stats.maxHp}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star size="0.625rem" className="flex-shrink-0 text-pink-400" />
              <BondBar vinculo={pet.vinculo} />
              <span className="text-[0.6rem] text-[var(--muted-foreground)]">{pet.vinculo}%</span>
            </div>
          </div>
        </div>
      </div>

      {!isActive && (
        <button
          onClick={(e) => { e.stopPropagation(); onSetActive(); }}
          className="absolute right-2 top-2 rounded px-1.5 py-0.5 text-[0.6rem] text-[var(--muted-foreground)] opacity-0 transition-opacity hover:bg-[var(--accent)] group-hover:opacity-100"
        >
          Ativar
        </button>
      )}
    </button>
  );
}

// ── Pet detail view ──
const ACTIONS = [
  { id: "acariciar", label: "Acariciar", icon: Heart },
  { id: "brincar", label: "Brincar", icon: Star },
  { id: "treinar", label: "Treinar", icon: Zap },
  { id: "explorar", label: "Explorar", icon: Shield },
  { id: "descansar", label: "Descansar", icon: ChevronDown },
] as const;

function PetDetail({ pet, onClose }: { pet: Pet; onClose: () => void }) {
  const petAction = usePetAction();
  const removePet = useRemovePet();
  const lastResult = usePetStore((s) => s.lastActionResult);
  const isActing = usePetStore((s) => s.isActing);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className={cn("font-semibold", RARITY_TEXT[pet.raridade] ?? "text-[var(--foreground)]")}>
            {pet.nome}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            {pet.especie} · {pet.tipo} · {PET_RARITY_LABELS[pet.raridade]}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ChevronUp size="0.875rem" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-1.5 rounded-md bg-[var(--accent)]/30 p-2">
        {[
          { label: "ATK", value: pet.stats.ataque, icon: Swords, color: "text-red-400" },
          { label: "DEF", value: pet.stats.defesa, icon: Shield, color: "text-blue-400" },
          { label: "VEL", value: pet.stats.velocidade, icon: Zap, color: "text-yellow-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <Icon size="0.75rem" className={color} />
            <span className="text-xs font-bold">{value}</span>
            <span className="text-[0.6rem] text-[var(--muted-foreground)]">{label}</span>
          </div>
        ))}
      </div>

      {/* XP */}
      <div>
        <div className="mb-1 flex justify-between text-[0.65rem] text-[var(--muted-foreground)]">
          <span>XP</span>
          <span>{pet.experiencia}/{pet.experienciaParaProximo}</span>
        </div>
        <XpBar xp={pet.experiencia} xpMax={pet.experienciaParaProximo} />
      </div>

      {/* Abilities */}
      {pet.habilidades.length > 0 && (
        <div>
          <p className="mb-1 text-[0.65rem] font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
            Habilidades
          </p>
          <div className="flex flex-wrap gap-1">
            {pet.habilidades.map((h) => (
              <span
                key={h.nome}
                className="rounded-md bg-[var(--accent)] px-1.5 py-0.5 text-[0.65rem] text-[var(--foreground)]"
                title={h.descricao}
              >
                {h.nome}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Personality */}
      <p className="text-xs italic text-[var(--muted-foreground)]">"{pet.personalidade}"</p>

      {/* Last action result */}
      {lastResult && lastResult.petId === pet.id && (
        <div className="rounded-md bg-[var(--accent)]/40 p-2 text-xs text-[var(--foreground)]">
          {lastResult.narrativa}
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-5 gap-1">
        {ACTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => petAction.mutate({ petId: pet.id, acao: id })}
            disabled={isActing}
            title={label}
            className="flex flex-col items-center gap-0.5 rounded-lg bg-[var(--accent)] p-2 text-[0.6rem] text-[var(--muted-foreground)] transition-all hover:bg-[var(--accent)]/80 hover:text-[var(--foreground)] active:scale-95 disabled:opacity-50"
          >
            <Icon size="0.875rem" />
            {label}
          </button>
        ))}
      </div>

      {/* History toggle */}
      {pet.historia.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="flex items-center gap-1 text-[0.65rem] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            {showHistory ? <ChevronUp size="0.75rem" /> : <ChevronDown size="0.75rem" />}
            Histórico ({pet.historia.length})
          </button>
          {showHistory && (
            <ul className="mt-1.5 space-y-0.5">
              {pet.historia.slice(-5).map((h, i) => (
                <li key={i} className="text-[0.65rem] text-[var(--muted-foreground)]">
                  · {h}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Remove */}
      <button
        onClick={() => {
          if (confirm(`Liberar ${pet.nome}?`)) removePet.mutate(pet.id);
        }}
        className="text-[0.65rem] text-[var(--destructive)] hover:underline"
      >
        Liberar pet
      </button>
    </div>
  );
}

// ── Main panel ──
export function PetPanel() {
  usePets(); // sync from server on mount

  const pets = usePetStore((s) => s.pets);
  const activePetId = usePetStore((s) => s.activePetId);
  const selectedPetId = usePetStore((s) => s.selectedPetId);
  const selectPet = usePetStore((s) => s.selectPet);

  const generatePet = useGeneratePet();
  const setActivePet = useSetActivePet();

  const selectedPet = selectedPetId ? pets.find((p) => p.id === selectedPetId) ?? null : null;

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart size="0.875rem" className="text-pink-400" />
          <span className="text-sm font-medium">Pets & Familiares</span>
        </div>
        <button
          onClick={() => generatePet.mutate({})}
          disabled={generatePet.isPending}
          className="flex items-center gap-1 rounded-lg bg-[var(--accent)] px-2 py-1 text-xs text-[var(--muted-foreground)] transition-all hover:text-[var(--foreground)] active:scale-95 disabled:opacity-50"
          title="Obter novo pet"
        >
          <Plus size="0.75rem" />
          {generatePet.isPending ? "..." : "Novo"}
        </button>
      </div>

      {/* Pet list */}
      {pets.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <span className="text-4xl">🐾</span>
          <p className="text-sm text-[var(--muted-foreground)]">Nenhum pet ainda</p>
          <button
            onClick={() => generatePet.mutate({})}
            disabled={generatePet.isPending}
            className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--primary-foreground)] transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
          >
            {generatePet.isPending ? "Gerando..." : "Encontrar Pet"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {pets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              isActive={pet.id === activePetId}
              isSelected={pet.id === selectedPetId}
              onSelect={() => selectPet(selectedPetId === pet.id ? null : pet.id)}
              onSetActive={() => setActivePet.mutate(pet.id)}
            />
          ))}
        </div>
      )}

      {/* Selected pet detail */}
      {selectedPet && (
        <PetDetail pet={selectedPet} onClose={() => selectPet(null)} />
      )}
    </div>
  );
}
