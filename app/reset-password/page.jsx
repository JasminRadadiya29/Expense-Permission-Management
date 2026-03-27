import NextPageProviders from '../../src/components/NextPageProviders.jsx';
import NextResetPasswordPage from '../../src/views/NextResetPasswordPage.jsx';

export default function ResetPasswordPage({ searchParams }) {
  const token = typeof searchParams?.token === 'string' ? searchParams.token : '';

  return (
    <NextPageProviders>
      <NextResetPasswordPage token={token} />
    </NextPageProviders>
  );
}
