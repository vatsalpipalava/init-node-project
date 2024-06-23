#!/usr/bin/env node

import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import chalk from "chalk";
import { execSync } from "child_process";
import { getLatestVersion } from "./api/api.js";
import ora from "ora";

const questions = [
  {
    type: "input",
    name: "name",
    message: "Enter your project name:",
    default: "my-node-app",
  },
  // {
  //   type: "list",
  //   name: "framework",
  //   message: "Select your preferred language:",
  //   choices: ["JavaScript", "TypeScript"],
  //   default: "JavaScript",
  // },
  {
    type: "confirm",
    name: "useCors",
    message: "Do you want to enable CORS?",
    default: true,
  },
  {
    type: "confirm",
    name: "useEnvFile",
    message: "Do you want to use an environment file?",
    default: true,
  },
  {
    type: "confirm",
    name: "useMorganWinston",
    message: "Do you want to use morgan and winston for logging?",
    default: true,
  },
  {
    type: "confirm",
    name: "useResErrAsyncHandler",
    message:
      "Do you want to use a basic Response handler, Error handler and Async handler?",
    default: true,
  },
  {
    type: "confirm",
    name: "useGithub",
    message: "Do you want to initialize Github?",
    default: true,
  },
  {
    type: "confirm",
    name: "usePrettier",
    message: "Do you want to enable Prettier?",
    default: true,
  },
  {
    type: "confirm",
    name: "connectMongoDB",
    message: "Do you want to connect mongoDB database?",
    default: true,
  },
  // {
  //   type: "confirm",
  //   name: "useDocker",
  //   message: "Do you want to use Docker for deployment?",
  //   default: false,
  // },
];

