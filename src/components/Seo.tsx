import { Helmet } from 'react-helmet-async';

interface SeoProps {
  title?: string;
  description?: string;
  path?: string;
}

const SITE_NAME = 'Journalist — The Trading Journal for Traders';
const BASE_URL = 'https://tradejournalist.vercel.app';
const DEFAULT_DESC = 'Professional-grade trading journal with cloud sync, Google OAuth, Journalist Score™ analytics, P&L charts, and cross-device visibility.';

export default function Seo({ title, description, path = '' }: SeoProps) {
  const fullTitle = title ? `${title} | Journalist` : SITE_NAME;
  const url = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || DEFAULT_DESC} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || DEFAULT_DESC} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Journalist" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || DEFAULT_DESC} />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Journalist",
          "operatingSystem": "All",
          "applicationCategory": "BusinessApplication",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "description": description || DEFAULT_DESC
        })}
      </script>
    </Helmet>
  );
}
