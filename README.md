
# Node.js Project Generator | npx init-node

Welcome to the Node.js Project Generator! This tool helps you quickly scaffold a new Node.js application with various optional features like CORS, environment variables, logging, MongoDB integration, and more. 🚀


## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [Generated Project Structure](#generated-project-structure)
- [Dependencies](#dependencies)
- [Scripts](#scripts)
- [License](#license)
## Features

- **Project Setup**: Quickly sets up a new Node.js project directory with necessary subdirectories.
- **CORS**: Option to enable CORS with configurable origins.
- **Environment Variables**: Option to use a `.env` file for environment-specific configurations.
- **Logging**: Option to integrate `morgan` and `winston` for logging.
- **Response, Error, and Async Handlers**: Option to include basic response, error, and async handlers.
- **GitHub Integration**: Option to initialize a Git repository with a pre-configured `.gitignore` and `.gitattributes`.
- **Prettier**: Option to enable Prettier for code formatting.
- **MongoDB**: Option to connect a MongoDB database with Mongoose.


## Installation

First, ensure you have Node.js and npm installed on your machine. Then, you can install the project generator globally using npm:

Install my-project with npx

```bash
  npx init-node
```
    
## Options

1. **Project Name**: The name of your project (default: **`my-node-app`**).
2. **Enable CORS**: Do you want to enable CORS? (default: **`yes`**).
3. **Use Environment File**: Do you want to use an environment file? (default: **`yes`**).
4. **Use Morgan and Winston for Logging**: Do you want to use morgan and winston for logging? (default: **`yes`**).
5. **Use Basic Response, Error, and Async Handlers**: Do you want to use a basic response handler, error handler, and async handler? (default: **`yes`**).
6. **Initialize GitHub**: Do you want to initialize a GitHub repository? (default: **`yes`**).
7. **Enable Prettier**: Do you want to enable Prettier? (default: **`yes`**).
8. **Connect MongoDB**: Do you want to connect a MongoDB database? (default: **`yes`**).
## Generated Project Structure

The generated project will have the following structure:

```lua
my-node-app/
│
├── public/
│   └── temp/
│       └── .gitkeep
│
├── src/
│   ├── config/
│   │   ├── allowedOrigins.js
│   │   └── corsOptions.js
│   ├── controllers/
│   ├── db/
│   │   └── index.js
│   ├── logs/
│   │   └── app.log
│   ├── middlewares/
│   │   └── credentials.js
│   ├── models/
│   ├── routes/
│   ├── tests/
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   ├── ApiResponse.js
│   │   ├── ApiError.js
│   │   └── logger.js
│   ├── app.js
│   └── index.js
│
├── .env
├── .gitattributes
├── .gitignore
├── .prettierrc
├── .prettierignore
├── package.json
└── README.md

```


## Dependencies

Depending on your choices, the generated project may include the following dependencies:

- **`express`** : Fast, unopinionated, minimalist web framework for Node.js.
- **`cors`** : Middleware for enabling CORS.
- **`dotenv`** : Module to load environment variables from a .env file.
- **`mongoose`** : MongoDB object modeling tool.
- **`winston`** : Logger for Node.js.
- **`morgan`** : HTTP request logger middleware for Node.js.
## Scripts

The generated **`package.json`** will include the following scripts:

- **`dev`**: Start the development server using **`nodemon`**.

```json
{
  "scripts": {
    "dev": "nodemon -r dotenv/config --experimental-json-modules src/index.js"
  }
}
```


## License

This project is licensed under the [MIT](https://choosealicense.com/licenses/mit/) License.

