/**
 * Chain of Responsibility Pattern - Sistema de Validaciones
 * 
 * Implementa validaciones en cadena que permiten:
 * - Validaciones modulares y reutilizables
 * - Orden específico de validación
 * - Mensajes de error detallados
 * - Validaciones síncronas y asíncronas
 */

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: string[];
}

export interface ValidationContext {
  data: Record<string, unknown>;
  user?: {
    id: string;
    role: string;
    email: string;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Validador base abstracto
 */
export abstract class BaseValidator {
  protected nextValidator?: BaseValidator;

  setNext(validator: BaseValidator): BaseValidator {
    this.nextValidator = validator;
    return validator;
  }

  async validate(context: ValidationContext): Promise<ValidationResult> {
    const currentResult = await this.performValidation(context);
    
    if (this.nextValidator) {
      const nextResult = await this.nextValidator.validate(context);
      return this.combineResults(currentResult, nextResult);
    }
    
    return currentResult;
  }

  protected abstract performValidation(context: ValidationContext): Promise<ValidationResult>;

  private combineResults(current: ValidationResult, next: ValidationResult): ValidationResult {
    return {
      isValid: current.isValid && next.isValid,
      errors: [...current.errors, ...next.errors],
      warnings: [...(current.warnings || []), ...(next.warnings || [])]
    };
  }

  protected createError(field: string, message: string, code: string, value?: unknown): ValidationError {
    return { field, message, code, value };
  }

  protected createResult(errors: ValidationError[] = [], warnings: string[] = []): ValidationResult {
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

/**
 * Validador de campos requeridos
 */
export class RequiredFieldsValidator extends BaseValidator {
  private requiredFields: string[];

  constructor(requiredFields: string[]) {
    super();
    this.requiredFields = requiredFields;
  }

  protected async performValidation(context: ValidationContext): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    for (const field of this.requiredFields) {
      const value = context.data[field];
      
      if (value === undefined || value === null || value === '') {
        errors.push(this.createError(
          field,
          `El campo ${field} es obligatorio`,
          'FIELD_REQUIRED',
          value
        ));
      }
    }

    return this.createResult(errors);
  }
}

/**
 * Validador de tipos de datos
 */
export class DataTypeValidator extends BaseValidator {
  private typeRules: Record<string, 'string' | 'number' | 'email' | 'date' | 'boolean'>;

  constructor(typeRules: Record<string, 'string' | 'number' | 'email' | 'date' | 'boolean'>) {
    super();
    this.typeRules = typeRules;
  }

  protected async performValidation(context: ValidationContext): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    for (const [field, expectedType] of Object.entries(this.typeRules)) {
      const value = context.data[field];
      
      if (value === undefined || value === null) continue; // Skip undefined/null values
      
      if (!this.validateType(value, expectedType)) {
        errors.push(this.createError(
          field,
          `El campo ${field} debe ser de tipo ${expectedType}`,
          'INVALID_TYPE',
          value
        ));
      }
    }

    return this.createResult(errors);
  }

  private validateType(value: unknown, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'email':
        return typeof value === 'string' && this.isValidEmail(value);
      case 'date':
        return value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)));
      case 'boolean':
        return typeof value === 'boolean';
      default:
        return true;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

/**
 * Validador de rangos y límites
 */
export class RangeValidator extends BaseValidator {
  private rules: Record<string, {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  }>;

  constructor(rules: Record<string, { min?: number; max?: number; minLength?: number; maxLength?: number; }>) {
    super();
    this.rules = rules;
  }

  protected async performValidation(context: ValidationContext): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    for (const [field, rule] of Object.entries(this.rules)) {
      const value = context.data[field];
      
      if (value === undefined || value === null) continue;

      // Validar rangos numéricos
      if (typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          errors.push(this.createError(
            field,
            `${field} debe ser mayor o igual a ${rule.min}`,
            'VALUE_TOO_LOW',
            value
          ));
        }
        if (rule.max !== undefined && value > rule.max) {
          errors.push(this.createError(
            field,
            `${field} debe ser menor o igual a ${rule.max}`,
            'VALUE_TOO_HIGH',
            value
          ));
        }
      }

