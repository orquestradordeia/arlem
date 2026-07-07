import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    publicKey: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY,
  });
}
