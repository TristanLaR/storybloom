import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="text-xl font-bold text-primary-600">
            StoryBloom
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: January 2026</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing or using StoryBloom, you agree to be bound by these Terms of Service
              and all applicable laws and regulations. If you do not agree with any of these terms,
              you are prohibited from using or accessing this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
            <p className="text-gray-600 mb-4">
              StoryBloom is a platform for creating personalized children&apos;s books using
              AI-powered story and illustration generation. Users can create digital books
              and order printed copies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Content Guidelines</h2>
            <p className="text-gray-600 mb-4">
              As a platform designed for creating children&apos;s content, we maintain strict
              content guidelines. Users agree to the following:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>All content must be appropriate for children of all ages</li>
              <li>No violent, graphic, or disturbing content</li>
              <li>No adult or sexually suggestive content</li>
              <li>No hate speech, discrimination, or harmful stereotypes</li>
              <li>No content promoting illegal activities</li>
              <li>No personal information (addresses, phone numbers, etc.) in stories</li>
              <li>No copyrighted characters or content without proper authorization</li>
            </ul>
            <p className="text-gray-600 mt-4">
              StoryBloom employs automated content moderation to enforce these guidelines.
              Content that violates these guidelines may be automatically blocked or flagged
              for manual review. Repeated violations may result in account suspension.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Responsibilities</h2>
            <p className="text-gray-600 mb-4">Users are responsible for:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Maintaining the confidentiality of their account credentials</li>
              <li>All activities that occur under their account</li>
              <li>Ensuring all content created complies with our guidelines</li>
              <li>Not attempting to bypass content moderation systems</li>
              <li>Providing accurate information for shipping and billing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Intellectual Property</h2>
            <p className="text-gray-600 mb-4">
              <strong>Your Content:</strong> You retain ownership of the original story concepts,
              character ideas, and personal photos you upload. However, the AI-generated text
              and images are created collaboratively with our AI systems.
            </p>
            <p className="text-gray-600 mb-4">
              <strong>License Grant:</strong> By using StoryBloom, you grant us a non-exclusive,
              worldwide license to use, display, and process your content for the purpose of
              providing our services, including printing and delivery.
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Our Content:</strong> The StoryBloom platform, including its design,
              features, and underlying technology, is owned by StoryBloom and protected by
              intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. AI-Generated Content</h2>
            <p className="text-gray-600 mb-4">
              StoryBloom uses artificial intelligence to generate stories and illustrations.
              By using our service, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>AI-generated content may occasionally produce unexpected results</li>
              <li>You are responsible for reviewing and approving all content before printing</li>
              <li>We continuously work to improve content quality and safety</li>
              <li>Generated content may not be used for any illegal or harmful purposes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Payments and Refunds</h2>
            <p className="text-gray-600 mb-4">
              <strong>Pricing:</strong> Current pricing is displayed on our website. Prices may
              change without notice, but changes will not affect orders already placed.
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Refunds:</strong> Digital products (story generation) are non-refundable
              once generation begins. For printed books, please refer to our shipping partner&apos;s
              refund policy. Contact support for quality issues.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              StoryBloom is provided &quot;as is&quot; without warranties of any kind. We shall not
              be liable for any indirect, incidental, special, consequential, or punitive damages
              resulting from your use of or inability to use the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Account Termination</h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to terminate or suspend accounts that violate these terms,
              engage in fraudulent activity, or abuse our services. Users may also delete
              their accounts at any time through account settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
            <p className="text-gray-600 mb-4">
              We may update these terms from time to time. We will notify users of significant
              changes via email or through the platform. Continued use of StoryBloom after
              changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-gray-600">
              Email: <a href="mailto:legal@storybloom.com" className="text-primary-600 hover:underline">legal@storybloom.com</a>
            </p>
          </section>
        </div>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t">
          <Link href="/" className="text-primary-600 hover:underline">
            &larr; Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
