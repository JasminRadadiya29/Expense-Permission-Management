import NextPageProviders from '../../src/components/NextPageProviders.jsx';
import NextLoginPage from '../../src/views/NextLoginPage.jsx';

export default function LoginPage() {
  return (
    <NextPageProviders>
      <NextLoginPage />
    </NextPageProviders>
  );
}
