import { SignIn } from "@clerk/nextjs";
import { Logo } from "@/components/ui";

export default function SignInPage() {
  return (
    <div className="ds-auth ds-page-dark">
      <div className="ds-auth-brand">
        <Logo />
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/"
          forceRedirectUrl="/"
        />
      </div>
    </div>
  );
}
