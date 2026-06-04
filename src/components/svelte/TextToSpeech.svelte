<script>
  import { onMount, onDestroy } from 'svelte';
  import Play from '@lucide/svelte/icons/play';
  import Pause from '@lucide/svelte/icons/pause';
  import Square from '@lucide/svelte/icons/square';
  import Settings from '@lucide/svelte/icons/settings';
  import X from '@lucide/svelte/icons/x';
  import SkipBack from '@lucide/svelte/icons/skip-back';
  import SkipForward from '@lucide/svelte/icons/skip-forward';

  const BASE_WORDS_PER_MINUTE = 185;
  const FALLBACK_WORDS_PER_MINUTE = 145;
  const FALLBACK_INITIAL_GRACE_MS = 1800;
  const FALLBACK_BOUNDARY_GRACE_MS = 1400;
  const FALLBACK_BOUNDARY_AHEAD_LIMIT = 2;
  const SKIP_WORDS = 30;
  const PREFERENCES_KEY = 'hapara:blog-tts';
  const READABLE_SELECTOR = [
    '.section-label',
    '.timeline-date',
    '.evidence-block',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'li',
    'cite',
    'th',
    'td',
    'caption',
  ].join(', ');

  let isActive = $state(false);
  let isPlaying = $state(false);
  let progress = $state(0);
  let currentWordIndex = $state(0);
  let totalWords = $state(0);
  let totalTimeLabel = $state('');
  let remainingTimeLabel = $state('');

  let synth = null;
  let segments = $state([]);
  let currentSegmentIndex = -1;
  let currentUtterance = null;
  let boundaryFallbackTimer = null;
  let fallbackSegment = null;
  let fallbackStartedAt = 0;
  let fallbackStartWordIndex = 0;
  let fallbackAnchorWordIndex = 0;
  let lastAdvancingBoundaryAt = 0;
  let lastBoundaryEventAt = 0;
  let activeWordElement = null;
  let isSupported = $state(false);

  let playbackRate = $state(1);
  let playbackPitch = $state(1);
  let playbackVolume = $state(1);
  let autoScroll = $state(true);
  let highlightWords = $state(true);
  let clickToRead = $state(true);
  let persistPreferences = $state(true);

  let availableVoices = $state([]);
  let selectedVoiceURI = $state('');
  let showSettings = $state(false);
  let settingsButton = $state(null);

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function roundToStep(value, step = 0.1) {
    return Math.round(Number(value) / step) * step;
  }

  function formatNumber(value) {
    return Number(value).toFixed(1).replace(/\.0$/, '');
  }

  function rangePercent(value, min, max) {
    return `${clamp(((Number(value) - min) / (max - min)) * 100, 0, 100)}%`;
  }

  function formatDuration(seconds) {
    const roundedSeconds = Math.max(30, Math.round(seconds / 30) * 30);

    if (roundedSeconds < 60) {
      return '<1 min';
    }

    const minutes = Math.round(roundedSeconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
  }

  function normalizeText(value) {
    return value.replace(/\s+/g, ' ').trim();
  }

  function isExcludedElement(el) {
    return Boolean(
      el.closest(
        '.back-link, .credits, .tts-component, script, style, [hidden], [aria-hidden="true"]',
      ),
    );
  }

  function shouldUseReadableElement(el) {
    if (isExcludedElement(el) || !normalizeText(el.textContent || '')) return false;

    if (el.matches('p') && el.closest('td, th, .evidence-block')) return false;
    if (el.matches('li') && el.querySelector('p, ul, ol')) return false;

    return true;
  }

  function collectWordsForElement(element) {
    const textParts = [];
    const words = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent || isExcludedElement(parent) || !normalizeText(node.textContent || '')) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      },
      false,
    );

    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    textNodes.forEach((textNode) => {
      const text = textNode.textContent || '';
      const matches = Array.from(text.matchAll(/\S+/g)).map((match) => ({
        rawWord: match[0],
        originalStart: match.index || 0,
        originalEnd: (match.index || 0) + match[0].length,
        element: null,
      }));

      for (let i = matches.length - 1; i >= 0; i -= 1) {
        const match = matches[i];
        const range = new Range();
        const span = document.createElement('span');

        span.className = 'tts-word';
        range.setStart(textNode, match.originalStart);
        range.setEnd(textNode, match.originalEnd);
        range.surroundContents(span);
        match.element = span;
      }

      matches.forEach((match) => {
        const startChar = textParts.length ? textParts.join(' ').length + 1 : 0;
        const endChar = startChar + match.rawWord.length;
        const wordRange = new Range();
        const wordNode = match.element.firstChild;

        wordRange.selectNodeContents(match.element);
        textParts.push(match.rawWord);
        words.push({
          range: wordRange,
          element: match.element,
          node: wordNode,
          startOffset: 0,
          endOffset: match.rawWord.length,
          startChar,
          endChar,
        });
      });
    });

    return {
      text: textParts.join(' '),
      words,
    };
  }

  function estimateSegmentSeconds(segment) {
    if (!segment.wordCount) return 0;

    const text = segment.text;
    const wordsPerSecond = (BASE_WORDS_PER_MINUTE * playbackRate) / 60;
    const speakingSeconds = segment.wordCount / wordsPerSecond;
    const sentencePauses = (text.match(/[.!?]/g) || []).length * 0.22;
    const phrasePauses = (text.match(/[;:]/g) || []).length * 0.14;
    const commaPauses = (text.match(/,/g) || []).length * 0.08;
    const structuralPause = segment.element.matches('h1, h2, h3, h4, h5, h6, .section-label')
      ? 0.45
      : 0.12;

    return speakingSeconds + (sentencePauses + phrasePauses + commaPauses + structuralPause) / playbackRate;
  }

  function estimateSecondsFromWord(wordIndex) {
    if (!segments.length || totalWords === 0) return 0;

    return segments.reduce((seconds, segment) => {
      const segmentStart = segment.startWordIndex;
      const segmentEnd = segment.startWordIndex + segment.wordCount;
      const segmentSeconds = estimateSegmentSeconds(segment);

      if (wordIndex <= segmentStart) return seconds + segmentSeconds;
      if (wordIndex >= segmentEnd) return seconds;

      const remainingFraction = (segmentEnd - wordIndex) / segment.wordCount;
      return seconds + segmentSeconds * remainingFraction;
    }, 0);
  }

  function updateTiming(wordIndex = currentWordIndex) {
    const totalSeconds = estimateSecondsFromWord(0);
    const remainingSeconds = estimateSecondsFromWord(wordIndex);

    totalTimeLabel = formatDuration(totalSeconds);
    remainingTimeLabel = formatDuration(remainingSeconds);
  }

  function setCurrentWordIndex(wordIndex) {
    currentWordIndex = clamp(Math.round(Number(wordIndex) || 0), 0, totalWords);
    progress = totalWords > 0 ? (currentWordIndex / totalWords) * 100 : 0;
    updateTiming(currentWordIndex);
  }

  function findSegmentForWord(wordIndex) {
    if (!segments.length) return null;

    const normalizedIndex = clamp(wordIndex, 0, Math.max(0, totalWords - 1));
    return (
      segments.find((segment) => {
        const start = segment.startWordIndex;
        const end = start + segment.wordCount;
        return normalizedIndex >= start && normalizedIndex < end;
      }) || segments[segments.length - 1]
    );
  }

  function getWordFromBoundary(segment, charIndex) {
    if (!segment || !segment.words.length) return null;

    return (
      segment.words.find((word) => charIndex >= word.startChar && charIndex < word.endChar) ||
      segment.words.find((word) => charIndex <= word.startChar) ||
      segment.words[segment.words.length - 1]
    );
  }

  function highlightWord(globalWordIndex) {
    if (!highlightWords) {
      clearHighlight();
      return;
    }

    const segment = findSegmentForWord(globalWordIndex);
    if (!segment) return;

    const localIndex = clamp(globalWordIndex - segment.startWordIndex, 0, segment.words.length - 1);
    const word = segment.words[localIndex];
    if (!word) return;

    if (activeWordElement) {
      activeWordElement.classList.remove('tts-active-word');
    }
    word.element.classList.add('tts-active-word');
    activeWordElement = word.element;
  }

  function clearHighlight() {
    if (window.CSS && CSS.highlights) {
      CSS.highlights.delete('tts-highlight');
    }
    if (activeWordElement) {
      activeWordElement.classList.remove('tts-active-word');
      activeWordElement = null;
    }
    segments.forEach((segment) => segment.element.classList.remove('tts-active-block'));
  }

  function clearBoundaryFallback() {
    if (boundaryFallbackTimer) {
      window.clearInterval(boundaryFallbackTimer);
      boundaryFallbackTimer = null;
    }
  }

  function startBoundaryFallback(segment, localWordIndex) {
    clearBoundaryFallback();
    fallbackSegment = segment;
    fallbackStartedAt = performance.now();
    fallbackStartWordIndex = localWordIndex;
    fallbackAnchorWordIndex = localWordIndex;
    lastAdvancingBoundaryAt = 0;
    lastBoundaryEventAt = 0;

    boundaryFallbackTimer = window.setInterval(() => {
      if (!isActive || !isPlaying || !fallbackSegment) return;

      const now = performance.now();
      if (!lastBoundaryEventAt && now - fallbackStartedAt < FALLBACK_INITIAL_GRACE_MS) return;
      if (lastBoundaryEventAt && now - lastBoundaryEventAt < FALLBACK_BOUNDARY_GRACE_MS) return;
      if (lastAdvancingBoundaryAt && now - lastAdvancingBoundaryAt < 700) return;

      const estimatedSegmentDuration = estimateSegmentSeconds(fallbackSegment) * 1000;
      const elapsed = now - fallbackStartedAt;
      if (elapsed > estimatedSegmentDuration + 700 && currentWordIndex >= fallbackSegment.startWordIndex) {
        return;
      }

      const anchorWordIndex = lastBoundaryEventAt ? fallbackAnchorWordIndex : fallbackStartWordIndex;
      const anchorStartedAt = lastBoundaryEventAt || fallbackStartedAt;
      const wordsPerMs = (FALLBACK_WORDS_PER_MINUTE * playbackRate) / 60000;
      let estimatedLocalIndex = clamp(
        anchorWordIndex + Math.floor((now - anchorStartedAt) * wordsPerMs),
        anchorWordIndex,
        fallbackSegment.wordCount - 1,
      );
      if (lastBoundaryEventAt) {
        estimatedLocalIndex = Math.min(
          estimatedLocalIndex,
          fallbackAnchorWordIndex + FALLBACK_BOUNDARY_AHEAD_LIMIT,
        );
      }
      const estimatedGlobalIndex = fallbackSegment.startWordIndex + estimatedLocalIndex;

      if (estimatedGlobalIndex > currentWordIndex) {
        setCurrentWordIndex(estimatedGlobalIndex);
        highlightWord(estimatedGlobalIndex);
      }
    }, 180);
  }

  function clearCurrentUtteranceHandlers() {
    if (!currentUtterance) return;

    currentUtterance.onend = null;
    currentUtterance.onerror = null;
    currentUtterance.onboundary = null;
    currentUtterance.onstart = null;
  }

  function stopPlaying() {
    clearCurrentUtteranceHandlers();
    clearBoundaryFallback();
    if (synth) synth.cancel();
    isPlaying = false;
    isActive = false;
    setCurrentWordIndex(0);
    currentSegmentIndex = -1;
    currentUtterance = null;
    clearHighlight();
    showSettings = false;
  }

  function pausePlaying() {
    clearCurrentUtteranceHandlers();
    clearBoundaryFallback();
    if (synth) synth.cancel();
    currentUtterance = null;
    isPlaying = false;
  }

  function applyVoice(utterance) {
    if (!selectedVoiceURI) return;

    const voice = availableVoices.find((item) => item.voiceURI === selectedVoiceURI);
    if (voice) utterance.voice = voice;
  }

  function startReadingAtWord(wordIndex) {
    if (!synth || totalWords === 0) return;

    clearCurrentUtteranceHandlers();
    clearBoundaryFallback();
    synth.cancel();
    clearHighlight();

    const segment = findSegmentForWord(wordIndex);
    if (!segment) {
      stopPlaying();
      return;
    }

    const localWordIndex = clamp(wordIndex - segment.startWordIndex, 0, segment.words.length - 1);
    const startWord = segment.words[localWordIndex];
    const text = segment.text.slice(startWord.startChar).trim();

    if (!text) {
      startReadingAtWord(segment.startWordIndex + segment.wordCount);
      return;
    }

    currentSegmentIndex = segments.indexOf(segment);
    setCurrentWordIndex(segment.startWordIndex + localWordIndex);
    highlightWord(currentWordIndex);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = playbackRate;
    utterance.pitch = playbackPitch;
    utterance.volume = playbackVolume;
    applyVoice(utterance);

    utterance.onstart = () => {
      isPlaying = true;
      if (autoScroll) {
        segment.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      highlightWord(currentWordIndex);
    };

    utterance.onboundary = (event) => {
      if (event.name && event.name !== 'word') return;

      const boundaryReceivedAt = performance.now();
      lastBoundaryEventAt = boundaryReceivedAt;
      const absoluteCharIndex = startWord.startChar + event.charIndex;
      const boundaryWord = getWordFromBoundary(segment, absoluteCharIndex);
      if (!boundaryWord) return;

      const localBoundaryIndex = segment.words.indexOf(boundaryWord);
      const globalBoundaryIndex = segment.startWordIndex + localBoundaryIndex;
      fallbackAnchorWordIndex = localBoundaryIndex;

      if (globalBoundaryIndex < currentWordIndex) {
        setCurrentWordIndex(globalBoundaryIndex);
        highlightWord(globalBoundaryIndex);
        return;
      }

      if (globalBoundaryIndex > currentWordIndex) {
        lastAdvancingBoundaryAt = boundaryReceivedAt;
      }
      setCurrentWordIndex(globalBoundaryIndex);
      highlightWord(globalBoundaryIndex);
    };

    utterance.onend = () => {
      clearBoundaryFallback();
      const nextWordIndex = segment.startWordIndex + segment.wordCount;
      setCurrentWordIndex(nextWordIndex);

      if (nextWordIndex >= totalWords) {
        stopPlaying();
        progress = 100;
        currentWordIndex = totalWords;
        remainingTimeLabel = '0 min';
        return;
      }

      startReadingAtWord(nextWordIndex);
    };

    utterance.onerror = (event) => {
      clearBoundaryFallback();
      if (event.error === 'interrupted' || event.error === 'canceled') return;

      const nextSegment = segments[currentSegmentIndex + 1];
      if (nextSegment) {
        startReadingAtWord(nextSegment.startWordIndex);
      } else {
        stopPlaying();
      }
    };

    currentUtterance = utterance;
    isActive = true;
    isPlaying = true;
    startBoundaryFallback(segment, localWordIndex);
    window.setTimeout(() => {
      if (currentUtterance !== utterance || !isActive) return;
      synth.speak(utterance);
      synth.resume();
    }, 0);
  }

  function togglePlay() {
    if (!isActive) {
      isActive = true;
      startReadingAtWord(currentWordIndex >= totalWords ? 0 : currentWordIndex);
    } else if (isPlaying) {
      pausePlaying();
    } else {
      startReadingAtWord(currentWordIndex);
    }
  }

  function seekToWord(wordIndex) {
    const targetIndex = clamp(Math.round(Number(wordIndex) || 0), 0, Math.max(0, totalWords - 1));
    setCurrentWordIndex(targetIndex);
    highlightWord(targetIndex);

    if (isActive) {
      startReadingAtWord(targetIndex);
    }
  }

  function skipWords(delta) {
    seekToWord(currentWordIndex + delta);
  }

  function handleProgressInput(event) {
    const targetIndex = Number(event.target.value);
    setCurrentWordIndex(targetIndex);
    if (!isPlaying) highlightWord(targetIndex);
  }

  function handleProgressChange(event) {
    seekToWord(Number(event.target.value));
  }

  function getCaretFromPoint(x, y) {
    if (document.caretPositionFromPoint) {
      const position = document.caretPositionFromPoint(x, y);
      if (!position) return null;
      return {
        node: position.offsetNode,
        offset: position.offset,
      };
    }

    if (document.caretRangeFromPoint) {
      const range = document.caretRangeFromPoint(x, y);
      if (!range) return null;
      return {
        node: range.startContainer,
        offset: range.startOffset,
      };
    }

    return null;
  }

  function getClickedWordIndex(event) {
    const targetSegment = segments.find((segment) => segment.element.contains(event.target));
    if (!targetSegment) return -1;

    const caret = getCaretFromPoint(event.clientX, event.clientY);
    if (caret) {
      const localIndex = targetSegment.words.findIndex((word) => {
        return word.node === caret.node && caret.offset >= word.startOffset && caret.offset <= word.endOffset;
      });

      if (localIndex >= 0) return targetSegment.startWordIndex + localIndex;
    }

    let closestIndex = -1;
    let closestDistance = Number.POSITIVE_INFINITY;

    targetSegment.words.forEach((word, index) => {
      for (const rect of word.range.getClientRects()) {
        const horizontalDistance =
          event.clientX < rect.left ? rect.left - event.clientX : Math.max(0, event.clientX - rect.right);
        const verticalDistance =
          event.clientY < rect.top ? rect.top - event.clientY : Math.max(0, event.clientY - rect.bottom);
        const distance = horizontalDistance + verticalDistance;

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      }
    });

    return closestIndex >= 0 ? targetSegment.startWordIndex + closestIndex : targetSegment.startWordIndex;
  }

  function handleGlobalClick(event) {
    if (!isActive || !clickToRead) return;
    if (event.target.closest('.tts-controls, .settings-popup')) return;

    const clickedWordIndex = getClickedWordIndex(event);
    if (clickedWordIndex < 0) return;

    event.preventDefault();
    seekToWord(clickedWordIndex);
  }

  function savePreferences() {
    if (!persistPreferences) {
      localStorage.removeItem(PREFERENCES_KEY);
      return;
    }

    localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({
        selectedVoiceURI,
        playbackRate,
        playbackPitch,
        playbackVolume,
        autoScroll,
        highlightWords,
        clickToRead,
        persistPreferences,
      }),
    );
  }

  function loadPreferences() {
    try {
      const rawPreferences = localStorage.getItem(PREFERENCES_KEY);
      if (!rawPreferences) return;

      const preferences = JSON.parse(rawPreferences);
      selectedVoiceURI = preferences.selectedVoiceURI || selectedVoiceURI;
      playbackRate = clamp(Number(preferences.playbackRate) || playbackRate, 0.5, 2);
      playbackPitch = clamp(Number(preferences.playbackPitch) || playbackPitch, 0.5, 1.5);
      playbackVolume = clamp(Number(preferences.playbackVolume) || playbackVolume, 0, 1);
      autoScroll = preferences.autoScroll ?? autoScroll;
      highlightWords = preferences.highlightWords ?? highlightWords;
      clickToRead = preferences.clickToRead ?? clickToRead;
      persistPreferences = preferences.persistPreferences ?? persistPreferences;
    } catch {
      localStorage.removeItem(PREFERENCES_KEY);
    }
  }

  function restartIfActive() {
    updateTiming();
    savePreferences();

    if (isActive) {
      startReadingAtWord(currentWordIndex);
    }
  }

  function handleVoiceChange(event) {
    selectedVoiceURI = event.target.value;
    restartIfActive();
  }

  function handleRateChange(event) {
    playbackRate = roundToStep(clamp(Number(event.target.value), 0.5, 2));
    restartIfActive();
  }

  function handlePitchChange(event) {
    playbackPitch = roundToStep(clamp(Number(event.target.value), 0.5, 1.5));
    restartIfActive();
  }

  function handleVolumeChange(event) {
    playbackVolume = roundToStep(clamp(Number(event.target.value), 0, 1));
    restartIfActive();
  }

  function handleToggleChange(setting, checked) {
    if (setting === 'autoScroll') autoScroll = checked;
    if (setting === 'highlightWords') {
      highlightWords = checked;
      if (!highlightWords) clearHighlight();
      else highlightWord(currentWordIndex);
    }
    if (setting === 'clickToRead') clickToRead = checked;
    if (setting === 'persistPreferences') persistPreferences = checked;

    savePreferences();
  }

  function toggleSettings() {
    showSettings = !showSettings;
  }

  function closeSettings() {
    showSettings = false;
    settingsButton?.focus();
  }

  function handleDocumentKeydown(event) {
    if (event.key === 'Escape' && showSettings) {
      closeSettings();
    }
  }

  function loadVoices() {
    if (!synth) return;

    const voices = synth.getVoices();
    const englishVoices = voices.filter((voice) => voice.lang.startsWith('en'));
    availableVoices = englishVoices.length > 0 ? englishVoices : voices;
    if (selectedVoiceURI && !availableVoices.some((voice) => voice.voiceURI === selectedVoiceURI)) {
      selectedVoiceURI = '';
    }
    if (!selectedVoiceURI && availableVoices.length > 0) {
      const defaultVoice = availableVoices.find((voice) => voice.default) || availableVoices[0];
      selectedVoiceURI = defaultVoice.voiceURI;
    }
  }

  function collectReadableSegments() {
    const container = document.querySelector('.article-body');
    if (!container) return [];

    let startWordIndex = 0;
    return Array.from(container.querySelectorAll(READABLE_SELECTOR))
      .filter(shouldUseReadableElement)
      .map((element) => {
        const readable = collectWordsForElement(element);
        const segment = {
          element,
          text: readable.text,
          words: readable.words,
          wordCount: readable.words.length,
          startWordIndex,
        };

        startWordIndex += segment.wordCount;
        return segment;
      })
      .filter((segment) => segment.wordCount > 0);
  }

  onMount(() => {
    isSupported = 'speechSynthesis' in window;
    if (!isSupported) return;

    synth = window.speechSynthesis;
    loadPreferences();
    segments = collectReadableSegments();
    totalWords = segments.reduce((count, segment) => count + segment.wordCount, 0);
    updateTiming(0);

    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }

    document.addEventListener('click', handleGlobalClick, true);
    document.addEventListener('keydown', handleDocumentKeydown);
  });

  onDestroy(() => {
    clearBoundaryFallback();
    if (synth) synth.cancel();
    clearHighlight();
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', handleGlobalClick, true);
      document.removeEventListener('keydown', handleDocumentKeydown);
    }
  });
