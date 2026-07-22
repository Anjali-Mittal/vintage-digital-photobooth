import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useBooth } from "../context/BoothContext";
import { Download, RotateCcw } from "lucide-react";

const GOLD     = "#d4a028";
const GOLD_DIM = "#9a8050";
const CREAM    = "#f2e8cc";
const CARD     = "#231f1b";
const BORDER   = "rgba(212,160,40,0.2)";

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

/* ── Film Strip ── */
async function drawFilmStrip(canvas: HTMLCanvasElement, photos: string[]) {
  const SW = 280, SZ = 28, FP = 8;
  const PW = SW - SZ * 2 - FP * 2;
  const PH = Math.round(PW * 0.75);
  const GAP = 6, TL = 30, BL = 30;
  const SH = TL + (PH + GAP) * photos.length - GAP + BL;
  canvas.width = SW; canvas.height = SH;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#080501"; ctx.fillRect(0, 0, SW, SH);
  ctx.fillStyle = "#0d0903";
  ctx.fillRect(0, 0, SZ, SH);
  ctx.fillRect(SW - SZ, 0, SZ, SH);
  ctx.strokeStyle = "#2a1a08"; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(SZ, 0); ctx.lineTo(SZ, SH);
  ctx.moveTo(SW - SZ, 0); ctx.lineTo(SW - SZ, SH);
  ctx.stroke();

  ctx.fillStyle = "#d4a028"; ctx.font = "bold 9px 'Space Mono',monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("KODAK GOLD 400", SW / 2, 15);
  ctx.fillStyle = "#8a6030"; ctx.font = "7px 'Space Mono',monospace";
  ctx.fillText(`ROLL 001 · ${new Date().getFullYear()}`, SW / 2, SH - 15);

  // Rectangular sprocket holes (2 per frame per side, real film look)
  const hW = 9, hH = 13, hRad = 1.5;
  const sX = [SZ / 2, SW - SZ / 2];
  function roundRect(cx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    cx.beginPath();
    cx.moveTo(x + r, y); cx.lineTo(x + w - r, y);
    cx.quadraticCurveTo(x + w, y, x + w, y + r);
    cx.lineTo(x + w, y + h - r);
    cx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    cx.lineTo(x + r, y + h);
    cx.quadraticCurveTo(x, y + h, x, y + h - r);
    cx.lineTo(x, y + r);
    cx.quadraticCurveTo(x, y, x + r, y);
    cx.closePath();
  }
  for (let fi = 0; fi < photos.length; fi++) {
    const frameTop = TL + fi * (PH + GAP);
    const holeYs = [frameTop + PH * 0.28, frameTop + PH * 0.72];
    for (const sx of sX) {
      for (const hy of holeYs) {
        roundRect(ctx, sx - hW / 2, hy - hH / 2, hW, hH, hRad);
        ctx.fillStyle = "#080501"; ctx.fill();
        ctx.strokeStyle = "#3a2810"; ctx.lineWidth = 0.5; ctx.stroke();
      }
    }
  }

  const images = await Promise.all(photos.map(loadImage));
  const px = SZ + FP;
  for (let i = 0; i < images.length; i++) {
    const py = TL + i * (PH + GAP);
    ctx.fillStyle = "#1a1005"; ctx.fillRect(px - 2, py - 2, PW + 4, PH + 4);
    ctx.drawImage(images[i], px, py, PW, PH);
    ctx.fillStyle = "rgba(212,160,40,0.55)"; ctx.font = "7px 'Space Mono',monospace";
    ctx.textAlign = "right"; ctx.textBaseline = "bottom";
    ctx.fillText(`${i + 1}`, px + PW - 3, py + PH - 2);
  }
}

