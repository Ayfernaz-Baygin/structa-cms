import { ServiceForm } from '@/components/service-form';

export default function NewServicePage() {
  return (
    <div>
      <p className="text-sm font-medium text-indigo-400">Structa CMS</p>
      <h1 className="mt-2 text-3xl font-semibold">Yeni Hizmet</h1>
      <p className="mt-2 text-zinc-400">Web sitesinde gösterilecek yeni bir hizmet oluşturun.</p>

      <div className="mt-8">
        <ServiceForm />
      </div>
    </div>
  );
}
