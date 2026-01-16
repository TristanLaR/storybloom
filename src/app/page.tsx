import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-xl font-bold text-primary-600">StoryBloom</span>
            <nav className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight">
            Create Magical
            <span className="text-primary-600"> Children&apos;s Books</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Turn your ideas into beautiful, personalized storybooks with AI-powered
            illustrations. Perfect for parents, grandparents, and educators.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
            >
              Start Creating
            </Link>
            <Link
              href="#how-it-works"
              className="bg-white text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors border"
            >
              How It Works
            </Link>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-24 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-card border">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-2xl mb-4">
                ✨
              </div>
              <h3 className="text-xl font-semibold text-gray-900">AI-Powered Stories</h3>
              <p className="mt-2 text-gray-600">
                Our AI creates unique stories tailored to your characters and themes
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-card border">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center text-2xl mb-4">
                🎨
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Custom Illustrations</h3>
              <p className="mt-2 text-gray-600">
                Beautiful artwork generated to match your chosen art style
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-card border">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mb-4">
                📚
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Print-Ready Books</h3>
              <p className="mt-2 text-gray-600">
                Order professional hardcover prints delivered to your door
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} StoryBloom. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
