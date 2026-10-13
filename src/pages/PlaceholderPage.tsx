import { BookOpen } from 'lucide-react';
import { EmptyState, Card, CardBody } from '@/components/ui';

export function PlaceholderPage({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">{title}</h1>
        <p className="mt-1 text-sm text-muted-500">{description}</p>
      </div>
      <Card>
        <CardBody>
          <EmptyState
            icon={icon ?? <BookOpen className="h-6 w-6" />}
            title="Coming in the next milestone"
            description="This feature is part of the next development phase. The foundation is ready — check back soon for the full implementation."
          />
        </CardBody>
      </Card>
    </div>
  );
}
