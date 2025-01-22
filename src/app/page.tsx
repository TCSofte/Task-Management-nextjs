"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);

  // Stato per il login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Stato per la registrazione
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",

  });
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  // Funzione per il login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.message || "Errore durante il login");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", data.user.username);

      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      setLoginError("Errore durante il login");
    }
  };

  // Funzione per gestire il cambiamento degli input di registrazione
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Funzione per la registrazione
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    setRegisterSuccess(null);

  
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setRegisterError(data.message || "Errore durante la registrazione");
        return;
      }

      setRegisterSuccess("Registrazione completata con successo!");
      setRegisterData({
        username: "",
        email: "",
        password: "",
       
      });
    } catch (err) {
      console.error(err);
      setRegisterError("Errore durante la registrazione");
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-3xl font-bold mb-4">Welcome</h1>
        <h3 className="text-3xl font-bold mb-4">Task Management App</h3>

        {/* Toggle tra Login e Register */}
        <div className="flex gap-4 mb-4">
          <button
            className={`px-4 py-2 rounded-full ${
              isLogin ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`px-4 py-2 rounded-full ${
              !isLogin ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        {/* Login Form */}
        {isLogin ? (
          <form
            className="flex flex-col gap-4 w-full sm:w-96"
            onSubmit={handleLogin}
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md"
              required
            />
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button
              type="submit"
              className="bg-blue-500 text-white rounded-full py-2 mt-4"
            >
              Login
            </button>
          </form>
        ) : (
          // Registration Form
          <form
            className="flex flex-col gap-4 w-full sm:w-96"
            onSubmit={handleRegister}
          >
            <input
              type="text"
              name="username"
              placeholder="User Name"
              value={registerData.username}
              onChange={handleRegisterChange}
              className="px-4 py-2 border border-gray-300 rounded-md"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={registerData.email}
              onChange={handleRegisterChange}
              className="px-4 py-2 border border-gray-300 rounded-md"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={registerData.password}
              onChange={handleRegisterChange}
              className="px-4 py-2 border border-gray-300 rounded-md"
              required
            />
      
            {registerError && (
              <p className="text-red-500 text-sm">{registerError}</p>
            )}
            {registerSuccess && (
              <p className="text-green-500 text-sm">{registerSuccess}</p>
            )}
            <button
              type="submit"
              className="bg-blue-500 text-white rounded-full py-2 mt-4"
            >
              Register
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
