import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../userNavbar/nav";
import { FaBriefcase, FaMapMarkerAlt, FaMailBulk, FaGraduationCap, FaEdit, FaSignOutAlt, FaLock, FaUserGraduate  } from "react-icons/fa";
import Cropper from "react-easy-crop";
import { FaCamera } from "react-icons/fa";
import Swal from 'sweetalert2';
import { BsThreeDotsVertical } from "react-icons/bs";
import bg from "../assets/images/bg.png";

export default function SocialMediaUI() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({profile:"" ,name: "", middlename:"" , lastname:"", work:"", address:"", email: "" });
  const [user, setUser] = useState(null);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedImage, setCroppedImage] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropArea, setCropArea] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editingUser, setEditingUser] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
const [showSidebar, setShowSidebar] = useState(false);

const [passwordData, setPasswordData] = useState({
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
});

  useEffect(() => {
  fetchUser();
  fetchPosts();
}, []);

  const fetchUser = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/profile", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch user data");
      const userData = await response.json();
      setUser({ ...userData }); // Add this line to update user state
      setUpdatedUser({
        profile: userData.profile,
        name: userData.first_name || "",
        middlename: userData.middle_name || "",
        lastname: userData.last_name || "",
        work: userData.work_title || "",
        address: userData.address || "",
        email: userData.email || "",
        year: userData.year_graduate || "",
      });
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };
  

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/logout", { method: "POST", credentials: "include" });
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result);
      reader.readAsDataURL(file);
      setShowCropModal(true);
    }
  };
