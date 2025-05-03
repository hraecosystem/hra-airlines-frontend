// app/about/page.tsx
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { Plane, Globe2, Headset, Shield, Users, Award, Clock, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | HRA Airlines",
  description:
    "Discover HRA Airlines' mission, values, and commitment to safe, seamless air travel. Learn why millions choose us for their journeys.",
  openGraph: {
    title: "About Us | HRA Airlines",
    description:
      "Discover HRA Airlines' mission, values, and commitment to safe, seamless air travel. Learn why millions choose us for their journeys.",
    url: "https://www.hra-airlines.com/about",
    siteName: "HRA Airlines",
    images: [
      {
        url: "/hra-experience-card.png",
        width: 1200,
        height: 630,
        alt: "HRA Airlines modern fleet",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | HRA Airlines",
    description:
      "Discover HRA Airlines' mission, values, and commitment to safe, seamless air travel.",
    images: ["/hra-experience-card.png"],
  },
};

export default function AboutPage() {
  return (
    <main className="bg-gray-50 text-gray-800">
      {/* Hero Section with Parallax */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1920&q=80"
            alt="Beautiful vacation destination with mountains and lake"
            fill
            className="object-cover transform scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        </div>
        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 animate-fade-in">
            About HRA Airlines
          </h1>
          <p className="text-xl sm:text-2xl mb-8 animate-fade-in-up">
            Connecting the world with comfort, reliability, and innovation
          </p>
          <Link
            href="/booking"
            className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition transform hover:scale-105"
          >
            Book a Flight
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <Users className="w-8 h-8 text-blue-600" />, value: "50K+", label: "Happy Passengers" },
              { icon: <Globe2 className="w-8 h-8 text-blue-600" />, value: "25+", label: "Destinations" },
              { icon: <Award className="w-8 h-8 text-blue-600" />, value: "3+", label: "Years of Excellence" },
              { icon: <Star className="w-8 h-8 text-blue-600" />, value: "4.2/5", label: "Customer Rating" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
                <div className="mb-4 flex justify-center">{stat.icon}</div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Fly With Us */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose HRA Airlines?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From state-of-the-art aircraft to 24/7 customer support, discover
              what sets us apart and keeps our passengers flying back.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <Plane className="w-12 h-12 text-blue-600" />,
                title: "Modern Fleet",
                description:
                  "Experience the latest in comfort and efficiency aboard our cutting-edge aircraft.",
              },
              {
                icon: <Globe2 className="w-12 h-12 text-blue-600" />,
                title: "Global Network",
                description:
                  "Fly to over 200 destinations across six continents with seamless connections.",
              },
              {
                icon: <Shield className="w-12 h-12 text-blue-600" />,
                title: "Safety First",
                description:
                  "Rigorous maintenance and expert training ensure your peace of mind in the sky.",
              },
              {
                icon: <Headset className="w-12 h-12 text-blue-600" />,
                title: "24/7 Support",
                description:
                  "Our dedicated team is here round-the-clock to assist you at every step.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <div className="mb-6">{item.icon}</div>
                <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-blue-600 mb-6">
                  Our Mission
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  We believe travel should be seamless, enjoyable, and accessible
                  for everyone. Our mission is to connect the world—bringing
                  families, businesses, and cultures closer together.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Every flight, every interaction, every mile—we strive to exceed
                  expectations at every step of your journey.
                </p>
              </div>
              <div className="flex gap-4">
                <Link
                  href="/destinations"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Explore Destinations
                </Link>
                <Link
                  href="/contact"
                  className="inline-block border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition"
                >
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="w-full h-64 relative rounded-lg overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80"
                    alt="Passengers enjoying in-flight experience"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="w-full h-48 relative rounded-lg overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80"
                    alt="Modern aircraft interior"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="w-full h-48 relative rounded-lg overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=800&q=80"
                    alt="Cabin crew providing service"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="w-full h-64 relative rounded-lg overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80"
                    alt="Airport terminal view"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="relative py-32 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 opacity-90" />
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready for Takeoff?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join millions of happy flyers—discover our best fares and book your
            next adventure with HRA Airlines today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="inline-block bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition transform hover:scale-105"
            >
              Book Now
            </Link>
            <Link
              href="/offers"
              className="inline-block border-2 border-white text-white font-semibold px-8 py-4 rounded-lg hover:bg-white/10 transition transform hover:scale-105"
            >
              View Special Offers
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
