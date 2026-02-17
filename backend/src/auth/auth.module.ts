import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

/**
 * v0.2.2 — Identifier Trust Failures
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
 *   exports:
 *     - JwtModule      → allows other modules to use JwtAuthGuard (v0.2.2)
 *
 * --- NestJS convention: Module as composition boundary ---
 * A module declares what it owns (controllers[], providers[]) and what it
 * needs from other modules (imports[]). NestJS instantiates and wires all
 * dependencies via its IoC container. JwtModule.register() creates a
 * module-scoped JwtService that AuthService and JwtAuthGuard can inject.
 *
 * As of v0.2.2, JwtModule is exported so resource modules (Users, Files,
 * Sharing, Admin) can import AuthModule and use JwtAuthGuard on their
 * controllers. This provides authentication on all endpoints.
 *
 * VULN (v0.2.2): JwtModule is exported so all modules can use JwtAuthGuard,
 *       but no authorization logic accompanies the guard. Authentication
 *       verifies identity; authorization (ownership, roles) is entirely absent.
 *       CWE-862 (Missing Authorization) | A01:2021 Broken Access Control
 *       Remediation (v2.0.0): Per-resource ownership checks, RBAC middleware.
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
  exports: [JwtModule], // v0.2.2: allows resource modules to use JwtAuthGuard (CWE-862)
})
export class AuthModule {}
