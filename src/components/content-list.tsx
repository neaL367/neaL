import { Link } from "next-view-transitions";

interface ContentItem {
  slug: string;
  title: string;
}

interface ContentListProps {
  title: string;
  items: ContentItem[];
  baseUrl: string;
}

export default function ContentList({ title, items, baseUrl }: ContentListProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      {items.length > 0 ? (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.slug}>
              <Link
                href={`${baseUrl}/${item.slug}`}
                className="text-blue-600 hover:text-blue-800 transition-colors duration-300"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">Stay tuned for updates.</p>
      )}
    </div>
  );
}
