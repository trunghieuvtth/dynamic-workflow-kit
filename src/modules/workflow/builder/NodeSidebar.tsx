import type { WorkflowNodePlugin } from "../types/plugin";

interface NodeSidebarProps {
  plugins: WorkflowNodePlugin[];
}

const categoryLabels: Record<string, string> = {
  basic: "Basic",
  process: "Process",
  logic: "Logic",
  data: "Data",
  integration: "Integration",
  ai: "AI",
  document: "Document",
  system: "System",
};

export function NodeSidebar({ plugins }: NodeSidebarProps) {
  const categories = Array.from(new Set(plugins.map((plugin) => plugin.category)));

  return (
    <aside className="dwk-sidebar">
      {categories.map((category) => (
        <section key={category} className="dwk-sidebar-section">
          <h3>{categoryLabels[category] ?? category}</h3>
          <div className="dwk-node-list">
            {plugins
              .filter((plugin) => plugin.category === category)
              .map((plugin) => {
                const Icon = plugin.icon;
                return (
                  <button
                    key={plugin.type}
                    className="dwk-plugin-button"
                    draggable
                    type="button"
                    onDragStart={(event) => {
                      event.dataTransfer.setData("application/dwk-node-type", plugin.type);
                      event.dataTransfer.effectAllowed = "move";
                    }}
                    title={plugin.description}
                  >
                    {Icon ? <Icon className="dwk-plugin-icon" /> : null}
                    <span>{plugin.label}</span>
                  </button>
                );
              })}
          </div>
        </section>
      ))}
    </aside>
  );
}

