# PROMPT MESTRE PARA O LOVABLE

## Projeto: RPG Cinematográfico Familiar com IA, Projetor, Celulares e Consequências Reais

> **Instrução para o Lovable:** leia toda esta especificação antes de alterar qualquer arquivo. Comece em **Plan Mode**, apresente um plano técnico curto, inspecione o projeto atual e então implemente por fases sem substituir funcionalidades reais por simulações. Não crie apenas um protótipo visual. O objetivo é um aplicativo full-stack funcional, persistente, seguro e testável.

---

# 1. VISÃO DO PRODUTO

Crie um aplicativo full-stack de RPG narrativo cinematográfico para ser jogado presencialmente em família.

O notebook será ligado a um **projetor ou televisão 16:9**, exibindo a tela principal do jogo em tela cheia. Cada participante acessará um **link paralelo pelo próprio celular**, escaneando um QR Code, para entrar na sessão, controlar seu personagem, votar nas opções A/B/C/D, escrever ações livres, gravar ações por voz e receber informações privadas.

O proprietário da sessão terá um **painel separado de mestre/operador**, usado para iniciar a campanha, acompanhar jogadores, configurar modelos de IA, controlar mídia, resolver problemas técnicos e administrar a sessão.

O provedor de IA será exclusivamente o **OpenRouter**, chamado apenas pelo backend. Use o OpenRouter para:

- modelos de texto e raciocínio;
- agentes narrativos;
- geração de imagens;
- geração de vídeos;
- text-to-speech;
- speech-to-text;
- embeddings para memória semântica.

Use **Lovable Cloud ou Supabase conectado ao Lovable** para:

- PostgreSQL;
- autenticação do mestre;
- sessões anônimas/temporárias dos jogadores;
- Edge Functions;
- Storage;
- Realtime Broadcast e Presence;
- Row Level Security;
- pgvector para memória semântica.

Não use a integração de IA genérica do Lovable para substituir o OpenRouter. Faça as chamadas diretamente ao OpenRouter por Edge Functions, usando a chave do usuário armazenada em Secret.

---

# 2. PRINCÍPIO MAIS IMPORTANTE: ISTO NÃO É UM ASSISTENTE AMIGÁVEL

O sistema não é um chatbot ajudante, terapeuta, copiloto amigável nem contador de histórias que protege os protagonistas.

É um **simulador imparcial de RPG**, cujo objetivo é produzir uma aventura divertida, coerente, tensa e realista dentro das regras do universo escolhido.

Implemente esta constituição como regra permanente do sistema:

1. O mundo não gira ao redor dos jogadores.
2. A IA não deve elogiar, validar ou aprovar automaticamente as decisões.
3. A IA não deve favorecer os jogadores por simpatia.
4. Não existe “proteção de protagonista”.
5. Ações impossíveis continuam impossíveis.
6. Decisões ruins podem causar perdas graves.
7. Recursos realmente acabam.
8. Ferimentos não desaparecem sem tratamento e tempo.
9. NPCs têm objetivos próprios e podem mentir, fugir, trair, negociar, atacar ou desistir.
10. Inimigos inteligentes exploram vulnerabilidades plausíveis.
11. O mundo continua evoluindo fora da visão dos jogadores.
12. Itens destruídos ou perdidos não reaparecem por conveniência.
13. Informações desconhecidas não podem ser usadas por jogadores ou NPCs.
14. Resultados oficiais não podem ser reescritos pelo narrador.
15. Falhas não devem ser transformadas automaticamente em “sucesso com pequeno custo”.
16. Coincidências salvadoras, aliados inesperados e ressurreições não podem ser introduzidos sem preparação anterior no estado do mundo.
17. Personagens podem sofrer sequelas permanentes.
18. Personagens podem morrer permanentemente.
19. O grupo pode perder a campanha.
20. Deve existir **Game Over real**, individual, coletivo ou narrativo.
21. Um final trágico ou ruim é um final válido.
22. O narrador nunca deve dizer “como IA”, “como assistente”, pedir desculpas ou quebrar a quarta parede.
23. O narrador apresenta acontecimentos; ele não discute a política interna do sistema com os jogadores.
24. O jogo deve permanecer divertido e dramaticamente interessante, mas nunca trapacear para salvar o grupo.

Essas regras devem aparecer:

- nos prompts de sistema dos agentes;
- nas validações do backend;
- na documentação do projeto;
- nos testes de aceite.

---

# 3. ARQUITETURA DE ALTO NÍVEL

Implemente esta arquitetura:

```text
PROJETOR / TV              CELULARES DOS JOGADORES          PAINEL DO MESTRE
/game/:sessionId           /join/:sessionCode               /master/:sessionId
        \                         |                          /
         \________________ SUPABASE REALTIME ______________/
                              |
                       ORQUESTRADOR SERVER-SIDE
                              |
        +---------------------+----------------------+
        |                     |                      |
 MOTOR DETERMINÍSTICO   AGENTES OPENROUTER      MEMÓRIA PERSISTENTE
 regras, dados, HP,     cena, NPCs, arte,        PostgreSQL, eventos,
 morte e Game Over      áudio, narração          resumos e pgvector
        |                     |                      |
        +---------------------+----------------------+
                              |
                     STORAGE DE MÍDIA E ASSETS
                 imagens, vídeos, TTS, música e SFX
```

## Regra arquitetural obrigatória

A IA pode **propor** acontecimentos e narrar resultados, mas não pode alterar diretamente o estado oficial.

O backend determinístico controla:

- dados;
- dificuldade;
- modificadores;
- HP e recursos;
- inventário;
- condições;
- ferimentos;
- morte;
- localização;
- passagem do tempo;
- conhecimento autorizado;
- relógios de ameaça;
- Game Over;
- aplicação final das consequências.

Fluxo obrigatório de cada turno:

```text
1. Jogadores recebem a cena e opções.
2. Jogadores votam ou enviam ações individuais.
3. A rodada é bloqueada.
4. O backend valida as ações.
5. O motor executa rolagens e calcula resultados.
6. Uma transação grava o resultado oficial e os eventos.
7. O Diretor de Cena recebe o resultado oficial como imutável.
8. O Narrador apresenta o resultado sem modificá-lo.
9. Diretores de Arte e Áudio decidem a mídia apropriada.
10. O Guardião de Continuidade valida a saída.
11. A cena é publicada no projetor e celulares.
12. O estado avança para a próxima rodada ou Game Over.
```

---

# 4. ROTAS E EXPERIÊNCIAS SEPARADAS

Crie interfaces distintas. Não faça apenas uma página responsiva que mostra tudo para todos.

## 4.1 Tela pública do projetor

Rota:

```text
/game/:sessionId
```

Características:

- otimizada para 16:9 e visualização a distância;
- modo tela cheia;
- layout cinematográfico escuro e elegante;
- imagem principal grande, preferencialmente 16:9;
- suporte a vídeo quando houver;
- texto da cena com ótima legibilidade;
- legendas sincronizadas com a voz quando possível;
- opções A/B/C/D visíveis, porém sem elementos pequenos;
- status resumido do grupo;
- transições suaves de imagem, áudio e estado;
- QR Code e código de entrada no lobby;
- indicador discreto de jogadores conectados;
- resultado da votação configurável;
- sem botões administrativos;
- sem revelar segredos, relógios ocultos, rolagens secretas ou intenção de NPCs;
- animações específicas para dano, ferimento crítico, morte, capítulo encerrado e Game Over;
- opção de ocultar HUD para cenas cinematográficas;
- suporte a teclado para o mestre avançar apresentação, sem revelar o painel.

