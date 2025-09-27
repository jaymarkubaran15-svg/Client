import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../src/assets/images/bg.png";
import { motion } from "framer-motion";
import Swal from 'sweetalert2'; 

const MemoryMapSignUp = () => {
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    alumniCardNumber: "",
    password: "",
    confirmPassword: "",
    address: "",
  });
  const [userCode, setUserCode] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

const [cooldown, setCooldown] = useState(0);
const [isCooldownActive, setIsCooldownActive] = useState(false);
  const navigate = useNavigate();


  const startCooldown = () => {
  setCooldown(60); // reset timer
  setIsCooldownActive(true); // triggers useEffect
};
useEffect(() => {
  setError(""); // Clear error when step changes
}, [step]);


useEffect(() => {
  let timer;

  if (isCooldownActive) {
    timer = setInterval(() => {
      setCooldown((prevCooldown) => {
        if (prevCooldown <= 1) {
          clearInterval(timer);
          setIsCooldownActive(false);
          return 0;
        }
        return prevCooldown - 1;
      });
    }, 1000);
  }

  return () => clearInterval(timer);
}, [isCooldownActive]); // 👈 only depends on isCooldownActive

const handleVerifyClick = async () => {
  try {
    const response = await fetch(`http://${process.env.REACT_APP_API_URL}/api/verify-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        code: userCode,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Verification failed");
      return;
    }

    // Success
    setError("");
    setStep(4); // ✅ move to Step 4
  } catch (err) {
    console.error("Verification error:", err);
    setError("Something went wrong. Please try again.");
  }
};

useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await fetch(`http://${process.env.REACT_APP_API_URL}/api/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  fetchUsers();
}, []);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

 const searchAccount = () => {
  if (!searchInput.trim()) {
    setError("Please fill in at least one field.");
    return;
  }

  const filtered = users.filter(
    (user) =>
      user.email?.toLowerCase() === searchInput.toLowerCase() ||
      user.alumni_card_number?.toLowerCase() === searchInput.toLowerCase()
  );

  if (filtered.length === 0) {
    setError("No matching accounts found.");
    return;
  }

  setFilteredUsers(filtered);
  setStep(2);
};


  const sendCodeToEmail = async (email) => {
  try {
    const response = await fetch(`http://${process.env.REACT_APP_API_URL}/api/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to send code");
    }

    console.log("Code sent to:", email);
  } catch (error) {
    console.error("Error sending code:", error);
    setError("Failed to send verification code. Please try again.");
  }
};

const handlePasswordReset = async () => {
  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match.");
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Passwords do not match.",
    });
    return;
  }

  try {
    const response = await fetch(`http://${process.env.REACT_APP_API_URL}/api/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Password update failed.");
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: data.message || "Password update failed.",
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Your password has been updated.",
      confirmButtonColor: "#3085d6",
    }).then(() => {
      navigate("/login");
    });
  } catch (err) {
    console.error("Reset error:", err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Something went wrong. Please try again later.",
    });
  }
};



  return (
    <div
      className="flex items-center justify-center h-screen w-screen bg-cover bg-center bg-no-repeat fixed"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="p-8 backdrop-blur-lg bg-blue-900 bg-opacity-30 border border-blue-300 rounded-lg text-white w-2/4 shadow-lg flex flex-col items-center"
      >
        <motion.h1
          className="text-4xl font-bold text-white text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {step === 1 ? "Find Your Account" : step === 2 ? "Verify Your Account" : "Verify Your Email"}
        </motion.h1>

        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

        {step === 1 && (
          <>
            <p className="text-sm mt-2 text-center">Enter your email or alumni id number.</p>
            <div className="mt-4 w-full">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full px-4 py-2 mt-1 rounded-md bg-white text-black focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email or alumni id number"
              />
            </div>
            <button
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white shadow-md transition-transform transform hover:scale-105"
              onClick={searchAccount}
            >
              Search
            </button>
            <button
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white shadow-md transition-transform transform hover:scale-105"
              onClick={() => navigate("/login")}
            >
              Cancel
            </button>
          </>
        )}

        
          {step === 2 && (
                <>
                  <p className="text-sm mt-4 text-center">These accounts matched your search.</p>

                  <div className="flex flex-col gap-4 mt-6 w-full">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-white text-black shadow-md"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={user.profile || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} // fallback if no profile
                            alt={`${user.first_name} ${user.last_name}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-md"
                        onClick={async () => {
                            setFormData((prev) => ({
                              ...prev,
                              email: user.email,
                            }));

                            await sendCodeToEmail(user.email); // ✅ send verification code
                            startCooldown(); // ✅ start cooldown for resend
                            setStep(3); // ✅ go to verification step
                          }}
                        >
                          This Is My Account
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    className="w-full mt-6 bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg text-black shadow-md transition-transform transform hover:scale-105"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </button>
                </>
              )}


      {step === 3 && (
                <>
                  <p className="text-sm mt-2 text-center">
                    Enter the verification code sent to {formData.email}.
                  </p>

                  <div className="mt-4 w-full">
                    <input
                      type="text"
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      className="w-full px-4 py-2 mt-1 rounded-md bg-white text-black focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter the code"
                    />
                  </div>

                  <button
                    className="w-full mt-3 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white shadow-md transition-transform transform hover:scale-105"
                    onClick={handleVerifyClick}
                  >
                    Verify code
                  </button>

                 <button
                      disabled={isCooldownActive}
                      onClick={() => {
                        // Trigger your resend API here
                        console.log("Resending to:", formData.email);
                        startCooldown(); // resets the timer every click
                      }}
                      className={`w-full mt-6 px-4 py-2 rounded-lg text-white shadow-md transition-transform transform hover:scale-105 ${
                        isCooldownActive
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {isCooldownActive ? `Resend code ${cooldown}s` : "Resend Code"}
                    </button>

                </>
              )}
              {step === 4 && (
              <>
                <p className="text-sm text-center mt-2">
                  Now you can proceed to set your new password.
                </p>

                <div className="mt-4 w-full">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 mt-1 rounded-md bg-white text-black focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password"
                  />
                </div>
                <div className="mt-4 w-full">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 mt-1 rounded-md bg-white text-black focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm password"
                  />
                </div>

                <button
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white shadow-md transition-transform transform hover:scale-105"
                   onClick={handlePasswordReset}
                >
                  Continue to Complete
                </button>
              </>
            )}



      </motion.div>
    </div>
  );
};

export default MemoryMapSignUp;
