import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

/**
 * v0.1.3 — Session Concept
 *
 * Auth feature module. Composes everything related to authentication:
 *
 *   imports:
 *     - UsersModule    → gives AuthService access to UsersService (user lookup, creation)
 *     - JwtModule      → provides JwtService for signing and verifying tokens
 *
 *   controllers:
 *     - AuthController → POST /auth/register, POST /auth/login, GET /auth/me
 *
 *   providers:
 *     - AuthService    → business logic (credential check, JWT signing, profile lookup)
 *
 * --- NestJS convention: Module as composition boundary ---
 * A module declares what it owns (controllers[], providers[]) and what it
 * needs from other modules (imports[]). NestJS instantiates and wires all
 * dependencies via its IoC container. JwtModule.register() creates a
 * module-scoped JwtService that AuthService and JwtAuthGuard can inject.
 *
 * JwtModule does NOT need to be in exports[] because the guard and service
 * that use JwtService both live inside this module.
 *
 * VULN: The JWT secret is a hardcoded static string ('kc-secret') compiled
 *       directly into the server. Anyone who reads the source (or guesses
 *       the trivial secret) can forge arbitrary tokens.
 *       CWE-798 (Use of Hard-coded Credentials) | A02:2021 Cryptographic Failures
 *       Remediation (v2.0.0): RS256 asymmetric keypair loaded from Docker
 *       secrets or environment variables, rotated periodically.
 *
 * VULN: No signOptions.expiresIn is set, so JWTs have no `exp` claim and
 *       remain valid forever once issued. A stolen token grants indefinite
 *       access even if the user changes their password or is deleted.
 *       CWE-613 (Insufficient Session Expiration) | A07:2021 Identification and Authentication Failures
 *       Remediation (v2.0.0): 15-minute access token TTL with refresh token rotation.
 */
@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: 'kc-secret', // VULN: hardcoded weak secret (CWE-798 | A02:2021)
      // VULN: no signOptions.expiresIn — tokens never expire (CWE-613 | A07:2021)
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