## 4.2 Interface móvel dos jogadores

Rota:

```text
/join/:sessionCode
```

O jogador deve conseguir entrar sem criar conta tradicional. Crie uma identidade de sessão segura, com token assinado, armazenado de forma apropriada e revogável.

Funções:

- informar nome/apelido;
- escolher ou receber um personagem;
- selecionar avatar quando permitido;
- votar em A/B/C/D;
- escrever ação livre;
- gravar uma ação usando o microfone;
- enviar o áudio ao backend para STT;
- confirmar ação antes do prazo;
- ver o próprio personagem, HP, condições, itens autorizados e habilidades;
- receber segredos privados;
- responder a decisões privadas;
- ver somente informações autorizadas;
- reconectar automaticamente;
- mostrar status online/offline;
- bloquear alterações após `VOTE_LOCKED`;
- suportar modo de votação secreta;
- suportar ações individuais em combate;
- ter botões grandes e uso confortável com uma mão;
- vibrar discretamente quando uma decisão privada chegar, se o navegador permitir;
- não receber dados secretos de outros jogadores nem mesmo escondidos no HTML.

## 4.3 Painel privado do mestre/operador

Rota:

```text
/master/:sessionId
```

Requer autenticação real.

Funções:

- criar campanha;
- criar sessão;
- pausar, retomar e encerrar;
- mostrar QR Code;
- aprovar/remover participantes;
- atribuir personagens;
- acompanhar Presence;
- ver quem já respondeu sem necessariamente ver o voto antes de fechar;
- iniciar e fechar votação;
- definir cronômetro;
- resolver empate conforme regra configurada;
- escolher modo de decisão;
- ver rolagens públicas e secretas;
- ver estado oficial e estado secreto;
- acompanhar relógios de ameaça;
- controlar trilha, ambiente, efeitos e volume;
- regenerar uma mídia que falhou;
- pular TTS, imagem ou vídeo sem interromper o jogo;
- editar prompts e modelos em configurações avançadas;
- definir limites de gasto;
- visualizar custo por chamada e por sessão;
- inserir acontecimentos manuais;
- corrigir erro técnico de continuidade;
- executar rollback **somente técnico**, com log de auditoria;
- nunca oferecer botão de “salvar automaticamente os heróis”;
- revisar e confirmar conteúdos sensíveis quando a configuração exigir;
- salvar checkpoint técnico;
- exportar campanha.

## 4.4 Administração da campanha

Rotas adicionais sugeridas:

```text
/
/dashboard
/campaigns
/campaigns/new
/campaigns/:campaignId
/campaigns/:campaignId/world
/campaigns/:campaignId/characters
/campaigns/:campaignId/assets
/campaigns/:campaignId/timeline
/campaigns/:campaignId/gallery
/settings/models
/settings/audio
/settings/content
```

---

# 5. MODOS DE DECISÃO

Implemente os seguintes modos por cena:

- `CONSENSUS`: o mestre confirma a decisão consensual;
- `MAJORITY_VOTE`: maioria vence;
- `ROUND_LEADER`: um jogador designado decide;
- `INDIVIDUAL_ACTIONS`: cada personagem escolhe sua ação;
- `SECRET_ACTIONS`: ações ficam ocultas até a resolução;
- `TIMED_VOTE`: votação com tempo limitado;
- `MASTER_DECIDES_TIE`: mestre resolve empate;
- `RANDOM_TIEBREAK`: desempate aleatório auditável;
- `PARTY_STAT_TIEBREAK`: atributo relevante do grupo desempata.

As opções padrão são:

- A;
- B;
- C;
- D;
- ação livre opcional.

As opções não devem revelar recompensas ou consequências futuras. Exiba ações, não resultados antecipados.

Exemplo ruim:

```text
A — Salvar a criança e ganhar reputação.
```

Exemplo correto:

```text
A — Correr em direção à criança.
```

---

# 6. MÁQUINA DE ESTADOS DA SESSÃO E DO TURNO

Crie enums e validações server-side.

## Estado da sessão

```text
LOBBY
ACTIVE
PAUSED
CHAPTER_END
GAME_OVER
COMPLETED
ARCHIVED
```

## Estado do turno

```text
PREPARING
PRESENTING
AWAITING_PLAYERS
VOTING
VOTE_LOCKED
VALIDATING_ACTIONS
RESOLVING_RULES
COMMITTING_RESULT
GENERATING_SCENE
VALIDATING_CONTINUITY
GENERATING_MEDIA
READY_TO_PRESENT
ERROR_RECOVERY
CANCELLED
GAME_OVER
```

Requisitos:

- transições explícitas;
- nenhuma resolução duplicada;
- `turn_id` único;
- `resolution_lock`;
- idempotency key;
- transação no banco;
- optimistic concurrency por versão;
- registro de quem iniciou a resolução;
- timeout e recuperação;
- nenhuma Edge Function deve resolver o mesmo turno duas vezes;
- mídia pode falhar sem reverter a consequência oficial;
- geração de vídeo nunca deve bloquear a progressão obrigatoriamente.

---

# 7. MODELO DE DADOS

Crie migrations reais. Use UUID, timestamps, índices, foreign keys, check constraints e RLS.

As tabelas abaixo são uma base obrigatória; ajuste nomes se necessário, preservando responsabilidades.

## 7.1 Usuários e campanhas

### `profiles`

- `id uuid primary key references auth.users`
- `display_name text`
- `created_at timestamptz`
- `updated_at timestamptz`

### `campaigns`

- `id uuid primary key`
- `owner_id uuid`
- `title text`
- `description text`
- `genre text`
- `tone text`
- `difficulty_mode text`
- `content_settings jsonb`
- `world_rules jsonb`
- `system_constitution_version text`
- `status text`
- `created_at`
- `updated_at`

### `campaign_members`

- `campaign_id`
- `user_id`
- `role`: owner, co_master, observer
- timestamps

## 7.2 Sessões e participantes

### `game_sessions`

- `id uuid`
- `campaign_id uuid`
- `session_code text unique`
- `status text`
- `current_turn_id uuid nullable`
- `chapter_number int`
- `in_world_time timestamptz nullable`
- `join_enabled boolean`
- `settings jsonb`
- `state_version bigint default 0`
- `started_at`
- `ended_at`
- timestamps

### `session_participants`

- `id uuid`
- `session_id uuid`
- `display_name text`
- `join_token_hash text`
- `character_id uuid nullable`
- `connection_status text`
- `is_approved boolean`
- `is_ready boolean`
- `last_seen_at`
- timestamps

Nunca armazene token de entrada em texto puro.

## 7.3 Personagens

### `characters`

- `id uuid`
- `campaign_id uuid`
- `name text`
- `player_controlled boolean`
- `status`: active, unconscious, missing, captured, dead, retired
- `biography text`
- `attributes jsonb`
- `skills jsonb`
- `max_hp int`
- `current_hp int`
- `max_resources jsonb`
- `current_resources jsonb`
- `conditions jsonb`
- `injuries jsonb`
- `permanent_consequences jsonb`
- `location_id uuid nullable`
- `visual_profile jsonb`
- `voice_profile jsonb`
- `public_notes text`
- `private_notes text`
- `created_at`
- `updated_at`

