// app/about/page.tsx
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { Plane, Globe2, Headset, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | HRA Airlines",
  description:
    "Discover HRA Airlines’ mission, values, and commitment to safe, seamless air travel. Learn why millions choose us for their journeys.",
  openGraph: {
    title: "About Us | HRA Airlines",
    description:
      "Discover HRA Airlines’ mission, values, and commitment to safe, seamless air travel. Learn why millions choose us for their journeys.",
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
      "Discover HRA Airlines’ mission, values, and commitment to safe, seamless air travel.",
    images: ["/hra-experience-card.png"],
  },
};

export default function AboutPage() {
  return (
    <main className="bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-10 px-6 py-20">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-pink-600">
              About HRA Airlines
            </h1>
            <p className="text-lg leading-relaxed">
              At HRA Airlines, our passion is connecting people and places with
              comfort, reliability, and innovation. With a modern fleet and
              world-class service, we make travel seamless from booking to
              landing.
            </p>
            <Link
              href="/booking"
              className="inline-block bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-pink-700 hover:to-purple-700 transition"
            >
              Book a Flight
            </Link>
          </div>
          <div className="w-full h-64 sm:h-80 lg:h-96 relative rounded-lg shadow-lg overflow-hidden">
            <Image
              src="/hra-experience-card.png"
              alt="Modern HRA Airlines aircraft"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Why Fly With Us */}
      <section className="bg-gray-100 py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose HRA Airlines?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">
            From state-of-the-art aircraft to 24/7 customer support, discover
            what sets us apart and keeps our passengers flying back.
          </p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <Plane className="w-10 h-10 text-pink-600" />,
                title: "Modern Fleet",
                description:
                  "Experience the latest in comfort and efficiency aboard our cutting-edge aircraft.",
              },
              {
                icon: <Globe2 className="w-10 h-10 text-pink-600" />,
                title: "Global Network",
                description:
                  "Fly to over 200 destinations across six continents with seamless connections.",
              },
              {
                icon: <Shield className="w-10 h-10 text-pink-600" />,
                title: "Safety First",
                description:
                  "Rigorous maintenance and expert training ensure your peace of mind in the sky.",
              },
              {
                icon: <Headset className="w-10 h-10 text-pink-600" />,
                title: "24/7 Support",
                description:
                  "Our dedicated team is here round-the-clock to assist you at every step.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl shadow hover:shadow-md transition"
              >
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-pink-600 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-700 mb-4">
              We believe travel should be seamless, enjoyable, and accessible
              for everyone. Our mission is to connect the world—bringing
              families, businesses, and cultures closer together.
            </p>
            <p className="text-gray-700">
              Every flight, every interaction, every mile—we strive to exceed
              expectations at every step of your journey.
            </p>
          </div>
          <div className="w-full h-64 relative rounded-lg shadow-lg overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1509587584298-0a71bd4662cf?auto=format&fit=crop&w=800&q=80"
              alt="Passengers enjoying in-flight experience"
              fill
              className="object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="bg-gradient-to-br from-pink-600 to-purple-600 text-white py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready for Takeoff?</h2>
        <p className="mb-6 max-w-xl mx-auto">
          Join millions of happy flyers—discover our best fares and book your
          next adventure with HRA Airlines today.
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
