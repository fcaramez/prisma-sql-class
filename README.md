- Remove mongoose from package.json
- npm i
- Install prisma and prisma client with `shell npm i @prisma/client && npm i -D prisma`
- Init prisma with `npx prisma init`
- remove /models and /db folders
- create models:

  ```sql
  model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  Task      Task[]
  }
  model Task {
  id String @id @default(uuid())
  title String
  content String
  status String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  userId String
  user User @relation(fields: [userId], references: [id])
  }

  ```

- Generate the prisma client with `npx prisma generate`
- Create db/index.js folder
- index.js file:

```js
const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

module.exports = db;
```

- create a database:

  - `shell docker run --name {databaseName} -d -p 2024:5432 -e POSTGRES_PASSWORD={databasePassword} {databaseType -> postgres}`
  - will look something like this: `shell docker run --name sql-class -d -p 2024:5432 -e POSTGRES_PASSWORD=postgres postgres`

- install jsonwebtoken and bcryptjs

- create auth routes

  - signup:

```js
router.post("/signup", async (req, res, next) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all fields", success: false });
    }

    const userToFind = await db.user.findFirst({
      where: {
        email,
      },
    });

    if (userToFind) {
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }

    const hashedPassword = await brcypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    delete newUser.password;

    res.json({ data: { ...newUser }, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
});
```

- add auth routes in app.js
- test in postman
- check creation in prisma studio with `shell npx prisma studio`
- Login:

```js
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide all necessary fields",
        success: false,
      });
    }

    const userToFind = await db.user.findFirst({
      where: {
        email,
      },
    });

    if (!userToFind) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }

    const isPasswordValid = await brcypt.compare(password, userToFind.password);

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Invalid password", success: false });
    }

    delete userToFind.password;

    const payload = {
      id: userToFind.id,
      email: userToFind.email,
    };

    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET);

    res.status(200).json({ data: { ...userToFind, authToken }, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
});
```

- create `task.routes.js`
- Create task:

  ```js
  router.post("/task", async (req, res) => {
    try {
      const { title, content, status, userId } = req.body;

      if (!title || !content || !status || !userId) {
        return res
          .status(400)
          .json({ message: "Please provide all fields", success: false });
      }

      const newTask = await db.task.create({
        data: {
          title,
          content,
          status,
          userId,
        },
      });

      res.json({ data: { ...newTask }, success: true });
    } catch (error) {
      res.status(500).json({ message: error.message, success: false });
    }
  });
  ```

- Get user tasks:

  ```js
  router.get("/tasks/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      const tasks = await db.task.findMany({
        where: {
          userId,
        },
      });

      res.json({ data: tasks, success: true });
    } catch (error) {
      res.status(500).json({ message: error.message, success: false });
    }
  });
  ```

- update task:

  ```js
  router.patch("/task/:taskId", async (req, res, next) => {
    try {
      const { taskId } = req.params;

      const { status } = req.body;

      if (!status) {
        return res
          .status(400)
          .json({ message: "Please provide all fields", success: false });
      }

      const updatedTask = await db.task.update({
        where: {
          id: taskId,
        },
        data: { status },
      });

      res.json({ data: { task: { ...updatedTask }, success: true } });
    } catch (error) {
      res.status(500).json({ message: error.message, success: false });
    }
  });
  ```
