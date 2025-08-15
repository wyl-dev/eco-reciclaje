"use client";
import { useState, useTransition, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { loginAction } from '@/app/auth/actions';
import Link from 'next/link';

export default function LoginFormClient(){
  const [data, setData] = useState({ email:'', password:'' });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const firstErrorRef = useRef<HTMLInputElement | null>(null);
  useEffect(()=>{
    if(firstErrorRef.current){
      firstErrorRef.current.focus();
      firstErrorRef.current = null;
    }
  },[errors]);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent){
    e.preventDefault();
    setErrors({});
    const formData = new FormData();
  formData.append('email', data.email);
  formData.append('password', data.password);
    startTransition(async ()=>{
      const res = await loginAction(formData);
      if(!res.ok){
        if(res.fieldErrors) setErrors(res.fieldErrors);
        toast.error(res.message || 'Error de autenticación');
      } else {
        toast.success('Sesión iniciada');
        // Opcional: redirigir dashboard según rol
      }
    });
  }
  return (
    <form noValidate onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Correo Electrónico</Label>
  <Input id="email" type="email" value={data.email} onChange={e=>{ setData(d=>({...d,email:e.target.value})); if(errors.email) setErrors(prev=>{ const rest = { ...prev }; delete rest.email; return rest; }); }} aria-required="true" ref={el=>{ if(errors.email && !firstErrorRef.current) firstErrorRef.current = el; }} />
        {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
  <Input id="password" type="password" value={data.password} onChange={e=>{ setData(d=>({...d,password:e.target.value})); if(errors.password) setErrors(prev=>{ const rest = { ...prev }; delete rest.password; return rest; }); }} aria-required="true" ref={el=>{ if(errors.password && !firstErrorRef.current) firstErrorRef.current = el; }} />
        {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
      </div>
      <Button disabled={pending} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">{pending? 'Ingresando...' : 'Iniciar Sesión'}</Button>
      <div className="text-center text-sm">
        <Link href="/auth/forgot-password" className="hover:underline">¿Olvidaste tu contraseña?</Link>
      </div>
    </form>
  );
}
