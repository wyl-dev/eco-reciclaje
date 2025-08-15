import React, { useState } from "react";

const TABS = [
  { label: "Información de usuario" },
  { label: "Solicitar recolección" },
  { label: "Mis recolecciones" },
];

const UserDashboardTabs = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Panel de Usuario</h2>
      <div className="flex gap-2 mb-6">
        {TABS.map((tab, idx) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(idx)}
            className={`px-4 py-2 rounded-t ${activeTab === idx ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-white p-6 rounded shadow">
        {activeTab === 0 && (
          <div>
            <h3 className="font-bold mb-2">Información de usuario</h3>
            {/* Aquí va la información del usuario */}
            <p>Nombre, correo, teléfono, dirección, puntos, etc.</p>
          </div>
        )}
        {activeTab === 1 && (
          <div>
            <h3 className="font-bold mb-2">Solicitar recolección</h3>
            {/* Aquí va el formulario para solicitar recolección */}
            <form className="space-y-4">
              <div>
                <label className="block mb-1">Tipo de material</label>
                <select className="w-full border rounded px-2 py-1">
                  <option value="ORGANICO">Orgánico</option>
                  <option value="INORGANICO">Inorgánico</option>
                  <option value="PELIGROSO">Peligroso</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Peso estimado (kg)</label>
                <input type="number" className="w-full border rounded px-2 py-1" min="0" />
              </div>
              <div>
                <label className="block mb-1">Fecha y hora</label>
                <input type="datetime-local" className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block mb-1">Notas adicionales</label>
                <textarea className="w-full border rounded px-2 py-1" rows={2}></textarea>
              </div>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Solicitar</button>
            </form>
          </div>
        )}
        {activeTab === 2 && (
          <div>
            <h3 className="font-bold mb-2">Mis recolecciones</h3>
            {/* Aquí va el listado de recolecciones solicitadas */}
            <ul className="list-disc pl-5">
              <li>Recolección #1 - Estado: Programada</li>
              <li>Recolección #2 - Estado: Completada</li>
              <li>Recolección #3 - Estado: Pendiente</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboardTabs;
