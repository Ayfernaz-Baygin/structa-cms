import { Container } from '@/components/container';
import { SectionHeading } from '@/components/section-heading';
import { ServiceCard } from '@/components/service-card';
import { getServices, type ListSectionData } from '@/lib/api';

export async function ServicesSection({ data }: { data: ListSectionData }) {
  const services = await getServices(data.limit);

  if (services.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading title={data.title ?? 'Hizmetlerimiz'} />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </Container>
    </section>
  );
}
