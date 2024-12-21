import type { PgDb } from ".";

export class AccountsService {
  constructor(private readonly sql: PgDb) {}

  async updateUsername(userId: number, newUsername: string) {
    try {
      await this.sql`
        update users set username = ${newUsername} where id = ${userId}
      `;
    } catch (e) {
      throw new Error("An error occured while updating the username", {
        cause: e,
      });
    }
  }

  async getUserDetails(userId: number) {
    const [user] : [UserDetails?] = await this.sql`
        select username from users where id = ${userId}
    `
    return user;
  }
}

type UserDetails = {
    username: string;
}
