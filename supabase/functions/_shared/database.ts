// Simplified database types for Edge Functions
export interface Database {
  public: {
    Tables: {
      AppUser: {
        Row: {
          id: string;
          authUserID: string;
          firstName: string | null;
          lastName: string | null;
          pushToken: string | null;
          notificationsEnabled: boolean | null;
          email: string | null;
          role: "user" | "admin" | "super_admin";
        };
      };
      scheduled_notifications: {
        Row: {
          id: string;
          title: string;
          body: string;
          scheduled_for: string;
          status: "pending" | "sent" | "failed" | "cancelled";
          target_audience: any;
          data: any;
          created_at: string;
          updated_at: string;
          sent_at: string | null;
          created_by: string | null;
          error_message: string | null;
        };
      };
    };
  };
}
