"use client";
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function SignupFormClient(){
  const [data, setData] = useState({ name:'', email:'', password:'', role:'usuario', locality:'', address:'' });
  function onSubmit(e: React.FormEvent){
    e.preventDefault();
    alert('Signup demo (sin backend)');
  }
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre Completo</Label>
        <Input id="name" required value={data.name} onChange={e=>setData(d=>({...d,name:e.target.value}))} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input id="email" type="email" required value={data.email} onChange={e=>setData(d=>({...d,email:e.target.value}))} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" type="password" required value={data.password} onChange={e=>setData(d=>({...d,password:e.target.value}))} />
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
            <Select value={data.locality} onValueChange={value=>setData(d=>({...d,locality:value}))}>
              <SelectTrigger><SelectValue placeholder="Selecciona tu localidad" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="centro">Centro</SelectItem>
                <SelectItem value="norte">Norte</SelectItem>
                <SelectItem value="sur">Sur</SelectItem>
                <SelectItem value="oriente">Oriente</SelectItem>
                <SelectItem value="occidente">Occidente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" placeholder="Ej: Calle 50 #25-30" required value={data.address} onChange={e=>setData(d=>({...d,address:e.target.value}))} />
          </div>
        </>
      )}
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Registrarse Gratis</Button>
    </form>
  );
}
