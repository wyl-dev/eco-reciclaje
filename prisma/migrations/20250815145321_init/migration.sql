-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT,
    "telefono" TEXT,
    "localidad" TEXT,
    "direccion" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USUARIO',
    "empresaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Usuario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "EmpresaRecolectora" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmpresaRecolectora" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "nit" TEXT,
    "contactoEmail" TEXT,
    "contactoTel" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Suscripcion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creadaEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiraEn" DATETIME,
    CONSTRAINT "Suscripcion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConfigPuntos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "descripcion" TEXT,
    "expresion" TEXT NOT NULL DEFAULT 'base + peso * factor',
    "base" INTEGER NOT NULL DEFAULT 10,
    "factorPeso" INTEGER NOT NULL DEFAULT 2,
    "factorSeparado" INTEGER NOT NULL DEFAULT 5,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SolicitudRecoleccion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "tipoResiduo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "fechaSolicitada" DATETIME NOT NULL,
    "fechaProgramada" DATETIME,
    "frecuenciaInorg" TEXT,
    "frecuenciaPelig" TEXT,
    "turnoRuta" INTEGER,
    "localidad" TEXT,
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SolicitudRecoleccion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recoleccion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "solicitudId" TEXT NOT NULL,
    "empresaId" TEXT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pesoKg" REAL,
    "separadoOk" BOOLEAN,
    "puntosGenerados" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Recoleccion_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "SolicitudRecoleccion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Recoleccion_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "EmpresaRecolectora" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Puntaje" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "recoleccionId" TEXT,
    "puntos" INTEGER NOT NULL,
    "motivo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Puntaje_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Puntaje_recoleccionId_fkey" FOREIGN KEY ("recoleccionId") REFERENCES "Recoleccion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notificacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "solicitudId" TEXT,
    "tipo" TEXT NOT NULL,
    "canal" TEXT NOT NULL DEFAULT 'WHATSAPP',
    "mensaje" TEXT NOT NULL,
    "enviadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notificacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Notificacion_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "SolicitudRecoleccion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HorarioOrganico" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "localidad" TEXT NOT NULL,
    "dia" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_role_idx" ON "Usuario"("role");

-- CreateIndex
CREATE INDEX "Usuario_localidad_idx" ON "Usuario"("localidad");

-- CreateIndex
CREATE UNIQUE INDEX "EmpresaRecolectora_nit_key" ON "EmpresaRecolectora"("nit");

-- CreateIndex
CREATE UNIQUE INDEX "Suscripcion_usuarioId_key" ON "Suscripcion"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Recoleccion_solicitudId_key" ON "Recoleccion"("solicitudId");

-- CreateIndex
CREATE UNIQUE INDEX "Puntaje_recoleccionId_key" ON "Puntaje"("recoleccionId");

-- CreateIndex
CREATE UNIQUE INDEX "HorarioOrganico_localidad_key" ON "HorarioOrganico"("localidad");

-- CreateIndex
CREATE INDEX "HorarioOrganico_dia_idx" ON "HorarioOrganico"("dia");
