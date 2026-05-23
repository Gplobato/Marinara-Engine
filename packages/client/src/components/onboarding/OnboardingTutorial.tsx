// ──────────────────────────────────────────────
// Onboarding Tutorial — first-time guided tour
// ──────────────────────────────────────────────
import { useState, useEffect, useCallback, useRef } from "react";
import { useUIStore } from "../../stores/ui.store";
import { useChatStore } from "../../stores/chat.store";
import { useSidecarStore } from "../../stores/sidecar.store";
import { useCreateChat } from "../../hooks/use-chats";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowRightLeft } from "lucide-react";
import { PROFESSOR_MARI_ID, DEFAULT_CONNECTION_ID } from "@marinara-engine/shared";
import { api } from "../../lib/api-client";

// ─── Step definitions ─────────────────────────

interface TourStep {
  /** data-tour attribute value of the element to highlight, or null for centered modal */
  target: string | null;
  title: string;
  body: string;
  /** Preferred side for the tooltip relative to the highlighted element */
  side?: "top" | "bottom" | "left" | "right";
  /** If set, show a special action button with this label */
  actionLabel?: string;
  /** Key used internally to trigger special step actions */
  actionKey?: string;
  /** Professor Mari sprite to display */
  sprite?: { src: string; flip?: boolean };
}

const STEPS: TourStep[] = [
  {
    target: null,
    title: "Bem-vindo ao Marinara Engine!",
    body: "Olá! Aqui está um tutorial rápido para te mostrar o app. Já conhece tudo? Fique à vontade para pular!\n\n**Aviso:** pular o tutorial vai me fazer chorar.",
    sprite: { src: "/sprites/mari/Mari_wave.png" },
  },
  {
    target: "sidebar-toggle",
    title: "Barra Lateral de Conversas",
    body: "É aqui que ficam todas as suas conversas. Crie novas conversas, pesquise e organize seu histórico. Você pode ter quantas conversas quiser!",
    side: "right",
    sprite: { src: "/sprites/mari/Mari_point_middle_left.png" },
  },
  {
    target: "panel-buttons",
    title: "Botões de Painel",
    body: "Esses botões (da esquerda para a direita) abrem painéis para:\n- **Navegador:** explore fichas para download e mais,\n- **Personagens:** veja e gerencie todas as suas fichas de personagem,\n- **Livros de Lore:** livros de lore com todas as informações que você quiser,\n- **Predefinições:** seção para prompts,\n- **Conexões:** configure sua conexão de API aqui,\n- **Agentes:** pense neles como extensões das suas conversas, cada agente faz algo além da conversa principal, ex.: rastreia detalhes, cria imagens, etc.,\n- **Persona:** personas que você interpreta,\n- **Configurações:** configurações de todo o aplicativo.\n\nExplore todos!",
    side: "bottom",
    sprite: { src: "/sprites/mari/Mari_point_up_left.png", flip: true },
  },
  {
    target: "chat-area",
    title: "Área de Conversa",
    body: "Este é seu espaço de trabalho principal, onde você conversa com personagens de IA, curte roleplay e lê histórias geradas. As mensagens aparecem aqui em tempo real.",
    side: "left",
    sprite: { src: "/sprites/mari/Mari_point_middle_left.png" },
  },
  {
    target: null,
    title: "Três Modos de Conversa",
    body: "O Marinara Engine tem três modos de conversa:\n\n**Conversa:** Como DMs do Discord. Mensagens casuais, agendas de personagens, status e mensagens autônomas. Ótimo para slice-of-life e bate-papo.\n\n**Roleplay:** Escrita criativa e narrativa. Narração rica, agentes de IA que cuidam do rastreamento, narrativa e mais. Perfeito para aventuras e histórias imersivas.\n\n**Jogo:** Uma camada de romance visual com sabor de RPG sobre sua história, dirigida por um Mestre de Jogo de IA. Efeitos visuais, combate tático, gerenciamento de grupo, enredo desenvolvido e mais. A experiência mais imersiva de todas.\n\nAo selecionar qualquer uma dessas opções, você verá um assistente de configuração — não se preocupe com nada, vamos te guiar passo a passo!",
    sprite: { src: "/sprites/mari/Mari_explaining.png" },
  },
  {
    target: null,
    title: "Conheça a Professora Mari!",
    body: "Sou eu! Sou sua assistente integrada. Venho pré-instalada e estou sempre aqui para ajudar. Você pode me enviar mensagens a qualquer momento para perguntar sobre o app, e posso até **fazer coisas por você:** como criar personagens, personas, iniciar novas conversas e navegar pelo app.\n\n**Atenção:** quando você me pede para atualizar ou editar um personagem ou persona, escrevo diretamente na sua biblioteca. Edições de personagens mantêm um snapshot recuperável que você pode reverter pelo histórico do personagem, mas **edições de persona sobrescrevem sem snapshot — faça backup da persona primeiro** se quiser manter a versão antiga.\n\nJá configurei uma conversa comigo na barra lateral. Fique à vontade para me perguntar qualquer coisa após o tour!",
    sprite: { src: "/sprites/mari/Mari_greet.png" },
  },
  {
    target: null,
    title: "Configure uma Conexão",
    body: "Antes de começar a conversar, você precisará conectar um provedor de IA. Clique no ícone de corrente (🔗) nos botões de painel no canto superior direito e adicione sua chave de API para OpenAI, Anthropic ou outro provedor.",
    sprite: { src: "/sprites/mari/Mari_explaining.png" },
  },
  {
    target: null,
    title: "Opcional: Modelo de IA Local",
    body: "Se quiser que o Marinara rode um modelo auxiliar no seu próprio dispositivo, abra o painel de Conexões e use o cartão de Modelo Local. A partir daí você pode abrir as configurações de Modelo de IA Local, instalar o runtime para sua máquina e escolher uma predefinição Gemma curada ou seu próprio modelo local.",
    actionLabel: "Abrir Modelo Local",
    actionKey: "local-model",
    sprite: { src: "/sprites/mari/Mari_thinking.png" },
  },
  {
    target: null,
    title: "Migrando do SillyTavern?",
    body: "Se você tem personagens, conversas ou predefinições do SillyTavern, pode importar tudo de uma vez pelo painel de Configurações.",
    actionLabel: "Ir para lá",
    actionKey: "migrate",
    sprite: { src: "/sprites/mari/Mari_thinking.png" },
  },
  {
    target: null,
    title: "Tudo Pronto!",
    body: "Procure os ícones (?) pelo app. Passe o mouse sobre eles a qualquer momento para saber o que cada opção faz. Divirta-se explorando!\n\nE se tiver mais dúvidas, precisar de ajuda ou quiser reportar um bug, fique à vontade para entrar no nosso servidor do Discord! Você encontra o link de convite na página inicial.",
    sprite: { src: "/sprites/mari/Mari_greet.png" },
  },
];

