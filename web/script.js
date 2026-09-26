const canvas = document.getElementById('animationCanvas');
const ctx = canvas.getContext('2d');
const textInput = document.getElementById('textInput');
const fontColor = document.getElementById('fontColor');
const bgColor = document.getElementById('bgColor');
const fontSize = document.getElementById('fontSize');
const animationSpeed = document.getElementById('animationSpeed');
const animationStyle = document.getElementById('animationStyle');
const confettiToggle = document.getElementById('confetti');
const playBtn = document.getElementById('playBtn');
const downloadBtn = document.getElementById('downloadBtn');
const confettiContainer = document.getElementById('confettiContainer');

let animationStart = performance.now();
let isPlaying = true;
let recordedChunks = [];

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function speedLabel(value) {
  return value < 1 ? 'Lenta' : value > 1 ? 'Rápida' : 'Normal';
}

function drawText(now) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = bgColor.value;
  ctx.fillRect(0, 0, width, height);

  const elapsed = ((now - animationStart) / 1000) * Number(animationSpeed.value);
  const progress = Math.min(elapsed / 1.2, 1);
  const style = animationStyle.value;
  const size = Math.min(Number(fontSize.value), width / 5);
  let opacity = 1, x = width / 2, y = height / 2, rotation = 0, scale = 1;

  if (style === 'fadeIn') opacity = progress;
  if (style === 'slideLeft') x = width / 2 - (1 - progress) * width;
  if (style === 'slideRight') x = width / 2 + (1 - progress) * width;
  if (style === 'slideDown') y = height / 2 - (1 - progress) * height;
  if (style === 'bounce') y = height / 2 - Math.abs(Math.sin(progress * Math.PI * 3)) * 35;
  if (style === 'rotate') rotation = (1 - progress) * Math.PI * 2;
  if (style === 'pulse') scale = 1 + Math.sin(elapsed * 5) * .08;

  const text = textInput.value || 'Escribe tu mensaje';
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);
  ctx.globalAlpha = opacity;
  ctx.fillStyle = fontColor.value;
  ctx.font = `800 ${size}px Inter, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,.35)';
  ctx.shadowBlur = 14;
  if (style === 'typeWriter') {
    const chars = Math.max(1, Math.floor(text.length * progress));
    ctx.fillText(text.slice(0, chars), 0, 0);
  } else {
    ctx.fillText(text, 0, 0);
  }
  ctx.restore();
}

function spawnConfetti() {
  if (!confettiToggle.checked) return;
  const colors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#c77dff'];
  confettiContainer.innerHTML = '';
  for (let i = 0; i < 42; i++) {
    const piece = document.createElement('i');
    piece.className = 'confetti';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.top = `${Math.random() * 15}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDuration = `${2 + Math.random() * 2}s`;
    piece.style.animationDelay = `${Math.random() * .5}s`;
    confettiContainer.appendChild(piece);
  }
}

function loop(now) {
  drawText(now);
  requestAnimationFrame(loop);
}

fontSize.addEventListener('input', () => document.getElementById('fontSizeValue').textContent = `${fontSize.value}px`);
animationSpeed.addEventListener('input', () => document.getElementById('animationSpeedValue').textContent = speedLabel(Number(animationSpeed.value)));
[ textInput, fontColor, bgColor, animationStyle ].forEach(input => input.addEventListener('input', () => { animationStart = performance.now(); }));
playBtn.addEventListener('click', () => {
  isPlaying = !isPlaying;
  if (isPlaying) { animationStart = performance.now(); spawnConfetti(); playBtn.textContent = '⏸ Pausar'; }
  else playBtn.textContent = '▶ Reproducir';
});

downloadBtn.addEventListener('click', () => {
  if (!canvas.captureStream || !window.MediaRecorder) {
    alert('Tu navegador no permite exportar video. Puedes ver la previsualización normalmente.');
    return;
  }
  downloadBtn.disabled = true;
  downloadBtn.textContent = '⏺ Grabando 5 segundos...';
  recordedChunks = [];
  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  recorder.ondataavailable = event => event.data.size && recordedChunks.push(event.data);
  recorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'texto-animado.webm';
    link.click();
    URL.revokeObjectURL(url);
    downloadBtn.disabled = false;
    downloadBtn.textContent = '⬇ Descargar Video';
  };
  animationStart = performance.now();
  recorder.start();
  setTimeout(() => recorder.stop(), 5000);
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
spawnConfetti();
playBtn.textContent = '⏸ Pausar';
requestAnimationFrame(loop);
