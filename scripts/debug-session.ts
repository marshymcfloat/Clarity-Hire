import fetch from "node-fetch";

async function checkSession() {
  const url = "http://localhost:3000/api/auth/session";
  console.log(`Fetching ${url}...`);
  try {
    const res = await fetch(url, { redirect: "manual" });
    console.log("Status:", res.status);
    console.log("Status Text:", res.statusText);
    console.log(
      "Headers:",
      JSON.stringify(Object.fromEntries(res.headers.entries()), null, 2),
    );
    const text = await res.text();
    console.log("Body:", text);
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

checkSession();
