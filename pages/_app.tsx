import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Tim Schneider</title>
        <meta property="og:title" content="Tim Schneider" key="title" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
