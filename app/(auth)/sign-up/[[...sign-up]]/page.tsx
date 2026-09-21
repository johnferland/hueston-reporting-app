import { SignUp } from "@clerk/nextjs";
import { Logo } from "@/components/ui";

export default function SignUpPage() {
  return (
    <div className="ds-auth ds-page-dark">
      <div className="ds-auth-brand">
        <Logo />
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/"
          forceRedirectUrl="/"
        />
      </div>
    </div>
  );
}