const handleUserUpdate = async () => {
  try {
    const hasProfileChanged = !!croppedImage;
    const hasInfoChanged =
      updatedUser.name !== user.name ||
      updatedUser.middlename !== user.middlename ||
      updatedUser.lastname !== user.lastname ||
      updatedUser.email !== user.email;

    if (!hasInfoChanged && !hasProfileChanged) {
      return Swal.fire({
        icon: 'info',
        title: 'No Changes Detected',
        text: 'You have not made any changes to your profile.',
      });
    }
   

    const formData = new FormData();
    formData.append("name", updatedUser.name);
    formData.append("middlename", updatedUser.middlename);
    formData.append("lastname", updatedUser.lastname);
    formData.append("email", updatedUser.email);

    if (updatedUser.email !== user.email) {
      if (!updatedUser.password) {
        return Swal.fire({
          icon: 'warning',
          title: 'Password Required',
          text: 'Please enter your password to confirm the email change.',
        });
      }
      formData.append("password", updatedUser.password);
    }

    if (hasProfileChanged) {
      const blob = await (await fetch(croppedImage)).blob();
      const file = new File([blob], "profile.jpg", { type: blob.type || "image/jpeg" });
      formData.append("profile", file);
    }

    const res = await fetch(`/api/users/${user.id}`, {
      method: "PUT",
      body: formData,
      credentials: "include",
    });

    if (!res.ok) {
      const errorResult = await res.json().catch(() => ({}));
      const errorMessage = errorResult.message || "Failed to update user data.";
      return Swal.fire({ icon: 'error', title: 'Error', text: errorMessage });
    }

    const result = await res.json();

    if (updatedUser.email !== user.email) {
      Swal.fire({
        icon: 'info',
        title: 'Verification Sent',
        text: result.message,
        input: 'text',
        inputPlaceholder: 'Enter Verification Code',
        showCancelButton: true,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        inputValidator: (value) => {
          if (!value) return 'Please enter the verification code!';
        }
      }).then(async (response) => {
        if (response.isConfirmed) {
          try {
            const confirmRes = await fetch('/confirm-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: response.value, userId: user.id }),
              credentials: 'include',
            });

            const confirmResult = await confirmRes.json();
            if (!confirmRes.ok) {
              return Swal.fire({ icon: 'error', title: 'Error', text: confirmResult.message });
            }

            Swal.fire({ icon: 'success', title: 'Email Verified', text: confirmResult.message });
            await fetchUser(); // ✅ Refresh user state
          } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'An error occurred.' });
          }
        }
      });
    } else {
     
      Swal.fire({ icon: 'success', title: 'Profile Updated', text: 'Profile updated successfully!' });
      await fetchUser(); // ✅ refetches updated data
      setIsOpen(false); // optional: close edit form
    }

    setIsOpen(false);
  } catch (error) {
    console.error('Error updating user:', error);
    Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'An error occurred.' });
  }
};

  const handlePasswordChange = async () => {
       if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
         return Swal.fire({ icon: "warning", title: "Missing Fields", text: "All fields are required." });
       }
     
       if (passwordData.newPassword !== passwordData.confirmNewPassword) {
         return Swal.fire({ icon: "error", title: "Mismatch", text: "New passwords do not match." });
       }
     
       try {
         const response = await fetch(`/api/users/${user.id}/change-userpassword`, {
           method: "PUT",
           headers: { "Content-Type": "application/json" },
           credentials: "include",
           body: JSON.stringify({
             currentPassword: passwordData.currentPassword,
             newPassword: passwordData.newPassword,
           }),
         });
     
         const result = await response.json();
         console.log("API Response:", result); // Debugging
     
         if (!response.ok) {
           if (result.code === "INVALID_PASSWORD") {
             return Swal.fire({ icon: "error", title: "Incorrect Password", text: "Current password is incorrect." });
           }
           return Swal.fire({ icon: "error", title: "Error", text: result.message || "Failed to update password." });
         }
     
         // Show success message
         await Swal.fire({ icon: "success", title: "Success", text: "Password updated successfully! You will be logged out." });
     
         // Call logout API
         await fetch("/api/logout", {
           method: "POST",
           credentials: "include",
         });
     
         // Redirect to login page
         window.location.href = "/login";
         
       } catch (error) {
         console.error("Error updating password:", error);
         Swal.fire({ icon: "error", title: "Error", text: "An error occurred. Please try again." });
       }
  };


  const onCropComplete = (_, croppedAreaPixels) => {
    setCropArea(croppedAreaPixels);
  };

  const cropImage = async () => {
    if (!imageSrc || !cropArea) {
      alert("Please select and crop an image.");
      return;
    }
    try {
      const croppedBlob = await getCroppedImg(imageSrc, cropArea);
      const croppedUrl = URL.createObjectURL(croppedBlob);
      setCroppedImage(croppedUrl);
      setUpdatedUser((prev) => ({ ...prev, profile: croppedUrl }));
      setUser((prev) => ({ ...prev, profile: croppedUrl }));
      setShowCropModal(false);
    } catch (error) {
      console.error("Error cropping image:", error);
      alert("Failed to crop image. Please try again.");
    }
  };

  const getCroppedImg = (imageSrc, cropArea) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = cropArea.width;
        canvas.height = cropArea.height;

        ctx.drawImage(
          image,
          cropArea.x,
          cropArea.y,
          cropArea.width,
          cropArea.height,
          0,
          0,
          cropArea.width,
          cropArea.height
        );

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          resolve(blob);
        }, "image/jpeg");
      };
      image.onerror = (error) => reject(error);
    });
  };


   const deletePost = async (postId) => {
      const confirmDelete = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });
    
      if (!confirmDelete.isConfirmed) return;
    
      try {
        const response = await fetch(`/api/posts/${postId}`, {
          method: "DELETE",
          credentials: "include",
        });
    
        if (response.ok) {
          setPosts(posts.filter((post) => post.id !== postId));
    
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Your post has been removed.",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } catch (error) {
        console.error("Error deleting post:", error);
        Swal.fire({
          icon: "error",
          title: "Oops!",
          text: "Unable to delete the post.",
        });
      }
    };
    

    const editPost = async (postId) => {
      try {
        const response = await fetch(`/api/posts/${postId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: editedContent }),
          credentials: "include",
        });
    
        if (response.ok) {
          setPosts(posts.map((post) => (post.id === postId ? { ...post, content: editedContent } : post)));
          setEditingPost(null);
          setMenuOpen(null); // Close menu after edit
    
          Swal.fire({
            icon: "success",
            title: "Post Updated!",
            text: "Your post has been successfully updated.",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } catch (error) {
        console.error("Error updating post:", error);
        Swal.fire({
          icon: "error",
          title: "Oops!",
          text: "Something went wrong while updating the post.",
        });
      }
    };
    
  
  const makeLinksClickable = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|\S+@\S+\.\S+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (part && part.match(urlRegex)) {
        // If the part matches the URL pattern, make it clickable
        const href = part.startsWith("www.") ? `http://${part}` : part;
        return (
          <a key={index} href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            {part}
          </a>
        );
      }
      return part;
    });
  };
  
  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts", { credentials: "include" });
      if (response.ok) {
        const postData = await response.json();
        setPosts(postData);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="flex flex-col gap-4 md:flex-row min-h-screen w-full bg-gray-100">
           {/* Background Overlay */}
              <div 
                className="fixed inset-0 bg-cover bg-center opacity-40 z-0 "
                style={{ backgroundImage: `url(${bg})` }}
              />
        {/* Mobile Top Bar */}
        <div className="md:hidden flex justify-between items-center p-4 bg-white shadow w-full">
          <h1 className="text-lg font-bold">Profile</h1>
          <button className="text-2xl" onClick={() => setShowSidebar(true)}>☰</button>
        </div>

  {/* Sidebar */}
  <div
    className={`fixed md:sticky top-0 left-0 z-50 md:z-auto bg-white transition-transform duration-300 ease-in-out md:translate-x-0 ${
      showSidebar ? "translate-x-0" : "-translate-x-full"
    } w-3/4 max-w-xs h-full md:w-96 md:h-screen md:rounded-md md:shadow-lg`}
  >
  <aside className="p-4 bg-white h-full flex flex-col items-center shadow-lg md:mt-5 md:rounded-md">

    {/* Mobile Close Button */}
    <button
      className="self-end md:hidden text-2xl mb-4"
      onClick={() => setShowSidebar(false)}
    >
      ✕
    </button>

    {/* Profile Avatar */}
    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500">
      {user?.profile ? (
        <img
          src={user.profile}
          alt="Profile"
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setShowPreview(true)}
        />
      ) : (
        <div
          className="w-full h-full bg-blue-500 flex justify-center items-center text-white text-6xl font-bold cursor-pointer"
          onClick={() => setShowPreview(true)}
        >
          {user?.first_name?.charAt(0).toUpperCase() || "?"}
        </div>
      )}
    </div>

    <h2 className="text-xl font-bold mt-3 text-center">
      {user?.first_name} {user?.last_name}
    </h2>

    <div className="flex flex-col sm:flex-row gap-2 mt-4">
      <button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
            onClick={() => setIsOpen(true)}>
        <FaEdit className="mr-2" /> Edit
      </button>
      <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center"

      onClick={() => setIsPasswordOpen(true)}>
        <FaLock className="mr-2" /> Change Password
      </button>
    </div>

