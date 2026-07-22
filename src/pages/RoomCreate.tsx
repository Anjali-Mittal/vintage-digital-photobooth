import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useBooth, generateRoomCode, saveRoomToStorage } from "../context/BoothContext";
import { ArrowLeft, Copy, Check } from "lucide-react";

const GOLD = "#d4a028"; const GOLD_DIM = "#9a8050"; const CREAM = "#f2e8cc";
const CARD = "#231f1b"; const INPUT = "#2e2820"; const DEEP = "#181614";
const BORDER = "rgba(212,160,40,0.2)";

export default function RoomCreate() {
  const navigate = useNavigate();
  const { myId, setMyName, setRoomCode, setIsRoomCreator, setMembers, setPhotoCount,
    clearPhotos, setAutoMode, setAutoInterval } = useBooth();
  const [name, setName] = useState("");
  const [count, setCount] = useState(4);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [localAuto, setLocalAuto] = useState(false);
  const [localInterval, setLocalInterval] = useState(5);

  useEffect(() => { setCode(generateRoomCode()); }, []);

  function handleCreate() {
    if (!name.trim()) return;
    const me = { id: myId, name: name.trim() };
    saveRoomToStorage({
      code, creator: myId, members: [me], photoCount: count,
      status: "lobby", currentTurn: 0, photos: [],
      autoMode: localAuto, autoInterval: localInterval,
    });
    setMyName(name.trim()); setRoomCode(code); setIsRoomCreator(true);
    setMembers([me]); setPhotoCount(count); clearPhotos();
    setAutoMode(localAuto); setAutoInterval(localInterval);
    navigate("/room/lobby");
  }

  function copyCode() {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const inputStyle = {
    width:"100%", padding:"10px 14px", boxSizing:"border-box" as const,
    fontFamily:"'Space Mono',monospace", fontSize:"0.75rem", color: CREAM,
    background: INPUT, border:`1px solid ${BORDER}`, outline:"none",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div style={{ width:"100%", maxWidth:340, background: CARD, border:`1px solid ${BORDER}`, boxShadow:"0 0 40px rgba(0,0,0,0.6)" }}>
        <div style={{ padding:"18px 24px 14px", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => navigate("/room")} style={{ background:"none", border:"none", cursor:"pointer", color: GOLD_DIM, padding:0, lineHeight:0 }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontFamily:"'Special Elite',serif", fontSize:"1.25rem", color: CREAM, margin:0 }}>Create Room</h2>
            <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.6rem", color: GOLD_DIM, margin:0, letterSpacing:"0.12em" }}>Host a photo session</p>
          </div>
        </div>

        <div style={{ padding:24, display:"flex", flexDirection:"column", gap:20 }}>
          {/* Code display */}
          <div style={{ background: DEEP, border:`1px solid ${BORDER}`, padding:"16px 12px 12px", textAlign:"center" }}>
            <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.5rem", letterSpacing:"0.3em", color: GOLD_DIM, margin:"0 0 6px" }}>ROOM CODE</p>
            <div style={{ fontFamily:"'Special Elite',serif", fontSize:"2.5rem", letterSpacing:"0.35em", color: GOLD, textShadow:"0 0 20px rgba(212,160,40,0.4)" }}>{code}</div>
            <button onClick={copyCode} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:5, margin:"8px auto 0",
              fontFamily:"'Space Mono',monospace", fontSize:"0.55rem", color: GOLD_DIM }}>
              {copied ? <Check size={11} style={{ color: GOLD }} /> : <Copy size={11} />}
              {copied ? "Copied!" : "Copy code"}
            </button>
          </div>

          {/* Name */}
          <div>
            <label style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.58rem", letterSpacing:"0.2em", color: GOLD_DIM, display:"block", marginBottom:8, textTransform:"uppercase" }}>Your Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sarah" maxLength={20}
              style={{ ...inputStyle, caretColor: GOLD }}
              onFocus={e => (e.target.style.borderColor = "rgba(212,160,40,0.6)")}
              onBlur={e => (e.target.style.borderColor = BORDER)} />
          </div>

          {/* Photo count */}
          <div>
            <label style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.58rem", letterSpacing:"0.2em", color: GOLD_DIM, display:"block", marginBottom:10, textTransform:"uppercase" }}>Photos per Strip</label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:6 }}>
              {[1,2,3,4,5,6].map(n => (
                <button key={n} onClick={() => setCount(n)} style={{
                  padding:"9px 0", textAlign:"center",
                  fontFamily:"'Special Elite',serif", fontSize:"1.25rem",
                  background: count === n ? `linear-gradient(135deg,${GOLD},#b08018)` : INPUT,
                  color: count === n ? "#181614" : GOLD_DIM,
                  border: count === n ? "1px solid #e0b838" : `1px solid ${BORDER}`,
                  cursor:"pointer",
                }}>{n}</button>
              ))}
            </div>
          </div>

          {/* Auto mode */}
          <div style={{
            border: `1px solid ${localAuto ? "rgba(212,160,40,0.4)" : BORDER}`,
            background: localAuto ? "rgba(212,160,40,0.04)" : "#1c1916",
            transition:"border-color 0.2s, background 0.2s",
          }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px",
              borderBottom: localAuto ? `1px solid rgba(212,160,40,0.2)` : "none" }}>
              <div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.58rem", letterSpacing:"0.2em",
                  color: localAuto ? CREAM : GOLD_DIM, textTransform:"uppercase", marginBottom:2 }}>
                  Auto Mode
                </div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.5rem", color:"rgba(154,128,80,0.5)" }}>
                  {localAuto ? `Fires every ${localInterval}s` : "Tap once, shoot automatically"}
                </div>
              </div>
              <button onClick={() => setLocalAuto(!localAuto)} style={{
                width:40, height:22, borderRadius:11, border:"none", cursor:"pointer", position:"relative", flexShrink:0, marginLeft:12,
                background: localAuto ? GOLD : "#2e2820",
                boxShadow: localAuto ? "0 0 10px rgba(212,160,40,0.3)" : "none",
                transition:"background 0.2s, box-shadow 0.2s",
              }}>
                <div style={{
                  position:"absolute", top:3, width:16, height:16, borderRadius:"50%",
                  background: localAuto ? "#181614" : GOLD_DIM,
                  left: localAuto ? 21 : 3, transition:"left 0.2s",
                }} />
              </button>
            </div>
            {localAuto && (
              <div style={{ padding:"10px 14px" }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(8,1fr)", gap:4 }}>
                  {[3,4,5,6,7,8,9,10].map(s => (
                    <button key={s} onClick={() => setLocalInterval(s)} style={{
                      padding:"6px 0", textAlign:"center",
                      fontFamily:"'Space Mono',monospace", fontSize:"0.58rem",
                      background: localInterval === s ? `linear-gradient(135deg,${GOLD},#b08018)` : INPUT,
                      color: localInterval === s ? "#181614" : GOLD_DIM,
                      border: localInterval === s ? "1px solid #e0b838" : `1px solid ${BORDER}`,
                      cursor:"pointer",
                    }}>{s}s</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={handleCreate} disabled={!name.trim()} style={{
            padding:"14px 0", width:"100%",
            fontFamily:"'Space Mono',monospace", fontSize:"0.72rem", letterSpacing:"0.15em",
            background: name.trim() ? `linear-gradient(135deg,${GOLD},#b08018)` : INPUT,
            color: name.trim() ? "#181614" : GOLD_DIM,
            border: name.trim() ? "1px solid #e0b838" : `1px solid ${BORDER}`,
            boxShadow: name.trim() ? "0 2px 0 #7a5808, 0 4px 12px rgba(212,160,40,0.28)" : "none",
            cursor: name.trim() ? "pointer" : "not-allowed", opacity: name.trim() ? 1 : 0.5,
          }}>OPEN BOOTH</button>
        </div>
      </div>
    </div>
  );
}
