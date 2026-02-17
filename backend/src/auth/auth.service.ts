import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { UserResponseDto } from '../users/dto/user-response.dto';

/**
 * v0.1.3 — Session Concept
 *
 * Core authentication business logic. Handles:
 *   - register()    → create user + issue JWT          (POST /auth/register)
 *   - login()       → verify credentials + issue JWT   (POST /auth/login)
 *   - getProfile()  → look up user by ID from token    (GET /auth/me)
 *
 * Dependencies (injected via constructor):
 *   - UsersService  → user CRUD against the in-memory store
 *   - JwtService    → sign and verify HS256 JWTs (provided by JwtModule in AuthModule)
 *
 * --- Intentional vulnerabilities (carried forward + new in v0.1.3) ---
 *
 * VULN (v0.1.1): Passwords are stored as plaintext in the in-memory User entity.
 *       No hashing, no salting. UsersService.create() stores dto.password as-is.
 *       CWE-256 (Plaintext Storage of a Password) | A07:2021
 *       Remediation (v2.0.0): bcrypt with cost factor 12.
 *
 * VULN (v0.1.2): Passwords are compared as plaintext (=== operator).
 *       CWE-256 | A07:2021
 *       Remediation (v2.0.0): bcrypt.compare().
 *
 * VULN (v0.1.2): Error messages are intentionally distinct ("No user with that
 *       email" vs "Incorrect password"), enabling user enumeration.
 *       CWE-204 (Observable Response Discrepancy) | A07:2021
 *       Remediation (v2.0.0): Generic "Authentication failed" for all cases.
 *
 * VULN (v0.1.3): JWTs are signed with a hardcoded weak secret ('kc-secret')
 *       using HS256. Anyone who knows the secret can forge tokens.
 *       CWE-347 (Improper Verification of Cryptographic Signature) | A02:2021
 *       Remediation (v2.0.0): RS256 asymmetric keys loaded from environment.
 *
 * VULN (v0.1.3): JWTs have no expiration claim (`exp`). Once issued, a token
 *       is valid forever — even after password change or user deletion.
 *       CWE-613 (Insufficient Session Expiration) | A07:2021
 *       Remediation (v2.0.0): 15-minute access token TTL + refresh token rotation.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * POST /auth/register — Create a new user and issue a JWT.
   *
   * Flow:
   *   1. Validate required fields (email, username, password)
   *   2. Check for duplicate email via UsersService.findByEmail()
   *   3. Create user via UsersService.create() (stores plaintext password)
   *   4. Sign JWT with payload { sub: user.id } — no expiry
   *   5. Return AuthResponseDto with the real JWT
   *
   * Error responses:
   *   - 400 BadRequest     → missing required fields
   *   - 409 Conflict       → duplicate email (leaky message includes email — CWE-209)
   *
   * @param dto  RegisterDto with email, username, password
   * @returns    AuthResponseDto with signed JWT, userId, and message
   */
  register(dto: RegisterDto): AuthResponseDto {
    const { email, username, password } = dto;

    if (!email || !username || !password) {
      throw new BadRequestException(
        'Missing required registration fields: email, username, and password are all required (v0.1.1)',
      );
    }

    const existing = this.usersService.findByEmail(email);
    if (existing) {
      // VULN: error message includes the email — information disclosure (CWE-209)
      throw new ConflictException(
        `User with email ${email} already exists (weak duplicate check, v0.1.1)`,
      );
    }

    const created = this.usersService.create({
      email,
      username,
      password, // VULN: stored as plaintext by UsersService (CWE-256)
    });

    // VULN: JWT signed with weak hardcoded secret, no expiry (CWE-347, CWE-613)
    const token = this.jwtService.sign({ sub: created.id });

    return {
      token,
      userId: created.id,
      message: 'Registration success (v0.1.3)',
    };
  }

  /**
   * POST /auth/login — Verify credentials and issue a JWT.
   *
   * Flow:
   *   1. Validate required fields (email, password)
   *   2. Look up user by email via UsersService.findEntityByEmail()
   *      (returns raw User entity including plaintext password)
   *   3. Compare password with === (plaintext comparison — CWE-256)
   *   4. Sign JWT with payload { sub: user.id } — no expiry
   *   5. Return AuthResponseDto with the real JWT
   *
   * Error responses:
   *   - 400 BadRequest      → missing required fields
   *   - 401 Unauthorized    → "No user with that email" (leaky — CWE-204)
   *   - 401 Unauthorized    → "Incorrect password" (leaky — CWE-204)
   *
   * @param dto  LoginDto with email, password
   * @returns    AuthResponseDto with signed JWT, userId, and message
   */
  login(dto: LoginDto): AuthResponseDto {
    const { email, password } = dto;

    if (!email || !password) {
      throw new BadRequestException(
        'Missing required login fields: email and password are both required (v0.1.2)',
      );
    }

    const user = this.usersService.findEntityByEmail(email);
    if (!user) {
      // VULN: distinct error reveals that this email is not registered (CWE-204)
      throw new UnauthorizedException(
        `No user with that email (v0.1.2)`,
      );
    }

    // VULN: plaintext password comparison — no hashing (CWE-256)
    if (user.password !== password) {
      // VULN: distinct error reveals that the email IS registered (CWE-204)
      throw new UnauthorizedException(
        `Incorrect password (v0.1.2)`,
      );
    }

    // VULN: JWT signed with weak hardcoded secret, no expiry (CWE-347, CWE-613)
    const token = this.jwtService.sign({ sub: user.id });

    return {
      token,
      userId: user.id,
      message: 'Login success (v0.1.3)',
    };
  }

  /**
   * GET /auth/me — Retrieve the profile of the currently authenticated user.
   *
   * Called by AuthController after JwtAuthGuard has verified the token and
   * extracted the payload into request.user. The controller passes user.sub
   * (the user ID from the JWT) to this method.
   *
   * Flow:
   *   1. Look up user by ID via UsersService.findById()
   *   2. If not found, throw 404 (the JWT references a deleted/non-existent user)
   *   3. Return UserResponseDto (id, email, username — no password)
   *
   * Why this lives in AuthService (not a separate ProfileService):
   *   AuthService already has UsersService injected. Keeping getProfile() here
   *   avoids injecting a second service into the controller and keeps the
   *   controller thin. If profile logic grows, it can be extracted later.
   *
   * @param userId  The `sub` claim from the verified JWT payload
   * @returns       UserResponseDto (password is stripped by UsersService.findById)
   * @throws        NotFoundException if user ID does not exist in the store
   */
  getProfile(userId: string): UserResponseDto {
    const user = this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(
        `User with ID ${userId} not found (v0.1.3)`,
      );
    }
    return user;
  }
}
