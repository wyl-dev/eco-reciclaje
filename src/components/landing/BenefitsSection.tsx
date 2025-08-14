interface Benefit {
    title: string;
    text: string;
}

const left: Benefit[] = [
    { title: "Completamente Gratuito", text: "Sin costos ocultos ni suscripciones premium." },
    { title: "Recolección Automática", text: "Los orgánicos se recogen automáticamente según tu localidad." },
    { title: "Notificaciones Inteligentes", text: "Recordatorios automáticos vía WhatsApp." },
];

const right: Benefit[] = [
    { title: "Impacto Medible", text: "Visualiza tu contribución real al medio ambiente." },
    { title: "Fácil de Usar", text: "Interfaz intuitiva para todas las edades." },
    { title: "Empresa Confiable", text: "Red de empresas recolectoras certificadas." },
];

function BenefitItem({ title, text }: Benefit) {
    return (
        <div className="flex items-start gap-4">
            <div className="relative mt-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center ring-1 ring-emerald-200/60 shadow-sm">
                    <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full shadow-inner" />
                </div>
                <div className="absolute inset-0 animate-pulse rounded-full bg-emerald-400/0" aria-hidden="true" />
            </div>
            <div className="pt-0.5">
                <h3 className="font-semibold text-gray-900 mb-1 leading-snug">{title}</h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{text}</p>
            </div>
        </div>
    );
}

export default function BenefitsSection() {
    return (
        <section id="beneficios" className="scroll-mt-24 px-4 lg:px-6 py-16 lg:py-20 bg-white">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 text-gray-900">¿Por Qué Elegir EcoReciclaje?</h2>
                <div className="grid md:grid-cols-2 gap-8 text-left">
                    <div className="space-y-6">
                        {left.map((b) => (
                            <BenefitItem key={b.title} {...b} />
                        ))}
                    </div>
                    <div className="space-y-6">
                        {right.map((b) => (
                            <BenefitItem key={b.title} {...b} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
