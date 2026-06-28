import { sequelize } from "./db.js";
import userLoader from "../models/user.model.js"
import postLoader from "../models/post.model.js"

export const db = {}
db.sequelize = sequelize;
db.userModel = userLoader(sequelize);
db.postModel = postLoader(sequelize);

db.postModel.associate(db);
db.userModel.associate(db);