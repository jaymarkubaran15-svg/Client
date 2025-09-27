import React, { useState, useEffect } from "react";
import axios from "axios";
import NavLink from "./linkbar";
import bg from "../src/assets/images/bg.png";
import EmployerFeedbackForm from "./Efeedback";

export default function AlumniList() {
  const [alumniData, setAlumniData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/users")
      .then((res) => setAlumniData(res.data))
      .catch((err) => console.error("Error fetching alumni:", err));
  }, []);

  const filteredAlumni = alumniData.filter(
    (alumni) =>
      alumni.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      alumni.course?.toLowerCase().includes(search.toLowerCase()) ||
      alumni.year_graduate?.toString().includes(search) ||
      alumni.work_title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center animate-background z-0"
        style={{ backgroundImage: `url(${bg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-500 to-transparent opacity-70 animate-gradient" />

      {/* Navbar */}
      <NavLink />

      {/* Content */}
      <main className="relative z-10 flex flex-col items-center px-6 md:px-10 lg:px-24 pt-28 pb-16 w-full mt-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 animate-glow">
          🎓 Alumni <span className="text-blue-300">Profiles</span>
        </h1>

        {/* Search */}
        <input
          type="text"
          placeholder="Search alumni..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-lg p-3 mb-8 border rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/90"
        />

        {/* Alumni Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-6xl">
          {filteredAlumni.length > 0 ? (
            filteredAlumni.map((alumni) => (
              <div
                key={alumni.id}
                className="bg-gradient-to-br from-blue-900 to-blue-700 p-5 rounded-xl shadow-lg flex flex-col items-center text-center text-white hover:scale-105 transition duration-300 cursor-pointer"
                onClick={() => setSelectedAlumni(alumni)}
              >
                <img
                  src={
                    alumni.profile ||
                    "https://ui-avatars.com/api/?name=" +
                      encodeURIComponent(alumni.first_name)
                  }
                  alt={alumni.first_name}
                  className="w-20 h-20 rounded-full border-4 border-blue-500 mb-3"
                />
                <h2 className="text-lg font-bold">{alumni.first_name}</h2>
                <p className="text-gray-200 text-sm">{alumni.course}</p>
                <p className="text-gray-300 text-sm">
                  Batch {alumni.year_graduate}
                </p>
                <p className="text-blue-200 font-medium">
                  {alumni.work_title || "No work title"}
                </p>

                {/* Feedback Button */}
                <button
                  className="mt-3 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAlumni(alumni);
                    setShowFeedbackForm(true);
                  }}
                >
                  Give Feedback
                </button>
              </div>
            ))
          ) : (
            <p className="text-white col-span-3 text-center">
              No alumni found.
            </p>
          )}
        </div>
      </main>

      {/* Profile Modal */}
      {selectedAlumni && !showFeedbackForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-gradient-to-br from-blue-900 to-blue-700 w-full max-w-lg rounded-xl p-6 shadow-xl relative text-white">
            <button
              onClick={() => setSelectedAlumni(null)}
              className="absolute top-3 right-3 text-gray-200 hover:text-white text-xl"
            >
              ✖
            </button>
            <div className="flex flex-col items-center">
              <img
                src={
                  selectedAlumni.profile ||
                  "https://ui-avatars.com/api/?name=" +
                    encodeURIComponent(selectedAlumni.first_name)
                }
                alt={selectedAlumni.first_name}
                className="w-28 h-28 rounded-full mb-4 border-4 border-blue-400"
              />
              <h2 className="text-2xl font-bold mb-1">
                {selectedAlumni.first_name}
              </h2>
              <p className="text-gray-200">{selectedAlumni.course}</p>
              <p className="text-gray-300 mb-2">
                Batch {selectedAlumni.year_graduate}
              </p>
              <p className="text-blue-200 font-medium">
                {selectedAlumni.work_title}
              </p>
              <p className="text-gray-300 mt-2">📧 {selectedAlumni.email}</p>

              <button
                className="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFeedbackForm(true);
                }}
              >
                Give Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackForm && selectedAlumni && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-white w-full max-w-3xl h-[90vh] rounded-xl shadow-xl relative">
            <EmployerFeedbackForm
              onClose={() => setShowFeedbackForm(false)}
              alumniId={selectedAlumni.id}   // ✅ Pass alumniId
              alumniName={selectedAlumni.first_name} // ✅ Optional: show name in form
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 bg-black/70 text-white text-center py-4 mt-auto">
        <p className="text-sm opacity-75">
          © {new Date().getFullYear()} MemoTrace. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
