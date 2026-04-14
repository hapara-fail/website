<script>
  import { onMount, onDestroy } from 'svelte';
  import Play from '@lucide/svelte/icons/play';
  import Pause from '@lucide/svelte/icons/pause';
  import Square from '@lucide/svelte/icons/square';
  import Settings from '@lucide/svelte/icons/settings';
  import X from '@lucide/svelte/icons/x';

  let isActive = $state(false);
  let isPlaying = $state(false);
  let progress = $state(0);
  let timeEstimate = $state(0);
  
  let synth = null;
  let elements = $state([]);
  let totalWords = 0;
  let currentElementIndex = -1;
  let currentUtterance = null;
  let isSupported = $state(false);
  let cumulativeWords = $state([]); // Precalculated word counts per element index
  let playbackRate = $state(1); // Default speed

  let availableVoices = $state([]);
  let selectedVoiceURI = $state('');
  let showSettings = $state(false);

  function loadVoices() {
    if (!synth) return;
    availableVoices = synth.getVoices().filter(v => v.lang.startsWith('en'));
    if (!selectedVoiceURI && availableVoices.length > 0) {
      const defaultVoice = availableVoices.find(v => v.default) || availableVoices[0];
      selectedVoiceURI = defaultVoice.voiceURI;
    }
  }

  function countWords(str) {
    return str.trim().split(/\s+/).filter(Boolean).length;
  }

  function getTextNodeAtCharIndex(container, targetIndex) {
    const treeWalker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
    let currentIndex = 0;
    let currentNode;

    while ((currentNode = treeWalker.nextNode())) {
      const textLength = currentNode.textContent.length;
      if (currentIndex + textLength > targetIndex) {
        return {
          node: currentNode,
          offset: targetIndex - currentIndex
        };
      }
      currentIndex += textLength;
    }
    return null;
  }

  function clearHighlight() {
    if (window.CSS && CSS.highlights) {
      CSS.highlights.delete("tts-highlight");
    }
    elements.forEach(el => el.classList.remove('tts-active-block'));
  }

  function stopPlaying() {
    if (currentUtterance) {
      currentUtterance.onend = null;
      currentUtterance.onerror = null;
      currentUtterance.onboundary = null;
    }
    if (synth) synth.cancel();
    isPlaying = false;
    isActive = false;
    progress = 0;
    currentElementIndex = -1;
    clearHighlight();
    showSettings = false;
  }

  function togglePlay() {
    if (!isActive) {
      isActive = true;
      startReading(0);
    } else if (isPlaying) {
      synth.pause();
      isPlaying = false;
    } else {
      synth.resume();
      isPlaying = true;
    }
  }

  function startReading(index) {
    if (currentUtterance) {
      currentUtterance.onend = null;
      currentUtterance.onerror = null;
      currentUtterance.onboundary = null;
    }
    if (synth) synth.cancel();
    clearHighlight();
    currentElementIndex = index;
    
    if (index >= elements.length) {
      stopPlaying();
      return;
    }

    const el = elements[index];
    const text = el.textContent;
    
    if (!text.trim()) {
      startReading(index + 1);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoiceURI) {
      const voice = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
      if (voice) utterance.voice = voice;
    }
    
    utterance.onstart = () => {
      isPlaying = true;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      if (!(window.CSS && CSS.highlights)) {
        el.classList.add('tts-active-block');
      }
    };
    
    utterance.onboundary = (e) => {
      if (e.name !== 'word') return;
      
      if (window.CSS && CSS.highlights) {
        const startObj = getTextNodeAtCharIndex(el, e.charIndex);
        let length = e.charLength;
        if (!length) {
          const match = text.slice(e.charIndex).match(/^\S+/);
          length = match ? match[0].length : 1;
        }
        const endObj = getTextNodeAtCharIndex(el, e.charIndex + length);
        
        if (startObj && endObj) {
          const range = new Range();
          range.setStart(startObj.node, startObj.offset);
          range.setEnd(endObj.node, endObj.offset);
          const highlight = new Highlight(range);
          CSS.highlights.set("tts-highlight", highlight);
        }
      }

      const wordsSoFar = text.slice(0, e.charIndex).split(/\s+/).filter(Boolean).length;
      const totalWordsBefore = index > 0 ? cumulativeWords[index - 1] : 0;
      progress = ((totalWordsBefore + wordsSoFar) / totalWords) * 100;
      if (progress > 100) progress = 100;
    };
    
    utterance.onend = () => {
      startReading(index + 1);
    };

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        startReading(index + 1);
      }
    };

    utterance.rate = playbackRate;
    currentUtterance = utterance;
    synth.speak(utterance);
  }

  function handleProgressClick(e) {
    if (!isActive || totalWords === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    
    const targetWordIndex = Math.floor(percentage * totalWords);
    
    let wordCountSoFar = 0;
    for(let i = 0; i < elements.length; i++) {
      const pWords = countWords(elements[i].textContent);
      if (wordCountSoFar + pWords > targetWordIndex || i === elements.length - 1) {
        startReading(i);
        progress = percentage * 100;
        break;
      }
      wordCountSoFar += pWords;
    }
  }

  function handleGlobalClick(e) {
    if (!isActive) return;
    // Don't intercept clicks inside the tts controls
    if (e.target.closest('.tts-controls') || e.target.closest('.settings-popup')) return;
    
    for(let i = 0; i < elements.length; i++) {
      if (elements[i].contains(e.target)) {
        e.preventDefault();
        startReading(i);
        break;
      }
    }
  }

  function handleVoiceChange(event) {
    selectedVoiceURI = event.target.value;
    if (isActive) {
      startReading(currentElementIndex);
    }
  }

  onMount(() => {
    isSupported = 'speechSynthesis' in window;
    if (!isSupported) return;

    synth = window.speechSynthesis;
    
    const container = document.querySelector('.article-body');
    if (!container) return;
    
    const nodes = container.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
    elements = Array.from(nodes).filter(el => {
       if (el.closest('.back-link') || el.closest('.credits') || el.closest('.tts-component')) return false;
       return el.textContent.trim().length > 0;
    });

    totalWords = elements.reduce((acc, el) => {
       const count = countWords(el.textContent);
       cumulativeWords.push((cumulativeWords[cumulativeWords.length - 1] || 0) + count);
       return acc + count;
    }, 0);
    timeEstimate = Math.max(1, Math.ceil(totalWords / (200 * playbackRate)));

    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }

    document.addEventListener('click', handleGlobalClick);
  });

  onDestroy(() => {
    if (synth) synth.cancel();
    clearHighlight();
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', handleGlobalClick);
    }
  });

