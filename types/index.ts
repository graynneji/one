export interface Patients {
  id: number;
  name: string;
  appointment?: string;
  patient_id: string;
  created_at: string;
  is_subscribed?: boolean;
  subscription?: "active" | "inactive" | "pending";
  therapist?: number;
  patient_notes: [];
  profile_picture: string;
}

interface Result {
  id: string;
  balance: number;
  pending: number;
  total_earning: number;
  [key: string]: any;
}

export interface PatientNote {
  id: string;
  date: string;
  content: string;
  type: "session" | "observation" | "goal" | "reminder";
  is_private: boolean;
  created_at: string;
}

export const NOTE_TYPES = [
  { value: "session", label: "Session Note" },
  { value: "observation", label: "Observation" },
  { value: "goal", label: "Goal" },
  { value: "reminder", label: "Reminder" },
];

export interface TherapistData {
  data?: Result[];
  [key: string]: any;
}

export type sendMessage = {
  message: string;
  sender_id: string;
  reciever_id: string;
  appointment_id: number;
};
