
// --- LÓGICA DE ABAS ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-trigger').forEach(trigger => trigger.classList.remove('active'));
    
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active');
        const trigger = document.getElementById('trig-' + tabId);
        if (trigger) trigger.classList.add('active');
    }
    
    if(tabId === 'oscillators') {
        setTimeout(sizeCanvases, 50);
    }
}

// --- CONFIGURAÇÕES TONAIS ---
const COLORS = ['#00f2ff','#33ff88','#ffcc00','#ff4488'];
const NAMES_SHARP = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
const NAMES_FLAT  = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];
const PREFER_FLATS = [0, 5, 10, 3, 8, 1, 6]; 

function getPreferredNames(rootNoteIndex) {
    return PREFER_FLATS.includes(rootNoteIndex) ? NAMES_FLAT : NAMES_SHARP;
}

let useSharps = true; 
let NAMES = NAMES_SHARP; 
let manualEnharmonic = false;

// LISTA EXPANDIDA (44 ACORDES) ORGANIZADA POR FAMÍLIAS
// LISTA OTIMIZADA PARA 4 VOZES (OMISSÃO DE TÔNICA EM ACORDES COMPLEXOS)
const CHORDS_LIST = [
    // --- MAIORES ---
    { name: 'Maior',   notes: [0, 4, 7, 12], color: '#00f2ff' },
    { name: 'add9',    notes: [0, 4, 7, 14], color: '#00e1ff' },
    { name: '6',       notes: [0, 4, 7, 9],  color: '#00cfff' },
    { name: '6/9',     notes: [0, 4, 9, 14], color: '#00bcff' },
    { name: '7M',      notes: [0, 4, 7, 11], color: '#00aaff' },
    { name: '7M(9)',   notes: [0, 4, 11, 14], color: '#0088ff' },
    { name: '7M(13)',  notes: [0, 4, 11, 21], color: '#0077ee' },
    { name: '7M(♯11)', notes: [0, 4, 11, 18], color: '#0066ff' },
    { name: '7M(♯5)',  notes: [0, 4, 8, 11], color: '#0044ff' },

    // --- MENORES ---
    { name: 'm',       notes: [0, 3, 7, 12], color: '#33ff88' },
    { name: 'm(add9)', notes: [0, 3, 7, 14], color: '#2ee67a' },
    { name: 'm6',      notes: [0, 3, 7, 9],  color: '#29d16f' },
    { name: 'm(♭6)',   notes: [0, 3, 7, 8],  color: '#24bc64' },
    { name: 'm7',      notes: [0, 3, 7, 10], color: '#1f9e54' },
    { name: 'm9',      notes: [0, 3, 10, 14], color: '#1a8a49' },
    { name: 'm11',     notes: [0, 3, 10, 17], color: '#15753e' },
    { name: 'm13',     notes: [0, 3, 10, 21], color: '#116335' },
    { name: 'm7M',     notes: [0, 3, 7, 11], color: '#0f5b30' },
    { name: 'm7(add4)',notes: [3, 5, 7, 10], color: '#145a32' }, // Tônica omitida

    // --- DOMINANTES E BLUES ---
    { name: '7',       notes: [0, 4, 7, 10], color: '#ffcc00' },
    { name: '9',       notes: [0, 4, 10, 14], color: '#ffb300' },
    { name: '13',      notes: [0, 4, 10, 21], color: '#ff9900' },
    { name: '7(11)',   notes: [0, 4, 10, 17], color: '#ff8000' },
    { name: '7(♭5)',   notes: [0, 4, 6, 10], color: '#ff6600' },
    { name: '7(♯11)',  notes: [0, 4, 10, 18], color: '#e62e00' },
    { name: '7(♯5)',   notes: [0, 4, 8, 10], color: '#cc2900' },
    { name: '7(♭13)',  notes: [0, 4, 10, 20], color: '#991f00' },
    { name: '7(♭9)',   notes: [0, 4, 10, 13], color: '#4b0082' },
    { name: '7(♯9)',   notes: [0, 4, 10, 15], color: '#311b92' },
    { name: 'Blues7',  notes: [4, 7, 10, 15], color: '#1a237e' }, // Tônica omitida
    { name: '7(♯9♭13)',notes: [4, 10, 15, 20], color: '#0d144a' }, // Tônica omitida
    { name: '7alt',    notes: [10, 13, 15, 20], color: '#050a30' }, // Tônica omitida (foco nas tensões)

    // --- SUSPENSOS E AUMENTADOS ---
    { name: 'sus2',    notes: [0, 2, 7, 12], color: '#ff4488' },
    { name: 'sus4',    notes: [0, 5, 7, 12], color: '#ff2266' },
    { name: '7sus4',   notes: [0, 5, 7, 10], color: '#ff0044' },
    { name: '9sus4',   notes: [0, 5, 10, 14], color: '#dd003b' },
    { name: '13sus4',  notes: [0, 5, 10, 21], color: '#bb0033' },
    { name: '(♯5)',    notes: [0, 4, 8, 12], color: '#990022' },

    // --- DIMINUTOS ---
    { name: 'm7(♭5)',  notes: [0, 3, 6, 10], color: '#cc66ff' },
    { name: 'dim',     notes: [0, 3, 6, 12], color: '#b347ff' },
    { name: 'dim7',    notes: [0, 3, 6, 9],  color: '#9933ff' },
    { name: 'm9(♭5)',  notes: [3, 6, 10, 14], color: '#7a29cc' }, // Tônica omitida

    // --- HÍBRIDOS E ESPECIAIS ---
    { name: 'Power',   notes: [0, 7, 12], color: '#8899aa' }, // Apenas 3 notas, tudo certo
    { name: 'Quartal', notes: [0, 5, 10, 15], color: '#55ccdd' },
    { name: 'Lydian',  notes: [7, 11, 14, 18], color: '#88eeff' }, // Tônica omitida
    { name: 'Phrygian',notes: [1, 7, 10, 13], color: '#aa44ff' }, // Tônica omitida
    { name: 'Mu Chord',notes: [0, 2, 4, 7], color: '#ffcc33' }
];

