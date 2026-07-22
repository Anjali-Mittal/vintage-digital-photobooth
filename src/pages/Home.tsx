import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useBooth } from "../context/BoothContext";
import { Camera, Users } from "lucide-react";

/* ── palette ── */
const GOLD      = "#d4a028";
const GOLD_DIM  = "#9a8050";
const GOLD_DARK = "#7a5808";
const CREAM     = "#f2e8cc";
const BODY      = "#1e1a16";   /* booth cabinet */
const BODY_LT   = "#28231e";   /* lighter cabinet face */
const DEEP      = "#120f0c";   /* darkest recesses */
const INTERIOR  = "#0e0c0a";   /* curtain interior */
const CRIMSONA  = "#7a1414";
const CRIMSONB  = "#9e1c1c";
const CRIMSONC  = "#6a1010";

const CURTAIN_STRIPE = `repeating-linear-gradient(
  90deg,
  ${CRIMSONA} 0px, ${CRIMSONB} 10px, ${CRIMSONC} 10px, ${CRIMSONA} 20px
)`;

function Bulb({ on }: { on: boolean }) {
  return (
    <div style={{
      width: 9, height: 9, borderRadius: "50%",
      background: on ? "#f5e060" : "#3a3020",
      border: `1px solid ${on ? "#c8b020" : "#2a2418"}`,
      boxShadow: on ? "0 0 6px 2px rgba(245,224,96,0.5)" : "none",
      flexShrink: 0,
    }} />
  );
}

function GoldBar() {
  return <div style={{ height: 5, background: `linear-gradient(90deg,#6a4808,${GOLD},#b88018,${GOLD},#6a4808)` }} />;
}

function Fringe({ n }: { n: number }) {
  return (
    <div style={{ display: "flex", gap: 2, justifyContent: "center", paddingBottom: 2 }}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} style={{
          width: 4, height: 12, borderRadius: "0 0 3px 3px",
          background: `linear-gradient(180deg,${GOLD} 0%,#8a6010 100%)`,
        }} />
      ))}
    </div>
  );
}

const BULBS_TOP = [true, false, true, true, false, true, false, true, false, true, true, false];

