import { Camera, Mail, User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useState } from "react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImage(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className="h-screen pt-20 bg-gradient-to-b from-base-100 to-base-300">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-200 shadow-lg rounded-xl p-6 space-y-6 border border-primary/20">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-primary">Profile</h1>
            <p className="mt-2 text-primary">Your profile information</p>
          </div>

          {/* profile pic upload section*/}
          <div className="flex flex-col items-center gap-4">
            <div className="relative rounded-full p-1">
              {isUpdatingProfile && (
                <div className="skeleton h-32 w-32 rounded-full bg-primary/60"></div>
              )}
              {!isUpdatingProfile && (
                <img
                  src={selectedImg || authUser.profilePic || "/avatar.png"}
                  alt="Profile"
                  className="size-32 rounded-full object-cover"
                />
              )}
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-primary hover:bg-primary-focus hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${
                    isUpdatingProfile
                      ? "animate-pulse pointer-events-none opacity-50"
                      : ""
                  }
                `}
              >
                <Camera className="w-5 h-5 text-primary-content" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-primary">
              {isUpdatingProfile
                ? "Uploading..."
                : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-primary flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-300 rounded-lg border border-primary/10">
                {authUser?.fullName}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-primary flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-300 rounded-lg border border-primary/10">
                {authUser?.email}
              </p>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6 border border-primary/10">
            <h2 className="text-lg font-medium text-primary mb-4">
              Account Information
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-primary/10">
                <span className="text-primary">Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-primary">Account Status</span>
                <span className="text-success">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
