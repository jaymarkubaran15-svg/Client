import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SignUpImage from "../src/assets/images/signup.svg";
import bg from "../src/assets/images/bg.png";
import Swal from 'sweetalert2';
import "tailwindcss/tailwind.css";

const MemoryMapSignUp = () => {
   const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [workTitles, setWorkTitles] = useState([]);
    const [formData, setFormData] = useState({
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      alumniCardNumber: "",
      gender: "",
      yearGraduate: "",
      course: "",
      workTitle: "",
      address: "",
       mobileNumber: "",        // ✅ new
      civilStatus: "",         // ✅ new
      birthday: "",            // ✅ new
      regionOfOrigin: "",      // ✅ new
      province: "",            // ✅ new
      locationResidence: "",   // ✅ new
      password: "",
      confirmPassword: "",
       privacyPolicyAccepted: false, 
    });
    
  const [showPolicyModal, setShowPolicyModal] = useState(false);

    const startYear = 2000;
    const endYear = new Date().getFullYear();
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  
// Check if user is logged in
 useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/session`, {
          method: "GET",
          credentials: "include", // Include cookies
        });
  
        const data = await response.json();
  
        if (response.ok && data.user) {
          if (data.user.role === "admin") {
            navigate("/dashboard");
          } else if (data.user.has_submitted_survey) {
            navigate("/userhome"); // ✅ If survey is submitted, go to user home
          } else {
            navigate("/surveyq"); // ❌ If not, go to survey page
          }
        }
      } catch (error) {
        console.error("Session check failed:", error);
      }
    };
  
    checkSession();
  }, [navigate]); 


    useEffect(() => {
      const fetchCourses = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/courses`);
          if (!response.ok) throw new Error("Failed to fetch courses");
          const data = await response.json();
          setCourses([...new Set([...data, "Other"])]);
        } catch (error) {
          console.error("Error fetching courses:", error);
        }
      };
  
      const fetchWorkTitles = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/worktitle`);
          if (!response.ok) throw new Error("Failed to fetch work fields");
          const data = await response.json();
          setWorkTitles([...new Set([...data, "Other"])]);
        } catch (error) {
          console.error("Error fetching work fields:", error);
        }
      };
  
      fetchWorkTitles();
      fetchCourses();
    }, []);
  
    const handleInputChange = async (e) => {
      const { name, value,  type, checked } = e.target;
      setFormData({ ...formData, [name]:  type === "checkbox" ? checked : value });
  


      if (name === "address" && value.length > 2) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${value}`
          );
          const data = await response.json();
          setSuggestions(data.map((item) => item.display_name));
        } catch (error) {
          console.error("Error fetching address suggestions:", error);
        }
      } else if (name === "address") {
        setSuggestions([]);
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
     
      if (formData.password !== formData.confirmPassword) {
        Swal.fire({
          title: "Invalid input",
          text: "Please make sure your input is correct.",
          icon: "question"
        });
        return;
      }
      if (!formData.privacyPolicyAccepted) {
        Swal.fire({
          title: "Privacy Policy Required",
          text: "You must accept the privacy policy to register.",
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }
  
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/register`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
  
        const data = await response.json();
        if (!response.ok) {
      Swal.fire({
        title: "Error",
        text: data.message,
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    } else {
        Swal.fire({
          title: data.message,
          icon: "success",
          draggable: true
        });
        navigate("/login");
      }
      } catch (error) {
        console.error("Error submitting form:", error);
        Swal.fire({
          title: "Something went wrong, please try again later.",
          icon: "error",
          draggable: true
        });
      }
    };
    const regions = [
  "Region I", 
  "Region II", 
  "Region III",
  "Region IV-A",
  "Region V",
  "Region VI",
  "Region VII",
  "Region VIII",
  "Region IX",
  "Region X",
  "Region XI",
  "Region XII",
  "Region XIII",
  "NCR (National Capital Region)",
  "CAR (Cordillera Administrative Region)",
  "BARMM (Bangsamoro Autonomous Region)"
];


  return (
    <div className="relative flex items-center justify-center min-h-screen w-screen overflow-auto">

      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: `url(${bg})`, filter: "brightness(1.2) contrast(1.1)" }} 
      >
        {/* Light Effects */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400 opacity-30 blur-3xl rounded-full"></div>
        <div className="absolute bottom-10 right-20 w-40 h-40 bg-purple-500 opacity-25 blur-3xl rounded-full"></div>
      </div>

      {/* Fast Bounce-In Glassmorphic Form */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 15 }} // Fast bounce effect
        className="relative p-10 w-3/4 max-w-2xl bg-black bg-opacity-20 backdrop-blur-md rounded-2xl text-white shadow-2xl border border-white border-opacity-40"
      >
        <h1 className="text-4xl font-bold text-blue-300 animate-glow text-center">Sign up</h1>
        <p className="text-sm mt-2 text-center">Already have an account? 
          <span className="text-green-300 ml-2 cursor-pointer hover:underline" onClick={() => navigate("/login")}>
            Login now
          </span>
        </p>
        <form onSubmit={handleSubmit}>
     <div className="grid grid-cols-2 gap-4 mt-6 mb-4 animate-fade-in">
     <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-2 mt-1 rounded-md bg-black bg-opacity-30 text-black border border-white border-opacity-50 focus:ring focus:ring-blue-400 backdrop-blur-lg placeholder-black" />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 mt-1 rounded-md bg-black bg-opacity-30 text-black border border-white border-opacity-50 focus:ring focus:ring-blue-400 backdrop-blur-lg placeholder-black" />
            <input type="text" name="middleName" placeholder="Middle Name" value={formData.middleName} onChange={handleInputChange} className="w-full px-4 py-2 mt-1 rounded-md bg-black bg-opacity-30 text-black border border-white border-opacity-50 focus:ring focus:ring-blue-400 backdrop-blur-lg placeholder-black" />
            <input type="text" name="alumniCardNumber" placeholder="Alumni Card Number" value={formData.alumniCardNumber} onChange={handleInputChange} className="w-full px-4 py-2 mt-1 rounded-md bg-black bg-opacity-30 text-black border border-white border-opacity-50 focus:ring focus:ring-blue-400 backdrop-blur-lg placeholder-black" />
            <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-2 mt-1 rounded-md bg-black bg-opacity-30 text-black border border-white border-opacity-50 focus:ring focus:ring-blue-400 backdrop-blur-lg placeholder-black" />
            <div className="relative">
            <select name="gender" value={formData.gender} onChange={handleInputChange} className="appearance-none w-full px-4 py-2 mt-1 rounded-md bg-white bg-opacity-30 text-black border border-white border-opacity-50 focus:ring focus:ring-blue-400 backdrop-blur-lg placeholder-black">
              <option value="" disabled>Select your gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Prefer not to say</option>
           
            </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-black">
                        <svg
                          className="h-4 w-4 text-black"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
            </div>
            <input type="text" name="yearGraduate" list="year-options" placeholder="Graduation Year" value={formData.yearGraduate} onChange={handleInputChange} className="w-full px-4 py-2 mt-1 rounded-md bg-black bg-opacity-30 text-black border border-white border-opacity-50 focus:ring focus:ring-blue-400 backdrop-blur-lg placeholder-black" />
            <datalist id="year-options">{years.map((year) => (<option key={year} value={year} />))}</datalist>
            <input type="text" name="course" list="course-options" placeholder="Select Course" value={formData.course} onChange={handleInputChange} className="w-full px-4 py-2 mt-1 rounded-md bg-black bg-opacity-30 text-black border border-white border-opacity-50 focus:ring focus:ring-blue-400 backdrop-blur-lg placeholder-black" />
            <datalist id="course-options">{courses.map((course, index) => (<option key={index} value={course} />))}</datalist>
            <input type="text" name="workTitle" list="worktitle-options" placeholder="Enter Work" value={formData.workTitle} onChange={handleInputChange} className="w-full px-4 py-2 mt-1 rounded-md bg-black bg-opacity-30 text-black border border-white border-opacity-50 focus:ring focus:ring-blue-400 backdrop-blur-lg placeholder-black" />
            <datalist id="worktitle-options">{workTitles.map((title, index) => (<option key={index} value={title} />))}</datalist>
            <input type="text" name="address" list="address-options" placeholder="Enter Address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-2 mt-1 rounded-md bg-black bg-opacity-30 text-black border border-white border-opacity-50 focus:ring focus:ring-blue-400 backdrop-blur-lg placeholder-black" />
            <datalist id="address-options">{suggestions.map((address, index) => (<option key={index} value={address} />))}</datalist>
           
            {/* Mobile Number */}
            <input   type="tel"  name="mobileNumber"   placeholder="Mobile Number"  value={formData.mobileNumber}  onChange={handleInputChange}  className="w-full px-4 py-2 mt-1 rounded-md bg-black bg-opacity-30 text-black border border-white border-opacity-50 focus:ring focus:ring-blue-400 backdrop-blur-lg placeholder-black" />

            <div className="relative">
                {/* Civil Status */}
                  <select 
                    name="civilStatus" 
                    value={formData.civilStatus} 
                    onChange={handleInputChange} 
                    className="appearance-none w-full px-4 py-2 mt-1 rounded-md bg-white bg-opacity-30 text-black border border-white border-opacity-50 focus:ring focus:ring-blue-400 backdrop-blur-lg placeholder-white">
                    <option value="" disabled>Select Civil Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="widowed">Widowed</option>
                    <option value="separated">Separated</option>
                  </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-black">
                        <svg
                          className="h-4 w-4 text-black"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
              </div>

             {/* Birthday */}
            <input  type="date"  name="birthday"  placeholder="Birthday"  value={formData.birthday}  onChange={handleInputChange} className="w-full px-4 py-2 mt-1 rounded-md bg-black bg-opacity-30 text-black border border-white border-opacity-50 focus:ring focus:ring-blue-400 backdrop-blur-lg placeholder-white" />

            {/* Region of Origin */}
             <input  type="text"  name="regionOfOrigin"  list="region-options"  placeholder="Region of Origin"   value={formData.regionOfOrigin}  onChange={handleInputChange}  className="w-full px-4 py-2 mt-1 rounded-md bg-black bg-opacity-30 text-black border border-white border-opacity-50 focus:ring focus:ring-blue-400 backdrop-blur-lg placeholder-black"  />
            <datalist id="region-options">  {regions.map((region, index) => (<option key={index} value={region} />))}</datalist>
            {/* Province */}
           <input  type="text"  name="province"  value={formData.province}  onChange={handleInputChange}  placeholder="Province"   className="w-full px-4 py-2 mt-1 rounded-md bg-black bg-opacity-30 text-black border border-white border-opacity-50 focus:ring focus:ring-blue-400 backdrop-blur-lg placeholder-black"/>
            <div className="relative">
                {/* Location of Residence */}
                <select 
                  name="locationResidence"
                  value={formData.locationResidence}
                  onChange={handleInputChange} 
                  className="appearance-none w-full px-4 py-2 mt-1 rounded-md bg-white bg-opacity-30 text-black border border-white border-opacity-50 focus:ring focus:ring-blue-400 backdrop-blur-lg placeholder-black">
                  <option value="" disabled>Select Residence</option>
                  <option value="city">City</option>
                  <option value="municipality">Municipality</option>
                </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-black">
                        <svg
                          className="h-4 w-4 text-black"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                    </div>
              </div>

            <input type="password" name="password" placeholder="Enter Password" value={formData.password} onChange={handleInputChange} className="w-full px-4 py-2 mt-1 rounded-md bg-black bg-opacity-30 text-black border border-white border-opacity-50 focus:ring focus:ring-blue-400 backdrop-blur-lg placeholder-black" />
            <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleInputChange} className="w-full px-4 py-2 mt-1 rounded-md bg-black bg-opacity-30 text-black border border-white border-opacity-50 focus:ring focus:ring-blue-400 backdrop-blur-lg placeholder-black" />
            
      </div>


        {/* Privacy Checkbox */}
 <div className="flex flex-col mt-4">
      <label className="flex items-start text-sm">
        <input 
          type="checkbox" 
          name="privacyPolicyAccepted" 
          checked={formData.privacyPolicyAccepted} 
          onChange={handleInputChange} 
          className="mr-2 mt-1"
        />
        <span>
          I agree to the
          <button 
            type="button"
            onClick={() => setShowPolicyModal(true)} 
            className="text-black hover:underline ml-1"
          >
            Privacy and Policy
          </button>
        </span>
      </label>

      {/* Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Privacy and Policy</h2>
              <h2 className="text-blue-300 text-lg text-center mb-4">Privacy and Policy</h2>
            <p className="text-sm text-gray-700 mb-4 text-start">
              
            Content Accuracy:
              All published content (names, photos, awards, etc.) is based on verified school records or approved submissions.
            </p>
            <p className="text-sm text-gray-700 mb-4 text-start">
              Submissions:
              Content from students, staff, and alumni must be respectful, appropriate, and not violate others' rights.
            </p>
              <p className="text-sm text-gray-700 mb-4 text-start">
              Distribution:
              Yearbooks (print/digital) are for authorized recipients only. Reproduction or resale is not permitted.
              </p>
               <p className="text-sm text-gray-700 mb-4 text-start">
              🔒 Privacy & Consent:
              We collect names, photos, and academic info with consent for yearbook and alumni use only. Data is stored securely, shared only with permission, and accessible only by authorized staff.
              </p>
              <p className="text-sm text-gray-700 mb-4 text-start">
              By submitting content or participating in photos, you agree to inclusion in the yearbook and related platforms.
              You may request corrections or removal of your information by contacting the school’s Yearbook Coordinator or Privacy Officer.
             </p>
            <div className="flex justify-end">
              <button 
                onClick={() => setShowPolicyModal(false)} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

        {/* Buttons */}
        <button 
          className="w-full mt-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white shadow-lg transition transform hover:scale-105 animate-glow"
         type="submit"
        >
          Sign up
        </button>
        </form>
        
        <button 
          className="w-full mt-3 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white shadow-lg transition transform hover:scale-105"
          onClick={() => navigate("/")}
        >
          Cancel
        </button>
      </motion.div>

      {/* Floating Illustration */}
      <motion.div 
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute right-0 top-0 w-1/3 md:w-1/4 sm:w-1/5 p-4 animate-float z-10"
      >
        <img src={SignUpImage} alt="Illustration" className="w-full h-auto object-contain" />
      </motion.div>

      {/* Tailwind CSS Keyframe Animations */}
      {/* <style>
        {`
          @keyframes animatedBackground {
            0% { background: linear-gradient(45deg, #1e3a8a, #2563eb, #1e40af); }
            50% { background: linear-gradient(45deg, #2563eb, #1e40af, #1e3a8a); }
            100% { background: linear-gradient(45deg, #1e3a8a, #2563eb, #1e40af); }
          }
          .bg-dark-gradient {
            animation: animatedBackground 8s infinite alternate;
          }

          @keyframes glow {
            0% { text-shadow: 0 0 10px #3b82f6; }
            50% { text-shadow: 0 0 20px #1e3a8a; }
            100% { text-shadow: 0 0 10px #3b82f6; }
          }
          .animate-glow {
            animation: glow 2s infinite alternate;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fadeIn 1.5s ease-in-out;
          }

          @keyframes float {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0); }
          }
          .animate-float {
            animation: float 4s infinite ease-in-out;
          }
            @keyframes animatedBackground {
           0% { background: linear-gradient(45deg, #0a1f44, #102a67, #0c2b55); }
           50% { background: linear-gradient(45deg, #102a67, #0c2b55, #0a1f44); }
           100% { background: linear-gradient(45deg, #0a1f44, #102a67, #0c2b55); }
          }
          .bg-dark-gradient {
          animation: animatedBackground 8s infinite alternate;
          }

        `}
      </style> */}
    </div>
  );
};  

export default MemoryMapSignUp;
