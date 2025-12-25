const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://abtpozgrnhgcsmcfoiyo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFidHBvenYybmhnY3NtY2ZvaXlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcyNDMxNzgsImV4cCI6MjA0MjgxOTE3OH0.8gfrD4oJhYrKJU7PKI9K5SfWjKLGdLZbhd_wqI5YhKU"
);

async function checkDAU() {
  // Get last 7 days of events
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  console.log("Checking events from:", sevenDaysAgo);

  const { data, error } = await supabase
    .from("AnalyticsEvents")
    .select("created_at, user_id, event_name")
    .gte("created_at", sevenDaysAgo)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("Total events found:", data.length);

  // Group by date and count unique users for App_Opened specifically
  const appOpenEvents = data.filter((e) => e.event_name === "App_Opened");
  console.log("App_Opened events:", appOpenEvents.length);

  const appOpenDaily = {};
  appOpenEvents.forEach((event) => {
    const date = event.created_at.split("T")[0];
    if (!appOpenDaily[date]) {
      appOpenDaily[date] = new Set();
    }
    if (event.user_id) {
      appOpenDaily[date].add(event.user_id);
    }
  });

  console.log("\nApp_Opened unique users by date (like PostHog DAU):");
  Object.entries(appOpenDaily)
    .sort()
    .forEach(([date, users]) => {
      console.log(date + ":", users.size, "unique users");
    });

  // Also check all engagement events (what we're currently counting)
  const engagementEvents = data.filter((e) =>
    [
      "App_Opened",
      "App_Backgrounded",
      "Video_Viewed",
      "Video_Progress",
      "Practice_Session_Added",
      "User_Logged_In",
    ].includes(e.event_name)
  );

  const allEngagementDaily = {};
  engagementEvents.forEach((event) => {
    const date = event.created_at.split("T")[0];
    if (!allEngagementDaily[date]) {
      allEngagementDaily[date] = new Set();
    }
    if (event.user_id) {
      allEngagementDaily[date].add(event.user_id);
    }
  });

  console.log(
    "\nAll engagement events unique users by date (our current calculation):"
  );
  Object.entries(allEngagementDaily)
    .sort()
    .forEach(([date, users]) => {
      console.log(date + ":", users.size, "unique users");
    });
}

checkDAU();
