import { Button } from "../ui/button";
import Link from "next/link";

export default function CallToActionSection() {
    return (
        <section className="px-4 lg:px-6 py-16 lg:py-20 bg-emerald-600">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight">
                    ¿Listo para Comenzar tu Impacto Positivo?
                </h2>
                <p className="text-base sm:text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
                    Únete a miles de usuarios que ya están haciendo la diferencia. Es gratis y solo toma 2 minutos.
                </p>
                <Button
                    size="lg"
                    className="px-12 py-4 text-lg font-semibold bg-white text-emerald-600 hover:bg-gray-50"
                    asChild
                >
                    <Link href="/auth/signup">Crear Mi Cuenta Gratuita</Link>
                </Button>
            </div>
        </section>
    );
}
