import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://start.teamqueen.co"),
  title: "It's Not Discipline | TeamQueen",
  description:
    "You've saved fifty protocols to your Instagram. So why hasn't one of them made it into your week? Find the one thing in your way — in about two minutes.",
  openGraph: {
    title: "It's Not Discipline",
    description:
      "You've saved fifty protocols to your Instagram. So why hasn't one of them made it into your week?",
    url: "https://start.teamqueen.co",
    siteName: "TeamQueen",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "It's Not Discipline",
    description:
      "You've saved fifty protocols to your Instagram. So why hasn't one of them made it into your week?",
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
