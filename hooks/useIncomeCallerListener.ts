import { useCheckAuth } from "@/context/AuthContext";
import { webRTCService } from "@/services/webRTCService";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

interface IncomingCall {
  id: string;
  caller_id: string;
  caller_name: string;
  call_type: "audio" | "video";
  status: string;
}

export const useIncomingCallListener = () => {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [isCallModalVisible, setIsCallModalVisible] = useState(false);
  const { session } = useCheckAuth();
  const router = useRouter();

  useEffect(() => {
    if (!session?.user?.id) return;

    let callChannel: RealtimeChannel;

    const setupCallListener = async () => {
      console.log(
        "Setting up incoming call listener for user:",
        session.user.id
      );

      // Subscribe to call_sessions table for incoming calls
      callChannel = webRTCService.supabase
        .channel(`incoming-calls-${session.user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "call_sessions",
            filter: `callee_id=eq.${session.user.id}`,
          },
          async (payload: any) => {
            console.log("Incoming call received:", payload.new);
            const callData = payload.new;

            // Only show if status is 'ringing'
            if (callData.status === "ringing") {
              // Fetch caller info
              const { data: callerData } = await webRTCService.supabase
                .from("profiles")
                .select("full_name, first_name, last_name")
                .eq("id", callData.caller_id)
                .single();

              const callerName =
                callerData?.full_name ||
                callerData?.first_name ||
                callerData?.last_name ||
                "Unknown Caller";

              setIncomingCall({
                id: callData.id,
                caller_id: callData.caller_id,
                caller_name: callerName,
                call_type: callData.call_type,
                status: callData.status,
              });

              setIsCallModalVisible(true);

              // Auto-reject after 60 seconds
              setTimeout(() => {
                if (isCallModalVisible) {
                  handleRejectCall();
                }
              }, 60000);
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "call_sessions",
            filter: `callee_id=eq.${session.user.id}`,
          },
          (payload: any) => {
            console.log("Call status updated:", payload.new);
            const callData = payload.new;

            // If call was ended or cancelled by caller, hide modal
            if (
              callData.status === "ended" ||
              callData.status === "cancelled"
            ) {
              if (incomingCall?.id === callData.id) {
                setIsCallModalVisible(false);
                setIncomingCall(null);
              }
            }
          }
        )
        .subscribe((status) => {
          console.log("Call listener status:", status);
        });
    };

    setupCallListener();

    return () => {
      if (callChannel) {
        callChannel.unsubscribe();
      }
    };
  }, [session?.user?.id]);

  const handleAnswerCall = async () => {
    if (!incomingCall) return;

    try {
      console.log("Answering call:", incomingCall.id);

      // Update call status to ongoing
      await webRTCService.supabase
        .from("call_sessions")
        .update({
          status: "ongoing",
          started_at: new Date().toISOString(),
        })
        .eq("id", incomingCall.id);

      // Hide modal
      setIsCallModalVisible(false);

      // Navigate to call screen
      router.push({
        pathname: "/call",
        params: {
          callSessionId: incomingCall.id,
          isVideo: incomingCall.call_type === "video" ? "true" : "false",
          isCaller: "false",
          otherUserId: incomingCall.caller_id,
          otherUserName: incomingCall.caller_name,
        },
      });

      // Clear incoming call
      setIncomingCall(null);
    } catch (error) {
      console.error("Error answering call:", error);
      Alert.alert("Error", "Failed to answer call");
    }
  };

  const handleRejectCall = async () => {
    if (!incomingCall) return;

    try {
      console.log("Rejecting call:", incomingCall.id);

      // Update call status to ended
      await webRTCService.supabase
        .from("call_sessions")
        .update({
          status: "ended",
          ended_at: new Date().toISOString(),
        })
        .eq("id", incomingCall.id);

      // Hide modal
      setIsCallModalVisible(false);

      // Clear incoming call
      setIncomingCall(null);
    } catch (error) {
      console.error("Error rejecting call:", error);
      Alert.alert("Error", "Failed to reject call");
    }
  };

  return {
    incomingCall,
    isCallModalVisible,
    handleAnswerCall,
    handleRejectCall,
  };
};
