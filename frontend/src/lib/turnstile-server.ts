// Server-only Turnstile verification utility
// Do NOT import client-side Turnstile component here

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Skip verification in dev if key not configured
    console.warn("[Turnstile] TURNSTILE_SECRET_KEY not set — skipping captcha verification.");
    return true;
  }

  if (!token) return false;

  const formData = new URLSearchParams();
  formData.append("secret", secret);
  formData.append("response", token);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!data.success) {
      console.error("[Turnstile] Verification failed:", data);
    }
    return data.success === true;
  } catch (err) {
    console.error("[Turnstile] Verification request failed:", err);
    return false;
  }
}
