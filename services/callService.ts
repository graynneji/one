// callService.ts
import { Client } from "@/utils/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import {
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from "react-native-webrtc";

// STUN servers (Google's free STUN servers)
const STUN_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    {
      urls: "turn:a.relay.metered.ca:80",
      username: "your-metered-username",
      credential: "your-metered-password",
    },
    {
      urls: "turn:a.relay.metered.ca:443",
      username: "your-metered-username",
      credential: "your-metered-password",
    },
    {
      urls: "turn:a.relay.metered.ca:443?transport=tcp",
      username: "your-metered-username",
      credential: "your-metered-password",
    },
  ],
  iceCandidatePoolSize: 10,
};

export enum CallType {
  VIDEO = "video",
  AUDIO = "audio",
}

export enum CallStatus {
  IDLE = "idle",
  CALLING = "calling",
  RINGING = "ringing",
  CONNECTED = "connected",
  ENDED = "ended",
}

export interface CallState {
  status: CallStatus;
  callType: CallType;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isCameraOff: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callerId: string | null;
  receiverId: string | null;
}

interface SignalingMessage {
  type:
    | "offer"
    | "answer"
    | "ice-candidate"
    | "call-request"
    | "call-accepted"
    | "call-rejected"
    | "call-ended";
  callId: string;
  callerId: string;
  receiverId: string;
  callType?: CallType;
  data?: any;
}

export class CallService extends Client {
  private peerConnection: RTCPeerConnection | null = null;
  private channel: RealtimeChannel | null = null;
  private currentUserId: string;
  private currentCallId: string | null = null;

  private state: CallState = {
    status: CallStatus.IDLE,
    callType: CallType.VIDEO,
    isAudioMuted: false,
    isVideoMuted: false,
    isCameraOff: false,
    localStream: null,
    remoteStream: null,
    callerId: null,
    receiverId: null,
  };

  private listeners: Map<string, (state: CallState) => void> = new Map();

  constructor(userId: string) {
    super(); // Call parent constructor
    this.currentUserId = userId;
    this.initializeSignaling();
  }

