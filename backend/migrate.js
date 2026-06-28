import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { Umzug, SequelizeStorage } from "umzug";
import { sequelize } from "./src/config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const umzug = new Umzug({
    migrations: {
        glob: path.join(__dirname, "migrations", "*.js"),
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
});

umzug.runAsCLI();
