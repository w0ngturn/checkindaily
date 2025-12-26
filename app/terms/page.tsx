export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-cyan-400">Terms of Service</h1>

        <div className="space-y-6 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing and using CHECKIN, you accept and agree to be bound by the terms and provision of this
              agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-white">2. Use License</h2>
            <p>
              Permission is granted to use CHECKIN for personal, non-commercial use. This is the grant of a license, not
              a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Modify or copy the materials</li>
              <li>Use materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer, decompile, or otherwise discover source code</li>
              <li>Remove any copyright or proprietary notations</li>
              <li>Transfer the materials to another person or "mirror" materials on any other server</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Transmit spam, viruses, or malicious code</li>
              <li>Engage in any form of harassment or abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-white">3. Disclaimer</h2>
            <p>
              The materials on CHECKIN are provided on an 'as is' basis. CHECKIN makes no warranties, expressed or
              implied, and hereby disclaims and negates all other warranties including, without limitation, implied
              warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of
              intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-white">4. Limitations</h2>
            <p>
              In no event shall CHECKIN or its suppliers be liable for any damages (including, without limitation,
              damages for loss of data or profit, or due to business interruption) arising out of the use or inability
              to use the materials on CHECKIN.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-white">5. Accuracy of Materials</h2>
            <p>
              The materials appearing on CHECKIN could include technical, typographical, or photographic errors. CHECKIN
              does not warrant that any of the materials are accurate, complete, or current. CHECKIN may make changes to
              the materials contained on its Service at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-white">6. Links</h2>
            <p>
              CHECKIN has not reviewed all of the sites linked to its Service and is not responsible for the contents of
              any such linked site. The inclusion of any link does not imply endorsement by CHECKIN of the site. Use of
              any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-white">7. Modifications</h2>
            <p>
              CHECKIN may revise these Terms of Service for its Service at any time without notice. By using this
              Service, you are agreeing to be bound by the then current version of these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-white">8. User Conduct</h2>
            <p>
              You agree not to engage in any conduct that restricts or inhibits anyone's use or enjoyment of CHECKIN.
              Prohibited behavior includes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Harassing or causing distress or inconvenience to any person</li>
              <li>Transmitting obscene or offensive content</li>
              <li>Disrupting normal flow of dialogue within CHECKIN</li>
              <li>Attempting to manipulate streaks or rewards</li>
              <li>Using bots or automated systems to artificially inflate metrics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-white">9. Rewards Disclaimer</h2>
            <p>
              CHECKIN provides streaks and points as gamification elements. These rewards have no monetary value unless
              explicitly stated. Future redemption possibilities are not guaranteed. CHECKIN reserves the right to
              modify or discontinue the rewards system at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-white">10. Termination</h2>
            <p>
              CHECKIN may terminate or suspend your account and access to the Service immediately, without prior notice
              or liability, for any reason whatsoever, including if you breach the Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-white">11. Governing Law</h2>
            <p>
              These Terms and Conditions are governed by and construed in accordance with the laws of the jurisdiction
              where CHECKIN operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that
              location.
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
