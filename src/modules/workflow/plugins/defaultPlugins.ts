import { AiReviewNodePlugin } from "./ai-review";
import { ApiNodePlugin } from "./api";
import { ApprovalNodePlugin } from "./approval";
import { ConditionNodePlugin } from "./condition";
import { DatabaseNodePlugin } from "./database";
import { DelayNodePlugin } from "./delay";
import { DocumentNodePlugin } from "./document";
import { EndNodePlugin } from "./end";
import { FormNodePlugin } from "./form";
import { NotificationNodePlugin } from "./notification";
import { StartNodePlugin } from "./start";
import { TaskNodePlugin } from "./task";

export const defaultWorkflowPlugins = [
  StartNodePlugin,
  EndNodePlugin,
  TaskNodePlugin,
  ApprovalNodePlugin,
  ConditionNodePlugin,
  FormNodePlugin,
  ApiNodePlugin,
  DatabaseNodePlugin,
  NotificationNodePlugin,
  DocumentNodePlugin,
  DelayNodePlugin,
  AiReviewNodePlugin,
];

export {
  AiReviewNodePlugin,
  ApiNodePlugin,
  ApprovalNodePlugin,
  ConditionNodePlugin,
  DatabaseNodePlugin,
  DelayNodePlugin,
  DocumentNodePlugin,
  EndNodePlugin,
  FormNodePlugin,
  NotificationNodePlugin,
  StartNodePlugin,
  TaskNodePlugin,
};

