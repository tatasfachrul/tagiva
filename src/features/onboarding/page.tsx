import { TagivaLogo } from '@/components/layout/tagiva-logo';
import { getOnboardingProfile } from './queries/onboarding-queries';
import { OnboardingForm } from './components/onboarding-form';

export async function OnboardingPage() {
  const profile = await getOnboardingProfile();

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl mb-8 text-center">
        <div className="flex justify-center mb-4">
          <TagivaLogo size="md" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Set up your business profile
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto">
          We&apos;ll use these details to automatically format and brand your invoices. You can always change them in Settings later.
        </p>
      </div>

      <OnboardingForm initialProfile={profile} />
    </div>
  );
}
