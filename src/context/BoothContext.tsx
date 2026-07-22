import React, { createContext, useContext, useState, useRef, useCallback } from "react";

export interface Filter {
  id: string;
  name: string;
  css: string;
  label: string;
}

export const FILTERS: Filter[] = [
  { id: "natural", name: "Natural", css: "none", label: "NAT" },
  { id: "noir", name: "Noir", css: "grayscale(100%) contrast(1.2) brightness(0.92)", label: "B&W" },
  { id: "sepia", name: "Sepia", css: "sepia(90%) contrast(1.06) brightness(1.06)", label: "SEP" },
  { id: "warm", name: "Warm", css: "sepia(28%) brightness(1.12) saturate(1.25) contrast(1.04)", label: "WRM" },
  { id: "vintage", name: "Vintage", css: "contrast(1.08) saturate(0.7) brightness(1.09) sepia(20%)", label: "VNT" },
];

export type StripType = "film" | "polaroid" | "classic" | "contact";

export interface Member {
  id: string;
  name: string;
}

export interface RoomState {
  code: string;
  creator: string;
  members: Member[];
  photoCount: number;
  status: "lobby" | "shooting" | "done";
  currentTurn: number;
  photos: string[];
  autoMode?: boolean;
  autoInterval?: number;
}

interface BoothContextType {
  mode: "solo" | "room";
  setMode: (m: "solo" | "room") => void;

  photoCount: number;
  setPhotoCount: (n: number) => void;

  myId: string;
  myName: string;
  setMyName: (name: string) => void;

  roomCode: string;
  setRoomCode: (code: string) => void;

  isRoomCreator: boolean;
  setIsRoomCreator: (v: boolean) => void;

  members: Member[];
  setMembers: (members: Member[] | ((prev: Member[]) => Member[])) => void;

  currentTurn: number;
  setCurrentTurn: (t: number) => void;

  selectedFilter: string;
  setSelectedFilter: (id: string) => void;

  photos: string[];
  addPhoto: (photo: string) => void;
  setPhotos: (photos: string[]) => void;
  clearPhotos: () => void;

  stripType: StripType;
  setStripType: (t: StripType) => void;

  autoMode: boolean;
  setAutoMode: (v: boolean) => void;
  autoInterval: number;
  setAutoInterval: (n: number) => void;
}

const BoothContext = createContext<BoothContextType | null>(null);

const generateId = () => Math.random().toString(36).slice(2, 10);

export function BoothProvider({ children }: { children: React.ReactNode }) {
  const myId = useRef(generateId()).current;

  const [mode, setMode] = useState<"solo" | "room">("solo");
  const [photoCount, setPhotoCount] = useState(4);
  const [myName, setMyName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isRoomCreator, setIsRoomCreator] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState("natural");
  const [photos, setPhotos] = useState<string[]>([]);
  const [stripType, setStripType] = useState<StripType>("film");
  const [autoMode, setAutoMode] = useState(false);
  const [autoInterval, setAutoInterval] = useState(5);

  const addPhoto = useCallback((photo: string) => {
    setPhotos((prev) => [...prev, photo]);
  }, []);

  const clearPhotos = useCallback(() => setPhotos([]), []);

  return (
    <BoothContext.Provider
      value={{
        mode, setMode,
        photoCount, setPhotoCount,
        myId, myName, setMyName,
        roomCode, setRoomCode,
        isRoomCreator, setIsRoomCreator,
        members, setMembers,
        currentTurn, setCurrentTurn,
        selectedFilter, setSelectedFilter,
        photos, addPhoto, setPhotos, clearPhotos,
        stripType, setStripType,
        autoMode, setAutoMode,
        autoInterval, setAutoInterval,
      }}
    >
      {children}
    </BoothContext.Provider>
  );
}

export function useBooth() {
  const ctx = useContext(BoothContext);
  if (!ctx) throw new Error("useBooth must be used within BoothProvider");
  return ctx;
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function getRoomFromStorage(code: string): RoomState | null {
  try {
    const raw = localStorage.getItem(`pb_room_${code}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveRoomToStorage(room: RoomState) {
  localStorage.setItem(`pb_room_${room.code}`, JSON.stringify(room));
}