### `character_knowledge`

- `id uuid`
- `character_id uuid`
- `fact_id uuid`
- `certainty numeric`
- `source text`
- `is_belief boolean`
- `learned_at_turn_id uuid`

Diferencie verdade, percepção e crença.

### `relationships`

- `source_character_id`
- `target_character_id`
- `trust int`
- `respect int`
- `fear int`
- `affection int`
- `resentment int`
- `suspicion int`
- `loyalty int`
- `debt int`
- `notes jsonb`

## 7.4 Mundo

### `locations`

- `id uuid`
- `campaign_id uuid`
- `name text`
- `description text`
- `parent_location_id uuid nullable`
- `coordinates jsonb nullable`
- `state jsonb`
- `visual_profile jsonb`
- `discovered boolean`

### `factions`

- `id uuid`
- `campaign_id uuid`
- `name text`
- `goals jsonb`
- `resources jsonb`
- `relationships jsonb`
- `current_plan jsonb`
- `status text`

### `world_entities`

Para objetos, criaturas, veículos, organizações menores e elementos persistentes.

- `id`
- `campaign_id`
- `entity_type`
- `name`
- `public_state jsonb`
- `secret_state jsonb`
- `location_id`
- `status`

### `world_facts`

- `id uuid`
- `campaign_id uuid`
- `fact_key text`
- `canonical_value jsonb`
- `visibility text`
- `source_event_id uuid nullable`
- `valid_from_turn_id uuid`
- `invalidated_at_turn_id uuid nullable`

### `threat_clocks`

- `id uuid`
- `campaign_id uuid`
- `name text`
- `current_value int`
- `max_value int`
- `visibility text`
- `advance_rules jsonb`
- `completion_effect jsonb`
- `status text`

## 7.5 Itens e recursos

### `items`

- `id uuid`
- `campaign_id uuid`
- `name text`
- `item_type text`
- `properties jsonb`
- `durability_current int nullable`
- `durability_max int nullable`
- `status`: available, equipped, consumed, lost, destroyed
- `owner_character_id uuid nullable`
- `location_id uuid nullable`

### `inventory_transactions`

Registro imutável de aquisição, consumo, transferência, perda e destruição.

## 7.6 Turnos e escolhas

### `turns`

- `id uuid`
- `session_id uuid`
- `turn_number int`
- `state text`
- `state_version bigint`
- `scene_type text`
- `decision_mode text`
- `public_scene jsonb`
- `secret_context jsonb`
- `rules_snapshot jsonb`
- `resolution_lock text nullable`
- `idempotency_key text unique`
- `opened_at`
- `locked_at`
- `resolved_at`
- timestamps

### `turn_options`

- `id uuid`
- `turn_id uuid`
- `option_key`: A, B, C, D, FREE
- `public_text text`
- `mechanical_intent jsonb`
- `display_order int`
- `enabled boolean`

O frontend público só pode receber `public_text`. `mechanical_intent` é secreto.

### `player_actions`

- `id uuid`
- `turn_id uuid`
- `participant_id uuid`
- `character_id uuid`
- `option_id uuid nullable`
- `free_text text nullable`
- `transcribed_text text nullable`
- `action_payload jsonb`
- `submitted_at`
- `locked boolean`
- unique por turno e participante quando aplicável

### `dice_rolls`

- `id uuid`
- `turn_id uuid`
- `character_id uuid nullable`
- `roll_type text`
- `formula text`
- `raw_values jsonb`
- `modifiers jsonb`
- `total int`
- `difficulty int nullable`
- `outcome text`
- `visibility text`
- `rng_proof jsonb`
- `created_at`

### `turn_resolutions`

- `id uuid`
- `turn_id uuid unique`
- `official_result jsonb`
- `consequences_applied jsonb`
- `deaths jsonb`
- `game_over_state jsonb nullable`
- `rules_engine_version text`
- `committed_at`

## 7.7 Eventos e memória

### `campaign_events`

Tabela append-only e auditável.

- `id uuid`
- `campaign_id uuid`
- `session_id uuid nullable`
- `turn_id uuid nullable`
- `event_type text`
- `public_summary text`
- `canonical_payload jsonb`
- `visibility text`
- `importance int`
- `created_at`

### `memory_documents`

- `id uuid`
- `campaign_id uuid`
- `memory_type`: recent_scene, episodic, character, relationship, faction, lore, unresolved_plot, summary
- `owner_character_id uuid nullable`
- `content text`
- `metadata jsonb`
- `importance int`
- `embedding vector(...) nullable`
- `source_event_ids uuid[]`
- timestamps

A dimensão do vetor deve ser configurável conforme o modelo de embedding selecionado. Não presuma uma dimensão fixa sem consultar/configurar o modelo.

### `campaign_summaries`

- resumo da campanha;
- resumo do capítulo;
- resumo por personagem;
- perguntas em aberto;
- promessas e dívidas;
- perdas permanentes;
- fatos que nunca podem ser contraditos.

## 7.8 Agentes e chamadas

### `agent_configs`

- `id`
- `campaign_id nullable`
- `agent_type`
- `model_slug`
- `fallback_model_slugs jsonb`
- `system_prompt text`
- `temperature numeric`
- `max_tokens int`
- `reasoning_config jsonb`
- `enabled boolean`
- `schema_version text`

### `ai_requests`

- `id`
- `campaign_id`
- `session_id`
- `turn_id nullable`
- `agent_type`
- `model_requested`
- `model_used`
- `provider_used nullable`
- `request_metadata jsonb`
- `response_metadata jsonb`
- `input_tokens nullable`
- `output_tokens nullable`
- `cost_usd numeric nullable`
- `latency_ms nullable`
- `status`
- `error_code nullable`
- `created_at`

Não armazene prompts secretos completos indiscriminadamente. Permita modo de log redigido.

## 7.9 Mídia

### `media_assets`

- `id uuid`
- `campaign_id uuid`
- `session_id uuid nullable`
- `turn_id uuid nullable`
- `media_type`: image, video, tts, music, ambience, sfx, portrait, map
- `storage_path text`
- `mime_type text`
- `status`: queued, generating, ready, failed, superseded
- `prompt text nullable`
- `model_slug text nullable`
- `generation_metadata jsonb`
- `continuity_metadata jsonb`
- `duration_ms nullable`
- `width nullable`
- `height nullable`
- `cost_usd nullable`
- timestamps

### `audio_library`

- `id`
- `campaign_id nullable`
- `asset_id`
- `category`: music, ambience, sfx
- `tags text[]`
- `loopable boolean`
- `intensity int`
- `bpm nullable`
- `mood text[]`
- `location_tags text[]`
- `content_rating jsonb`

### `audio_cues`

- faixa ambiente;
- trilha;
- volumes;
- crossfade;
- efeitos com delays;
- estado de silêncio;
- timestamps da cena.

## 7.10 Segredos e notificações

### `private_messages`

- `id`
- `session_id`
- `participant_id`
- `turn_id nullable`
- `message_type`
- `content jsonb`
- `read_at nullable`
- `expires_at nullable`

## 7.11 Auditoria e recuperação

### `audit_log`

- ator;
- ação;
- tabela/recurso;
- valores anteriores e posteriores quando seguro;
- razão;
- timestamp.

### `technical_checkpoints`

- snapshot necessário para recuperação de falha;
- nunca usado automaticamente para desfazer uma consequência narrativa legítima.

---

