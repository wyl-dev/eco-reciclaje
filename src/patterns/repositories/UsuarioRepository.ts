/**
 * Repository Pattern - Usuario Repository
 * 
 * Maneja todas las operaciones de datos relacionadas con usuarios
 * Extiende BaseRepository con funcionalidades específicas de Usuario
 */

import { prisma } from '@/lib/prisma';
import { BaseRepository, FilterOptions, QueryOptions } from './BaseRepository';
import { Usuario, Role, Suscripcion, SolicitudRecoleccion, Puntaje } from '@prisma/client';

// Tipos específicos para Usuario
export interface UsuarioWithRelations extends Usuario {
  suscripcion?: Suscripcion | null;
  solicitudes?: SolicitudRecoleccion[];
  puntos?: Puntaje[];
}

export interface CreateUsuarioData {
  email: string;
  passwordHash: string;
  nombre?: string;
  telefono?: string;
  localidad?: string;
  direccion?: string;
  role?: Role;
  empresaId?: string;
}

export interface UpdateUsuarioData {
  nombre?: string;
  telefono?: string;
  localidad?: string;
  direccion?: string;
  role?: Role;
  empresaId?: string;
}

export interface UsuarioFilters extends FilterOptions {
  role?: Role;
  localidad?: string;
  hasActiveSubscription?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

/**
 * Repository para operaciones de Usuario
 */
export class UsuarioRepository extends BaseRepository<Usuario> {
  protected model = prisma.usuario;

  /**
   * Busca un usuario por email
   */
  async findByEmail(email: string): Promise<Usuario | null> {
    try {
      return await this.model.findUnique({
        where: { email }
      });
    } catch (error) {
      this.handleError('findByEmail', error);
      return null;
    }
  }

  /**
   * Busca un usuario con todas sus relaciones
   */
  async findByIdWithRelations(id: string): Promise<UsuarioWithRelations | null> {
    try {
      return await this.model.findUnique({
        where: { id },
        include: {
          suscripcion: true,
          solicitudes: {
            orderBy: { createdAt: 'desc' },
            take: 10 // Últimas 10 solicitudes
          },
          puntos: {
            orderBy: { createdAt: 'desc' },
            take: 20 // Últimos 20 movimientos de puntos
          }
        }
      });
    } catch (error) {
      this.handleError('findByIdWithRelations', error);
      return null;
    }
  }

