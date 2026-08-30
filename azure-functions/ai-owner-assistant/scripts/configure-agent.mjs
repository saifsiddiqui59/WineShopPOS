import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";
import { AGENT_INSTRUCTIONS, TOOL_DEFINITIONS } from "../src/agentConfig.js";

const endpoint = process.env.FOUNDRY_PROJECT_ENDPOINT;
const agentName = process.env.FOUNDRY_AGENT_NAME || "WineShopPOS-Owner-Agent";
const modelDeployment = process.env.FOUNDRY_MODEL_DEPLOYMENT;

if (!endpoint || !modelDeployment) {
  throw new Error("FOUNDRY_PROJECT_ENDPOINT and FOUNDRY_MODEL_DEPLOYMENT are required.");
}

const project = new AIProjectClient(endpoint, new DefaultAzureCredential());

const agent = await project.agents.createVersion(agentName, {
  kind: "prompt",
  model: modelDeployment,
  instructions: AGENT_INSTRUCTIONS,
  tools: TOOL_DEFINITIONS,
});

console.log(JSON.stringify({
  agent_name: agent.name,
  agent_version: agent.version,
  model_deployment: modelDeployment,
}, null, 2));
