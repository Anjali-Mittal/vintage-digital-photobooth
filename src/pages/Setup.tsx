import { useState } from "react";
import { useNavigate } from "react-router";
import { useBooth, FILTERS } from "../context/BoothContext";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";

const CARD     = "#231f1b";
const INPUT    = "#2e2820";
const GOLD     = "#d4a028";
const GOLD_DIM = "#9a8050";
const CREAM    = "#f2e8cc";
const BORDER   = "rgba(212,160,40,0.2)";

const filterBg: Record<string, string> = {
  natural: "linear-gradient(135deg,#5a7858,#3a5870)",
  noir:    "linear-gradient(135deg,#888,#444)",
  sepia:   "linear-gradient(135deg,#c4a17a,#8b6040)",
  warm:    "linear-gradient(135deg,#e8b870,#c07030)",
  vintage: "linear-gradient(135deg,#c8a880,#907050)",
};

export default function Setup() {
  const navigate = useNavigate();
  const { setPhotoCount, photoCount, selectedFilter, setSelectedFilter,
    autoMode, setAutoMode, autoInterval, setAutoInterval } = useBooth();
  const [localCount, setLocalCount] = useState(photoCount);
  const [localAuto, setLocalAuto] = useState(autoMode);
  const [localInterval, setLocalInterval] = useState(autoInterval);

  function handleContinue() {
    setPhotoCount(localCount);
    setAutoMode(localAuto);
    setAutoInterval(localInterval);
    navigate("/booth");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div style={{ width:"100%", maxWidth:360, background: CARD, border:`1px solid ${BORDER}`, boxShadow:"0 0 40px rgba(0,0,0,0.6)" }}>

        <div style={{ padding:"18px 24px 14px", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => navigate("/")} style={{ background:"none", border:"none", cursor:"pointer", color: GOLD_DIM, padding:0, lineHeight:0 }}
            onMouseEnter={e => (e.currentTarget.style.color = CREAM)} onMouseLeave={e => (e.currentTarget.style.color = GOLD_DIM)}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontFamily:"'Special Elite',serif", fontSize:"1.25rem", color: CREAM, margin:0 }}>Session Setup</h2>
            <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.6rem", color: GOLD_DIM, margin:0, letterSpacing:"0.12em" }}>
              Configure your shoot
            </p>
          </div>
        </div>

        <div style={{ padding:24, display:"flex", flexDirection:"column", gap:26 }}>
          {/* Photo count */}
          <div>
            <label style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.6rem", letterSpacing:"0.22em", color: GOLD_DIM, display:"block", marginBottom:12, textTransform:"uppercase" }}>
              Number of Exposures
            </label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:6 }}>
              {[1,2,3,4,5,6].map(n => (
                <button key={n} onClick={() => setLocalCount(n)} style={{
                  padding:"9px 0", textAlign:"center",
                  fontFamily:"'Special Elite',serif", fontSize:"1.25rem",
                  background: localCount === n ? `linear-gradient(135deg,${GOLD},#b08018)` : INPUT,
                  color: localCount === n ? "#181614" : GOLD_DIM,
                  border: localCount === n ? "1px solid #e0b838" : `1px solid ${BORDER}`,
                  boxShadow: localCount === n ? "0 0 14px rgba(212,160,40,0.25)" : "none",
                  cursor:"pointer", transition:"all 0.12s",
                }}>{n}</button>
              ))}
            </div>
            <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.55rem", color:"rgba(154,128,80,0.55)", textAlign:"center", marginTop:8 }}>
              {localCount} photo{localCount > 1 ? "s" : ""} per strip
            </p>
          </div>

          {/* Auto mode */}
          <div style={{
            border: `1px solid ${localAuto ? "rgba(212,160,40,0.4)" : BORDER}`,
            background: localAuto ? "rgba(212,160,40,0.04)" : "#1c1916",
            transition:"border-color 0.2s, background 0.2s",
          }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px",
              borderBottom: localAuto ? `1px solid rgba(212,160,40,0.2)` : "none" }}>
              <div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.6rem", letterSpacing:"0.22em",
                  color: localAuto ? CREAM : GOLD_DIM, textTransform:"uppercase", marginBottom:3 }}>
                  Auto Mode
                </div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.5rem", color:"rgba(154,128,80,0.55)", lineHeight:1.5 }}>
                  {localAuto
                    ? `Shoots every ${localInterval}s after shutter press`
                    : "Tap shutter once, photos fire automatically"}
                </div>
              </div>
              <button onClick={() => setLocalAuto(!localAuto)} style={{
                width:42, height:24, borderRadius:12, border:"none", cursor:"pointer", position:"relative", flexShrink:0, marginLeft:16,
                background: localAuto ? GOLD : "#2e2820",
                boxShadow: localAuto ? `0 0 12px rgba(212,160,40,0.35)` : "none",
                transition:"background 0.2s, box-shadow 0.2s",
              }}>
                <div style={{
                  position:"absolute", top:3, width:18, height:18, borderRadius:"50%",
                  background: localAuto ? "#181614" : GOLD_DIM,
                  left: localAuto ? 21 : 3,
                  transition:"left 0.2s",
                }} />
              </button>
            </div>

            {localAuto && (
              <div style={{ padding:"12px 16px" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <Clock size={12} style={{ color: GOLD_DIM }} />
                    <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.58rem", color: GOLD_DIM, letterSpacing:"0.15em", textTransform:"uppercase" }}>
                      Interval
                    </span>
                  </div>
                  <span style={{ fontFamily:"'Special Elite',serif", fontSize:"1.1rem", color: GOLD }}>{localInterval}s</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(8,1fr)", gap:5 }}>
                  {[3,4,5,6,7,8,9,10].map(s => (
                    <button key={s} onClick={() => setLocalInterval(s)} style={{
                      padding:"7px 0", textAlign:"center",
                      fontFamily:"'Space Mono',monospace", fontSize:"0.6rem",
                      background: localInterval === s ? `linear-gradient(135deg,${GOLD},#b08018)` : INPUT,
                      color: localInterval === s ? "#181614" : GOLD_DIM,
                      border: localInterval === s ? "1px solid #e0b838" : `1px solid ${BORDER}`,
                      cursor:"pointer", transition:"all 0.1s",
                    }}>{s}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          <div>
            <label style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.6rem", letterSpacing:"0.22em", color: GOLD_DIM, display:"block", marginBottom:12, textTransform:"uppercase" }}>
              Starting Filter
            </label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
              {FILTERS.map(f => (
                <button key={f.id} onClick={() => setSelectedFilter(f.id)} style={{ background:"none", border:"none", cursor:"pointer", padding:0, display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                  <div style={{
                    width:"100%", aspectRatio:"1/1", position:"relative", overflow:"hidden",
                    border: selectedFilter === f.id ? `2px solid ${GOLD}` : `1px solid ${BORDER}`,
                    boxShadow: selectedFilter === f.id ? "0 0 10px rgba(212,160,40,0.3)" : "none",
                    background: INPUT,
                  }}>
                    <div style={{ position:"absolute", inset:0, background: filterBg[f.id] }} />
                  </div>
                  <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.5rem", letterSpacing:"0.15em", color: selectedFilter === f.id ? GOLD : GOLD_DIM }}>
                    {f.label}
                  </span>
                </button>
              ))}
            </div>
            <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.55rem", color:"rgba(154,128,80,0.5)", textAlign:"center", marginTop:8 }}>
              You can change this in the booth
            </p>
          </div>
        </div>

        <div style={{ padding:"0 24px 24px" }}>
          <button onClick={handleContinue} style={{
            width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            padding:"14px 0",
            fontFamily:"'Space Mono',monospace", fontSize:"0.72rem", letterSpacing:"0.15em",
            background:`linear-gradient(135deg,${GOLD},#b08018)`, color:"#181614",
            border:"1px solid #e0b838", boxShadow:"0 2px 0 #7a5808, 0 4px 14px rgba(212,160,40,0.28)",
            cursor:"pointer",
          }}>
            Enter Booth <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
