"use server";
import { signupSchema, loginSchema, createUser, authenticate } from '@/lib/auth';
import { cookies } from 'next/headers';
import { z } from 'zod';

export async function signupAction(formData: FormData){
  const raw = Object.fromEntries(formData.entries());
  const parsed = signupSchema.safeParse({
    name: raw.name,
    email: raw.email,
    password: raw.password,
    role: raw.role,
    locality: raw.locality,
    address: raw.address
  });
  if(!parsed.success){
    return { ok:false, fieldErrors: fieldErrors(parsed.error), message:'Errores de validación' };
  }
  try {
    const user = await createUser(parsed.data);
    return { ok:true, userId: user.id, message:'Registro exitoso' };
  } catch(e: unknown){
    const message = e instanceof Error ? e.message : 'Error al registrar';
    return { ok:false, message };
  }
}

export async function loginAction(formData: FormData){
  const raw = Object.fromEntries(formData.entries());
  const parsed = loginSchema.safeParse({ email: raw.email, password: raw.password });
  if(!parsed.success){
    return { ok:false, fieldErrors: fieldErrors(parsed.error), message:'Errores de validación' };
  }
  try {
    const { user, token } = await authenticate(parsed.data);
    (await cookies()).set('auth_token', token, { httpOnly:true, sameSite:'lax', path:'/', maxAge:60*60*24*7 });
    return { ok:true, userId: user.id, role: user.role, message:'Sesión iniciada' };
  } catch(e: unknown){
    const message = e instanceof Error ? e.message : 'Credenciales inválidas';
    return { ok:false, message };
  }
}

function fieldErrors(error: z.ZodError){
  const map: Record<string,string> = {};
  error.issues.forEach(i=>{ if(!map[i.path.join('.')]) map[i.path.join('.')] = i.message; });
  return map;
}
