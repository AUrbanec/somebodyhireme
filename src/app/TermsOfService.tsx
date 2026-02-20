import React from 'react';
import { Link } from 'react-router-dom';

export const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e9a737] via-[#eff5f5] to-[#f0eff5] py-12">
      <main className="max-w-4xl mx-auto px-4">
        <article className="bg-white rounded-lg shadow-lg p-8 md:p-10 space-y-6 text-gray-800">
          <header className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-[#107d8d]">Terms of Service</h1>
            <p className="text-sm text-gray-600">Effective Date: February 20, 2026</p>
          </header>

          <section className="space-y-3">
            <p>
              These Terms of Service govern your use of this personal resume and interview-booking website. By
              using this site, you agree to these terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#8d5e10]">Use of This Site</h2>
            <p>
              You may use this site to review professional information and to submit interview requests. You agree
              not to misuse the site, attempt unauthorized access, or interfere with site operations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#8d5e10]">Interview Requests</h2>
            <p>
              Submitting an interview request does not guarantee availability or acceptance. Scheduling remains
              subject to confirmation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#8d5e10]">Information You Provide</h2>
            <p>
              You are responsible for ensuring that the information you submit (including name, email, and company
              details) is accurate and appropriate.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#8d5e10]">Intellectual Property</h2>
            <p>
              Unless otherwise stated, the content on this site, including text, layout, and branding, is owned by
              the site owner and may not be copied or redistributed for commercial purposes without permission.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#8d5e10]">Third-Party Services and Links</h2>
            <p>
              This site may rely on or link to third-party services (including Google services). Those services are
              governed by their own terms and privacy policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#8d5e10]">Disclaimer</h2>
            <p>
              This site is provided on an &quot;as is&quot; and &quot;as available&quot; basis. No warranties are made regarding uninterrupted
              availability, accuracy, or fitness for a particular purpose.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#8d5e10]">Limitation of Liability</h2>
            <p>
              To the maximum extent allowed by law, the site owner is not liable for indirect, incidental, or
              consequential damages arising from your use of this site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#8d5e10]">Changes to These Terms</h2>
            <p>
              These terms may be updated from time to time. Updated terms become effective when posted on this
              page with a revised effective date.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#8d5e10]">Contact</h2>
            <p>
              For questions about these terms, please use the contact information listed on the main page of this
              website.
            </p>
          </section>

          <footer className="pt-2">
            <Link to="/" className="text-[#107d8d] hover:text-[#20108d] underline underline-offset-2">
              Back to Home
            </Link>
          </footer>
        </article>
      </main>
    </div>
  );
};
