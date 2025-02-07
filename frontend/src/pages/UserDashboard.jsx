import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserDashboard = () => {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    role: 'Team Member',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    gender: 'Male',
    profilePicture: 'https://via.placeholder.com/150',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Error updating profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-r from-blue-500 to-green-500 flex justify-center items-center">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <img
              src={profile.profilePicture}
              alt="Avatar"
              className="w-40 h-40 rounded-full mb-6"
            />
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <p className="mt-2">Your Profile</p>
          </div>
          <div className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Edit Profile</h2>
            <form onSubmit={handleSave}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 mb-2">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={profile.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="role" className="block text-gray-700 mb-2">
                  Role
                </label>
                <input
                  id="role"
                  name="role"
                  type="text"
                  value={profile.role}
                  disabled
                  className="w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-700"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-700"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="phone" className="block text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={profile.phone}
                  disabled
                  className="w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-700"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="gender" className="block text-gray-700 mb-2">
                  Gender
                </label>
                <input
                  id="gender"
                  name="gender"
                  type="text"
                  value={profile.gender}
                  disabled
                  className="w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-700"
                />
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default UserDashboard;
