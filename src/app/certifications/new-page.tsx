"use client";

export default function CertificationsPage() {
  const fakeCerts = [
    {
      title: "Certified Professional Couch Potato",
      issuer: "International Association of Professional Loungers",
      date: "Issued: Every Sunday",
      description: "Expert level in binge-watching TV shows and finding the most comfortable spot on the couch.",
      badge: "🛋️"
    },
    {
      title: "Master of Dad Jokes",
      issuer: "Pun-Intended University",
      date: "Issued: 2022",
      description: "Specialized in eye-rolling humor and puns so bad they're good. Warning: May cause groans.",
      badge: "😆"
    },
    {
      title: "Certified Coffee Connoisseur",
      issuer: "Bean There, Drunk That Institute",
      date: "Issued: 2021",
      description: "Can identify coffee beans by smell alone. Also, I'm not addicted - I can quit anytime I want!",
      badge: "☕"
    },
    {
      title: "Professional Cat Herder",
      issuer: "Feline Management Association",
      date: "Issued: 2020",
      description: "Special skills include: Finding lost hair ties, opening doors on command, and being a human pillow.",
      badge: "🐱"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-red-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
          My Questionable Credentials
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fakeCerts.map((cert, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-l-4 border-orange-500"
            >
              <div className="flex items-start">
                <div className="text-4xl mr-4">{cert.badge}</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{cert.title}</h2>
                  <p className="text-sm text-orange-600">{cert.issuer}</p>
                  <p className="text-xs text-gray-500 mt-1">{cert.date}</p>
                  <p className="mt-3 text-gray-600">{cert.description}</p>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      {Math.floor(80 + Math.random() * 20)}% Legit
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-center text-white">
          <h3 className="text-2xl font-bold mb-4">🚀 Want a Real Certification?</h3>
          <p className="mb-6">These might not be real, but my skills are! Check out my actual work or get in touch.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-6 py-3 bg-white text-orange-600 rounded-full font-bold hover:bg-gray-100 transition">
              View My Real Work
            </button>
            <button className="px-6 py-3 border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition">
              Contact Me
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Disclaimer: These certifications are 100% made up. But wouldn&apos;t it be fun if they were real? 😉</p>
        </div>
      </div>
    </div>
  );
}
