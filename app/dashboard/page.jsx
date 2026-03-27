import NextPageProviders from '../../src/components/NextPageProviders.jsx';
import NextDashboardPage from '../../src/views/NextDashboardPage.jsx';

export default function DashboardPage() {
  return (
    <NextPageProviders>
      <NextDashboardPage />
    </NextPageProviders>
  );
}
