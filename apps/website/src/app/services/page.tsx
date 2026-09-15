import type { Metadata } from 'next';

import { Container } from '@/components/container';
import { SectionHeading } from '@/components/section-heading';
import { ServiceCard } from '@/components/service-card';
import { getServices } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Hizmetlerimiz',
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <Container className="py-16 sm:py-24">
      <SectionHeading eyebrow="Neler Yapıyoruz" title="Hizmetlerimiz" />

      {services.length === 0 ? (
        <p className="mt-12 text-sm text-muted">Şu anda yayında bir hizmet bulunmuyor.</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </Container>
  );
}
