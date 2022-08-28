import React, { FunctionComponent, PropsWithChildren } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Navbar } from '@components/Navbar';
import { Footer } from '@components/Footer';

export const ContainerBlock: FunctionComponent<
  PropsWithChildren<Partial<{ title: string; type: string; description: string; image: string; date: string }>>
> = ({ children, ...customMeta }) => {
  const router = useRouter();

  const meta = {
    title: 'Sterling Camden - Developer, Writer, Creator',
    description: `I've engineered web apps for over 10 years. Let's chat about it.`,
    image: '/avatar.png',
    type: 'website',
    ...customMeta,
  };
  return (
    <div>
      <Head>
        <title>{meta.title}</title>
        <meta name="robots" content="follow, index" />
        <meta content={meta.description} name="description" />
        <meta property="og:url" content={`https://sterlingcamden.com${router.asPath}`} />
        <link rel="canonical" href={`https://sterlingcamden.com${router.asPath}`} />
        <meta property="og:type" content={meta.type} />
        <meta property="og:site_name" content="Sterling Camden V" />
        <meta property="og:description" content={meta.description} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:image" content={meta.image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@scamden" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={meta.image} />
        {meta.date && <meta property="article:published_time" content={meta.date} />}
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
      </Head>
      <main className="dark:bg-gray-800 w-full min-h-screen">
        <Navbar />
        <div>{children}</div>
        <Footer />
      </main>
    </div>
  );
};
