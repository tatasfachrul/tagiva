import { redirect } from 'next/navigation';
import { getSettingsData } from './queries/settings-queries';
import { LogoUploader } from './components/logo-uploader';
import { BusinessProfileForm } from './components/business-profile-form';

export async function SettingsPage() {
  const data = await getSettingsData();
  if (!data) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Business & Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure how your business is identified on generated invoices and client-facing pages.
        </p>
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* Pro Logo Uploader */}
        <LogoUploader
          initialLogoUrl={data.profile?.logo_url ?? null}
          planState={data.planState}
        />

        {/* Business Profile Details Form */}
        <BusinessProfileForm initialProfile={data.profile} />
      </div>
    </div>
  );
}
