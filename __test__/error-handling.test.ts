import assert from 'assert/strict';
import type { FilterScheme } from '../src/FilterScheme/types';
import { ArrayFilter, type OperatorNames } from '../src';
import { validateFieldPath } from '../src/ArrayFilter/logic/utils/validateFieldPath';
import {
  FieldPathError,
  FilterError,
  OperatorError,
  ParameterError,
  SchemaValidationError,
} from '../src/common/errors';
import { filterValidator } from '../src/FilterScheme/filter-validator';

describe('Error Handling and Validation', () => {
  describe('Schema Validation', () => {
    it('should throw SchemaValidationError for invalid schemas', () => {
      assert.throws(() => new ArrayFilter('invalid' as any), SchemaValidationError);
      assert.throws(() => new ArrayFilter([{ invalid: 'filter' } as any]), SchemaValidationError);
      assert.throws(() => new ArrayFilter([{ operator: 'equal', value: 'test' } as any]), SchemaValidationError);
    });

    it('should throw SchemaValidationError for invalid logical operators', () => {
      assert.throws(() => new ArrayFilter([{ AND: [], OR: [] } as any]), SchemaValidationError);
      assert.throws(() => new ArrayFilter([{ AND: [] } as any]), SchemaValidationError);
    });

    it('should accept valid schemas', () => {
      const filterer = new ArrayFilter([]);
      const result = filterer.applyFilters([{ name: 'test' }]);
      assert.deepStrictEqual(result, [{ name: 'test' }]);
    });
  });

  describe('Operator Validation', () => {
    it('should throw OperatorError for invalid operators', () => {
      assert.throws(() => filterValidator.validateOperator(123), OperatorError);
      assert.throws(() => filterValidator.validateOperator('unknownOperator'), OperatorError);
    });

    it('should provide suggestion for common operator mistakes', () => {
      try {
        filterValidator.validateOperator('eq');
        assert.fail('Should have thrown OperatorError');
      } catch (error) {
        assert(error instanceof OperatorError);
        assert(error.context?.suggestion === 'equal');
      }
    });
  });

  describe('Field Path Validation', () => {
    it('should throw ParameterError for invalid field paths', () => {
      assert.throws(() => validateFieldPath(123 as any), ParameterError);
      assert.throws(() => validateFieldPath(''), ParameterError);
      assert.throws(() => validateFieldPath('field..name'), ParameterError);
      assert.throws(() => validateFieldPath('.fieldName'), ParameterError);
      assert.throws(() => validateFieldPath('fieldName.'), ParameterError);
    });

    it('should accept valid field paths', () => {
      const validPaths = ['name', 'user.name', 'data.user.profile.email'];
      for (const path of validPaths) {
        assert.doesNotThrow(() => validateFieldPath(path));
      }
    });
  });

  describe('Runtime Error Handling', () => {
    it('should gracefully handle missing nested properties', () => {
      const filterScheme: FilterScheme<OperatorNames> = [
        { fieldName: 'missing.deeply.nested', value: 'test', operator: 'equal' },
      ];
      const filterer = new ArrayFilter(filterScheme);
      const result = filterer.applyFilters([{ name: 'test' }, { missing: null }]);

      // Should return empty array since no items match the missing path
      assert.deepStrictEqual(result, []);
    });

    it('should handle null values in field path gracefully', () => {
      const data = [{ user: { profile: { name: 'John' } } }, { user: null }, { user: { profile: null } }];

      const filterScheme: FilterScheme<OperatorNames> = [
        { fieldName: 'user.profile.name', value: 'John', operator: 'equal' },
      ];
      const filterer = new ArrayFilter(filterScheme);
      const result = filterer.applyFilters(data);

      assert.strictEqual(result.length, 1);
      assert.strictEqual((result as any)[0].user.profile.name, 'John');
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
      const filterer = new ArrayFilter([]);

      assert.throws(() => filterer.changeSchema([{ invalid: 'schema' } as any]), SchemaValidationError);
    });

    it('should accept valid schema when changing via changeSchema method', () => {
      const filterer = new ArrayFilter([]);

      assert.doesNotThrow(() => filterer.changeSchema([{ fieldName: 'name', operator: 'equal', value: 'test' }]));
    });
  });
});
