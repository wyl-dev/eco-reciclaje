import PrivacyTermsTriggers from "@/components/portal/PrivacyTermsTriggers";

export default function Footer() {
    return (
        <footer className="px-4 lg:px-6 py-8 bg-gray-900">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-3 mb-4 md:mb-0">
                        <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center">
                            <span className="text-white font-bold">R</span>
                        </div>
                        <span className="font-semibold text-white">EcoReciclaje</span>
                    </div>
                    <PrivacyTermsTriggers />
                </div>
            </div>
        </footer>
    );
}
