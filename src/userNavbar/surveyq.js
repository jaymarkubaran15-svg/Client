import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function GTSPage({ onSurveySubmit }) {
  const [schema, setSchema] = useState({ sections: [] });
  const [data, setData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
   const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("ched_gts_dynamic");
    if (saved) setData(JSON.parse(saved));
  }, []);

  // ✅ Session & role check
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/session", {
          method: "GET",
          credentials: "include", // Include cookies
        });

        const data = await response.json();

        if (response.ok && data.user) {
          setUser(data.user);

          if (data.user.role === "admin") {
            navigate("/dashboard"); // ✅ Admin
          } 
        } else {
          navigate("/login"); // 🚪 Not logged in
        }
      } catch (error) {
        console.error("Session check failed:", error);
      }
    };

    checkSession();
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("ched_gts_dynamic", JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    fetch("http://localhost:5000/api/survyschema")
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.schema) {
          const fixed = {
            ...result.schema,
            sections: (result.schema.sections || []).map((sec) => ({
              ...sec,
              fields: sec.fields || [],
            })),
          };
          setSchema(fixed);
        } else {
          setSchema({ sections: [] });
        }
      })
      .catch((err) => {
        console.error("❌ Error loading schema:", err);
        setSchema({ sections: [] });
      });
  }, []);

  const onSubmit = async (e) => {
  e.preventDefault();

  if (!validate()) return; // ✅ Only proceed if valid
  setSubmitted(true);

  try {
    const res = await fetch("http://localhost:5000/api/submitsurvey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ✅ keeps session cookies
      body: JSON.stringify(data),
    });

    if (res.ok) {
      Swal.fire({
        title: "Thank You",
        text: "Survey submitted successfully!",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        // ✅ After user clicks OK → go home
        navigate("/userhome");
        if (onSurveySubmit) onSurveySubmit();
      });
    } else {
      Swal.fire({
        title: "Error",
        text: "Failed to submit survey!",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  } catch (err) {
    console.error("Error submitting survey:", err);
    Swal.fire({
      title: "Error",
      text: "An error occurred while submitting the survey.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
};


 const update = (label, val) =>
  setData((prev) => ({ ...prev, [label]: val }));


  const validate = () => {
    const e = {};
    schema.sections.forEach((s) => {
      s.fields.forEach((f) => {
        if (f.required && shouldShowField(f) && !data[f.label])
          e[f.label] = `${f.label} is required`;
      });
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const shouldShowField = (field) => {
    if (!field.showWhen) return true;
    return data[field.showWhen.label] === field.showWhen.equals;
  };

  const RenderField = ({ field, number }) => {
    if (!shouldShowField(field)) return null;
    const value = data[field.label] || "";
  const err = errors[field.label];

    if (field.type === "radio") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <label className="block text-base font-semibold text-gray-800 mb-3">
            {number}. {field.label}
            {field.required && <span className="text-red-600"> *</span>}
          </label>
          <div className="flex flex-wrap gap-3">
            {(field.options || []).map((o, i) => (
              <label
                key={i}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition ${
                  value === o
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "border-gray-300 bg-white hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name={field.label}
                  value={o}
                  checked={value === o}
                  onChange={(e) => update(field.label, e.target.value)}
                  className="hidden"
                />
                <span>{o}</span>
              </label>
            ))}
          </div>
          {submitted && err && (
            <p className="text-sm text-red-600 mt-2">{err}</p>
          )}
        </motion.div>
      );
    }

    if (field.type === "checkbox") {
      const values = Array.isArray(value) ? value : [];
      const selected = new Set(values);

      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <label className="block text-base font-semibold text-gray-800 mb-3">
            {number}. {field.label}
            {field.required && <span className="text-red-600"> *</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {(field.options || []).map((o, i) => {
              const isOthers = String(o).toLowerCase() === "others";
              const othersLabel = `${field.label} (Others)`;
              return (
                <div key={i}>
                  <label
                     className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition ${
                      selected.has(o)
                           ? "bg-indigo-600 text-white border-indigo-600"
                           : "border-gray-300 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={o}
                      checked={selected.has(o)}
                      onChange={(e) => {
                        const set = new Set(selected);
                        e.target.checked ? set.add(o) : set.delete(o);
                        update(field.label, Array.from(set));
                      }}
                      className="hidden"
                    />
                    <span>{o}</span>
                  </label>
                  {isOthers && selected.has(o) && (
                    <input
                      type="text"
                      placeholder="Please specify"
                      value={data?.[othersLabel]|| ""}
                      onChange={(e) => update(othersLabel, e.target.value)}
                      className="mt-3 ml-6 border border-gray-300 rounded-lg px-4 py-2 text-sm w-72 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  )}
                </div>
              );
            })}
          </div>
          {submitted && err && (
            <p className="text-sm text-red-600 mt-2">{err}</p>
          )}
        </motion.div>
      );
    }

    return null;
  };

  // ✅ Progress indicator
  const completedFields = Object.keys(data).length;
  const totalFields = schema.sections.reduce(
    (acc, sec) => acc + (sec.fields?.length || 0),
    0
  );
  const progress = totalFields ? (completedFields / totalFields) * 100 : 0;

  return (
  <div className="w-full h-screen flex flex-col max-w-5xl mx-auto rounded-2xl overflow-hidden bg-white/70 backdrop-blur-md shadow-2xl items-center justify-start bg-gray-100">
    <div className="w-full max-w-5xl flex flex-col rounded-2xl overflow-hidden bg-white/70 backdrop-blur-md shadow-2xl h-full">
      {/* Header */}
      <div className="bg-indigo-600/90 text-white py-6 px-6 sm:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-100">
          🎓 Alumni Information Survey
        </h2>
        <p className="text-base text-gray-200 bg-gray-100/30 p-4 rounded-lg">
          Please take a few moments to fill out this form truthfully. Your
          responses will help us gain a better understanding of alumni
          experiences, allowing us to improve future programs and initiatives.
          Your feedback is highly valued and greatly appreciated!
        </p>
      </div>

      {/* Progress */}
      <div className="w-full bg-gray-200 h-2">
        <div
          className="bg-indigo-600 h-2 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-right pr-6 text-xs text-gray-500 mt-1">
        {Math.round(progress)}% complete
      </p>

      {/* Scrollable Form */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <form onSubmit={onSubmit}>
          {schema.sections.map((sec, sIdx) => {
            let fieldCounter = 0;
            return (
              <motion.section
                key={sIdx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-6 sm:mb-10 border border-gray-200 p-4 sm:p-6 rounded-xl bg-white/60 backdrop-blur-sm"
              >
                <h2 className="text-md sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-5">
                  {sIdx + 1}. {sec.title}
                </h2>
                {sec.fields?.map((f, fIdx) => (
                  <RenderField
                    key={f.key || fIdx}
                    field={f}
                    number={++fieldCounter}
                  />
                ))}
              </motion.section>
            );
          })}

          {/* Sticky Submit Button */}
          <div className="flex justify-center sticky bottom-0 bg-white/70 backdrop-blur-sm py-3 sm:py-4 border-t rounded-b-2xl">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 sm:px-10 py-2 sm:py-3 rounded-lg text-base sm:text-lg font-semibold shadow-lg transition-all transform hover:scale-105"
            >
              Submit Survey
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
);

}