      // Validar longitud de strings
      if (typeof value === 'string') {
        if (rule.minLength !== undefined && value.length < rule.minLength) {
          errors.push(this.createError(
            field,
            `${field} debe tener al menos ${rule.minLength} caracteres`,
            'STRING_TOO_SHORT',
            value
          ));
        }
        if (rule.maxLength !== undefined && value.length > rule.maxLength) {
          errors.push(this.createError(
            field,
            `${field} no puede tener más de ${rule.maxLength} caracteres`,
            'STRING_TOO_LONG',
            value
          ));
        }
      }
    }

    return this.createResult(errors);
  }
}

/**
 * Validador de fechas
 */
export class DateValidator extends BaseValidator {
  private rules: Record<string, {
    minDate?: Date;
    maxDate?: Date;
    futureOnly?: boolean;
    pastOnly?: boolean;
  }>;

  constructor(rules: Record<string, { minDate?: Date; maxDate?: Date; futureOnly?: boolean; pastOnly?: boolean; }>) {
    super();
    this.rules = rules;
  }

  protected async performValidation(context: ValidationContext): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const now = new Date();

    for (const [field, rule] of Object.entries(this.rules)) {
      const value = context.data[field];
      
      if (value === undefined || value === null) continue;

      let date: Date;
      if (value instanceof Date) {
        date = value;
      } else if (typeof value === 'string') {
        date = new Date(value);
        if (isNaN(date.getTime())) {
          errors.push(this.createError(
            field,
            `${field} no es una fecha válida`,
            'INVALID_DATE',
            value
          ));
          continue;
        }
      } else {
        continue;
      }

      if (rule.minDate && date < rule.minDate) {
        errors.push(this.createError(
          field,
          `${field} no puede ser anterior a ${rule.minDate.toLocaleDateString()}`,
          'DATE_TOO_EARLY',
          value
        ));
      }

      if (rule.maxDate && date > rule.maxDate) {
        errors.push(this.createError(
          field,
          `${field} no puede ser posterior a ${rule.maxDate.toLocaleDateString()}`,
          'DATE_TOO_LATE',
          value
        ));
      }

      if (rule.futureOnly && date <= now) {
        errors.push(this.createError(
          field,
          `${field} debe ser una fecha futura`,
          'DATE_NOT_FUTURE',
          value
        ));
      }

      if (rule.pastOnly && date >= now) {
        errors.push(this.createError(
          field,
          `${field} debe ser una fecha pasada`,
          'DATE_NOT_PAST',
          value
        ));
      }
    }

    return this.createResult(errors);
  }
}

/**
 * Validador de unicidad (requiere función de verificación personalizada)
 */
export class UniquenessValidator extends BaseValidator {
  private rules: Record<string, {
    checkUnique: (value: unknown) => Promise<boolean>;
    message?: string;
  }>;

  constructor(rules: Record<string, { checkUnique: (value: unknown) => Promise<boolean>; message?: string }>) {
    super();
    this.rules = rules;
  }

  protected async performValidation(context: ValidationContext): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    for (const [field, rule] of Object.entries(this.rules)) {
      const value = context.data[field];
      
      if (value === undefined || value === null || value === '') continue;

      try {
        const isUnique = await rule.checkUnique(value);

        if (!isUnique) {
          errors.push(this.createError(
            field,
            rule.message || `Ya existe un registro con este ${field}`,
            'VALUE_NOT_UNIQUE',
            value
          ));
        }
      } catch (error) {
        console.error(`Error validating uniqueness for ${field}:`, error);
        errors.push(this.createError(
          field,
          `Error validando unicidad de ${field}`,
          'VALIDATION_ERROR',
          value
        ));
      }
    }

    return this.createResult(errors);
  }
}

/**
 * Validador de reglas de negocio personalizadas
 */
export class BusinessRuleValidator extends BaseValidator {
  private rules: Array<{
    name: string;
    validator: (context: ValidationContext) => Promise<ValidationResult>;
  }>;

