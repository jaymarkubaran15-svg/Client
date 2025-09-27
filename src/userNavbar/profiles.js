import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../userNavbar/nav";
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaMailBulk,
  FaGraduationCap,
  FaUserGraduate,
} from "react-icons/fa";
import Swal from "sweetalert2";
import bg from "../assets/images/bg.png";

export default function SocialMediaUI() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchUser();
      fetchPosts();
    }
  }, [id]);
const fetchUser = async () => {
  try {
    const response = await fetch(`http://${process.env.REACT_APP_API_URL}/api/users/${id}`, {
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch user data: ${response.status} ${errorText}`);
    }

    const userData = await response.json();
    setUser(userData);
    console.log("Fetched user:", userData);
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
        const href = part.startsWith("www.") ? `http://${part}` : part;
        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="flex flex-col gap-4 md:flex-row min-h-screen w-full bg-gray-100">
        {/* Background */}
        <div className="fixed inset-0 bg-cover bg-center opacity-40 z-0" style={{ backgroundImage: `url(${bg})` }} />

        {/* Mobile Top Bar */}
        <div className="md:hidden flex justify-between items-center p-4 bg-white shadow w-full z-10">
          <h1 className="text-lg font-bold">Profile</h1>
          <button className="text-2xl" onClick={() => setShowSidebar(true)}>☰</button>
        </div>

        {/* Sidebar */}
        <div className={`fixed md:sticky top-0 left-0 z-50 bg-white transition-transform duration-300 ease-in-out md:translate-x-0 ${showSidebar ? "translate-x-0" : "-translate-x-full"} w-3/4 max-w-xs h-full md:w-96 md:h-screen md:rounded-md md:shadow-lg`}>
          <aside className="p-4 bg-white h-full flex flex-col items-center shadow-lg md:mt-5 md:rounded-md">
            <button className="self-end md:hidden text-2xl mb-4" onClick={() => setShowSidebar(false)}>✕</button>
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500">
              {user?.profile ? (
                <img src={user.profile} alt="Profile" className="w-full h-full object-cover cursor-pointer" onClick={() => setShowPreview(true)} />
              ) : (
                <div className="w-full h-full bg-blue-500 flex justify-center items-center text-white text-6xl font-bold cursor-pointer" onClick={() => setShowPreview(true)}>
                  {user?.first_name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold mt-3 text-center">{user?.first_name} {user?.last_name}</h2>
            <div className="text-sm text-gray-600 mt-5 text-center px-4">
              <p className="flex justify-start items-center mt-2"><FaGraduationCap className="mr-2" size={25} /> Year graduate: {user?.year_graduate}</p>
              <p className="flex justify-start items-center mt-2"><FaUserGraduate className="mr-2" size={25} /> Course: {user?.course}</p>
              <p className="flex justify-start items-center mt-2"><FaBriefcase className="mr-2" size={25} /> Work title: {user?.work_title}</p>
              <div className="flex justify-start items-start mt-2"><FaMapMarkerAlt size={20} className="mt-1 flex-shrink-0" /><p className="pl-2">Lives in: {user?.address}</p></div>
              <p className="flex justify-start items-center mt-2"><FaMailBulk className="mr-2" size={25} /><span className="mr-2">Email:</span> {user?.email}</p>
            </div>
          </aside>
        </div>

        {/* Backdrop for Sidebar (mobile only) */}
        {showSidebar && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setShowSidebar(false)} />}

        {/* Profile Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative">
              {user?.profile ? (
                <img src={user.profile} alt="Profile Preview" className="max-w-full max-h-[80vh] rounded-lg" />
              ) : (
                <div className="w-80 h-80 bg-blue-500 rounded-full flex justify-center items-center text-white text-[10rem] font-bold">
                  {user?.name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <button onClick={() => setShowPreview(false)} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full">✕</button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 mt-4 relative">
          <div className="bg-white p-4 rounded-lg shadow mb-16 h-full">
            <h2 className="text-xl font-bold mb-4">Post</h2>
            <div className="space-y-6">
              {(() => {
                const userPosts = posts.filter((post) => post.user_id === Number(id));
                if (userPosts.length === 0) {
                  return <p className="text-center text-gray-500 text-lg">You have not posted yet</p>;
                }

                return userPosts.map((post) => (
                  <div key={post.id} className="bg-white p-6 rounded-lg shadow-md relative">
                    <div className="flex items-center justify-between">
                      <Link to={`/profiles/${post.user_id}`} className="flex items-center cursor-pointer hover:opacity-80 transition">
                        {user?.profile ? (
                          <img src={user.profile} alt="Profile" className="w-10 h-10 rounded-full object-cover border-4 border-gray-200" />
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
                      </Link>
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
    </div>
  );
}
