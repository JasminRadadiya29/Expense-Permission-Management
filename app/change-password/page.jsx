import NextPageProviders from '../../src/components/NextPageProviders.jsx';
import NextChangePasswordPage from '../../src/views/NextChangePasswordPage.jsx';

export default function ChangePasswordPage() {
  return (
    <NextPageProviders>
      <NextChangePasswordPage />
    </NextPageProviders>
  );
}
