import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useBooth, getRoomFromStorage, saveRoomToStorage } from "../context/BoothContext";
import { ArrowLeft, Loader } from "lucide-react";
import { RoomConnection, RoomMsg } from "../utils/mqttRoom";

const GOLD = "#d4a028"; const GOLD_DIM = "#9a8050"; const CREAM = "#f2e8cc";
const CARD = "#231f1b"; const INPUT = "#2e2820"; const DEEP = "#181614";
const BORDER = "rgba(212,160,40,0.2)";

type JoinState = "idle" | "connecting" | "waiting" | "error_not_found" | "error_full" | "error_started";

export default function RoomJoin() {
  const navigate = useNavigate();
  const { myId, setMyName, setRoomCode, setIsRoomCreator, setMembers, setPhotoCount,
    clearPhotos, setAutoMode, setAutoInterval } = useBooth();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [joinState, setJoinState] = useState<JoinState>("idle");
  const connRef = useRef<RoomConnection | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    connRef.current?.disconnect();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  function finishJoin(members: any[], photoCount: number, autoMode = false, autoInterval = 5) {
    const upper = code.trim().toUpperCase();
    const me = { id: myId, name: name.trim() };
    const updatedMembers = [...members.filter((m: any) => m.id !== myId), me];

    setMyName(name.trim()); setRoomCode(upper); setIsRoomCreator(false);
    setMembers(updatedMembers); setPhotoCount(photoCount); clearPhotos();
    setAutoMode(autoMode); setAutoInterval(autoInterval);

    // Publish JOIN over MQTT so cross-browser members see it.
    // IMPORTANT: grab a local ref and delay disconnect — force-closing
    // immediately would drop the message before it is transmitted.
    const conn = connRef.current;
    connRef.current = null;
    conn?.publish({ type: "JOIN", member: me });
    setTimeout(() => conn?.disconnect(), 1000);
    navigate("/room/lobby");
  }

  function handleJoin() {
    if (!name.trim() || code.trim().length < 4) return;
    const upper = code.trim().toUpperCase();

    // Fast path: same browser / same device localStorage
    const room = getRoomFromStorage(upper);
    if (room) {
      if (room.members.length >= 3) { setJoinState("error_full"); return; }
      if (room.status !== "lobby") { setJoinState("error_started"); return; }
      const me = { id: myId, name: name.trim() };
      const updated = { ...room, members: [...room.members, me] };
      saveRoomToStorage(updated);
      try {
        const ch = new BroadcastChannel(`pb_room_${upper}`);
        ch.postMessage({ type: "JOIN", member: me });
        ch.close();
      } catch {}
      setMyName(name.trim()); setRoomCode(upper); setIsRoomCreator(false);
      setMembers(updated.members); setPhotoCount(room.photoCount); clearPhotos();
      setAutoMode(room.autoMode ?? false); setAutoInterval(room.autoInterval ?? 5);
      navigate("/room/lobby");
      return;
    }

    // Cross-browser path: use MQTT
    setJoinState("connecting");
    connRef.current?.disconnect();

    const conn = new RoomConnection(
      upper,
      (msg: RoomMsg) => {
        if (msg.type === "ROOM_INFO") {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          if (msg.members.length >= 3) { conn.disconnect(); setJoinState("error_full"); return; }
          finishJoin(msg.members, msg.photoCount, msg.autoMode, msg.autoInterval);
        }
      },
      (status) => {
        if (status === "connected") {
          setJoinState("waiting");
          // Ask creator for room info
          setTimeout(() => conn.publish({ type: "REQUEST_INFO" }), 300);
          // Timeout if no reply
          timeoutRef.current = setTimeout(() => {
            conn.disconnect();
            setJoinState("error_not_found");
          }, 12_000);
        } else if (status === "error") {
          setJoinState("error_not_found");
        }
      },
    );
    connRef.current = conn;
  }

  const canJoin = name.trim().length > 0 && code.trim().length >= 4 && joinState !== "connecting" && joinState !== "waiting";

  const errorMsg: Partial<Record<JoinState, string>> = {
    error_not_found: "Room not found. Make sure the host is online and the code is correct.",
    error_full: "This room is full (max 3 people).",
    error_started: "This session has already started.",
  };

  const inputBase = {
    width:"100%", padding:"10px 14px", boxSizing:"border-box" as const,
    fontFamily:"'Space Mono',monospace", color: CREAM,
    background: INPUT, border:`1px solid ${BORDER}`, outline:"none",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div style={{ width:"100%", maxWidth:340, background: CARD, border:`1px solid ${BORDER}`, boxShadow:"0 0 40px rgba(0,0,0,0.6)" }}>
        <div style={{ padding:"18px 24px 14px", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => navigate("/room")} style={{ background:"none", border:"none", cursor:"pointer", color: GOLD_DIM, padding:0, lineHeight:0 }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontFamily:"'Special Elite',serif", fontSize:"1.25rem", color: CREAM, margin:0 }}>Join Room</h2>
            <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.6rem", color: GOLD_DIM, margin:0, letterSpacing:"0.12em" }}>Enter a friend's code</p>
          </div>
        </div>

        <div style={{ padding:24, display:"flex", flexDirection:"column", gap:18 }}>
          {errorMsg[joinState] && (
            <div style={{ padding:"10px 14px", fontFamily:"'Space Mono',monospace", fontSize:"0.6rem", color:"#e87070",
              background:"rgba(192,57,43,0.12)", border:"1px solid rgba(192,57,43,0.3)" }}>
              {errorMsg[joinState]}
            </div>
          )}

          {(joinState === "connecting" || joinState === "waiting") && (
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
              background:"rgba(212,160,40,0.06)", border:`1px solid rgba(212,160,40,0.2)` }}>
              <Loader size={13} style={{ color: GOLD, flexShrink:0, animation:"spin 1s linear infinite" }} />
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.6rem", color: GOLD_DIM }}>
                {joinState === "connecting" ? "Connecting to network..." : "Waiting for host response..."}
              </span>
            </div>
          )}

          <div>
            <label style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.58rem", letterSpacing:"0.2em", color: GOLD_DIM, display:"block", marginBottom:8, textTransform:"uppercase" }}>Your Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jordan" maxLength={20}
              style={{ ...inputBase, fontSize:"0.75rem" }}
              onFocus={e => (e.target.style.borderColor = "rgba(212,160,40,0.6)")}
              onBlur={e => (e.target.style.borderColor = BORDER)} />
          </div>

          <div>
            <label style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.58rem", letterSpacing:"0.2em", color: GOLD_DIM, display:"block", marginBottom:8, textTransform:"uppercase" }}>Room Code</label>
            <input type="text" value={code} onChange={e => { setCode(e.target.value.toUpperCase()); setJoinState("idle"); }}
              placeholder="A3BK" maxLength={4}
              style={{ ...inputBase, fontSize:"2rem", textAlign:"center", letterSpacing:"0.4em", background: DEEP,
                border:`1px solid rgba(212,160,40,0.3)`, fontFamily:"'Special Elite',serif", color: GOLD }}
              onFocus={e => (e.target.style.borderColor = "rgba(212,160,40,0.7)")}
              onBlur={e => (e.target.style.borderColor = "rgba(212,160,40,0.3)")} />
          </div>

          <button onClick={handleJoin} disabled={!canJoin} style={{
            padding:"14px 0", width:"100%",
            fontFamily:"'Space Mono',monospace", fontSize:"0.72rem", letterSpacing:"0.15em",
            background: canJoin ? `linear-gradient(135deg,${GOLD},#b08018)` : INPUT,
            color: canJoin ? "#181614" : GOLD_DIM,
            border: canJoin ? "1px solid #e0b838" : `1px solid ${BORDER}`,
            boxShadow: canJoin ? "0 2px 0 #7a5808, 0 4px 12px rgba(212,160,40,0.28)" : "none",
            cursor: canJoin ? "pointer" : "not-allowed",
            opacity: canJoin ? 1 : 0.5,
          }}>JOIN SESSION</button>

          <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.5rem", color:"rgba(154,128,80,0.4)", textAlign:"center", margin:0, lineHeight:1.7 }}>
            Works across browsers — the host must have the room open
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
