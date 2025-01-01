export default function LayoutContentPage({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="my-8">{children}</main>;
}
