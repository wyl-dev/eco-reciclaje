import AuthButtons from "./AuthButtons";
import Nav from "./Nav";

const Header = () => {
  return (
    <header className="px-4 lg:px-6 py-4 border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">EcoReciclaje</h1>
        </div>

        <Nav />
        <AuthButtons />
      </div>
    </header>
  );
};

export default Header;
