import Link from 'next/link'
import { UtensilsCrossed, Users, Heart, Shield } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <header className="px-4 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Village Kitchen</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-700 hover:text-amber-700 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-medium bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
            Share home-cooked meals
            <br />
            <span className="text-amber-600">with your village</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            A private meal-sharing network for families. Cook together, eat together,
            build community — no money, no delivery, just neighbors helping neighbors.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-amber-600 text-white font-semibold text-lg hover:bg-amber-700 transition-colors shadow-lg shadow-amber-200"
            >
              Get started
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-white text-gray-700 font-semibold text-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
              I have an invite
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto mt-24 grid sm:grid-cols-3 gap-8">
          <div className="text-center px-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-amber-700" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Private villages</h3>
            <p className="mt-2 text-sm text-gray-600">
              Create or join a small, invite-only group of families in your neighborhood.
            </p>
          </div>
          <div className="text-center px-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-orange-700" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Share with love</h3>
            <p className="mt-2 text-sm text-gray-600">
              Post meals, reserve portions, and exchange credits. No money changes hands.
            </p>
          </div>
          <div className="text-center px-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-green-700" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Built on trust</h3>
            <p className="mt-2 text-sm text-gray-600">
              Private feedback, allergy awareness, and community coordination built in.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="max-w-2xl mx-auto mt-24">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">How it works</h2>
          <div className="space-y-6">
            {[
              { step: '1', title: 'Create your family profile', desc: 'Tell us about your family, dietary needs, and preferences.' },
              { step: '2', title: 'Join or create a village', desc: 'Connect with trusted families in your neighborhood via invite code.' },
              { step: '3', title: 'Cook and share', desc: 'Post meals when you cook extra. Reserve portions when others cook.' },
              { step: '4', title: 'Pick up and enjoy', desc: 'Grab your reserved meal during the pickup window. Confirm receipt and leave feedback.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-amber-200/50">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
          Village Kitchen — A private meal-sharing network for families
        </div>
      </footer>
    </div>
  )
}
