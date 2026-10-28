import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MaintenancePage } from '../page';
import { maintenanceMetadata } from '../metadata';

describe('Maintenance Feature', () => {
  it('has valid metadata', () => {
    expect(maintenanceMetadata.title).toContain('Maintenance');
    expect(maintenanceMetadata.description).toBeDefined();
  });

  it('renders maintenance badge, duration estimate, and support link', () => {
    const html = renderToString(<MaintenancePage />);

    expect(html).toContain('System Maintenance Underway');
    expect(html).toContain('Under Maintenance');
    expect(html).toContain('Check Status Again');
    expect(html).toContain('support@tagiva.com');
  });
});
