import { PageForm } from '@/components/page-form';

export default function NewPagePage() {
  return (
    <div>
      <p className="text-sm font-medium text-indigo-400">Structa CMS</p>
      <h1 className="mt-2 text-3xl font-semibold">Yeni Sayfa</h1>
      <p className="mt-2 text-zinc-400">Yeni bir web sitesi sayfası oluşturun.</p>

      <div className="mt-8">
        <PageForm />
      </div>
    </div>
  );
}
