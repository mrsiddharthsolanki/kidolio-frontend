import React from 'react';
import { Helmet } from 'react-helmet-async';

interface TeamMember {
  name: string;
  role?: string;
}

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  teamMembers?: TeamMember[]; // New prop for team members
}

const SEO: React.FC<SEOProps> = ({
  title = 'Empowering Families.Kidolio Universe',
  description = 'Track. Grow. Thrive. Manage records, monitor progress, and unlock every child’s full potential — all in one intelligent universe.',
  keywords = 'family education, online learning, children education, parent dashboard, educational technology, AI learning, secure education platform , document management, child development, family records, educational resources, personalized learning, early childhood education, parenting tools, family engagement, child growth tracking, secure family records, Kidolio, Kidolio Universe, Kidolio platform, Kidolio app, Kidolio education, Kidolio family, Kidolio learning',
  image = '/images/og-image.jpg',
  url = 'https://kidolio.com',
  type = 'website',
  teamMembers = []
}) => {
  const siteTitle = 'Kidolio';
  const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;

  // Add team member names and roles to keywords and description if provided
  const teamNames = teamMembers.map(m => m.name).join(', ');
  const teamRoles = teamMembers.map(m => m.role).filter(Boolean).join(', ');
  const extendedKeywords = teamMembers.length > 0 ? `${keywords}, ${teamNames}, ${teamRoles}` : keywords;
  const extendedDescription = teamMembers.length > 0 ? `${description} Meet our team: ${teamNames}${teamRoles ? ' (' + teamRoles + ')' : ''}.` : description;

  // Structured data for team members (JSON-LD)
  const teamStructuredData = teamMembers.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': siteTitle,
    'url': url,
    'employee': teamMembers.map(member => ({
      '@type': 'Person',
      'name': member.name,
      'jobTitle': member.role || ''
    }))
  } : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={extendedDescription} />
      <meta name="keywords" content={extendedKeywords} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={extendedDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={extendedDescription} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data for Team Members */}
      {teamStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(teamStructuredData)}
        </script>
      )}

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#4F46E5" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Kidolio" />
      <meta name="google-site-verification" content="e2usAklZm502nMbsmJKs0lA6Ynr6EPWg-4P70AO9jpM" />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Favicon Links */}
      <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#4F46E5" />
      <meta name="msapplication-TileColor" content="#4F46E5" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
    </Helmet>
  );
};

export default SEO;