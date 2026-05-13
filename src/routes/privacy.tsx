import { createFileRoute } from "@tanstack/react-router";
import { LandingHeader } from "@/components/LandingHeader";
import { LandingFooter } from "@/components/LandingFooter";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Notice — GafCore" },
      { name: "description", content: "GafCore privacy notice — how we collect, use, and protect your data." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <section className="pt-32 pb-24">
        <div className="mx-auto max-w-3xl px-4 prose prose-invert prose-sm">
          <h1 className="text-3xl font-black text-foreground mb-8">Privacy Notice</h1>
          <p className="text-muted-foreground text-sm">Last updated: May 2, 2026</p>

          <h2 className="text-xl font-bold text-foreground mt-8">1. Data Controller</h2>
          <p className="text-muted-foreground">
            <strong className="text-foreground">Luis Alfonso Pérez Avilez</strong>, operating as GafCore ("we", "us", "our"),
            is the data controller responsible for your personal data when you use our Service.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">2. Data We Collect</h2>
          <p className="text-muted-foreground">We collect the following categories of personal data:</p>
          <ul className="text-muted-foreground list-disc pl-6 space-y-1">
            <li><strong className="text-foreground">Account information:</strong> name, email address, login credentials</li>
            <li><strong className="text-foreground">Profile data:</strong> artist name, biography, profile image</li>
            <li><strong className="text-foreground">Content:</strong> music files, artwork, metadata you upload</li>
            <li><strong className="text-foreground">Support communications:</strong> messages you send to our support team</li>
            <li><strong className="text-foreground">Usage data:</strong> pages visited, features used, session duration</li>
            <li><strong className="text-foreground">Device information:</strong> IP address, browser type, device identifiers, operating system</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground mt-8">3. How We Use Your Data</h2>
          <ul className="text-muted-foreground list-disc pl-6 space-y-1">
            <li><strong className="text-foreground">Account creation & service delivery:</strong> to create and manage your account, distribute your music (contract performance)</li>
            <li><strong className="text-foreground">Customer support:</strong> to respond to your inquiries and resolve issues (contract performance)</li>
            <li><strong className="text-foreground">Security & fraud prevention:</strong> to protect the Service and our users (legitimate interest)</li>
            <li><strong className="text-foreground">Product improvement:</strong> to analyze usage patterns and improve our platform (legitimate interest)</li>
            <li><strong className="text-foreground">Marketing:</strong> to send relevant updates about the Service, with your consent where required (consent)</li>
            <li><strong className="text-foreground">Legal compliance:</strong> to meet legal obligations (legal obligation)</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground mt-8">4. Data Sharing</h2>
          <p className="text-muted-foreground">We share your data with the following categories of recipients:</p>
          <ul className="text-muted-foreground list-disc pl-6 space-y-1">
            <li><strong className="text-foreground">Paddle</strong> — our Merchant of Record, for sale of products, subscription management, payments, tax compliance, and invoicing</li>
            <li><strong className="text-foreground">Service providers:</strong> hosting (cloud infrastructure), analytics, and support tooling providers who process data on our behalf</li>
            <li><strong className="text-foreground">Distribution partners:</strong> music stores and streaming platforms to deliver your content</li>
            <li><strong className="text-foreground">Professional advisers:</strong> legal and accounting professionals as needed</li>
            <li><strong className="text-foreground">Authorities:</strong> where required by law or court order</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground mt-8">5. Data Retention</h2>
          <p className="text-muted-foreground">
            We retain your personal data for as long as your account is active or as needed to provide the Service.
            When data is no longer needed, we will delete or anonymize it. Some data may be retained longer where
            required by law (e.g., financial records).
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">6. Your Rights</h2>
          <p className="text-muted-foreground">Depending on your jurisdiction, you may have the right to:</p>
          <ul className="text-muted-foreground list-disc pl-6 space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate or incomplete data</li>
            <li>Request deletion of your data</li>
            <li>Restrict or object to processing of your data</li>
            <li>Request data portability</li>
            <li>Withdraw consent at any time (where processing is based on consent)</li>
          </ul>
          <p className="text-muted-foreground mt-2">
            To exercise these rights, contact us at{" "}
            <a href="mailto:support@gafcore.com" className="text-primary hover:underline">support@gafcore.com</a>.
            We will respond within one month.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">7. Security</h2>
          <p className="text-muted-foreground">
            We implement appropriate technical and organizational measures to protect your personal data, including
            encryption in transit and at rest, access controls, and regular security reviews.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">8. Cookies</h2>
          <p className="text-muted-foreground">
            We use essential cookies to keep you logged in and maintain your session. We may also use analytics
            cookies to understand how the Service is used. You can manage your cookie preferences in your browser settings.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">9. Changes</h2>
          <p className="text-muted-foreground">
            We may update this Privacy Notice from time to time. We will notify you of significant changes via email
            or through the Service.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">10. Contact</h2>
          <p className="text-muted-foreground">
            For questions about this Privacy Notice, contact us at{" "}
            <a href="mailto:support@gafcore.com" className="text-primary hover:underline">support@gafcore.com</a>.
          </p>
        </div>
      </section>
      <LandingFooter />
    </div>
  );
}
