export default function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Atichat. All rights reserved.
            </p>
          </div>
          
        </div>
      </div>
    </footer>
  );
}

