export default function HowItWorksSection() {
    const steps: { number: string; title: string; text: string }[] = [
        {
            number: "1",
            title: "Regístrate Gratis",
            text: "Crea tu cuenta indicando tu localidad para recibir el horario automático de recolección de orgánicos.",
        },
        {
            number: "2",
            title: "Clasifica y Solicita",
            text: "Usa nuestras guías para separar correctamente y solicita recolección de inorgánicos y peligrosos.",
        },
        {
            number: "3",
            title: "Gana Puntos",
            text: "Acumula puntos por cada recolección exitosa y visualiza tu impacto ambiental positivo.",
        },
    ];
    return (
        <section id="como-funciona" className="scroll-mt-24 px-4 lg:px-6 py-16 lg:py-20" style={{ backgroundColor: "#F9FAFB" }}>
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-gray-900">¿Cómo Funciona?</h2>
                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                        En solo 3 pasos simples, comienza a hacer la diferencia con el reciclaje inteligente
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((s) => (
                        <div key={s.number} className="text-center">
                            <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-white">{s.number}</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-4 text-gray-900">{s.title}</h3>
                            <p className="text-gray-600">{s.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
