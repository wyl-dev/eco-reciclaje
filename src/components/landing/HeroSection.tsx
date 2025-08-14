import { Users, Recycle, Leaf } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

export default function HeroSection() {
    return (
        <section id="inicio" className="scroll-mt-24 px-4 lg:px-6 py-16 lg:py-32 bg-gradient-to-br from-emerald-50 to-blue-50">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
                    Recicla Inteligentemente. <br />
                    <span className="text-emerald-600">Impacta Positivamente.</span>
                </h2>
                <p className="text-base sm:text-lg lg:text-xl mb-8 max-w-2xl mx-auto text-gray-600">
                    Únete a nuestra plataforma de reciclaje inteligente y contribuye al cuidado del medio ambiente
                    mientras ganas puntos por cada acción responsable.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        size="lg"
                        className="px-8 py-4 text-white bg-emerald-600 hover:bg-emerald-700"
                        asChild
                    >
                        <Link href="/auth/signup">Comenzar Ahora - Es Gratis</Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="px-8 py-4 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                        asChild
                    >
                        <Link href="#caracteristicas">Conocer Más</Link>
                    </Button>
                </div>
                <div className="mt-12 sm:mt-16 grid sm:grid-cols-3 gap-8 text-center">
                    <div className="p-6">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                            <Users className="h-8 w-8 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-900">+10,000 Usuarios</h3>
                        <p className="text-gray-600">Comunidad activa comprometida con el reciclaje</p>
                    </div>
                    <div className="p-6">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                            <Recycle className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-900">50+ Toneladas</h3>
                        <p className="text-gray-600">Material reciclado correctamente</p>
                    </div>
                    <div className="p-6">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                            <Leaf className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-900">100% Eco-Friendly</h3>
                        <p className="text-gray-600">Proceso completamente sostenible</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
