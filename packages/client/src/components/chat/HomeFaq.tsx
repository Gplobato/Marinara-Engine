import { useState } from "react";
import { ChevronDown, ChevronRight, HelpCircle, Sparkles, TriangleAlert } from "lucide-react";
import { cn } from "../../lib/utils";

interface HomeFaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  bullets?: string[];
}

const QUICK_FIXES = [
  "Aumente o comprimento máximo de resposta se agentes, rastreadores ou o Guardião de Lore continuarem falhando ou retornando JSON inválido.",
  "Atualize antes de investigar muito fundo. Se instalou pelo Git, use o atualizador ou a verificação em Configurações Avançadas.",
  "Se o instalador ou scripts de inicialização sumiram, verifique a quarentena do antivírus e adicione a pasta Marinara às exceções.",
  "Se a configuração do Modo Jogo continua falhando, mude para um modelo mais forte antes de alterar prompts ou predefinições.",
];

const HOME_FAQ_ITEMS: HomeFaqItem[] = [
  {
    id: "game-mode-model",
    category: "Problema Principal",
    question: "Qual modelo devo usar no Modo Jogo?",
    answer: "O Modo Jogo é muito mais exigente que o chat normal, especialmente na primeira geração e configuração de sessão.",
    bullets: [
      "Use a strong model for setup and major GM turns: Claude Opus, Gemini 3 Pro, GPT-5.x, or a similarly strong frontier model.",
      "Gemma 4 31B also holds up surprisingly well if you want a local option.",
      "GLM, DeepSeek, Kimi, and weaker models are more likely to produce malformed JSON, weak formatting, or low-quality GM output.",
    ],
  },
  {
    id: "agent-max-length",
    category: "Problema Principal",
    question: "Meus rastreadores, Guardião de Lore ou agentes não fazem nada ou falham com erro de comprimento máximo. O que resolve?",
    answer:
      "A correção mais comum é aumentar o comprimento máximo de resposta para o modelo terminar o JSON do rastreador sem truncar.",
    bullets: [
      "Raise max response length in your connection or chat Advanced Settings.",
      "If an agent keeps breaking formatting, move it to a stronger model, especially Gemma 4 or another reliable structured-output model.",
      "If a bad cached turn keeps poisoning results, copy your last user message, delete that turn and anything after it, then resend.",
    ],
  },
  {
    id: "sidecar-cpu-fallback",
    category: "Problema Principal",
    question: "Vi '[sidecar] Startup with max GPU offload failed, retrying with CPU fallback'. Isso é normal?",
    answer:
      "Geralmente sim. O sidecar local do Marinara é projetado para rodar em CPU e RAM para que seu modelo principal mantenha a GPU e VRAM.",
    bullets: [
      "A fallback message does not automatically mean anything is broken.",
      "The sidecar is there for helpers and utility tasks, not to compete with your main model for VRAM.",
      "Treat it as a problem only if the sidecar never recovers or keeps crashing instead of settling on CPU fallback.",
    ],
  },
  {
    id: "antivirus-installer",
    category: "Configuração",
    question: "Meu antivírus sinalizou o instalador ou excluiu arquivos. O Marinara é seguro?",
    answer: "Este é um caminho muito comum de falso positivo para instaladores e arquivos batch que iniciam serviços locais.",
    bullets: [
      "Add the Marinara folder to your antivirus exclusions before reinstalling or restoring files.",
      "Bitdefender and Windows Defender are the most common sources of quarantines here.",
      "Restoring the quarantined files and rerunning usually fixes the issue.",
      "If you want a second opinion, compare the release files against a VirusTotal report rather than trusting a single AV popup.",
    ],
  },
  {
    id: "blank-page-localhost",
    category: "Configuração",
    question: "Recebo uma página em branco ou ERR_EMPTY_RESPONSE em localhost:7860. O que devo tentar?",
    answer: "Geralmente é um problema de estado do navegador, não uma instalação corrompida.",
    bullets: [
      "Try localhost:7860 instead of 127.0.0.1, or the reverse if you already used localhost.",
      "Hard refresh with Ctrl+Shift+R and clear the site's local storage.",
      "Test in incognito or a different browser.",
      "Docker and Podman users hit the same symptom, so browser cleanup is still worth trying there too.",
    ],
  },
  {
    id: "update-without-installer",
    category: "Configuração",
    question: "Como atualizo sem o instalador?",
    answer: "O atualizador espera um checkout Git real.",
    bullets: [
      "If you downloaded a ZIP, it does not contain the .git history the updater needs.",
      "Either reinstall from the supported path or initialize Git properly before trying to update in place.",
      "You can also use Settings > Advanced > Check for Updates when your install already has Git metadata.",
    ],
  },
  {
    id: "android-apk-termux",
    category: "Configuração",
    question: "O APK Android é independente?",
    answer: "Não. O APK é apenas um shell WebView para o Marinara Engine rodando localmente no Termux.",
    bullets: [
      "Install Termux from F-Droid and run Marinara with ./start-termux.sh first.",
      "The APK opens the same-device local server at 127.0.0.1, so it cannot work if Termux is closed.",
      "If it stays on the connection screen, go back to Termux and start the server.",
    ],
  },
  {
    id: "pnpm-install-bat",
    category: "Configuração",
    question: "'pnpm: not found' ou install.bat falhou. E agora?",
    answer: "Seu sistema geralmente ainda não tem o pnpm disponível.",
    bullets: [
      "Install pnpm globally with npm install -g pnpm, or use the EXE installer if you want the guided path.",
      "On Android or Termux, a long pause at Corepack alignment is a recurring pain point rather than a special Marinara-only error.",
      "If Termux hangs specifically on 'Aligning pnpm via Corepack', let it finish before assuming it is dead.",
    ],
  },
  {
    id: "google-cloud-credit",
    category: "Conexões",
    question: "Posso usar o crédito gratuito do Google Cloud com o Marinara?",
    answer: "Geralmente sim, mas nem todo caminho do Google se comporta igual.",
    bullets: [
      "Newer AI Studio API accounts have tighter limitations, so Vertex is the safer route.",
      "If you prefer a relay, BYOK through OpenRouter is another common workaround.",
    ],
  },
  {
    id: "best-local-model",
    category: "Conexões",
    question: "Qual é o melhor modelo local agora?",
    answer: "Gemma 4 ainda é a recomendação mais segura para a maioria dos usuários locais.",
    bullets: [
      "If you can fit it, go for dense 31B. Otherwise the MoE 26B A3B tier is the next best bet.",
      "Q4 and better quants are usually the sweet spot.",
      "Very small E2B or E4B class models are fine for helpers and sidecars, but not ideal for serious RP.",
    ],
  },
  {
    id: "bigger-agent-model",
    category: "Conexões",
    question: "Como uso um modelo maior para agentes em vez do sidecar local?",
    answer:
      "Crie uma conexão normal para seu próprio Kobold, llama.cpp ou endpoint compatível e marque-a para uso por agentes.",
    bullets: [
      "The switch lives on the connection itself.",
      "Once enabled, agents can use that remote model instead of the local sidecar path.",
    ],
  },
  {
    id: "reverse-proxy",
    category: "Conexões",
    question: "Como uso o Claude Code ou um proxy reverso?",
    answer: "Não há campo separado de proxy reverso como o SillyTavern usa.",
    bullets: [
      "Point a Custom or Anthropic-style connection directly at your local proxy URL, usually something like http://localhost:PORT/v1.",
      "If your proxy relies on account-based OAuth flows, expect them to be less stable than API-key setups.",
    ],
  },
  {
    id: "nanogpt-401",
    category: "Conexões",
    question: "O NanoGPT está retornando erros 401. Por que recriar a conexão ajuda?",
    answer: "Essa tem sido uma das correções mais confiáveis para problemas de autenticação específicos do NanoGPT.",
    bullets: [
      "Delete the broken connection and recreate it from scratch instead of endlessly editing the existing one.",
      "Some users only got rid of the 401 loop after remaking even the default NanoGPT connection.",
    ],
  },
  {
    id: "sampler-settings",
    category: "Essencial",
    question: "Onde altero temperatura, top-p e outras configurações de amostragem?",
    answer: "Abra uma conversa e use as Configurações Avançadas no painel direito.",
    bullets: [
      "That is where you adjust temperature, top-p, max response length, and similar generation settings.",
      "Use Set Default if you want those values to become the saved defaults for that connection.",
    ],
  },
  {
    id: "enable-agents",
    category: "Essencial",
    question: "Como ativo os agentes?",
    answer: "A resposta depende do modo.",
    bullets: [
      "In Roleplay mode, open Chat Settings and go to the Agents section for that chat.",
      "In Game Mode, most agents run in the background automatically. The user-facing toggles are mainly for scene analysis and image generation.",
    ],
  },
  {
    id: "macro-list",
    category: "Essencial",
    question: "Onde está a lista de macros suportadas?",
    answer: "Digite /macros diretamente no chat.",
    bullets: [
      "Marinara uses SillyTavern-style {{char}} and {{user}} macros.",
      "If you tried {{charName}} or {{userName}}, that mismatch is why it failed.",
    ],
  },
  {
    id: "same-character-chats",
    category: "Essencial",
    question: "Como alterno entre conversas diferentes com o mesmo personagem?",
    answer: "Use Conversas Recentes na tela inicial ou o navegador de conversas dentro do app.",
    bullets: [
      "Chats with the same character are organized as branches rather than one giant flat thread.",
      "The branch selector at the top of the chat bar is the quickest in-chat way to jump between them now.",
    ],
  },
  {
    id: "where-data-lives",
    category: "Essencial",
    question: "Onde ficam minhas conversas, predefinições e outros dados?",
    answer: "O banco de dados local principal fica em packages/server/data/marinara-engine.db.",
    bullets: [
      "That is the file power users usually back up or inspect when they want direct access.",
      "Most of the 'where is X stored' questions end up there.",
    ],
  },
  {
    id: "hide-message-from-prompt",
    category: "Essencial",
    question: "Como oculto uma mensagem do prompt sem excluí-la?",
    answer: "Abra as ações da mensagem e use o ícone de olho.",
    bullets: ["That hides the message from prompt assembly without wiping it from the visible chat history."],
  },
  {
    id: "sillytavern-import",
    category: "Essencial",
    question: "Como funciona a importação do SillyTavern?",
    answer: "A maioria dos dados importa corretamente, mas há alguns problemas recorrentes.",
    bullets: [
      "Regex scripts still need to be imported separately.",
      "Character chats can sometimes end up merged under one unused-style branch during messy imports.",
      "Editing older imported multi-line character messages can still feel quirky, so treat that path carefully.",
    ],
  },
  {
    id: "prose-guardian-user-voice",
    category: "Agentes",
    question: "O Guardião de Prosa está me imitando ou escrevendo a resposta inteira. Isso é normal?",
    answer: "Não. Geralmente é um problema de modelo de agente fraco, não o comportamento esperado.",
    bullets: [
      "Move your agents to a stronger model such as Gemma 4 if possible.",
      "If the bad behavior seems cached into the thread, copy the last user message, delete it and everything after it, then resend.",
    ],
  },
  {
    id: "attribute-scale",
    category: "Agentes",
    question: "O que conta como alto ou baixo para atributos?",
    answer:
      "A expectativa padrão é basicamente estilo DnD de 1 a 20, mas o modelo ainda interpreta a ficção ao redor.",
    bullets: ["Think of 10-ish as ordinary and 18 to 20 as exceptional unless your setup says otherwise."],
  },
  {
    id: "narrative-director-captures-messages",
    category: "Agentes",
    question: "O Diretor Narrativo está capturando minhas mensagens e respostas do bot dentro de si. Por quê?",
    answer: "Isso aparece com mais frequência com modelos mais fracos ou instáveis, especialmente rodadas no estilo GLM 5.1.",
    bullets: ["Switch the agent to a stronger model before rewriting prompts."],
  },
  {
    id: "comfyui-illustrator-setup",
    category: "Imagens",
    question: "Como faço o ComfyUI ou o Ilustrador funcionar?",
    answer: "O template de workflow deve expor os placeholders que o Marinara espera.",
    bullets: [
      "Use %prompt%, %width%, %height%, %negative_prompt%, and %seed% in the workflow or request template.",
      "Use %reference_image_01% through %reference_image_04% or %reference_image_name_01% through %reference_image_name_04% for multiple ComfyUI reference slots.",
      'If your JSON parser complains, wrap width and height placeholders in quotes, like "%width%".',
      "The default timeout is 120 seconds, which is often too short for slower Flux or Chroma workflows.",
    ],
  },
  {
    id: "image-resolution",
    category: "Imagens",
    question: "Como altero a resolução da imagem?",
    answer: "Defina na própria conexão de geração de imagens.",
    bullets: ["Newer versions expose width and height in the connection panel rather than hiding it in a prompt."],
  },
  {
    id: "temp-must-be-1",
    category: "Imagens",
    question: "Recebi um erro 'Temp must be 1' ao usar o Ilustrador. Qual temperatura está errada?",
    answer: "Geralmente a conexão de imagem, não seu modelo principal de chat.",
    bullets: ["Check the image-generation connection's temperature field first."],
  },
  {
    id: "booru-prompts",
    category: "Imagens",
    question: "Como obtenho prompts no estilo booru do Ilustrador?",
    answer: "Edite o prompt do agente Ilustrador na seção de Agentes.",
    bullets: ["That is where you steer the prompt format rather than fighting the image connection settings."],
  },
  {
    id: "character-sprites",
    category: "Imagens",
    question: "Como gero sprites de personagens?",
    answer: "Abra a ficha do personagem e use o fluxo de geração de sprites a partir daí.",
    bullets: ["You still need a working image-generation connection before the button becomes useful."],
  },
  {
    id: "game-invalid-json",
    category: "Modo Jogo",
    question: "A primeira geração do Modo Jogo falhou com JSON inválido. Como estabilizo?",
    answer: "Comece atualizando o modelo antes de mudar qualquer outra coisa.",
    bullets: [
      "A strong GM model is the main fix here.",
      "If you are using Opus and still need extra help, add something like 'Ultrathink. Return structured JSON with no markdown code fences.' to the additional GM notes.",
    ],
  },
  {
    id: "game-editability",
    category: "Modo Jogo",
    question: "Posso editar widgets, cenas ou dados do Modo Jogo depois?",
    answer: "Parte disso é editável agora, mas nem tudo que é rastreado automaticamente está igualmente exposto.",
    bullets: [
      "Inventory, readables, and more session-level continuity details are much more editable than they used to be.",
      "Some auto-tracked journal sections are still more rigid than users expect.",
    ],
  },
  {
    id: "game-party-members",
    category: "Modo Jogo",
    question: "Posso adicionar novos membros ao grupo durante o jogo?",
    answer: "Sim. O Marinara pode recrutar membros do grupo durante um jogo ativo agora.",
    bullets: [
      "If some portraits or tracker details lag behind after recruiting someone new, refresh or regenerate the related asset rather than assuming the recruit failed.",
    ],
  },
  {
    id: "game-background",
    category: "Modo Jogo",
    question: "Como altero o plano de fundo do Modo Jogo?",
    answer: "O caminho mais rápido geralmente é falar diretamente com o Mestre ou reexecutar a cena ou passagem de imagem.",
    bullets: [
      "Game backgrounds are tied to scene analysis and asset generation, so background changes often follow that pipeline rather than a single permanent toggle.",
    ],
  },
  {
    id: "talk-to-gm",
    category: "Modo Jogo",
    question: "Posso falar diretamente com o Mestre em vez de jogar no personagem?",
    answer: "Sim. Mude para o modo de chat com o Mestre quando precisar de ajuda direta fora da cena.",
    bullets: [
      "That is the easiest way to ask for lorebook updates, map changes, UI adjustments, or scene-management help without pretending it is an in-world action.",
    ],
  },
  {
    id: "session-summary",
    category: "Modo Jogo",
    question: "Encerrar uma sessão a resume e permite continuar depois?",
    answer: "Sim. Encerrar uma sessão gera dados de continuidade e a próxima sessão pode retomar desse estado.",
    bullets: ["The session-end flow is meant to preserve a usable recap, not just close the chat."],
  },
  {
    id: "content-filtering",
    category: "Outros",
    question: "Há filtragem de conteúdo integrada?",
    answer:
      "Não como uma camada de segurança separada do Marinara. O comportamento de filtragem depende principalmente do modelo ou provedor conectado.",
  },
  {
    id: "shared-gpu",
    category: "Outros",
    question: "Posso rodar RP e geração de imagens na mesma GPU?",
    answer: "Às vezes, mas a VRAM é o limite rígido.",
    bullets: [
      "It is possible on tighter setups, but image generation plus a big RP model is one of the fastest ways to hit a wall.",
    ],
  },
  {
    id: "mobile-app",
    category: "Outros",
    question: "Há um aplicativo móvel?",
    answer:
      "Ainda não como app independente. Você pode instalar o Marinara como PWA pelo navegador em celulares e tablets enquanto o servidor roda no seu computador, host Docker ou dispositivo Termux.",
  },
  {
    id: "tts-support",
    category: "Outros",
    question: "O Marinara suporta TTS?",
    answer: "Sim. Há suporte integrado para provedores TTS compatíveis com OpenAI agora.",
    bullets: [
      "Set it up from the Connections area and the TTS settings card.",
      "If you expected older advice saying TTS was extension-only, that is out of date now.",
    ],
  },
  {
    id: "translations",
    category: "Outros",
    question: "Posso conversar em outros idiomas além do inglês? E a interface?",
    answer: "O conteúdo do chat funciona em outros idiomas, mas a interface ainda é prioritariamente em inglês.",
    bullets: ["Non-English chats are fine.", "UI translations are still limited, though contributions are welcome."],
  },
  {
    id: "bug-reports",
    category: "Outros",
    question: "Onde devo reportar bugs ou solicitar funcionalidades?",
    answer: "Use o canal dedicado de bugs e feedback no Discord em vez de postar relatórios no chat geral.",
    bullets: [
      "The home screen already links you to the Discord server.",
      "Using the proper report channel makes it much easier for maintainers to tag and follow up on problems.",
    ],
  },
];

