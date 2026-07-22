import { useNavigate } from "react-router";
import { useBooth, StripType } from "../context/BoothContext";
import { ArrowRight, Film, AlignJustify, Grid3X3 } from "lucide-react";

const GOLD     = "#d4a028";
const GOLD_DIM = "#9a8050";
const CREAM    = "#f2e8cc";
const CARD     = "#231f1b";
const INPUT    = "#2e2820";
const BORDER   = "rgba(212,160,40,0.2)";

const STRIP_OPTIONS: { id: StripType; name: string; icon: typeof Film; desc: string }[] = [
  { id: "film",    name: "Film Strip",    icon: Film,          desc: "35mm vertical strip with sprocket holes and frame numbers" },
  { id: "classic", name: "Classic Print", icon: AlignJustify,  desc: "Traditional photobooth paper strip on warm cream stock" },
  { id: "contact", name: "Contact Sheet", icon: Grid3X3,       desc: "Photographer's numbered grid on dark background" },
];

function FilmPreview({ photos }: { photos: string[] }) {
  return (
    <div style={{ background:"#080501", border:"1px solid #2a1a08", width:52, padding:"4px 0", display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
      <div style={{ display:"flex", gap:2, marginBottom:2 }}>
        {[0,1,2].map(i => <div key={i} style={{ width:6, height:4, borderRadius:1, background:"#1a1005", border:"0.5px solid #3a2810" }} />)}
      </div>
      {photos.slice(0,4).map((p,i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:2 }}>
          <div style={{ width:4, height:10, background:"#1a1005", border:"0.5px solid #3a2810", borderRadius:1 }} />
          <div style={{ width:30, height:22, overflow:"hidden", border:"0.5px solid #3a2810" }}>
            <img src={p} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          </div>
          <div style={{ width:4, height:10, background:"#1a1005", border:"0.5px solid #3a2810", borderRadius:1 }} />
        </div>
      ))}
      <div style={{ display:"flex", gap:2, marginTop:2 }}>
        {[0,1,2].map(i => <div key={i} style={{ width:6, height:4, borderRadius:1, background:"#1a1005", border:"0.5px solid #3a2810" }} />)}
      </div>
    </div>
  );
}

function ClassicPreview({ photos }: { photos: string[] }) {
  return (
    <div style={{ background:"#f5edd8", width:52, padding:"5px 5px 8px", display:"flex", flexDirection:"column", gap:2 }}>
      <div style={{ fontFamily:"'Special Elite',serif", fontSize:5, textAlign:"center", color:"#1e1810", marginBottom:2 }}>★ PHOTO BOOTH ★</div>
      {photos.slice(0,4).map((p,i) => (
        <div key={i} style={{ width:"100%", height:18, overflow:"hidden", border:"0.5px solid #c8a860" }}>
          <img src={p} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
        </div>
      ))}
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:4, textAlign:"center", color:"#9a7840", marginTop:2 }}>
        ROLL 001
      </div>
    </div>
  );
}

function ContactPreview({ photos }: { photos: string[] }) {
  return (
    <div style={{ background:"#100e0c", width:60, padding:4 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:2 }}>
        {photos.slice(0,4).map((p,i) => (
          <div key={i} style={{ position:"relative" }}>
            <img src={p} alt="" style={{ width:"100%", height:20, objectFit:"cover", display:"block" }} />
            <div style={{ position:"absolute", top:0, left:0, background:"rgba(212,160,40,0.85)", fontSize:4,
              fontFamily:"'Space Mono',monospace", color:"#100e0c", padding:"0 2px", lineHeight:"8px" }}>{i+1}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:4, color:"#9a8050", textAlign:"center", marginTop:3 }}>CONTACT</div>
    </div>
  );
}

export default function Strips() {
  const navigate = useNavigate();
  const { photos, stripType, setStripType } = useBooth();

  if (!photos.length) { navigate("/"); return null; }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div style={{ width:"100%", maxWidth:420, background: CARD, border:`1px solid ${BORDER}`, boxShadow:"0 0 40px rgba(0,0,0,0.7)" }}>

        <div style={{ padding:"20px 24px 16px", borderBottom:`1px solid ${BORDER}`, textAlign:"center" }}>
          <h2 style={{ fontFamily:"'Special Elite',serif", fontSize:"1.5rem", color: CREAM }}>
            Choose Your Strip
          </h2>
          <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.6rem", letterSpacing:"0.18em", color: GOLD_DIM, marginTop:4 }}>
            {photos.length} PHOTO{photos.length > 1 ? "S" : ""} CAPTURED — SELECT A LAYOUT
          </p>
        </div>

        {/* Thumbnails */}
        <div style={{ padding:"16px 24px 12px", display:"flex", gap:6, overflowX:"auto" }}>
          {photos.map((p, i) => (
            <div key={i} style={{ flexShrink:0, position:"relative", width:60, height:60, border:`1px solid ${BORDER}` }}>
              <img src={p} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              <div style={{ position:"absolute", bottom:0, left:0,
                fontFamily:"'Space Mono',monospace", fontSize:8, padding:"1px 4px",
                background:"rgba(0,0,0,0.65)", color: GOLD }}>
                {i + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Strip options */}
        <div style={{ padding:"0 24px 24px", display:"flex", flexDirection:"column", gap:10 }}>
          {STRIP_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const sel = stripType === opt.id || (stripType === "polaroid" && opt.id === "classic");
            return (
              <button
                key={opt.id}
                onClick={() => setStripType(opt.id)}
                style={{
                  display:"flex", alignItems:"center", gap:14, padding:"10px 14px", textAlign:"left",
                  background: sel ? INPUT : "#1a1714",
                  border:`1px solid ${sel ? "rgba(212,160,40,0.5)" : "rgba(212,160,40,0.12)"}`,
                  boxShadow: sel ? "0 0 14px rgba(212,160,40,0.08)" : "none",
                  cursor:"pointer", transition:"all 0.15s",
                }}
              >
                {/* mini preview */}
                <div style={{ flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", width:64, height:68 }}>
                  {opt.id === "film"    && <FilmPreview    photos={photos} />}
                  {opt.id === "classic" && <ClassicPreview photos={photos} />}
                  {opt.id === "contact" && <ContactPreview photos={photos} />}
                </div>

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                    <Icon size={13} style={{ color: sel ? GOLD : GOLD_DIM, flexShrink:0 }} />
                    <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.7rem", fontWeight:700,
                      letterSpacing:"0.1em", color: sel ? CREAM : GOLD_DIM }}>
                      {opt.name}
                    </span>
                  </div>
                  <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.58rem", color: GOLD_DIM, lineHeight:1.5 }}>
                    {opt.desc}
                  </p>
                </div>

                <div style={{
                  width:14, height:14, borderRadius:"50%", flexShrink:0,
                  background: sel ? GOLD : "transparent",
                  border:`1px solid ${sel ? "#e0b838" : "rgba(212,160,40,0.3)"}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  {sel && <div style={{ width:5, height:5, borderRadius:"50%", background:"#181614" }} />}
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ padding:"0 24px 24px" }}>
          <button
            onClick={() => navigate("/result")}
            style={{
              width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              padding:"14px 0",
              fontFamily:"'Space Mono',monospace", fontSize:"0.72rem", letterSpacing:"0.15em",
              background:`linear-gradient(135deg,${GOLD},#b08018)`,
              color:"#181614", border:"1px solid #e0b838",
              boxShadow:"0 2px 0 #7a5808, 0 4px 12px rgba(212,160,40,0.3)",
              cursor:"pointer",
            }}
          >
            DEVELOP STRIP <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
