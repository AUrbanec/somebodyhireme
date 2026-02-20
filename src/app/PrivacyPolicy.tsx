import React from 'react';
import { Link } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e9a737] via-[#eff5f5] to-[#f0eff5] py-12">
      <main className="max-w-4xl mx-auto px-4">
        <article className="bg-white rounded-lg shadow-lg p-8 md:p-10 space-y-6 text-gray-800">
          <header className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-[#107d8d]">Privacy Policy</h1>
            <p className="text-sm text-gray-600">Effective Date: February 20, 2026</p>
          </header>

          <section className="space-y-3">
            <p>
              This website is a personal resume and interview-booking site. I only collect information you
              choose to provide through the scheduling/contact form.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#8d5e10]">Information Collected</h2>
            <p>When you submit the interview form, the information may include:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Name</li>
              <li>Email address</li>
              <li>Company name</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#8d5e10]">How Information Is Used</h2>
            <p>The information is used only to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Review and respond to interview requests</li>
              <li>Send interview-related notifications</li>
              <li>Create calendar events when scheduling details are provided</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#8d5e10]">Data Storage and Retention</h2>
            <p>
              Submitted form data is not stored as part of a separate website database for long-term retention.
              The information may be present in my Gmail account and related calendar event details as part of the
              notification and scheduling workflow.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#8d5e10]">Third-Party Services</h2>
            <p>
              This site uses Google services (such as Gmail and Google Calendar) to handle interview notifications
              and scheduling. Your use of those services is also subject to Google&apos;s terms and privacy practices.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#8d5e10]">Your Choices</h2>
            <p>
              If you would like your information removed from future communications, use the contact details on
              this site and request deletion. I will make reasonable efforts to honor your request.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#8d5e10]">Policy Updates</h2>
            <p>
              This Privacy Policy may be updated from time to time. Any updates will be posted on this page with a
              revised effective date.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#8d5e10]">Contact</h2>
            <p>
              For privacy questions, please use the contact information listed on the main page of this website.
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
