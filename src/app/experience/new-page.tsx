"use client";

export default function ExperiencePage() {
  const fakeJobs = [
    {
      title: "Chief Meme Officer",
      company: "Internet Fun Department",
      period: "2010 - Present",
      description: "Responsible for keeping the internet spicy with fresh memes and ensuring all employees maintain at least 3.6 roentgens of humor."
    },
    {
      title: "Professional Couch Tester",
      company: "Sofa King Good Beds",
      period: "2015 - 2020",
      description: "Tested various couches for optimal napping conditions. Specialized in the 'I'll just rest my eyes for a minute' technique."
    },
    {
      title: "Snack Tasting Specialist",
      company: "Munchies R Us",
      period: "2012 - 2015",
      description: "Ensured all snacks met the highest standards of deliciousness. Gained 15 pounds for the job (it was a sacrifice I was willing to make)."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
          My Totally Legit Experience
        </h1>
        
        <div className="space-y-8">
          {fakeJobs.map((job, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{job.title}</h2>
                  <p className="text-lg text-purple-600">{job.company}</p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                  {job.period}
                </span>
              </div>
              <p className="mt-4 text-gray-600">{job.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Procrastination', 'Snack Finding', 'Napping', 'Netflix Binging'].map((skill) => (
                  <span 
                    key={skill}
                    className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-pink-50 rounded-xl text-center">
          <h3 className="text-2xl font-bold text-pink-600 mb-4">Want to see my real experience?</h3>
          <p className="text-gray-600 mb-4">That would be too mainstream. Let&apos;s keep things interesting!</p>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold hover:opacity-90 transition">
            Hire Me Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
