import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { query } from "../../../lib/db"; // Assicurati che questa funzione interagisca correttamente con il tuo DB

const JWT_SECRET = "secure_jwt_secret_key"; // Cambia con una chiave più sicura

export async function POST(req: Request) {
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

    // Estrai i dati dal corpo della richiesta
    const { title, description, status, time_estimation } = await req.json();
   
    // Verifica che i dati siano validi
    if (!title || !description || !status || !time_estimation) {
      return NextResponse.json({ message: "Dati mancanti nel corpo della richiesta" }, { status: 400 });
    }

   

    try {
      const result = await query(
        "INSERT INTO tasks (title, description, status, time_estimation, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [title, description, status, time_estimation, decoded.userId]
      );
    
 
    
      // Verifica se il risultato è valido e contiene il task inserito
      if (result && result[0] && result[0].id) {
        const taskId = result[0].id;
        console.error("Task inserito con successo, ID:", taskId);
        return NextResponse.json({ message: "Task creato con successo", id: taskId }, { status: 201 });
      } else {
        console.error("Errore: risultato della query è vuoto o malformato");
        console.error("result:", result);
        return NextResponse.json({ message: "Errore durante l'inserimento del task", result: result }, { status: 500 });
      }
    } catch (error) {
      console.error("Errore durante l'inserimento:", error);
      return NextResponse.json({ message: "Errore interno del server", error: error }, { status: 500 });
    }
    
      

  

   

    
  } catch (error) {
    console.error("Errore durante l'inserimento:", error);
    return NextResponse.json({ message: "Errore interno del server", error: error }, { status: 500 });
  }
}

