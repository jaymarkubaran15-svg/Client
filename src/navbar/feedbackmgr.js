import Sidebar from "../navbar/sidebar";
import React, { useState, useEffect } from "react";
import { Trash2, Save, PlusCircle, FolderPlus } from "lucide-react";
import Swal from "sweetalert2";


export default function AdminFeedbackTable() {
  const [schema, setSchema] = useState({ sections: [] });
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`http://${process.env.REACT_APP_API_URL}/api/feedback-schema`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.schema) {
          setSchema({ sections: result.schema.sections || [] });
        }
      })
      .catch((err) => console.error("❌ Error loading schema:", err));
  }, []);

  const persistSchema = async (updatedSchema) => {
  try {
    // 🔹 Clean up options before saving
    const cleanedSchema = {
      ...updatedSchema,
      sections: updatedSchema.sections.map((section) => ({
        ...section,
        questions: section.questions.map((q) => ({
          ...q,
          options: q.options.filter((opt) => opt.trim() !== ""), // remove empty
        })),
      })),
    };

    const res = await fetch(`http://${process.env.REACT_APP_API_URL}/api/feedback-schema`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanedSchema),
    });
    const result = await res.json();
    if (!result.success) throw new Error("Failed to save schema");
  } catch (err) {
    console.error("❌ Error saving schema:", err);
  }
};

/* --- Section management --- */
const addSection = () => {
  setSchema((prev) => {
    const next = { ...prev };
    // Prepend the new section instead of pushing it
    next.sections = [
      {
        title: `New Section ${next.sections.length + 1}`,
        questions: [],
      },
      ...next.sections,
    ];
    persistSchema(next);
    return next;
  });
};


  const updateSectionTitle = (sIdx, val) => {
    setSchema((prev) => {
      const next = { ...prev };
      next.sections[sIdx].title = val;
      persistSchema(next);
      return next;
    });
  };

