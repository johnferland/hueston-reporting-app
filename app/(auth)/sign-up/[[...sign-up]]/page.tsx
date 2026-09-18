import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="ds-auth ds-page-dark-grain ds-corner-glyph">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/"
        forceRedirectUrl="/"
      />
    </div>
  );
}
