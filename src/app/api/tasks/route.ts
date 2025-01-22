import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { query } from "../../lib/db";

const JWT_SECRET = "secure_jwt_secret_key"; // Cambia con una chiave più sicura.

export async function GET(req: Request) {
  // Estrai il token JWT dall'intestazione Authorization
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Accesso negato: Token non fornito" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verifica e decodifica il token JWT
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ message: "Accesso negato: Token non valido" }, { status: 401 });
    }

    // Recupera i task dal database per l'utente loggato
    const tasks = await query("SELECT * FROM tasks WHERE user_id = $1", [decoded.userId]);
    // console.log(tasks);
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Errore durante l'autenticazione o il recupero dei task:", error);
    return NextResponse.json(
      { message: "Errore durante il recupero dei task o autenticazione" },
      { status: 500 }
    );
  }
}
