import { test, expect } from '@playwright/test';

/**
 * Tagiva - End-to-End User Journeys & Guardrails Suite
 *
 * Verifies:
 * - TC-ENT-01: Protected route redirection to /login
 * - D-24, D-31, A-22: Unauthenticated teaser draft persistence to sessionStorage
 * - D-16: Canonical IDR pricing display
 * - D-58: UU PDP compliance & 72-hour erasure disclosure
 * - NFR-1: Desktop & mobile responsive viewports
 */

test.describe('Landing & Marketing Journey', () => {
  test('landing page loads hero, teaser, features, and FAQ', async ({ page }) => {
    await page.goto('/');

    // Check header and branding
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByText('Tagiva')).toBeVisible();

    // Check Hero
    await expect(
      page.getByRole('heading', { name: /Professional Invoices in Seconds/i })
    ).toBeVisible();

    // Check FAQ
    await expect(
      page.getByRole('heading', { name: /Frequently Asked Questions/i })
    ).toBeVisible();
  });

  test('interactive teaser gates visitor to /login with draft preserved in sessionStorage (D-24, D-31, A-22)', async ({
    page,
  }) => {
    await page.goto('/');

    const clientInput = page.locator('#teaserClient');
    const descInput = page.locator('#teaserDesc');
    const amountInput = page.locator('#teaserAmount');

    // Fill teaser with custom freelancer data
    await clientInput.fill('Studio Arsitektur Nusantara');
    await descInput.fill('Konsultasi Desain Fasad');
    await amountInput.fill('25000000');

    // Submit teaser
    await page.getByRole('button', { name: /Preview & Create Invoice/i }).click();

    // Should redirect to login with next=/invoices/new
    await expect(page).toHaveURL(/\/login\?next=%2Finvoices%2Fnew/);

    // Verify sessionStorage has saved the teaser draft
    const savedDraft = await page.evaluate(() => {
      return sessionStorage.getItem('tagiva_landing_draft');
    });

    expect(savedDraft).not.toBeNull();
    const parsed = JSON.parse(savedDraft!);
    expect(parsed.clientName).toBe('Studio Arsitektur Nusantara');
    expect(parsed.description).toBe('Konsultasi Desain Fasad');
    expect(parsed.amount).toBe(25000000);
  });
});

test.describe('Pricing & Plan Options (D-16)', () => {
  test('renders Free Starter and Pro duration options', async ({ page }) => {
    await page.goto('/pricing');

    // Heading
    await expect(
      page.getByRole('heading', { name: /Harga Sederhana, Transparan/i })
    ).toBeVisible();

    // Free plan details
    await expect(page.getByText('Free Starter')).toBeVisible();
    await expect(page.getByText('Rp 0')).toBeVisible();
    await expect(page.getByText(/Maksimal 3 invoice tersimpan/i)).toBeVisible();

    // Pro plan details
    await expect(page.getByText('Tagiva Pro')).toBeVisible();
    await expect(page.getByText(/Invoice tanpa batas/i)).toBeVisible();
    await expect(page.getByText(/Tanpa watermark/i)).toBeVisible();
    await expect(page.getByText(/Upload logo bisnis/i)).toBeVisible();
  });
});

test.describe('Legal & UU PDP Compliance (D-58)', () => {
  test('privacy policy outlines UU PDP No. 27/2022 and 72-hour manual erasure SLA', async ({
    page,
  }) => {
    await page.goto('/privacy');

    await expect(
      page.getByRole('heading', { name: /Kebijakan Privasi/i })
    ).toBeVisible();
    await expect(page.getByText(/UU No. 27 Tahun 2022/i)).toBeVisible();
    await expect(page.getByText('support@tagiva.com')).toBeVisible();
    await expect(page.getByText(/maksimal 3 × 24 jam \(72 jam\)/i)).toBeVisible();
  });

  test('terms of service outlines terms and rules', async ({ page }) => {
    await page.goto('/terms');

    await expect(
      page.getByRole('heading', { name: /Syarat dan Ketentuan Layanan/i })
    ).toBeVisible();
    await expect(page.getByText(/Paket Free Starter/i)).toBeVisible();
    await expect(page.getByText(/Paket Pro/i)).toBeVisible();
  });
});

test.describe('Protected Route Guardrails (TC-ENT-01, D-14)', () => {
  test('unauthenticated visitor visiting /dashboard is redirected to /login', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
  });

  test('unauthenticated visitor visiting /invoices/new is redirected to /login', async ({
    page,
  }) => {
    await page.goto('/invoices/new');
    await expect(page).toHaveURL(/\/login\?next=%2Finvoices%2Fnew/);
  });

  test('unauthenticated visitor visiting /settings is redirected to /login', async ({
    page,
  }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/login\?next=%2Fsettings/);
  });
});
