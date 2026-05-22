import { Wordmark } from "@/components/Brand";

export default function Donate() {
  return (
    <div className="px-6 pt-10">
      <Wordmark subtitle="Sadaqah jariyah — ongoing charity" />

      <div className="mt-8 card p-6">
        <p className="font-serif text-xl text-tayba-700 dark:text-paper-50">
          Tasneem is free, ad-free, telemetry-free, and will always remain so.
        </p>
        <p className="mt-3 text-sm text-tayba-900/70 dark:text-paper-200/70">
          We don't sell premium tiers. Donating unlocks nothing — everyone gets every feature. Your gift simply covers domain, certificates, and the small recurring costs of keeping it alive for everyone else.
        </p>

        <div className="gold-rule my-6" />

        <div className="space-y-3">
          <a href="#" className="btn-gold block text-center">Donate once</a>
          <a href="#" className="btn-primary block text-center">Donate monthly</a>
        </div>

        <p className="mt-5 text-[11px] text-tayba-900/55 dark:text-paper-200/55">
          Configure your Stripe / PayPal / Open Collective links here. We recommend a public ledger page so contributors see exactly where every dollar goes.
        </p>
      </div>

      <div className="mt-6 card p-6">
        <h3 className="font-serif text-lg text-tayba-700 dark:text-paper-50">A note on sadaqah jariyah</h3>
        <p className="mt-2 text-sm text-tayba-900/70 dark:text-paper-200/70">
          The Prophet ﷺ said: <em>"When a person dies, his deeds come to an end except for three: a continuing charity, beneficial knowledge, or a righteous child who prays for him."</em>
          <span className="block mt-2 text-[11px]">— Sahih Muslim 1631 · <a className="text-gold-500 underline" target="_blank" rel="noopener" href="https://sunnah.com/muslim:1631">verify</a></span>
        </p>
        <p className="mt-3 text-sm text-tayba-900/70 dark:text-paper-200/70">
          Every soul that reads a verse, makes a dhikr, or finds their qibla through this app — by the permission of Allah — counts toward whoever helps keep it running.
        </p>
      </div>
    </div>
  );
}
