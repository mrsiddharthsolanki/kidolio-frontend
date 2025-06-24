import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import { Eye, EyeOff, Users, CheckCircle } from 'lucide-react';
import { registerParent } from '../../lib/authApi';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { countries, educationLevels, incomeRanges } from '../../data/locations';

const ParentSignUpForm: React.FC = () => {  const [formData, setFormData] = useState({
    fatherName: '',
    motherName: '',
    email: '',
    phone: '',
    aadhaar: '',
    address: '',
    occupation: '',
    emergencyContact: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    // New fields
    country: '',
    state: '',
    district: '',
    city: '',
    fatherEducation: '',
    motherEducation: '',
    yearlyIncome: '',
  });
  
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  // Update available options when country changes
  const handleCountryChange = (value: string) => {
    const selectedCountry = countries.find(c => c.name === value);
    if (selectedCountry) {
      setStates(Object.keys(selectedCountry.states));
      setFormData(prev => ({
        ...prev,
        country: value,
        state: '',
        district: '',
        city: ''
      }));
    }
  };

  // Update available districts when state changes
  const handleStateChange = (value: string) => {
    const selectedCountry = countries.find(c => c.name === formData.country);
    if (selectedCountry) {
      setDistricts(Object.keys(selectedCountry.states[value].districts));
      setFormData(prev => ({
        ...prev,
        state: value,
        district: '',
        city: ''
      }));
    }
  };

  // Update available cities when district changes
  const handleDistrictChange = (value: string) => {
    const selectedCountry = countries.find(c => c.name === formData.country);
    if (selectedCountry && formData.state) {
      setCities(selectedCountry.states[formData.state].districts[value]);
      setFormData(prev => ({
        ...prev,
        district: value,
        city: ''
      }));
    }
  };
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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
      const data = await registerParent({
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        email: formData.email,
        phone: formData.phone,
        aadhaar: formData.aadhaar,
        address: formData.address,
        occupation: formData.occupation,
        emergencyContact: formData.emergencyContact,
        password: formData.password,
        country: formData.country,
        state: formData.state,
        district: formData.district,
        city: formData.city,
        fatherEducation: formData.fatherEducation,
        motherEducation: formData.motherEducation,
        yearlyIncome: formData.yearlyIncome,      });

      // Debug: log request data and response
      // console.log('Sending to backend:', {
      //   fatherName: formData.fatherName,
      //   motherName: formData.motherName,
      //   email: formData.email,
      //   phone: formData.phone,
      //   aadhaar: formData.aadhaar,
      //   address: formData.address,
      //   occupation: formData.occupation,
      //   emergencyContact: formData.emergencyContact,
      //   password: formData.password,
      //   country: formData.country,
      //   state: formData.state,
      //   district: formData.district,
      //   city: formData.city,
      //   fatherEducation: formData.fatherEducation,
      //   motherEducation: formData.motherEducation,
      //   yearlyIncome: formData.yearlyIncome,
      // });
      if (!data || !data.user || !data.token) {
        throw new Error('Registration succeeded but response is missing user or token.');
      }
      try {
        login({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          verified: data.user.verified ?? true, // Default to true if not present
        }, data.token);
      } catch (loginError) {
        throw new Error('Account created, but failed to log in. Please try logging in manually.');
      }
      toast({
        title: 'Welcome to Kidolio!',
        description: 'Your parent account has been created successfully.',
      });
      navigate('/parent-dashboard');
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
      } else if (error instanceof Error) {
        errMsg = error.message;
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

  return (
    <Card className="w-full shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl transform hover:scale-105 transition-all duration-500">
      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
          <Users className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Parent Account
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Join thousands of families already using Kidolio
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fatherName" className="text-gray-700 dark:text-gray-300 font-medium">
              Father's Name
            </Label>
            <Input
              id="fatherName"
              name="fatherName"
              type="text"
              placeholder="Enter your father's name"
              value={formData.fatherName}
              onChange={handleInputChange}
              required
              className="transition-all duration-300 focus:ring-4 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motherName" className="text-gray-700 dark:text-gray-300 font-medium">
              Mother's Name
            </Label>
            <Input
              id="motherName"
              name="motherName"
              type="text"
              placeholder="Enter your mother's name"
              value={formData.motherName}
              onChange={handleInputChange}
              required
              className="transition-all duration-300 focus:ring-4 focus:ring-blue-500/20"
            />          </div>

          {/* Father's Education */}
          <div className="space-y-2">
            <Label htmlFor="fatherEducation" className="text-gray-700 dark:text-gray-300 font-medium">
              Father's Education Level
            </Label>
            <Select
              onValueChange={(value) => setFormData(prev => ({ ...prev, fatherEducation: value }))}
              value={formData.fatherEducation}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select education level" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {educationLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Mother's Education */}
          <div className="space-y-2">
            <Label htmlFor="motherEducation" className="text-gray-700 dark:text-gray-300 font-medium">
              Mother's Education Level
            </Label>
            <Select
              onValueChange={(value) => setFormData(prev => ({ ...prev, motherEducation: value }))}
              value={formData.motherEducation}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select education level" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {educationLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Yearly Income */}
          <div className="space-y-2">
            <Label htmlFor="yearlyIncome" className="text-gray-700 dark:text-gray-300 font-medium">
              Yearly Income Range
            </Label>
            <Select
              onValueChange={(value) => setFormData(prev => ({ ...prev, yearlyIncome: value }))}
              value={formData.yearlyIncome}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select income range" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {incomeRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Country Selection */}
          <div className="space-y-2">
            <Label htmlFor="country" className="text-gray-700 dark:text-gray-300 font-medium">
              Country
            </Label>
            <Select
              onValueChange={handleCountryChange}
              value={formData.country}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {countries.map((country) => (
                    <SelectItem key={country.name} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* State Selection */}
          <div className="space-y-2">
            <Label htmlFor="state" className="text-gray-700 dark:text-gray-300 font-medium">
              State
            </Label>
            <Select
              onValueChange={handleStateChange}
              value={formData.state}
              disabled={!formData.country}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* District Selection */}
          <div className="space-y-2">
            <Label htmlFor="district" className="text-gray-700 dark:text-gray-300 font-medium">
              District
            </Label>
            <Select
              onValueChange={handleDistrictChange}
              value={formData.district}
              disabled={!formData.state}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {districts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* City Selection */}
          <div className="space-y-2">
            <Label htmlFor="city" className="text-gray-700 dark:text-gray-300 font-medium">
              City
            </Label>
            <Select
              onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
              value={formData.city}
              disabled={!formData.district}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="transition-all duration-300 focus:ring-4 focus:ring-blue-500/20"
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
              className="transition-all duration-300 focus:ring-4 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationalId" className="text-gray-700 dark:text-gray-300 font-medium">
              National ID
            </Label>
            <Input
              id="aadhaar"
              name="aadhaar"
              type="text"
              placeholder="Enter your Aadhaar number"
              value={formData.aadhaar}
              onChange={handleInputChange}
              required
              className="transition-all duration-300 focus:ring-4 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-gray-700 dark:text-gray-300 font-medium">
              Address
            </Label>
            <Input
              id="address"
              name="address"
              type="text"
              placeholder="Enter your address"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="transition-all duration-300 focus:ring-4 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation" className="text-gray-700 dark:text-gray-300 font-medium">
              Occupation
            </Label>
            <Input
              id="occupation"
              name="occupation"
              type="text"
              placeholder="Enter your occupation"
              value={formData.occupation}
              onChange={handleInputChange}
              required
              className="transition-all duration-300 focus:ring-4 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContact" className="text-gray-700 dark:text-gray-300 font-medium">
              Emergency Contact
            </Label>
            <Input
              id="emergencyContact"
              name="emergencyContact"
              type="text"
              placeholder="Enter emergency contact number"
              value={formData.emergencyContact}
              onChange={handleInputChange}
              required
              className="transition-all duration-300 focus:ring-4 focus:ring-blue-500/20"
            />
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
                  className="pr-12 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20"
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
                  className="pr-12 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20"
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

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="agreeToTerms" className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed cursor-pointer">
              I agree to the{' '}
              <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                Privacy Policy
              </a>
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:scale-105 text-white font-semibold py-3 rounded-xl relative overflow-hidden group"
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
                  <span>Create Parent Account</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ParentSignUpForm;