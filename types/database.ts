export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "super_admin" | "coach" | "student";
          full_name: string;
          email: string;
          phone: string | null;
          cpf: string | null;
          status: "active" | "inactive" | "blocked";
          plan: string | null;
          coach_id: string | null;
          created_at: string;
          notes: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string; role: "super_admin" | "coach" | "student"; full_name: string; email: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      students: {
        Row: {
          id: string;
          coach_id: string;
          auth_user_id: string | null;
          name: string;
          phone: string | null;
          email: string;
          birth_date: string | null;
          sex: "feminino" | "masculino" | "outro" | null;
          weight: number | null;
          height: number | null;
          goal: string | null;
          level: "iniciante" | "intermediario" | "avancado";
          status: "active" | "inactive" | "blocked";
          notes: string | null;
          joined_at: string;
          photo_url: string | null;
          diet_frequency_days: number;
          workout_frequency_days: number;
          protocol_frequency_days: number;
        };
        Insert: Partial<Database["public"]["Tables"]["students"]["Row"]> & { coach_id: string; name: string; email: string };
        Update: Partial<Database["public"]["Tables"]["students"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
