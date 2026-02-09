import { AppConfig, setupServer } from "@scripts/setup-app";

export async function setup() {
  await setupServer(new AppConfig({ env: "development", port: 3080 }));
}