# 8. RLS E SEGURANÇA

Implemente RLS em todas as tabelas expostas.

Regras mínimas:

- dono/co-mestre acessa campanhas autorizadas;
- projetor recebe somente estado público da sessão;
- participante recebe estado público + dados do próprio personagem + mensagens privadas destinadas a ele;
- nenhum participante acessa `secret_context`, `mechanical_intent`, rolagens secretas ou memória privada de terceiros;
- tokens anônimos são validados no backend;
- service role nunca aparece no frontend;
- `OPENROUTER_API_KEY` existe apenas em Secrets de Edge Functions;
- todas as chamadas OpenRouter são server-side;
- URLs assinadas para mídia privada quando necessário;
- rate limiting por sessão, participante e IP;
- validação de tamanho para texto e áudio;
- sanitização de entrada;
- proteção contra prompt injection: texto de jogador é dado não confiável e nunca substitui instruções do sistema;
- ações livres não podem chamar ferramentas arbitrárias;
- CORS restrito ao app;
- logs não devem expor chaves, tokens ou segredos de campanha;
- use funções RPC/Edge Functions para operações críticas em vez de writes diretos do cliente.

Crie views ou RPCs específicas para:

- `get_public_session_state`;
- `get_player_session_state`;
- `get_master_session_state`;
- `submit_player_action`;
- `lock_turn`;
- `resolve_turn`;
- `publish_scene`.

---

# 9. REALTIME

Use Supabase Realtime de forma apropriada:

- **Presence** para presença online e prontidão, sem atualizações de alta frequência;
- **Broadcast** para eventos efêmeros de baixa latência, como `turn_opened`, `vote_locked`, `scene_ready`, `audio_cue`, `damage_flash`;
- mudanças persistentes ficam no banco;
- reconexão busca o estado canônico no banco;
- não confie apenas em mensagens Broadcast para dados importantes;
- crie canais privados por sessão;
- aplique autorização por sessão;
- evite expor payloads secretos em canais públicos.

Eventos sugeridos:

```text
participant_joined
participant_left
participant_ready
turn_opened
vote_submitted
vote_locked
rules_resolution_started
rules_resolution_committed
scene_text_ready
image_ready
video_ready
tts_ready
audio_cue
private_message
character_damaged
character_dead
game_over
session_paused
session_resumed
```

---

# 10. INTEGRAÇÃO OPENROUTER

Base URL:

```text
https://openrouter.ai/api/v1
```

Headers server-side:

```http
Authorization: Bearer ${OPENROUTER_API_KEY}
Content-Type: application/json
HTTP-Referer: ${APP_PUBLIC_URL}
X-Title: Family Cinematic RPG
```

`HTTP-Referer` e `X-Title` são identificadores opcionais, mas devem ser configuráveis.

## 10.1 Texto e agentes

Endpoint:

```text
POST /chat/completions
```

Use para:

- Diretor de Cena;
- Narrador;
- Simulador de Mundo;
- Diretor de NPCs;
- Diretor de Arte;
- Diretor de Áudio;
- Guardião de Continuidade;
- Gerente de Memória;
- classificador de intenção de ação livre.

Para saídas internas, use `response_format` com `type: "json_schema"`, `strict: true`, e schemas fechados com `additionalProperties: false` quando o modelo suportar.

Inclua, quando necessário:

```json
{
  "provider": {
    "require_parameters": true,
    "data_collection": "deny"
  }
}
```

A política de coleta deve ser configurável pelo proprietário, com padrão conservador.

Valide toda resposta com Zod ou Ajv no backend. Em caso de falha:

1. tente o plugin de response healing apenas em requisições não streaming compatíveis;
2. valide novamente;
3. faça uma repetição curta com instrução de reparo;
4. tente o modelo fallback;
5. se ainda falhar, mantenha o estado oficial e abra `ERROR_RECOVERY`.

Nunca aplique consequências recebidas em JSON sem validação mecânica.

## 10.2 Descoberta de modelos

Endpoint geral:

```text
GET /models
```

Use filtros de modalidades quando disponíveis. Crie uma tela que atualize e armazene cache de modelos e capacidades.

Não deixe slugs importantes presos no código. Permita escolher modelos e fallbacks para cada função.

## 10.3 Imagens

Descoberta:

```text
GET /images/models
```

Geração:

```text
POST /images
```

Configuração padrão para o projetor:

- proporção `16:9`;
- resolução `1K` quando suportada;
- formato `webp` ou formato eficiente suportado;
- qualidade equilibrada;
- não exigir 4K;
- retratos podem usar proporção adequada separada;
- mapas podem usar 16:9 ou 1:1 conforme contexto.

Antes de gerar, consulte capacidades do modelo ou use o cache do catálogo para não enviar parâmetros incompatíveis.

Persistência:

- decodifique o resultado no backend;
- valide MIME e tamanho;
- salve no Storage;
- registre `media_assets`;
- entregue URL apropriada ao cliente;
- nunca dependa apenas de conteúdo base64 na memória do navegador.

A imagem é assíncrona do ponto de vista da experiência. A cena textual não deve ficar bloqueada esperando a imagem.

## 10.4 Vídeo

Descoberta:

```text
GET /videos/models
```

Criar job:

```text
POST /videos
```

Consultar:

```text
GET /videos/:jobId
```

Baixar conteúdo concluído:

```text
GET /videos/:jobId/content
```

Implemente vídeo como job assíncrono com:

- fila;
- polling com backoff;
- timeout;
- cancelamento lógico;
- persistência do `jobId`;
- custo previsto e custo real;
- download server-side;
- Storage;
- fallback para imagem;
- nenhuma espera bloqueante no frontend.

Use vídeo somente quando o Diretor de Arte classificar a cena como excepcional e o orçamento permitir, por exemplo:

- abertura;
- chegada a local central;
- aparição de chefe;
- transformação;
- morte memorável;
- final de capítulo;
- Game Over;
- recap.

## 10.5 Text-to-Speech

Endpoint:

```text
POST /audio/speech
```

A resposta é binária. O backend deve:

- escolher modelo/voz;
- enviar texto curto e segmentado;
- receber bytes;
- validar formato;
- salvar no Storage;
- registrar custo e duração;
- publicar evento `tts_ready`;
- tocar apenas após gesto inicial do usuário para obedecer autoplay dos navegadores.

Crie perfis de voz por personagem. Vozes devem ser configuráveis e ter fallback.

Não gere TTS novamente para texto idêntico. Faça cache por hash de:

```text
model + voice + speed + language + normalized_text
```

## 10.6 Speech-to-Text

Endpoint:

```text
POST /audio/transcriptions
```

Use para ação por voz no celular.

Requisitos:

- solicitação explícita de permissão de microfone;
- gravação limitada em duração e tamanho;
- preview e botão cancelar;
- upload somente ao backend;
- base64 ou formato suportado pela API;
- mostrar transcrição ao jogador para confirmar antes de enviar;
- apagar o áudio temporário conforme política de retenção;
- não tratar transcrição como instrução de sistema.

## 10.7 Embeddings

Endpoint:

```text
POST /embeddings
```

Use para criar embeddings de:

- eventos importantes;
- memórias episódicas;
- fatos de personagens;
- relações;
- lore;
- pistas e promessas;
- conflitos ainda não resolvidos.

O modelo de embedding e sua dimensão são configuráveis. Verifique compatibilidade antes de criar/alterar a coluna vetorial.

