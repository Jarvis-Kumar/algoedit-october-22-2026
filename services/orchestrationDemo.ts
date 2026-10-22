
import { inferenceManager } from './inferenceManager';
import { UserTier } from './orchestrationConfig';
import { healthMonitor } from './providerHealthMonitor';

async function runDemo() {
  console.log("--- Starting AI Orchestration Engine Demo ---");

  const requests = [
    { task: "text", tier: UserTier.FREE, priority: "cost" },
    { task: "analysis", tier: UserTier.PRO, priority: "quality" },
    { task: "image", tier: UserTier.ENTERPRISE, priority: "balanced" },
    { task: "text", tier: UserTier.FREE, costSensitivity: "high" },
  ];

  for (const req of requests) {
    console.log(`\n[Demo] Requesting ${req.task} for ${req.tier} tier (Priority: ${req.priority || 'N/A'})...`);
    try {
      const result = await inferenceManager.runInference(req.task as any, { prompt: "Hello AI" }, {
        userTier: req.tier,
        priority: req.priority as any,
        costSensitivity: req.costSensitivity as any
      });
      console.log(`[Demo] SUCCESS: Provider=${result.providerId}, Latency=${result.latency}ms, Attempts=${result.attempts}`);
    } catch (err: any) {
      console.error(`[Demo] FAILED: ${err.message}`);
    }
  }

  console.log("\n--- Final Health Status ---");
  const providers = ["polo-ai", "deepseek-v3", "deepseek-v4"];
  providers.forEach(id => {
    const health = healthMonitor.getHealth(id);
    console.log(`${id}: Score=${health.healthScore.toFixed(2)}, Status=${health.status}, SuccessRate=${(health.successRate * 100).toFixed(1)}%`);
  });
}

// Run the demo
runDemo().catch(console.error);
