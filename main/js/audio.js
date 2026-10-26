/**
 * ChatBaiter Audio Module
 * - Web Audio API Cassette Visualizer
 * - Microphone 10-15s Voice Recorder
 * - Ambient Harmonic Sample Key Synthesizer (WAV generator)
 * - Audio Playback Engine
 */

const ChatAudio = (function () {
  'use strict';

  let audioContext = null;
  let mediaRecorder = null;
  let recordedChunks = [];
  let recordTimerInterval = null;
  let recordStartTime = 0;
  let currentAudioBuffer = null;
  let currentAudioSource = null;
  let isPlaying = false;

  function getAudioContext() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioCtx();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return audioContext;
  }

  /**
   * Initialize and draw the idle waveform on the cassette canvas
   */
  function drawIdleWaveform(canvasId = 'cassetteCanvas') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#2a323d';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    for (let x = 0; x < w; x += 4) {
      const y = h / 2 + Math.sin(x * 0.15) * 3;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  /**
   * Draw decoded audio waveform into cassette canvas
   */
  function drawDecodedWaveform(audioBuffer, canvasId = 'cassetteCanvas') {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !audioBuffer) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    
    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / w);
    const amp = h / 2;

    ctx.fillStyle = '#10b981';
    for (let i = 0; i < w; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      const yMin = (1 + min) * amp;
      const yMax = Math.max(yMin + 1, (1 + max) * amp);
      ctx.fillRect(i, yMin, 1, yMax - yMin);
    }
  }

  /**
   * Synthesize a high-quality 12-second ambient harmonic chord and encode as standard WAV
   * This allows instant, self-contained key creation without needing external files!
   */
  async function synthesizeSampleKey() {
    const sampleRate = 44100;
    const durationSec = 12.0;
    const totalSamples = sampleRate * durationSec;
    const ctx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
      1,
      totalSamples,
      sampleRate
    );

    // Create an ethereal harmonic triad: C3 (130.81Hz), G3 (196.00Hz), D4 (293.66Hz)
    const freqs = [130.81, 196.0, 293.66];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx === 0 ? 'sine' : idx === 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, 0);

      // Subtle vibrato/detune
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(2.5 + idx * 0.7, 0);
      lfoGain.gain.setValueAtTime(1.8, 0);
      lfo.connect(osc.frequency);
      lfo.start(0);

      // Envelope: gentle fade-in, sustain, gentle fade-out
      gain.gain.setValueAtTime(0.001, 0);
      gain.gain.exponentialRampToValueAtTime(0.2, 1.5);
      gain.gain.setValueAtTime(0.2, durationSec - 1.5);
      gain.gain.exponentialRampToValueAtTime(0.001, durationSec);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(0);
      osc.stop(durationSec);
    });

    const renderedBuffer = await ctx.startRendering();
    const wavBlob = audioBufferToWavBlob(renderedBuffer);
    const arrayBuffer = await wavBlob.arrayBuffer();

    return {
      blob: wavBlob,
      arrayBuffer: arrayBuffer,
      duration: durationSec,
      name: 'Sample_Acoustic_Chord_12s.wav',
    };
  }

  /**
   * Convert AudioBuffer to standard PCM 16-bit WAV Blob
   */
  function audioBufferToWavBlob(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const numSamples = buffer.length;
    const byteRate = sampleRate * blockAlign;
    const dataSize = numSamples * blockAlign;
    const bufferSize = 44 + dataSize;

    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    function writeString(offset, string) {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    }

    // RIFF header
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // Interleave channel samples and write 16-bit PCM
    let offset = 44;
    const channels = [];
    for (let c = 0; c < numChannels; c++) {
      channels.push(buffer.getChannelData(c));
    }

    for (let i = 0; i < numSamples; i++) {
      for (let c = 0; c < numChannels; c++) {
        let sample = channels[c][i];
        sample = Math.max(-1, Math.min(1, sample));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  /**
   * Start 10-15 second Voice Recording with Web MediaRecorder
   */
  async function startRecording(onTick, onComplete, onError) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunks = [];
      
      const options = MediaRecorder.isTypeSupported('audio/webm')
        ? { mimeType: 'audio/webm' }
        : {};

      mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const rawBlob = new Blob(recordedChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
        const rawArrayBuffer = await rawBlob.arrayBuffer();

        const ctx = getAudioContext();
        let decodedBuffer = null;
        try {
          decodedBuffer = await ctx.decodeAudioData(rawArrayBuffer.slice(0));
        } catch (e) {
          console.warn('Audio preview decoding failed', e);
        }

        // Convert the decoded buffer into a standardized PCM 16-bit WAV file
        // This guarantees that downloaded files and re-uploaded files produce identical SHA-256 hashes!
        let finalBlob = rawBlob;
        let finalArrayBuffer = rawArrayBuffer;
        let duration = 15.0;

        if (decodedBuffer) {
          finalBlob = audioBufferToWavBlob(decodedBuffer);
          finalArrayBuffer = await finalBlob.arrayBuffer();
          duration = decodedBuffer.duration;
          drawDecodedWaveform(decodedBuffer);
        }

        if (onComplete) {
          onComplete({
            blob: finalBlob,
            arrayBuffer: finalArrayBuffer,
            duration,
            name: `Recorded_Key_${Math.round(duration)}s.wav`,
          });
        }
      };

      recordStartTime = Date.now();
      mediaRecorder.start(250);

      // Countdown timer loop up to 15 seconds
      const maxDurationSec = 15;
      recordTimerInterval = setInterval(() => {
        const elapsedSec = (Date.now() - recordStartTime) / 1000;
        if (onTick) onTick(elapsedSec);

        if (elapsedSec >= maxDurationSec) {
          stopRecording();
        }
      }, 100);
    } catch (err) {
      if (onError) onError(err);
    }
  }

  /**
   * Stop voice recording
   */
  function stopRecording() {
    if (recordTimerInterval) {
      clearInterval(recordTimerInterval);
      recordTimerInterval = null;
    }
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  }

  /**
   * Play or Pause the currently loaded audio buffer
   */
  async function togglePlayAudio(arrayBuffer, onPlayStateChange) {
    const ctx = getAudioContext();

    if (isPlaying && currentAudioSource) {
      try {
        currentAudioSource.stop();
      } catch (e) {}
      isPlaying = false;
      if (onPlayStateChange) onPlayStateChange(false);
      return;
    }

    if (!arrayBuffer) return;

    try {
      if (!currentAudioBuffer) {
        currentAudioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
      }

      currentAudioSource = ctx.createBufferSource();
      currentAudioSource.buffer = currentAudioBuffer;
      currentAudioSource.connect(ctx.destination);

      currentAudioSource.onended = () => {
        isPlaying = false;
        if (onPlayStateChange) onPlayStateChange(false);
      };

      currentAudioSource.start(0);
      isPlaying = true;
      if (onPlayStateChange) onPlayStateChange(true);
    } catch (err) {
      console.error('Audio playback error', err);
    }
  }

  function setLoadedBuffer(audioBuffer) {
    currentAudioBuffer = audioBuffer;
  }

  /**
   * Synthesize specific soundboard audio keys (Web Audio API)
   * Ensures instant, offline-compatible meme keys that work anywhere!
   */
  async function synthesizeMemePreset(soundType) {
    const sampleRate = 44100;
    let durationSec = 3.0;

    if (soundType === 'vineboom') durationSec = 1.8;
    else if (soundType === 'bruh') durationSec = 2.4;
    else if (soundType === 'fbi') durationSec = 3.2;
    else if (soundType === 'discord') durationSec = 4.0;
    else if (soundType === 'metalpipe') durationSec = 2.6;
    else if (soundType === 'synthchord') return synthesizeSampleKey();

    const totalSamples = sampleRate * durationSec;
    const ctx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
      1,
      totalSamples,
      sampleRate
    );

    if (soundType === 'vineboom') {
      // 808 Sub-bass drop + saturation
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, 0);
      osc.frequency.exponentialRampToValueAtTime(32, durationSec * 0.8);

      gain.gain.setValueAtTime(0.7, 0);
      gain.gain.exponentialRampToValueAtTime(0.001, durationSec);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(0);
      osc.stop(durationSec);
    } else if (soundType === 'bruh') {
      // Formant vowel frequency drop
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(125, 0);
      osc.frequency.exponentialRampToValueAtTime(75, 1.2);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(500, 0);
      filter.Q.value = 4.0;

      gain.gain.setValueAtTime(0.5, 0);
      gain.gain.exponentialRampToValueAtTime(0.001, durationSec);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(0);
      osc.stop(durationSec);
    } else if (soundType === 'fbi') {
      // Rapid alternating siren alarm
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      for (let t = 0; t < durationSec; t += 0.25) {
        osc.frequency.setValueAtTime((Math.floor(t * 4) % 2 === 0) ? 880 : 660, t);
      }
      gain.gain.setValueAtTime(0.3, 0);
      gain.gain.exponentialRampToValueAtTime(0.001, durationSec);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(0);
      osc.stop(durationSec);
    } else if (soundType === 'discord') {
      // Melodic chime: C5 (523Hz), D5 (587Hz), A5 (880Hz)
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const startTime = i * 0.18;
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.25, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.9);
      });
    } else if (soundType === 'metalpipe') {
      // Inharmonic metallic ring
      [420, 712, 1140, 1590, 2350].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.25 / (idx + 1), 0);
        gain.gain.exponentialRampToValueAtTime(0.0001, durationSec - idx * 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(0);
        osc.stop(durationSec);
      });
    }

    const rendered = await ctx.startRendering();
    const wavBlob = audioBufferToWavBlob(rendered);
    const arrayBuffer = await wavBlob.arrayBuffer();

    return {
      blob: wavBlob,
      arrayBuffer: arrayBuffer,
      duration: durationSec,
      name: `MyInstants_${soundType.toUpperCase()}_Key.wav`,
    };
  }

  /**
   * Fetch audio arrayBuffer from external URL
   */
  async function fetchAudioFromUrl(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch audio.`);
    const blob = await res.blob();
    const arrayBuffer = await blob.arrayBuffer();
    return {
      blob,
      arrayBuffer,
      name: url.split('/').pop().split('?')[0] || 'MyInstants_Audio.mp3',
    };
  }

  /**
   * Trigger browser file download for an audio blob
   */
  function downloadAudioFile(blob, filename = 'ChatBaiter_AudioKey.wav') {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  }

  return {
    drawIdleWaveform,
    drawDecodedWaveform,
    synthesizeSampleKey,
    startRecording,
    stopRecording,
    togglePlayAudio,
    getAudioContext,
    setLoadedBuffer,
    downloadAudioFile,
    audioBufferToWavBlob,
    synthesizeMemePreset,
    fetchAudioFromUrl,
  };
})();
