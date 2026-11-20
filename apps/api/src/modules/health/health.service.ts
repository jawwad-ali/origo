import { Injectable, Logger } from "@nestjs/common";
import { type HealthDto } from "@origo/shared";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthDto> {
    const database = await this.ping();
    return { status: database === "up" ? "ok" : "error", checks: { database } };
  }

  private async ping(): Promise<"up" | "down"> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return "up";
    } catch (error) {
      this.logger.error(
        `Database health check failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return "down";
    }
  }
}
