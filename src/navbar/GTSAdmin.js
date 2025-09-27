import React, { useState, useEffect } from "react";
import { PlusCircle, Save, Trash2 } from "lucide-react";
import Sidebar from "./sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";


export default function GTSPage() {
  const [schema, setSchema] = useState({ sections: [] });
  const [data, setData] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const isSurveyActive = location.pathname === "/gtsadmin";

  useEffect(() => {
    const saved = localStorage.getItem("ched_gts_dynamic");
    if (saved) setData(JSON.parse(saved));
  }, []);

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
        } else setSchema({ sections: [] });
      })
      .catch((err) => {
        console.error("❌ Error loading schema:", err);
        setSchema({ sections: [] });
      });
  }, []);

  const persistSchema = async (schemaToSave) => {
  try {
    await fetch("http://localhost:5000/api/survyschema", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(schemaToSave),
    });

    Swal.fire({
      icon: "success",
      title: "Saved!",
      text: "Schema saved successfully.",
      showConfirmButton: false,
      timer: 1500,
    });
  } catch (err) {
    console.error("❌ Failed to save schema:", err);
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Failed to save schema. Check console for details.",
    });
  }
};


  const toggleSection = (sIdx) => {
    setExpandedSections((prev) => ({ ...prev, [sIdx]: !prev[sIdx] }));
  };

  const updateField = (sIdx, fIdx, key, val) => {
    setSchema((prev) => {
      const next = { ...prev };
      next.sections[sIdx].fields[fIdx] = { ...next.sections[sIdx].fields[fIdx], [key]: val };
      return next;
    });
  };

  const addField = (sIdx) => {
    setSchema((prev) => {
      const next = { ...prev };
      const count = next.sections[sIdx].fields.length + 1;
      const sectionKey = next.sections[sIdx].title.toLowerCase().replace(/\s+/g, "");
      next.sections[sIdx].fields.push({
        key: `${sectionKey}_field${count}`,
        label: `Field ${count}`,
        type: "text",
        options: [],
        columnLabels: [],
        rowLabels: [],
        tableData: [],
      });
      return next;
    });
  };

  const removeField = (sIdx, fIdx) => {
    setSchema((prev) => {
      const next = { ...prev };
      next.sections[sIdx].fields = next.sections[sIdx].fields.filter((_, i) => i !== fIdx);
      return next;
    });
  };

  const addSection = () => {
    setSchema((prev) => ({
      ...prev,
      sections: [...prev.sections, { title: `Section ${prev.sections.length + 1}`, fields: [] }],
    }));
  };

  const removeSection = (sIdx) => {
  Swal.fire({
    title: "Are you sure?",
    text: "This section and its fields will be deleted.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      setSchema((prev) => ({
        ...prev,
        sections: prev.sections.filter((_, i) => i !== sIdx),
      }));
      Swal.fire("Deleted!", "Section has been removed.", "success");
    }
  });
};


  const addOption = (sIdx, fIdx) => {
    setSchema((prev) => {
      const next = { ...prev };
      const f = { ...next.sections[sIdx].fields[fIdx] };
      f.options = [...(f.options || []), `Option ${(f.options || []).length + 1}`];
      next.sections[sIdx].fields[fIdx] = f;
      return next;
    });
  };

  const updateOption = (sIdx, fIdx, oIdx, val) => {
    setSchema((prev) => {
      const next = { ...prev };
      next.sections[sIdx].fields[fIdx].options[oIdx] = val;
      return next;
    });
  };

  // Filter sections based on search
  const filteredSections = schema.sections.filter((sec) => {
    const secMatch = sec.title.toLowerCase().includes(searchQuery.toLowerCase());
    const fieldMatch = sec.fields.some((f) =>
      (f.label || f.key || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
    return secMatch || fieldMatch;
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 min-h-screen p-6 md:ml-64">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Survey Form Builder</h1>
  <div className="flex justify-between mt-10">
            <button
              onClick={addSection}
              className="flex items-center gap-2 px-5 py-2 mb-6 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition"
            >
              <PlusCircle size={16} /> Add Section
            </button>
            <button
              onClick={() => persistSchema(schema)}
              className="flex items-center gap-2 px-6 py-2 mb-6 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md transition"
            >
              <Save size={18} /> Save Changes
            </button>
          </div>

          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search section or question..."
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {filteredSections.map((sec, sIdx) => {
            const isExpanded = expandedSections[sIdx] || false;
            return (
              <div key={sIdx} className="mb-4 border rounded p-4 bg-white shadow-sm">
                <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection(sIdx)}>
                  <button
                    onClick={() => removeSection(sIdx)}
                    className="text-red-600 flex items-center gap-1 hover:text-red-800 text-sm"
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                  <h2 className="font-semibold text-gray-700">
                    Section {sIdx + 1}: {sec.title}
                  </h2>
                  <span>{isExpanded ? "▼" : "▶"}</span>
                </div>

                {isExpanded && (
                  <div className="mt-3">
                    <input
                      value={sec.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSchema((prev) => {
                          const next = { ...prev };
                          next.sections[sIdx] = { ...next.sections[sIdx], title: val };
                          return next;
                        });
                      }}
                      className="w-full border rounded px-3 py-2 mb-2 focus:ring-2 focus:ring-indigo-400"
                    />

                    {sec.fields.map((f, fIdx) => (
                      <div key={fIdx} className="border rounded p-2 mb-2 bg-gray-50">
                        <p>{f.label || f.key || `Field ${fIdx + 1}`}</p>
                        <input
                          value={f.label}
                          placeholder="Label"
                          onChange={(e) => updateField(sIdx, fIdx, "label", e.target.value)}
                          className="w-full border rounded px-3 py-2 mb-2 focus:ring-2 focus:ring-indigo-400"
                        />
                        <input
                          value={f.key}
                          placeholder="Key"
                          onChange={(e) => updateField(sIdx, fIdx, "key", e.target.value)}
                          className="w-full border rounded px-3 py-2 mb-2 focus:ring-2 focus:ring-indigo-400"
                        />

                        <div className="relative">
                          <select
                            value={f.type}
                            onChange={(e) => updateField(sIdx, fIdx, "type", e.target.value)}
                            className="w-full border rounded px-3 py-2 pr-10 bg-white appearance-none focus:ring-2 focus:ring-indigo-400"
                          >
                            <option value="text">Text</option>
                            <option value="email">Email</option>
                            <option value="date">Date</option>
                            <option value="select">Select</option>
                            <option value="radio">Radio</option>
                            <option value="checkbox">Checkbox</option>
                            <option value="checkbox-matrix">Matrix Checkbox</option>
                            <option value="multiple">Multiple Inputs</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-3 mb-2">
                          <label className="inline-flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={f.required || false}
                              onChange={(e) => updateField(sIdx, fIdx, "required", e.target.checked)}
                            />{" "}
                            Required
                          </label>
                          <button
                            type="button"
                            onClick={() => removeField(sIdx, fIdx)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove Field
                          </button>
                        </div>

                        {(f.type === "select" || f.type === "radio" || f.type === "checkbox") && (
                          <div className="mt-2">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Options:</p>
                            {(f.options || []).map((opt, oIdx) => (
                              <input
                                key={oIdx}
                                type="text"
                                value={opt}
                                onChange={(e) => updateOption(sIdx, fIdx, oIdx, e.target.value)}
                                placeholder={`Option ${oIdx + 1}`}
                                className="border rounded px-2 py-1 mb-1 w-full focus:ring-2 focus:ring-indigo-400"
                              />
                            ))}
                            <button
                              onClick={() => addOption(sIdx, fIdx)}
                              type="button"
                              className="mt-2 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm"
                            >
                              <PlusCircle size={16} /> Add Option
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      onClick={() => addField(sIdx)}
                      className="mt-2 text-green-600 hover:text-green-800 flex items-center gap-1"
                    >
                      <PlusCircle size={16} /> Add Field
                    </button>
                  </div>
                )}
              </div>
            );
          })}

        
        </div>
      </div>
    </div>
  );
}
