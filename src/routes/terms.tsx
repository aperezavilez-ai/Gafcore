import { createFileRoute, Link } from "@tanstack/react-router";
import { LandingHeader } from "@/components/LandingHeader";
import { LandingFooter } from "@/components/LandingFooter";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — GafCore" },
      { name: "description", content: "Terms for using the GafCore AI creation platform." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <section className="pt-32 pb-24">
        <div className="mx-auto max-w-3xl px-4 prose prose-invert prose-sm">
          <h1 className="text-3xl font-black text-foreground mb-8">Terms & Conditions</h1>
          <p className="text-muted-foreground text-sm">Last updated: May 2, 2026</p>

          <h2 className="text-xl font-bold text-foreground mt-8">1. Introduction</h2>
          <p className="text-muted-foreground">
            These Terms and Conditions ("Terms") govern your use of GafCore ("Service"), operated by
            <strong className="text-foreground"> Luis Alfonso Pérez Avilez</strong> ("we", "us", "our").
            By accessing or using the Service, you agree to be bound by these Terms.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">2. Acceptance</h2>
          <p className="text-muted-foreground">
            By continuing to use GafCore, you confirm that you have read, understood, and agree to these Terms.
            If you do not agree, you must stop using the Service immediately.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">3. Service Description</h2>
          <p className="text-muted-foreground">
            GafCore is a software platform for building applications and prototypes with AI-assisted chat, a live
            preview, and an integrated code editor. Features and limits depend on your plan and fair use.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">4. Account & Credentials</h2>
          <p className="text-muted-foreground">
            You must provide accurate information when creating an account and keep it updated. You are responsible
            for maintaining the confidentiality of your account credentials and for all activity that occurs under
            your account. You must have the authority to bind yourself (or your organization) to these Terms.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">5. Acceptable Use</h2>
          <p className="text-muted-foreground">You agree not to:</p>
          <ul className="text-muted-foreground list-disc pl-6 space-y-1">
            <li>Use the Service for any unlawful purpose or in violation of any applicable laws</li>
            <li>Upload content that infringes on intellectual property rights of others</li>
            <li>Engage in fraud, spam, or deceptive practices</li>
            <li>Attempt to interfere with the security or integrity of the Service (including malware, probing, or scraping)</li>
            <li>Resell, redistribute, or sublicense access to the Service without our consent</li>
            <li>Reverse engineer, decompile, or attempt to derive the source code of the Service</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground mt-8">6. Intellectual Property</h2>
          <p className="text-muted-foreground">
            GafCore and its original content, features, and functionality (including software, documentation, and branding)
            are owned by Luis Alfonso Pérez Avilez and are protected by intellectual property laws.
            You retain ownership of the projects and content you create. By uploading or generating content, you grant us a limited,
            non-exclusive license to host and process it solely to provide the Service.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">7. License</h2>
          <p className="text-muted-foreground">
            We grant you a limited, non-exclusive, non-transferable, revocable right to use the Service within
            the scope of your selected plan. This license does not include the right to resell or redistribute the Service.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">8. Payments & Subscriptions</h2>
          <p className="text-muted-foreground">
            Our order process is conducted by our online reseller <strong className="text-foreground">Paddle.com</strong>.
            Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service inquiries
            and handles returns. For full payment, billing, tax, cancellation, and refund details, please refer to{" "}
            <a href="https://www.paddle.com/legal/checkout-buyer-terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Paddle's Buyer Terms
            </a>.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">9. Service Availability</h2>
          <p className="text-muted-foreground">
            We strive to provide uninterrupted access to the Service, but we do not guarantee that the Service will be
            available at all times or will be error-free. We may suspend or modify the Service for maintenance,
            updates, or other reasons without prior notice.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">10. Suspension & Termination</h2>
          <p className="text-muted-foreground">
            We reserve the right to suspend or terminate your access to the Service if you: materially breach these Terms,
            fail to make required payments, engage in activity that poses a security or fraud risk, or repeatedly or
            seriously violate our policies. Upon termination, your right to use the Service ceases immediately.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">11. Limitation of Liability</h2>
          <p className="text-muted-foreground">
            To the fullest extent permitted by law, we disclaim all implied warranties, including merchantability and
            fitness for a particular purpose. Our aggregate liability shall not exceed the fees you have paid in the
            prior 12 months. We are not liable for any indirect, consequential, or special damages, including loss of
            profits, data, or goodwill. Nothing in these Terms excludes liability for fraud, death, or personal injury
            caused by negligence.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">12. Indemnification</h2>
          <p className="text-muted-foreground">
            You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from your
            content, your unlawful use of the Service, or your violation of these Terms.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">13. Changes to Terms</h2>
          <p className="text-muted-foreground">
            We may update these Terms from time to time. Continued use of the Service after changes constitutes
            acceptance of the updated Terms.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">14. Contact</h2>
          <p className="text-muted-foreground">
            If you have questions about these Terms, please contact us at{" "}
            <a href="mailto:support@gafcore.com" className="text-primary hover:underline">support@gafcore.com</a>.
          </p>
        </div>
      </section>
      <LandingFooter />
    </div>
  );
}
