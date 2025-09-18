"use client";

export default function EducationPage() {
  const fakeEducation = [
    {
      degree: "PhD in Procrastination",
      school: "University of Tomorrow (Maybe)",
      year: "2025 (Probably)",
      description: "Specialized in 'I'll do it later' techniques and advanced time-wasting methodologies. Thesis: 'The Art of Napping Through Deadlines'"
    },
    {
      degree: "Master of Memeology",
      school: "Internet Academy of Fine Arts",
      year: "2020",
      description: "Focused on advanced meme creation, viral content strategies, and the philosophical implications of 'dank' vs. 'normie' memes."
    },
    {
      degree: "Bachelor of Netflix & Chill",
      school: "Couch University",
      year: "2018",
      description: "Majored in Binge Watching with a minor in Snack Preparation. Graduated with honors (honestly, I napped through the ceremony)."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
          My Questionable Education
        </h1>
        
        <div className="space-y-8">
          {fakeEducation.map((edu, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{edu.degree}</h2>
                  <p className="text-lg text-blue-600">{edu.school}</p>
                </div>
                <span className="mt-2 md:mt-0 bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full self-start">
                  {edu.year}
                </span>
              </div>
              <p className="mt-4 text-gray-600">{edu.description}</p>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, 80 + Math.random() * 20)}%` }}
                  ></div>
                </div>
                <p className="text-right text-sm text-gray-500 mt-1">
                  {Math.floor(80 + Math.random() * 20)}% Useless Knowledge
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-xl text-center border-2 border-dashed border-blue-200">
          <h3 className="text-2xl font-bold text-blue-600 mb-4">🎓 Fun Fact</h3>
          <p className="text-gray-600 mb-4">
            Did you know? 87% of statistics are made up on the spot, including this one!
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-full font-bold hover:opacity-90 transition">
            Teach Me Something Real
          </button>
        </div>
      </div>
    </div>
  );
}
