import { ReactNode } from 'react';

interface ContentLayoutProps {
  title: string;
  children: ReactNode;
}

export default function ContentLayout({ title, children }: ContentLayoutProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">{title}</h1>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

