import React, { useState } from "react";

const TABS = [
  { label: "Información de la empresa" },
  { label: "Aceptar solicitudes" },
  { label: "Recolecciones relacionadas" },
];

const CompanyDashboardTabs = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Panel de Empresa</h2>
      <div className="flex gap-2 mb-6">
        {TABS.map((tab, idx) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(idx)}
            className={`px-4 py-2 rounded-t ${activeTab === idx ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-white p-6 rounded shadow">
        {activeTab === 0 && (
          <div>
            <h3 className="font-bold mb-2">Información de la empresa</h3>
            {/* Aquí va la información de la empresa */}
            <p>Nombre, NIT, contacto, dirección, usuarios asociados, etc.</p>
          </div>
        )}
        {activeTab === 1 && (
          <div>
            <h3 className="font-bold mb-2">Aceptar solicitudes de recolección</h3>
            {/* Aquí va el listado de solicitudes pendientes para aceptar */}
            <ul className="list-disc pl-5">
              <li>Solicitud #1 - Usuario: Juan - Material: Orgánico - <button className="ml-2 px-2 py-1 bg-green-500 text-white rounded">Aceptar</button></li>
              <li>Solicitud #2 - Usuario: Ana - Material: Inorgánico - <button className="ml-2 px-2 py-1 bg-green-500 text-white rounded">Aceptar</button></li>
            </ul>
          </div>
        )}
        {activeTab === 2 && (
          <div>
            <h3 className="font-bold mb-2">Recolecciones relacionadas</h3>
            {/* Aquí va el listado de recolecciones aceptadas/en proceso/terminadas */}
            <ul className="list-disc pl-5">
              <li>Recolección #1 - Estado: En proceso</li>
              <li>Recolección #2 - Estado: Terminada</li>
              <li>Recolección #3 - Estado: Aceptada</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboardTabs;
