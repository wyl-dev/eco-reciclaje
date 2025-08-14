import Link from "next/link";

const Nav = () => {
  return (
    <nav className="hidden md:flex items-center space-x-8">
      <Link
        href="#inicio"
        className="hover:opacity-75 transition-opacity text-gray-700"
      >
        Inicio
      </Link>
      <Link
        href="#caracteristicas"
        className="hover:opacity-75 transition-opacity text-gray-700"
      >
        Características
      </Link>
      <Link
        href="#como-funciona"
        className="hover:opacity-75 transition-opacity text-gray-700"
      >
        Cómo Funciona
      </Link>
      <Link
        href="#beneficios"
        className="hover:opacity-75 transition-opacity text-gray-700"
      >
        Beneficios
      </Link>
    </nav>
  );
};

export default Nav;