const CHORDS = {};
CHORDS_LIST.forEach(item => CHORDS[item.name] = { notes: item.notes, color: item.color });

let audioCtx, isPowerOn = false, timeOffset = 0, currentOctave = 0, selectedNote = 0;
let lastChordType = 'Maior';

const oscs = COLORS.map((color, i) => ({
    freq: 440, active: false, color, node: null, gainNode: null, canvas: null, ctx: null
}));

// --- LÓGICA DE ENARMONIA AVANÇADA (RESTAURADA) ---
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const NATURAL_MIDI = [0, 2, 4, 5, 7, 9, 11];

function getDiatonicStep(semi, chordType) {
    if (chordType === 'Quartal') return Math.floor(semi / 5) * 3;
    switch(semi) {
        case 0: case 12: return 0;
        case 2: case 13: case 14: case 15: return 1;
        case 3: case 4: return 2;
        case 5: case 18: return 3;
        case 6: case 7: case 8: return 4;
        case 9: return (chordType === 'dim7') ? 6 : 5;
        case 10: case 11: case 20: return 6;
        case 21: return 5;
        default: return 0; 
    }
}

function getNoteSpelling(rootName, selectedNoteMidi, semi, chordType) {
    const baseLetterIdx = LETTERS.indexOf(rootName.charAt(0));
    const stepOffset = getDiatonicStep(semi, chordType);
    const targetStep = (baseLetterIdx + stepOffset) % 7;
    const targetLetter = LETTERS[targetStep];
    const actualMidi = (selectedNoteMidi + semi) % 12;
    let diff = actualMidi - NATURAL_MIDI[targetStep];
    while (diff > 6) diff -= 12;
    while (diff < -6) diff += 12;
    let acc = '';
    if (diff === 1) acc = '♯';
    else if (diff === 2) acc = 'x';
    else if (diff === -1) acc = '♭';
    else if (diff === -2) acc = '♭♭';
    return targetLetter + acc;
}

// --- ÁUDIO ---
function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function togglePower() {
    initAudio();
    isPowerOn = !isPowerOn;
    document.getElementById('power-btn').classList.toggle('on', isPowerOn);
    oscs.forEach((o, i) => isPowerOn && o.active ? startAudio(i) : stopAudio(i));
}

function startAudio(i) {
    stopAudio(i);
    const o = oscs[i];
    o.node = audioCtx.createOscillator();
    o.gainNode = audioCtx.createGain();
    o.node.frequency.value = o.freq;
    o.gainNode.gain.value = 0.08;
    o.node.connect(o.gainNode).connect(audioCtx.destination);
    o.node.start();
}

function stopAudio(i) {
    if (oscs[i].node) {
        try { oscs[i].node.stop(); oscs[i].node.disconnect(); } catch(e) {}
        oscs[i].node = null;
    }
}

function setFreq(i, v, customSpelling = null) {
    const freqFinal = Math.max(27.5, Math.min(4186, v));
    oscs[i].freq = freqFinal;
    const n = Math.round(12 * Math.log2(freqFinal / 440) + 69);
    const octave = Math.floor(n / 12) - 1;
    const noteName = customSpelling || NAMES[(n % 12 + 12) % 12];
    const npEl = document.getElementById(`np-${i}`);
    const nhEl = document.getElementById(`nh-${i}`);
    if (npEl) npEl.textContent = noteName + octave;
    if (nhEl) nhEl.textContent = freqFinal.toFixed(1) + ' Hz';
    if (oscs[i].node && isPowerOn) {
        oscs[i].node.frequency.setTargetAtTime(freqFinal, audioCtx.currentTime, 0.05);
    }
}

