export function startWorker() {
  return {
    status: "idle",
    jobs: ["analytics", "recommendations"],
  };
}

console.log(startWorker());
