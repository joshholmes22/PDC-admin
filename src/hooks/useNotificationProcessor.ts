import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export function useNotificationProcessor() {
  const intervalRef = useRef<number | null>(null);

  const processNotifications = async () => {
    try {
      console.log("🔄 Checking for pending notifications...");

      // Call our Edge Function to process notifications
      const { error } = await supabase.functions.invoke(
        "process-notifications"
      );

      if (error) {
        console.warn("⚠️ Notification processing warning:", error);
      } else {
        console.log("✅ Notification processing completed");
      }
    } catch (error) {
      console.error("❌ Notification processing error:", error);
    }
  };

  useEffect(() => {
    // Process immediately on mount
    processNotifications();

    // Then every minute (60 seconds)
    intervalRef.current = setInterval(processNotifications, 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Return manual trigger function
  return { triggerProcessing: processNotifications };
}
