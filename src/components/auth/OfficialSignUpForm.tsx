import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import { Eye, EyeOff, Shield, CheckCircle, Upload } from 'lucide-react';
import { registerOfficial } from '../../lib/authApi';

const OfficialSignUpForm: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    institution: '',
    title: '',
    licenseNumber: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofFileName, setProofFileName] = useState<string | null>(null);
  
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Drag and drop or click to upload profile image
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Drag and drop or click to upload proof PDF
  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setProofFile(file);
      setProofFileName(file.name);
    }
  };
  const handleProofDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      setProofFile(file);
      setProofFileName(file.name);
    }
  };
  const handleProofDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const removeProofFile = () => {
    setProofFile(null);
    setProofFileName(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'Passwords do not match. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: 'Terms agreement required',
        description: 'Please agree to the terms and conditions.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      if (profileImage || proofFile) {
        // Upload image and/or proof to backend (multipart/form-data)
        const formDataToSend = new FormData();
        formDataToSend.append('firstName', formData.firstName);
        formDataToSend.append('lastName', formData.lastName);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('phone', formData.phone);
        formDataToSend.append('institution', formData.institution);
        formDataToSend.append('title', formData.title);
        formDataToSend.append('licenseNumber', formData.licenseNumber);
        formDataToSend.append('password', formData.password);
        formDataToSend.append('role', 'official');
        if (profileImage) formDataToSend.append('profileImage', profileImage);
        if (proofFile) formDataToSend.append('proofOfCertificate', proofFile);
        // Add legacy fields for backend compatibility
        formDataToSend.append('company', formData.institution);
        formDataToSend.append('designation', formData.title);
        formDataToSend.append('officialId', formData.licenseNumber);
        formDataToSend.append('name', `${formData.firstName} ${formData.lastName}`);
        const API_URL = import.meta.env.VITE_API_URL || 'https://kidolio.onrender.com';
        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          body: formDataToSend,
        });
        const data = await res.json();
        if (!data.user || !data.token) throw new Error('Registration succeeded but response is missing user or token.');
        login({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          verified: data.user.verified,
        }, data.token);
        localStorage.removeItem('official-signup-data');
        toast({
          title: 'Welcome to Kidolio!',
          description: 'Your account is going to be verified. Please wait up to 2 minutes on this screen. Check your email for updates.',
        });
        navigate('/verifying-account');
        return;
      }
      // No profile image or proof file, use existing registerOfficial function
      const data = await registerOfficial({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        institution: formData.institution,
        title: formData.title,
        licenseNumber: formData.licenseNumber,
        password: formData.password,
        // Add legacy fields for backend compatibility
        company: formData.institution,
        designation: formData.title,
        officialId: formData.licenseNumber,
        name: `${formData.firstName} ${formData.lastName}`,
      });
      login({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        verified: data.user.verified,
      }, data.token);
      localStorage.removeItem('official-signup-data');
      toast({
        title: 'Welcome to Kidolio!',
        description: 'Your account is going to be verified. Please wait up to 2 minutes on this screen. Check your email for updates.',
      });
      navigate('/verifying-account');
    } catch (error: unknown) {
      let errMsg = 'There was an error creating your account. Please try again.';
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data
      ) {
        const data = error.response.data as { message?: string; errors?: { msg: string }[] };
        if (typeof data === 'object') {
          if (data.message) {
            errMsg = data.message;
          } else if (Array.isArray(data.errors)) {
            // Collect all validation error messages
            errMsg = data.errors.map((e) => e.msg).join(' | ');
          }
        }
      }
      toast({
        title: 'Sign up failed',
        description: errMsg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Restore form data from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem('official-signup-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
      } catch { /* ignore restore error */ }
    }
  }, []);

  // Save form data to localStorage on change
  useEffect(() => {
    localStorage.setItem('official-signup-data', JSON.stringify(formData));
  }, [formData]);

  return (
    <Card className="w-full shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl transform hover:scale-105 transition-all duration-500">
      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Official Account
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Join our network of verified educational professionals
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-300 font-medium">
                First Name
              </Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="transition-all duration-300 focus:ring-4 focus:ring-purple-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300 font-medium">
                Last Name
              </Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="transition-all duration-300 focus:ring-4 focus:ring-purple-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
                Professional Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your professional email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="transition-all duration-300 focus:ring-4 focus:ring-purple-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300 font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="transition-all duration-300 focus:ring-4 focus:ring-purple-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="institution" className="text-gray-700 dark:text-gray-300 font-medium">
                Company/School
              </Label>
              <Input
                id="institution"
                name="institution"
                type="text"
                placeholder="Enter your institution"
                value={formData.institution}
                onChange={handleInputChange}
                required
                className="transition-all duration-300 focus:ring-4 focus:ring-purple-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-700 dark:text-gray-300 font-medium">
                Professional Title
              </Label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="e.g., Elementary Teacher, Principal"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="transition-all duration-300 focus:ring-4 focus:ring-purple-500/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseNumber" className="text-gray-700 dark:text-gray-300 font-medium">
              Teaching License Number
            </Label>
            <Input
              id="licenseNumber"
              name="licenseNumber"
              type="text"
              placeholder="Enter your teaching license number"
              value={formData.licenseNumber}
              onChange={handleInputChange}
                required
                className="transition-all duration-300 focus:ring-4 focus:ring-purple-500/20"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This will be verified during the approval process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="pr-12 transition-all duration-300 focus:ring-4 focus:ring-purple-500/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300 font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="pr-12 transition-all duration-300 focus:ring-4 focus:ring-purple-500/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Profile Image Upload */}
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center transition-all duration-300 hover:border-purple-400 dark:hover:border-purple-500 cursor-pointer"
              onClick={() => document.getElementById('profileImageInput')?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {profileImagePreview ? (
                <img src={profileImagePreview} alt="Profile Preview" className="mx-auto mb-2 rounded-full w-20 h-20 object-cover" />
              ) : (
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              )}
              <input
                id="profileImageInput"
                name="profileImage"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageChange}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload a profile photo (JPG, PNG, up to 10MB)
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Drag & drop or click to select a photo
              </p>
            </div>
            {/* Proof of Certificate PDF Upload */}
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center transition-all duration-300 hover:border-purple-400 dark:hover:border-purple-500 cursor-pointer"
              onClick={() => document.getElementById('proofFileInput')?.click()}
              onDrop={handleProofDrop}
              onDragOver={handleProofDragOver}
            >
              {proofFileName ? (
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-purple-700 dark:text-purple-300 font-medium">{proofFileName}</span>
                  <button type="button" className="text-xs text-red-500 underline" onClick={removeProofFile}>Remove</button>
                </div>
              ) : (
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              )}
              <input
                id="proofFileInput"
                name="proofOfCertificate"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleProofFileChange}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload proof of certificate (PDF only)
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Drag & drop or click to select a PDF
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <Label htmlFor="agreeToTerms" className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed cursor-pointer">
              I agree to the{' '}
              <a href="/terms" className="text-purple-600 dark:text-purple-400 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline">
                Privacy Policy
              </a>, and consent to credential verification.
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105 text-white font-semibold py-3 rounded-xl relative overflow-hidden group"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Creating account...</span>
              </div>
            ) : (
              <>
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Create Official Account</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </>
            )}
          </Button>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200/50 dark:border-purple-800/50">
            <Shield className="w-5 h-5 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
            Your account will be reviewed within 24-48 hours. You'll receive an email once verified.
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OfficialSignUpForm;