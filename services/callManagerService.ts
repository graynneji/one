// services/callManager.ts
import { Client } from "@/utils/client";
import { webRTCService } from "./webRTCService";

interface CallSession {
  id: number | string;
  caller_id: string;
  receiver_id: string;
  call_type: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  ended_at?: string;
  duration?: number;
  [key: string]: any;
}

interface SignalPayload {
  id: number | string;
  call_session_id: number | string;
  from_user_id: string;
  to_user_id: string;
  signal_type: string;
  signal_data: any;
  is_processed?: boolean;
}

class CallManager extends Client {
  private currentCall: CallSession | null = null;
  private signalingSubscription: any = null;
  private userId?: string;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor() {
    super();
  }

  // Initialize call manager
  initialize(userId: string) {
    this.userId = userId;
    this.setupSignalingSubscription();
  }

  // Make a call
  async makeCall(receiverId: string, callType: string = "audio") {
    try {
      const { data: callSession, error } = await this.supabase
        .from("call_sessions")
        .insert({
          caller_id: this.userId,
          receiver_id: receiverId,
          call_type: callType,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      this.currentCall = callSession as CallSession;
      return callSession;
    } catch (error) {
      console.error("Error making call:", error);
      throw error;
    }
  }

  // Answer a call
  async answerCall(callSessionId: string | number) {
    try {
      const { error } = await this.supabase
        .from("call_sessions")
        .update({
          status: "accepted",
          updated_at: new Date().toISOString(),
        })
        .eq("id", callSessionId);

      if (error) throw error;

      if (this.currentCall) {
        this.currentCall = { ...this.currentCall, status: "accepted" };
      }
    } catch (error) {
      console.error("Error answering call:", error);
      throw error;
    }
  }

  // End a call
  async endCall(callSessionId: string | number) {
    try {
      const endedAt = new Date().toISOString();
      const duration = this.currentCall?.created_at
        ? Math.floor(
            (new Date(endedAt).getTime() -
              new Date(this.currentCall.created_at).getTime()) /
              1000
          )
        : 0;

      const { error } = await this.supabase
        .from("call_sessions")
        .update({
          status: "ended",
          ended_at: endedAt,
          duration,
        })
        .eq("id", callSessionId);

      if (error) throw error;

      await webRTCService.sendSignal("end-call", {});
      this.currentCall = null;
      await webRTCService.cleanup();
    } catch (error) {
      console.error("Error ending call:", error);
      throw error;
    }
  }

  // Set up real-time signaling
  setupSignalingSubscription() {
    if (!this.userId) return;

    this.signalingSubscription = this.supabase
      .channel("webrtc_signaling")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "webrtc_signaling",
          filter: `to_user_id=eq.${this.userId}`,
        },
        (payload: { new: SignalPayload }) => {
          this.handleIncomingSignal(payload.new);
        }
      )
      .subscribe();
  }

  // Handle incoming signaling messages
  async handleIncomingSignal(signal: SignalPayload) {
    try {
      switch (signal.signal_type) {
        case "offer":
          await webRTCService.handleOffer(signal.signal_data);
          break;
        case "answer":
          await webRTCService.handleAnswer(signal.signal_data);
          break;
        case "ice-candidate":
          await webRTCService.handleICECandidate(signal.signal_data);
          break;
        case "end-call":
          await this.handleRemoteEndCall();
          break;
      }

      await this.supabase
        .from("webrtc_signaling")
        .update({ is_processed: true })
        .eq("id", signal.id);
    } catch (error) {
      console.error("Error handling signal:", error);
    }
  }

  async handleRemoteEndCall() {
    if (this.currentCall) {
      await this.endCall(this.currentCall.id);
      // Optional: notify UI
    }
  }

  // Clean up
  cleanup() {
    if (this.signalingSubscription) {
      this.signalingSubscription.unsubscribe();
      this.signalingSubscription = null;
    }
    this.currentCall = null;
  }
}

export const callManager = new CallManager();