const removeSection = (sIdx) => {
  Swal.fire({
    title: "Are you sure?",
    text: "This will delete the entire section and its questions.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      setSchema((prev) => {
        const next = { ...prev };
        next.sections = next.sections.filter((_, i) => i !== sIdx);
        persistSchema(next);
        return next;
      });
      Swal.fire("Deleted!", "Section has been removed.", "success");
    }
  });
};

  /* --- Question management --- */
  const addQuestion = (sIdx) => {
    setSchema((prev) => {
      const next = { ...prev };
      next.sections[sIdx].questions.push({
        label: "",
        type: "text",
        required: false,
        options: [],
      });
      persistSchema(next);
      return next;
    });
  };

  const updateQuestion = (sIdx, qIdx, key, val) => {
    setSchema((prev) => {
      const next = { ...prev };
      next.sections[sIdx].questions[qIdx][key] = val;
      persistSchema(next);
      return next;
    });
  };

 const removeQuestion = (sIdx, qIdx) => {
  Swal.fire({
    title: "Remove this question?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, remove it!",
  }).then((result) => {
    if (result.isConfirmed) {
      setSchema((prev) => {
        const next = { ...prev };
        next.sections[sIdx].questions = next.sections[sIdx].questions.filter(
          (_, i) => i !== qIdx
        );
        persistSchema(next);
        return next;
      });
      Swal.fire("Removed!", "Question has been deleted.", "success");
    }
  });
};


  const addOption = (sIdx, qIdx) => {
    setSchema((prev) => {
      const next = { ...prev };
      next.sections[sIdx].questions[qIdx].options.push("");
      persistSchema(next);
      return next;
    });
  };

  const updateOption = (sIdx, qIdx, oIdx, val) => {
    setSchema((prev) => {
      const next = { ...prev };
      next.sections[sIdx].questions[qIdx].options[oIdx] = val;
      persistSchema(next);
      return next;
    });
  };

 const saveSchema = async () => {
  try {
    await persistSchema(schema);
    Swal.fire({
      icon: "success",
      title: "Saved!",
      text: "Feedback schema saved successfully.",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: err.message || "Failed to save schema.",
    });
  }
};


  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 min-h-screen p-6 md:ml-64">
        <h1 className="text-2xl font-bold mb-6">Feedback Questions Builder</h1>
      
       <div className="mt-4 flex justify-between">
        {/* Add Section Button */}
        <button
          onClick={addSection}
          className="flex items-center gap-2 px-5 py-2 mb-6 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
        >
          <FolderPlus size={16} /> Add Section
        </button>
        
         {/* Save All Changes */}
 
          <button
            onClick={saveSchema}
            className="flex items-center gap-2 px-5 py-2 mb-6 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Save size={18} /> Save Changes
          </button>
        </div>

        {/* Search input */}
        <input
          type="text"
          placeholder="Search by section or question..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-6"
        />

        {schema.sections
  .filter(
    (section) =>
      section.title.toLowerCase().includes(search.toLowerCase()) ||
      section.questions.some((q) =>
        q.label.toLowerCase().includes(search.toLowerCase())
      )
  )
  .map((section, sIdx) => {
    const filteredQuestions = section.questions.filter((q) =>
      q.label.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <div key={sIdx} className="mb-8 bg-white shadow-md rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            value={section.title}
            placeholder={`Section ${sIdx + 1} Title`}
            onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
            className="border rounded px-3 py-2 w-full mr-2"
          />
          <div className="flex gap-2">
            <button
              onClick={() => addQuestion(sIdx)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
            >
              <PlusCircle size={16} /> Add Question
            </button>
            <button
              onClick={() => removeSection(sIdx)}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
            >
              <Trash2 size={16} /> Remove Section
            </button>
          </div>
        </div>

        {filteredQuestions.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-3 py-2">Question</th>
                <th className="border px-3 py-2">Type</th>
                <th className="border px-3 py-2">Required</th>
                <th className="border px-3 py-2">Options</th>
                <th className="border px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.map((q, qIdx) => (
                <tr key={qIdx} className="hover:bg-gray-100">
                  <td className="border px-3 py-2">
                    <input
                      type="text"
                      value={q.label}
                      placeholder="Question label"
                      onChange={(e) =>
                        updateQuestion(sIdx, qIdx, "label", e.target.value)
                      }
                      className="w-full border px-2 py-1 rounded"
                    />
                  </td>
                  <td className="border px-3 py-2">
                    <select
                      value={q.type}
                      onChange={(e) =>
                        updateQuestion(sIdx, qIdx, "type", e.target.value)
                      }
                      className="w-full border px-2 py-1 rounded"
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Textarea</option>
                      <option value="radio">Radio</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="select">Select</option>
                    </select>
                  </td>
                  <td className="border px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={q.required || false}
                      onChange={(e) =>
                        updateQuestion(sIdx, qIdx, "required", e.target.checked)
                      }
                    />
                  </td>
                  <td className="border px-3 py-2">
                    {(q.type === "radio" ||
                      q.type === "checkbox" ||
                      q.type === "select") && (
                      <div className="flex flex-col gap-1">
                        {q.options.map((opt, oIdx) => (
                          <input
                            key={oIdx}
                            type="text"
                            value={opt}
                            placeholder={`Option ${oIdx + 1}`}
                            onChange={(e) =>
                              updateOption(sIdx, qIdx, oIdx, e.target.value)
                            }
                            className="w-full border px-2 py-1 rounded"
                          />
                        ))}
                        <button
                          onClick={() => addOption(sIdx, qIdx)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm mt-1"
                        >
                          + Add Option
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="border px-3 py-2 text-center">
                    <button
                      onClick={() => removeQuestion(sIdx, qIdx)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1 mx-auto"
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center py-4 text-gray-500">
            {section.title.toLowerCase().includes(search.toLowerCase())
              ? "No questions in this section."
              : "No questions match your search."}
          </p>
        )}
      </div>
    );
  })}

{schema.sections.filter(
  (section) =>
    section.title.toLowerCase().includes(search.toLowerCase()) ||
    section.questions.some((q) =>
      q.label.toLowerCase().includes(search.toLowerCase())
    )
).length === 0 && (
  <p className="text-center py-6 text-gray-500">
    No sections or questions match your search.
  </p>
)}


       
      </div>
    </div>
  );
}
