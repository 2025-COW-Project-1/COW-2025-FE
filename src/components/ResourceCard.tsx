// src/components/ResourceCard.tsx
import type { ResourceItem, ResourceLink } from '../api/resources';

function linkStyle(link: ResourceLink) {
  if (link.isPrimary) {
    return 'rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white';
  }
  return 'rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50';
}

export default function ResourceCard({ item }: { item: ResourceItem }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
          {item.category === 'journal' ? '저널' : '템플릿'}
        </span>
        <span className="text-xs text-slate-500">{item.year}년</span>
      </div>

      <div className="mt-3 text-lg font-bold text-slate-900">{item.title}</div>
      <p className="mt-2 text-sm text-slate-600">{item.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {item.links.map((link) => (
          <a
            key={`${link.kind}-${link.url}`}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className={linkStyle(link)}
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
