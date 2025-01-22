// src/app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../../lib/db"; // Assicurati che il percorso sia corretto

const JWT_SECRET = "secure_jwt_secret_key"; // Cambia con una chiave più sicura.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Dati ricevuti dal form:", body);

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Email e password sono obbligatori" }, { status: 400 });
    }

    // Trova l'utente nel database
    const users = await query("SELECT * FROM users WHERE email = $1", [email]);

    if (users.length === 0) {
      return NextResponse.json({ message: "Credenziali non valide" }, { status: 401 });
    }

    const user = users[0];

    // Confronta la password fornita con quella salvata nel database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Credenziali non valide" }, { status: 401 });
    }

    // Genera un token JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h", // Durata del token
    });
    console.log("useruseruseruseruser:", user.email);
    return NextResponse.json({ token, user: { id: user.id, email: user.email , username: user.username } });
  } catch (error) {
    console.error("Errore durante l'elaborazione della richiesta:", error);
    return NextResponse.json({ message: "Errore interno del server" }, { status: 500 });
  }
}
