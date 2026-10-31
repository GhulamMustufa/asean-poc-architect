export type AppViewName = 'dashboard' | 'new-challenge' | 'match-results' | 'proposal';
export type MobileTab = 'dashboard' | 'directory' | 'new';

/**
 * Which bottom tab is highlighted for the current view. The directory is an
 * overlay, so it is only active while open.
 */
export function getActiveTab(view: AppViewName, directoryOpen = false): MobileTab {
  if (directoryOpen) return 'directory';
  if (view === 'new-challenge') return 'new';
  return 'dashboard';
}
