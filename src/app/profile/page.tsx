"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
  Divider,
} from "@heroui/react";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/identities/profile`;

interface UserProfile {
  email: string;
  fullName: string;
  userName: string;
  phoneNumber: string | null;
  dateOfBirth: Date;
  imageUrl: string | null;
  bio: string;
  sessionPrice: number;
}

export default function Profile() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [updatedProfile, setUpdatedProfile] = useState<Partial<UserProfile>>(
    {}
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      const accessToken = localStorage.getItem("accessToken");
      setUserRole(user?.role);

      const fetchProfile = async () => {
        try {
          const response = await fetch(API_URL, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) throw new Error("Failed to fetch profile");

          const data: UserProfile = await response.json();
          setProfile(data);
        } catch (err) {
          setError((err as Error).message);
        }
      };

      fetchProfile();
    }
  }, [user, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdatedProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setUpdateError("File size must be less than 5MB");
        return;
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        setUpdateError("File must be a JPEG, PNG, or GIF image");
        return;
      }

      setSelectedImage(file);
      // Clean up previous preview URL to prevent memory leaks
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setUpdateError(""); // Clear any previous errors
    }
  };

  const handleUpdateProfile = async () => {
    if (!user || !profile) return;

    setIsUpdating(true);
    setUpdateError("");

    try {
      const formData = new FormData();

      const profileData = {
        ...profile,
        ...updatedProfile,
        dateOfBirth: new Date(
          updatedProfile.dateOfBirth || profile.dateOfBirth
        ).toISOString(),
      };

      Object.entries(profileData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value as string);
        }
      });

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to update profile");
      }

      const updatedData: UserProfile = await response.json();
      setProfile(updatedData);
      setSelectedImage(null);
      setImagePreview(null);
      onClose();
    } catch (err) {
      setUpdateError((err as Error).message);
      console.error("Update error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const openUpdateModal = () => {
    if (profile) {
      setUpdatedProfile({
        phoneNumber: profile.phoneNumber || "",
        bio: profile.bio || "",
        sessionPrice: profile.sessionPrice || 0,
        dateOfBirth: profile.dateOfBirth,
      });
      onOpen();
    }
  };

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-24 h-24 bg-blue-200 rounded-full mb-4"></div>
          <div className="h-6 w-40 bg-blue-200 rounded mb-3"></div>
          <div className="h-4 w-60 bg-blue-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl mx-auto bg-white/90 backdrop-filter backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-blue-100">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-6">
          <h1 className="text-3xl font-bold text-center">Hồ sơ cá nhân</h1>
        </CardHeader>

        <CardBody className="flex flex-col items-center gap-8 p-8">
          {error && (
            <div className="w-full max-w-md bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {profile ? (
            <>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full opacity-75 blur-sm group-hover:opacity-100 transition duration-300"></div>
                <Avatar
                  src={profile.imageUrl || "/default-avatar.png"}
                  size="lg"
                  className="border-4 border-white shadow-lg rounded-full relative z-10 h-32 w-32"
                />
              </div>

              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-1">
                  {profile.fullName}
                </h2>
                <p className="text-indigo-600 font-medium text-lg">
                  @{profile.userName}
                </p>
                {userRole === "Psychologist" && (
                  <div className="mt-2 inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                    Chuyên gia tâm lý
                  </div>
                )}
              </div>

              <Divider className="w-2/3 my-2" />

              <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-6 border border-blue-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Thông tin cá nhân
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="w-1/3 text-gray-600 font-medium">
                      Email:
                    </span>
                    <span className="w-2/3 text-gray-800">{profile.email}</span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-1/3 text-gray-600 font-medium">
                      Ngày sinh:
                    </span>
                    <span className="w-2/3 text-gray-800">
                      {new Date(profile.dateOfBirth).toLocaleDateString(
                        "vi-VN",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-1/3 text-gray-600 font-medium">
                      Số điện thoại:
                    </span>
                    <span className="w-2/3 text-gray-800">
                      {profile.phoneNumber || "Chưa cập nhật"}
                    </span>
                  </div>

                  {userRole === "Psychologist" && (
                    <>
                      <div className="flex items-center">
                        <span className="w-1/3 text-gray-600 font-medium">
                          Giá phiên học:
                        </span>
                        <span className="w-2/3 text-gray-800">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(profile.sessionPrice)}
                        </span>
                      </div>

                      <div>
                        <div className="text-gray-600 font-medium mb-1">
                          Giới thiệu:
                        </div>
                        <p className="text-gray-800 bg-gray-50 p-3 rounded-lg text-sm">
                          {profile.bio || "Chưa có thông tin"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                <Button
                  onPress={openUpdateModal}
                  color="primary"
                  className="py-2 px-6 font-medium rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg transition-all duration-300"
                >
                  Cập nhật thông tin
                </Button>
                <Button
                  onPress={logout}
                  color="danger"
                  variant="light"
                  className="py-2 px-6 font-medium rounded-full border border-red-300 hover:bg-red-50 transition-all duration-300"
                >
                  Đăng xuất
                </Button>
              </div>
            </>
          ) : (
            <div className="animate-pulse flex flex-col items-center w-full py-12">
              <div className="w-24 h-24 bg-blue-200 rounded-full mb-4"></div>
              <div className="h-6 w-40 bg-blue-200 rounded mb-3"></div>
              <div className="h-4 w-60 bg-blue-100 rounded mb-8"></div>
              <div className="w-full max-w-md space-y-3">
                <div className="h-4 bg-blue-100 rounded w-3/4"></div>
                <div className="h-4 bg-blue-100 rounded"></div>
                <div className="h-4 bg-blue-100 rounded w-5/6"></div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Update Profile Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        classNames={{
          backdrop: "bg-gray-900/60 backdrop-blur-sm",
          base: "border border-blue-100",
        }}
      >
        <ModalContent>
          <ModalHeader className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3">
            Cập nhật thông tin cá nhân
          </ModalHeader>
          <ModalBody className="py-6">
            {updateError && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-md">
                <p className="text-red-700 text-sm">{updateError}</p>
              </div>
            )}

            <div className="space-y-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ảnh đại diện
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Avatar
                    src={
                      imagePreview || profile?.imageUrl || "/default-avatar.png"
                    }
                    size="lg"
                    className="border-4 border-white shadow-lg rounded-full"
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full bg-blue-50 border-blue-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày sinh nhật
                </label>
                <Input
                  name="dateOfBirth"
                  type="date"
                  value={
                    updatedProfile.dateOfBirth
                      ? new Date(updatedProfile.dateOfBirth)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={handleInputChange}
                  className="w-full bg-blue-50 border-blue-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <Input
                  name="phoneNumber"
                  value={updatedProfile.phoneNumber || ""}
                  onChange={handleInputChange}
                  className="w-full bg-blue-50 border-blue-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-lg"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              {userRole === "Psychologist" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá phiên học
                    </label>
                    <Input
                      name="sessionPrice"
                      type="number"
                      value={updatedProfile.sessionPrice?.toString() || ""}
                      onChange={handleInputChange}
                      className="w-full bg-blue-50 border-blue-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giới thiệu bản thân
                    </label>
                    <textarea
                      name="bio"
                      value={updatedProfile.bio || ""}
                      onChange={(e) =>
                        setUpdatedProfile((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      className="w-full bg-blue-50 border-blue-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-lg p-2 min-h-[120px]"
                    />
                  </div>
                </>
              )}
            </div>
          </ModalBody>
          <ModalFooter className="border-t border-gray-200 pt-4">
            <Button
              color="danger"
              variant="light"
              onPress={onClose}
              className="border border-red-300 hover:bg-red-50"
            >
              Hủy
            </Button>
            <Button
              color="primary"
              onPress={handleUpdateProfile}
              isLoading={isUpdating}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-md transition-all duration-300"
            >
              Lưu thay đổi
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
