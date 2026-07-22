import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useBooth, FILTERS, getRoomFromStorage, saveRoomToStorage } from "../context/BoothContext";
import { Camera, Zap } from "lucide-react";
import { RoomConnection, RoomMsg, compressPhoto } from "../utils/mqttRoom";

const GOLD = "#d4a028"; const GOLD_DIM = "#9a8050"; const CREAM = "#f2e8cc";
const DEEP = "#0e0c0a"; const BODY = "#1a1714"; const BORDER = "rgba(212,160,40,0.22)";

const filterBg: Record<string, string> = {
  natural: "linear-gradient(135deg,#5a7858,#3a5870)",
  noir:    "linear-gradient(135deg,#888,#444)",
  sepia:   "linear-gradient(135deg,#c4a17a,#8b6040)",
  warm:    "linear-gradient(135deg,#e8b870,#c07030)",
  vintage: "linear-gradient(135deg,#c8a880,#907050)",
};

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

/* Circular countdown ring SVG */
function CountdownRing({ seconds, total, label }: { seconds: number; total: number; label?: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const progress = total > 0 ? seconds / total : 0;
  const dash = circ * progress;
  return (
    <div style={{ position:"relative", width:80, height:80, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <svg width={80} height={80} style={{ position:"absolute", inset:0, transform:"rotate(-90deg)" }}>
        <circle cx={40} cy={40} r={r} fill="none" stroke="rgba(212,160,40,0.15)" strokeWidth={5} />
        <circle cx={40} cy={40} r={r} fill="none" stroke={GOLD} strokeWidth={5}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition:"stroke-dasharray 0.3s linear" }} />
      </svg>
      <div style={{ textAlign:"center", zIndex:1 }}>
        <div style={{ fontFamily:"'Special Elite',serif", fontSize:"1.6rem", color: GOLD, lineHeight:1 }}>{seconds}</div>
        {label && <div style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.42rem", color: GOLD_DIM, letterSpacing:"0.15em" }}>{label}</div>}
      </div>
    </div>
  );
}

export default function Booth() {
  const navigate = useNavigate();
  const { mode, photoCount, myId, myName, members, currentTurn, setCurrentTurn,
    selectedFilter, setSelectedFilter, photos, addPhoto, roomCode,
    autoMode, autoInterval } = useBooth();

  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const channelRef  = useRef<BroadcastChannel | null>(null);
  const mqttRef     = useRef<RoomConnection | null>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const autoAbort   = useRef(false);
  const isCapRef    = useRef(false);

  const [camErr,       setCamErr]       = useState(false);
  const [isCapturing,  setIsCapturing]  = useState(false);
  const [isFlashing,   setIsFlashing]   = useState(false);
  const [localPhotos,  setLocalPhotos]  = useState<string[]>([...photos]);
  const [countdown,    setCountdown]    = useState<number | null>(null);   // 3-2-1 pre-shot
  const [autoTick,     setAutoTick]     = useState<number | null>(null);   // auto interval countdown
  const [autoRunning,  setAutoRunning]  = useState(false);

  const filterCss   = FILTERS.find(f => f.id === selectedFilter)?.css ?? "none";
  const isMyTurn    = mode === "solo" || (members.length > 0 && members[currentTurn]?.id === myId);
  const currentName = mode === "room" && members.length > 0 ? members[currentTurn]?.name : myName;

  /* camera */
  useEffect(() => {
    let mounted = true;
    navigator.mediaDevices.getUserMedia({ video:{ facingMode:"user", width:{ideal:640}, height:{ideal:480} }, audio:false })
      .then(stream => {
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(()=>{}); }
      })
      .catch(() => { if (mounted) setCamErr(true); });
    return () => {
      mounted = false;
      autoAbort.current = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  /* room channel (same-browser BroadcastChannel) */
  useEffect(() => {
    if (mode !== "room" || !roomCode) return;
    try {
      const ch = new BroadcastChannel(`pb_room_${roomCode}`);
      channelRef.current = ch;
      ch.onmessage = e => {
        if (e.data.type === "PHOTO_ADDED") {
          addPhoto(e.data.photo);
          setLocalPhotos(prev => [...prev, e.data.photo]);
          setCurrentTurn(e.data.nextTurn);
          if (e.data.done) setTimeout(() => navigate("/strips"), 700);
        }
      };
    } catch {}
    return () => { channelRef.current?.close(); channelRef.current = null; };
  }, [mode, roomCode]);

  /* MQTT room connection */
  useEffect(() => {
    if (mode !== "room" || !roomCode) return;
    const conn = new RoomConnection(
      roomCode,
      (msg: RoomMsg) => {
        if (msg.type === "PHOTO_ADDED") {
          addPhoto(msg.photo);
          setLocalPhotos(prev => [...prev, msg.photo]);
          setCurrentTurn(msg.nextTurn);
          if (msg.done) setTimeout(() => navigate("/strips"), 700);
        }
      },
      () => {},
    );
    mqttRef.current = conn;
    return () => { conn.disconnect(); mqttRef.current = null; };
  }, [mode, roomCode]);

  /* core capture: take one photo, returns the dataUrl */
  const doCapture = useCallback(async (): Promise<string | null> => {
    if (!videoRef.current || !canvasRef.current) return null;
    setIsFlashing(true); await sleep(140); setIsFlashing(false);
    const video = videoRef.current, canvas = canvasRef.current;
    const W = video.videoWidth || 640, H = video.videoHeight || 480;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    ctx.save(); ctx.translate(W, 0); ctx.scale(-1, 1);
    if (filterCss !== "none") ctx.filter = filterCss;
    ctx.drawImage(video, 0, 0, W, H);
    ctx.restore();
    return canvas.toDataURL("image/jpeg", 0.9);
  }, [filterCss]);

  /* publish photo to room */
  const publishPhoto = useCallback(async (dataUrl: string, nextPhotos: string[], nextTurn: number, done: boolean) => {
    const compressed = await compressPhoto(dataUrl);
    const payload: RoomMsg = { type: "PHOTO_ADDED", photo: compressed, nextTurn, done };
    channelRef.current?.postMessage(payload);
    mqttRef.current?.publish(payload);
    const r = getRoomFromStorage(roomCode);
    if (r) saveRoomToStorage({ ...r, photos: nextPhotos, currentTurn: nextTurn, status: done ? "done" : "shooting" });
  }, [roomCode]);

  /* single manual shot */
  const captureOnce = useCallback(async (currentList: string[]): Promise<string[]> => {
    // 3-2-1 countdown
    for (let i = 3; i >= 1; i--) { setCountdown(i); await sleep(900); }
    setCountdown(null);
    const dataUrl = await doCapture();
    if (!dataUrl) return currentList;
    const newList = [...currentList, dataUrl];
    setLocalPhotos(newList); addPhoto(dataUrl);
    const done = newList.length >= photoCount;
    if (mode === "room") {
      const nextTurn = (currentTurn + 1) % Math.max(members.length, 1);
      setCurrentTurn(nextTurn);
      await publishPhoto(dataUrl, newList, nextTurn, done);
    }
    return newList;
  }, [doCapture, addPhoto, photoCount, mode, currentTurn, members, publishPhoto]);

  /* auto capture loop */
  const startAutoSession = useCallback(async (startList: string[]) => {
    autoAbort.current = false;
    setAutoRunning(true);
    let list = startList;
    while (list.length < photoCount && !autoAbort.current) {
      // countdown ring
      for (let t = autoInterval; t >= 1; t--) {
        if (autoAbort.current) break;
        setAutoTick(t);
        await sleep(1000);
      }
      if (autoAbort.current) break;
      setAutoTick(null);
      // flash + capture
      setIsFlashing(true); await sleep(140); setIsFlashing(false);
      const dataUrl = await doCapture();
      if (!dataUrl || autoAbort.current) break;
      list = [...list, dataUrl];
      setLocalPhotos(list); addPhoto(dataUrl);
      const done = list.length >= photoCount;
      if (mode === "room") {
        const nextTurn = (currentTurn + 1) % Math.max(members.length, 1);
        setCurrentTurn(nextTurn);
        await publishPhoto(dataUrl, list, nextTurn, done);
      }
      if (done) break;
    }
    setAutoTick(null);
    setAutoRunning(false);
    isCapRef.current = false;
    setIsCapturing(false);
  }, [doCapture, addPhoto, photoCount, autoInterval, mode, currentTurn, members, publishPhoto]);

  const handleShutter = useCallback(async () => {
    if (isCapRef.current || camErr || (!isMyTurn && mode === "room") || localPhotos.length >= photoCount) return;
    isCapRef.current = true; setIsCapturing(true);

    if (autoMode) {
      await startAutoSession(localPhotos);
    } else {
      const newList = await captureOnce(localPhotos);
      isCapRef.current = false; setIsCapturing(false);
      if (newList.length >= photoCount) { await sleep(400); navigate("/strips"); }
    }

    if (!autoMode) { /* navigation handled above */ }
    else if (localPhotos.length >= photoCount || autoAbort.current) {
      await sleep(400); navigate("/strips");
    }
  }, [isCapturing, camErr, isMyTurn, mode, localPhotos, photoCount, autoMode, startAutoSession, captureOnce]);

  // After autoRunning ends, navigate if done
  useEffect(() => {
    if (!autoRunning && localPhotos.length >= photoCount && photoCount > 0) {
      setTimeout(() => navigate("/strips"), 400);
    }
  }, [autoRunning, localPhotos.length, photoCount]);

  const remaining  = photoCount - localPhotos.length;
  const canShoot   = !isCapturing && !camErr && isMyTurn && remaining > 0 && !autoRunning;
  const shootLabel = autoMode && !autoRunning ? "START AUTO" : autoRunning ? "RUNNING..." : "SHOOT";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-3 py-5"
      style={{ background:"radial-gradient(ellipse at 50% 40%, #201c18 0%, #181614 70%)" }}>

      {/* flash */}
      {isFlashing && <div style={{ position:"fixed", inset:0, zIndex:50, background:"rgba(255,252,240,0.92)", pointerEvents:"none" }} />}

      {/* header */}
      <div style={{ width:"100%", maxWidth:520, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:6 }}>
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"clamp(0.5rem, 2vw, 0.6rem)", letterSpacing:"0.22em", color: GOLD_DIM }}>
          FRAME {String(localPhotos.length + 1).padStart(2,"0")} / {String(photoCount).padStart(2,"0")}
        </span>
        {mode === "room" && (
          <div style={{
            fontFamily:"'Space Mono',monospace", fontSize:"clamp(0.5rem,2vw,0.6rem)", letterSpacing:"0.12em", padding:"4px 10px",
            background: isMyTurn ? "rgba(212,160,40,0.12)" : "rgba(0,0,0,0.3)",
            border:`1px solid ${isMyTurn ? "rgba(212,160,40,0.4)" : "rgba(212,160,40,0.1)"}`,
            color: isMyTurn ? GOLD : GOLD_DIM,
          }}>
            {isMyTurn ? "YOUR TURN" : `${currentName?.toUpperCase()}'S TURN`}
          </div>
        )}
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"clamp(0.5rem, 2vw, 0.6rem)", letterSpacing:"0.22em", color: GOLD_DIM }}>
          {remaining} LEFT
        </span>
      </div>

      {/* camera viewport */}
      <div style={{
        position:"relative", width:"100%", maxWidth:520, aspectRatio:"4/3",
        background: DEEP,
        border:`3px solid #2a2018`,
        boxShadow:`0 0 0 1px ${BORDER}, 0 8px 40px rgba(0,0,0,0.8), inset 0 0 40px rgba(0,0,0,0.5)`,
        overflow:"hidden",
      }}>
        {/* sprocket strips top/bottom */}
        {(["top","bottom"] as const).map(side => (
          <div key={side} style={{
            position:"absolute", [side]:0, left:0, right:0, height:18, zIndex:10,
            background:"#100e0c",
            borderTop: side === "bottom" ? "1px solid #2a2018" : "none",
            borderBottom: side === "top" ? "1px solid #2a2018" : "none",
            display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 6px", gap:3,
          }}>
            {Array.from({length:14}).map((_,i) => (
              <div key={i} style={{ flex:1, maxWidth:18, height:10, borderRadius:2, background:"#1e1a14", border:"0.5px solid #2e2818" }} />
            ))}
          </div>
        ))}

        {/* video */}
        {camErr ? (
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
            <Camera size={36} style={{ color: GOLD_DIM, opacity:0.3 }} />
            <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.6rem", color: GOLD_DIM, textAlign:"center", lineHeight:1.6 }}>
              Camera access denied.<br />Allow camera in browser settings.
            </p>
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted style={{
            position:"absolute", left:0, right:0, top:18, bottom:18,
            width:"100%", height:"calc(100% - 36px)", objectFit:"cover",
            filter: filterCss !== "none" ? filterCss : undefined,
            transform:"scaleX(-1)",
          }} />
        )}

        {/* 3-2-1 countdown overlay */}
        {countdown !== null && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:20,
            background:"rgba(0,0,0,0.35)", pointerEvents:"none" }}>
            <span style={{ fontFamily:"'Special Elite',serif", fontSize:"clamp(3rem,12vw,5.5rem)", color: GOLD,
              textShadow:`0 0 30px rgba(212,160,40,0.8)`, animation:"boothPulse 0.85s ease-out" }}>
              {countdown}
            </span>
          </div>
        )}

        {/* auto countdown ring overlay */}
        {autoTick !== null && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:20,
            background:"rgba(0,0,0,0.45)", pointerEvents:"none" }}>
            <CountdownRing seconds={autoTick} total={autoInterval} label="NEXT SHOT" />
          </div>
        )}

        {/* corner brackets */}
        {([["top-4 left-2",true,true],["top-4 right-2",true,false],["bottom-4 left-2",false,true],["bottom-4 right-2",false,false]] as const).map(([p,t,l]) => (
          <div key={p} className={`absolute ${p}`} style={{
            width:16, height:16, zIndex:11,
            borderTop: t ? `2px solid rgba(212,160,40,0.5)` : "none",
            borderBottom: !t ? `2px solid rgba(212,160,40,0.5)` : "none",
            borderLeft: l ? `2px solid rgba(212,160,40,0.5)` : "none",
            borderRight: !l ? `2px solid rgba(212,160,40,0.5)` : "none",
          }} />
        ))}

        {/* not-your-turn overlay */}
        {mode === "room" && !isMyTurn && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:20,
            background:"rgba(0,0,0,0.5)" }}>
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"clamp(0.5rem,2vw,0.65rem)", letterSpacing:"0.2em", color: GOLD }}>
              WAITING FOR {currentName?.toUpperCase()}...
            </span>
          </div>
        )}
      </div>

      {/* filter selector */}
      <div style={{ width:"100%", maxWidth:520, display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"clamp(4px,2vw,10px)" }}>
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setSelectedFilter(f.id)} disabled={isCapturing} style={{
            display:"flex", flexDirection:"column", alignItems:"center", gap:4,
            background:"none", border:"none", cursor:"pointer", padding:0,
          }}>
            <div style={{
              width:"100%", aspectRatio:"1/1", position:"relative", overflow:"hidden",
              border: selectedFilter === f.id ? `2px solid ${GOLD}` : `1px solid ${BORDER}`,
              boxShadow: selectedFilter === f.id ? "0 0 8px rgba(212,160,40,0.4)" : "none",
              background: BODY,
            }}>
              <div style={{ position:"absolute", inset:0, background: filterBg[f.id] }} />
            </div>
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"clamp(0.4rem,1.8vw,0.5rem)", letterSpacing:"0.1em", textTransform:"uppercase",
              color: selectedFilter === f.id ? GOLD : GOLD_DIM }}>
              {f.label}
            </span>
          </button>
        ))}
      </div>

      {/* captured thumbnails */}
      {localPhotos.length > 0 && (
        <div style={{ width:"100%", maxWidth:520, display:"flex", gap:6, overflowX:"auto", paddingBottom:2 }}>
          {localPhotos.map((p,i) => (
            <div key={i} style={{ flexShrink:0, width:"clamp(34px,8vw,46px)", aspectRatio:"4/3", border:`1px solid ${BORDER}`, boxShadow:"0 0 6px rgba(0,0,0,0.4)" }}>
              <img src={p} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
            </div>
          ))}
        </div>
      )}

      {/* shutter row */}
      <div style={{ display:"flex", alignItems:"center", gap:20 }}>
        {autoRunning && autoTick === null && (
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.55rem", color: GOLD_DIM, letterSpacing:"0.15em" }}>
            CAPTURING...
          </div>
        )}
        <button onClick={handleShutter} disabled={!canShoot} style={{
          width:"clamp(56px,14vw,72px)", height:"clamp(56px,14vw,72px)", borderRadius:"50%",
          cursor: canShoot ? "pointer" : "not-allowed",
          background: canShoot
            ? "radial-gradient(circle at 35% 35%, #e8b838, #a07818)"
            : "#2e2820",
          border:`3px solid rgba(212,160,40,${canShoot ? "0.5" : "0.2"})`,
          boxShadow: canShoot
            ? `0 0 0 6px rgba(212,160,40,0.08), 0 4px 20px rgba(212,160,40,0.3), inset 0 2px 0 rgba(255,240,160,0.2)`
            : "none",
          transition:"all 0.15s", display:"flex", alignItems:"center", justifyContent:"center",
          opacity: !canShoot && localPhotos.length >= photoCount ? 0.3 : 1,
          flexShrink: 0,
        }}>
          {autoRunning
            ? <Zap size={20} style={{ color: GOLD }} />
            : <Camera size={20} style={{ color: canShoot ? "#181614" : GOLD_DIM }} />}
        </button>
        {autoMode && !autoRunning && canShoot && (
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.5rem", color: GOLD_DIM, letterSpacing:"0.15em" }}>
            AUTO {autoInterval}s
          </span>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display:"none" }} />

      <style>{`
        @keyframes boothPulse { 0%{transform:scale(1.4);opacity:0} 100%{transform:scale(1);opacity:1} }
      `}</style>
    </div>
  );
}
