"use client";


import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "To do",
    time_estimation: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const userData = localStorage.getItem("user");
  useEffect(() => {
    const token = localStorage.getItem("token");
 // Recupera i dati dell'utente da localStorage
 

    if (!token) {
      router.push("/");
      return;
    }

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setUser(decoded);
      fetchTasks(token);
    } catch (err) {
      console.error("Token non valido:", err);
      router.push("/login");
    }
  }, []);

  const fetchTasks = async (token: string) => {
    try {
      const response = await fetch("/api/tasks/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Errore durante il recupero dei task");
      }

      const data = await response.json();
      setTasks(data.tasks);
    } catch (err) {
      console.error("Errore nel recupero dei task:", err);
    }
  };


  const deleteTask = async (taskId: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this task?");

    if (!confirmed) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`/api/tasks/delete/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Errore durante l'eliminazione del task");
      }

      // Rimuovere il task dalla lista
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      fetchTasks(token);
    } catch (err) {
      console.error("Errore nell'eliminazione del task:", err);
    }
  };

  const addTask = async () => {
    const token = localStorage.getItem("token");
  
    // Controlla se i dati necessari sono validi
    if (!token || !newTask.title.trim() || !newTask.status || newTask.time_estimation <= 0) {
        alert("I dati del task non sono validi:");
      console.error("I dati del task non sono validi:", newTask);
      return;
    }
  
    try {
      const response = await fetch("/api/tasks/add/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          status: newTask.status,
          time_estimation: newTask.time_estimation,
          user_id: user?.userId, // Assicurati che l'ID dell'utente venga passato correttamente
        }),
      });
  
      if (!response.ok) {
        throw new Error("Errore durante la creazione del task");
      }
  
      const data = await response.json();
  
      // Aggiungi il nuovo task alla lista esistente
      setTasks((prevTasks) => [...prevTasks, data]);
  
      // Resetta i dati del nuovo task
      setNewTask({
        title: "",
        description: "",
        status: "To do",
        time_estimation: 0,
      });
  
      setIsModalOpen(false); // Chiudi il modal se presente
      // Ricarica la lista dei task dopo aver aggiunto il nuovo task

      fetchTasks(token);

     
  
    } catch (err) {
      console.error("Errore nella creazione del task:", err);
    }
  };

  const handleLogout = () => {
    // Rimuovi il token e i dati dell'utente da localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Reindirizza alla pagina di login
    router.push("/");
  };


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Welcome Dashboard</h1>
          {<p className="text-gray-600 mt-2">User:  {userData}</p>}
        </div>

        <div className="mb-4 text-right">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg"
          >
        Add task
          </button>
          <button
            onClick={handleLogout}
            className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["To do", "In Progress", "Done"].map((status) => (
            <div key={status} className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{status}</h2>
              <ul className="space-y-3">
                {tasks
                  .filter((task) => task.status === status)
                  .map((task) => (
                    <li
                      key={task.id}
                      className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition"
                    >
                      <h3 className="text-lg font-semibold">{task.title}</h3>
                      <p className="text-sm text-gray-500">Time estimation: {task.time_estimation} hour</p>
                      <p className="text-sm text-gray-500">Status: {task.status}</p>
                      <div className="flex justify-between">
                        <button
                          onClick={() => router.push(`/task/${task.id}`)}
                          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
              <h3 className="text-2xl font-bold mb-4">Add a new task</h3>
              <input
                type="text"
                placeholder="Task Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full mb-4 p-2 border rounded"
              />
              <textarea
                placeholder="Task Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full mb-4 p-2 border rounded"
              />
              <select
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                className="w-full mb-4 p-2 border rounded"
              >
                <option value="To do">To do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
              <input
                type="number"
                placeholder="Tempo stimato (ore)"
                value={newTask.time_estimation}
                onChange={(e) =>
                  setNewTask({ ...newTask, time_estimation: Number(e.target.value) })
                }
                className="w-full mb-4 p-2 border rounded"
              />
              <div className="flex justify-between">
                <button
                  onClick={addTask}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  Aggiungi
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;


 