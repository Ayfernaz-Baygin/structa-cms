import Link from '@/components/locale-link';

import { Container } from '@/components/container';
import { Reveal } from '@/components/reveal';
import { SectionHeading } from '@/components/section-heading';
import { ServiceCard } from '@/components/service-card';
import { getServices, type ListSectionData } from '@/lib/api';

export async function ServicesSection({ data }: { data: ListSectionData }) {
  const services = await getServices(data.limit);

  if (services.length === 0) {
    return null;
  }

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading title={data.title ?? 'Hizmetlerimiz'} />
          <Link
            href="/services"
            className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            Tümünü Gör →
          </Link>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.id} delay={(index % 3) * 80}>
              <ServiceCard service={service} index={index} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
