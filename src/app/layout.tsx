import "./globals.css";

export const metadata = {
  title: "Planilha Financeira",
  description: "Sistema financeiro para empresas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
