/* Made mostly by AI */

import { validate } from 'class-validator';
import { SignupDTO, LoginDTO } from './auth';

describe('Auth DTOs', () => {
  describe('SignupDTO', () => {
    it('should pass validation with valid data', async () => {
      // Arrange
      const dto = new SignupDTO();
      dto.name = 'John Doe';
      dto.email = 'john@example.com';
      dto.password = 'StrongP@ss1';
      dto.passwordConfirm = 'StrongP@ss1';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    describe('name validation', () => {
      it('should fail with name too short', async () => {
        // Arrange
        const dto = new SignupDTO();
        dto.name = 'Jo'; // Too short (min 4)
        dto.email = 'john@example.com';
        dto.password = 'StrongP@ss1';
        dto.passwordConfirm = 'StrongP@ss1';

        // Act
        const errors = await validate(dto);

        // Assert
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('name');
        expect(errors[0].constraints).toHaveProperty('minLength');
      });

      it('should fail with name too long', async () => {
        // Arrange
        const dto = new SignupDTO();
        dto.name = 'J'.repeat(21); // Too long (max 20)
        dto.email = 'john@example.com';
        dto.password = 'StrongP@ss1';
        dto.passwordConfirm = 'StrongP@ss1';

        // Act
        const errors = await validate(dto);

        // Assert
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('name');
        expect(errors[0].constraints).toHaveProperty('maxLength');
      });

      it('should fail with non-string name', async () => {
        // Arrange
        const dto = new SignupDTO();
        dto.name = 123 as any; // Not a string
        dto.email = 'john@example.com';
        dto.password = 'StrongP@ss1';
        dto.passwordConfirm = 'StrongP@ss1';

        // Act
        const errors = await validate(dto);

        // Assert
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('name');
        expect(errors[0].constraints).toHaveProperty('isString');
      });
    });

    describe('email validation', () => {
      it('should fail with invalid email format', async () => {
        // Arrange
        const dto = new SignupDTO();
        dto.name = 'John Doe';
        dto.email = 'invalid-email'; // Invalid format
        dto.password = 'StrongP@ss1';
        dto.passwordConfirm = 'StrongP@ss1';

        // Act
        const errors = await validate(dto);

        // Assert
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('email');
        expect(errors[0].constraints).toHaveProperty('isEmail');
      });

      it('should pass with valid email formats', async () => {
        const validEmails = [
          'john@example.com',
          'john.doe@example.com',
          'john+test@example.co.uk',
          'user123@test-domain.org',
        ];

        for (const email of validEmails) {
          // Arrange
          const dto = new SignupDTO();
          dto.name = 'John Doe';
          dto.email = email;
          dto.password = 'StrongP@ss1';
          dto.passwordConfirm = 'StrongP@ss1';

          // Act
          const errors = await validate(dto);

          // Assert
          expect(errors).toHaveLength(0);
        }
      });
    });

    describe('password validation', () => {
      it('should fail with weak passwords', async () => {
        const weakPasswords = [
          'weak', // Too short
          'weakpassword', // No uppercase, numbers, symbols
          'WEAKPASSWORD', // No lowercase, numbers, symbols
          'WeakPassword', // No numbers, symbols
          'WeakP@ss', // No numbers
          'WeakPass1', // No symbols
        ];

        for (const password of weakPasswords) {
          // Arrange
          const dto = new SignupDTO();
          dto.name = 'John Doe';
          dto.email = 'john@example.com';
          dto.password = password;
          dto.passwordConfirm = password;

          // Act
          const errors = await validate(dto);

          // Assert
          expect(errors.length).toBeGreaterThan(0);
          const passwordError = errors.find(
            (error) => error.property === 'password',
          );
          expect(passwordError).toBeDefined();
          expect(passwordError?.constraints).toHaveProperty('isStrongPassword');
        }
      });

      it('should pass with strong passwords', async () => {
        const strongPasswords = [
          'StrongP@ss1',
          'MyS3cure!Pass',
          'C0mpl3x#P@ssw0rd',
        ];

        for (const password of strongPasswords) {
          // Arrange
          const dto = new SignupDTO();
          dto.name = 'John Doe';
          dto.email = 'john@example.com';
          dto.password = password;
          dto.passwordConfirm = password;

          // Act
          const errors = await validate(dto);

          // Assert
          expect(errors).toHaveLength(0);
        }
      });
    });

    describe('password confirmation validation', () => {
      it('should fail when passwords do not match', async () => {
        // Arrange
        const dto = new SignupDTO();
        dto.name = 'John Doe';
        dto.email = 'john@example.com';
        dto.password = 'StrongP@ss1';
        dto.passwordConfirm = 'DifferentP@ss1'; // Different password

        // Act
        const errors = await validate(dto);

        // Assert
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('passwordConfirm');
        expect(errors[0].constraints).toHaveProperty('match');
        expect(errors[0].constraints?.match).toBe('Passwords do not match');
      });

      it('should pass when passwords match', async () => {
        // Arrange
        const dto = new SignupDTO();
        dto.name = 'John Doe';
        dto.email = 'john@example.com';
        dto.password = 'StrongP@ss1';
        dto.passwordConfirm = 'StrongP@ss1'; // Same password

        // Act
        const errors = await validate(dto);

        // Assert
        expect(errors).toHaveLength(0);
      });
    });
  });

  describe('LoginDTO', () => {
    it('should pass validation with valid data', async () => {
      // Arrange
      const dto = new LoginDTO();
      dto.email = 'john@example.com';
      dto.password = 'any-password';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should fail with invalid email', async () => {
      // Arrange
      const dto = new LoginDTO();
      dto.email = 'invalid-email';
      dto.password = 'any-password';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should fail with empty password', async () => {
      // Arrange
      const dto = new LoginDTO();
      dto.email = 'john@example.com';
      dto.password = ''; // Empty password

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail with missing email', async () => {
      // Arrange
      const dto = new LoginDTO();
      dto.password = 'any-password';
      // dto.email is undefined

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should fail with missing password', async () => {
      // Arrange
      const dto = new LoginDTO();
      dto.email = 'john@example.com';
      // dto.password is undefined

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });
});
