import { notFound } from "next/navigation";
import { getTokens } from "next-firebase-auth-edge";
import { cookies } from "next/headers";
import { clientConfig, serverConfig } from "../../../config";
import { HeaderLogged } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { CourseList } from "@/components/dashboard/courses/CourseList";
import { NextClass } from "@/components/dashboard/courses/NextClass";


export default async function Page() {
  const tokens = await getTokens(cookies(), {
    apiKey: clientConfig.apiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys,
    serviceAccount: serverConfig.serviceAccount,
  });

  if (!tokens) {
    return notFound();
  }

  


  return (
    <main className="flex-1">
      <HeaderLogged tokens={tokens} />
      <NextClass tokens={tokens}/>
      <CourseList tokens={tokens}/>
      <Footer />
    </main>
  )
}