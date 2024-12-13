import { getSession } from "@/session/sessionUtils";
import { NextResponse, NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  console.log("pathname", pathname);

  if (!session?.token && pathname !== "/") {
    console.log("redirecting to /");
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname === "/" && session?.token) {
    console.log("redirecting to /home");
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ["/", "/home"] };
