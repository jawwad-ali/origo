import { Injectable } from "@nestjs/common";
import { type CurrentUserDto } from "@origo/shared";
import { type Prisma } from "@prisma/client";
import { EntityNotFoundException } from "../../common/exceptions/domain.exceptions";
import { type Principal } from "../../common/types/principal";
import { toCurrentUserDto, toPrincipal } from "./user.mapper";
import { type CreateUserData, UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(private readonly users: UsersRepository) {}

  findCredentials(email: string): Promise<{ id: string; passwordHash: string } | null> {
    return this.users.findByEmail(email);
  }

  emailTaken(email: string, tx?: Prisma.TransactionClient): Promise<boolean> {
    return this.users.existsByEmail(email, tx);
  }

  create(data: CreateUserData, tx?: Prisma.TransactionClient): Promise<{ id: string }> {
    return this.users.create(data, tx);
  }

  recordLogin(userId: string): Promise<void> {
    return this.users.touchLastLogin(userId);
  }

  async getPrincipal(userId: string): Promise<Principal | null> {
    const user = await this.users.findPrincipal(userId);
    return user ? toPrincipal(user) : null;
  }

  async getCurrentUser(userId: string): Promise<CurrentUserDto> {
    const user = await this.users.findCurrentUser(userId);
    if (!user) throw new EntityNotFoundException("User");
    return toCurrentUserDto(user);
  }
}
