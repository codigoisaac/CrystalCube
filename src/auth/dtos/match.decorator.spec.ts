/* Made mostly by AI */

import { validate } from 'class-validator';
import { Match } from './match.decorator';

// Test class to test the decorator
class TestClass {
  password: string;

  @Match('password', { message: 'passwordConfirm must match password' })
  passwordConfirm: string;
}

describe('Match Decorator', () => {
  it('should pass validation when properties match', async () => {
    // Arrange
    const testObj = new TestClass();
    testObj.password = 'test123';
    testObj.passwordConfirm = 'test123'; // Same value

    // Act
    const errors = await validate(testObj);

    // Assert
    expect(errors).toHaveLength(0);
  });

  it('should fail validation when properties do not match', async () => {
    // Arrange
    const testObj = new TestClass();
    testObj.password = 'test123';
    testObj.passwordConfirm = 'different456'; // Different value

    // Act
    const errors = await validate(testObj);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('passwordConfirm');
    expect(errors[0].constraints).toHaveProperty('match');
    expect(errors[0].constraints?.match).toBe(
      'passwordConfirm must match password',
    );
  });

  it('should fail validation when target property is undefined', async () => {
    // Arrange
    const testObj = new TestClass();
    testObj.password = 'test123';
    // passwordConfirm is undefined

    // Act
    const errors = await validate(testObj);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('passwordConfirm');
    expect(errors[0].constraints).toHaveProperty('match');
  });

  it('should fail validation when source property is undefined', async () => {
    // Arrange
    const testObj = new TestClass();
    // password is undefined
    testObj.passwordConfirm = 'test123';

    // Act
    const errors = await validate(testObj);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('passwordConfirm');
    expect(errors[0].constraints).toHaveProperty('match');
  });

  it('should pass validation when both properties are undefined', async () => {
    // Arrange
    const testObj = new TestClass();
    // Both password and passwordConfirm are undefined

    // Act
    const errors = await validate(testObj);

    // Assert
    expect(errors).toHaveLength(0);
  });

  it('should pass validation when both properties are empty strings', async () => {
    // Arrange
    const testObj = new TestClass();
    testObj.password = '';
    testObj.passwordConfirm = '';

    // Act
    const errors = await validate(testObj);

    // Assert
    expect(errors).toHaveLength(0);
  });

  it('should work with different property types', async () => {
    // Test class with numbers
    class NumberTestClass {
      value1: number;

      @Match('value1')
      value2: number;
    }

    // Arrange
    const testObj = new NumberTestClass();
    testObj.value1 = 42;
    testObj.value2 = 42;

    // Act
    const errors = await validate(testObj);

    // Assert
    expect(errors).toHaveLength(0);
  });

  it('should use custom validation options', async () => {
    // Test class with custom message
    class CustomMessageClass {
      field1: string;

      @Match('field1', { message: 'Custom error message' })
      field2: string;
    }

    // Arrange
    const testObj = new CustomMessageClass();
    testObj.field1 = 'value1';
    testObj.field2 = 'value2'; // Different value

    // Act
    const errors = await validate(testObj);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('field2');
    expect(errors[0].constraints?.match).toBe('Custom error message');
  });

  it('should use default message when no custom message provided', async () => {
    // Test class without custom message
    class DefaultMessageClass {
      sourceField: string;

      @Match('sourceField') // No custom message
      targetField: string;
    }

    // Arrange
    const testObj = new DefaultMessageClass();
    testObj.sourceField = 'value1';
    testObj.targetField = 'value2'; // Different value

    // Act
    const errors = await validate(testObj);

    // Assert
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('targetField');
    expect(errors[0].constraints?.match).toBe(
      'targetField must match sourceField',
    );
  });
});
