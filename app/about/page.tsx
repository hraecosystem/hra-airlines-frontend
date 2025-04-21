// app/about/page.tsx
import Image from "next/image";
import Link from "next/link";
import { Plane, Globe2, Headset, Shield } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | HRA Airlines",
  description:
    "Learn more about HRA Airlines—our mission, values, and what makes us the world’s favorite way to fly.",
  openGraph: {
    title: "About Us | HRA Airlines",
    description:
      "Learn more about HRA Airlines—our mission, values, and what makes us the world’s favorite way to fly.",
    url: "https://yourdomain.com/about",
    siteName: "HRA Airlines",
    images: [
      {
        url: "/hra-experience-card.png",
        width: 1200,
        height: 630,
        alt: "HRA Airlines fleet",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <main className="bg-gray-50">
      {/* Hero */}
      <section className="relative bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 py-16 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-hra-pink">
              About HRA Airlines
            </h1>
            <p className="text-lg text-gray-700">
              At HRA Airlines, we’re redefining air travel with cutting‑edge service,
              a modern fleet, and an unwavering commitment to your comfort and safety.
            </p>
            <Link
              href="/booking"
              className="inline-block bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-pink-700 hover:to-purple-700 transition"
            >
              Book a Flight
            </Link>
          </div>
          <div className="relative w-full h-64 sm:h-80 lg:h-96 rounded-lg overflow-hidden shadow-lg">
            <Image
              src="/hra-experience-card.png"
              alt="Modern aircraft of HRA Airlines"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-gray-100 py-16 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h2 className="text-3xl font-bold text-hra-dark">Why Fly With HRA?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From our state‑of‑the‑art fleet to 24/7 customer support, discover why millions
            trust HRA Airlines for their journeys.
          </p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mt-8">
            {[
              {
                icon: <Plane className="w-8 h-8 text-hra-pink" />,
                title: "Modern Fleet",
                description:
                  "Fly in comfort on our newest, most efficient aircraft.",
              },
              {
                icon: <Globe2 className="w-8 h-8 text-hra-pink" />,
                title: "Global Reach",
                description:
                  "Over 200 destinations across six continents.",
              },
              {
                icon: <Shield className="w-8 h-8 text-hra-pink" />,
                title: "Safety First",
                description:
                  "Rigorous maintenance and top‑tier training for your peace of mind.",
              },
              {
                icon: <Headset className="w-8 h-8 text-hra-pink" />,
                title: "24/7 Support",
                description: "Round‑the‑clock live assistance whenever you need it.",
              },
            ].map((v, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
              >
                <div className="mb-4">{v.icon}</div>
                <h3 className="text-xl font-semibold text-hra-dark mb-2">
                  {v.title}
                </h3>
                <p className="text-gray-600 text-sm">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl font-bold text-hra-pink mb-4">
              Our Mission
            </h2>
            <p className="text-gray-700 mb-4">
              We believe travel should be seamless, affordable, and enjoyable.
              Every day, we work to connect the world—bringing people closer
              to those they love and the experiences they cherish.
            </p>
            <p className="text-gray-700">
              From booking to boarding, our goal is to exceed your expectations
              at every step of your journey.
            </p>
          </div>
          <div className="h-48 relative rounded-lg overflow-hidden shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1509587584298-0a71bd4662cf?auto=format&fit=crop&w=800&q=80"
              alt="Happy travelers gazing out airplane window"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-pink-600 to-purple-600 text-white py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready for Takeoff?</h2>
        <p className="mb-6 max-w-xl mx-auto">
          Join millions of satisfied flyers—discover our best fares and book your next
          adventure with HRA Airlines today.
        </p>
        <Link
          href="/booking"
          className="inline-block bg-white text-pink-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition"
        >
          Get Started
        </Link>
      </section>
    </main>
  );
}
