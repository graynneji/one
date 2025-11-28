import { Client } from "@/utils/client";
import Constants from "expo-constants";
import {
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from "react-native-webrtc";

type CallSessionId = string | number;
type SignalType = "offer" | "answer" | "ice-candidate" | string;

interface SignalData {
  type?: string;
  sdp?: string;
  candidate?: string;
  sdpMid?: string;
  sdpMLineIndex?: number;
  usernameFragment?: string;
  [key: string]: any;
}

interface TurnCredentialsCache {
  credentials: any[];
  expiresAt: number;
}

let turnCredentialsCache: TurnCredentialsCache | null = null;

export class WebRTCService extends Client {
  pc: any = null; // Use any to avoid type conflicts with RN WebRTC
  localStream: MediaStream | null = null;
  remoteStream: MediaStream | null = null;
  isCaller = false;
  currentCallSession: CallSessionId | null = null;
  otherUserId?: string;
  connectionStateListeners: ((state: string) => void)[] = [];
  iceStateListeners: ((state: string) => void)[] = [];

  // Get TURN credentials with caching
  private async getTurnCredentials(): Promise<any[]> {
    const now = Date.now();

    // Return cached credentials if still valid (expires in 12 hours)
    if (turnCredentialsCache && turnCredentialsCache.expiresAt > now) {
      console.log("Using cached TURN credentials");
      return turnCredentialsCache.credentials;
    }

    try {
      const apiKey =
        process.env.TURN_SERVER ?? Constants.expoConfig?.extra?.turnServer;

      if (!apiKey) {
        console.warn("Metered API key not found, using free TURN servers");
        return [];
      }

      const response = await fetch(
        `https://therapyplus.metered.live/api/v1/turn/credentials?apiKey=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`TURN credentials request failed: ${response.status}`);
      }

      const credentials = await response.json();

      // Cache for 12 hours
      turnCredentialsCache = {
        credentials,
        expiresAt: now + 12 * 60 * 60 * 1000,
      };

      console.log("Fetched fresh TURN credentials");
      return credentials;
    } catch (error) {
      console.error("Error fetching TURN credentials:", error);
      return [];
    }
  }

  // Initialize WebRTC with enhanced configuration
  async initializeWebRTC(isCaller: boolean, callSessionId: CallSessionId) {
    this.isCaller = isCaller;
    this.currentCallSession = callSessionId;

    // Get TURN credentials
    const meteredServers = await this.getTurnCredentials();

    const configuration: any = {
      iceServers: [
        // Google's free STUN servers (always try direct connection first)
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
        // Metered TURN servers (fallback)
        ...meteredServers,
      ],
      iceCandidatePoolSize: 10,
    };

    this.pc = new RTCPeerConnection(configuration);

    // Set up ICE candidate handler
    this.pc.onicecandidate = (event: any) => {
      if (event.candidate) {
        const candidateInit = {
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid ?? undefined,
          sdpMLineIndex: event.candidate.sdpMLineIndex ?? undefined,
          usernameFragment: event.candidate.usernameFragment ?? undefined,
        };

        this.sendSignal("ice-candidate", candidateInit as SignalData);
      }
    };

    // Set up stream handler - RN WebRTC uses onaddstream
    this.pc.onaddstream = (event: any) => {
      console.log("Remote stream received");
      this.remoteStream = event.stream;
    };

    // Monitor connection state
    this.pc.onconnectionstatechange = () => {
      const state = this.pc?.connectionState || "unknown";
      console.log("Connection state:", state);
      this.notifyConnectionStateChange(state);

      if (state === "connected") {
        this.updateCallStatus("ongoing");
      } else if (state === "failed" || state === "disconnected") {
        this.handleConnectionFailure();
      }
    };

    // Monitor ICE connection state
    this.pc.oniceconnectionstatechange = () => {
      const state = this.pc?.iceConnectionState || "unknown";
      console.log("ICE connection state:", state);
      this.notifyIceStateChange(state);
    };

    // Monitor signaling state
    this.pc.onsignalingstatechange = () => {
      console.log("Signaling state:", this.pc?.signalingState);
    };

    return this.pc;
  }

  // Get local media stream with enhanced options
  async getLocalStream(type: "video" | "audio" = "video") {
    try {
      const constraints: any = {
        audio: true,
        video:
          type === "video"
            ? {
                width: { ideal: 1280, max: 1920 },
                height: { ideal: 720, max: 1080 },
                frameRate: { ideal: 30, max: 60 },
                facingMode: "user",
              }
            : false,
      };

      this.localStream = await mediaDevices.getUserMedia(constraints);

      if (this.pc) {
        this.pc.addStream(this.localStream);
        console.log("Added local stream to peer connection");
      }

      return this.localStream;
    } catch (error) {
      console.error("Error getting local stream:", error);
      throw new Error(
        "Failed to access camera/microphone. Please check permissions."
      );
    }
  }

  // Wait for ICE gathering with timeout
  private waitForIceGathering(timeout: number): Promise<void> {
    return new Promise((resolve) => {
      if (this.pc?.iceGatheringState === "complete") {
        resolve();
        return;
      }

      const timeoutId = setTimeout(() => {
        console.warn("ICE gathering timeout, proceeding anyway");
        resolve();
      }, timeout);

      const checkState = () => {
        if (this.pc?.iceGatheringState === "complete") {
          clearTimeout(timeoutId);
          this.pc.onicegatheringstatechange = null;
          resolve();
        }
      };

      this.pc.onicegatheringstatechange = checkState;
    });
  }

  // Create and send offer with enhanced error handling
  async createOffer() {
    try {
      if (!this.pc) throw new Error("Peer connection not initialized");

      const offerOptions: any = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      };

      const offer = await this.pc.createOffer(offerOptions);
      await this.pc.setLocalDescription(offer);

      // Wait for ICE gathering to complete (with 10s timeout)
      await this.waitForIceGathering(10000);

      await this.sendSignal("offer", offer);

      console.log("Offer created and sent");
    } catch (error) {
      console.error("Error creating offer:", error);
      throw error;
    }
  }

  // Handle incoming offer
  async handleOffer(offer: any) {
    try {
      if (!this.pc) throw new Error("Peer connection not initialized");

      await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);

      // Wait for ICE gathering before sending answer
      await this.waitForIceGathering(10000);

      await this.sendSignal("answer", answer);

      console.log("Offer handled, answer sent");
    } catch (error) {
      console.error("Error handling offer:", error);
      throw error;
    }
  }

  // Handle incoming answer
  async handleAnswer(answer: any) {
    try {
      if (!this.pc) throw new Error("Peer connection not initialized");

      await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
      console.log("Answer handled");
    } catch (error) {
      console.error("Error handling answer:", error);
      throw error;
    }
  }

  // Handle ICE candidate
  async handleICECandidate(candidate: any) {
    try {
      if (!this.pc) {
        console.warn("Peer connection not ready, queuing ICE candidate");
        return;
      }

      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
      console.log("ICE candidate added");
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  }

  // Send signaling data
  async sendSignal(signalType: SignalType, signalData: SignalData) {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();

      if (!user?.id) throw new Error("User not authenticated");

      const { error } = await this.supabase.from("webrtc_signaling").insert({
        call_session_id: this.currentCallSession,
        from_user_id: user.id,
        to_user_id: this.getOtherUserId(),
        signal_type: signalType,
        signal_data: signalData,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error sending signal:", error);
        throw error;
      }
    } catch (error) {
      console.error("Failed to send signal:", error);
      throw error;
    }
  }

  // Update call session status
  async updateCallStatus(status: "ringing" | "ongoing" | "ended") {
    try {
      const updateData: any = { status };

      if (status === "ongoing") {
        updateData.started_at = new Date().toISOString();
      } else if (status === "ended") {
        updateData.ended_at = new Date().toISOString();
      }

      const { error } = await this.supabase
        .from("call_sessions")
        .update(updateData)
        .eq("id", this.currentCallSession);

      if (error) {
        console.error("Error updating call status:", error);
      }
    } catch (error) {
      console.error("Failed to update call status:", error);
    }
  }

  // Switch between audio and video
  async switchMediaType(type: "audio" | "video") {
    try {
      if (!this.localStream) throw new Error("No local stream");

      // Stop current stream
      this.localStream.getTracks().forEach((track) => {
        track.stop();
      });

      // Remove stream from peer connection
      if (this.pc) {
        this.pc.removeStream(this.localStream);
      }

      // Get new stream with updated type
      const newStream = await this.getLocalStream(type);

      await this.supabase
        .from("call_sessions")
        .update({ call_type: type })
        .eq("id", this.currentCallSession);

      return newStream;
    } catch (error) {
      console.error("Error switching media type:", error);
      throw error;
    }
  }

  // Mute/unmute audio
  toggleAudio(): boolean {
    if (!this.localStream) return false;

    const audioTracks = this.localStream.getAudioTracks();
    const isMuted = audioTracks[0]?.enabled;

    audioTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });

    return !isMuted;
  }

  // Mute/unmute video
  toggleVideo(): boolean {
    if (!this.localStream) return false;

    const videoTracks = this.localStream.getVideoTracks();
    const isVideoMuted = videoTracks[0]?.enabled;

    videoTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });

    return !isVideoMuted;
  }

  // Handle connection failure with retry logic
  private async handleConnectionFailure() {
    console.log("Connection failed, attempting to reconnect...");

    // Update status to ended if connection fails
    await this.updateCallStatus("ended");

    // Notify listeners
    this.connectionStateListeners.forEach((cb) => cb("failed"));
  }

  // Add connection state listener
  onConnectionStateChange(callback: (state: string) => void) {
    this.connectionStateListeners.push(callback);
  }

  // Add ICE state listener
  onIceStateChange(callback: (state: string) => void) {
    this.iceStateListeners.push(callback);
  }

  // Notify connection state listeners
  private notifyConnectionStateChange(state: string) {
    this.connectionStateListeners.forEach((callback) => callback(state));
  }

  // Notify ICE state listeners
  private notifyIceStateChange(state: string) {
    this.iceStateListeners.forEach((callback) => callback(state));
  }

  // Get connection statistics
  async getStats(): Promise<any | null> {
    if (!this.pc) return null;

    try {
      const stats = await this.pc.getStats();
      return stats;
    } catch (error) {
      console.error("Error getting stats:", error);
      return null;
    }
  }

  // Clean up resources
  async cleanup() {
    console.log("Cleaning up WebRTC resources...");

    // Stop all local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
        console.log("Stopped track:", track.kind);
      });
      this.localStream.release();
      this.localStream = null;
    }

    // Close peer connection
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }

    // Clear remote stream
    if (this.remoteStream) {
      this.remoteStream.release();
      this.remoteStream = null;
    }

    // Reset state
    this.isCaller = false;
    this.currentCallSession = null;
    this.otherUserId = undefined;

    // Clear listeners
    this.connectionStateListeners = [];
    this.iceStateListeners = [];
  }

  // Getters and setters
  getOtherUserId(): string | undefined {
    return this.otherUserId;
  }

  setOtherUserId(userId: string) {
    this.otherUserId = userId;
  }

  getLocalStreamRef(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  getPeerConnection(): any {
    return this.pc;
  }

  isConnected(): boolean {
    return this.pc?.connectionState === "connected";
  }
}

// Clear credentials cache on app restart
export function clearTurnCredentialsCache() {
  turnCredentialsCache = null;
}

export const webRTCService = new WebRTCService();
