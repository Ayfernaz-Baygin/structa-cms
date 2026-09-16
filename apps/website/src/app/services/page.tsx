import type { Metadata } from 'next';

import { Container } from '@/components/container';
import { Reveal } from '@/components/reveal';
import { SectionHeading } from '@/components/section-heading';
import { ServiceCard } from '@/components/service-card';
import { getServices } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Hizmetlerimiz',
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <Container className="py-20 sm:py-28">
      <SectionHeading title="Hizmetlerimiz" />

      {services.length === 0 ? (
        <p className="mt-12 text-sm text-muted">Şu anda yayında bir hizmet bulunmuyor.</p>
      ) : (
        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.id} delay={(index % 3) * 80}>
              <ServiceCard service={service} index={index} />
            </Reveal>
          ))}
        </div>
      )}
    </Container>
  );
}
