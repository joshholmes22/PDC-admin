import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://abtpozgrnhgcsmcfoiyo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFidHBvemdybmhnY3NtY2ZvaXlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3MTAxNjEsImV4cCI6MjA1OTI4NjE2MX0.ENXYvjZfZtnhyj0i64CepSemLFketpwK0TDrWPVgyFw"
);

async function compareDates() {
  console.log("Current date:", new Date().toISOString());
  console.log(
    "7 days ago:",
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  );

  // Get last 7 days of App_Opened events from our DB
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from("AnalyticsEvents")
    .select("created_at, user_id, event_name")
    .eq("event_name", "App_Opened")
    .gte("created_at", sevenDaysAgo)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("\nOur DB - App_Opened events last 7 days:");
  console.log("Total events:", data.length);

  // Group by date
  const dailyCounts = {};
  data.forEach((event) => {
    const date = event.created_at.split("T")[0];
    if (!dailyCounts[date]) {
      dailyCounts[date] = new Set();
    }
    if (event.user_id) {
      dailyCounts[date].add(event.user_id);
    }
  });

  console.log("\nDaily unique users (App_Opened):");
  Object.entries(dailyCounts)
    .sort()
    .forEach(([date, users]) => {
      console.log(`${date}: ${users.size} users`);
    });
}

compareDates().catch(console.error);
