import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class PasswordGeneratorService {
  /**
   * Generates a secure, random password.
   * @param length The desired length of the password.
   * @returns A random string.
   */
  generate(length = 12): string {
    // Gera uma senha forte com letras maiúsculas, minúsculas, números e símbolos.
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let password = '';
    const randomBytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      password += charset[randomBytes[i] % charset.length];
    }
    return password;
  }
}
