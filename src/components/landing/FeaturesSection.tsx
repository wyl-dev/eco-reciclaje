import { BookOpen, MapPin, Award, BarChart3, Shield, Recycle } from "lucide-react";
import { Card, CardContent } from "../ui/card";

export default function FeaturesSection() {
    return (
        <section id="caracteristicas" className="scroll-mt-24 px-4 lg:px-6 py-16 lg:py-20 bg-white">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
                        Características Principales
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                        Descubre todas las herramientas que tenemos para hacer del reciclaje una experiencia fácil y recompensante
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardContent className="p-6 lg:p-8 text-center">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-emerald-600">
                                <BookOpen className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-4 text-gray-900">
                                Guías de Reciclaje Inteligentes
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Aprende a clasificar correctamente residuos orgánicos, inorgánicos y peligrosos
                                con nuestras guías paso a paso.
                            </p>
                        </CardContent>
                    </Card>
                    {/* Feature 2 */}
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardContent className="p-6 lg:p-8 text-center">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-emerald-600">
                                <MapPin className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-4 text-gray-900">
                                Recolección Programada
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Sistema automático de recolección por localidades y solicitudes personalizadas
                                para diferentes tipos de residuos.
                            </p>
                        </CardContent>
                    </Card>
                    {/* Feature 3 */}
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardContent className="p-6 lg:p-8 text-center">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-emerald-600">
                                <Award className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-4 text-gray-900">
                                Sistema de Puntos
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Gana puntos por cada recolección exitosa y visualiza tu impacto positivo
                                en el medio ambiente.
                            </p>
                        </CardContent>
                    </Card>
                    {/* Feature 4 */}
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardContent className="p-6 lg:p-8 text-center">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-blue-600">
                                <BarChart3 className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-4 text-gray-900">
                                Seguimiento de Impacto
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Visualiza tu historial de reciclaje y el impacto ambiental real
                                de tus acciones sostenibles.
                            </p>
                        </CardContent>
                    </Card>
                    {/* Feature 5 */}
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardContent className="p-6 lg:p-8 text-center">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-purple-600">
                                <Shield className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-4 text-gray-900">
                                Notificaciones WhatsApp
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Recibe recordatorios automáticos sobre tus recolecciones programadas
                                directamente en WhatsApp.
                            </p>
                        </CardContent>
                    </Card>
                    {/* Feature 6 */}
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardContent className="p-6 lg:p-8 text-center">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-600">
                                <Recycle className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-4 text-gray-900">
                                Múltiples Tipos de Residuos
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Gestiona la recolección de residuos orgánicos, inorgánicos reciclables
                                y materiales peligrosos.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