  // Subscribe to state changes
  public subscribe(
    id: string,
    callback: (state: CallState) => void
  ): () => void {
    this.listeners.set(id, callback);
    callback(this.state);
    return () => this.listeners.delete(id);
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb(this.state));
  }

  private updateState(updates: Partial<CallState>) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  // Initialize Supabase Realtime for signaling
  private initializeSignaling() {
    // Access supabase from parent Client class
    this.channel = this.supabase.channel(`user:${this.currentUserId}`);

    this.channel
      .on(
        "broadcast",
        { event: "signaling" },
        async ({ payload }: { payload: SignalingMessage }) => {
          await this.handleSignalingMessage(payload);
        }
      )
      .subscribe((status) => {
        console.log("Channel subscription status:", status);
      });
  }

  // Handle incoming signaling messages
  private async handleSignalingMessage(message: SignalingMessage) {
    if (message.receiverId !== this.currentUserId) return;

    console.log("Received signaling message:", message.type);

    switch (message.type) {
      case "call-request":
        await this.handleIncomingCall(message);
        break;
      case "call-accepted":
        await this.handleCallAccepted(message);
        break;
      case "call-rejected":
        this.handleCallRejected();
        break;
      case "offer":
        await this.handleOffer(message);
        break;
      case "answer":
        await this.handleAnswer(message);
        break;
      case "ice-candidate":
        await this.handleIceCandidate(message);
        break;
      case "call-ended":
        await this.endCall();
        break;
    }
  }

  // Send signaling message
  private async sendSignalingMessage(message: SignalingMessage) {
    try {
      const channel = this.supabase.channel(`user:${message.receiverId}`);
      await channel.subscribe();

      await channel.send({
        type: "broadcast",
        event: "signaling",
        payload: message,
      });

      console.log("Sent signaling message:", message.type);
    } catch (error) {
      console.error("Error sending signaling message:", error);
      throw error;
    }
  }

  // If you're still having TypeScript issues, use this version with type assertions:

  // Initialize WebRTC peer connection with type assertions
  private async initializePeerConnection() {
    this.peerConnection = new RTCPeerConnection(STUN_SERVERS);

    // Use type assertions for React Native WebRTC specific events
    (this.peerConnection as any).onicecandidate = async (event: any) => {
      if (event?.candidate && this.currentCallId) {
        const receiverId =
          this.state.callerId === this.currentUserId
            ? this.state.receiverId
            : this.state.callerId;

        if (receiverId) {
          await this.sendSignalingMessage({
            type: "ice-candidate",
            callId: this.currentCallId,
            callerId: this.currentUserId,
            receiverId,
            data: event.candidate.toJSON(),
          });
        }
      }
    };

    // Handle ICE connection state changes
    (this.peerConnection as any).oniceconnectionstatechange = () => {
      console.log(
        "ICE connection state:",
        this.peerConnection?.iceConnectionState
      );

      if (
        this.peerConnection?.iceConnectionState === "failed" ||
        this.peerConnection?.iceConnectionState === "disconnected"
      ) {
        console.warn("Connection issues detected");
      }
    };

    // Handle remote stream - React Native WebRTC uses onaddstream
    (this.peerConnection as any).onaddstream = (event: any) => {
      console.log("Received remote stream");
      if (event.stream) {
        this.updateState({ remoteStream: event.stream });
      }
    };

    // Add local stream using React Native WebRTC method
    if (this.state.localStream) {
      (this.peerConnection as any).addStream(this.state.localStream);
      console.log("Added local stream to peer connection");
    }
  }
  // Get user media
  private async getUserMedia(callType: CallType): Promise<MediaStream> {
    const constraints: any = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video:
        callType === CallType.VIDEO
          ? {
              width: { ideal: 1280, max: 1920 },
              height: { ideal: 720, max: 1080 },
              frameRate: { ideal: 30, max: 30 },
              facingMode: "user",
            }
          : false,
    };

    try {
      const stream = await mediaDevices.getUserMedia(constraints);
      console.log(
        "Got user media:",
        stream.getTracks().map((t) => t.kind)
      );
      return stream;
    } catch (error) {
      console.error("Error getting user media:", error);
      throw error;
    }
  }

  // Start a call
  public async startCall(
    receiverId: string,
    callType: CallType = CallType.VIDEO
  ) {
    try {
      this.currentCallId = `${this.currentUserId}-${receiverId}-${Date.now()}`;

      this.updateState({
        status: CallStatus.CALLING,
        callType,
        callerId: this.currentUserId,
        receiverId,
      });

      // Get local media
      const localStream = await this.getUserMedia(callType);
      this.updateState({ localStream });

      // Send call request
      await this.sendSignalingMessage({
        type: "call-request",
        callId: this.currentCallId,
        callerId: this.currentUserId,
        receiverId,
        callType,
      });
    } catch (error) {
      console.error("Error starting call:", error);
      await this.endCall();
      throw error;
    }
  }

  // Handle incoming call
  private async handleIncomingCall(message: SignalingMessage) {
    this.currentCallId = message.callId;
    this.updateState({
      status: CallStatus.RINGING,
      callType: message.callType || CallType.VIDEO,
      callerId: message.callerId,
      receiverId: this.currentUserId,
    });
  }

  // Answer call
  public async answerCall() {
    if (!this.currentCallId || this.state.status !== CallStatus.RINGING) {
      throw new Error("No incoming call to answer");
    }

    try {
      // Get local media
      const localStream = await this.getUserMedia(this.state.callType);
      this.updateState({ localStream });

      // Initialize peer connection
      await this.initializePeerConnection();

      // Send acceptance
      await this.sendSignalingMessage({
        type: "call-accepted",
        callId: this.currentCallId,
        callerId: this.currentUserId,
        receiverId: this.state.callerId!,
      });

      this.updateState({ status: CallStatus.CONNECTED });
    } catch (error) {
      console.error("Error answering call:", error);
      await this.rejectCall();
      throw error;
    }
  }

  // Reject call
  public async rejectCall() {
    if (!this.currentCallId || !this.state.callerId) return;

    await this.sendSignalingMessage({
      type: "call-rejected",
      callId: this.currentCallId,
      callerId: this.currentUserId,
      receiverId: this.state.callerId,
    });

    await this.cleanup();
  }

  // Handle call accepted
  private async handleCallAccepted(message: SignalingMessage) {
    try {
      await this.initializePeerConnection();

      // Create and send offer
      if (this.peerConnection) {
        const offer = await this.peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: this.state.callType === CallType.VIDEO,
        });
        await this.peerConnection.setLocalDescription(offer);

        await this.sendSignalingMessage({
          type: "offer",
          callId: this.currentCallId!,
          callerId: this.currentUserId,
          receiverId: message.callerId,
          data: offer.toJSON(),
        });
      }

      this.updateState({ status: CallStatus.CONNECTED });
    } catch (error) {
      console.error("Error handling call accepted:", error);
      await this.endCall();
    }
  }

  // Handle call rejected
  private handleCallRejected() {
    this.cleanup();
  }

  // Handle WebRTC offer
  private async handleOffer(message: SignalingMessage) {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(message.data)
      );

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      await this.sendSignalingMessage({
        type: "answer",
        callId: this.currentCallId!,
        callerId: this.currentUserId,
        receiverId: message.callerId,
        data: answer.toJSON(),
      });
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  }

  // Handle WebRTC answer
  private async handleAnswer(message: SignalingMessage) {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(message.data)
      );
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  }

  // Handle ICE candidate
  private async handleIceCandidate(message: SignalingMessage) {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.addIceCandidate(
        new RTCIceCandidate(message.data)
      );
    } catch (error) {
      console.error("Error handling ICE candidate:", error);
    }
  }

  // Toggle audio mute
  public toggleAudioMute() {
    if (!this.state.localStream) return;

    const audioTrack = this.state.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      this.updateState({ isAudioMuted: !audioTrack.enabled });
    }
  }

  // Toggle video mute
  public toggleVideoMute() {
    if (!this.state.localStream || this.state.callType === CallType.AUDIO)
      return;

    const videoTrack = this.state.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      this.updateState({ isVideoMuted: !videoTrack.enabled });
    }
  }

  // Toggle camera (front/back)
  public async switchCamera() {
    if (!this.state.localStream || this.state.callType === CallType.AUDIO)
      return;

    try {
      // Get current video track
      const videoTrack = this.state.localStream.getVideoTracks()[0];
      if (!videoTrack) return;

      // Stop current video track
      videoTrack.stop();

      // Get new stream with opposite camera
      const currentConstraints = videoTrack.getConstraints();
      const newFacingMode =
        currentConstraints.facingMode === "user" ? "environment" : "user";

      const newStream = await mediaDevices.getUserMedia({
        video: {
          ...currentConstraints,
          facingMode: newFacingMode,
        },
        audio: false,
      });

      const newVideoTrack = newStream.getVideoTracks()[0];

      // Replace the track in local stream
      this.state.localStream.removeTrack(videoTrack);
      this.state.localStream.addTrack(newVideoTrack);

      // Replace the track in peer connection
      if (this.peerConnection) {
        const senders = this.peerConnection.getSenders();
        const videoSender = senders.find(
          (sender) => sender.track && sender.track.kind === "video"
        );

        if (videoSender) {
          await videoSender.replaceTrack(newVideoTrack);
        }
      }

      this.updateState({ localStream: this.state.localStream });
      console.log("Switched camera to:", newFacingMode);
    } catch (error) {
      console.error("Error switching camera:", error);
    }
  }

  // Turn camera off/on
  public async toggleCamera() {
    if (!this.state.localStream || this.state.callType === CallType.AUDIO)
      return;

    const videoTrack = this.state.localStream.getVideoTracks()[0];
    if (videoTrack) {
      if (this.state.isCameraOff) {
        // Turn camera on
        const newStream = await this.getUserMedia(CallType.VIDEO);
        const newVideoTrack = newStream.getVideoTracks()[0];

        if (this.peerConnection) {
          const sender = this.peerConnection
            .getSenders()
            .find((s) => s.track?.kind === "video");
          if (sender) {
            await sender.replaceTrack(newVideoTrack);
          }
        }

        videoTrack.stop();
        this.state.localStream.removeTrack(videoTrack);
        this.state.localStream.addTrack(newVideoTrack);

        this.updateState({
          isCameraOff: false,
          localStream: this.state.localStream,
        });
      } else {
        // Turn camera off
        videoTrack.enabled = false;
        this.updateState({ isCameraOff: true });
      }
    }
  }

  // End call
  public async endCall() {
    if (this.currentCallId && this.state.receiverId) {
      const otherUserId =
        this.state.callerId === this.currentUserId
          ? this.state.receiverId
          : this.state.callerId;

      if (otherUserId) {
        try {
          await this.sendSignalingMessage({
            type: "call-ended",
            callId: this.currentCallId,
            callerId: this.currentUserId,
            receiverId: otherUserId,
          });
        } catch (error) {
          console.error("Error sending call-ended signal:", error);
        }
      }
    }

    await this.cleanup();
  }

  // Cleanup resources
  private async cleanup() {
    // Stop all tracks
    if (this.state.localStream) {
      this.state.localStream.getTracks().forEach((track) => {
        track.stop();
        console.log("Stopped track:", track.kind);
      });
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
      console.log("Closed peer connection");
    }

    this.currentCallId = null;

    this.updateState({
      status: CallStatus.IDLE,
      localStream: null,
      remoteStream: null,
      callerId: null,
      receiverId: null,
      isAudioMuted: false,
      isVideoMuted: false,
      isCameraOff: false,
    });
  }

  // Cleanup on unmount
  public destroy() {
    this.cleanup();
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.listeners.clear();
  }

  // Get current state
  public getState(): CallState {
    return this.state;
  }
}
