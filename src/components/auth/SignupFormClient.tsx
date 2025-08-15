"use client";
import { useState, useTransition, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { signupAction } from '@/app/auth/actions';

export default function SignupFormClient(){
  const [data, setData] = useState({ name:'', email:'', password:'', role:'usuario', locality:'', address:'' });
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
  Object.entries(data).forEach(([k,v])=> formData.append(k, v));
    startTransition(async ()=>{
      const res = await signupAction(formData);
      if(!res.ok){
        if(res.fieldErrors) setErrors(res.fieldErrors);
        toast.error(res.message || 'Error al registrar');
      } else {
        toast.success('Registro exitoso');
        // Opcional: redirigir al login
      }
    });
  }
  return (
    <form noValidate onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
  <Label htmlFor="name">Nombre Completo</Label>
  <Input id="name" value={data.name} onChange={e=>{ setData(d=>({...d,name:e.target.value})); if(errors.name) setErrors(prev=>{ const rest = { ...prev }; delete rest.name; return rest; }); }} aria-required="true" ref={el=>{ if(errors.name && !firstErrorRef.current) firstErrorRef.current = el; }} />
  {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
      </div>
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
      <div className="space-y-2">
        <Label>Tipo de Usuario</Label>
    <Select value={data.role} onValueChange={value=>setData(d=>({...d,role:value}))}>
          <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="usuario">Usuario</SelectItem>
            <SelectItem value="empresa">Empresa Recolectora</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {data.role === 'usuario' && (
        <>
          <div className="space-y-2">
            <Label>Localidad</Label>
            <Select value={data.locality} onValueChange={value=>{ setData(d=>({...d,locality:value})); if(errors.locality) setErrors(prev=>{ const rest = { ...prev }; delete rest.locality; return rest; }); }}>
              <SelectTrigger><SelectValue placeholder="Selecciona tu localidad" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="centro">Centro</SelectItem>
                <SelectItem value="norte">Norte</SelectItem>
                <SelectItem value="sur">Sur</SelectItem>
                <SelectItem value="oriente">Oriente</SelectItem>
                <SelectItem value="occidente">Occidente</SelectItem>
              </SelectContent>
            </Select>
      {errors.locality && <p className="text-xs text-red-600">{errors.locality}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" placeholder="Ej: Calle 50 #25-30" value={data.address} onChange={e=>{ setData(d=>({...d,address:e.target.value})); if(errors.address) setErrors(prev=>{ const rest = { ...prev }; delete rest.address; return rest; }); }} aria-required={data.role==='usuario'} ref={el=>{ if(errors.address && !firstErrorRef.current) firstErrorRef.current = el; }} />
      {errors.address && <p className="text-xs text-red-600">{errors.address}</p>}
          </div>
        </>
      )}
    <Button disabled={pending} type="submit" className="w-full bg-blue-600 hover:bg-blue-700">{pending? 'Registrando...' : 'Registrarse Gratis'}</Button>
    </form>
  );
}
