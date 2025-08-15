"use client";
import React from "react";

interface DashboardHeaderProps {
    username: string;
    onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ username, onLogout }) => {
    return (
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow mb-6 rounded">
            <div className="max-w-7xl mx-auto space-x-10 flex items-center gap-4">
                <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">R</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">EcoReciclaje</h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">{username}</span>
                    <button
                        onClick={onLogout}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2 has-[>svg]:px-3 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </header>
        
    );
};

export default DashboardHeader;