export default function Home() {
  const navigate = useNavigate();
  const { clearPhotos, setMode } = useBooth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 950);
    return () => clearTimeout(t);
  }, []);

  function handleSolo() { clearPhotos(); setMode("solo"); navigate("/setup"); }
  function handleRoom() { clearPhotos(); navigate("/room"); }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 py-10"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #251e18 0%, #181614 70%)" }}
    >
      {/* ── outer wrapper gives the 3-D side-panel depth ── */}
      <div className="relative" style={{ width: 292 }}>

        {/* side depth panel */}
        <div className="absolute top-3 -right-2.5 bottom-2" style={{
          width: 10,
          background: "linear-gradient(90deg,#1a1612,#0e0c0a)",
          borderRight: "1px solid rgba(212,160,40,0.08)",
        }} />

        {/* ══ CABINET ══ */}
        <div style={{
          background: `linear-gradient(160deg, ${BODY_LT} 0%, ${BODY} 55%, #191510 100%)`,
          border: "1.5px solid rgba(212,160,40,0.3)",
          boxShadow: "0 0 0 1px rgba(212,160,40,0.06), 0 16px 64px rgba(0,0,0,0.8), 0 2px 6px rgba(0,0,0,0.6)",
          overflow: "hidden",
        }}>

          {/* top gold bar */}
          <GoldBar />

          {/* ── MARQUEE SECTION ── */}
          <div style={{ padding: "12px 14px 10px", background: `linear-gradient(180deg,#1a1612,${BODY})` }}>
            {/* bulb row */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              {BULBS_TOP.map((on, i) => <Bulb key={i} on={on} />)}
            </div>

            {/* sign box */}
            <div style={{
              background: DEEP,
              border: `1px solid ${GOLD}44`,
              padding: "10px 8px 8px",
              textAlign: "center",
              boxShadow: `inset 0 0 24px rgba(0,0,0,0.7), 0 0 10px rgba(212,160,40,0.06)`,
            }}>
              <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.45rem", letterSpacing:"0.4em", color: GOLD_DIM, marginBottom: 2 }}>
                ★ GENUINE ★
              </p>
              <p style={{ fontFamily:"'Special Elite',serif", fontSize:"1.9rem", color: CREAM, lineHeight:1, letterSpacing:"0.02em",
                textShadow:`0 0 18px rgba(212,160,40,0.25)` }}>
                PHOTO
              </p>
              <p style={{ fontFamily:"'Special Elite',serif", fontSize:"1.9rem", color: GOLD, lineHeight:1, letterSpacing:"0.02em",
                textShadow:`0 0 22px rgba(212,160,40,0.55), 0 0 44px rgba(212,160,40,0.2)` }}>
                BOOTH
              </p>
              <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.42rem", letterSpacing:"0.22em", color: GOLD_DIM, marginTop: 4 }}>
                25¢ PER STRIP · 3–6 EXPOSURES
              </p>
            </div>

            {/* bulb row (reversed) */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              {[...BULBS_TOP].reverse().map((on, i) => <Bulb key={i} on={on} />)}
            </div>
          </div>

          {/* gold divider */}
          <GoldBar />

          {/* ── CAMERA SECTION ── */}
          <div style={{
            background: `linear-gradient(180deg,#1a1612,${BODY})`,
            padding: "14px 14px 12px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          }}>
            {/* lens */}
            <div style={{ position: "relative" }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: `radial-gradient(circle at 38% 38%, #2c2820, ${DEEP})`,
                border: `2px solid ${GOLD}55`,
                boxShadow: `0 0 0 5px ${BODY}, 0 0 0 7px ${GOLD}30, 0 0 18px rgba(212,160,40,0.12)`,
              }}>
                <div style={{
                  position:"absolute", inset: 6, borderRadius:"50%",
                  background:`radial-gradient(circle at 40% 38%, #382e24, #08060a)`,
                }}/>
                {/* lens glare */}
                <div style={{ position:"absolute", top:10, left:10, width:10, height:7, borderRadius:"50%",
                  background:"rgba(255,255,255,0.15)", transform:"rotate(-20deg)" }} />
              </div>
            </div>

            {/* viewfinder strip */}
            <div style={{
              width: 190, height: 44,
              background: DEEP,
              border: `1px solid ${GOLD}30`,
              boxShadow: "inset 0 0 14px rgba(0,0,0,0.9)",
              display:"flex", alignItems:"center", justifyContent:"center", gap: 3,
            }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ width:32, height:28, background:"#1e1810", border:`0.5px solid ${GOLD}28` }} />
              ))}
            </div>

            {/* coin slot */}
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:26, height:3, background: DEEP, border:`1px solid ${GOLD}38`, borderRadius:2 }} />
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.4rem", letterSpacing:"0.22em", color: GOLD_DIM }}>
                INSERT COIN
              </span>
              <div style={{ width:26, height:3, background: DEEP, border:`1px solid ${GOLD}38`, borderRadius:2 }} />
            </div>
          </div>

          {/* gold divider */}
          <GoldBar />

          {/* ── CURTAIN SECTION ── */}
          <div style={{ position:"relative", height: 196, overflow:"hidden", background: INTERIOR }}>

            {/* overhead warm glow */}
            <div style={{
              position:"absolute", top:-20, left:"50%", transform:"translateX(-50%)",
              width:160, height:120, borderRadius:"50%",
              background:"radial-gradient(circle, rgba(212,160,40,0.1) 0%, transparent 68%)",
              pointerEvents:"none",
            }} />

            {/* stool + interior — revealed after curtains open */}
            <div style={{
              position:"absolute", inset:0, display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"flex-end", paddingBottom:16,
              opacity: open ? 1 : 0, transition:"opacity 0.4s ease 0.9s",
            }}>
              {/* stool */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:10 }}>
                <div style={{ width:50, height:4, background:"#3c3428", borderRadius:2 }} />
                <div style={{ width:5, height:28, background:"#2e2820" }} />
                <div style={{ width:38, height:3, background:"#2e2820", borderRadius:2 }} />
              </div>
            </div>

            {/* LEFT curtain */}
            <motion.div
              style={{ position:"absolute", top:0, left:0, bottom:0, width:"50%", transformOrigin:"left center" }}
              animate={{ x: open ? "-100%" : "0%" }}
              transition={{ duration: 0.85, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* curtain rod */}
              <div style={{ height:7, background:`linear-gradient(90deg,${GOLD}cc,#8a6010,${GOLD}aa)` }} />
              <div style={{ flex:1, background: CURTAIN_STRIPE, height:"calc(100% - 7px - 16px)" }} />
              {/* inner-edge shadow */}
              <div style={{ position:"absolute", top:7, right:0, bottom:16, width:10,
                background:"linear-gradient(90deg, transparent, rgba(0,0,0,0.5))" }} />
              <Fringe n={17} />
            </motion.div>

            {/* RIGHT curtain */}
            <motion.div
              style={{ position:"absolute", top:0, right:0, bottom:0, width:"50%", transformOrigin:"right center" }}
              animate={{ x: open ? "100%" : "0%" }}
              transition={{ duration: 0.85, ease: [0.4, 0, 0.2, 1] }}
            >
              <div style={{ height:7, background:`linear-gradient(90deg,${GOLD}aa,#8a6010,${GOLD}cc)` }} />
              <div style={{ flex:1, background: CURTAIN_STRIPE, height:"calc(100% - 7px - 16px)" }} />
              <div style={{ position:"absolute", top:7, left:0, bottom:16, width:10,
                background:"linear-gradient(90deg, rgba(0,0,0,0.5), transparent)" }} />
              <Fringe n={17} />
            </motion.div>

            {/* CTA buttons — fade in after curtains open */}
            <motion.div
              style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
                alignItems:"stretch", justifyContent:"flex-end", padding:"0 14px 14px", gap:8 }}
              initial={{ opacity:0, y:10 }}
              animate={{ opacity: open ? 1 : 0, y: open ? 0 : 10 }}
              transition={{ duration: 0.4, delay: open ? 0.7 : 0 }}
            >
              <button
                onClick={handleSolo}
                style={{
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  padding:"11px 0",
                  fontFamily:"'Space Mono',monospace", fontSize:"0.72rem", letterSpacing:"0.18em",
                  background:`linear-gradient(135deg,${GOLD},#b08018)`,
                  color: "#181614",
                  border:`1px solid #e0b838`,
                  boxShadow:`0 2px 0 ${GOLD_DARK}, 0 4px 14px rgba(212,160,40,0.3)`,
                  cursor:"pointer",
                }}
              >
                <Camera size={14} />
                SOLO SESSION
              </button>
              <button
                onClick={handleRoom}
                style={{
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  padding:"11px 0",
                  fontFamily:"'Space Mono',monospace", fontSize:"0.72rem", letterSpacing:"0.18em",
                  background:"rgba(212,160,40,0.07)",
                  color: CREAM,
                  border:`1px solid rgba(212,160,40,0.3)`,
                  cursor:"pointer",
                }}
              >
                <Users size={14} />
                CREATE / JOIN ROOM
              </button>
            </motion.div>
          </div>

          {/* bottom gold bar */}
          <GoldBar />
        </div>

        {/* cabinet legs */}
        <div style={{ display:"flex", justifyContent:"space-between", padding:"0 40px" }}>
          {[0,1].map(i => (
            <div key={i} style={{
              width:14, height:18,
              background:`linear-gradient(180deg,${GOLD}99,#6a4808)`,
              borderRadius:"0 0 3px 3px",
            }} />
          ))}
        </div>

        {/* ground shadow */}
        <div style={{
          margin:"2px 24px 0",
          height:8,
          background:"radial-gradient(ellipse,rgba(0,0,0,0.55) 0%,transparent 72%)",
          borderRadius:"50%",
        }} />
      </div>

      <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.45rem", letterSpacing:"0.32em",
        color:"rgba(154,128,80,0.4)", textAlign:"center" }}>
        EST. 1972 · CLASSIC PHOTO STRIPS
      </p>
    </div>
  );
}
