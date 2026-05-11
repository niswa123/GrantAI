import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

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

    // Create the user and a default workspace for them in a single transaction
    const user = await prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,
        display_name: name || null,
        companies: {
          create: {
            name: name ? `${name}'s Workspace` : "My Workspace",
            country: "Netherlands", // Default mock country
          }
        }
      },
      include: {
        companies: true
      }
    });

    // Automatically add the user as an Admin in the CompanyMember table for their own company
    if (user.companies.length > 0) {
      await prisma.companyMember.create({
        data: {
          user_id: user.id,
          company_id: user.companies[0].id,
          role: "Admin",
          status: "Active"
        }
      });
    }

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (err: any) {
    console.error("Registration Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
