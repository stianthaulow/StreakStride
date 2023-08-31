import Head from "next/head";

import { siteConfig } from "~/utils/config";
import { Header } from "~/components/Header";

function TailwindIndicator() {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="fixed bottom-1 left-1 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 p-3 font-mono text-xs text-white">
      <div className="block sm:hidden">xs</div>
      <div className="hidden sm:block md:hidden">sm</div>
      <div className="hidden md:block lg:hidden">md</div>
      <div className="hidden lg:block xl:hidden">lg</div>
      <div className="hidden xl:block 2xl:hidden">xl</div>
      <div className="hidden 2xl:block">2xl</div>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Head>
        <title>{siteConfig.name}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className=" flex min-h-screen flex-col">
        <Header />
        <div className="flex-1 pt-5">{children}</div>
        {/* <SiteFooter /> */}
        <TailwindIndicator />
      </div>
    </>
  );
}
