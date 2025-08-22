import assert from 'assert/strict';
import { Filterer } from '../src/index';
import {
  FilterError,
  SchemaValidationError,
  OperatorError,
  FieldPathError,
  ParameterError,
  validateFilterSchema,
  validateOperator,
  validateFieldPath,
} from '../src/index';
import type { FilterScheme } from '../src/types';

describe('Error Handling and Validation', () => {
  describe('Schema Validation', () => {
    it('should throw SchemaValidationError for non-array schema', () => {
      assert.throws(() => new Filterer('invalid' as any), SchemaValidationError);
    });

    it('should throw SchemaValidationError for invalid filter objects', () => {
      assert.throws(() => new Filterer([{ invalid: 'filter' } as any]), SchemaValidationError);
    });

    it('should throw SchemaValidationError for missing fieldName', () => {
      assert.throws(() => new Filterer([{ operator: 'equal', value: 'test' } as any]), SchemaValidationError);
    });

    it('should throw SchemaValidationError for missing operator', () => {
      assert.throws(() => new Filterer([{ fieldName: 'test', value: 'test' } as any]), SchemaValidationError);
    });

    it('should throw SchemaValidationError for empty fieldName', () => {
      assert.throws(() => new Filterer([{ fieldName: '', operator: 'equal', value: 'test' }]), SchemaValidationError);
    });

    it('should throw SchemaValidationError for both AND and OR in same filter', () => {
      assert.throws(() => new Filterer([{ AND: [], OR: [] } as any]), SchemaValidationError);
    });

    it('should throw SchemaValidationError for empty logical operators', () => {
      assert.throws(() => new Filterer([{ AND: [] } as any]), SchemaValidationError);
    });

    it('should throw SchemaValidationError for non-array logical operators', () => {
      assert.throws(() => new Filterer([{ AND: 'invalid' } as any]), SchemaValidationError);
    });

    it('should accept empty filter schema', () => {
      const filterer = new Filterer([]);
      const result = filterer.applyFilters({ data: [{ name: 'test' }] });
      assert.deepStrictEqual(result, [{ name: 'test' }]);
    });
  });

  describe('Operator Validation', () => {
    it('should throw OperatorError for non-string operator', () => {
      assert.throws(() => validateOperator(123), OperatorError);
    });

    it('should throw OperatorError for unknown operator', () => {
      assert.throws(() => validateOperator('unknownOperator'), OperatorError);
    });

    it('should provide suggestion for common operator mistakes', () => {
      try {
        validateOperator('eq');
        assert.fail('Should have thrown OperatorError');
      } catch (error) {
        assert(error instanceof OperatorError);
        assert(error.context?.suggestion === 'equal');
      }
    });

    it('should validate all supported operators', () => {
      const validOperators = [
        'equal',
        'equals',
        'softEqual',
        'gt',
        'gte',
        'lt',
        'lte',
        'startsWith',
        'endsWith',
        'includes',
        'includesCaseInsensitive',
        'custom',
        'isEmptyString',
        'isNull',
        'isNullish',
        'isFalsy',
        'isTruthy',
        'exists',
        'keyExists',
        'applyNot',
      ];

      for (const operator of validOperators) {
        assert.doesNotThrow(() => validateOperator(operator));
      }
    });
  });

  describe('Field Path Validation', () => {
    it('should throw ParameterError for non-string field path', () => {
      assert.throws(() => validateFieldPath(123 as any), ParameterError);
    });

    it('should throw ParameterError for empty field path', () => {
      assert.throws(() => validateFieldPath(''), ParameterError);
    });

    it('should throw ParameterError for consecutive dots', () => {
      assert.throws(() => validateFieldPath('field..name'), ParameterError);
    });

    it('should throw ParameterError for leading dot', () => {
      assert.throws(() => validateFieldPath('.fieldName'), ParameterError);
    });

    it('should throw ParameterError for trailing dot', () => {
      assert.throws(() => validateFieldPath('fieldName.'), ParameterError);
    });

    it('should accept valid field paths', () => {
      const validPaths = ['name', 'user.name', 'data.user.profile.email', 'items.0.value'];

      for (const path of validPaths) {
        assert.doesNotThrow(() => validateFieldPath(path));
      }
    });
  });

  describe('Runtime Error Handling', () => {
    it('should handle custom operator without function gracefully', () => {
      assert.throws(() => new Filterer([{ fieldName: 'name', operator: 'custom', value: 'test' }]), ParameterError);
    });

    it('should handle keyExists with non-string value', () => {
      assert.throws(() => new Filterer([{ fieldName: 'obj', operator: 'keyExists', value: 123 }]), ParameterError);
    });

    it('should gracefully handle missing nested properties', () => {
      const filterScheme: FilterScheme = [{ fieldName: 'missing.deeply.nested', value: 'test', operator: 'equal' }];
      const filterer = new Filterer(filterScheme);
      const result = filterer.applyFilters({ data: [{ name: 'test' }, { missing: null }] });

      // Should return empty array since no items match the missing path
      assert.deepStrictEqual(result, []);
    });

    it('should handle null values in field path gracefully', () => {
      const data = [{ user: { profile: { name: 'John' } } }, { user: null }, { user: { profile: null } }];

      const filterScheme: FilterScheme = [{ fieldName: 'user.profile.name', value: 'John', operator: 'equal' }];
      const filterer = new Filterer(filterScheme);
      const result = filterer.applyFilters({ data });

      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].user.profile.name, 'John');
    });
  });

  describe('Error Classes', () => {
    it('should create FilterError with proper properties', () => {
      const error = new FilterError('Test message', 'TEST_CODE', { extra: 'data' });

      assert.strictEqual(error.name, 'FilterError');
      assert.strictEqual(error.message, 'Test message');
      assert.strictEqual(error.code, 'TEST_CODE');
      assert.deepStrictEqual(error.context, { extra: 'data' });
      assert(error instanceof Error);
      assert(error instanceof FilterError);
    });

    it('should create SchemaValidationError with proper inheritance', () => {
      const error = new SchemaValidationError('Schema error');

      assert.strictEqual(error.name, 'SchemaValidationError');
      assert.strictEqual(error.code, 'SCHEMA_VALIDATION_ERROR');
      assert(error instanceof FilterError);
      assert(error instanceof SchemaValidationError);
    });

    it('should create OperatorError with proper inheritance', () => {
      const error = new OperatorError('Operator error');

      assert.strictEqual(error.name, 'OperatorError');
      assert.strictEqual(error.code, 'OPERATOR_ERROR');
      assert(error instanceof FilterError);
      assert(error instanceof OperatorError);
    });

    it('should create FieldPathError with proper inheritance', () => {
      const error = new FieldPathError('Field path error');

      assert.strictEqual(error.name, 'FieldPathError');
      assert.strictEqual(error.code, 'FIELD_PATH_ERROR');
      assert(error instanceof FilterError);
      assert(error instanceof FieldPathError);
    });

    it('should create ParameterError with proper inheritance', () => {
      const error = new ParameterError('Parameter error');

      assert.strictEqual(error.name, 'ParameterError');
      assert.strictEqual(error.code, 'PARAMETER_ERROR');
      assert(error instanceof FilterError);
      assert(error instanceof ParameterError);
    });
  });

  describe('Schema Validation on changeSchema', () => {
    it('should validate schema when changing via changeSchema method', () => {
      const filterer = new Filterer([]);

      assert.throws(() => filterer.changeSchema([{ invalid: 'schema' } as any]), SchemaValidationError);
    });

    it('should accept valid schema when changing via changeSchema method', () => {
      const filterer = new Filterer([]);

      assert.doesNotThrow(() => filterer.changeSchema([{ fieldName: 'name', operator: 'equal', value: 'test' }]));
    });
  });
});
