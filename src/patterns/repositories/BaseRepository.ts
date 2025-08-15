/**
 * Repository Pattern - Base Repository Interface
 * 
 * Proporciona una interfaz común para todas las operaciones de datos
 * Abstrae el acceso a la base de datos y facilita el testing
 */

// Tipos para filtros y operaciones
export type FilterOptions = Record<string, unknown>;

export interface IBaseRepository<T, K = string> {
  // Operaciones CRUD básicas
  findById(id: K): Promise<T | null>;
  findAll(filters?: FilterOptions): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: K, data: Partial<T>): Promise<T>;
  delete(id: K): Promise<boolean>;
  
  // Operaciones de consulta
  count(filters?: FilterOptions): Promise<number>;
  exists(id: K): Promise<boolean>;
  
  // Operaciones batch
  createMany(data: Partial<T>[]): Promise<T[]>;
  updateMany(filters: FilterOptions, data: Partial<T>): Promise<number>;
  deleteMany(filters: FilterOptions): Promise<number>;
}

/**
 * Clase base abstracta que implementa funcionalidades comunes
 */
export abstract class BaseRepository<T, K = string> implements IBaseRepository<T, K> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected abstract model: any; // Modelo de Prisma
  
  async findById(id: K): Promise<T | null> {
    try {
      return await this.model.findUnique({
        where: { id }
      });
    } catch (error) {
      this.handleError('findById', error);
      return null;
    }
  }
  
  async findAll(filters: FilterOptions = {}): Promise<T[]> {
    try {
      return await this.model.findMany({
        where: filters,
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      this.handleError('findAll', error);
      return [];
    }
  }
  
  async create(data: Partial<T>): Promise<T> {
    try {
      return await this.model.create({
        data
      });
    } catch (error) {
      this.handleError('create', error);
      throw error;
    }
  }
  
  async update(id: K, data: Partial<T>): Promise<T> {
    try {
      return await this.model.update({
        where: { id },
        data
      });
    } catch (error) {
      this.handleError('update', error);
      throw error;
    }
  }
  
  async delete(id: K): Promise<boolean> {
    try {
      await this.model.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      this.handleError('delete', error);
      return false;
    }
  }
  
  async count(filters: FilterOptions = {}): Promise<number> {
    try {
      return await this.model.count({
        where: filters
      });
    } catch (error) {
      this.handleError('count', error);
      return 0;
    }
  }
  
  async exists(id: K): Promise<boolean> {
    try {
      const result = await this.model.findUnique({
        where: { id },
        select: { id: true }
      });
      return !!result;
    } catch (error) {
      this.handleError('exists', error);
      return false;
    }
  }
  
  async createMany(data: Partial<T>[]): Promise<T[]> {
    try {
      const result = await this.model.createMany({
        data,
        skipDuplicates: true
      });
      return result;
    } catch (error) {
      this.handleError('createMany', error);
      throw error;
    }
  }
  
  async updateMany(filters: FilterOptions, data: Partial<T>): Promise<number> {
    try {
      const result = await this.model.updateMany({
        where: filters,
        data
      });
      return result.count;
    } catch (error) {
      this.handleError('updateMany', error);
      return 0;
    }
  }
  
  async deleteMany(filters: FilterOptions): Promise<number> {
    try {
      const result = await this.model.deleteMany({
        where: filters
      });
      return result.count;
    } catch (error) {
      this.handleError('deleteMany', error);
      return 0;
    }
  }
  
  /**
   * Manejo centralizado de errores
   */
  protected handleError(operation: string, error: unknown): void {
    console.error(`[${this.constructor.name}] Error in ${operation}:`, error);
    // Aquí se podría integrar con el sistema de logging
  }
  
  /**
   * Método helper para validar datos antes de operaciones
   */
  protected validate(_data: unknown): boolean {
    // Implementación base de validación
    return true;
  }
}

/**
 * Tipos para filtros comunes
 */
export interface DateRangeFilter {
  from?: Date;
  to?: Date;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface QueryOptions {
  pagination?: PaginationOptions;
  sort?: SortOptions;
  include?: Record<string, boolean>;
}