Implemente busca híbrida:

- filtros SQL por campanha, personagem, visibilidade, tipo e recência;
- similaridade vetorial;
- importância;
- fatos canônicos obrigatórios;
- limite de contexto.

---

# 11. AGENTES LÓGICOS

Crie agentes separados por responsabilidade, mas não faça dez chamadas caras em todo turno. O orquestrador decide quais agentes chamar.

## 11.1 Orquestrador

Preferencialmente código determinístico.

Responsabilidades:

- ler estado do turno;
- selecionar contexto autorizado;
- decidir agentes necessários;
- evitar chamadas duplicadas;
- aplicar orçamento e timeout;
- coordenar fallbacks;
- garantir que resultado mecânico seja imutável;
- publicar o próximo estado.

## 11.2 Classificador de intenção

Chamado apenas para ação livre quando necessário.

Retorna intenção estruturada, sem decidir sucesso:

```json
{
  "actorCharacterId": "uuid",
  "actionType": "attack|move|interact|persuade|investigate|use_item|defend|assist|other",
  "targets": ["uuid-or-key"],
  "declaredMethod": "string",
  "requiredChecks": ["skill-key"],
  "resourceIntents": [],
  "ambiguities": [],
  "safetyFlags": []
}
```

## 11.3 Motor de Regras

Não é LLM.

Responsabilidades:

- validar ação;
- selecionar teste;
- gerar aleatoriedade;
- calcular modificadores;
- determinar sucesso, falha, crítico e consequências mecânicas;
- consumir recursos;
- aplicar dano;
- aplicar condições;
- destruir/perder itens;
- atualizar relógios;
- determinar morte;
- determinar Game Over;
- gravar tudo em transação.

Crie uma interface versionada para diferentes sistemas de regras.

## 11.4 Simulador de Mundo

Chamado quando tempo passa ou um gatilho exige.

Recebe estado secreto e retorna propostas estruturadas para:

- progresso de planos de facções;
- deslocamento de NPCs;
- consequências atrasadas;
- rumores;
- mudanças econômicas;
- clima quando relevante;
- ameaça fora de cena.

As propostas são validadas antes de serem aplicadas.

## 11.5 Diretor de NPCs

Mantém autonomia e conhecimento limitado.

Para cada NPC relevante, considere:

- objetivos;
- medos;
- recursos;
- lealdades;
- limites morais;
- plano atual;
- fatos conhecidos;
- crenças incorretas;
- relação com cada personagem;
- localização;
- risco percebido.

NPC não pode agir com conhecimento que não possui.

## 11.6 Diretor de Cena

Recebe o resultado oficial imutável e decide apresentação:

- foco;
- duração;
- ritmo;
- ordem de revelação;
- diálogos permitidos;
- ponto de corte;
- tipo de decisão seguinte;
- necessidade de mídia.

Não pode alterar dano, morte, item, localização, teste ou consequência oficial.

## 11.7 Narrador

Produz a cena final em português brasileiro natural e cinematográfico.

Regras:

- não soar como assistente;
- não elogiar escolhas automaticamente;
- não revelar segredos mecânicos;
- não inventar salvamento;
- não decidir resultado ainda não calculado;
- manter texto adequado para leitura em projetor;
- preferir parágrafos curtos;
- separar diálogos;
- criar opções claras e distintas;
- não revelar consequências nas opções;
- respeitar conteúdo familiar configurado;
- respeitar fatos canônicos e resultado oficial.

## 11.8 Diretor de Arte

Recebe apenas contexto visual necessário e perfis visuais canônicos.

Decide:

- `generateImage`;
- `generateVideo`;
- tipo de imagem;
- prioridade;
- composição;
- enquadramento;
- personagens presentes;
- roupas atuais;
- ferimentos visíveis;
- equipamentos visíveis;
- local, clima, horário;
- estilo visual da campanha;
- prompt positivo;
- restrições de continuidade;
- resolução e proporção compatíveis;
- imagem de referência disponível.

Tipos:

```text
establishing_shot
character_reveal
action_shot
discovery_shot
emotional_shot
map
item_reveal
transition
chapter_art
game_over
```

Não gere imagem em todo turno. Gere quando houver valor cinematográfico real.

## 11.9 Diretor de Áudio

O OpenRouter será usado para TTS e STT. Para música ambiente e efeitos, use uma biblioteca previamente enviada ao Storage, porque o sistema não deve depender de geração musical ao vivo.

O Diretor de Áudio recebe os assets disponíveis e decide:

- ambiente em loop;
- música;
- volumes;
- fade/crossfade;
- efeitos pontuais;
- silêncio dramático;
- TTS do narrador e personagens;
- prioridade;
- tempo relativo.

Saída sugerida:

```json
{
  "ambience": {
    "assetKey": "forest_rain_night_02",
    "volume": 0.45,
    "loop": true
  },
  "music": {
    "assetKey": "tension_slow_04",
    "volume": 0.24,
    "transition": "crossfade",
    "transitionMs": 3500
  },
  "effects": [
    {
      "assetKey": "branch_snap_close",
      "delayMs": 1400,
      "volume": 0.8
    }
  ],
  "silenceWindow": null,
  "speechSegments": []
}
```

Use Web Audio API com buses separados:

- master;
- music;
- ambience;
- SFX;
- voice.

Implemente compressor/limiter leve para evitar picos. Não especifique processamento excessivo.

## 11.10 Guardião de Continuidade

Primeiro faça validações em código:

- morto não fala;
- item perdido não é usado;
- localização é coerente;
- HP não excede máximo;
- recursos não ficam negativos;
- personagem não sabe fato proibido;
- roupa, ferimento e equipamento visual são consistentes;
- resultado oficial aparece corretamente;
- opções não revelam consequência;
- não existe contradição com fato canônico.

Use LLM apenas em cenas complexas. O guardião pode solicitar regeneração da apresentação, mas não alterar o resultado oficial.

## 11.11 Gerente de Memória

Responsabilidades:

- selecionar eventos importantes;
- gerar resumos incrementais;
- criar memórias por personagem;
- atualizar perguntas em aberto;
- gerar embeddings;
- recuperar contexto relevante;
- nunca substituir fatos canônicos por resumo impreciso.

---

# 12. CONTRATOS JSON

Use JSON Schema estrito e validação no backend.

## 12.1 Saída combinada do Diretor de Cena + Narrador

```json
{
  "sceneTitle": "string",
  "sceneType": "exploration|dialogue|investigation|combat|rest|travel|revelation|consequence|game_over",
  "tone": "string",
  "narrationBlocks": [
    {
      "type": "narration|dialogue|system_event",
      "speakerCharacterId": "uuid-or-null",
      "text": "string",
      "emotion": "string-or-null"
    }
  ],
  "publicStatusChanges": [
    {
      "entityId": "uuid",
      "label": "string",
      "displayValue": "string"
    }
  ],
  "decision": {
    "required": true,
    "mode": "MAJORITY_VOTE",
    "timeLimitSeconds": 90,
    "options": [
      {
        "key": "A",
        "text": "string",
        "mechanicalIntent": {
          "actionType": "string",
          "targets": [],
          "approach": "string"
        }
      }
    ],
    "allowFreeAction": true
  },
  "artDirectionNeeded": true,
  "audioDirectionNeeded": true,
  "privateMessageRequests": [],
  "memoryCandidates": []
}
```

O frontend nunca recebe `mechanicalIntent`.

