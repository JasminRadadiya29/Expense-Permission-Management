import NextPageProviders from '../../src/components/NextPageProviders.jsx';
import NextExpensesPage from '../../src/views/NextExpensesPage.jsx';

export default function ExpensesPage() {
  return (
    <NextPageProviders>
      <NextExpensesPage />
    </NextPageProviders>
  );
}