<div className="text-sm text-gray-600 mt-5 text-center px-4">
      <p className="flex justify-start items-center mt-2">
        <FaGraduationCap className="mr-2" size={25} />
        Year graduate: {user?.year_graduate}
      </p>

      <p className="flex justify-start items-center mt-2">
        <FaUserGraduate className="mr-2" size={25} />
        Course: {user?.course}
      </p>

      <p className="flex justify-start items-center mt-2">
        <FaBriefcase className="mr-2" size={25} />
        Work title: {user?.work_title}
      </p>

     <div className="flex justify-start items-start mt-2">
  <FaMapMarkerAlt size={20} className=" mt-1 flex-shrink-0" />
        <div className=" flex justify-start items-start p-0">
        <p>Lives in: {user?.address} </p>
   
        </div>
      </div>


      <p className="flex justify-start items-center mt-2">
        <FaMailBulk className="mr-2" size={25} />
        <span className="mr-2">Email:</span> {user?.email}
      </p>
    </div>


    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 mt-5 rounded-lg flex items-center w-full sm:w-auto"
    >
      <FaSignOutAlt className="mr-2" /> Logout
    </button>
  </aside>
</div>

{/* Backdrop (mobile only) */}
{showSidebar && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
    onClick={() => setShowSidebar(false)}
  />
)}



