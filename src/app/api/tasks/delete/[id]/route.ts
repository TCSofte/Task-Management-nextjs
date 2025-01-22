import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { query } from "../../../../lib/db"; // Importa la funzione per interagire con il DB

const JWT_SECRET = "secure_jwt_secret_key"; // Cambia con una chiave più sicura

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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

    // Ottieni i parametri dinamici dalla URL e attendi la risoluzione
    const { id } = await params; // `params` deve essere "awaited"
    const taskId = parseInt(id, 10);

    // Controlla se l'ID del task è valido
    if (isNaN(taskId)) {
      return NextResponse.json({ message: "ID del task non valido" }, { status: 400 });
    }

    // Esegui la query SQL per eliminare il task dal database
    const result = await query("DELETE FROM tasks WHERE id = $1 AND user_id = $2", [taskId, decoded.userId]);

    if (result.rowCount === 0) {
      return NextResponse.json({ message: "Task non trovato o non autorizzato" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task eliminato con successo" }, { status: 200 });
  } catch (error) {
    console.error("Errore durante l'eliminazione:", error);
    return NextResponse.json({ message: "Errore interno del server" }, { status: 500 });
  }
}


