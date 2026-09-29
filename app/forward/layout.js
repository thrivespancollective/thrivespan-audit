const TITLE = "FSSH2K Forward";
const DESCRIPTION = "Your numbers, every twelve weeks. Faster. Stronger. Sexier. Harder to Kill.";

export const metadata = {
  title: `${TITLE} | TeamQueen`,
  description: DESCRIPTION,
  robots: { index: false, follow: false },
  // Own link preview — otherwise it inherits the It's Not Discipline card from the root layout.
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://start.teamqueen.co/forward",
    siteName: "TeamQueen",
    type: "website",
  },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
};

export default function ForwardLayout({ children }) {
  return children;
}
