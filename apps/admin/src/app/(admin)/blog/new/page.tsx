import { PostForm } from '@/components/post-form';

export default function NewPostPage() {
  return (
    <div>
      <p className="text-sm font-medium text-indigo-400">Structa CMS</p>
      <h1 className="mt-2 text-3xl font-semibold">Yeni Yazı</h1>
      <p className="mt-2 text-zinc-400">Web sitesinde yayınlanacak yeni bir blog yazısı oluşturun.</p>

      <div className="mt-8">
        <PostForm />
      </div>
    </div>
  );
}
