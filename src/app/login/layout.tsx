export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 grid place-items-center overflow-auto bg-background px-4 py-8">
      {children}
    </div>
  )
}
