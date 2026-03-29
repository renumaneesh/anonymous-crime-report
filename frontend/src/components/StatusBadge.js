import React from "react";
import { Clock, Eye, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const statusConfig = {
  "Pending": { cls: "badge-pending", icon: Clock, label: "Pending" },
  "Under Review": { cls: "badge-review", icon: Eye, label: "Under Review" },
  "Resolved": { cls: "badge-resolved", icon: CheckCircle, label: "Resolved" },
  "Rejected": { cls: "badge-rejected", icon: XCircle, label: "Rejected" },
};

const priorityConfig = {
  "Low": { cls: "badge-low", icon: null },
  "Medium": { cls: "badge-medium", icon: null },
  "High": { cls: "badge-high", icon: AlertTriangle },
  "Critical": { cls: "badge-critical", icon: AlertTriangle },
};

export function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig["Pending"];
  const Icon = cfg.icon;
  return (
    <span className={`badge ${cfg.cls}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const cfg = priorityConfig[priority] || priorityConfig["Medium"];
  const Icon = cfg.icon;
  return (
    <span className={`badge ${cfg.cls}`}>
      {Icon && <Icon size={11} />}
      {priority}
    </span>
  );
}