function toggleEnharmonics() {
    manualEnharmonic = true;
    useSharps = !useSharps;
    NAMES = useSharps ? NAMES_SHARP : NAMES_FLAT;
    updateKbUI();
    applyChord(lastChordType, true); 
}

function updateKbUI() {
    document.querySelectorAll('.key').forEach((k, i) => k.classList.toggle('active', i === selectedNote));
    const midi = 60 + currentOctave * 12 + selectedNote;
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const octave = Math.floor(midi/12) - 1;
    const noteName = NAMES[selectedNote];
    const displayEl = document.getElementById('note-display');
    if (displayEl) noteName.length > 1 ? displayEl.classList.add('has-accidental') : displayEl.classList.remove('has-accidental');
    document.getElementById('note-text').textContent = noteName + octave;
    document.getElementById('hz-text').textContent = `${freq.toFixed(1)}Hz`;
}

function applyChord(type, skipAuto = false) {
    initAudio();
    lastChordType = type;
    const chordData = CHORDS[type];
    
    if (!skipAuto) {
        NAMES = getPreferredNames(selectedNote);
        useSharps = (NAMES === NAMES_SHARP);
        manualEnharmonic = false;
    }

    document.querySelectorAll('#chord-btns-container .chord-btn').forEach(b => {
        const isActive = b.textContent === type;
        b.classList.toggle('active', isActive);
        // Aplica cor dinâmica no style para o CSS usar currentColor
        if(isActive) b.style.color = chordData.color;
        else b.style.color = '';
    });

    const midiBase = 60 + (currentOctave * 12) + selectedNote;
    const rootFreq = 440 * Math.pow(2, (midiBase - 69) / 12);
    const rootName = NAMES[selectedNote];
    let activeNotesStrings = [];

    // Limpa estados anteriores
    oscs.forEach(o => o.active = false);

    chordData.notes.forEach((semi, i) => {
        if(i < 4) {
            const f = Math.round(rootFreq * Math.pow(2, semi / 12) * 10) / 10;
            const spelling = getNoteSpelling(rootName, selectedNote, semi, type);
            activeNotesStrings.push(spelling);
            
            setFreq(i, f, spelling);
            oscs[i].active = true;
            
            const pill = document.getElementById(`pill-${i}`);
            if (pill) { 

                pill.classList.add('on'); 
            }
            if (isPowerOn) startAudio(i);
        }
    });

    const nameDisplay = document.getElementById('chord-name-display');
    const notesDisplay = document.getElementById('chord-notes-display');
    if (nameDisplay) nameDisplay.innerHTML = `${rootName}<span class="chord-suffix">${type === 'Maior' ? '' : type}</span>`;
    if (notesDisplay) notesDisplay.textContent = activeNotesStrings.join('');
    
    updateKbUI();
}

// --- RENDERIZAÇÃO DOS CARDS ---
const oscRow = document.getElementById('osc-row');
oscs.forEach((osc, i) => {
    const card = document.createElement('div');
    card.className = 'osc-card';
    card.style.setProperty('--osc', osc.color);
    card.innerHTML = `
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
            <span class="osc-name" style="font-size:10px; opacity:0.6;">OSC ${i+1}</span>
            <div class="toggle-pill" id="pill-${i}" onclick="toggleOsc(${i})"></div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin: 5px 0;">
            <span class="note-pitch" id="np-${i}">—</span>
            <span class="note-hz" id="nh-${i}">— Hz</span>
        </div>
        <input type="range" min="27.5" max="4186" step="0.1" value="${osc.freq}" oninput="setFreq(${i},+this.value)" style="width:100%; height:2px; margin:8px 0;">
        <div class="osc-canvas-wrap" style="height:60px; background:#000; border-radius:4px; overflow:hidden;">
            <canvas class="osc-canvas" id="cv-${i}" style="width:100%; height:100%;"></canvas>
        </div>`;
    oscRow.appendChild(card);
    osc.canvas = document.getElementById(`cv-${i}`);
    osc.ctx = osc.canvas.getContext('2d');
});

function toggleOsc(i) {
    initAudio();
    oscs[i].active = !oscs[i].active;
    const pill = document.getElementById(`pill-${i}`);
    if(pill) pill.classList.toggle('on', oscs[i].active);
    if (isPowerOn) oscs[i].active ? startAudio(i) : stopAudio(i);
}

// --- VISUALIZAÇÃO ---
const sumCanvas = document.getElementById('sum-canvas');
const sumCtx = sumCanvas.getContext('2d');

