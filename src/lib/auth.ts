import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change';
const JWT_EXPIRES = '7d';

export const signupSchema = z.object({
  name: z.string().min(3, 'Nombre muy corto'),
  email: z.string().email('Correo inválido').toLowerCase(),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  role: z.enum(['usuario','empresa']).default('usuario'),
  locality: z.string().optional(),
  address: z.string().optional()
}).superRefine((data, ctx)=>{
  if(data.role === 'usuario'){
    if(!data.locality) ctx.addIssue({ code:'custom', message:'Selecciona la localidad', path:['locality'] });
    if(!data.address) ctx.addIssue({ code:'custom', message:'Ingresa la dirección', path:['address'] });
  }
});

export const loginSchema = z.object({
  email: z.string().email('Correo inválido').toLowerCase(),
  password: z.string().min(1, 'Contraseña requerida')
});

export async function hashPassword(password: string){
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string){
  return bcrypt.compare(password, hash);
}

interface TokenPayload { uid: string; role: string; iat?: number; exp?: number }

export function signToken(payload: TokenPayload){
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token: string): TokenPayload | null {
  try { return jwt.verify(token, JWT_SECRET) as TokenPayload; } catch { return null; }
}

export async function createUser(data: z.infer<typeof signupSchema>){
  const exists = await prisma.usuario.findUnique({ where:{ email: data.email } });
  if(exists) throw new Error('El correo ya está registrado');
  const passwordHash = await hashPassword(data.password);
  const role: 'EMPRESA' | 'USUARIO' = data.role === 'empresa' ? 'EMPRESA' : 'USUARIO';
  const user = await prisma.usuario.create({
    data:{
      email: data.email,
      passwordHash,
      nombre: data.name,
  role,
      localidad: data.role==='usuario'? data.locality : null,
      direccion: data.role==='usuario'? data.address : null,
      suscripcion: { create: { activa: true } }
    }
  });
  // Asignar día orgánico si aplica (simple: hash localidad -> día)
  if(user.localidad){
    const dias = ['LUNES','MARTES','MIERCOLES','JUEVES','VIERNES'];
    const idx = Math.abs(hashString(user.localidad)) % dias.length;
    // Ensure horario exists
    const dia = dias[idx] as 'LUNES'|'MARTES'|'MIERCOLES'|'JUEVES'|'VIERNES';
    await prisma.horarioOrganico.upsert({
      where:{ localidad: user.localidad },
      create:{ localidad: user.localidad, dia },
      update:{}
    });
  }
  return user;
}

function hashString(s: string){
  let h=0; for(let i=0;i<s.length;i++){ h = Math.imul(31,h) + s.charCodeAt(i) |0; } return h;
}

export async function authenticate(data: z.infer<typeof loginSchema>){
  const user = await prisma.usuario.findUnique({ where:{ email: data.email } });
  if(!user) throw new Error('Credenciales inválidas');
  const ok = await verifyPassword(data.password, user.passwordHash);
  if(!ok) throw new Error('Credenciales inválidas');
  const token = signToken({ uid: user.id, role: user.role });
  return { user, token };
}
