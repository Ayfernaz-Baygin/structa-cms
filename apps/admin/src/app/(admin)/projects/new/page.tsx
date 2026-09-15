import { ProjectForm } from '@/components/project-form';

export default function NewProjectPage() {
  return (
    <div>
      <p className="text-sm font-medium text-indigo-400">Structa CMS</p>
      <h1 className="mt-2 text-3xl font-semibold">Yeni Proje</h1>
      <p className="mt-2 text-zinc-400">Web sitesinde gösterilecek yeni bir proje oluşturun.</p>

      <div className="mt-8">
        <ProjectForm />
      </div>
    </div>
  );
}
