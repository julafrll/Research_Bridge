import type { AssignmentStatus } from '@/types';

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string | null | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  return formatDate(date);
}

export function daysUntil(date: string | null | undefined): number {
  if (!date) return Infinity;
  const d = new Date(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function isOverdue(date: string | null | undefined): boolean {
  if (!date) return false;
  return new Date(date).getTime() < Date.now();
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function initials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export const statusConfig: Record<
  AssignmentStatus,
  { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral' }
> = {
  not_started: { label: 'Not Started', variant: 'neutral' },
  in_progress: { label: 'In Progress', variant: 'info' },
  submitted: { label: 'Submitted', variant: 'default' },
  under_review: { label: 'Under Review', variant: 'warning' },
  revision_requested: { label: 'Revision Requested', variant: 'error' },
  graded: { label: 'Graded', variant: 'success' },
  overdue: { label: 'Overdue', variant: 'error' },
};

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
