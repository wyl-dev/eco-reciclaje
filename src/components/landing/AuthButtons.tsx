"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { LogIn, UserPlus } from "lucide-react";

type Props = {
  loginHref?: string;
  signupHref?: string;
  compact?: boolean; // icon-only mode (mobile drawer)
};

const AuthButtons = ({
  loginHref = "/login",
  signupHref = "/signup",
  compact = false,
}: Props) => {
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
          asChild
        >
          <Link href={loginHref} aria-label="Iniciar sesión">
            <LogIn className="h-5 w-5" />
          </Link>
        </Button>
        <Button
          size="icon"
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          asChild
        >
          <Link href={signupHref} aria-label="Registrarse">
            <UserPlus className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
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
  );
};

export default AuthButtons;
