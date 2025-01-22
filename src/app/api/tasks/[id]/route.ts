import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { query } from "../../../lib/db"; // Assicurati che questa funzione interagisca correttamente con il tuo DB

const JWT_SECRET = "secure_jwt_secret_key"; // Cambia con una chiave più sicura

export async function GET(req: Request, { params }: { params: { id: string } }) {
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

    // Estrai l'id del task dai parametri
    const { id } = params;

    // Esegui la query per recuperare il task dal database
    const result = await query(
      "SELECT * FROM tasks WHERE id = $1 AND user_id = $2",
      [id, decoded.userId]
    );

    // Verifica se il task è stato trovato
    if (result.length === 0) {
      return NextResponse.json({ message: "Task non trovato o accesso non autorizzato" }, { status: 404 });
    }

    // Restituisci il task trovato
    return NextResponse.json({ task: result[0] });
  } catch (error) {
    console.error("Errore durante il recupero del task:", error);
    return NextResponse.json({ message: "Errore interno del server", error: error }, { status: 500 });
  }
}
