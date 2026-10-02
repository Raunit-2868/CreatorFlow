import * as React from 'react';
import { Badge } from './Badge';

export type EntityStatus =
  | 'active'
  | 'pending'
  | 'completed'
  | 'shortlisted'
  | 'accepted'
  | 'declined'
  | 'draft'
  | 'in_review';

export interface StatusBadgeProps {
  status: EntityStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const normalized = status.toLowerCase();

  switch (normalized) {
    case 'active':
    case 'completed':
    case 'accepted':
      return (
        <Badge variant="success" className={className}>
          {status}
        </Badge>
      );
    case 'pending':
    case 'in_review':
    case 'draft':
      return (
        <Badge variant="warning" className={className}>
          {status}
        </Badge>
      );
    case 'declined':
    case 'rejected':
    case 'suspended':
      return (
        <Badge variant="destructive" className={className}>
          {status}
        </Badge>
      );
    case 'shortlisted':
    case 'ai match':
      return (
        <Badge variant="accent" className={className}>
          {status}
        </Badge>
      );
    default:
      return (
        <Badge variant="default" className={className}>
          {status}
        </Badge>
      );
  }
};
