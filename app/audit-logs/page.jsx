import NextPageProviders from '../../src/components/NextPageProviders.jsx';
import NextAuditLogsPage from '../../src/views/NextAuditLogsPage.jsx';

export default function AuditLogsPage() {
  return (
    <NextPageProviders>
      <NextAuditLogsPage />
    </NextPageProviders>
  );
}