  constructor(rules: Array<{ name: string; validator: (context: ValidationContext) => Promise<ValidationResult> }>) {
    super();
    this.rules = rules;
  }

  protected async performValidation(context: ValidationContext): Promise<ValidationResult> {
    let combinedResult: ValidationResult = { isValid: true, errors: [], warnings: [] };

    for (const rule of this.rules) {
      try {
        const result = await rule.validator(context);
        combinedResult = this.mergeResults(combinedResult, result);
      } catch (error) {
        console.error(`Error in business rule ${rule.name}:`, error);
        combinedResult.errors.push(this.createError(
          'general',
          `Error en validación de regla de negocio: ${rule.name}`,
          'BUSINESS_RULE_ERROR'
        ));
        combinedResult.isValid = false;
      }
    }

    return combinedResult;
  }

  private mergeResults(current: ValidationResult, next: ValidationResult): ValidationResult {
    return {
      isValid: current.isValid && next.isValid,
      errors: [...current.errors, ...next.errors],
      warnings: [...(current.warnings || []), ...(next.warnings || [])]
    };
  }
}

/**
 * Builder para construir cadenas de validación fácilmente
 */
export class ValidationChainBuilder {
  private validators: BaseValidator[] = [];

  requiredFields(fields: string[]): this {
    this.validators.push(new RequiredFieldsValidator(fields));
    return this;
  }

  dataTypes(typeRules: Record<string, 'string' | 'number' | 'email' | 'date' | 'boolean'>): this {
    this.validators.push(new DataTypeValidator(typeRules));
    return this;
  }

  ranges(rules: Record<string, { min?: number; max?: number; minLength?: number; maxLength?: number }>): this {
    this.validators.push(new RangeValidator(rules));
    return this;
  }

  dates(rules: Record<string, { minDate?: Date; maxDate?: Date; futureOnly?: boolean; pastOnly?: boolean }>): this {
    this.validators.push(new DateValidator(rules));
    return this;
  }

  uniqueness(rules: Record<string, { checkUnique: (value: unknown) => Promise<boolean>; message?: string }>): this {
    this.validators.push(new UniquenessValidator(rules));
    return this;
  }

  businessRules(rules: Array<{ name: string; validator: (context: ValidationContext) => Promise<ValidationResult> }>): this {
    this.validators.push(new BusinessRuleValidator(rules));
    return this;
  }

  custom(validator: BaseValidator): this {
    this.validators.push(validator);
    return this;
  }

  build(): BaseValidator {
    if (this.validators.length === 0) {
      throw new Error('Al menos un validador debe ser agregado a la cadena');
    }

    // Encadenar validadores
    for (let i = 0; i < this.validators.length - 1; i++) {
      this.validators[i].setNext(this.validators[i + 1]);
    }

    return this.validators[0];
  }
}

/**
 * Clase utilitaria para validaciones comunes
 */
export class ValidationUtils {
  static isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isTelefono(telefono: string): boolean {
    const telefonoRegex = /^\+?[\d\s\-\(\)]{8,}$/;
    return telefonoRegex.test(telefono);
  }

  static isDNI(dni: string): boolean {
    const dniRegex = /^\d{7,8}$/;
    return dniRegex.test(dni);
  }

  static isCodigoPostal(cp: string): boolean {
    const cpRegex = /^\d{4}$/; // Código postal argentino
    return cpRegex.test(cp);
  }

  static sanitizeString(str: string): string {
    return str.trim().replace(/\s+/g, ' ');
  }

  static formatError(error: ValidationError): string {
    return `${error.field}: ${error.message}`;
  }

  static formatErrors(errors: ValidationError[]): string[] {
    return errors.map(this.formatError);
  }
}

// Exportar todo para uso fácil
const ValidationExports = {
  BaseValidator,
  RequiredFieldsValidator,
  DataTypeValidator,
  RangeValidator,
  DateValidator,
  UniquenessValidator,
  BusinessRuleValidator,
  ValidationChainBuilder,
  ValidationUtils
};

export default ValidationExports;
