import { createJWT, validateJWT } from "oslo/jwt";
import { type PgDb } from ".";
import { TimeSpan } from "oslo";
import { createHash } from "node:crypto";

export class AuthService {
  private readonly accessTokenSecret: Uint8Array;
  private readonly refreshTokenSecret: Uint8Array;

  constructor(
    private readonly sql: PgDb,
    accessTokenSecret: string,
    refreshTokenSecret: string
  ) {
    this.accessTokenSecret = new TextEncoder().encode(accessTokenSecret);
    this.refreshTokenSecret = new TextEncoder().encode(refreshTokenSecret);
  }

  async createOrSignIn(discordId: string, username: string) {
    const [newUser]: [PerformDiscordAuthRow?] = await this.sql`
        select * from perform_discord_auth(${discordId}, ${username})
    `;
    if (!newUser) return;
    return await this.generateTokens(newUser.userId, newUser.username);
  }

  private async generateTokens(userId: number, username: string) {
    const [accessToken, refreshToken] = await Promise.all([
      createJWT(
        "HS256",
        this.accessTokenSecret,
        {
          userId,
          username,
        },
        {
          expiresIn: new TimeSpan(5, "m"),
          issuer: "clipkit",
        }
      ),
      createJWT(
        "HS256",
        this.refreshTokenSecret,
        {
          userId,
          username,
        },
        {
          expiresIn: new TimeSpan(7, "d"),
          issuer: "clipkit",
        }
      ),
    ]);
    const hashedRefreshToken = base64Encode(refreshToken);
    await this.sql`
      insert into refresh_tokens(token, user_id) values(${hashedRefreshToken}, ${userId})
    `;
    return { accessToken, refreshToken };
  }

  async decodeToken(token: string, type: "access" | "refresh" = "access") {
    try {
      const { payload }: { payload: Record<string, any> } = await validateJWT(
        "HS256",
        type == "access" ? this.accessTokenSecret : this.refreshTokenSecret,
        token
      );
      return payload["userId"] as number;
    } catch {
      return undefined;
    }
  }

  async refreshTokens(token: string) {
    try {
      const userId = await this.decodeToken(token, "refresh");
      if (!userId) return;

      let hashedRefreshToken = base64Encode(token);

      const [deleted]: [UserIdRow?] = await this
        .sql`delete from refresh_tokens where token = ${hashedRefreshToken} returning user_id`;

      if (!deleted) return;

      const [result]: [PerformDiscordAuthRow?] = await this.sql`
        select u.id, u.username
        from users u
        where u.id = ${userId}
      `;
      if (!result) return;
      const { accessToken, refreshToken } = await this.generateTokens(
        userId,
        result.username
      );

      return { accessToken, refreshToken, userId };
    } catch (e) {
      throw e;
    }
  }

  async deleteToken(userId: number, token: string) {
    const encoded = base64Encode(token);
    const [user]: [UserIdRow?] = await this.sql`
      select user_id from refresh_tokens where token = ${encoded}
    `;
    if (!user || user.userId !== userId) return false;
    await this.sql`
      delete from refresh_tokens where token = ${encoded}
    `;
    return true;
  }
}

function base64Encode(s: string) {
  return createHash("sha256").update(s).digest("base64");
}

type PerformDiscordAuthRow = {
  userId: number;
  username: string;
};

type UserIdRow = {
  userId: number;
};
