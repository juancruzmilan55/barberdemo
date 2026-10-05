import { BookingWizard } from '@/components/BookingWizard';
import { Faq } from '@/components/Faq';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { ManageModal } from '@/components/ManageModal';
import { Reveal } from '@/components/Reveal';
import { SectionTitle } from '@/components/SectionTitle';
import { Services } from '@/components/Services';
import { Team } from '@/components/Team';
import { WalkInNotice } from '@/components/WalkInNotice';
import { content } from '@/lib/content';
import { barbers as demoBarbers, branch, categories } from '@/lib/demo/data';

export default function Home() {
  const barbers = demoBarbers;
  const b = content.sections.booking;

  const wizardServices = categories.flatMap((c) =>
    c.services.map((s) => ({ id: s.id, name: s.name, categoryName: c.name, durationMin: s.durationMin, priceARS: s.priceARS })),
  );
  const wizardBarbers = barbers.map((p) => ({ id: p.id, name: p.name, serviceIds: p.serviceIds }));

  return (
    <>
      <p className="bg-surface px-4 py-2 text-center text-sm text-muted">Versión de demostración: las reservas se guardan solo en tu navegador.</p>
      <Hero />
      <WalkInNotice days={branch.walkInOnlyWeekdays} />
      <Services categories={categories} />
      <Team barbers={barbers} />

      <section id="reservar" className="section">
        <div className="wrap">
          <Reveal>
            <SectionTitle eyebrow={b.eyebrow} start={b.titleStart} accent={b.titleAccent} />
          </Reveal>
          <div className="mt-8">
            <BookingWizard
              services={wizardServices}
              barbers={wizardBarbers}
              maxDaysAhead={branch.maxDaysAhead}
              transferAlias={branch.transferAlias}
              transferHolder={branch.transferHolder}
              businessName={content.brand.name}
              address={content.brand.address}
            />
          </div>
        </div>
      </section>

      <Faq />
      <Footer />
      <ManageModal />
    </>
  );
}
