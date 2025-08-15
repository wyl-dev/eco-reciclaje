"use server";
import { signupSchema, loginSchema, createUser, authenticate } from '@/lib/auth';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { 
  createUsuarioRegistroValidator, 
  createLoginValidator 
} from '@/patterns/validators/EcoReciclajeValidators';
import { prisma } from '@/lib/prisma';

export async function signupAction(formData: FormData){
  try {
    // Extraer datos del formData
    const raw = Object.fromEntries(formData.entries());
    const userData = {
      name: (raw.name ?? '').toString(),
      email: (raw.email ?? '').toString(),
      password: (raw.password ?? '').toString(),
      role: (raw.role ?? 'usuario').toString(),
      localidad: raw.locality ? raw.locality.toString() : '',
      direccion: raw.address ? raw.address.toString() : ''
    };

    // Usar validador con patrones de diseño
    const validator = createUsuarioRegistroValidator(prisma);
    const validationResult = await validator.validate({ 
      data: userData,
      metadata: { source: 'signup' }
    });

    if (!validationResult.isValid) {
      const fieldErrors: Record<string, string> = {};
      validationResult.errors.forEach(error => {
        fieldErrors[error.field] = error.message;
      });
      
      return { 
        ok: false, 
        fieldErrors, 
        message: validationResult.errors.map(e => e.message).join(', ')
      };
    }

    // Procesar advertencias si las hay
    if (validationResult.warnings && validationResult.warnings.length > 0) {
      console.warn('Signup warnings:', validationResult.warnings);
    }

    // Usar el schema existente como fallback
    const parsed = signupSchema.safeParse(userData);
    if (!parsed.success) {
      return { ok: false, fieldErrors: fieldErrors(parsed.error), message: 'Errores de validación' };
    }

    const user = await createUser(parsed.data);
    return { 
      ok: true, 
      userId: user.id, 
      message: 'Registro exitoso', 
      redirect: '/auth/login' 
    };
  } catch(e: unknown) {
    const message = e instanceof Error ? e.message : 'Error al registrar';
    return { ok: false, message };
  }
}

export async function loginAction(formData: FormData){
  try {
    const raw = Object.fromEntries(formData.entries());
    const loginData = {
      email: (raw.email ?? '').toString(),
      password: (raw.password ?? '').toString()
    };

    // Usar validador con patrones de diseño
    const validator = createLoginValidator();
    const validationResult = await validator.validate({ 
      data: loginData,
      metadata: { source: 'login' }
    });

    if (!validationResult.isValid) {
      const fieldErrors: Record<string, string> = {};
      validationResult.errors.forEach(error => {
        fieldErrors[error.field] = error.message;
      });
      
      return { 
        ok: false, 
        fieldErrors, 
        message: validationResult.errors.map(e => e.message).join(', ')
      };
    }

    // Usar el schema existente como fallback
    const parsed = loginSchema.safeParse(loginData);
    if (!parsed.success) {
      return { ok: false, fieldErrors: fieldErrors(parsed.error), message: 'Errores de validación' };
    }

    const { user, token } = await authenticate(parsed.data);
    (await cookies()).set('auth_token', token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60*60*24*7 });
    
    return { 
      ok: true, 
      userId: user.id, 
      role: user.role, 
      message: 'Sesión iniciada', 
      redirect: '/dashboard' 
    };
  } catch(e: unknown) {
    const message = e instanceof Error ? e.message : 'Credenciales inválidas';
    return { ok: false, message };
  }
}

export async function logoutAction(){
  (await cookies()).delete('auth_token');
  return { ok: true, message: 'Sesión cerrada', redirect: '/' };
}

function fieldErrors(error: z.ZodError){
  const map: Record<string,string> = {};
  error.issues.forEach(i=>{ if(!map[i.path.join('.')]) map[i.path.join('.')] = i.message; });
  return map;
}
