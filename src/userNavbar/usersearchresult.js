import React, { useState, useEffect } from "react";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import Swal from "sweetalert2";
import Navbar from "../userNavbar/nav";
import { useLocation, useNavigate } from "react-router-dom";

import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import bg from "../assets/images/bg.png";

const Result = () => {
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const passedQuery = queryParams.get("query") || "";
  const [searchQuery, setSearchQuery] = useState(passedQuery);
  const [filter, setFilter] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchUser();
    fetchPosts();
    fetchEvents();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/user", { credentials: "include" });
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
        const mappedPosts = (postData.posts || postData || []).map((post) => ({ ...post, type: "job" }));
        setPosts(mappedPosts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events", { credentials: "include" });
      if (response.ok) {
        const eventData = await response.json();
        const mappedEvents = eventData.events.map((event) => ({ ...event, type: "event" }));
        setEvents(mappedEvents);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const searchItems = (items) => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return items.filter((item) =>
      (item.content?.toLowerCase().includes(query) ||
        item.location_name?.toLowerCase().includes(query) ||
        `${item.first_name || ""} ${item.last_name || ""}`.toLowerCase().includes(query))
    );
  };

  const filteredEvents = searchItems(events);
  const filteredPosts = searchItems(posts);

  let displayData = [];
  if (filter === "all") {
    displayData = [...filteredPosts, ...filteredEvents];
  } else if (filter === "job") {
    displayData = filteredPosts;
  } else if (filter === "event") {
    displayData = filteredEvents;
  }


  const deletePost = async (id, itemType) => {
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
      const endpoint = itemType === "job" 
        ? `/api/posts/${id}` 
        : `/api/events/${id}`;
  
      const response = await fetch(endpoint, {
        method: "DELETE",
        credentials: "include",
      });
  
      if (response.ok) {
        if (itemType === "job") {
          setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
        } else {
          setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
        }
  
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Your item has been removed.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error("Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Unable to delete the item.",
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
        setMenuOpen(null);
  
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
  

  return (
     <div>
          
     <Navbar />
    <div className="flex">
      <div className="flex-1 p-10 bg-gray-50 min-h-screen w-9/12 relative">
         {/* Background Overlay */}
            <div 
              className="fixed inset-0 bg-cover bg-center opacity-40 z-0 "
              style={{ backgroundImage: `url(${bg})` }}
            />
      <div className="w-9/12 mx-auto z-10 relative">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 z-10">Search Result</h1>

        <div className="flex items-center bg-white p-4 rounded-lg shadow-lg mb-6 border border-gray-300 hover:border-gray-400 transition-all z-10">
          <FaSearch className="text-gray-600 mr-3" size={20} />
          <input
            type="text"
            placeholder="Search by content, location, or user..."
            className="outline-none bg-transparent w-full text-gray-700 placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mb-6 z-10">
          <label htmlFor="filter" className="mr-3 font-semibold">Filter By:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-3 border rounded-lg bg-white shadow-md cursor-pointer hover:bg-gray-100"
          >
            <option value="all">All</option>
            <option value="job">Jobs</option>
            <option value="event">Events</option>
          </select>
        </div>

        {displayData.length > 0 ? (
          displayData.map((item) => (
            <div key={`${item.type}-${item.id}`} className="bg-white p-6 rounded-lg shadow-md mb-4 hover:shadow-lg transition-all z-10">
              <div className="flex items-center justify-between">  
                <div className="flex items-center" onClick={() => {
            if (user?.id === item.user_id) {
              navigate("/userprofile"); // your own profile page
            } else {
              navigate(`/profiles/${item.user_id}`); // another user's public profile
            }
          }}>
            
            {user?.profile ? (
              <img 
                src={user.profile} 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover border-4 border-gray-200 cursor-pointer" 
              />
            ) : (
              <div className="w-10 h-10 bg-blue-500 rounded-full flex justify-center items-center text-white font-bold">
                  {item.first_name?.charAt(0)}
              </div>
            )}
                      <div className="ml-3">
                      <h2 className="font-semibold text-gray-800 text-xl mb-2">
                        {item.first_name} {item.last_name}
                      </h2>
                   </div>     
                   </div>

                   {user?.id === item.user_id && (
                     <div className="relative">
                        <button onClick={() => setMenuOpen(menuOpen === item.id ? null : item.id)}>
                        <BsThreeDotsVertical className="text-gray-600 cursor-pointer" />
                          </button>
       
                       {menuOpen === item.id && (
                          <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg">
                         {item.type === "job" && (
                            <button onClick={() => { setEditingPost(item.id); setEditedContent(item.content); }} className="block px-4 py-2 text-sm">Edit</button>
                          )}
                          {item.type === "job" && (
                            <button
                              onClick={() => deletePost(item.id, item.type)}
                              className="block px-4 py-2 text-sm text-red-600"
                            >
                              Delete
                            </button>
                          )}

                          {item.type === "event" && (
                            <button
                              onClick={() => deletePost(item.id, item.type)}
                              className="block px-4 py-2 text-sm text-red-600"
                            >
                              Delete Event
                            </button>
                          )}

                        </div>
                       )}
                     </div>
                   )}
                </div>  
                
                    {editingPost === item.id ? (
                   <div>
                     <textarea
                       className="w-full p-2 border rounded-lg"
                       value={editedContent}
                       onChange={(e) => setEditedContent(e.target.value)}
                     />
                     <button
                       onClick={() => editPost(item.id)}
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
                   <p className="text-gray-700 whitespace-pre-wrap break-words mt-3">
                     {makeLinksClickable(item.content)}
                   </p>
                 )}
                  {item.location_name && (
                <p className="text-gray-600 mt-4 flex items-center">
                  <FaMapMarkerAlt className="text-red-500 mr-2" />
                  {item.location_name}
                </p>
              )}

              {/* // Display images for events */}
              {item.type === "event" && item.images && (() => {
                let images = [];
                try {
                  images = Array.isArray(item.images) ? item.images : JSON.parse(item.images);
                } catch (error) {
                  console.error("Error parsing images:", error);
                  return null;
                }

                return images.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {images.map((image, index) => (
                      <img
                        key={index}
                        src={`http://${process.env.REACT_APP_API_URL}${image}`}
                        alt="Event"
                        className="rounded-lg cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => setSelectedImage(`http://${process.env.REACT_APP_API_URL}${image}`)}
                      />
                    ))}
                  </div>
                ) : null;
              })()}
        
            </div>
          ))
        ) : (
          <p className="text-gray-500">No results found.</p>
        )}





        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" onClick={() => setSelectedImage(null)}>
            <Zoom>
              <img src={selectedImage} alt="Expanded Event" className="max-w-full max-h-full rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()} />
            </Zoom>
          </div>
        )}
      </div>
      </div>
    </div>
    </div>
  );
};

export default Result;