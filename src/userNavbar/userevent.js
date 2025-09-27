import React, { useState, useEffect } from 'react';
import {  FaMapMarkerAlt } from "react-icons/fa";
import {  useMap } from 'react-leaflet';

import { BsThreeDotsVertical } from "react-icons/bs";
import "leaflet/dist/leaflet.css"; 

import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';


const Event = () => {
    const [content, setContent] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState(null);
    const [imageFiles, setImageFiles] = useState([]);  // Store actual files
    const [searchResults, setSearchResults] = useState([]);
    const [showMap, setShowMap] = useState(false);
    const [events, setEvents] = useState([]); // Store fetched events
    const [selectedImage, setSelectedImage] = useState(null);
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(null);
  const navigate = useNavigate();
    // Fetch all events when component mounts
    useEffect(() => {
        fetchEvents();
        fetchUser();
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

    const fetchEvents = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/events", {
                credentials: "include",
            });
            const data = await response.json();
            if (data.success) {
                setEvents(data.events);
            } else {
                console.error("Error fetching events:", data.error);
            }
        } catch (error) {
            console.error("Failed to fetch events:", error);
        }
    };
    // Fetch location suggestions from OpenStreetMap (Nominatim)
    useEffect(() => {
        if (searchQuery.length > 2) {
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`)
                .then(response => response.json())
                .then(data => setSearchResults(data))
                .catch(error => console.error("Error fetching locations:", error));
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    // Component to update map view when location changes
    const ChangeMapView = ({ coords }) => {
        const map = useMap();
        useEffect(() => {
            map.setView(coords, 15);
        }, [coords, map]);
        return null;
    };

    const handleLocationSelect = (place) => {
        const newLocation = {
            lat: parseFloat(place.lat),
            lng: parseFloat(place.lon),
            name: place.display_name
        };
        setLocation(newLocation);
        setSearchQuery(place.display_name);
        setSearchResults([]);
        setShowMap(true); // Show the map when a location is selected
    };

    const handleImageUpload = (event) => {
      const files = Array.from(event.target.files);
      setImageFiles(prevImages => [...prevImages, ...files]); // Store actual files
  };

  const handlePost = async () => {
    if (!content.trim() || !location) {
      Swal.fire("Warning", "Please provide content and select a location.", "warning");
      return;
    }
  
    const formData = new FormData();
    formData.append("content", content);
    formData.append("location_name", location.name);
    formData.append("latitude", location.lat);
    formData.append("longitude", location.lng);
  
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });
  
    try {
      const response = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
  
      const data = await response.json();
      if (data.success) {
        Swal.fire("Success!", "Event posted successfully.", "success");
  
        // Reset form
        setContent("");
        setSearchQuery("");
        setLocation(null);
        setImageFiles([]);
        setShowMap(false);
      } else {
        Swal.fire("Error!", data.error || "Failed to post event.", "error");
      }
    } catch (error) {
      Swal.fire("Error!", "Failed to post event.", "error");
    }
  };
  

const handleDelete = async (eventId) => {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
          method: "DELETE",
          credentials: "include",
        });

        const data = await response.json();
        if (data.success) {
          Swal.fire("Deleted!", "Your event has been deleted.", "success");
          fetchEvents(); // Refresh events after deletion
        } else {
          Swal.fire("Error!", data.error || "Failed to delete event.", "error");
        }
      } catch (error) {
        Swal.fire("Error!", "Failed to delete event.", "error");
      }
    }
  });
};


    return (
        <div>

            {/* Display Events Section */}
            <div className="space-y-6">
                <h2 className="font-bold mt-3 text-lg">Recent Events</h2>


                {events.length === 0 ? (
                    <p>No events found.</p>
                ) : (
                    events.map(event => (
                        <div key={event.id} className="border rounded-lg p-4 shadow-sm bg-white z-10 relative">
                          <div className="flex items-center justify-between" >
                           <div className="flex items-center" onClick={() => {
                                if (user?.id === event.user_id) {
                                  navigate("/userprofile"); // your own profile page
                                } else {
                                  navigate(`/profiles/${event.user_id}`); // another user's public profile
                                }
                              }} > 
                           {event.profile ? (
                    <img 
                      src={event.profile} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full object-cover border-4 border-gray-200 cursor-pointer" 
                     
                    />
                  ) : (
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex justify-center items-center text-white font-bold">
                      {event.first_name?.charAt(0)}
                    </div>
                  )}

              <div className="ml-3">
                <h2 className="font-semibold text-lg text-gray-800">
                  {event.first_name
                    ? `${event.first_name}`
                    : "Unknown User"}
                </h2>
                <p className="text-sm text-gray-500">
                  {new Date(event.created_at).toLocaleString()}
                </p>
              </div>
            </div>


 {/* Dropdown Menu for Edit/Delete */}
            {user?.id === event.user_id && (
              <div className="relative">
                <button onClick={() => setMenuOpen(menuOpen === event.id ? null : event.id)}>
                  <BsThreeDotsVertical className="text-gray-600 hover:text-gray-800 cursor-pointer" />
                </button>

                {menuOpen === event.id && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-10">
                    <button
                            onClick={() => handleDelete(event.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                            Delete
                        </button>
                  </div>
                )}
              </div>
            )}
            </div>

            
            {/* this is the post conts  */}
                            <p className='mt-3'>{event.content}</p>
                            {event.location_name && (
                                      <p className="text-gray-600 mt-3">
                                          <FaMapMarkerAlt className="inline-block text-red-500 mr-1" />
                                        <a
                                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location_name)}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-500 hover:underline"
                                        >
                                          {event.location_name}
                                        </a>
                                      </p>
                                    )}
                                      

                            {/* Display event images */}
                            {event.images && JSON.parse(event.images).length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {JSON.parse(event.images).map((image, index) => (
                  <img
                    key={index}
                    src={`http://localhost:5000${image}`}
                    alt="Event"
                    className="rounded-lg cursor-pointer"
                    onClick={() => setSelectedImage(`http://localhost:5000${image}`)}
                  />
                ))}
              </div>
            )}

                        </div>
                    ))
                )}
                 {/* Image Preview Modal */}
                 {selectedImage && (
                    <div
                      className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-75 flex justify-center items-center z-50"
                      onClick={() => setSelectedImage(null)}
                    >
                      <img
                        src={selectedImage}
                        alt="Expanded Event"
                        className="max-w-full max-h-full rounded-lg shadow-lg"
                      />
                    </div>
                  )}

            </div>
        </div>
    );
};

export default Event;
