import './globals.css';

export const metadata = {
  title: 'Expense Management',
  description: 'Expense permission management full-stack app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
