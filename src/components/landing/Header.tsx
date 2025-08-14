import AuthButtons from "./AuthButtons";
import Nav from "./Nav";
// Importar directamente el componente cliente; no usar dynamic con ssr:false en un Server Component
import MobileMenu from "./MobileMenu";

const Header = () => {
  return (
    <header className="px-4 lg:px-6 py-3 border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">EcoReciclaje</h1>
        </div>
        <Nav />
        <div className="hidden md:flex">
          <AuthButtons />
        </div>
        <MobileMenu />
      </div>
    </header>
  );
};

export default Header;
