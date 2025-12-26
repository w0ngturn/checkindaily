export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-cyan-400">Privacy Policy</h1>

        <div className="space-y-6 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-white">1. Introduction</h2>
            <p>
              CHECKIN ("we", "us", "our") operates as a Farcaster Mini App. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-white">2. Information We Collect</h2>
            <p>We collect information you provide directly:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Farcaster account data (username, display name, FID, profile picture)</li>
              <li>Check-in history and streak information</li>
              <li>Reward and point accumulation data</li>
              <li>Notification preferences</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-white">3. How We Use Your Information</h2>
            <p>We use collected information to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide and maintain the CHECKIN service</li>
              <li>Track user streaks and reward calculations</li>
              <li>Display user profiles on leaderboards</li>
              <li>Send notifications about streaks and rewards</li>
              <li>Improve and optimize our platform</li>
              <li>Comply with legal requirements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-white">4. Data Storage</h2>
            <p>
              Your data is stored securely in Supabase, a PostgreSQL database hosted on secure infrastructure. We
              implement industry-standard encryption and security measures.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-white">5. Data Sharing</h2>
            <p>
              We do not sell your personal data. Your public profile information (username, display name, streak count,
              points) may be displayed on public leaderboards within CHECKIN. We do not share private information with
              third parties without consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-white">6. User Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access your personal data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Opt-out of notifications</li>
              <li>Control notification preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-white">7. Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your data against unauthorized
              access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-white">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify users of significant changes via the
              Service or email if we have your contact information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-white">9. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us through your Farcaster messages or at
              our official support channel.
            </p>
          </section>

          <p className="text-sm text-slate-500 mt-12">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="mt-12">
          <a
            href="/"
            className="inline-block px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
