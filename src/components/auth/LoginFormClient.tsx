"use client";
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LoginFormClient(){
  const [data, setData] = useState({ email:'', password:'' });
  function onSubmit(e: React.FormEvent){
    e.preventDefault();
    alert('Login demo (sin backend)');
  }
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input id="email" type="email" required value={data.email} onChange={e=>setData(d=>({...d,email:e.target.value}))} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" type="password" required value={data.password} onChange={e=>setData(d=>({...d,password:e.target.value}))} />
      </div>
      <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">Iniciar Sesión</Button>
      <div className="text-center text-sm">
        <Link href="/auth/forgot-password" className="hover:underline">¿Olvidaste tu contraseña?</Link>
      </div>
    </form>
  );
}