## 12.2 Resultado oficial do motor

```json
{
  "resolutionId": "uuid",
  "turnId": "uuid",
  "selectedActions": [],
  "rolls": [],
  "outcomes": [],
  "stateMutations": [],
  "resourcesConsumed": [],
  "itemsChanged": [],
  "conditionsApplied": [],
  "injuriesApplied": [],
  "deaths": [],
  "clockChanges": [],
  "worldEvents": [],
  "gameOver": {
    "triggered": false,
    "type": null,
    "reason": null,
    "survivingCharacters": []
  }
}
```

## 12.3 Direção de arte

```json
{
  "generateImage": true,
  "generateVideo": false,
  "reason": "string",
  "mediaType": "establishing_shot",
  "priority": "low|normal|high|critical",
  "aspectRatio": "16:9",
  "resolution": "1K",
  "prompt": "string",
  "negativeConstraints": ["string"],
  "visibleCharacterIds": [],
  "referenceAssetIds": [],
  "continuityChecklist": []
}
```

## 12.4 Validação de continuidade

```json
{
  "valid": true,
  "issues": [
    {
      "severity": "warning|error|fatal",
      "code": "string",
      "description": "string",
      "repairInstruction": "string"
    }
  ]
}
```

---

# 13. GAME OVER

Implemente Game Over real.

Tipos:

```text
INDIVIDUAL_DEATH
PARTY_WIPE
MISSION_IRREVERSIBLY_FAILED
WORLD_LOST
CAPTURE_WITH_NO_CONTINUATION
PERMANENT_IMPRISONMENT
OBJECTIVE_ABANDONED
MORAL_COLLAPSE
CUSTOM_NARRATIVE_END
```

Regras:

- morte oficial é permanente, salvo se o universo definir previamente uma mecânica rara, com custo e regras claras;
- a IA não cria ressurreição de emergência;
- quando um jogador morre, as opções configuráveis incluem assumir NPC, criar novo personagem em ponto narrativamente válido ou observar;
- Party Wipe encerra a campanha ou cria epílogo, conforme configuração;
- Game Over gera cena final, resumo, estatísticas e registro na timeline;
- não use mensagem genérica de videogame;
- a cena deve explicar a consequência concreta;
- o mestre pode corrigir bug técnico, mas não cancelar derrota legítima com um clique casual;
- qualquer rollback após Game Over exige motivo e auditoria.

Crie tela cinematográfica com:

- imagem ou vídeo opcional;
- música ou silêncio;
- epílogo;
- personagens mortos/sobreviventes;
- decisões decisivas;
- botão para ver timeline;
- botão para iniciar campanha alternativa;
- botão administrativo separado para recuperação técnica.

---

# 14. SISTEMA DE DADOS E DIFICULDADE

Implemente um motor genérico configurável. Para o MVP, use d20.

Exemplo:

```text
resultado = d20 + atributo + perícia + equipamento + situação + condição
```

Categorias:

- falha crítica;
- falha;
- sucesso com custo apenas quando as regras permitirem;
- sucesso;
- sucesso crítico.

O modelo narrativo nunca escolhe a categoria.

Dificuldades devem considerar:

- plausibilidade;
- ambiente;
- ferimentos;
- tempo disponível;
- ferramentas;
- ajuda;
- oposição;
- conhecimento;
- recursos.

Crie RNG no backend usando fonte criptograficamente apropriada. Armazene valores e metadados suficientes para auditoria, sem prometer verificabilidade criptográfica completa além do implementado.

Modos:

- `ADVENTURE`: letalidade reduzida, sem invulnerabilidade;
- `REALISTIC`: consequências severas;
- `BRUTAL`: recursos escassos e alta letalidade.

A dificuldade altera números e frequência de recursos, não a honestidade do narrador.

---

# 15. FERIMENTOS, RECURSOS E RELAÇÕES

## Ferimentos

Suporte:

- leves;
- graves;
- críticos;
- permanentes;
- hemorragia;
- incapacidade;
- trauma conforme configuração familiar.

## Recursos

- munição;
- comida;
- dinheiro;
- energia/mana;
- durabilidade;
- tempo;
- espaço de inventário;
- fadiga.

## Relações

Não use apenas amizade. Controle dimensões independentes:

- confiança;
- respeito;
- medo;
- afeto;
- ressentimento;
- suspeita;
- lealdade;
- dívida.

---

# 16. MEMÓRIA FORTE

Não envie todo o histórico a cada chamada.

Monte o contexto com camadas:

1. Constituição e regras permanentes.
2. Fatos canônicos relevantes.
3. Resultado oficial do turno.
4. Estado atual dos personagens presentes.
5. Conhecimento autorizado de NPCs.
6. Últimas cenas completas.
7. Memórias recuperadas por busca híbrida.
8. Resumo do capítulo.
9. Lore diretamente relevante.

Crie orçamento de tokens por camada.

Fatos canônicos têm prioridade absoluta sobre resumos e memórias vetoriais.

Registre consequências atrasadas e promessas com gatilhos.

Exemplo:

```text
Turno 12: grupo abandonou a vila.
Turno 34: sobreviventes chegaram à capital.
Turno 51: reputação do grupo foi prejudicada.
Turno 80: um sobrevivente passou a apoiar a facção rival.
```

---

# 17. MÍDIA E EXPERIÊNCIA SEM BLOQUEIO

Ordem da experiência após fechar uma decisão:

1. bloquear votação;
2. mostrar animação curta de resolução;
3. calcular regras;
4. gravar resultado;
5. gerar cena textual;
6. apresentar texto por blocos;
7. iniciar TTS quando pronto;
8. manter imagem anterior enquanto a nova é gerada;
9. fazer crossfade quando a nova imagem chegar;
10. disponibilizar vídeo quando concluído e em ponto apropriado.

Nunca deixe a família olhando para uma tela vazia aguardando mídia.

Crie estados visuais discretos:

- resolvendo;
- preparando cena;
- arte sendo produzida;
- vídeo em preparação;
- áudio indisponível, seguindo sem voz.

Mídia é enriquecimento. Falha de mídia não invalida o turno.

---

# 18. ÁUDIO AMBIENTE

Crie uma tela para upload e organização de biblioteca de áudio.

Categorias mínimas:

```text
ambience/forest
ambience/city
ambience/cave
ambience/rain
ambience/fire
music/exploration
music/mystery
music/tension
music/combat
music/drama
music/victory
music/game_over
sfx/doors
sfx/weapons
sfx/steps
sfx/weather
sfx/creatures
sfx/impacts
```

Recursos:

- upload múltiplo;
- tags;
- preview;
- normalização de volume percebido quando viável;
- definição de loop;
- fade in/out;
- crossfade;
- ducking da música durante TTS;
- botão de emergência para silenciar;
- controles independentes no painel do mestre;
- persistência de preferências no dispositivo do projetor.

Devido às políticas de autoplay, a tela do projetor deve pedir uma única interação inicial do operador: **“Ativar áudio da sessão”**.

---

# 19. DIREÇÃO VISUAL

Crie design original, não copie interface de produto existente.

Estética:

- cinematográfica;
- dark fantasy neutra no MVP, mas adaptável por campanha;
- alto contraste;
- superfícies escuras;
- tipografia legível a distância;
- detalhes em metal/papel/textura discretos;
- animações elegantes, não excessivas;
- foco total na cena.

Projetor:

