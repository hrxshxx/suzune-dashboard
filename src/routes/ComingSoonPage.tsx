import { useParams } from 'react-router-dom';
import { Construction } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';

/** Placeholder for the nav items the brief says to show but not build. */
export function ComingSoonPage() {
  const { '*': rest } = useParams();
  const name = (rest ?? 'This section').split('/').pop() ?? 'This section';
  return (
    <EmptyState
      icon={<Construction className="size-7" />}
      title={`${name[0]?.toUpperCase()}${name.slice(1)} is coming soon`}
      description="This module is configured from Discord for now. The shell, routing and layout are already in place, so it can be dropped in without refactoring."
    />
  );
}
