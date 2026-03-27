import NextPageProviders from '../../src/components/NextPageProviders.jsx';
import NextSignupPage from '../../src/views/NextSignupPage.jsx';

export default function SignupPage() {
  return (
    <NextPageProviders>
      <NextSignupPage />
    </NextPageProviders>
  );
}
