import type { WorkflowAgentAdapter } from "../types/agent";
import type { WorkflowDefinition } from "../types/workflow";
import { workflowDefinitionSchema } from "../core/WorkflowSerializer";
import { WorkflowAgent } from "../agents/WorkflowAgent";

export interface LlmWorkflowAgentAdapterOptions {
  endpoint: string;
  apiKey?: string;
  model?: string;
  headers?: Record<string, string> | (() => Record<string, string> | Promise<Record<string, string>>);
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export class LlmWorkflowAgentAdapter implements WorkflowAgentAdapter {
  private fallback = new WorkflowAgent();
  private options: LlmWorkflowAgentAdapterOptions;

  constructor(options: LlmWorkflowAgentAdapterOptions) {
    this.options = options;
  }

  async promptToWorkflow(prompt: string): Promise<WorkflowDefinition> {
    const content = await this.complete([
      "Bạn là Workflow Architect. Hãy trả về duy nhất JSON WorkflowDefinition hợp lệ, không markdown.",
      "Schema bắt buộc: id, name, version, status, nodes, edges. Edge phải có direction và edgeType.",
      `Mô tả: ${prompt}`,
    ]);
    try {
      const json = extractJson(content);
      const parsed = workflowDefinitionSchema.safeParse(JSON.parse(json));
      if (!parsed.success) {
        return this.fallback.promptToWorkflow(prompt);
      }
      return parsed.data;
    } catch {
      return this.fallback.promptToWorkflow(prompt);
    }
  }

  async explainWorkflow(workflow: WorkflowDefinition): Promise<string> {
    const content = await this.complete([
      "Giải thích workflow sau bằng tiếng Việt, ngắn gọn, theo thứ tự luồng xử lý.",
      JSON.stringify(workflow),
    ]);
    return content || this.fallback.explainWorkflow(workflow);
  }

  async suggestFixes(workflow: WorkflowDefinition): Promise<string[]> {
    const content = await this.complete([
      "Đề xuất cải thiện workflow sau bằng tiếng Việt. Trả về mỗi ý trên một dòng, không markdown phức tạp.",
      JSON.stringify(workflow),
    ]);
    const suggestions = content
      .split("\n")
      .map((line) => line.replace(/^[-*\d.\s]+/, "").trim())
      .filter(Boolean);
    return suggestions.length > 0 ? suggestions : this.fallback.suggestFixes(workflow);
  }

  private async complete(messages: string[]): Promise<string> {
    try {
      const headers = await resolveHeaders(this.options.headers);
      const response = await fetch(this.options.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.options.apiKey ? { Authorization: `Bearer ${this.options.apiKey}` } : {}),
          ...headers,
        },
        body: JSON.stringify({
          model: this.options.model ?? "gpt-4.1-mini",
          messages: [
            { role: "system", content: "You are a precise workflow JSON and Vietnamese explanation assistant." },
            { role: "user", content: messages.join("\n\n") },
          ],
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        throw new Error(`LLM request failed: ${response.status}`);
      }

      const data = (await response.json()) as ChatCompletionResponse;
      return data.choices?.[0]?.message?.content?.trim() ?? "";
    } catch {
      return "";
    }
  }
}

async function resolveHeaders(headers: LlmWorkflowAgentAdapterOptions["headers"]): Promise<Record<string, string>> {
  if (!headers) {
    return {};
  }
  return typeof headers === "function" ? headers() : headers;
}

function extractJson(content: string): string {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    return fenced[1].trim();
  }
  const firstBrace = content.indexOf("{");
  const lastBrace = content.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return content.slice(firstBrace, lastBrace + 1);
  }
  throw new Error("LLM response did not include JSON.");
}
