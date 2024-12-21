import type { PgDb } from ".";

export class AccountsService {
  constructor(private readonly sql: PgDb) {}

  async updateUsername(userId: number, newUsername: string) {
    try {
      await this.sql`
        update users set username = ${newUsername} where id = ${userId}
      `;
    } catch (e) {
      if (e instanceof this.sql.PostgresError && e.code == "23505") {
        throw new Error("A user with that username already exists.");
      }
      throw new Error("An error occured while updating the username", {
        cause: e,
      });
    }
  }

  async getUserDetails(userId: number) {
    const [user]: [UserDetails?] = await this.sql`
        select username from users where id = ${userId}
    `;
    return user;
  }
}

type UserDetails = {
  username: string;
};
