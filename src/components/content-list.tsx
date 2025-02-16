import { ContentItem } from '@/types'
import { Link } from 'next-view-transitions'

interface ContentListProps {
  title: string
  items: ContentItem[]
  baseUrl: string
}

export default function ContentList({
  title,
  items,
  baseUrl,
}: ContentListProps) {
  const publishedItems = items.filter(item => item.published !== false)

  return (
    <div className="space-y-6">
      <h2 className="text-lg">{title}</h2>
      {publishedItems.length > 0 ? (
        <ul className="space-y-4 list-disc list-inside">
          {publishedItems.map((item) => (
            <li key={item.slug}>
              <Link
                href={`${baseUrl}/${item.slug}`}
                className="text-blue-600 hover:text-blue-800 transition-colors duration-300"
              >
                <span className="mr-2">{item.title}</span>
                {item.date && (
                  <span className="text-sm text-gray-500">({item.date})</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">Stay tuned for updates.</p>
      )}
    </div>
  )
}

