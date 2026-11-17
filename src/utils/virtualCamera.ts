/**
 * Captures the rendered canvas inside a 3D/2D universe stage, composites a
 * romantic velvet-and-gold frame around it, and returns a compact JPEG data URL
 * ready to persist in the couple's Photo Gallery + Cloud Firestore subcollection.
 */
export function captureCanvasSnapshotWithFrame(
  containerEl: HTMLElement | null,
  sceneTitle: string,
  subtitle: string
): { dataUrl: string; aspect: 'landscape' | 'square' } | null {
  if (!containerEl || typeof document === 'undefined') return null;

  const sourceCanvas = containerEl.querySelector('canvas');
  if (!sourceCanvas || sourceCanvas.width === 0 || sourceCanvas.height === 0) {
    return null;
  }

  try {
    const outW = 840;
    const headerPad = 24;
    const sidePad = 24;
    const footerH = 92;
    const ratio = sourceCanvas.height / Math.max(1, sourceCanvas.width);
    const innerW = outW - sidePad * 2;
    const innerH = Math.min(640, Math.max(420, Math.round(innerW * ratio)));
    const outH = headerPad + innerH + footerH;

    const outCanvas = document.createElement('canvas');
    outCanvas.width = outW;
    outCanvas.height = outH;
    const ctx = outCanvas.getContext('2d');
    if (!ctx) return null;

    // Deep romantic velvet background
    const bgGrad = ctx.createLinearGradient(0, 0, outW, outH);
    bgGrad.addColorStop(0, '#130526');
    bgGrad.addColorStop(0.55, '#0b0218');
    bgGrad.addColorStop(1, '#1b0734');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, outW, outH);

    // Subtle rose-gold outer border
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.55)';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, outW - 20, outH - 20);

    // Inner photo viewport
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(sidePad, headerPad, innerW, innerH, 20);
    ctx.clip();
    ctx.drawImage(sourceCanvas, sidePad, headerPad, innerW, innerH);
    ctx.restore();

    // Inner frame stroke
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(sidePad, headerPad, innerW, innerH, 20);
    ctx.stroke();

    // Bottom caption bar
    ctx.fillStyle = '#fbcfe8';
    ctx.font = '700 22px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(`Nosso Mundo ♡ — ${sceneTitle}`, sidePad + 4, headerPad + innerH + 40);

    ctx.fillStyle = 'rgba(216, 180, 254, 0.85)';
    ctx.font = '500 15px "Plus Jakarta Sans", system-ui, sans-serif';
    const dateLabel = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    ctx.fillText(`${subtitle} · ${dateLabel}`, sidePad + 4, headerPad + innerH + 68);

    const dataUrl = outCanvas.toDataURL('image/jpeg', 0.82);
    return {
      dataUrl,
      aspect: innerW > innerH * 1.15 ? 'landscape' : 'square',
    };
  } catch (err) {
    console.warn('Falha ao capturar foto virtual:', err);
    return null;
  }
}
