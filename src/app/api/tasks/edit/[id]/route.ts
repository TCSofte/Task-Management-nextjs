import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { query } from "../../../../lib/db"; // Assicurati che questa funzione interagisca correttamente con il tuo DB

const JWT_SECRET = "secure_jwt_secret_key"; // Cambia con una chiave più sicura

export async function PUT(req: Request, { params }: { params: { id: string } }) {
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

    // Estrai i dati dal corpo della richiesta
    const { title, description, status, time_estimation } = await req.json();

    // Verifica che i dati siano validi
    if (!title || !description || !status || !time_estimation) {
      return NextResponse.json({ message: "Dati mancanti nel corpo della richiesta" }, { status: 400 });
    }

    // Aggiorna il task nel database
    const result = await query(
      "UPDATE tasks SET title = $1, description = $2, status = $3, time_estimation = $4 WHERE id = $5 AND user_id = $6 RETURNING *",
      [title, description, status, time_estimation, params.id, decoded.userId]
    );

    // Verifica se il task è stato aggiornato correttamente
    if (result && result[0]) {
      return NextResponse.json({ message: "Task aggiornato con successo", task: result[0] }, { status: 200 });
    } else {
      return NextResponse.json({ message: "Task non trovato o non autorizzato a modificarlo" }, { status: 404 });
    }
  } catch (error) {
    console.error("Errore durante l'aggiornamento del task:", error);
    return NextResponse.json({ message: "Errore interno del server", error: error }, { status: 500 });
  }
}
