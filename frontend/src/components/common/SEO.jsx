import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  author = 'KSLU Circle Contributors',
  robots = 'index, follow',
  schemaData
}) => {
  const siteUrl = 'https://kslucircle.online';
  const defaultTitle = 'KSLU Circle - Law Study Resources, Notes & Question Papers';
  const defaultDesc = 'Peer-to-peer law student repository for lecture notes, exam guides, and university question papers for Karnataka law schools.';
  const defaultKeywords = 'KSLU notes, Karnataka State Law University, law lecture notes, KSLU question papers, law study materials, LLB study guides';
  const defaultOgImage = `${siteUrl}/og-image.png`;

  const metaTitle = title ? `${title} | KSLU Circle` : defaultTitle;
  const metaDesc = description || defaultDesc;
  const metaKeywords = keywords ? (Array.isArray(keywords) ? keywords.join(', ') : keywords) : defaultKeywords;
  const metaCanonical = canonicalUrl || siteUrl;
  const metaOgImage = ogImage || defaultOgImage;

  // Default Structured Data for Educational Website / Portal
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${siteUrl}/#organization`,
    "name": "KSLU Circle",
    "url": siteUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${siteUrl}/apple-touch-icon.png`,
      "width": "180",
      "height": "180"
    },
    "image": metaOgImage,
    "description": defaultDesc,
    "sameAs": [
      "https://github.com/nagarjuna-32/kslu-website"
    ],
    "knowsAbout": [
      "Karnataka State Law University",
      "Constitutional Law",
      "Family Law",
      "Jurisprudence",
      "Contract Law",
      "Legal Education",
      "LLB Notes"
    ],
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "INR",
      "description": "Free peer-to-peer law study resources and notes"
    }
  };

  // WebSite Search schema to allow Google Search Sitelinks Searchbox
  const searchSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    "name": "KSLU Circle",
    "url": siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/notes?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  const finalSchema = schemaData || [defaultSchema, searchSchema];

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDesc} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={metaCanonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={ogTitle || metaTitle} />
      <meta property="og:description" content={ogDescription || metaDesc} />
      <meta property="og:image" content={metaOgImage} />
      <meta property="og:url" content={metaCanonical} />
      <meta property="og:site_name" content="KSLU Circle" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={ogTitle || metaTitle} />
      <meta name="twitter:description" content={ogDescription || metaDesc} />
      <meta name="twitter:image" content={metaOgImage} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalSchema)}
      </script>
    </Helmet>
  );
};

export default SEO;
