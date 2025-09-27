import React, { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

export default function EmployerFeedbackForm({ onClose, alumniId }) {
  const [schema, setSchema] = useState({ sections: [] });
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/feedback-schema")
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.schema) {
          setSchema({ sections: result.schema.sections || [], id: result.schema.id });
        }
      })
      .catch((err) => console.error("❌ Error loading feedback schema:", err));
  }, []);

  const handleChange = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!answers.consent) {
      alert("⚠️ You must agree to the Data Privacy Act Notice before submitting.");
      return;
    }

    try {
      const payload = {
        schema_id: schema?.id || null,
        alumni_id: alumniId, // ✅ Include alumniId in payload
        response: answers,
      };

      const res = await fetch("http://localhost:5000/api/feedback-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        alert("❌ Failed to submit feedback");
      }
    } catch (err) {
      console.error("❌ Error submitting feedback:", err);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 transition-opacity">
      <div className="bg-white w-full max-w-3xl h-[90vh] rounded-2xl shadow-2xl relative flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-4 flex justify-between items-center shadow">
          <h2 className="text-xl font-semibold">Employer Feedback Form</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-lg font-bold">
            ✖
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50">
          {submitted ? (
            <p className="text-green-600 text-lg text-center font-medium">
              ✅ Thank you for your feedback!
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {[...schema.sections].reverse().map((section, sIdx) => (
                <div key={sIdx} className="mb-6 border rounded-lg bg-white shadow-sm p-4">
                  <h3 className="text-lg text-black font-semibold mb-3">{section.title}</h3>

                  {(section.questions || []).map((q, qIdx) => (
                    <div key={qIdx} className="p-4 bg-gray-50 border rounded-lg shadow-sm mb-3">
                      <label className="block mb-2 text-gray-800 font-medium">
                        {q.label} {q.required && <span className="text-red-500">*</span>}
                      </label>

                      {/* Input Types */}
                      {q.type === "text" && (
                        <input
                          type="text"
                          required={q.required}
                          placeholder={`Enter ${q.placeholder || q.label}`}
                          onChange={(e) => handleChange(q.label, e.target.value)}
                          className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 text-black"
                        />
                      )}

                      {q.type === "textarea" && (
                        <textarea
                          required={q.required}
                          placeholder={`Enter ${q.placeholder || q.label}`}
                          onChange={(e) => handleChange(q.label, e.target.value)}
                          className="w-full text-black border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                          rows={3}
                        />
                      )}

                      {q.type === "radio" &&
                        (q.options || []).map((opt, oIdx) => (
                          <label key={oIdx} className="flex items-center text-gray-700 mb-1">
                            <input
                              type="radio"
                              name={q.id}
                              value={opt}
                              required={q.required}
                              onChange={(e) => handleChange(q.id, e.target.value)}
                              className="mr-2"
                            />
                            {opt}
                          </label>
                        ))}

                      {q.type === "checkbox" &&
                        (q.options || []).map((opt, oIdx) => (
                          <label key={oIdx} className="flex items-center text-gray-700 mb-1">
                            <input
                              type="checkbox"
                              value={opt}
                              onChange={(e) => {
                                const current = answers[q.id] || [];
                                if (e.target.checked) {
                                  handleChange(q.id, [...current, opt]);
                                } else {
                                  handleChange(q.id, current.filter((x) => x !== opt));
                                }
                              }}
                              className="mr-2"
                            />
                            {opt}
                          </label>
                        ))}

                      {q.type === "select" && (
                        <select
                          required={q.required}
                          onChange={(e) => handleChange(q.label, e.target.value)}
                          className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select an option</option>
                          {(q.options || []).map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {/* Data Privacy Act Consent */}
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <label className="flex items-center text-gray-800 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    onChange={(e) => handleChange("consent", e.target.checked)}
                    className="mr-2 accent-indigo-600"
                  />
                  I agree to the Data Privacy Act Notice
                </label>

                {answers.consent && (
                  <div className="mt-3 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-gray-700">
                    <div className="flex items-center mb-2 text-indigo-700">
                      <ShieldCheck size={18} className="mr-2" />
                      <h3 className="font-semibold">Data Privacy Act of 2012 (RA 10173)</h3>
                    </div>
                    <p className="mb-2">
                      The information you provide in this form will be collected and processed solely for the purpose of evaluating the performance of our graduates in the industry.
                    </p>
                    <p className="mb-2">
                      All responses will be kept strictly confidential and will be used only for academic research, institutional development, and quality assurance purposes. Data will not be shared with unauthorized third parties.
                    </p>
                    <p>
                      By ticking this box, you voluntarily give consent to the collection and processing of your data in accordance with the Data Privacy Act of 2012.
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium shadow-md"
              >
                Submit Feedback
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
