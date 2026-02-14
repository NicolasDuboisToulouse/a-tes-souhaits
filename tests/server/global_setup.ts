import { AppConfig, setupServer } from "@scripts/setup-app";

export async function setup() {
  await setupServer(new AppConfig({ env: "test", port: 3080 }));
}
