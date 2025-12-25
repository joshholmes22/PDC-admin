console.log("Starting DAU check...");

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://abtpozgrnhgcsmcfoiyo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFidHBvenYybmhnY3NtY2ZvaXlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcyNDMxNzgsImV4cCI6MjA0MjgxOTE3OH0.8gfrD4oJhYrKJU7PKI9K5SfWjKLGdLZbhd_wqI5YhKU"
);

async function checkEvents() {
  console.log("Querying events...");

  const { data, error } = await supabase
    .from("AnalyticsEvents")
    .select("created_at, user_id, event_name")
    .gte("created_at", "2024-11-20T00:00:00Z")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("Total events found:", data.length);

  // Get App_Opened events only
  const appOpenEvents = data.filter((e) => e.event_name === "App_Opened");
  console.log("App_Opened events:", appOpenEvents.length);

  // Count DAU for November 27, 2024
  const nov27Events = data.filter((e) => e.created_at.includes("2024-11-27"));
  const nov27AppOpenEvents = appOpenEvents.filter((e) =>
    e.created_at.includes("2024-11-27")
  );

  console.log("Nov 27 total events:", nov27Events.length);
  console.log("Nov 27 App_Opened events:", nov27AppOpenEvents.length);

  const nov27UniqueUsers = new Set();
  const nov27AppOpenUniqueUsers = new Set();

  nov27Events.forEach((e) => {
    if (e.user_id) nov27UniqueUsers.add(e.user_id);
  });

  nov27AppOpenEvents.forEach((e) => {
    if (e.user_id) nov27AppOpenUniqueUsers.add(e.user_id);
  });

  console.log("Nov 27 unique users (all events):", nov27UniqueUsers.size);
  console.log(
    "Nov 27 unique users (App_Opened only):",
    nov27AppOpenUniqueUsers.size
  );
}

checkEvents();
