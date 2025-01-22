import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../../lib/db"; // Funzione per interagire con il database

const JWT_SECRET = "secure_jwt_secret_key"; // Cambia con una chiave sicura.

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { username, email, password } = body;

    // Validazioni di base
    if (!username || !email || !password ) {
      return NextResponse.json(
        { message: "Tutti i campi sono obbligatori" },
        { status: 400 }
      );
    }



    // Controlla se l'email è già registrata
    const userExists = await query("SELECT * FROM users WHERE email = $1", [email]);

    if (userExists.length > 0) {
      return NextResponse.json(
        { message: "Email già registrata" },
        { status: 400 }
      );
    }

    // Cripta la password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Salva il nuovo utente nel database
    const result = await query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id",
      [username, email, hashedPassword]
    );

    const userId = result[0]?.id;

    // Genera un token JWT
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1d" });

    return NextResponse.json({
      message: "Registrazione completata",
      token,
    });
  } catch (error) {
    console.error("Errore durante la registrazione:", error);
    return NextResponse.json(
      { message: "Errore interno del server" },
      { status: 500 }
    );
  }
}
