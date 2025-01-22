"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const TaskDetails = () => {
  const { id } = useParams(); // Ottieni l'ID dalla route
  const [task, setTask] = useState<any>(null);
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false); // Stato per la modale di modifica
  const [updatedTask, setUpdatedTask] = useState<any>(null); // Stato per i dati aggiornati

  useEffect(() => {
    if (!id) return;

    const fetchTaskDetails = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`/api/tasks/${id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTask(data.task);
        } else {
          console.error("Errore nel recupero dei dettagli del task");
        }
      } catch (error) {
        console.error("Errore di connessione:", error);
      }
    };

    fetchTaskDetails();
  }, [id]);

  // Funzione per tornare alla dashboard
  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  // Funzione per aprire la modale di modifica
  const handleEditTask = () => {
    setUpdatedTask(task); // Carica i dati del task nella modale
    setIsEditing(true); // Mostra la modale
  };

  // Funzione per gestire la modifica del task
  const handleSaveEdit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`/api/tasks/edit/${id}`, {
        method: "PUT", // Metodo PUT per l'aggiornamento
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      });

      if (response.ok) {
        const data = await response.json();
        setTask(data.task); // Aggiorna i dettagli del task
        setIsEditing(false); // Chiudi la modale
      } else {
        console.error("Errore nell'aggiornamento del task");
      }
    } catch (error) {
      console.error("Errore di connessione:", error);
    }
  };

  // Funzione per chiudere la modale senza salvare
  const handleCloseModal = () => {
    setIsEditing(false);
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      {task ? (
        <>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{task.title}</h1>
          <p className="text-lg text-gray-700 mb-4">{task.description}</p>
          <div className="flex items-center space-x-4 mb-6">
            <span className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg">
              {task.status} 
            </span>
               <p className="text-sm text-gray-500">Time estimation: {task.time_estimation} hour</p>
            <p className="text-sm text-gray-500">
              <span className="font-semibold">Creazione:</span> {new Date(task.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-sm text-gray-600">{task.description || "Nessun dettaglio aggiuntivo."}</p>
          </div>

          {/* Aggiungi i tasti "Torna alla Dashboard" e "Modifica Task" */}
          <div className="flex space-x-4">
            <button
              onClick={handleBackToDashboard}
              className="px-6 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition"
            >
              Back To Dashboard
            </button>
            <button
              onClick={handleEditTask}
              className="px-6 py-2 text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 transition"
            >
              Edit Task
            </button>
          </div>

          {/* Modale di modifica */}
          {isEditing && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
                <h2 className="text-2xl font-bold mb-4">Modifica Task</h2>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Titolo</label>
                  <input
                    type="text"
                    value={updatedTask?.title || ""}
                    onChange={(e) => setUpdatedTask({ ...updatedTask, title: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Descrizione</label>
                  <textarea
                    value={updatedTask?.description || ""}
                    onChange={(e) => setUpdatedTask({ ...updatedTask, description: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stato</label>
                  <select
                    value={updatedTask?.status || ""}
                    onChange={(e) => setUpdatedTask({ ...updatedTask, status: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="To do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={handleCloseModal}
                    className="px-6 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Salva
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-gray-500">Caricamento...</p>
      )}
    </div>
  );
};

export default TaskDetails;
