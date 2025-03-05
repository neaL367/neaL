import Navigatior from "@/components/navigaitor";

export default function LayoutPage({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="h-full">
      <Navigatior />
      {children}
    </main>
  );
}