// ─── Spotlight overlay helpers ────────────────

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PAD = 8; // px padding around the spotlight cutout

function getTargetRect(target: string): Rect | null {
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function _buildClipPath(rect: Rect): string {
  const t = Math.max(0, rect.top - PAD);
  const l = Math.max(0, rect.left - PAD);
  const b = rect.top + rect.height + PAD;
  const r = rect.left + rect.width + PAD;
  const rad = 12; // border-radius in px for the cutout
  // Use inset with round for a nice cutout
  return `polygon(
    0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
    ${l}px ${t + rad}px,
    ${l + rad}px ${t}px,
    ${r - rad}px ${t}px,
    ${r}px ${t + rad}px,
    ${r}px ${b - rad}px,
    ${r - rad}px ${b}px,
    ${l + rad}px ${b}px,
    ${l}px ${b - rad}px,
    ${l}px ${t + rad}px
  )`;
}

// ─── Tooltip position ─────────────────────────

function computeTooltipStyle(rect: Rect, side: "top" | "bottom" | "left" | "right" = "right"): React.CSSProperties {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isMobile = vw < 640;
  const VIEWPORT_MARGIN = isMobile ? 12 : 16;
  const TOOLTIP_W = isMobile ? Math.min(vw - VIEWPORT_MARGIN * 2, 320) : Math.min(320, vw - VIEWPORT_MARGIN * 2);
  const GAP = isMobile ? 8 : 16;
  const available = {
    right: vw - (rect.left + rect.width + GAP + PAD) - VIEWPORT_MARGIN,
    left: rect.left - GAP - PAD - VIEWPORT_MARGIN,
    bottom: vh - (rect.top + rect.height + GAP + PAD) - VIEWPORT_MARGIN,
    top: rect.top - GAP - PAD - VIEWPORT_MARGIN,
  };

  // On small screens, always center horizontally and position below target
  if (isMobile) {
    const top = Math.min(rect.top + rect.height + GAP + PAD, vh * 0.55);
    return {
      position: "fixed",
      top,
      left: (vw - TOOLTIP_W) / 2,
      width: TOOLTIP_W,
      maxHeight: `${Math.max(200, vh - top - VIEWPORT_MARGIN)}px`,
      overflowY: "auto" as const,
      overflowX: "hidden" as const,
      overscrollBehavior: "contain" as const,
    };
  }

  const minScrollableHeight = isMobile ? 220 : 340;
  const preferredVerticalSide = available.bottom >= available.top ? "bottom" : "top";
  let placement = side;

  if (side === "right" && available.right < TOOLTIP_W && available.left >= TOOLTIP_W) {
    placement = "left";
  } else if (side === "left" && available.left < TOOLTIP_W && available.right >= TOOLTIP_W) {
    placement = "right";
  } else if (side === "bottom" && available.bottom < minScrollableHeight && available.top >= minScrollableHeight) {
    placement = "top";
  } else if (side === "top" && available.top < minScrollableHeight && available.bottom >= minScrollableHeight) {
    placement = "bottom";
  } else if ((side === "right" || side === "left") && available.right < TOOLTIP_W && available.left < TOOLTIP_W) {
    placement = preferredVerticalSide;
  } else if (
    (side === "top" || side === "bottom") &&
    available.top < minScrollableHeight &&
    available.bottom < minScrollableHeight
  ) {
    placement = available.right >= available.left ? "right" : "left";
  }

  let maxHeight = vh - VIEWPORT_MARGIN * 2;

  let top = 0;
  let left = 0;

  if (placement === "right") {
    maxHeight = Math.max(minScrollableHeight, vh - VIEWPORT_MARGIN * 2);
    top = rect.top + rect.height / 2 - maxHeight / 2;
    left = rect.left + rect.width + GAP + PAD;
    if (left + TOOLTIP_W > vw - VIEWPORT_MARGIN) {
      left = rect.left - TOOLTIP_W - GAP - PAD;
    }
  } else if (placement === "left") {
    maxHeight = Math.max(minScrollableHeight, vh - VIEWPORT_MARGIN * 2);
    top = rect.top + rect.height / 2 - maxHeight / 2;
    left = rect.left - TOOLTIP_W - GAP - PAD;
    if (left < VIEWPORT_MARGIN) {
      left = rect.left + rect.width + GAP + PAD;
    }
  } else if (placement === "bottom") {
    maxHeight = Math.max(minScrollableHeight, Math.min(vh - VIEWPORT_MARGIN * 2, available.bottom));
    top = rect.top + rect.height + GAP + PAD;
    left = rect.left + rect.width / 2 - TOOLTIP_W / 2;
  } else {
    maxHeight = Math.max(minScrollableHeight, Math.min(vh - VIEWPORT_MARGIN * 2, available.top));
    top = rect.top - GAP - PAD - maxHeight;
    left = rect.left + rect.width / 2 - TOOLTIP_W / 2;
  }

  // Clamp within viewport
  left = Math.max(VIEWPORT_MARGIN, Math.min(left, vw - TOOLTIP_W - VIEWPORT_MARGIN));
  top = Math.max(VIEWPORT_MARGIN, Math.min(top, vh - maxHeight - VIEWPORT_MARGIN));

  return {
    position: "fixed",
    top,
    left,
    width: TOOLTIP_W,
    maxHeight: `${maxHeight}px`,
    overflowY: "auto",
    overflowX: "hidden",
    overscrollBehavior: "contain",
  };
}

// ─── Card content (shared between centered & positioned variants) ──

function TourCardContent({
  step,
  currentStep,
  isLast,
  onNext,
  onSkip,
  onAction,
}: {
  step: number;
  currentStep: TourStep;
  isLast: boolean;
  onNext: () => void;
  onSkip: () => void;
  onAction?: (key: string) => void;
}) {
  return (
    <>
      {/* Professor Mari sprite */}
      {currentStep.sprite && (
        <div className="mb-2 flex justify-center">
          <img
            src={currentStep.sprite.src}
            alt="Professor Mari"
            className="h-32 max-h-[15vh] w-auto object-contain drop-shadow-lg"
            style={currentStep.sprite.flip ? { transform: "scaleX(-1)" } : undefined}
            draggable={false}
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">{currentStep.title}</h3>
      </div>

      {/* Body */}
      <p className="mb-4 break-words text-xs leading-relaxed text-[var(--muted-foreground)]">
        {currentStep.body.split("\n").map((line, i, arr) => (
          <span key={i}>
            {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={j} className="font-semibold text-[var(--foreground)]">
                  {part.slice(2, -2)}
                </strong>
              ) : (
                <span key={j}>{part}</span>
              ),
            )}
            {i < arr.length - 1 && <br />}
          </span>
        ))}
      </p>

      {/* Progress dots */}
      <div className="mb-3 flex items-center justify-center gap-1.5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step
                ? "w-4 bg-[var(--primary)]"
                : i < step
                  ? "w-1.5 bg-[var(--primary)]/40"
                  : "w-1.5 bg-[var(--muted-foreground)]/20"
            }`}
          />
        ))}
      </div>

      {/* Action button (e.g. migrate) */}
      {currentStep.actionLabel && currentStep.actionKey && onAction && (
        <button
          onClick={() => onAction(currentStep.actionKey!)}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-2 text-xs font-medium text-[var(--primary)] transition-all hover:bg-[var(--primary)]/20 active:scale-[0.98]"
        >
          <ArrowRightLeft size="0.8125rem" />
          {currentStep.actionLabel}
        </button>
      )}

      {/* Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={onSkip}
          className="rounded-lg px-3 py-1.5 text-xs text-[var(--muted-foreground)] transition-colors hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
        >
          {step === 0 ? "Pular Tutorial" : "Pular"}
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-1.5 text-xs font-medium text-[var(--primary-foreground)] shadow-sm transition-all hover:opacity-90 active:scale-95"
        >
          {isLast ? "Get Started" : "Next"}
          {!isLast && <ChevronRight size="0.75rem" />}
        </button>
      </div>
    </>
  );
}

// ─── Main component ───────────────────────────

export function OnboardingTutorial() {
  const hasCompleted = useUIStore((s) => s.hasCompletedOnboarding);
  if (hasCompleted) return null;
  return <OnboardingTutorialInner />;
}

function OnboardingTutorialInner() {
  const setCompleted = useUIStore((s) => s.setHasCompletedOnboarding);
  const openRightPanel = useUIStore((s) => s.openRightPanel);
  const setSettingsTab = useUIStore((s) => s.setSettingsTab);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const setShowDownloadModal = useSidecarStore((s) => s.setShowDownloadModal);
  const fetchSidecarStatus = useSidecarStore((s) => s.fetchStatus);

  const createChat = useCreateChat();

  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const rafRef = useRef<number>(0);
  const mariChatIdRef = useRef<string | null>(null);
  const prevStepRef = useRef(0);
  const createChatRef = useRef(createChat);
  createChatRef.current = createChat;

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  // Set activeChatId without persisting to localStorage (demo-only)
  const setDemoChatActive = useCallback((id: string | null) => {
    useChatStore.setState({
      activeChatId: id,
      swipeIndex: new Map(),
      ...(!id && { activeChat: null }),
    });
  }, []);

  // ── Side-effects when step changes ──
  useEffect(() => {
    const prev = prevStepRef.current;
    prevStepRef.current = step;

    // Step 1 (sidebar): open sidebar on enter
    if (step === 1) {
      setSidebarOpen(true);
    }
    // Leaving step 1: close sidebar
    if (prev === 1 && step !== 1) {
      setSidebarOpen(false);
    }

    // Step 3 (chat area): create persistent Assistant Chat with Mari
    if (step === 3 && !mariChatIdRef.current) {
      mariChatIdRef.current = "pending";
      createChatRef.current
        .mutateAsync({
          name: "Assistant Chat With Mari",
          mode: "conversation",
          characterIds: [PROFESSOR_MARI_ID],
          connectionId: DEFAULT_CONNECTION_ID,
        })
        .then(async (chat) => {
          mariChatIdRef.current = chat.id;
          // Disable autonomous messages, cross-chat awareness, and memory recall
          // BEFORE activating the chat — otherwise ConversationView triggers schedule generation
          try {
            await api.patch(`/chats/${chat.id}/metadata`, {
              autonomousMessages: false,
              crossChatAwareness: false,
              enableMemoryRecall: false,
            });
          } catch {
            /* non-critical */
          }
          // Insert Mari's first message BEFORE activating the chat
          // so the ConversationView picks it up on first render
          try {
            const char = await api.get<{ data: string }>(`/characters/${PROFESSOR_MARI_ID}`);
            const charData = JSON.parse(char.data) as { first_mes?: string };
            if (charData.first_mes) {
              await api.post(`/chats/${chat.id}/messages`, {
                role: "assistant",
                characterId: PROFESSOR_MARI_ID,
                content: charData.first_mes,
              });
            }
          } catch {
            /* non-critical */
          }
          // Now activate the chat — ConversationView will see the message + correct metadata
          setDemoChatActive(chat.id);
        })
        .catch(() => {
          mariChatIdRef.current = null;
        });
    }
    // Leaving step 3: deselect chat (but keep it — it's persistent)
    if (prev === 3 && step !== 3) {
      setDemoChatActive(null);
    }
  }, [step, setSidebarOpen, setDemoChatActive]);

  // Cleanup on unmount: deselect the Mari chat (but keep it — it's persistent)
  useEffect(() => {
    return () => {
      if (mariChatIdRef.current && mariChatIdRef.current !== "pending") {
        mariChatIdRef.current = null;
        useChatStore.setState({ activeChatId: null, activeChat: null, swipeIndex: new Map() });
      }
    };
  }, []);

  // Track the target element position (handles resize/scroll)
  const lastRectRef = useRef<Rect | null>(null);
  const updateRect = useCallback(() => {
    if (!currentStep?.target) {
      if (lastRectRef.current !== null) {
        lastRectRef.current = null;
        setTargetRect(null);
      }
      return;
    }
    const r = getTargetRect(currentStep.target);
    // Only update state if the rect actually changed
    const prev = lastRectRef.current;
    if (!r && prev) {
      lastRectRef.current = null;
      setTargetRect(null);
    } else if (
      r &&
      (!prev || r.top !== prev.top || r.left !== prev.left || r.width !== prev.width || r.height !== prev.height)
    ) {
      lastRectRef.current = r;
      setTargetRect(r);
    }
    rafRef.current = requestAnimationFrame(updateRect);
  }, [currentStep?.target]);

  useEffect(() => {
    updateRect();
    return () => cancelAnimationFrame(rafRef.current);
  }, [updateRect]);

  const finish = useCallback(() => setCompleted(true), [setCompleted]);

  const handleAction = useCallback(
    (key: string) => {
      if (key === "migrate") {
        openRightPanel("settings");
        setSettingsTab("import");
        // Jump to last step instead of finishing
        setStep(STEPS.length - 1);
        return;
      }

      if (key === "local-model") {
        openRightPanel("connections");
        void fetchSidecarStatus();
        setShowDownloadModal(true);
        finish();
      }
    },
    [fetchSidecarStatus, finish, openRightPanel, setSettingsTab, setShowDownloadModal],
  );

  const next = useCallback(() => {
    if (isLast) {
      finish();
    } else {
      setStep((s) => s + 1);
    }
  }, [isLast, finish]);

  const isCentered = !currentStep.target || !targetRect;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      {/* Pulsing highlight ring around the target element */}
      {targetRect && (
        <div
          className="pointer-events-none fixed rounded-xl ring-2 ring-[var(--primary)] animate-pulse"
          style={{
            top: targetRect.top - PAD,
            left: targetRect.left - PAD,
            width: targetRect.width + PAD * 2,
            height: targetRect.height + PAD * 2,
            boxShadow: "0 0 16px 4px color-mix(in srgb, var(--primary) 40%, transparent)",
          }}
        />
      )}

      {/* Centered steps use a flex wrapper so Framer Motion transforms don't override CSS centering */}
      {isCentered ? (
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto rounded-2xl border border-[var(--border)] bg-[var(--popover)] p-5 shadow-2xl ring-1 ring-[var(--primary)]/20 max-h-[90vh] overflow-x-hidden overflow-y-auto"
              style={{ width: Math.min(380, window.innerWidth - 32) }}
            >
              <TourCardContent
                step={step}
                currentStep={currentStep}
                isLast={isLast}
                onNext={next}
                onSkip={finish}
                onAction={handleAction}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto rounded-2xl border border-[var(--border)] bg-[var(--popover)] p-5 shadow-2xl ring-1 ring-[var(--primary)]/20"
            style={computeTooltipStyle(targetRect!, currentStep.side)}
          >
            <TourCardContent
              step={step}
              currentStep={currentStep}
              isLast={isLast}
              onNext={next}
              onSkip={finish}
              onAction={handleAction}
            />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
