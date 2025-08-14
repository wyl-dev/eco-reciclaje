"use client";
import { useState } from "react";
import { Modal } from "../ui/modal";

export default function PrivacyTermsTriggers() {
  const [open, setOpen] = useState<null | "privacy" | "terms">(null);
  const baseLink = "hover:text-white transition-colors cursor-pointer";
  return (
    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-400 text-center md:text-left">
      <span>© 2025 EcoReciclaje. Todos los derechos reservados.</span>
      <button onClick={() => setOpen("privacy")} className={baseLink}>
        Política de Privacidad
      </button>
      <button onClick={() => setOpen("terms")} className={baseLink}>
        Términos de Servicio
      </button>
      <Modal
        open={open === "privacy"}
        onClose={() => setOpen(null)}
        title="Política de Privacidad"
      >
        <PrivacyContent />
      </Modal>
      <Modal open={open === "terms"} onClose={() => setOpen(null)} title="Términos de Servicio">
        <TermsContent />
      </Modal>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-4">
      <p>
        Esta Política de Privacidad explica cómo EcoReciclaje recopila, usa y protege
        tu información personal. Sólo solicitamos los datos estrictamente necesarios para
        operar la plataforma (por ejemplo: email, localidad y preferencias de notificación).
      </p>
      <p>
        Utilizamos tus datos para: (1) programar recolecciones acordes a tu ubicación, (2) enviar
        recordatorios y notificaciones de impacto, y (3) mejorar nuestras funcionalidades de
        reciclaje inteligente. No vendemos tus datos a terceros.
      </p>
      <p>
        Puedes solicitar la eliminación o exportación de tus datos escribiendo a
        <strong> soporte@ecoreciclaje.com</strong>. Implementamos medidas técnicas y organizativas
        para proteger la confidencialidad e integridad de tu información.
      </p>
      <p className="text-xs text-gray-500">
        Última actualización: Agosto 2025. Esta versión puede cambiar; te informaremos ante
        modificaciones sustanciales.
      </p>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="space-y-4">
      <p>
        Al usar EcoReciclaje aceptas estos Términos de Servicio. La plataforma se ofrece &quot;tal cual&quot; y
        puede actualizarse constantemente para mejorar la experiencia de reciclaje.
      </p>
      <p>
        El usuario se compromete a proporcionar información veraz y a usar las funcionalidades de
        programación de recolección de forma responsable. Nos reservamos el derecho de suspender
        cuentas que hagan uso fraudulento o abusivo del sistema.
      </p>
      <p>
        Las métricas de impacto y puntos son referenciales y pueden ajustarse por calibraciones
        internas. No constituyen un certificado oficial salvo que se indique expresamente.
      </p>
      <p>
        Ante cualquier disputa, intentaremos primero una resolución amistosa. Puedes contactarnos
        en <strong>legal@ecoreciclaje.com</strong>.
      </p>
      <p className="text-xs text-gray-500">
        Vigente desde: Agosto 2025. Podremos modificar estos términos; el uso continuado implicará
        aceptación de los cambios.
      </p>
    </div>
  );
}
