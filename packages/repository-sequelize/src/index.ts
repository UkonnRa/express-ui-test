import { DataTypes, Sequelize } from "sequelize";
import { User } from "./user";

export const createUser = async (): Promise<unknown> => {
  const sequelize = new Sequelize("sqlite::memory:");
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "users",
      paranoid: true,
      indexes: [
        {
          unique: true,
          fields: ["firstName", "lastName"],
        },
      ],
    }
  );
  await sequelize.sync({ force: true });
  const user = await User.create({ firstName: "First", lastName: "Last" });
  return user.toJSON();
};
