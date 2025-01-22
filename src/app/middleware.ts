import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function middleware(req: Request) {
  const token = req.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ message: "Accesso negato: Token mancante" }, { status: 401 });
  }

  try {
    const secretKey = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secretKey);

    // Puoi aggiungere ulteriori controlli qui (es. ruoli)
    req.headers.set("user", JSON.stringify(decoded));

    return NextResponse.next();
  } catch (err) {
    return NextResponse.json({ message: "Accesso negato: Token non valido" }, { status: 403 });
  }
}

export const config = {
  matcher: ["/api/:path*"], // Applica il middleware a tutte le rotte API
};
