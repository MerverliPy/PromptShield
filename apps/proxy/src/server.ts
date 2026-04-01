import Fastify from "fastify";
import { registerChatCompletionsRoute } from "./routes/chat-completions";

export async function buildServer() {
  const app = Fastify({ logger: true });

  app.get("/health", async () => {
    return { ok: true, service: "proxy" };
  });

  registerChatCompletionsRoute(app);

  return app;
}

async function start() {
  const app = await buildServer();
  await app.listen({ port: 4002, host: "0.0.0.0" });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