- base 1920×1080;
- responsivo para 16:9;
- imagem 1K é aceitável;
- use `object-fit: cover` com opção de reposicionar foco;
- safe area para overscan;
- tamanho de fonte grande;
- modo tela cheia;
- não exibir rolagem vertical na cena principal.

Celular:

- cards grandes;
- contraste;
- feedback háptico quando possível;
- estados de envio claros;
- acessibilidade;
- suporte a modo paisagem e retrato, priorizando retrato.

---

# 20. CONTEÚDO FAMILIAR E SEGURANÇA NARRATIVA

Crie configurações por campanha:

- violência: leve, média, pesada;
- gore: desligado, moderado, explícito;
- terror: leve, médio, pesado;
- conteúdo sexual: desligado por padrão;
- linguagem: leve, moderada, pesada;
- crueldade animal;
- morte de crianças;
- tortura;
- temas psicológicos;
- fobias e tópicos bloqueados.

O controle de conteúdo não pode ser confundido com proteção de protagonista. Uma campanha pode ser letal sem mostrar conteúdo proibido.

Implemente filtros antes e depois da geração. Quando uma saída viola configurações, regenere a apresentação preservando o resultado mecânico.

---

# 21. CUSTOS, LIMITES E FALLBACKS

Crie configurações:

- limite máximo por sessão em USD;
- limite diário;
- limite por mídia;
- vídeo desativado por padrão ou exigindo confirmação;
- imagens máximas por capítulo;
- TTS máximo por cena;
- timeout por endpoint;
- número máximo de retries;
- modelos fallback.

Antes de gerar vídeo caro, estime custo quando os metadados permitirem e aplique política configurada.

Registre uso retornado pelo OpenRouter quando disponível.

Circuit breaker:

- se um endpoint falhar repetidamente, marque temporariamente indisponível;
- use fallback;
- preserve a sessão;
- informe apenas o mestre, sem quebrar a imersão no projetor.

---

# 22. EDGE FUNCTIONS / SERVIÇOS

Crie Edge Functions ou módulos equivalentes com responsabilidades claras:

```text
openrouter-models
openrouter-chat
openrouter-image
openrouter-video-create
openrouter-video-poll
openrouter-video-download
openrouter-tts
openrouter-stt
openrouter-embeddings
create-session
join-session
submit-action
lock-turn
resolve-turn
advance-world
generate-scene
validate-continuity
generate-art-direction
generate-audio-direction
publish-turn
send-private-message
create-memory
retrieve-memory
campaign-export
```

Evite uma função monolítica enorme.

Crie biblioteca compartilhada server-side para:

- autenticação;
- OpenRouter client;
- retries;
- idempotência;
- logging redigido;
- validação Zod/Ajv;
- cálculo de custo;
- Storage;
- erros padronizados;
- checagem de orçamento.

---

# 23. UX DE CRIAÇÃO DA CAMPANHA

Wizard inicial:

1. Nome e gênero.
2. Tema e estilo visual.
3. Número de jogadores.
4. Tom e dificuldade.
5. Limites de conteúdo.
6. Sistema de regras.
7. Criação de personagens.
8. Modelos OpenRouter.
9. Vozes.
10. Biblioteca de áudio.
11. Revisão.
12. Criar lobby.

Permita gerar sugestões por IA, mas toda campanha deve ser editável.

---

# 24. RECAP E DIÁRIO

Ao iniciar nova sessão, gere recap cinematográfico:

- decisões anteriores;
- mortes;
- perdas;
- situação atual;
- perguntas em aberto;
- última cena.

Crie timeline e galeria:

- eventos;
- imagens;
- vídeos;
- personagens mortos;
- itens lendários;
- relações alteradas;
- citações marcantes;
- finais.

Permita exportar em JSON e Markdown. A exportação deve preservar fatos e configurações sem incluir segredos de API.

---

# 25. DADOS DE DEMONSTRAÇÃO

Crie uma campanha demo pequena, claramente marcada como demonstração, com:

- 3 personagens;
- 2 NPCs;
- 2 locais;
- 1 facção;
- 4 itens;
- 1 relógio oculto;
- 1 cena pronta com opções A/B/C/D;
- biblioteca de áudio vazia com instruções de upload;
- nenhum asset protegido por direitos autorais incluído sem licença.

Não simule chamadas OpenRouter como se fossem reais. Quando não houver chave configurada, mostre no painel:

> “Configure OPENROUTER_API_KEY nos Secrets para ativar os agentes e a geração de mídia.”

O restante da UI pode ser testado com dados demo explicitamente identificados.

---

# 26. TESTES OBRIGATÓRIOS

Crie testes unitários e de integração para os fluxos críticos.

## Motor

- ação impossível é rejeitada;
- recurso não fica negativo;
- item destruído não pode ser usado;
- personagem morto não age;
- dano pode matar;
- Game Over é acionado;
- rolagem não é duplicada;
- transação falha por inteiro quando uma mutação é inválida.

## Segurança

- jogador A não lê segredo do jogador B;
- projetor não lê estado secreto;
- chave OpenRouter não aparece no bundle;
- participante não escreve diretamente em tabela crítica;
- token inválido não entra na sessão;
- RLS impede acesso cruzado entre campanhas.

## Turnos

- duas chamadas `resolve_turn` com mesma idempotency key geram uma resolução;
- reconexão recupera estado;
- falha de imagem não reverte resultado;
- falha de TTS mantém jogo funcional;
- vídeo assíncrono não bloqueia turno;
- votos não mudam após lock.

## Continuidade

- morto falando é detectado;
- item perdido reaparecendo é detectado;
- NPC usando conhecimento proibido é detectado;
- opção revelando recompensa é sinalizada.

## UI

- tela do projetor funciona em 1920×1080;
- celular funciona em largura pequena;
- QR Code abre rota correta;
- autoplay é tratado com gesto inicial;
- modo tela cheia funciona quando suportado.

---

# 27. CRITÉRIOS DE ACEITE DO MVP

O MVP só está concluído quando for possível:

1. Um mestre autenticado criar campanha e sessão.
2. O projetor mostrar lobby com QR Code.
3. Dois ou mais celulares entrarem com identidades separadas.
4. O mestre atribuir personagens.
5. Uma cena aparecer com opções A/B/C/D.
6. Cada jogador votar pelo celular.
7. O backend bloquear a votação.
8. O motor resolver a ação uma única vez.
9. A consequência alterar estado persistente.
10. O OpenRouter gerar uma cena estruturada por backend.
11. A cena ser validada antes de publicar.
12. O projetor e celulares atualizarem em Realtime.
13. Uma imagem 16:9 1K ser solicitada, salva e exibida quando o modelo suportar.
14. TTS ser gerado, salvo e reproduzido.
15. Uma ação por microfone ser transcrita e confirmada.
16. Um segredo ser enviado a somente um jogador.
17. Um personagem poder sofrer morte permanente.
18. O sistema poder entrar em Game Over.
19. A campanha permanecer após atualizar o navegador.
20. Nenhuma chave secreta aparecer no frontend.

---

# 28. ORDEM DE IMPLEMENTAÇÃO

Implemente por fases, mantendo o app executável a cada fase.

## Fase 1 — Fundação

- projeto React/TypeScript;
- Lovable Cloud ou Supabase;
- autenticação do mestre;
- migrations;
- RLS;
- campanhas;
- sessões;
- rotas principais;
- lobby;
- QR Code;
- join mobile;
- Realtime Presence.

