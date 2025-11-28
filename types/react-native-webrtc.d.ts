// Place this file in your project root or in a types/ folder
// If using types/ folder, make sure it's included in tsconfig.json

declare module "react-native-webrtc" {
  export class RTCPeerConnection {
    constructor(configuration?: any);

    localDescription: any;
    remoteDescription: any;
    signalingState: string;
    iceGatheringState: string;
    iceConnectionState: string;
    connectionState: string;

    onicecandidate: ((event: any) => void) | null;
    onaddstream: ((event: any) => void) | null;
    onconnectionstatechange: (() => void) | null;
    oniceconnectionstatechange: (() => void) | null;
    onsignalingstatechange: (() => void) | null;
    onicegatheringstatechange: (() => void) | null;

    createOffer(options?: any): Promise<any>;
    createAnswer(options?: any): Promise<any>;
    setLocalDescription(description: any): Promise<void>;
    setRemoteDescription(description: any): Promise<void>;
    addIceCandidate(candidate: any): Promise<void>;
    addStream(stream: MediaStream): void;
    removeStream(stream: MediaStream): void;
    getStats(): Promise<any>;
    close(): void;
  }

  export class RTCIceCandidate {
    constructor(candidateInitDict: any);
    candidate: string;
    sdpMid: string | null;
    sdpMLineIndex: number | null;
  }

  export class RTCSessionDescription {
    constructor(descriptionInitDict: any);
    type: string;
    sdp: string;
  }

  export class MediaStream {
    id: string;
    active: boolean;

    getAudioTracks(): MediaStreamTrack[];
    getVideoTracks(): MediaStreamTrack[];
    getTracks(): MediaStreamTrack[];
    addTrack(track: MediaStreamTrack): void;
    removeTrack(track: MediaStreamTrack): void;
    toURL(): string;
    release(): void;
  }

  export class MediaStreamTrack {
    id: string;
    kind: string;
    label: string;
    enabled: boolean;
    muted: boolean;
    readyState: string;

    stop(): void;
  }

  export const mediaDevices: {
    getUserMedia(constraints: any): Promise<MediaStream>;
    enumerateDevices(): Promise<MediaDeviceInfo[]>;
  };

  export interface MediaDeviceInfo {
    deviceId: string;
    groupId: string;
    kind: string;
    label: string;
  }

  export class RTCView extends React.Component<{
    streamURL: string;
    style?: any;
    objectFit?: "contain" | "cover";
    mirror?: boolean;
    zOrder?: number;
  }> {}
}
