/** Tournament director — full event configuration and results. */
export function canManageMudacEvent(): boolean {
  return true;
}

export function canManageMudacCriteria(): boolean {
  return true;
}

export function canManageMudacTeams(): boolean {
  return true;
}

export function canManageMudacPanels(): boolean {
  return true;
}

export function canViewMudacScorecards(): boolean {
  return true;
}

export function canExportMudacResults(): boolean {
  return true;
}

export function directorCapabilitySummary(): string {
  return "Configure criteria, teams, panels, and review aggregated scores. Does not score presentations.";
}

export function directorDashboardTitle(): string {
  return "Tournament director";
}
