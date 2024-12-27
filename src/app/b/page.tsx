import ContentCard from "@/components/content-card";
import ContentLayout from "@/components/content-layout";
import { getAllContent } from "@/lib/mdx";

export default async function BlogPage() {
  const posts = await getAllContent('b');

  return (
    <ContentLayout title="Blog">
      {posts.map((post) => (
        <ContentCard
          key={post.slug}
          title={post.frontmatter.title}
          date={new Date(post.frontmatter.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          slug={post.slug}
          type="b"
        />
      ))}
    </ContentLayout>
  );
}