async function createApp() {
  console.log("\n");
  console.log(chalk.green("Welcome to the Node.js project generator! 🚀"));
  // console.log("\n");
  const answers = await inquirer.prompt(questions);
  console.log("\n");
  const spinner = ora("Setting up your project...\n\n").start();
  // console.log("\n");
  try {
    const projectName = answers.name;
    const projectDir = `./${projectName}`;

    const fileExtension = "js";

    const indexFileImportLines = [`import { app } from "./app.js";`];
    const appFileImportLines = [`import express from "express"`];
    const envFileContent = [`PORT = 8080`];
    const middlewareLines = [
      `app.use(express.json({ limit: "16kb" }));`,
      `app.use(express.urlencoded({ extended: true, limit: "16kb" }));`,
      `app.use(express.static("public"));`,
    ];

    // Create project directory and subdirectories if they don't exist
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
      fs.mkdirSync(`${projectDir}/src/models`, { recursive: true });
      fs.mkdirSync(`${projectDir}/src/routes`, { recursive: true });
      fs.mkdirSync(`${projectDir}/src/controllers`, { recursive: true });
      fs.mkdirSync(`${projectDir}/src/middlewares`, { recursive: true });
      fs.mkdirSync(`${projectDir}/src/utils`, { recursive: true });
      fs.mkdirSync(`${projectDir}/src/config`, { recursive: true });
      fs.mkdirSync(`${projectDir}/src/tests`, { recursive: true });
      fs.mkdirSync(`${projectDir}/src/db`, { recursive: true });
      fs.mkdirSync(`${projectDir}/public/temp`, { recursive: true });

      const constantFilePath = path.join(projectDir, "src", "constants.js");
      const logFilePath = path.join(projectDir, "src", "logs", "app.log");

      if (answers.useMorganWinston) {
        fs.mkdirSync(`${projectDir}/src/logs`, { recursive: true });
        fs.writeFileSync(logFilePath, "", "utf8");
      }

      if (answers.connectMongoDB) {
        const initialContent = `export const DB_NAME = "NodeJSProject";\n`;
        fs.writeFileSync(constantFilePath, initialContent, "utf8");
      } else {
        fs.writeFileSync(constantFilePath, "", "utf8");
      }

      if (answers.useGithub) {
        fs.writeFileSync(`${projectDir}/public/temp/.gitkeep`, "");
      }
    } else {
      // console.log(
      //   chalk.red(`⚠️  Directory with name ${projectName} already exist.`)
      // );
      spinner.fail(`⚠️  Directory with name ${projectName} already exists.`);
      return;
    }

    if (answers.useEnvFile) {
      indexFileImportLines.push(`import dotenv from "dotenv";`);
      fs.writeFileSync(`${projectDir}/.env`, envFileContent.join("\n"));
    }

    if (answers.useEnvFile && answers.connectMongoDB) {
      envFileContent.push(`MONGODB_URI = mongodb://127.0.0.1:27017`);
      fs.writeFileSync(`${projectDir}/.env`, envFileContent.join("\n"));
    }

    if (answers.connectMongoDB) {
      indexFileImportLines.push(`import connectDB from "./db/index.js";`);

      const dbIndexFileContent = `import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      ${answers.useEnvFile ? "`${process.env.MONGODB_URI}/${DB_NAME}`" : "`mongodb://127.0.0.1:27017/${DB_NAME}`"},
    );
    console.log(\`\\nMongoDB connected !!\\nDB HOST: \${connectionInstance.connection.host}\`);
  } catch (error) {
    console.log("MONGODB connection FAILED:", error);
    process.exit(1);
  }
};

export default connectDB;
      `;
      fs.writeFileSync(`${projectDir}/src/db/index.js`, dbIndexFileContent);
    }

    const indexFileContent = `${indexFileImportLines.join("\n")}
${answers.useEnvFile ? '\ndotenv.config({ path: "./.env" });' : ""}
${
  answers.connectMongoDB && answers.useEnvFile
    ? `\nconnectDB()
  .then(() => {
    app.listen(process.env.PORT || 8080, () => {
      console.log(\`⚙️ Server is running at port : \${process.env.PORT}\`);
    });
  }).catch((err) => {
    console.log("MongoDB connection failed !!! ", err);
  });`
    : answers.connectMongoDB && !answers.useEnvFile
      ? `\nconst PORT = 8080;

connectDB()
  .then(() => {
    app.listen(8080, () => {
      console.log(\`⚙️ Server is running at port : \${PORT}\`);
    });
  }).catch((err) => {
    console.log("MongoDB connection failed !!! ", err);
  });
  `
      : answers.useEnvFile && !answers.connectMongoDB
        ? `\napp.listen(process.env.PORT || 8080, () => {
  console.log(\`⚙️ Server is running at port : \${process.env.PORT}\`);
});`
        : `\nconst PORT = 8080;

app.listen(PORT () => {
  console.log(\`⚙️ Server is running at port : \${PORT}\`);
});`
}
    `;

    fs.writeFileSync(
      `${projectDir}/src/index.${fileExtension}`,
      indexFileContent
    );

    const allowedOriginsFileContent = `const allowedOrigins = [
  "https://www.yoursite.com",
  "http://localhost:5173",
];
    
export { allowedOrigins };
`;
    const corsOptionsFileContent = `import { allowedOrigins } from "./allowedOrigins.js";

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  // credentials: true,
  optionsSuccessStatus: 200,
};

export { corsOptions };
`;

    const credentialsFileContent = `import { allowedOrigins } from "../config/allowedOrigins.js";

const credentials = (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Credentials", true);
  }
  next();
};

export { credentials };
`;

    if (answers.useCors) {
      appFileImportLines.push(
        `import cors from "cors";`,
        `import { corsOptions } from "./config/corsOptions.js";`,
        `import { credentials } from "./middlewares/credentials.js";`
      );
      middlewareLines.unshift(
        `app.use(credentials);`,
        `app.use(cors(corsOptions));`
      );
      fs.writeFileSync(
        `${projectDir}/src/config/allowedOrigins.${fileExtension}`,
        allowedOriginsFileContent
      );
      fs.writeFileSync(
        `${projectDir}/src/config/corsOptions.${fileExtension}`,
        corsOptionsFileContent
      );
      fs.writeFileSync(
        `${projectDir}/src/middlewares/credentials.${fileExtension}`,
        credentialsFileContent
      );
    }

    const loggerFileContent = `import { createLogger, format, transports } from "winston";
const { combine, timestamp, json, colorize } = format;

// Custom format for console logging with colors
const consoleLogFormat = format.combine(
  format.colorize(),
  format.printf(({ level, message, timestamp }) => {
    return \`\${timestamp}\ | \${level}\: \${message}\`;
  })
);

// Create a Winston logger
const logger = createLogger({
  level: "info",
  format: combine(colorize(), timestamp(), json()),
  transports: [
    new transports.Console({
      format: consoleLogFormat,
    }),
    new transports.File({ filename: "src/logs/app.log" }),
  ],
});

export default logger;
`;
    if (answers.useMorganWinston) {
      appFileImportLines.push(
        `import morgan from "morgan";`,
        `import logger from "./utils/logger.js";`
      );
      middlewareLines.unshift(
        `app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);`
      );
      fs.writeFileSync(
        `${projectDir}/src/utils/logger.${fileExtension}`,
        loggerFileContent
      );
    }

    const appFileContent = `${appFileImportLines.join("\n")}

const app = express();
${answers.useMorganWinston ? '\nconst morganFormat = ":method :url :status :response-time ms";' : ""}

${middlewareLines.join("\n")}

export { app };
    `;

    fs.writeFileSync(`${projectDir}/src/app.${fileExtension}`, appFileContent);

    const asyncHandlerFileContent = `const asyncHandler = (requestHandler) => async (req, res, next) => {
  try {
    await requestHandler(req, res, next);
  } catch (error) {
    // Ensure status code is set to 500 if it's not defined
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export { asyncHandler };
`;

    const apiResponseFileContent = `class ApiResponse {
  constructor(statusCode, data, message = "success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export { ApiResponse };
`;

    const apiErrorFileContent = `class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ){
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (this.stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
`;

    if (answers.useResErrAsyncHandler) {
      fs.writeFileSync(
        `${projectDir}/src/utils/asyncHandler.${fileExtension}`,
        asyncHandlerFileContent
      );
      fs.writeFileSync(
        `${projectDir}/src/utils/ApiResponse.${fileExtension}`,
        apiResponseFileContent
      );
      fs.writeFileSync(
        `${projectDir}/src/utils/ApiError.${fileExtension}`,
        apiErrorFileContent
      );
    }

    const prettierFileContent = `{
  "singleQuote": false,
  "bracketSpacing": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "semi": true
}
    `;

    const prettierIgnoreFileContent = `/.vscode
/node_modules
./dist

*.env
.env
.env.*
`;

    if (answers.usePrettier) {
      fs.writeFileSync(`${projectDir}/.prettierrc`, prettierFileContent);
      fs.writeFileSync(
        `${projectDir}/.prettierignore`,
        prettierIgnoreFileContent
      );
    }

    // Creating package.json
    // let redis = null;

    const dependenciesPromise = [await getLatestVersion("express")];

    if (answers.useCors)
      dependenciesPromise.push(await getLatestVersion("cors"));
    if (answers.useEnvFile)
      dependenciesPromise.push(await getLatestVersion("dotenv"));
    if (answers.connectMongoDB) {
      dependenciesPromise.push(await getLatestVersion("mongoose"));
      dependenciesPromise.push(
        await getLatestVersion("mongoose-aggregate-paginate-v2")
      );
    }
    if (answers.useMorganWinston) {
      dependenciesPromise.push(await getLatestVersion("winston"));
      dependenciesPromise.push(await getLatestVersion("morgan"));
    }

    const devDependenciesPromise = [await getLatestVersion("nodemon")];

    if (answers.usePrettier)
      devDependenciesPromise.push(await getLatestVersion("prettier"));

    const dependenciesRaw = await Promise.all(dependenciesPromise);
    const devDependenciesRaw = await Promise.all(devDependenciesPromise);

    const dependencies = dependenciesRaw.map(
      (dependency) => `"${dependency.name}": "^${dependency.version}"`
    );

    const devDependencies = devDependenciesRaw.map(
      (dependency) => `"${dependency.name}": "^${dependency.version}"`
    );

    const packageJsonContent = `{
    "name": "${projectName}",
    "version": "1.0.0",
    "description": "${projectName}",
    "type": "module",
    "main": "index.js",
    "scripts": {
      "dev": ${answers.useEnvFile ? `"nodemon -r dotenv/config --experimental-json-modules src/index.js"` : `"nodemon --experimental-json-modules src/index.js"`}
    },
    "keywords": [],
    "author": "",
    "license": "ISC",
    "devDependencies": {
      ${devDependencies.join(",\n")}
    },
    "dependencies": {
      ${dependencies.join(",\n")}
    }
}
    `;

    fs.writeFileSync(`${projectDir}/package.json`, packageJsonContent);

    const gitignoreFileContent = `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# Diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# Snowpack dependency directory (https://snowpack.dev/)
web_modules/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test
.env.production

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next
out

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
# Comment in the public line in if your project uses Gatsby and not Next.js
# https://nextjs.org/blog/next-9-1#public-directory-support
# public

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# yarn v2
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*

# End of https://mrkandreev.name/snippets/gitignore-generator/#Node
`;

    const gitattributesFileContent = `# Auto detect text files and perform LF normalization
* text=auto
`;

    if (answers.useGithub) {
      fs.writeFileSync(`${projectDir}/.gitignore`, gitignoreFileContent);
      fs.writeFileSync(
        `${projectDir}/.gitattributes`,
        gitattributesFileContent
      );
      initializeGit(projectDir);
    }

    console.log("\n");
    console.log("\n");
    // spinner.succeed("Project setup complete!");
    spinner.succeed(chalk.green(`Project ${projectName} has been created successfully! 🎉`))
    console.log("\n");
    console.log(chalk.gray(`Follow below steps to install.`));
    console.log(`1. ${chalk.cyan(`cd ${projectName}`)}`);
    console.log(`2. ${chalk.cyan(`npm install`)}`);
    console.log("\n");
    console.log(chalk.greenBright(chalk.italic("Start your server: ")));
    console.log(chalk.bold(`1- npm run dev 🚀`));
    console.log("\n");
    console.log(`Hot ${chalk.cyan(`Coding.`)} 🔥`);
    console.log("\n");

  } catch (error) {
    // console.error(chalk.red(error));
    spinner.fail(`Something went wrong: ${error.message}`);
  }
}

function initializeGit(projectDir) {
  try {
    execSync("git init", { cwd: projectDir, stdio: "inherit" });
    execSync("git add .", { cwd: projectDir, stdio: "inherit" });
    console.log(chalk.green("Git repository initialized successfully.\n"));
  } catch (error) {
    console.error(chalk.red("Failed to initialize Git repository:", error));
  }
}

createApp().catch((error) => {
  console.error(chalk.red(error));
});
