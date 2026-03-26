import Link from "next/link";
import { ArrowRight, Zap, Shield, BarChart3, FileText, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.15),rgba(0,0,0,0))]"></div>
        <div className="container relative px-4 mx-auto lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-3 py-1 mb-6 text-sm font-medium text-blue-400 border border-blue-500/30 rounded-full bg-blue-500/10">
              <Zap className="w-4 h-4 mr-2" />
              <span>Now with real-time PDF extraction</span>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl mb-6">
              Automate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Document Workflow</span>
            </h1>
            <p className="max-w-2xl mx-auto mb-10 text-xl text-slate-400">
              Process, analyze, and extract data from hundreds of documents asynchronously. Real-time progress tracking, secure storage, and instant export.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all bg-blue-600 rounded-xl hover:bg-blue-500 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-slate-300 transition-all border border-slate-700 rounded-xl hover:bg-slate-800"
              >
                View Features
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-slate-900 bg-slate-950">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { label: "Documents Processed", value: "1.2M+" },
              { label: "Processing Speed", value: "2.5s/pg" },
              { label: "Accuracy Rate", value: "99.9%" },
              { label: "Data Uptime", value: "99.99%" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-500 uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything you need for document intelligence</h2>
            <p className="text-xl text-slate-600">Powerful features to handle any document volume with ease.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: <FileText className="w-8 h-8 text-blue-600" />,
                title: "Deep Extraction",
                description: "Automatically extract titles, authors, and metadata using advanced PDF parsing logic."
              },
              {
                icon: <Zap className="w-8 h-8 text-amber-500" />,
                title: "Async Processing",
                description: "Upload folders of documents and let our background workers handle the heavy lifting."
              },
              {
                icon: <BarChart3 className="w-8 h-8 text-emerald-500" />,
                title: "Live Tracking",
                description: "Watch processing happen in real-time with Server-Sent Events and Redis-backed state."
              },
              {
                icon: <Shield className="w-8 h-8 text-indigo-600" />,
                title: "Secure Storage",
                description: "Encrypted storage for all your sensitive documents with role-based access control."
              },
              {
                icon: <CheckCircle className="w-8 h-8 text-rose-500" />,
                title: "Review System",
                description: "Validate extracted data with an integrated review and finalization workflow."
              },
              {
                icon: <ArrowRight className="w-8 h-8 text-teal-600" />,
                title: "Instant Export",
                description: "Export processed results to JSON or CSV for integration with your existing tools."
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 border border-slate-100 rounded-2xl hover:shadow-xl transition-shadow bg-slate-50/50">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Ready to streamline your document workflow?</h2>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-10 py-4 text-xl font-bold text-blue-600 transition-all bg-white rounded-xl hover:bg-slate-50 hover:scale-105 active:scale-95 shadow-xl"
          >
            Start Processing for Free
          </Link>
          <p className="mt-6 text-blue-100 italic">No credit card required. Up to 100 documents/mo.</p>
        </div>
      </section>

      <footer className="py-12 bg-slate-950 border-t border-slate-900">
        <div className="container px-4 mx-auto text-center text-slate-500">
          <p>© 2026 DocProc AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
