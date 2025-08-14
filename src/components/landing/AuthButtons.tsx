"use client";

import Link from "next/link";
import { Button } from "../ui/button";

type Props = {
  loginHref?: string;
  signupHref?: string;
};

const AuthButtons = ({
  loginHref = "/login",
  signupHref = "/signup",
}: Props) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
          asChild
        >
          <Link href={loginHref}>Iniciar Sesión</Link>
        </Button>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          asChild
        >
          <Link href={signupHref}>Registrarse Gratis</Link>
        </Button>
      </div>
    </div>
  );
};

export default AuthButtons;
