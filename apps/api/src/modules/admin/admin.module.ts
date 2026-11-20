import { Module } from "@nestjs/common";
import { OrganizationsModule } from "../organizations/organizations.module";
import { AdminOrganizationsController } from "./admin-organizations.controller";

@Module({
  imports: [OrganizationsModule],
  controllers: [AdminOrganizationsController],
})
export class AdminModule {}