const CATEGORY_STYLES: Record<string, string> = {
  "Problema Principal": "border-rose-400/30 bg-rose-500/12 text-rose-700 dark:text-rose-200",
  Setup: "border-amber-400/30 bg-amber-500/12 text-amber-700 dark:text-amber-200",
  Connections: "border-cyan-400/30 bg-cyan-500/12 text-cyan-700 dark:text-cyan-200",
  Core: "border-emerald-400/30 bg-emerald-500/12 text-emerald-700 dark:text-emerald-200",
  Agents: "border-violet-400/30 bg-violet-500/12 text-violet-700 dark:text-violet-200",
  Images: "border-fuchsia-400/30 bg-fuchsia-500/12 text-fuchsia-700 dark:text-fuchsia-200",
  "Modo Jogo": "border-orange-400/30 bg-orange-500/12 text-orange-700 dark:text-orange-200",
  Misc: "border-[var(--border)] bg-[var(--muted)]/30 text-[var(--muted-foreground)]",
};

export function HomeFaq() {
  const [expanded, setExpanded] = useState(false);
  const [openItemId, setOpenItemId] = useState<string | null>("game-mode-model");

  return (
    <section className="w-full max-w-md">
      <div className="overflow-hidden rounded-[1rem] border border-[var(--border)]/60 bg-[var(--card)] shadow-[0_14px_38px_rgba(0,0,0,0.24)] backdrop-blur-xl dark:bg-[linear-gradient(180deg,rgba(18,14,23,0.92),rgba(11,10,16,0.86))]">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5 sm:items-center sm:gap-3 sm:px-4"
          aria-expanded={expanded}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--primary)]/25 bg-[linear-gradient(135deg,rgba(235,137,81,0.18),rgba(77,229,221,0.14))] text-[var(--primary)] shadow-[0_0_20px_rgba(235,137,81,0.1)]">
            <HelpCircle size="1rem" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold tracking-tight text-[var(--foreground)]">Professor Mari&apos;s FAQ</p>
              <span className="rounded-full border border-[var(--border)]/60 bg-black/5 px-2 py-0.5 text-[0.5625rem] uppercase tracking-[0.16em] text-[var(--muted-foreground)]/80 dark:bg-white/6">
                {HOME_FAQ_ITEMS.length} answers
              </span>
            </div>
            <p className="mt-0.5 text-[0.6875rem] leading-snug text-[var(--muted-foreground)]/80">
              The recurring setup, model, Game Mode, image, and agent questions people keep asking.
            </p>
          </div>
          <ChevronDown
            size="1rem"
            className={cn(
              "shrink-0 text-[var(--muted-foreground)] transition-transform duration-200",
              expanded && "rotate-180 text-[var(--primary)]",
            )}
          />
        </button>

        {expanded && (
          <div className="border-t border-[var(--border)]/60 px-4 pb-4 pt-3">
            <div className="rounded-[1.1rem] border border-[var(--primary)]/20 bg-[linear-gradient(135deg,rgba(235,137,81,0.12),rgba(77,229,221,0.08))] p-3.5 shadow-[0_10px_26px_rgba(0,0,0,0.18)] sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="mx-auto flex h-28 w-20 shrink-0 items-start justify-center overflow-hidden rounded-[1.25rem] border border-[var(--border)] bg-[var(--card)]/80 shadow-[0_10px_24px_rgba(0,0,0,0.22)] sm:mx-0 sm:h-32 sm:w-24">
                  <img
                    src="/sprites/mari/Mari_explaining.png"
                    alt="Professor Mari"
                    className="h-full w-full object-cover object-[center_14%]"
                  />
                </div>
                <div className="min-w-0 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--muted)]/50 px-2.5 py-1 text-[0.5625rem] uppercase tracking-[0.18em] text-[var(--muted-foreground)]/85 dark:border-white/10 dark:bg-black/20">
                    <Sparkles size="0.6875rem" />
                    Professor Mari
                  </div>
                  <p className="mt-2 text-sm font-semibold tracking-tight text-[var(--foreground)]">
                    Start here before you go hunting through Discord logs.
                  </p>
                  <p className="mt-1 text-[0.6875rem] leading-relaxed text-[var(--muted-foreground)]/85">
                    The biggest repeat problems are Game Mode model choice, silent agent failures from low max response
                    length, and confusion about the local sidecar using CPU instead of the GPU.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-[1.1rem] border border-amber-400/20 bg-amber-500/8 p-3">
              <div className="flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-200/90">
                <TriangleAlert size="0.875rem" />
                Before You Post A Bug
              </div>
              <ul className="mt-2 space-y-1.5 text-[0.6875rem] leading-relaxed text-[var(--muted-foreground)]/88">
                {QUICK_FIXES.map((fix) => (
                  <li key={fix} className="flex gap-2">
                    <span className="mt-[0.18rem] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500/75 dark:bg-amber-300/75" />
                    <span>{fix}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-3">
              <div className="mb-2 flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <p className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[var(--muted-foreground)]/65">
                  Frequently Asked Questions
                </p>
                <p className="text-[0.625rem] text-[var(--muted-foreground)]/50">
                  Tap a question to reveal the answer.
                </p>
              </div>

              <div className="max-h-[22rem] space-y-2 overflow-y-auto pr-0.5 sm:max-h-[28rem] sm:pr-1">
                {HOME_FAQ_ITEMS.map((item) => {
                  const isOpen = openItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "overflow-hidden rounded-[1rem] border border-[var(--border)]/55 bg-[var(--card)]/45 transition-colors",
                        isOpen && "border-[var(--primary)]/30 bg-[var(--card)]/70 shadow-[0_8px_24px_rgba(0,0,0,0.18)]",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenItemId((current) => (current === item.id ? null : item.id))}
                        className="flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                        aria-expanded={isOpen}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "shrink-0 rounded-full border px-2 py-0.5 text-[0.5625rem] font-medium uppercase tracking-[0.16em]",
                                CATEGORY_STYLES[item.category] ?? CATEGORY_STYLES.Misc,
                              )}
                            >
                              {item.category}
                            </span>
                            <span className="min-w-0 text-[0.75rem] font-medium leading-relaxed text-[var(--foreground)]">
                              {item.question}
                            </span>
                          </div>
                        </div>
                        {isOpen ? (
                          <ChevronDown size="0.9375rem" className="mt-0.5 shrink-0 text-[var(--primary)]" />
                        ) : (
                          <ChevronRight size="0.9375rem" className="mt-0.5 shrink-0 text-[var(--muted-foreground)]" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="border-t border-[var(--border)]/55 bg-[var(--muted)]/30 px-3 py-3 dark:bg-black/10">
                          <p className="text-[0.72rem] leading-relaxed text-[var(--foreground)]/92">{item.answer}</p>
                          {item.bullets?.length ? (
                            <ul className="mt-2 space-y-1.5 text-[0.6875rem] leading-relaxed text-[var(--muted-foreground)]/85">
                              {item.bullets.map((bullet) => (
                                <li key={bullet} className="flex gap-2">
                                  <span className="mt-[0.18rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]/70" />
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
