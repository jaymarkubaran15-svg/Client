import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import Sidebar from "../navbar/sidebar";
import Event from "../navbar/event";
import Swal from 'sweetalert2';
import {useNavigate} from "react-router-dom";


export default function Post({ onSearch }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [user, setUser] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [menuOpen, setMenuOpen] = useState(null); // Track which menu is open
  const [showPostSection, setShowPostSection] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();

  const handleClick = () => {
    if (inputValue.trim()) {
      navigate(`/searchresult?query=${encodeURIComponent(inputValue)}`);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchPosts();
  }, []);

  
  const fetchUser = async () => {
    try {
      const response = await fetch("/api/users", { credentials: "include" });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
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

  const createPost = async () => {
    if (!newPost.trim() || !user) return;
  
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPost }),
        credentials: "include",
      });
  
      if (response.ok) {
        const newPostData = await response.json();
        setPosts([newPostData, ...posts]);
        setNewPost("");
  

        Swal.fire({
          icon: "success",
          title: "Post Created!",
          text: "Your post has been successfully added.",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          window.location.reload(); // Reloads the page after the alert
        });
      }
    } catch (error) {
      console.error("Error creating post:", error);
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Something went wrong. Please try again.",
      });
    }
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
  
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`http://${process.env.REACT_APP_API_URL}/api/session`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          navigate(data.user.role === "admin" ? "/post" : "/userhome");
        }
      } catch (error) {
        console.error("Session check failed:", error);
      }
    };
    checkSession();
  }, [navigate]);
  
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6 md:ml-64 bg-gray-100 min-h-screen">
        <div className="w-full mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{showPostSection ? "Job Posts" : "Events"}</h1>
              <div className="flex items-center bg-white p-2 rounded-lg shadow-md">
                  <FaSearch className="text-gray-500 mr-2" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="outline-none bg-transparent"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleClick()}
                  />
                  <button 
                    onClick={handleClick} 
                    className="bg-blue-500 text-white px-4 py-1 ml-2 rounded-lg">
                    Search
                  </button>
                </div>
          </div>


          <div className="flex gap-4 items-center mb-5">
            <button onClick={() => { setShowPostSection(true); }} className={`px-4 py-2 font-bold rounded-lg ${showPostSection ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>Job</button>
            <button onClick={() => { setShowPostSection(false); }} className={`px-4 py-2 font-bold rounded-lg ${!showPostSection ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>Event</button>
          </div>
        

        {/* Event Page  */}

        {showPostSection ? (
           <>
           {/* Create Post Section */}
           <div className="bg-white p-5 rounded-lg shadow-lg mb-6 w-full">
             <h2 className="text-lg font-bold mb-2">Create a Job Post</h2>
             <textarea
               placeholder="Write a job post.. "
               className="w-full p-3 border rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-300 outline-none"
               rows="3"
               value={newPost}
               onChange={(e) => setNewPost(e.target.value)}
             ></textarea>
             <button
               onClick={createPost}
               className="mt-3 px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition duration-200"
             >
               Post
             </button>
           </div>
       
           {/* Posts Section */}
                  <div className="space-y-6 mb-24">
          {posts.length === 0 ? (
            <p className=" bg-white p-6 rounded-lg shadow-md relative text-center text-gray-500 text-lg">No job post yet</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white p-6 rounded-lg shadow-md relative">
                
                {/* Post Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center cursor-pointer" 
                >
                    {post.profile ? (
                      <img 
                        src={post.profile} 
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
        
                  {/* Dropdown Menu for Edit/Delete */}
                  {user?.id === post.user_id && (
                    <div className="relative">
                      <button onClick={() => setMenuOpen(menuOpen === post.id ? null : post.id)}>
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
        
                {/* Post Content */}
                {editingPost === post.id ? (
                  <div>
                    <textarea
                      className="w-full p-2 border rounded-lg"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                    />
                    <button
                      onClick={() => editPost(post.id)}
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
            ))
          )}
        </div>
         </>
        
      ) : (
        <Event />
)}

        </div>
      </div>
    </div>
  );
}
