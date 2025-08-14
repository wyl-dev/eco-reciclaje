"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import AuthButtons from "./AuthButtons";

// Client mobile navigation drawer
export default function MobileMenu() {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (open) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = prev;
            };
        }
    }, [open]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        if (open) document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open]);

    const close = () => setOpen(false);
    const linkBase = "block w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors";
    const overlay = open && (
        <div className="fixed inset-0 z-[100]">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={close}
                aria-hidden="true"
            />
            <div className="absolute right-0 top-0 h-full w-72 max-w-[85%] bg-white shadow-xl flex flex-col animate-in slide-in-from-right">
                <div className="flex items-center justify-between px-4 py-4 border-b">
                    <span className="font-semibold text-gray-900">Menú</span>
                    <button
                        aria-label="Cerrar menú"
                        onClick={close}
                        className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto py-4 space-y-1">
                    <Link href="#inicio" onClick={close} className={linkBase}>Inicio</Link>
                    <Link href="#caracteristicas" onClick={close} className={linkBase}>Características</Link>
                    <Link href="#como-funciona" onClick={close} className={linkBase}>Cómo Funciona</Link>
                    <Link href="#beneficios" onClick={close} className={linkBase}>Beneficios</Link>
                </nav>
                <div className="border-t px-4 py-4">
                    <AuthButtons compact />
                </div>
            </div>
        </div>
    );

    return (
        <div className="md:hidden">
            <button
                aria-label="Abrir menú"
                onClick={() => setOpen(true)}
                className="inline-flex items-center justify-center p-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
                <Menu className="h-5 w-5" />
            </button>
            {mounted && overlay && createPortal(overlay, document.body)}
        </div>
    );
}
