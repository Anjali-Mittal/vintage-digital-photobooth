import mqtt from "mqtt";

const BROKER = "wss://broker.hivemq.com:8884/mqtt";
const TOPIC_PREFIX = "photobooth_v1_";

export interface RoomMember { id: string; name: string; }

export type RoomMsg =
  | { type: "REQUEST_INFO" }
  | { type: "ROOM_INFO"; photoCount: number; members: RoomMember[]; autoMode: boolean; autoInterval: number }
  | { type: "JOIN"; member: RoomMember }
  | { type: "MEMBER_UPDATE"; members: RoomMember[] }
  | { type: "START" }
  | { type: "PHOTO_ADDED"; photo: string; nextTurn: number; done: boolean }
  | { type: "PING"; memberId: string };

export type MQTTStatus = "connecting" | "connected" | "error" | "offline";

export class RoomConnection {
  private client: ReturnType<typeof mqtt.connect> | null = null;
  private topic: string;

  constructor(
    code: string,
    private onMessage: (msg: RoomMsg) => void,
    private onStatus: (s: MQTTStatus) => void,
  ) {
    this.topic = `${TOPIC_PREFIX}${code}`;
    this.connect();
  }

  private connect() {
    this.onStatus("connecting");
    try {
      this.client = mqtt.connect(BROKER, {
        clientId: `pb_${Math.random().toString(36).slice(2, 10)}`,
        clean: true,
        connectTimeout: 10_000,
        reconnectPeriod: 5_000,
      });
    } catch {
      this.onStatus("error");
      return;
    }

    this.client.on("connect", () => {
      this.onStatus("connected");
      this.client!.subscribe(this.topic, { qos: 0 });
    });

    this.client.on("error", () => this.onStatus("error"));
    this.client.on("offline", () => this.onStatus("offline"));
    this.client.on("reconnect", () => this.onStatus("connecting"));

    this.client.on("message", (_topic, payload) => {
      try {
        const msg = JSON.parse(payload.toString()) as RoomMsg;
        this.onMessage(msg);
      } catch {
        // malformed message, ignore
      }
    });
  }

  publish(msg: RoomMsg): boolean {
    if (!this.client?.connected) return false;
    const str = JSON.stringify(msg);
    // HiveMQ public broker max payload: ~128KB
    if (str.length > 120_000) {
      console.warn("[MQTT] Message too large, skipping:", str.length);
      return false;
    }
    this.client.publish(this.topic, str, { qos: 0 });
    return true;
  }

  disconnect() {
    this.client?.end(true);
    this.client = null;
  }

  get connected(): boolean {
    return this.client?.connected ?? false;
  }
}

/** Compress a captured photo for MQTT transmission. Keeps under ~60KB. */
export function compressPhoto(dataUrl: string, maxW = 480, quality = 0.6): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(1, maxW / img.width, (maxW * 0.75) / img.height);
      const w = Math.floor(img.width * ratio);
      const h = Math.floor(img.height * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
