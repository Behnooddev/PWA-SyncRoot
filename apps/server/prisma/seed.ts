import { prisma } from "@/lib/prisma.js";
import { logger } from "@/lib/logger.js";

/**
 * Seed data for local development. Creates two users, one project with a
 * realistic mix of tasks (across every status), project- and task-level
 * todos, a couple of comments, and matching activity entries — enough to
 * exercise every relation in the schema without needing to click through
 * the UI first.
 */
async function main(): Promise<void> {
  const alice = await prisma.user.upsert({
    where: { name: "Alice" },
    update: {},
    create: { name: "Alice" },
  });

  const bob = await prisma.user.upsert({
    where: { name: "Bob" },
    update: {},
    create: { name: "Bob" },
  });

  const project = await prisma.project.create({
    data: {
      name: "SyncRoot Launch",
      description: "Ship the V1 of SyncRoot itself — eating our own dog food.",
      color: "#6E5AF0",
      createdById: alice.id,
    },
  });

  await prisma.activity.create({
    data: {
      type: "PROJECT_CREATED",
      projectId: project.id,
      actorId: alice.id,
      metadata: { name: project.name },
    },
  });

  const designTask = await prisma.task.create({
    data: {
      title: "Finalize design tokens",
      description: "Lock the color palette and type scale before Phase 4 UI work starts.",
      status: "DONE",
      priority: "HIGH",
      projectId: project.id,
      createdById: alice.id,
    },
  });

  const backendTask = await prisma.task.create({
    data: {
      title: "Build the module scaffolding",
      description: "Controller/service/repository pattern for every domain module.",
      status: "IN_PROGRESS",
      priority: "URGENT",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      projectId: project.id,
      createdById: bob.id,
    },
  });

  await prisma.task.create({
    data: {
      title: "Write onboarding docs",
      status: "TODO",
      priority: "LOW",
      projectId: project.id,
      createdById: alice.id,
    },
  });

  for (const [type, actorId, taskId] of [
    ["TASK_CREATED", alice.id, designTask.id],
    ["TASK_UPDATED", alice.id, designTask.id],
    ["TASK_CREATED", bob.id, backendTask.id],
  ] as const) {
    await prisma.activity.create({ data: { type, projectId: project.id, actorId, taskId } });
  }

  // Project-level todo (no taskId).
  await prisma.todo.create({
    data: {
      title: "Pick a name for the mascot",
      position: 0,
      projectId: project.id,
      createdById: bob.id,
    },
  });

  // Task-scoped checklist items on the backend task.
  const todo1 = await prisma.todo.create({
    data: {
      title: "Set up Express app skeleton",
      isDone: true,
      position: 0,
      projectId: project.id,
      taskId: backendTask.id,
      createdById: bob.id,
    },
  });
  await prisma.todo.create({
    data: {
      title: "Add centralized error handling",
      isDone: true,
      position: 1,
      projectId: project.id,
      taskId: backendTask.id,
      createdById: bob.id,
    },
  });
  await prisma.todo.create({
    data: {
      title: "Wire up the first module router",
      isDone: false,
      position: 2,
      projectId: project.id,
      taskId: backendTask.id,
      createdById: bob.id,
    },
  });

  await prisma.activity.create({
    data: { type: "TODO_COMPLETED", projectId: project.id, actorId: bob.id, todoId: todo1.id },
  });

  const comment = await prisma.comment.create({
    data: {
      content: "Nice work on the error handling middleware — clean split from the controllers.",
      authorId: alice.id,
      taskId: backendTask.id,
    },
  });

  await prisma.activity.create({
    data: {
      type: "COMMENT_CREATED",
      projectId: project.id,
      actorId: alice.id,
      commentId: comment.id,
      taskId: backendTask.id,
    },
  });

  logger.info({ users: 2, projects: 1, tasks: 3, todos: 4, comments: 1 }, "Seed complete");
}

main()
  .catch((err: unknown) => {
    logger.error(err, "Seed failed");
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
