import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { loopsOnUserRegistered } from "@/lib/loops";
import { attioOnUserRegistered } from "@/lib/attio";
import { verifyTurnstileToken } from "@/lib/turnstile-server";
import { rateLimit, getClientIp } from "@/lib/rate-limiter";

// Max password length — bcrypt silently truncates at 72 bytes anyway,
// and hashing very long strings is a DoS vector.
const MAX_PASSWORD_LENGTH = 72;

export async function POST(req: Request) {
  try {
    // ── Rate Limiting (5 registrations per IP per minute) ──────────────────
    const ip = getClientIp(req);
    const { allowed } = rateLimit(`register:${ip}`, 5, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again in a minute." },
        { status: 429 }
      );
    }

    const { email, password, name, captchaToken } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // ── Input validation ────────────────────────────────────────────────────
    if (typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (typeof password !== "string") {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    // Fix #3: Bcrypt DoS prevention — reject overly long passwords
    if (password.length > MAX_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must not exceed ${MAX_PASSWORD_LENGTH} characters.` },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    // Fix #2: Server-side CAPTCHA verification (was missing from this route)
    const ipnSecret = process.env.TURNSTILE_SECRET_KEY;
    if (ipnSecret) {
      const captchaOk = await verifyTurnstileToken(captchaToken || "");
      if (!captchaOk) {
        return NextResponse.json(
          { error: "CAPTCHA verification failed. Please try again." },
          { status: 403 }
        );
      }
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Fix #5: Use consistent work factor = 12 (more secure, was 10 before)
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,
        display_name: name || null,
        emailVerified: email === process.env.ADMIN_EMAIL ? new Date() : null,
      },
    });

    loopsOnUserRegistered({ email: user.email, name: name || undefined });
    attioOnUserRegistered({ userId: user.id, email: user.email, name: name || undefined });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (err: any) {
    console.error("Registration Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
