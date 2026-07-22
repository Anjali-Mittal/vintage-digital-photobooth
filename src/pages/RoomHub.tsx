import { useNavigate } from "react-router";
import { ArrowLeft, Plus, LogIn } from "lucide-react";

const GOLD = "#d4a028"; const GOLD_DIM = "#9a8050"; const CREAM = "#f2e8cc";
const CARD = "#231f1b"; const INPUT = "#2e2820"; const BORDER = "rgba(212,160,40,0.2)";

export default function RoomHub() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div style={{ width:"100%", maxWidth:340, background: CARD, border:`1px solid ${BORDER}`, boxShadow:"0 0 40px rgba(0,0,0,0.6)" }}>
        <div style={{ padding:"18px 24px 14px", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => navigate("/")} style={{ background:"none", border:"none", cursor:"pointer", color: GOLD_DIM, padding:0, lineHeight:0 }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontFamily:"'Special Elite',serif", fontSize:"1.25rem", color: CREAM, margin:0 }}>Photo Booth Room</h2>
            <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.6rem", color: GOLD_DIM, margin:0, letterSpacing:"0.12em" }}>Up to 3 people</p>
          </div>
        </div>
        <div style={{ padding:24, display:"flex", flexDirection:"column", gap:12 }}>
          <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.6rem", color: GOLD_DIM, lineHeight:1.7, margin:0 }}>
            Create a room and share the code with up to 2 friends. Take turns clicking photos — cycling until your strip is full.
          </p>
          <button onClick={() => navigate("/room/create")} style={{
            display:"flex", alignItems:"center", gap:14, padding:"14px 16px", textAlign:"left",
            background:`linear-gradient(135deg,${GOLD},#b08018)`, border:"1px solid #e0b838",
            boxShadow:"0 2px 0 #7a5808, 0 4px 12px rgba(212,160,40,0.3)", cursor:"pointer",
          }}>
            <Plus size={20} style={{ color:"#181614", flexShrink:0 }} />
            <div>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.15em", color:"#181614" }}>CREATE ROOM</div>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.55rem", color:"rgba(24,22,20,0.6)", marginTop:2 }}>Get a room code to share</div>
            </div>
          </button>
          <button onClick={() => navigate("/room/join")} style={{
            display:"flex", alignItems:"center", gap:14, padding:"14px 16px", textAlign:"left",
            background:"rgba(212,160,40,0.06)", border:`1px solid rgba(212,160,40,0.3)`, cursor:"pointer",
          }}>
            <LogIn size={20} style={{ color: GOLD, flexShrink:0 }} />
            <div>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.15em", color: CREAM }}>JOIN ROOM</div>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.55rem", color: GOLD_DIM, marginTop:2 }}>Enter a friend's room code</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
