import ChatScreen from '@/components/ChatScreen';
import { useCheckAuth } from '@/context/AuthContext';
import { useGetById } from '@/hooks/useCrud';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

const Chat = () => {
  const { session } = useCheckAuth();
  const senderId = session?.user?.id!;
  const { patientId } = useLocalSearchParams<{ patientId?: string }>();

  const staleTime = 1000 * 60 * 60 * 24;
  const gcTime = 1000 * 60 * 60 * 24;
  const refetchOnWindowFocus = false;
  const refetchOnReconnect = false;
  const refetchOnMount = false;

  const { data } = useGetById(
    "user",
    { user_id: senderId },
    "therapist(name, therapist_id, authority, license, specialization, summary, years_of_experience, profile_picture)",
    !!senderId,
    {},
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    refetchOnReconnect,
    refetchOnMount
  );

  const therapist = data?.result[0]?.therapist;
  const receiverId = therapist ? therapist?.therapist_id : patientId || "";

  return (

    <ChatScreen
      therapist={therapist}
      senderId={senderId}
      receiverId={receiverId}
    />
  );
};

export default Chat;