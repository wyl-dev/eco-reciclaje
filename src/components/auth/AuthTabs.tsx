"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AuthTabs(){
  const pathname = usePathname();
  const value = pathname.endsWith('/signup') ? 'signup' : pathname.endsWith('/login') ? 'login' : 'login';
  return (
    <Tabs value={value} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger asChild value="login"><Link href="/auth/login">Iniciar Sesión</Link></TabsTrigger>
        <TabsTrigger asChild value="signup"><Link href="/auth/signup">Registrarse</Link></TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