/* ── Classic Print (replaces Polaroid) ── */
async function drawClassicPrint(canvas: HTMLCanvasElement, photos: string[]) {
  const W = 200, MARGIN = 10, GAP = 6;
  const PW = W - MARGIN * 2;
  const PH = Math.round(PW * 0.75);
  const HEADER = 38, FOOTER = 34;
  const H = HEADER + (PH + GAP) * photos.length - GAP + FOOTER;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Cream paper background
  ctx.fillStyle = "#f5edd8"; ctx.fillRect(0, 0, W, H);

  // Subtle paper texture lines
  ctx.strokeStyle = "rgba(180,160,120,0.18)"; ctx.lineWidth = 0.5;
  for (let y = 0; y < H; y += 6) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Header
  ctx.fillStyle = "#1e1810"; ctx.font = "bold 11px 'Special Elite',serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("★  PHOTO BOOTH  ★", W / 2, 14);
  ctx.strokeStyle = "#c8a860"; ctx.lineWidth = 0.75;
  ctx.beginPath(); ctx.moveTo(MARGIN, 22); ctx.lineTo(W - MARGIN, 22); ctx.stroke();
  ctx.fillStyle = "#9a7840"; ctx.font = "6px 'Space Mono',monospace";
  ctx.fillText("EST. 1972 · GENUINE STRIP", W / 2, 30);

  // Photos
  const images = await Promise.all(photos.map(loadImage));
  for (let i = 0; i < images.length; i++) {
    const y = HEADER + i * (PH + GAP);
    // Slight drop shadow
    ctx.shadowColor = "rgba(0,0,0,0.18)"; ctx.shadowBlur = 4; ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
    ctx.fillStyle = "#e8dfc8"; ctx.fillRect(MARGIN - 1, y - 1, PW + 2, PH + 2);
    ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
    ctx.drawImage(images[i], MARGIN, y, PW, PH);
    // Frame number badge
    ctx.fillStyle = "rgba(30,24,16,0.65)"; ctx.fillRect(MARGIN, y, 16, 10);
    ctx.fillStyle = "#d4a028"; ctx.font = "bold 6px 'Space Mono',monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(String(i + 1), MARGIN + 8, y + 5);
  }

  // Footer
  const footerY = HEADER + photos.length * (PH + GAP) - GAP + 6;
  ctx.strokeStyle = "#c8a860"; ctx.lineWidth = 0.75;
  ctx.beginPath(); ctx.moveTo(MARGIN, footerY); ctx.lineTo(W - MARGIN, footerY); ctx.stroke();
  ctx.fillStyle = "#9a7840"; ctx.font = "7px 'Space Mono',monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), W / 2, footerY + 10);
  ctx.fillStyle = "#c8a860"; ctx.font = "6px 'Space Mono',monospace";
  ctx.fillText("ROLL 001", W / 2, footerY + 22);
}

/* ── Contact Sheet ── */
async function drawContactSheet(canvas: HTMLCanvasElement, photos: string[]) {
  const COLS = 3, CW = 120, CH = 90, PAD = 8, LH = 28, FH = 20;
  const ROWS = Math.ceil(photos.length / COLS);
  const W = COLS * CW + (COLS + 1) * PAD;
  const H = LH + ROWS * CH + (ROWS + 1) * PAD + FH;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#100e0c"; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#1e1a16"; ctx.fillRect(0, 0, W, LH);
  ctx.strokeStyle = "#3a3020"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, LH); ctx.lineTo(W, LH); ctx.stroke();
  ctx.fillStyle = "#d4a028"; ctx.font = "bold 9px 'Space Mono',monospace";
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText("CONTACT SHEET", PAD, LH / 2);
  ctx.fillStyle = "#9a8050"; ctx.font = "7px 'Space Mono',monospace";
  ctx.textAlign = "right";
  ctx.fillText(`ROLL 001 · ${photos.length} FRAMES`, W - PAD, LH / 2);

  const images = await Promise.all(photos.map(loadImage));
  for (let i = 0; i < images.length; i++) {
    const col = i % COLS, row = Math.floor(i / COLS);
    const x = PAD + col * (CW + PAD), y = LH + PAD + row * (CH + PAD);
    ctx.strokeStyle = "#3a3020"; ctx.lineWidth = 1; ctx.strokeRect(x, y, CW, CH);
    ctx.drawImage(images[i], x + 1, y + 1, CW - 2, CH - 2);
    ctx.fillStyle = "rgba(212,160,40,0.88)"; ctx.fillRect(x + 1, y + 1, 16, 11);
    ctx.fillStyle = "#100e0c"; ctx.font = "bold 7px 'Space Mono',monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(String(i + 1), x + 9, y + 7);
  }

  ctx.fillStyle = "#3a3020"; ctx.font = "6px 'Space Mono',monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("★ PHOTO BOOTH ★", W / 2, H - FH / 2);
}

