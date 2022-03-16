import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<string>;
  declare firstName: string;
  declare lastName?: string;
}
