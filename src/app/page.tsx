import { TagivaLogo } from '@/components/layout/tagiva-logo';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <TagivaLogo size="lg" />
        <p className="text-muted-foreground text-sm">
          Fast, modern invoicing for Indonesian freelancers and boutique studios.
        </p>
      </div>
    </main>
  );
}
