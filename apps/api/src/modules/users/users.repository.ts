import { Injectable } from "@nestjs/common";
import { type Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

const principalSelect = {
  id: true,
  email: true,
  isPlatformAdmin: true,
  membership: { select: { role: true, organization: { select: { id: true, type: true, status: true } } } },
} satisfies Prisma.UserSelect;

const currentUserInclude = {
  membership: { include: { organization: true } },
} satisfies Prisma.UserInclude;

export type PrincipalRecord = Prisma.UserGetPayload<{ select: typeof principalSelect }>;
export type CurrentUserRecord = Prisma.UserGetPayload<{ include: typeof currentUserInclude }>;

export interface CreateUserData {
  email: string;
  fullName: string;
  passwordHash: string;
}

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<{ id: string; passwordHash: string } | null> {
    return this.prisma.user.findUnique({ where: { email }, select: { id: true, passwordHash: true } });
  }

  existsByEmail(email: string, tx: Prisma.TransactionClient = this.prisma): Promise<boolean> {
    return tx.user.count({ where: { email } }).then((count) => count > 0);
  }

  create(data: CreateUserData, tx: Prisma.TransactionClient = this.prisma): Promise<{ id: string }> {
    return tx.user.create({ data, select: { id: true } });
  }

  async touchLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } });
  }

  findPrincipal(id: string): Promise<PrincipalRecord | null> {
    return this.prisma.user.findUnique({ where: { id }, select: principalSelect });
  }

  findCurrentUser(id: string): Promise<CurrentUserRecord | null> {
    return this.prisma.user.findUnique({ where: { id }, include: currentUserInclude });
  }
}