  /**
   * Obtiene usuarios con filtros específicos
   */
  async findWithFilters(filters: UsuarioFilters, options?: QueryOptions): Promise<Usuario[]> {
    try {
      const where: Record<string, unknown> = { ...filters };

      // Filtro por suscripción activa
      if (filters.hasActiveSubscription !== undefined) {
        where.suscripcion = {
          activa: filters.hasActiveSubscription
        };
        delete where.hasActiveSubscription;
      }

      // Filtros de fecha
      if (filters.createdAfter || filters.createdBefore) {
        where.createdAt = {};
        if (filters.createdAfter) {
          (where.createdAt as Record<string, Date>).gte = filters.createdAfter;
          delete where.createdAfter;
        }
        if (filters.createdBefore) {
          (where.createdAt as Record<string, Date>).lte = filters.createdBefore;
          delete where.createdBefore;
        }
      }

      const queryOptions: Record<string, unknown> = {
        where,
        orderBy: { createdAt: 'desc' }
      };

      // Paginación
      if (options?.pagination) {
        if (options.pagination.limit) {
          queryOptions.take = options.pagination.limit;
        }
        if (options.pagination.offset) {
          queryOptions.skip = options.pagination.offset;
        }
      }

      // Ordenamiento
      if (options?.sort) {
        queryOptions.orderBy = {
          [options.sort.field]: options.sort.direction
        };
      }

      // Incluir relaciones
      if (options?.include) {
        queryOptions.include = options.include;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await this.model.findMany(queryOptions as any);
    } catch (error) {
      this.handleError('findWithFilters', error);
      return [];
    }
  }

  /**
   * Obtiene usuarios por rol
   */
  async findByRole(role: Role): Promise<Usuario[]> {
    try {
      return await this.model.findMany({
        where: { role },
        orderBy: { nombre: 'asc' }
      });
    } catch (error) {
      this.handleError('findByRole', error);
      return [];
    }
  }

  /**
   * Obtiene usuarios por localidad
   */
  async findByLocalidad(localidad: string): Promise<Usuario[]> {
    try {
      return await this.model.findMany({
        where: { localidad },
        orderBy: { nombre: 'asc' }
      });
    } catch (error) {
      this.handleError('findByLocalidad', error);
      return [];
    }
  }

  /**
   * Crea un usuario con validaciones específicas
   */
  async createUsuario(data: CreateUsuarioData): Promise<Usuario> {
    try {
      // Validar email único
      const existingUser = await this.findByEmail(data.email);
      if (existingUser) {
        throw new Error('El email ya está en uso');
      }

      return await this.model.create({
        data: {
          ...data,
          role: data.role || 'USUARIO'
        }
      });
    } catch (error) {
      this.handleError('createUsuario', error);
      throw error;
    }
  }

  /**
   * Actualiza información de usuario
   */
  async updateUsuario(id: string, data: UpdateUsuarioData): Promise<Usuario> {
    try {
      return await this.model.update({
        where: { id },
        data
      });
    } catch (error) {
      this.handleError('updateUsuario', error);
      throw error;
    }
  }

  /**
   * Cambia el rol de un usuario
   */
  async changeRole(id: string, newRole: Role): Promise<Usuario> {
    try {
      return await this.model.update({
        where: { id },
        data: { role: newRole }
      });
    } catch (error) {
      this.handleError('changeRole', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  async getStatistics() {
    try {
      const [total, porRole, porLocalidad, conSuscripcionActiva] = await Promise.all([
        // Total de usuarios
        this.model.count(),

        // Usuarios por rol
        this.model.groupBy({
          by: ['role'],
          _count: true
        }),

        // Usuarios por localidad (top 10)
        this.model.groupBy({
          by: ['localidad'],
          _count: true,
          orderBy: { _count: { localidad: 'desc' } },
          take: 10,
          where: { localidad: { not: null } }
        }),

        // Usuarios con suscripción activa
        this.model.count({
          where: {
            suscripcion: { activa: true }
          }
        })
      ]);

      return {
        total,
        porRole: porRole.reduce((acc, item) => {
          acc[item.role] = item._count;
          return acc;
        }, {} as Record<Role, number>),
        porLocalidad: porLocalidad.map(item => ({
          localidad: item.localidad,
          count: item._count
        })),
        conSuscripcionActiva
      };
    } catch (error) {
      this.handleError('getStatistics', error);
      return {
        total: 0,
        porRole: {} as Record<Role, number>,
        porLocalidad: [],
        conSuscripcionActiva: 0
      };
    }
  }

  /**
   * Busca usuarios con texto (nombre o email)
   */
  async search(query: string, limit: number = 10): Promise<Usuario[]> {
    try {
      return await this.model.findMany({
        where: {
          OR: [
            { nombre: { contains: query } },
            { email: { contains: query } }
          ]
        },
        take: limit,
        orderBy: { nombre: 'asc' }
      });
    } catch (error) {
      this.handleError('search', error);
      return [];
    }
  }

  /**
   * Verifica si un usuario existe por email
   */
  async existsByEmail(email: string): Promise<boolean> {
    try {
      const user = await this.model.findUnique({
        where: { email },
        select: { id: true }
      });
      return !!user;
    } catch (error) {
      this.handleError('existsByEmail', error);
      return false;
    }
  }

  /**
   * Obtiene usuarios registrados en un rango de fechas
   */
  async findByDateRange(from: Date, to: Date): Promise<Usuario[]> {
    try {
      return await this.model.findMany({
        where: {
          createdAt: {
            gte: from,
            lte: to
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      this.handleError('findByDateRange', error);
      return [];
    }
  }
}

// Singleton instance
export const usuarioRepository = new UsuarioRepository();