function sizeCanvases() {
    sumCanvas.width = sumCanvas.clientWidth; 
    sumCanvas.height = sumCanvas.clientHeight;
    oscs.forEach(o => { 
        if(o.canvas){ 
            o.canvas.width = o.canvas.clientWidth; 
            o.canvas.height = o.canvas.clientHeight; 
        }
    });
}

function animate() {
    const sliderVal = +document.getElementById('unified-slider').value;
    const zoom = 0.000002 * Math.pow(1.1, 80 + ((100 - sliderVal) * 0.2)); 
    document.getElementById('tb-val').textContent = Math.round(sliderVal);

    // 1. Renderiza os mini-osciladores nos cards
    oscs.forEach(osc => {
        if(osc.ctx && osc.canvas.width > 0) {
            const cx = osc.ctx, W = osc.canvas.width, H = osc.canvas.height;
            cx.clearRect(0, 0, W, H);
            if(osc.active) {
                cx.beginPath(); cx.strokeStyle = osc.color; cx.lineWidth = 2;
                for(let x = 0; x < W; x++){
                    const t = (timeOffset + x) * (1 / (zoom * 1000000));
                    const y = Math.sin(2 * Math.PI * osc.freq * t) * (H * 0.35) + H / 2;
                    x === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y);
                }
                cx.stroke();
            }
        }
    });

    // 2. Renderiza o Gráfico de Soma Principal
    if(sumCanvas.width > 0) {
        const SW = sumCanvas.width, SH = sumCanvas.height;
        sumCtx.clearRect(0, 0, SW, SH);
        const actives = oscs.filter(o => o.active);
        
        if(actives.length > 0) {
            // --- CAMADA DE FUNDO: Linhas individuais (fantasma) ---
            actives.forEach(osc => {
                sumCtx.globalAlpha = 0.2; // Opacidade baixa para o fundo
                sumCtx.beginPath();
                sumCtx.strokeStyle = osc.color;
                sumCtx.lineWidth = 1.5;
                for(let x = 0; x < SW; x++){
                    const t = (timeOffset + x) * (1 / (zoom * 1000000));
                    // Amplitude ligeiramente menor para as linhas de fundo
                    const y = Math.sin(2 * Math.PI * osc.freq * t) * (SH * 0.25) + SH / 2;
                    x === 0 ? sumCtx.moveTo(x, y) : sumCtx.lineTo(x, y);
                }
                sumCtx.stroke();
            });

            // --- CAMADA DE TOPO: Resultado da Soma ---
            sumCtx.globalAlpha = 1.0; // Opacidade total para a soma
            sumCtx.beginPath();
            sumCtx.strokeStyle = '#fff';
            sumCtx.lineWidth = 3;
            // Efeito de brilho sutil na linha principal
            sumCtx.shadowBlur = 8;
            sumCtx.shadowColor = 'rgba(255, 255, 255, 0.4)';

            for(let x = 0; x < SW; x++){
                const t = (timeOffset + x) * (1 / (zoom * 1000000));
                let total = 0;
                actives.forEach(osc => total += Math.sin(2 * Math.PI * osc.freq * t));
                const y = (total / actives.length) * (SH * 0.35) + SH / 2;
                x === 0 ? sumCtx.moveTo(x, y) : sumCtx.lineTo(x, y);
            }
            sumCtx.stroke();
            sumCtx.shadowBlur = 0; // Limpa o brilho para o próximo frame
        }
    }
    timeOffset += 2.0; 
    requestAnimationFrame(animate);
}

// --- INICIALIZAÇÃO DE ACORDES COM CORES ---
const chordContainer = document.getElementById('chord-btns-container');
chordContainer.innerHTML = ''; // Limpa antes de gerar

CHORDS_LIST.forEach(chord => {
    const btn = document.createElement('button');
    btn.className = 'chord-btn';
    // Define o nome e as cores baseadas na lista de acordes
    btn.innerHTML = chord.name.replace('(', '<small>(').replace(')', ')</small>');
    btn.style.color = chord.color;
    btn.style.borderColor = chord.color + '44'; // Borda sutil inicial
    
    btn.onclick = () => applyChord(chord.name);
    chordContainer.appendChild(btn);
});

function buildKeyboard() {
    const kb = document.getElementById('keyboard');
    kb.innerHTML = '';
    for (let i = 0; i < 12; i++) {
        const isBlack = [1, 3, 6, 8, 10].includes(i);
        const k = document.createElement('div');
        k.className = `key ${isBlack ? 'black' : 'white'}`;
        k.onclick = () => { selectedNote = i; applyChord(lastChordType); };
        kb.appendChild(k);
    }
}

function changeOctave(d) {
    currentOctave = Math.max(-4, Math.min(4, currentOctave + d));
    applyChord(lastChordType);
}

buildKeyboard();
window.addEventListener('resize', sizeCanvases);
setTimeout(() => { sizeCanvases(); applyChord('Maior'); }, 100);
animate();
