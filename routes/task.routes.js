const router = require("express").Router();

const db = require("../db");

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

module.exports = router;
