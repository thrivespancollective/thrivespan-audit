import "./globals.css";

export const metadata = {
  title: "The Queenager Code | ThriveSpan Collective",
  description:
    "Decode your anchor. Decode your edge. Decode your playbook. The 4-Pillar diagnostic for Queenagers (women 45+) commanding their healthspan + lifespan.",
  openGraph: {
    title: "The Queenager Code",
    description:
      "Decode your anchor. Decode your edge. Decode your playbook.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ink text-cream font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
