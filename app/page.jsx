import NextPageProviders from '../src/components/NextPageProviders.jsx';
import NextHomePage from '../src/views/NextHomePage.jsx';

export default function HomePage() {
  return (
    <NextPageProviders>
      <NextHomePage />
    </NextPageProviders>
  );
}