</script>

{#if isSupported && segments.length > 0}
  <div class="tts-component">
    {#if !isActive}
      <button class="tts-starter-btn" onclick={togglePlay} aria-label="Listen to this article">
        <span class="icon-wrapper">
          <Play size={14} fill="currentColor" aria-hidden="true" />
        </span>
        <span class="btn-text">
          Listen <span class="time-est">({totalTimeLabel})</span>
        </span>
      </button>
    {/if}

    {#if isActive}
      <div class="tts-floating-bubble fade-up" role="region" aria-label="Read aloud controls">
        {#if showSettings}
          <div
            id="tts-settings-popup"
            class="settings-popup fade-up"
            role="dialog"
            aria-labelledby="tts-settings-title"
            aria-describedby="tts-settings-description"
          >
            <div class="settings-header">
              <div>
                <h3 id="tts-settings-title">Read aloud</h3>
                <p id="tts-settings-description">{remainingTimeLabel} left</p>
              </div>
              <button class="close-btn" onclick={closeSettings} aria-label="Close read aloud settings">
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <div class="settings-body">
              <div class="setting-group">
                <label for="voice-select">Voice</label>
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
                  <label for="speed-range">Speed</label>
                  <span class="setting-value">{formatNumber(playbackRate)}x</span>
                </div>
                <input
                  type="range"
                  id="speed-range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={playbackRate}
                  aria-valuetext={`${formatNumber(playbackRate)} times normal speed`}
                  oninput={handleRateChange}
                  style={`--range-fill: ${rangePercent(playbackRate, 0.5, 2)}`}
                />
              </div>

              <div class="setting-group">
                <div class="label-row">
                  <label for="pitch-range">Pitch</label>
                  <span class="setting-value">{formatNumber(playbackPitch)}x</span>
                </div>
                <input
                  type="range"
                  id="pitch-range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={playbackPitch}
                  aria-valuetext={`${formatNumber(playbackPitch)} times normal pitch`}
                  oninput={handlePitchChange}
                  style={`--range-fill: ${rangePercent(playbackPitch, 0.5, 1.5)}`}
                />
              </div>

              <div class="setting-group">
                <div class="label-row">
                  <label for="volume-range">Volume</label>
                  <span class="setting-value">{Math.round(playbackVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  id="volume-range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={playbackVolume}
                  aria-valuetext={`${Math.round(playbackVolume * 100)} percent volume`}
                  oninput={handleVolumeChange}
                  style={`--range-fill: ${rangePercent(playbackVolume, 0, 1)}`}
                />
              </div>

              <div class="toggle-list">
                <label class="toggle-row">
                  <span>Auto-scroll</span>
                  <input
                    type="checkbox"
                    checked={autoScroll}
                    onchange={(event) => handleToggleChange('autoScroll', event.target.checked)}
                  />
                </label>
                <label class="toggle-row">
                  <span>Word highlight</span>
                  <input
                    type="checkbox"
                    checked={highlightWords}
                    onchange={(event) => handleToggleChange('highlightWords', event.target.checked)}
                  />
                </label>
                <label class="toggle-row">
                  <span>Click to read</span>
                  <input
                    type="checkbox"
                    checked={clickToRead}
                    onchange={(event) => handleToggleChange('clickToRead', event.target.checked)}
                  />
                </label>
                <label class="toggle-row">
                  <span>Remember settings</span>
                  <input
                    type="checkbox"
                    checked={persistPreferences}
                    onchange={(event) => handleToggleChange('persistPreferences', event.target.checked)}
                  />
                </label>
              </div>
            </div>
          </div>
        {/if}

        <div class="tts-controls">
          <button class="control-btn play-pause" onclick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {#if isPlaying}
              <Pause size={18} fill="currentColor" aria-hidden="true" />
            {:else}
              <Play size={18} fill="currentColor" aria-hidden="true" />
            {/if}
          </button>

          <button class="control-btn" onclick={() => skipWords(-SKIP_WORDS)} aria-label="Skip back 30 words">
            <SkipBack size={17} aria-hidden="true" />
          </button>

          <div class="progress-container">
            <input
              class="progress-slider"
              type="range"
              min="0"
              max={Math.max(0, totalWords - 1)}
              step="1"
              value={Math.min(currentWordIndex, Math.max(0, totalWords - 1))}
              aria-label="Reading progress"
              aria-valuetext={`${Math.round(progress)} percent, ${remainingTimeLabel} remaining`}
              oninput={handleProgressInput}
              onchange={handleProgressChange}
              style={`--tts-progress: ${progress}%`}
            />
            <div class="progress-meta" aria-live="polite">
              <span>{Math.round(progress)}%</span>
              <span>{remainingTimeLabel} left</span>
            </div>
          </div>

          <button class="control-btn" onclick={() => skipWords(SKIP_WORDS)} aria-label="Skip forward 30 words">
            <SkipForward size={17} aria-hidden="true" />
          </button>

          <div class="right-controls">
            <button
              bind:this={settingsButton}
              class="control-btn settings-btn"
              onclick={toggleSettings}
              aria-label="Read aloud settings"
              aria-expanded={showSettings}
              aria-controls={showSettings ? 'tts-settings-popup' : undefined}
            >
              <Settings size={18} aria-hidden="true" />
            </button>
            <button class="control-btn stop" onclick={stopPlaying} aria-label="Stop playback">
              <Square size={16} fill="currentColor" aria-hidden="true" />
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
    background: linear-gradient(135deg, rgba(82, 74, 242, 0.16), rgba(168, 85, 247, 0.2));
    border: 1px solid rgba(168, 85, 247, 0.45);
    padding: 6px 14px 6px 8px;
    border-radius: 99px;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      background 0.2s ease;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.18);
  }

  .tts-starter-btn:hover {
    background: linear-gradient(135deg, rgba(82, 74, 242, 0.26), rgba(168, 85, 247, 0.28));
    border-color: rgba(168, 85, 247, 0.7);
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(168, 85, 247, 0.22);
  }

  .tts-starter-btn:focus-visible,
  .control-btn:focus-visible,
  .close-btn:focus-visible,
  .voice-select:focus-visible,
  input:focus-visible {
    outline: 2px solid rgba(168, 85, 247, 0.9);
    outline-offset: 3px;
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
  }

  .time-est {
    color: var(--text-secondary);
    font-weight: 500;
  }

  :global(.tts-word) {
    border-radius: 3px;
  }

  :global(.tts-active-word) {
    background: rgba(168, 85, 247, 0.36);
    color: #ffffff;
    box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.12);
  }

  .tts-floating-bubble {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, rgba(18, 17, 38, 0.98), rgba(8, 8, 20, 0.99));
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(168, 85, 247, 0.35);
    border-radius: 999px;
    padding: 10px 14px;
    z-index: 1000;
    box-shadow:
      0 18px 50px rgba(0, 0, 0, 0.65),
      0 0 0 1px rgba(255, 255, 255, 0.05) inset;
    width: min(92vw, 620px);
    font-family: 'Poppins', sans-serif;
  }

  .tts-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .control-btn {
    flex: 0 0 auto;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.07);
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    transition:
      transform 0.2s ease,
      background 0.2s ease,
      color 0.2s ease,
      border-color 0.2s ease;
  }

  .control-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.14);
    color: var(--text-primary);
  }

  .control-btn.play-pause {
    background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
    color: #fff;
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 4px 12px rgba(168, 85, 247, 0.32);
  }

  .control-btn.play-pause:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(168, 85, 247, 0.5);
  }

  .control-btn.settings-btn:hover {
    color: #d8b4fe;
  }

  .control-btn.stop:hover {
    color: #fca5a5;
  }

  .right-controls {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .progress-container {
    flex: 1;
    min-width: 130px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .progress-slider {
    width: 100%;
    height: 22px;
    margin: 0;
    cursor: pointer;
    appearance: none;
    background: transparent;
  }

  .progress-slider::-webkit-slider-runnable-track {
    height: 7px;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      #8b5cf6 0%,
      #a855f7 var(--tts-progress),
      rgba(10, 9, 26, 0.92) var(--tts-progress),
      rgba(10, 9, 26, 0.92) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: inset 0 1px 5px rgba(0, 0, 0, 0.55);
  }

  .progress-slider::-moz-range-track {
    height: 7px;
    border-radius: 999px;
    background: rgba(10, 9, 26, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: inset 0 1px 5px rgba(0, 0, 0, 0.55);
  }

  .progress-slider::-moz-range-progress {
    height: 7px;
    border-radius: 999px;
    background: linear-gradient(90deg, #8b5cf6, #a855f7);
  }

  .progress-slider::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    margin-top: -4px;
    border: 2px solid rgba(224, 224, 255, 0.92);
    border-radius: 50%;
    background: #17142f;
    box-shadow:
      0 0 0 4px rgba(168, 85, 247, 0.16),
      0 3px 10px rgba(0, 0, 0, 0.55);
  }

  .progress-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(224, 224, 255, 0.92);
    border-radius: 50%;
    background: #17142f;
    box-shadow:
      0 0 0 4px rgba(168, 85, 247, 0.16),
      0 3px 10px rgba(0, 0, 0, 0.55);
  }

  .progress-meta {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    color: var(--text-secondary);
    font-size: 0.68rem;
    line-height: 1.2;
    white-space: nowrap;
  }

  .settings-popup {
    position: absolute;
    bottom: calc(100% + 16px);
    right: 14px;
    width: min(380px, calc(100vw - 28px));
    max-height: min(72vh, 560px);
    overflow-y: auto;
    background:
      linear-gradient(180deg, rgba(23, 20, 47, 0.98), rgba(9, 8, 24, 0.99)),
      #0a091a;
    border: 1px solid rgba(168, 85, 247, 0.26);
    border-radius: 18px;
    padding: 14px;
    box-shadow:
      0 26px 80px rgba(0, 0, 0, 0.76),
      0 0 0 1px rgba(255, 255, 255, 0.045) inset,
      0 0 42px rgba(82, 74, 242, 0.13);
    color: var(--text-primary);
    text-align: left;
  }

  .settings-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 12px;
    padding: 4px 4px 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.09);
  }

  .settings-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .settings-header p {
    margin: 4px 0 0;
    color: var(--text-secondary);
    font-size: 0.78rem;
    line-height: 1.4;
  }

  .close-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 6px;
    border-radius: 8px;
    transition:
      background 0.2s ease,
      color 0.2s ease,
      border-color 0.2s ease;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.16);
    color: var(--text-primary);
  }

  .settings-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .setting-group {
    display: flex;
    flex-direction: column;
    gap: 9px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(255, 255, 255, 0.075);
    border-radius: 12px;
  }

  .label-row,
  .toggle-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  .setting-value {
    color: #c4b5fd;
    font-size: 0.76rem;
    font-weight: 700;
  }

  .voice-select {
    width: 100%;
    background-color: rgba(8, 8, 20, 0.96);
    border: 1px solid rgba(168, 85, 247, 0.18);
    color: var(--text-primary);
    padding: 11px 36px 11px 12px;
    border-radius: 10px;
    font-family: 'Poppins', sans-serif;
    font-size: 0.84rem;
    outline: none;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23c4b5fd' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 16px;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      background-color 0.2s ease;
  }

  .voice-select:focus {
    border-color: rgba(168, 85, 247, 0.75);
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.18);
    background-color: rgba(10, 9, 26, 1);
  }

  .voice-select option {
    background: var(--bg-dark);
    color: var(--text-primary);
  }

  input[type='range']:not(.progress-slider) {
    width: 100%;
    cursor: pointer;
    appearance: none;
    height: 18px;
    background: transparent;
  }

  input[type='range']:not(.progress-slider)::-webkit-slider-runnable-track {
    height: 7px;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      #6d5dfc 0%,
      #a855f7 var(--range-fill),
      rgba(7, 7, 18, 0.94) var(--range-fill),
      rgba(7, 7, 18, 0.94) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.075);
    box-shadow: inset 0 1px 5px rgba(0, 0, 0, 0.55);
  }

  input[type='range']:not(.progress-slider)::-moz-range-track {
    height: 7px;
    border-radius: 999px;
    background: rgba(7, 7, 18, 0.94);
    border: 1px solid rgba(255, 255, 255, 0.075);
    box-shadow: inset 0 1px 5px rgba(0, 0, 0, 0.55);
  }

  input[type='range']:not(.progress-slider)::-moz-range-progress {
    height: 7px;
    border-radius: 999px;
    background: linear-gradient(90deg, #6d5dfc, #a855f7);
  }

  input[type='range']:not(.progress-slider)::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    margin-top: -5px;
    border: 2px solid rgba(224, 224, 255, 0.9);
    border-radius: 50%;
    background: #17142f;
    box-shadow:
      0 0 0 4px rgba(168, 85, 247, 0.15),
      0 3px 10px rgba(0, 0, 0, 0.52);
  }

  input[type='range']:not(.progress-slider)::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(224, 224, 255, 0.9);
    border-radius: 50%;
    background: #17142f;
    box-shadow:
      0 0 0 4px rgba(168, 85, 247, 0.15),
      0 3px 10px rgba(0, 0, 0, 0.52);
  }

  .setting-group > label,
  .toggle-row span {
    display: block;
    color: var(--text-secondary);
    font-size: 0.8rem;
    font-weight: 600;
    margin: 0;
  }

  .toggle-list {
    display: grid;
    gap: 10px;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    cursor: pointer;
    padding: 11px 12px;
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(255, 255, 255, 0.075);
    border-radius: 12px;
    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      transform 0.2s ease;
  }

  .toggle-row:hover {
    background: rgba(255, 255, 255, 0.055);
    border-color: rgba(168, 85, 247, 0.22);
  }

  .toggle-row input {
    position: relative;
    flex: 0 0 auto;
    width: 36px;
    height: 20px;
    appearance: none;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 999px;
    background: rgba(7, 7, 18, 0.96);
    cursor: pointer;
    transition:
      background 0.2s ease,
      border-color 0.2s ease;
  }

  .toggle-row input::before {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--text-secondary);
    transition:
      transform 0.2s ease,
      background 0.2s ease;
  }

  .toggle-row input:checked {
    background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
    border-color: rgba(224, 224, 255, 0.28);
  }

  .toggle-row input:checked::before {
    transform: translateX(16px);
    background: #ffffff;
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

  @media (max-width: 640px) {
    .tts-floating-bubble {
      bottom: 18px;
      width: calc(100vw - 24px);
      border-radius: 18px;
      padding: 10px;
    }

    .tts-controls {
      gap: 6px;
    }

    .control-btn {
      width: 34px;
      height: 34px;
    }

    .progress-meta {
      font-size: 0.64rem;
    }

    .settings-popup {
      right: 0;
      left: 0;
      margin: 0 auto;
      width: calc(100vw - 24px);
    }
  }
</style>
