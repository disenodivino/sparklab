import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events | SparkLab',
  description: 'Browse upcoming SparkLab events',
};

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Events</h1>
        <p className="text-muted-foreground">
          Event listings coming soon...
        </p>
      </div>
    </div>
  );
}
