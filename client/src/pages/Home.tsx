import AutomindLogo from "@/components/AutomindLogo";
import LeadForm from "@/components/LeadForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-primary text-white font-sans">
      {/* Header */}
      <header className="border-b border-dark-tertiary bg-[#000000]" data-testid="header">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center justify-center space-x-3">
            <AutomindLogo size="lg" showText={false} />
            <h1 className="text-xl sm:text-2xl font-bold text-white">Automind</h1>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl" data-testid="main-content">
        <LeadForm />
      </main>
      {/* Footer */}
      <footer className="border-t border-dark-tertiary mt-8 sm:mt-12 py-6 sm:py-8 bg-[#000000]" data-testid="footer">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
            <AutomindLogo size="sm" showText={false} />
            <span className="text-gray-300 text-xs sm:text-sm">© 2025 Automind. Transformando negócios com Inteligência Artificial.</span>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm px-2">Seus dados estão seguros e serão utilizados apenas para entrarmos em contato.</p>
        </div>
      </footer>
    </div>
  );
}
