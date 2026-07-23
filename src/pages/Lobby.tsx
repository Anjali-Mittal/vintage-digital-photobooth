import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useBooth, getRoomFromStorage, saveRoomToStorage, Member } from "../context/BoothContext";
import { Copy, Check, User, Loader, Wifi, WifiOff } from "lucide-react";
import { RoomConnection, RoomMsg, MQTTStatus } from "../utils/mqttRoom";

const GOLD = "#d4a028"; const GOLD_DIM = "#9a8050"; const CREAM = "#f2e8cc";
const CARD = "#231f1b"; const INPUT = "#2e2820"; const DEEP = "#181614";
const BORDER = "rgba(212,160,40,0.2)";

export default function Lobby() {
  const navigate = useNavigate();
  const { setMode, roomCode, myId, myName, isRoomCreator, members, setMembers, setCurrentTurn, photoCount, autoMode, autoInterval } = useBooth();
  const [copied, setCopied] = useState(false);
  const [mqttStatus, setMqttStatus] = useState<MQTTStatus>("connecting");
  const connRef = useRef<RoomConnection | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (!roomCode) { navigate("/"); return; }
    setMode("room");

    // Same-browser sync (BroadcastChannel)
    try {
      const ch = new BroadcastChannel(`pb_room_${roomCode}`);
      channelRef.current = ch;
      ch.onmessage = (e) => {
        if (e.data.type === "JOIN") { const r = getRoomFromStorage(roomCode); if (r) setMembers(r.members); }
        if (e.data.type === "START") { setMode("room"); setCurrentTurn(0); navigate("/booth"); }
      };
    } catch {}

    // MQTT cross-browser sync
    const conn = new RoomConnection(
      roomCode,
      (msg: RoomMsg) => {
        if (msg.type === "JOIN") {
          const incoming = msg.member as Member;
          if (incoming.id === myId) return;
          setMembers(prev => {
            if (prev.find(m => m.id === incoming.id)) return prev;
            const updated = [...prev, incoming];
            // If creator, update localStorage and broadcast MEMBER_UPDATE
            if (isRoomCreator) {
              const r = getRoomFromStorage(roomCode);
              if (r) saveRoomToStorage({ ...r, members: updated });
              conn.publish({ type: "MEMBER_UPDATE", members: updated });
            }
            return updated;
          });
        }
        if (msg.type === "MEMBER_UPDATE") {
          setMembers(msg.members as Member[]);
        }
        if (msg.type === "REQUEST_INFO" && isRoomCreator) {
          const r = getRoomFromStorage(roomCode);
          if (r) {
            conn.publish({
              type: "ROOM_INFO",
              photoCount: r.photoCount,
              members: r.members,
              autoMode: r.autoMode ?? false,
              autoInterval: r.autoInterval ?? 5,
            });
          }
        }
        if (msg.type === "START") {
          setMode("room");
          setCurrentTurn(0);
          navigate("/booth");
        }
      },
      (status) => {
        setMqttStatus(status);
        // Non-creator: re-announce presence once connected.
        // This fixes the race where the original JOIN from RoomJoin was
        // transmitted before the creator had subscribed, or MEMBER_UPDATE
        // arrived before this lobby connection had subscribed.
        if (status === "connected" && !isRoomCreator) {
          setTimeout(() => {
            conn.publish({ type: "JOIN", member: { id: myId, name: myName } });
          }, 400);
        }
      },
    );
    connRef.current = conn;

    // Poll localStorage as fallback
    const interval = setInterval(() => {
      const r = getRoomFromStorage(roomCode);
      if (r) setMembers(r.members);
    }, 2000);

    return () => {
      channelRef.current?.close();
      conn.disconnect();
      clearInterval(interval);
    };
  }, [roomCode]);

  function handleStart() {
    const r = getRoomFromStorage(roomCode);
    if (r) saveRoomToStorage({ ...r, status: "shooting", currentTurn: 0 });
    setMode("room");
    channelRef.current?.postMessage({ type: "START" });
    connRef.current?.publish({ type: "START" });
    setCurrentTurn(0);
    navigate("/booth");
  }

  function copyCode() { navigator.clipboard.writeText(roomCode).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }

  const slots: (Member | null)[] = [members[0] ?? null, members[1] ?? null, members[2] ?? null];

  const statusColor = mqttStatus === "connected" ? GOLD : mqttStatus === "connecting" ? "#9a8050" : "#e07070";
  const StatusIcon = mqttStatus === "connected" ? Wifi : mqttStatus === "connecting" ? Loader : WifiOff;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div style={{ width:"100%", maxWidth:340, background: CARD, border:`1px solid ${BORDER}`, boxShadow:"0 0 40px rgba(0,0,0,0.6)" }}>
        <div style={{ padding:"18px 24px 14px", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ textAlign:"center", flex:1 }}>
            <h2 style={{ fontFamily:"'Special Elite',serif", fontSize:"1.25rem", color: CREAM, margin:0 }}>Waiting Room</h2>
            <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.6rem", color: GOLD_DIM, margin:"4px 0 0", letterSpacing:"0.12em" }}>Share this code to invite friends</p>
          </div>
          {/* MQTT status */}
          <div style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 8px",
            background:"rgba(0,0,0,0.3)", border:`1px solid rgba(212,160,40,0.15)` }}>
            <StatusIcon size={11} style={{
              color: statusColor,
              animation: mqttStatus === "connecting" ? "spin 1s linear infinite" : undefined,
            }} />
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.45rem", color: statusColor, letterSpacing:"0.1em" }}>
              {mqttStatus === "connected" ? "LIVE" : mqttStatus === "connecting" ? "..." : "OFFLINE"}
            </span>
          </div>
        </div>

        {/* Code */}
        <div style={{ margin:"20px 24px 0", background: DEEP, border:`1px solid ${BORDER}`, padding:"14px 12px 10px", textAlign:"center" }}>
          <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.5rem", letterSpacing:"0.28em", color: GOLD_DIM, margin:"0 0 4px" }}>ROOM CODE</p>
          <div style={{ fontFamily:"'Special Elite',serif", fontSize:"2.5rem", letterSpacing:"0.35em", color: GOLD, textShadow:"0 0 20px rgba(212,160,40,0.4)" }}>{roomCode}</div>
          <button onClick={copyCode} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:5, margin:"6px auto 0",
            fontFamily:"'Space Mono',monospace", fontSize:"0.55rem", color: GOLD_DIM }}>
            {copied ? <Check size={11} style={{ color: GOLD }} /> : <Copy size={11} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Members */}
        <div style={{ padding:"20px 24px 8px", display:"flex", flexDirection:"column", gap:8 }}>
          <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.58rem", letterSpacing:"0.2em", color: GOLD_DIM, textTransform:"uppercase", margin:0 }}>
            Players ({members.length}/3)
          </p>
          {slots.map((m, i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:12, padding:"10px 14px",
              background: m ? INPUT : "#1c1916",
              border:`1px solid ${m ? "rgba(212,160,40,0.3)" : "rgba(212,160,40,0.1)"}`,
            }}>
              <div style={{
                width:30, height:30, borderRadius:"50%", flexShrink:0,
                display:"flex", alignItems:"center", justifyContent:"center",
                background: m ? GOLD : "#2e2820",
                border:`1px solid ${m ? "#e0b838" : BORDER}`,
              }}>
                <User size={13} style={{ color: m ? "#181614" : GOLD_DIM }} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                {m ? (
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.72rem", color: CREAM }}>{m.name}</span>
                    {m.id === myId && <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.5rem", color: GOLD, letterSpacing:"0.15em" }}>(YOU)</span>}
                    {m.id === myId && isRoomCreator && <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.45rem", color: GOLD_DIM, letterSpacing:"0.15em" }}>HOST</span>}
                  </div>
                ) : (
                  <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.6rem", color:"rgba(154,128,80,0.4)", fontStyle:"italic" }}>Waiting...</span>
                )}
              </div>
              {m ? <div style={{ width:7, height:7, borderRadius:"50%", background: GOLD }} />
                  : <Loader size={11} style={{ color: GOLD_DIM, opacity:0.4 }} />}
            </div>
          ))}
          <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.55rem", color:"rgba(154,128,80,0.45)", textAlign:"center", margin:"4px 0 0" }}>
            {photoCount} photos · turn by turn{autoMode ? ` · ${autoInterval}s auto` : ""}
          </p>
        </div>

        <div style={{ padding:"12px 24px 24px", display:"flex", flexDirection:"column", gap:8 }}>
          {isRoomCreator ? (
            <>
              <button onClick={handleStart} disabled={members.length < 2} style={{
                padding:"14px 0", width:"100%",
                fontFamily:"'Space Mono',monospace", fontSize:"0.72rem", letterSpacing:"0.15em",
                background: members.length >= 2 ? `linear-gradient(135deg,${GOLD},#b08018)` : INPUT,
                color: members.length >= 2 ? "#181614" : GOLD_DIM,
                border: members.length >= 2 ? "1px solid #e0b838" : `1px solid ${BORDER}`,
                boxShadow: members.length >= 2 ? "0 2px 0 #7a5808, 0 4px 12px rgba(212,160,40,0.28)" : "none",
                cursor: members.length >= 2 ? "pointer" : "not-allowed",
              }}>
                {members.length < 2 ? "WAITING FOR PLAYERS..." : "START SESSION"}
              </button>
              <button onClick={() => { setCurrentTurn(0); navigate("/booth"); }}
                style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'Space Mono',monospace",
                  fontSize:"0.55rem", letterSpacing:"0.15em", color:"rgba(154,128,80,0.4)", textTransform:"uppercase" }}>
                Start solo instead
              </button>
            </>
          ) : (
            <div style={{ textAlign:"center", padding:"12px 0" }}>
              <Loader size={15} style={{ color: GOLD, display:"inline-block", animation:"spin 1s linear infinite" }} />
              <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.6rem", color: GOLD_DIM, marginTop:8 }}>
                Waiting for host to start...
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
