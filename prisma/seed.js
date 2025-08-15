import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(){
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const nombre = process.env.ADMIN_NAME || 'Administrador';

  if(!email || !password){
    console.log('\x1b[33m[seed] ADMIN_EMAIL y ADMIN_PASSWORD no definidos. No se crea admin.\x1b[0m');
    console.log('Define ADMIN_EMAIL=... y ADMIN_PASSWORD=... en tu .env antes de ejecutar npm run seed');
    return;
  }

  if(password.length < 10){
    console.log('\x1b[31m[seed] ADMIN_PASSWORD demasiado corta (<10). Aborting.\x1b[0m');
    return;
  }

  const existing = await prisma.usuario.findUnique({ where:{ email } });
  if(existing){
    console.log('Admin ya existe:', email);
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.usuario.create({
    data:{
      email,
      passwordHash,
      nombre,
      role: 'ADMIN'
    }
  });
  console.log('Admin creado:', user.email);
  console.log('IMPORTANTE: La contraseña solo se muestra porque la definiste vía entorno. No la compartas.');
}

main().catch(e=>{ console.error(e); process.exit(1); }).finally(()=> prisma.$disconnect());
