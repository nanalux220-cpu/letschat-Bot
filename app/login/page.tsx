import { Suspense } from "react";
import { AuthForm } from "../_components/auth-form";
import { Nav } from "../_components/site";

export default function Page() {
  return (
    <>
      <Nav />
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </>
  );
}