{/* Backdrop (mobile only) */}
{showSidebar && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
    onClick={() => setShowSidebar(false)}
  />
)}

{/* Profile Preview */}
{showPreview && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div className="relative">
      {user?.profile ? (
        <img
          src={user.profile}
          alt="Profile Preview"
          className="max-w-full max-h-[80vh] rounded-lg"
        />
      ) : (
        <div className="w-80 h-80 bg-blue-500 rounded-full flex justify-center items-center text-white text-[10rem] font-bold">
          {user?.first_name?.charAt(0).toUpperCase() || "?"}
        </div>
      )}
      <button
        onClick={() => setShowPreview(false)}
        className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full"
      >
        ✕
      </button>
    </div>
  </div>
)}

{/* Main Content */}
<main className="flex-1 p-4 mt-4 relative">
  <div className="bg-white p-4 rounded-lg shadow mb-16 h-full">
    <h2 className="text-xl font-bold mb-4">Your Post</h2>

   <div className="space-y-6">
  {(() => {
    const userPosts = posts.filter((post) => post.user_id === user?.id);

    if (userPosts.length === 0) {
      return (
        <p className="text-center text-gray-500 text-lg">
          You have not posted yet
        </p>
      );
    }

    return userPosts.map((post) => (
      <div key={post.id} className="bg-white p-6 rounded-lg shadow-md relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {user?.profile ? (
              <img
                src={user.profile}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-4 border-gray-200 cursor-pointer"
              />
            ) : (
              <div className="w-10 h-10 bg-blue-500 rounded-full flex justify-center items-center text-white font-bold">
                {post.first_name?.charAt(0)}
              </div>
            )}
            <div className="ml-3">
              <h2 className="font-semibold text-lg text-gray-800">
                {post.first_name && post.last_name
                  ? `${post.first_name} ${post.last_name}`
                  : "Unknown User"}
              </h2>
              <p className="text-sm text-gray-500">
                {new Date(post.date_posted).toLocaleString()}
              </p>
            </div>
          </div>

          {user?.id === post.user_id && (
            <div className="relative">
              <button
                onClick={() =>
                  setMenuOpen(menuOpen === post.id ? null : post.id)
                }
              >
                <BsThreeDotsVertical className="text-gray-600 hover:text-gray-800 cursor-pointer" />
              </button>
              {menuOpen === post.id && (
                <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => {
                      setEditingPost(post.id);
                      setEditedContent(post.content);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {editingPost === post.id ? (
          <div>
            <textarea
              className="w-full p-2 border rounded-lg"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <button
              onClick={() => editPost(post.id, editedContent)}
              className="mt-2 px-4 py-2 bg-green-500 text-white font-bold rounded-lg"
            >
              Save
            </button>
            <button
              onClick={() => setEditingPost(null)}
              className="ml-2 mt-2 px-4 py-2 bg-gray-500 text-white font-bold rounded-lg"
            >
              Cancel
            </button>
          </div>
        ) : (
          <p className="text-gray-700 whitespace-pre-wrap break-words">
            {makeLinksClickable(post.content)}
          </p>
        )}
      </div>
    ));
  })()}
</div>

  </div>
</main>
</div>


    


      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-200 p-6 rounded-lg w-2/4">
            <h2 className="text-lg font-semibold">Edit Profile</h2>
            
            <div className="mt-4 space-y-3">
              
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
              <label className="relative cursor-pointer">
                  {croppedImage || user?.profile? (
                    <img
                      src={croppedImage || user?.profile}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-blue-500 rounded-full flex justify-center items-center text-white text-6xl font-bold">
                       {user?.first_name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <input type="file" name="profile" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
                {/* Upload Button */}
                <label className="absolute bottom-2 right-2 bg-white p-1 rounded-full shadow-md cursor-pointer">
                  <FaCamera className="text-gray-600" />
                  <input type="file" name="profile" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>




                {/* Crop Modal */}
                {showCropModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
                      <h2 className="text-xl font-bold mb-2">Crop Image</h2>
                      <div className="relative w-full h-64">
                        <Cropper
                          image={imageSrc}
                          crop={crop}
                          zoom={zoom}
                          aspect={1}
                          onCropChange={setCrop}
                          onZoomChange={setZoom}
                          onCropComplete={onCropComplete}
                        />
                      </div>
                      <div className="flex justify-between mt-4">
                        <button onClick={cropImage} className="bg-green-500 text-white px-4 py-2 rounded-lg">
                          Save
                        </button>
                        <button onClick={() => setShowCropModal(false)} className="text-red-500">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
              <input type="text"  value={updatedUser.name} onChange={(e) => setUpdatedUser({ ...updatedUser, name: e.target.value })} placeholder="First Name" className="w-full px-3 py-2 border rounded-lg" />
              <input type="text" value={updatedUser.middlename} onChange={(e) => setUpdatedUser({ ...updatedUser, middlename: e.target.value })} placeholder="Middle Name" className="w-full px-3 py-2 border rounded-lg"  />
              <input type="text"  value={updatedUser.lastname} onChange={(e) => setUpdatedUser({ ...updatedUser, lastname: e.target.value })} placeholder="Last Name" className="w-full px-3 py-2 border rounded-lg" />
              <input type="text"  value={updatedUser.work} onChange={(e) => setUpdatedUser({ ...updatedUser, work: e.target.value })} placeholder="Work" className="w-full px-3 py-2 border rounded-lg" />
              <input type="text"  value={updatedUser.address} onChange={(e) => setUpdatedUser({ ...updatedUser, address: e.target.value })}placeholder="Address" className="w-full px-3 py-2 border rounded-lg" />
              <input type="text"  value={updatedUser.email} onChange={(e) => setUpdatedUser({ ...updatedUser, email: e.target.value })} placeholder="Email" className="w-full px-3 py-2 border rounded-lg" />
            
              {updatedUser.email !== user?.email && (
                      <>
                      <h1 className="text-red-600"> Please enter your password to confirm email changes</h1>
                        <input
                          type="password"
                          value={updatedUser.password}
                          onChange={(e) => setUpdatedUser({ ...updatedUser, password: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="Confirm Password"
                        />
                      </>
                    )}
            </div>
            <div className="flex justify-end mt-6 space-x-2">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 bg-gray-400 text-white rounded-lg">Cancel</button>
              <button onClick={handleUserUpdate} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Save changes</button>
            </div>
          </div>
        </div>
      )}


      {isPasswordOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-gray-200 p-6 rounded-lg w-2/4">
                  <h2 className="text-lg font-semibold">Change Password</h2>
                  <div className="mt-4 space-y-3">
                    <input type="password" onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} placeholder="Current Password" className="w-full px-3 py-2 border rounded-lg" />
                    <input type="password" onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} placeholder="New Password" className="w-full px-3 py-2 border rounded-lg" />
                    <input type="password" onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })} placeholder="Confirm New Password" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="flex justify-end mt-6 space-x-2">
                    <button onClick={() => setIsPasswordOpen(false)} className="px-4 py-2 bg-gray-400 text-white rounded-lg">Cancel</button>
                    <button onClick={handlePasswordChange} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Update Password</button>
                  </div>
                </div>
              </div>
            )}
    </div>
  );
}
