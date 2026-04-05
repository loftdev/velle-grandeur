import { NextResponse } from "next/server";

export function jsonError(code: string, message: string, status: number) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
      },
    },
    { status },
  );
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
