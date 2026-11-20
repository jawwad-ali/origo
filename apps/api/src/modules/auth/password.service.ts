import { Injectable, type OnModuleInit } from "@nestjs/common";
import argon2 from "argon2";

const HASH_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
};

@Injectable()
export class PasswordService implements OnModuleInit {
  /** Used when the email doesn't exist, so a failed login takes the same time either way. */
  private dummyHash = "";

  async onModuleInit(): Promise<void> {
    this.dummyHash = await argon2.hash("origo-timing-equalizer", HASH_OPTIONS);
  }

  hash(password: string): Promise<string> {
    return argon2.hash(password, HASH_OPTIONS);
  }

  async verify(hash: string | null, password: string): Promise<boolean> {
    const valid = await argon2.verify(hash ?? this.dummyHash, password);
    return hash !== null && valid;
  }
}
