/**
 * ChatBaiter Dual-AI Orchestra & Debate Engine
 * - Global Registry of AI Models (OpenAI, Anthropic, Gemini, DeepSeek, Groq, Mistral, xAI, Perplexity, OpenRouter)
 * - Acoustic Key Encrypted API Vault (Keys encrypted via audio cassette key)
 * - Simultaneous Parallel Dual-Prompting (Same prompt, different minds)
 * - Autonomous AI-vs-AI Interactive Colosseum Debate Mode
 */

const ChatAI = (function () {
  'use strict';

  // Comprehensive AI Models Mankind Has Produced
  const MODELS_REGISTRY = {
    // OpenAI
    'openai/gpt-4o': {
      id: 'openai/gpt-4o',
      name: 'GPT-4o (Omni)',
      provider: 'openai',
      badge: 'GPT-4o',
      family: 'OpenAI',
      color: '#10a37f',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      apiModel: 'gpt-4o',
      description: 'Flagship high-intelligence multimodal model by OpenAI.',
    },
    'openai/gpt-4o-mini': {
      id: 'openai/gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'openai',
      badge: 'GPT-4o Mini',
      family: 'OpenAI',
      color: '#0d8264',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      apiModel: 'gpt-4o-mini',
      description: 'Fast, lightweight intelligence optimized for agile reasoning.',
    },
    'openai/o1-mini': {
      id: 'openai/o1-mini',
      name: 'OpenAI o1 Mini (Reasoning)',
      provider: 'openai',
      badge: 'o1-mini',
      family: 'OpenAI',
      color: '#059669',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      apiModel: 'o1-mini',
      description: 'Specialized mathematical and logical deep-reasoning model.',
    },

    // Anthropic Claude
    'anthropic/claude-3-5-sonnet': {
      id: 'anthropic/claude-3-5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'anthropic',
      badge: 'Claude 3.5',
      family: 'Anthropic',
      color: '#d97706',
      endpoint: 'https://api.anthropic.com/v1/messages',
      apiModel: 'claude-3-5-sonnet-20241022',
      description: 'Peak benchmark nuance, coding prowess, and rhetorical depth.',
    },
    'anthropic/claude-3-5-haiku': {
      id: 'anthropic/claude-3-5-haiku',
      name: 'Claude 3.5 Haiku',
      provider: 'anthropic',
      badge: 'Claude Haiku',
      family: 'Anthropic',
      color: '#b45309',
      endpoint: 'https://api.anthropic.com/v1/messages',
      apiModel: 'claude-3-5-haiku-20241022',
      description: 'Ultra-fast conversational precision and literary phrasing.',
    },

    // Google DeepMind Gemini
    'google/gemini-1-5-pro': {
      id: 'google/gemini-1-5-pro',
      name: 'Gemini 1.5 Pro',
      provider: 'google',
      badge: 'Gemini Pro',
      family: 'Google',
      color: '#3b82f6',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
      apiModel: 'gemini-1.5-pro',
      description: 'Million-token contextual depth and versatile analytical power.',
    },
    'google/gemini-1-5-flash': {
      id: 'google/gemini-1-5-flash',
      name: 'Gemini 1.5 Flash',
      provider: 'google',
      badge: 'Gemini Flash',
      family: 'Google',
      color: '#2563eb',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
      apiModel: 'gemini-1.5-flash',
      description: 'High-frequency sub-second response engine by Google DeepMind.',
    },

    // DeepSeek
    'deepseek/deepseek-chat': {
      id: 'deepseek/deepseek-chat',
      name: 'DeepSeek V3 (671B)',
      provider: 'deepseek',
      badge: 'DeepSeek V3',
      family: 'DeepSeek',
      color: '#0284c7',
      endpoint: 'https://api.deepseek.com/chat/completions',
      apiModel: 'deepseek-chat',
      description: 'State-of-the-art open mixture-of-experts global powerhouse.',
    },
    'deepseek/deepseek-reasoner': {
      id: 'deepseek/deepseek-reasoner',
      name: 'DeepSeek R1 (Reasoning)',
      provider: 'deepseek',
      badge: 'DeepSeek R1',
      family: 'DeepSeek',
      color: '#0369a1',
      endpoint: 'https://api.deepseek.com/chat/completions',
      apiModel: 'deepseek-reasoner',
      description: 'Autonomous reinforcement-learning deep-chain reasoning.',
    },

    // Groq / Meta Llama
    'groq/llama-3-3-70b': {
      id: 'groq/llama-3-3-70b',
      name: 'Llama 3.3 70B (Groq LPU)',
      provider: 'groq',
      badge: 'Llama 3.3',
      family: 'Meta / Groq',
      color: '#ea580c',
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      apiModel: 'llama-3.3-70b-versatile',
      description: 'Blazing LPUs streaming over 280 tokens per second.',
    },
    'groq/mixtral-8x7b': {
      id: 'groq/mixtral-8x7b',
      name: 'Mixtral 8x7B (Groq)',
      provider: 'groq',
      badge: 'Mixtral 8x7B',
      family: 'Mistral / Groq',
      color: '#c2410c',
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      apiModel: 'mixtral-8x7b-32768',
      description: 'Sparse MoE high-throughput routing engine.',
    },

    // Mistral AI
    'mistral/mistral-large': {
      id: 'mistral/mistral-large',
      name: 'Mistral Large 2',
      provider: 'mistral',
      badge: 'Mistral Large',
      family: 'Mistral AI',
      color: '#f59e0b',
      endpoint: 'https://api.mistral.ai/v1/chat/completions',
      apiModel: 'mistral-large-latest',
      description: 'Flagship European frontier model with unmatched multilingual finesse.',
    },

    // xAI Grok
    'xai/grok-2': {
      id: 'xai/grok-2',
      name: 'xAI Grok 2',
      provider: 'xai',
      badge: 'Grok 2',
      family: 'xAI',
      color: '#6366f1',
      endpoint: 'https://api.x.ai/v1/chat/completions',
      apiModel: 'grok-2-1212',
      description: 'Witty, truth-seeking, direct frontier model with real-time flair.',
    },

    // Perplexity
    'perplexity/sonar': {
      id: 'perplexity/sonar',
      name: 'Perplexity Sonar',
      provider: 'perplexity',
      badge: 'Sonar',
      family: 'Perplexity',
      color: '#14b8a6',
      endpoint: 'https://api.perplexity.ai/chat/completions',
      apiModel: 'sonar',
      description: 'Live internet citation engine and knowledge retrieval model.',
    },

    // OpenRouter (Universal Gateway)
    'openrouter/auto': {
      id: 'openrouter/auto',
      name: 'OpenRouter Universal (All Models)',
      provider: 'openrouter',
      badge: 'OpenRouter',
      family: 'OpenRouter',
      color: '#8b5cf6',
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      apiModel: 'auto',
      description: 'Universal gateway to any model on Earth with a single API key.',
    },
  };

  // Active state
  let currentModel1 = 'openai/gpt-4o';
  let currentModel2 = 'anthropic/claude-3-5-sonnet';
  let isDebateActive = false;
  let debateAbortController = null;

  /**
   * Save an API Key encrypted with the customer's audio key
   */
  async function saveEncryptedApiKey(provider, plainKey, cryptoKey) {
    if (!plainKey || !plainKey.trim()) {
      localStorage.removeItem('cb_ai_key_' + provider);
      return;
    }
    if (!cryptoKey) {
      throw new Error('Load your audio cassette key first to encrypt and secure your API key!');
    }
    const encryptedArmor = await ChatCrypto.encryptApiKey(plainKey.trim(), cryptoKey);
    localStorage.setItem('cb_ai_key_' + provider, encryptedArmor);
  }

  /**
   * Retrieve and decrypt API key using the audio key
   */
  async function getDecryptedApiKey(provider, cryptoKey) {
    const raw = localStorage.getItem('cb_ai_key_' + provider);
    if (!raw) return '';
    if (!cryptoKey) return '';
    return await ChatCrypto.decryptApiKey(raw, cryptoKey);
  }

  /**
   * Opposite / Inverse of saveEncryptedApiKey:
   * Remove and wipe the encrypted API key for a specific provider
   */
  async function removeEncryptedApiKey(provider) {
    if (!provider) return;
    localStorage.removeItem('cb_ai_key_' + provider);
    return true;
  }

  /**
   * Opposite / Inverse of all saved keys:
   * Purge all encrypted API keys across all providers
   */
  async function purgeAllApiKeys() {
    const providers = ['openai', 'anthropic', 'google', 'deepseek', 'groq', 'mistral', 'xai', 'perplexity', 'openrouter'];
    providers.forEach((p) => localStorage.removeItem('cb_ai_key_' + p));
    return true;
  }

  function hasKeyForProvider(provider) {
    return Boolean(localStorage.getItem('cb_ai_key_' + provider));
  }

  /**
   * Swap Gladiators (Vice-Versa): Inverts Gladiator 1 and Gladiator 2 roles
   * Gladiator 1 becomes Gladiator 2, and Gladiator 2 becomes Gladiator 1
   */
  function swapGladiators() {
    const temp = currentModel1;
    currentModel1 = currentModel2;
    currentModel2 = temp;
    return {
      model1: MODELS_REGISTRY[currentModel1],
      model2: MODELS_REGISTRY[currentModel2],
    };
  }

  /**
   * Query a single AI model with user prompt
   */
  async function queryModel(modelId, messages, cryptoKey) {
    const model = MODELS_REGISTRY[modelId] || MODELS_REGISTRY['openai/gpt-4o'];
    const apiKey = await getDecryptedApiKey(model.provider, cryptoKey);

    // If key provided, attempt live API call
    if (apiKey) {
      try {
        if (model.provider === 'google') {
          return await callGemini(model, messages, apiKey);
        } else if (model.provider === 'anthropic') {
          return await callAnthropic(model, messages, apiKey);
        } else {
          // Standard OpenAI-compatible format (OpenAI, DeepSeek, Groq, Mistral, xAI, Perplexity, OpenRouter)
          return await callOpenAiCompatible(model, messages, apiKey);
        }
      } catch (err) {
        console.warn(`Live API call to ${model.name} failed:`, err);
        return `[${model.name} Live Error: ${err.message}] Falling back to high-IQ simulated cognition:\n\n` + simulateAiCognition(model, messages);
      }
    }

    // High-IQ Simulation / Zero-Key Demonstration Cognition
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));
    return simulateAiCognition(model, messages);
  }

  /**
   * OpenAI-compatible fetcher (OpenAI, DeepSeek, Groq, Mistral, xAI, Perplexity, OpenRouter)
   */
  async function callOpenAiCompatible(model, messages, apiKey) {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };
    if (model.provider === 'openrouter') {
      headers['HTTP-Referer'] = window.location.origin;
      headers['X-Title'] = 'ChatBaiter Acoustic Cipher';
    }

    const payload = {
      model: model.apiModel,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: 0.7,
      max_tokens: 1024,
    };

    const res = await fetch(model.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText.substring(0, 180)}`);
    }

    const data = await res.json();
    return data.choices[0]?.message?.content || 'No text received.';
  }

  /**
   * Google Gemini API fetcher
   */
  async function callGemini(model, messages, apiKey) {
    const url = `${model.endpoint}/${model.apiModel}:generateContent?key=${apiKey}`;
    const contents = messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText.substring(0, 180)}`);
    }

    const data = await res.json();
    return data.candidates[0]?.content?.parts[0]?.text || 'No text generated.';
  }

  /**
   * Anthropic Messages API fetcher
   */
  async function callAnthropic(model, messages, apiKey) {
    const systemPrompt = messages.find((m) => m.role === 'system')?.content || '';
    const nonSystem = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: model.apiModel,
        max_tokens: 1024,
        system: systemPrompt,
        messages: nonSystem,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText.substring(0, 180)}`);
    }

    const data = await res.json();
    return data.content[0]?.text || 'No text returned.';
  }

  /**
   * High-IQ Simulated Cognition (Distinct Personalities for Every Model)
   */
  function simulateAiCognition(model, messages) {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || 'the question';
    const isDebateContext = messages.some((m) => m.content.includes('DEBATE STANCE') || m.content.includes('REBUTTAL'));

    if (model.id.includes('claude')) {
      return `From an analytical and epistemic perspective regarding "${lastUserMsg.substring(0, 40)}...":\n\n` +
        `The premise rests on a delicate tension between systemic coherence and emergent dynamics. While conventional intuition suggests a linear resolution, deeper scrutiny reveals foundational trade-offs. We must prioritize nuanced synthesis over categorical binaries.`;
    }

    if (model.id.includes('deepseek-reasoner') || model.id.includes('o1')) {
      return `<think>\n1. Parsing target prompt: "${lastUserMsg.substring(0, 35)}..."\n2. Evaluating adversarial counter-arguments and logical constraints.\n3. Optimizing for mathematical consistency and empirical evidence.\n</think>\n\n` +
        `Rigorous deductive breakdown:\n1. Core axiom: The argument hinges on verifiable second-order effects.\n2. Inherent counterweight: Ignoring boundary conditions introduces compounding failure modes.\nConclusion: The optimal position balances structural rigor with computational efficiency.`;
    }

    if (model.id.includes('deepseek-chat')) {
      return `Analyzing with 671B MoE parameters:\n\n` +
        `Regarding "${lastUserMsg.substring(0, 35)}...", the most effective strategy leverages distributed intelligence. By decoupling the core assumption from immediate assumptions, we achieve both extreme adaptability and maximal resilience.`;
    }

    if (model.id.includes('gpt-4o')) {
      return `Here is my direct, multi-faceted assessment of "${lastUserMsg.substring(0, 40)}...":\n\n` +
        `• Primary Driver: Practical execution trumps theoretical dogma.\n• Critical Insight: When we test this in real-world environments, the dominant variable is agility.\n• Final Verdict: We should approach this dialectically, balancing speed with verification.`;
    }

    if (model.id.includes('gemini')) {
      return `Synthesizing across multi-modal data streams for "${lastUserMsg.substring(0, 35)}...":\n\n` +
        `Google DeepMind's perspective: Information entropy decreases when we cross-reference historical precedent with forward-looking scaling laws. The underlying pattern demonstrates that adaptability is the true benchmark of intelligence.`;
    }

    if (model.id.includes('llama') || model.id.includes('groq')) {
      return `[LPU 280 T/S STREAM]\n\n` +
        `Straightforward analysis: The fundamental contention surrounding "${lastUserMsg.substring(0, 35)}..." comes down to autonomy vs control. Open, transparent architectures consistently outperform proprietary moats when subjected to peer-reviewed stress.`;
    }

    if (model.id.includes('grok')) {
      return `Let's cut through the standard PR fluff on "${lastUserMsg.substring(0, 35)}...":\n\n` +
        `The universe doesn't care about our delicate intellectual constructs. The hard truth is that reality favors whatever works at maximum velocity with zero bureaucratic hesitation. That is the only stance that holds up under scrutiny.`;
    }

    return `Autonomous cognitive stance for "${lastUserMsg.substring(0, 40)}...":\n\n` +
      `Systematic examination shows that the debate demands rigorous cross-validation. True progress emerges when contrasting viewpoints collide.`;
  }

  /**
   * Dual-Prompting: Query BOTH selected AIs simultaneously with the same prompt
   */
  async function queryBothAis(promptText, cryptoKey, onAi1Result, onAi2Result) {
    const m1 = MODELS_REGISTRY[currentModel1];
    const m2 = MODELS_REGISTRY[currentModel2];

    const messages = [
      { role: 'system', content: 'You are an elite, insightful AI in a dual-intelligence covert chamber. Be compelling, sharp, and authentic.' },
      { role: 'user', content: promptText },
    ];

    const p1 = queryModel(currentModel1, messages, cryptoKey).then((ans) => {
      if (onAi1Result) onAi1Result({ model: m1, text: ans });
      return { model: m1, text: ans };
    });

    const p2 = queryModel(currentModel2, messages, cryptoKey).then((ans) => {
      if (onAi2Result) onAi2Result({ model: m2, text: ans });
      return { model: m2, text: ans };
    });

    return await Promise.all([p1, p2]);
  }

  /**
   * Autonomous AI Colosseum Debate Controller
   * - AI 1 introduces proposition
   * - AI 2 challenges with counter-arguments
   * - AI 1 delivers rebuttal
   * - AI 2 concludes
   */
  async function runAiDebate({ topic, cryptoKey, rounds = 2, onDebateTurn, onTurn, onDebateFinish }) {
    isDebateActive = true;
    debateAbortController = new AbortController();

    const m1 = MODELS_REGISTRY[currentModel1];
    const m2 = MODELS_REGISTRY[currentModel2];

    const emitTurn = (t) => {
      if (typeof onDebateTurn === 'function') onDebateTurn(t);
      if (typeof onTurn === 'function') onTurn(t);
    };

    const debateHistory = [
      {
        role: 'system',
        content: `You are in the Grand AI Colosseum debating the topic: "${topic}". Model 1 (${m1.name}) defends Proposition. Model 2 (${m2.name}) defends Opposition. Be sharp, respectful, intellectual, and persuasive. Keep each statement under 130 words.`,
      },
    ];

    try {
      // Round 1: Model 1 Opening Proposition
      if (!isDebateActive) return;
      emitTurn({ speaker: m1, round: 1, role: 'PROPOSITION OPENING', isThinking: true });
      debateHistory.push({ role: 'user', content: `Topic: "${topic}". ${m1.name}, give your opening proposition.` });
      const speech1 = await queryModel(currentModel1, debateHistory, cryptoKey);
      debateHistory.push({ role: 'assistant', content: speech1 });
      emitTurn({ speaker: m1, round: 1, role: 'PROPOSITION', text: speech1, isThinking: false });

      await new Promise((r) => setTimeout(r, 600));

      // Round 1: Model 2 Counter-Rebuttal
      if (!isDebateActive) return;
      emitTurn({ speaker: m2, round: 1, role: 'OPPOSITION REBUTTAL', isThinking: true });
      debateHistory.push({
        role: 'user',
        content: `${m2.name}, rebut ${m1.name}'s argument directly. Address their points and establish the opposing perspective.`,
      });
      const speech2 = await queryModel(currentModel2, debateHistory, cryptoKey);
      debateHistory.push({ role: 'assistant', content: speech2 });
      emitTurn({ speaker: m2, round: 1, role: 'OPPOSITION', text: speech2, isThinking: false });

      if (rounds >= 2) {
        await new Promise((r) => setTimeout(r, 1400));

        // Round 2: Model 1 Counter-Defense
        if (!isDebateActive) return;
        emitTurn({ speaker: m1, round: 2, role: 'PROPOSITION REJOINDER', isThinking: true });
        debateHistory.push({
          role: 'user',
          content: `${m1.name}, respond directly to ${m2.name}'s critique. Defend your thesis.`,
        });
        const speech3 = await queryModel(currentModel1, debateHistory, cryptoKey);
        debateHistory.push({ role: 'assistant', content: speech3 });
        emitTurn({ speaker: m1, round: 2, role: 'PROPOSITION DEFENSE', text: speech3, isThinking: false });

        await new Promise((r) => setTimeout(r, 600));

        // Round 2: Model 2 Final Synthesis
        if (!isDebateActive) return;
        emitTurn({ speaker: m2, round: 2, role: 'OPPOSITION CLOSING', isThinking: true });
        debateHistory.push({
          role: 'user',
          content: `${m2.name}, deliver your closing argument and final synthesis on why your stance prevails.`,
        });
        const speech4 = await queryModel(currentModel2, debateHistory, cryptoKey);
        debateHistory.push({ role: 'assistant', content: speech4 });
        emitTurn({ speaker: m2, round: 2, role: 'FINAL CLOSING', text: speech4, isThinking: false });
      }

      if (onDebateFinish) onDebateFinish({ completed: true });
    } catch (err) {
      console.error('Debate loop interrupted:', err);
      if (onDebateFinish) onDebateFinish({ completed: false, error: err.message });
    } finally {
      isDebateActive = false;
    }
  }

  /**
   * Opposite of Dual-Prompting: Query ONLY a single AI model (Solo Mode)
   */
  async function querySoloAi(modelId, promptText, cryptoKey) {
    const targetId = modelId || currentModel1;
    const model = MODELS_REGISTRY[targetId] || MODELS_REGISTRY['openai/gpt-4o'];
    const messages = [
      { role: 'system', content: 'You are an elite, perceptive intelligence agent in a covert chamber. Be compelling and sharp.' },
      { role: 'user', content: promptText },
    ];
    const answer = await queryModel(targetId, messages, cryptoKey);
    return { model, text: answer };
  }

  function stopDebate() {
    isDebateActive = false;
    if (debateAbortController) {
      debateAbortController.abort();
    }
  }

  /**
   * Opposite / Reset function for debate arena
   */
  function resetDebateArena() {
    stopDebate();
    debateAbortController = null;
    return true;
  }

  return {
    MODELS_REGISTRY,
    getModelsList: () => Object.values(MODELS_REGISTRY),
    getModelById: (id) => MODELS_REGISTRY[id],
    setSelectedModels: (m1, m2) => {
      if (MODELS_REGISTRY[m1]) currentModel1 = m1;
      if (MODELS_REGISTRY[m2]) currentModel2 = m2;
    },
    getSelectedModels: () => ({
      model1: MODELS_REGISTRY[currentModel1],
      model2: MODELS_REGISTRY[currentModel2],
    }),
    swapGladiators,
    saveEncryptedApiKey,
    removeEncryptedApiKey,
    purgeAllApiKeys,
    getDecryptedApiKey,
    hasKeyForProvider,
    queryModel,
    queryBothAis,
    querySoloAi,
    runAiDebate,
    stopDebate,
    resetDebateArena,
    isDebating: () => isDebateActive,
  };
})();

if (typeof window !== 'undefined') {
  window.ChatAI = ChatAI;
  window.AIAgents = ChatAI;
}
if (typeof globalThis !== 'undefined') {
  globalThis.ChatAI = ChatAI;
  globalThis.AIAgents = ChatAI;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatAI;
}
