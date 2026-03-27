import NextPageProviders from '../../src/components/NextPageProviders.jsx';
import NextUsersPage from '../../src/views/NextUsersPage.jsx';

export default function UsersPage() {
  return (
    <NextPageProviders>
      <NextUsersPage />
    </NextPageProviders>
  );
}