## Fase 2 — Turno determinístico

- máquina de estados;
- opções;
- votos;
- idempotência;
- motor d20;
- eventos;
- HP;
- morte;
- Game Over;
- telas de resultado.

## Fase 3 — OpenRouter texto

- secrets;
- client server-side;
- catálogo de modelos;
- configurações por agente;
- JSON Schema;
- Diretor de Cena + Narrador;
- validação;
- logs e custos.

## Fase 4 — Memória e mundo

- eventos canônicos;
- resumos;
- embeddings;
- recuperação híbrida;
- NPCs;
- facções;
- relógios;
- mundo fora de cena.

## Fase 5 — Imagem

- diretor de arte;
- catálogo de imagens;
- geração 16:9 1K;
- Storage;
- galeria;
- crossfade;
- consistência visual.

## Fase 6 — Voz e áudio

- TTS;
- STT;
- perfis de voz;
- biblioteca de música/ambiente/SFX;
- Web Audio API;
- áudio em camadas;
- ducking;
- cues.

## Fase 7 — Vídeo e acabamento

- jobs de vídeo;
- polling;
- download;
- fallback;
- recap;
- timeline;
- exportação;
- testes finais.

Não tente esconder tarefas incompletas. Mantenha uma lista visível no README e no painel de desenvolvimento.

---

# 29. REGRAS PARA A IMPLEMENTAÇÃO PELO LOVABLE

1. Antes de codificar, apresente um plano técnico e identifique dependências.
2. Não use mocks silenciosos em funcionalidades marcadas como reais.
3. Não exponha secrets.
4. Não coloque lógica crítica apenas no frontend.
5. Não permita writes diretos em estado oficial por clientes comuns.
6. Não deixe TODOs críticos sem indicar.
7. Gere migrations reproduzíveis.
8. Use TypeScript estrito.
9. Use componentes pequenos e serviços separados.
10. Evite `any` em contratos críticos.
11. Valide respostas externas.
12. Trate erros e timeouts.
13. Preserve acessibilidade.
14. Crie estados vazios e de erro úteis.
15. Não remova funcionalidades anteriores ao implementar a próxima fase.
16. Ao final de cada fase, liste arquivos alterados, migrations, secrets necessários e testes executados.
17. Quando uma decisão técnica depender de uma capacidade variável de modelo, consulte o catálogo do OpenRouter e crie fallback, em vez de presumir suporte universal.
18. Não reduza este produto a uma interface de chat.

---

# 30. PRIMEIRA ENTREGA SOLICITADA AGORA

Após ler tudo:

1. Entre em Plan Mode.
2. Resuma a arquitetura em no máximo 20 pontos.
3. Identifique riscos e dependências.
4. Confirme a escolha entre Lovable Cloud e Supabase conectado, priorizando portabilidade e acesso às Edge Functions, Storage, Realtime, RLS e pgvector.
5. Crie o schema/migrations fundamentais.
6. Implemente a **Fase 1** completamente.
7. Prepare a base da Fase 2 sem fingir que OpenRouter já está conectado se o Secret ainda não existir.
8. Gere um README técnico com:
   - arquitetura;
   - rotas;
   - configuração;
   - secrets;
   - migrations;
   - políticas RLS;
   - como testar projetor e celulares na mesma rede;
   - próximos passos.
9. Mostre claramente como configurar o Secret:

```text
OPENROUTER_API_KEY
APP_PUBLIC_URL
```

10. Não peça para simplificar o produto. Implemente a fundação robusta e mantenha o restante organizado por fases.

---

# 31. PROMPTS DE CONTINUAÇÃO PARA USAR NO LOVABLE

Use estes prompts somente depois que a fase anterior estiver estável.

## Continuação — Fase 2

```text
Continue o projeto seguindo integralmente o arquivo de especificação do RPG. Implemente agora a Fase 2: máquina de estados de turno, votação, bloqueio, idempotência, motor d20 determinístico, eventos imutáveis, HP, condições, morte permanente e Game Over. Não use LLM para resolver regras. Crie migrations, RLS/RPCs, testes e interfaces reais para projetor, celular e mestre. Preserve tudo que já funciona e apresente os testes executados.
```

## Continuação — Fase 3

```text
Continue o projeto seguindo integralmente a especificação. Implemente a Fase 3 com OpenRouter exclusivamente por Edge Functions e Secret OPENROUTER_API_KEY. Adicione descoberta de modelos, configurações por agente, Chat Completions, JSON Schema estrito, validação Zod/Ajv, fallbacks, idempotência, logs de uso/custo e o agente combinado Diretor de Cena + Narrador. A IA recebe o resultado mecânico como imutável e não altera o estado oficial. Não exponha a chave no frontend e não use mocks silenciosos.
```

## Continuação — Fase 4

```text
Implemente a Fase 4 da especificação: memória forte com fatos canônicos, campaign_events append-only, resumos incrementais, embeddings via OpenRouter, pgvector, busca híbrida com permissões, conhecimento separado por personagem/NPC, relações multidimensionais, facções, relógios de ameaça e simulador de mundo. Fatos canônicos devem vencer qualquer resumo ou memória semântica. Inclua testes de isolamento de segredos e continuidade.
```

## Continuação — Fase 5

```text
Implemente a Fase 5: Diretor de Arte, descoberta de modelos em GET /api/v1/images/models, geração em POST /api/v1/images, resolução 1K e proporção 16:9 por padrão quando suportadas, validação de capacidades, Storage, media_assets, galeria, crossfade e continuidade visual de personagens. A geração deve ser assíncrona na experiência e falhas de imagem não podem bloquear nem reverter o turno.
```

## Continuação — Fase 6

```text
Implemente a Fase 6: TTS via POST /api/v1/audio/speech, STT via POST /api/v1/audio/transcriptions, perfis de voz, cache por hash, gravação móvel com confirmação da transcrição, biblioteca de música/ambiente/SFX no Storage, Diretor de Áudio, Web Audio API com buses, crossfade, ducking durante fala, cues e gesto inicial para ativar áudio no projetor. Não trate OpenRouter TTS como gerador de trilha musical.
```

## Continuação — Fase 7

```text
Implemente a Fase 7: catálogo de vídeo, POST /api/v1/videos, polling em GET /api/v1/videos/:jobId, download em GET /api/v1/videos/:jobId/content, jobs persistentes, backoff, timeout, Storage, fallback para imagem, limites de custo, vídeo somente em cenas excepcionais, recap cinematográfico, timeline, exportação e testes end-to-end. Vídeo jamais deve bloquear a resolução oficial ou a continuidade da sessão.
```

---

# 32. RESULTADO ESPERADO

O resultado deve parecer um RPG cinematográfico presencial completo, e não uma conversa com IA.

A experiência final deve permitir que uma família:

- veja o mundo em uma tela grande;
- ouça ambiente, música, efeitos e vozes;
- tome decisões pelos celulares;
- mantenha segredos individuais;
- acompanhe personagens persistentes;
- sofra consequências coerentes;
- perca recursos e aliados;
- enfrente NPCs autônomos;
- descubra que o mundo mudou por decisões antigas;
- veja personagens morrerem permanentemente;
- chegue a um final feliz, trágico ou a um Game Over legítimo.

A diversão vem da tensão, da criatividade, das relações e da coerência — não de uma IA que sempre deixa os jogadores vencerem.
