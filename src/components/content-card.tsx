"use client";

import Link from "next/link";
import { ArrowRight } from 'lucide-react';

interface ContentCardProps {
  title: string;
  date: string;
  slug: string;
  type: 'p' | 'b' | 'n';
}

export default function ContentCard({ title, date, slug, type }: ContentCardProps) {
  const typeLabels = {
    p: 'Project',
    b: 'Blog',
    n: 'Note'
  }

  return (
    <Link href={`/${type}/${slug}`} className="block group">
      <div className="border-b border-gray-200 py-4 transition-colors duration-200 hover:bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">{title}</h2>
            <div className="flex items-center mt-1">
              <span className="text-sm text-gray-500">{date}</span>
              <span className="mx-2 text-gray-300">•</span>
              <span className="text-sm text-gray-500">{typeLabels[type]}</span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
        </div>
      </div>
    </Link>
  );
}
