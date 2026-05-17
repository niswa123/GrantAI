import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { loopsOnUserRegistered } from "@/lib/loops";
import { attioOnUserRegistered } from "@/lib/attio";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user only — company is created during the /onboarding flow
    const user = await prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,
        display_name: name || null,
      },
    });

    // 📣 Add to Loops marketing drip sequence (fire-and-forget, never blocks registration)
    loopsOnUserRegistered({ email: user.email, name: name || undefined });

    // 🏢 Sync to Attio CRM — enriches contact with company/LinkedIn data automatically
    attioOnUserRegistered({ userId: user.id, email: user.email, name: name || undefined });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (err: any) {
    console.error("Registration Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