</script>

{#if isSupported && elements.length > 0}
  <div class="tts-component">
    {#if !isActive}
      <button class="tts-starter-btn" onclick={togglePlay} aria-label="Listen to this article">
        <span class="icon-wrapper">
          <Play size={14} fill="currentColor" />
        </span>
        <span class="btn-text">
          Listen <span class="time-est">({timeEstimate} min)</span>
        </span>
      </button>
    {/if}

    {#if isActive}
      <div class="tts-floating-bubble fade-up">
        
        {#if showSettings}
          <div class="settings-popup fade-up">
            <div class="settings-header">
              <h3>Voice Settings</h3>
              <button class="close-btn" onclick={() => showSettings = false}>
                <X size={16} />
              </button>
            </div>
            <div class="settings-body">
              <div class="setting-group">
                <label for="voice-select">Available Voices</label>
                <select id="voice-select" onchange={handleVoiceChange} class="voice-select">
                  {#each availableVoices as voice}
                    <option value={voice.voiceURI} selected={voice.voiceURI === selectedVoiceURI}>
                      {voice.name}
                    </option>
                  {/each}
                </select>
              </div>

              <div class="setting-group">
                <div class="label-row">
                  <label for="speed-range">Reading Speed</label>
                  <span class="speed-val">{playbackRate}x</span>
                </div>
                <input 
                  type="range" 
                  id="speed-range" 
                  min="0.5" 
                  max="2" 
                  step="0.1" 
                  bind:value={playbackRate}
                  onchange={() => {
                    if (isActive) startReading(currentElementIndex);
                  }}
                />
              </div>
            </div>
          </div>
        {/if}

        <div class="tts-controls">
          <button class="control-btn play-pause" onclick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {#if isPlaying}
              <Pause size={18} fill="currentColor" />
            {:else}
              <Play size={18} fill="currentColor" left={2} />
            {/if}
          </button>
          
          <div class="progress-container">
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="progress-bar-wrapper" onclick={handleProgressClick}>
              <div class="progress-bar">
                <div class="progress-fill" style="width: {progress}%"></div>
              </div>
            </div>
          </div>

          <div class="right-controls">
            <button class="control-btn settings-btn" onclick={() => showSettings = !showSettings} aria-label="Voice settings">
              <Settings size={18} />
            </button>
            <button class="control-btn stop" onclick={stopPlaying} aria-label="Stop playback">
              <Square size={16} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .tts-component {
    display: inline-flex;
    margin: 0;
  }

  .tts-starter-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, rgba(82, 74, 242, 0.15), rgba(168, 85, 247, 0.15));
    border: 1px solid rgba(168, 85, 247, 0.4);
    padding: 6px 14px 6px 8px;
    border-radius: 99px;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .tts-starter-btn:hover {
    background: linear-gradient(135deg, rgba(82, 74, 242, 0.25), rgba(168, 85, 247, 0.25));
    border-color: rgba(168, 85, 247, 0.6);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(168, 85, 247, 0.2);
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
    color: #fff;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(168, 85, 247, 0.4);
  }

  .btn-text {
    display: flex;
    align-items: center;
    gap: 4px;
    letter-spacing: 0.02em;
  }

  .time-est {
    color: var(--text-secondary);
    font-weight: 500;
  }

  /* Floating Bubble */
  .tts-floating-bubble {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, rgba(22, 21, 46, 0.95), rgba(10, 9, 26, 0.98));
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(168, 85, 247, 0.3);
    border-radius: 99px;
    padding: 10px 16px;
    z-index: 1000;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
    width: 90%;
    max-width: 480px;
    font-family: 'Poppins', sans-serif;
  }

  .tts-controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .control-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    transition: all 0.2s ease;
  }

  .control-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: var(--text-primary);
  }

  .control-btn.play-pause {
    background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
    color: #fff;
    box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
  }

  .control-btn.play-pause:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(168, 85, 247, 0.5);
    background: linear-gradient(135deg, rgba(82, 74, 242, 1), rgba(168, 85, 247, 1));
  }

  .control-btn.settings-btn:hover {
    color: var(--accent-2);
    transform: rotate(45deg);
  }

  .control-btn.stop:hover {
    color: #ef4444; /* red tint */
  }

  .right-controls {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .progress-container {
    flex: 1;
    display: flex;
    align-items: center;
    border-radius: 8px;
  }

  .progress-bar-wrapper {
    width: 100%;
    height: 24px;
    display: flex;
    align-items: center;
    cursor: pointer;
    position: relative;
  }
  
  .progress-bar-wrapper:hover .progress-bar {
    height: 6px;
  }

  .progress-bar {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    transition: height 0.2s ease;
  }

  .progress-fill {
    height: 100%;
    background: var(--silver-gradient);
    border-radius: 4px;
    transition: width 0.15s ease-out;
  }

  /* Settings Popup */
  .settings-popup {
    position: absolute;
    bottom: calc(100% + 15px);
    right: 18px;
    width: 280px;
    background: var(--surface);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    color: var(--text-primary);
  }

  .settings-popup::after {
    content: '';
    position: absolute;
    bottom: -6px;
    right: 22px;
    width: 12px;
    height: 12px;
    background: var(--bg-offset);
    border-right: 1px solid var(--border-color);
    border-bottom: 1px solid var(--border-color);
    transform: rotate(45deg);
    pointer-events: none;
  }

  .settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-color);
  }

  .settings-header h3 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .close-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 4px;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }

  .settings-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .setting-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .speed-val {
    font-size: 0.75rem;
    color: var(--accent-2);
    font-weight: 600;
  }

  .voice-select {
    width: 100%;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 10px 12px;
    border-radius: 8px;
    font-family: 'Poppins', sans-serif;
    font-size: 0.85rem;
    outline: none;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a0a0cc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 16px;
    transition: border-color 0.2s;
  }

  input[type="range"] {
    width: 100%;
    accent-color: var(--accent-2);
    cursor: pointer;
  }

  .settings-body label {
    display: block;
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-weight: 500;
    margin: 0;
  }

  .voice-select:focus {
    border-color: var(--accent-1);
  }

  .voice-select option {
    background: var(--bg-dark);
    color: var(--text-primary);
  }

  .fade-up {
    animation: fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translate(-50%, 20px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }

  .settings-popup.fade-up {
    transform: none;
    animation: popupFade 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes popupFade {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
