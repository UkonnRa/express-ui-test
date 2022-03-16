import { createUser } from "@white-rabbit/repository-sequelize";

describe("index", () => {
  it("can create users", async () => {
    expect(await createUser()).toEqual(
      expect.objectContaining({ firstName: "First", lastName: "Last" })
    );
  });
});