const DRAW_FNS = { film: drawFilmStrip, classic: drawClassicPrint, contact: drawContactSheet };
const LABELS: Record<string, string> = { film: "Film Strip", classic: "Classic Print", contact: "Contact Sheet" };

export default function Result() {
  const navigate = useNavigate();
  const { photos, stripType, clearPhotos } = useBooth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendered, setRendered] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!photos.length || !canvasRef.current) return;
    setRendered(false);
    const key = (stripType === "polaroid" ? "classic" : stripType) as keyof typeof DRAW_FNS;
    DRAW_FNS[key](canvasRef.current, photos)
      .then(() => setRendered(true))
      .catch(console.error);
  }, [photos, stripType]);

  if (!photos.length) { navigate("/"); return null; }

  function handleDownload() {
    if (!canvasRef.current || !rendered || downloading) return;
    setDownloading(true);
    const a = document.createElement("a");
    a.download = `photobooth-${stripType}-${Date.now()}.png`;
    a.href = canvasRef.current.toDataURL("image/png");
    a.click();
    setTimeout(() => setDownloading(false), 1000);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 gap-6">
      <div className="text-center">
        <h2 style={{ fontFamily:"'Special Elite',serif", color: CREAM, fontSize:"1.75rem" }}>
          Your Strip
        </h2>
        <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.65rem", letterSpacing:"0.2em", color: GOLD_DIM, marginTop:4 }}>
          {LABELS[stripType === "polaroid" ? "classic" : stripType]} — {photos.length} EXPOSURES
        </p>
      </div>

      {/* Canvas */}
      <div style={{
        background: CARD, padding: 16,
        border: `1px solid ${BORDER}`,
        boxShadow: "0 0 40px rgba(0,0,0,0.7), 0 0 80px rgba(0,0,0,0.4)",
        position:"relative", maxWidth:"90vw",
      }}>
        {!rendered && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.65rem", color: GOLD_DIM, letterSpacing:"0.15em" }}>
              Developing...
            </p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          style={{
            display:"block", maxHeight:"65vh", maxWidth:"100%",
            opacity: rendered ? 1 : 0, transition:"opacity 0.5s ease",
          }}
        />
      </div>

      {/* Actions */}
      <div style={{ display:"flex", gap:10, width:"100%", maxWidth:280 }}>
        <button
          onClick={() => { clearPhotos(); navigate("/"); }}
          style={{
            flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
            padding:"11px 0",
            fontFamily:"'Space Mono',monospace", fontSize:"0.65rem", letterSpacing:"0.15em",
            background:"transparent", color: GOLD_DIM,
            border:`1px solid rgba(212,160,40,0.3)`, cursor:"pointer",
          }}
        >
          <RotateCcw size={13} /> RETAKE
        </button>
        <button
          onClick={handleDownload}
          disabled={!rendered || downloading}
          style={{
            flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
            padding:"11px 0",
            fontFamily:"'Space Mono',monospace", fontSize:"0.65rem", letterSpacing:"0.15em",
            background: rendered ? `linear-gradient(135deg,${GOLD},#b08018)` : "#2e2820",
            color: rendered ? "#181614" : GOLD_DIM,
            border:`1px solid ${rendered ? "#e0b838" : "rgba(212,160,40,0.2)"}`,
            boxShadow: rendered ? "0 2px 0 #7a5808, 0 4px 12px rgba(212,160,40,0.3)" : "none",
            cursor: rendered ? "pointer" : "not-allowed", opacity: downloading ? 0.6 : 1,
          }}
        >
          <Download size={13} /> {downloading ? "SAVING..." : "DOWNLOAD"}
        </button>
      </div>

      <button
        onClick={() => navigate("/strips")}
        style={{
          fontFamily:"'Space Mono',monospace", fontSize:"0.6rem", letterSpacing:"0.18em",
          color:"rgba(154,128,80,0.45)", background:"none", border:"none", cursor:"pointer",
        }}
      >
        ← CHANGE LAYOUT
      </button>
    </div>
  );
}
