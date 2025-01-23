import Navigatior from "@/components/navigaitor";

export default function LayoutContentPage({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <Navigatior />
      {children}
    </main>
  );
}
