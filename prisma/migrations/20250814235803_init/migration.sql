-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'USUARIO', 'EMPRESA');

-- CreateEnum
CREATE TYPE "public"."ResiduoTipo" AS ENUM ('ORGANICO', 'INORGANICO', 'PELIGROSO');

-- CreateEnum
CREATE TYPE "public"."SolicitudEstado" AS ENUM ('PENDIENTE', 'PROGRAMADA', 'ASIGNADA', 'COMPLETADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "public"."FrecuenciaInorganico" AS ENUM ('UNICA', 'SEMANAL_1', 'SEMANAL_2');

-- CreateEnum
CREATE TYPE "public"."FrecuenciaPeligroso" AS ENUM ('UNICA', 'MENSUAL');

-- CreateEnum
CREATE TYPE "public"."DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- CreateTable
CREATE TABLE "public"."Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT,
    "telefono" TEXT,
    "localidad" TEXT,
    "direccion" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'USUARIO',
    "empresaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmpresaRecolectora" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nit" TEXT,
    "contactoEmail" TEXT,
    "contactoTel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmpresaRecolectora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Suscripcion" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiraEn" TIMESTAMP(3),

    CONSTRAINT "Suscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConfigPuntos" (
    "id" TEXT NOT NULL,
    "descripcion" TEXT,
    "expresion" TEXT NOT NULL DEFAULT 'base + peso * factor',
    "base" INTEGER NOT NULL DEFAULT 10,
    "factorPeso" INTEGER NOT NULL DEFAULT 2,
    "factorSeparado" INTEGER NOT NULL DEFAULT 5,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConfigPuntos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SolicitudRecoleccion" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipoResiduo" "public"."ResiduoTipo" NOT NULL,
    "estado" "public"."SolicitudEstado" NOT NULL DEFAULT 'PENDIENTE',
    "fechaSolicitada" TIMESTAMP(3) NOT NULL,
    "fechaProgramada" TIMESTAMP(3),
    "frecuenciaInorg" "public"."FrecuenciaInorganico",
    "frecuenciaPelig" "public"."FrecuenciaPeligroso",
    "turnoRuta" INTEGER,
    "localidad" TEXT,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SolicitudRecoleccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Recoleccion" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "empresaId" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pesoKg" DOUBLE PRECISION,
    "separadoOk" BOOLEAN,
    "puntosGenerados" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recoleccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Puntaje" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "recoleccionId" TEXT,
    "puntos" INTEGER NOT NULL,
    "motivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Puntaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notificacion" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "solicitudId" TEXT,
    "tipo" TEXT NOT NULL,
    "canal" TEXT NOT NULL DEFAULT 'WHATSAPP',
    "mensaje" TEXT NOT NULL,
    "enviadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HorarioOrganico" (
    "id" TEXT NOT NULL,
    "localidad" TEXT NOT NULL,
    "dia" "public"."DiaSemana" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HorarioOrganico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "public"."Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_role_idx" ON "public"."Usuario"("role");

-- CreateIndex
CREATE INDEX "Usuario_localidad_idx" ON "public"."Usuario"("localidad");

-- CreateIndex
CREATE UNIQUE INDEX "EmpresaRecolectora_nit_key" ON "public"."EmpresaRecolectora"("nit");

-- CreateIndex
CREATE UNIQUE INDEX "Suscripcion_usuarioId_key" ON "public"."Suscripcion"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Recoleccion_solicitudId_key" ON "public"."Recoleccion"("solicitudId");

-- CreateIndex
CREATE UNIQUE INDEX "Puntaje_recoleccionId_key" ON "public"."Puntaje"("recoleccionId");

-- CreateIndex
CREATE UNIQUE INDEX "HorarioOrganico_localidad_key" ON "public"."HorarioOrganico"("localidad");

-- CreateIndex
CREATE INDEX "HorarioOrganico_dia_idx" ON "public"."HorarioOrganico"("dia");

-- AddForeignKey
ALTER TABLE "public"."Usuario" ADD CONSTRAINT "Usuario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "public"."EmpresaRecolectora"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Suscripcion" ADD CONSTRAINT "Suscripcion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SolicitudRecoleccion" ADD CONSTRAINT "SolicitudRecoleccion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Recoleccion" ADD CONSTRAINT "Recoleccion_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "public"."SolicitudRecoleccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Recoleccion" ADD CONSTRAINT "Recoleccion_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "public"."EmpresaRecolectora"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Puntaje" ADD CONSTRAINT "Puntaje_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Puntaje" ADD CONSTRAINT "Puntaje_recoleccionId_fkey" FOREIGN KEY ("recoleccionId") REFERENCES "public"."Recoleccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notificacion" ADD CONSTRAINT "Notificacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notificacion" ADD CONSTRAINT "Notificacion_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "public"."SolicitudRecoleccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

