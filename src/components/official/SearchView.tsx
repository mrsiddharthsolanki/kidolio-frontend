import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Eye, MapPin, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { countries } from '@/data/locations';
import { useNavigate } from 'react-router-dom';

interface SearchFilters {
  country: string;
  state: string;
  city: string;
  disability: string;
  bloodGroup: string;
  ageMin: string;
  ageMax: string;
  skills: string;
  parentIncome: string;
  parentEducation: string;
}

interface ChildProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  city: string;
  country: string;
  disability: string;
  bloodGroup: string;
  skills: string[];
  parentName: string;
  parentIncome: string;
  parentEducation: string;
  parentPhone: string;
  parentEmail: string;
  parentOccupation: string;
  address: string;
  emergencyContact: string;
  medicalHistory: string[];
  academicRecords: Array<{
    subject: string;
    grade: string;
    year: string;
    score: number;
  }>;
  achievements: Array<{
    title: string;
    date: string;
    description: string;
  }>;
  documents: Array<{
    name: string;
    type: string;
    date: string;
  }>;
}

const SearchView: React.FC = () => {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    country: '',
    state: '',
    city: '',
    disability: '',
    bloodGroup: '',
    ageMin: '',
    ageMax: '',
    skills: '',
    parentIncome: '',
    parentEducation: ''
  });

  // For country/state/city dropdowns
  const countryOptions = countries.map(c => c.name);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const stateOptions = React.useMemo(() => {
    if (!selectedCountry) return [];
    const country = countries.find(c => c.name === selectedCountry);
    if (!country) return [];
    return Object.keys(country.states);
  }, [selectedCountry]);
  const cityOptions = React.useMemo(() => {
    if (!selectedCountry || !selectedState) return [];
    const country = countries.find(c => c.name === selectedCountry);
    if (!country) return [];
    const state = (country.states as Record<string, { districts: Record<string, string[]> }>)[selectedState];
    if (!state) return [];
    return Object.keys(state.districts);
  }, [selectedCountry, selectedState]);

  // Search results state (dynamic, no mock data)
  const [searchResults, setSearchResults] = useState<ChildProfile[]>([]);
  const navigate = useNavigate();

  const handleSearch = async () => {
    try {
      const params = { ...searchFilters };
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });
      // Debug: log params and try/catch errors
      console.log('Search params:', params);
      const res = await api.get('/child/search', { params });
      setSearchResults(res.data.map(child => ({
        id: child._id,
        name: child.name || 'None',
        age: child.dob ? Math.floor((Date.now() - new Date(child.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null,
        gender: child.gender || 'None',
        city: child.city || 'None',
        country: child.country || 'None',
        disability: child.disability || 'None',
        bloodGroup: child.bloodGroup || 'None',
        skills: child.skills && child.skills.length ? child.skills : ['None'],
        parentName: child.parent?.name || 'None',
        parentIncome: child.parent?.yearlyIncome || 'None',
        parentEducation: child.parent?.education || 'None',
        parentPhone: child.parent?.phone || 'None',
        parentEmail: child.parent?.email || 'None',
        parentOccupation: child.parent?.occupation || 'None',
        address: child.parent?.address || 'None',
        emergencyContact: child.parent?.emergencyContact || 'None',
        medicalHistory: child.medicalHistory && child.medicalHistory.length ? child.medicalHistory : ['None'],
        academicRecords: child.academicRecords && child.academicRecords.length ? child.academicRecords : [],
        achievements: child.achievements && child.achievements.length ? child.achievements : [],
        documents: child.documents && child.documents.length ? child.documents : [],
      })));
      toast({ title: "Search Complete", description: "Search results have been updated based on your filters." });
    } catch (err) {
      console.error('Search error:', err);
      if (err.response && err.response.data) {
        toast({ title: "Search Error", description: err.response.data.message || "Could not fetch search results." });
      } else {
        toast({ title: "Search Error", description: "Could not fetch search results." });
      }
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setSearchFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchFilters({
      country: '',
      state: '',
      city: '',
      disability: '',
      bloodGroup: '',
      ageMin: '',
      ageMax: '',
      skills: '',
      parentIncome: '',
      parentEducation: ''
    });
    toast({ title: "Filters Cleared", description: "All search filters have been reset." });
  };

  return (
    <div className="container mx-auto px-6 space-y-6 max-w-[1400px] -mt-8">
      {/* Header Section with Background Elements */}
      <div className="relative z-0">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl opacity-70 dark:from-blue-400/10 dark:to-purple-400/10" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-gradient-to-br from-green-400/20 to-teal-400/20 rounded-full blur-3xl opacity-70 dark:from-green-400/10 dark:to-teal-400/10" />
      </div>

      {/* Search Filters Card */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-md -mt-4">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-transparent to-gray-100/50 dark:from-gray-800/50 dark:via-transparent dark:to-gray-900/50" />
        <CardHeader className="relative border-b border-gray-200 dark:border-gray-700 pb-3">
          <CardTitle className="flex items-center gap-3 text-xl">
            <Search className="w-5 h-5 text-blue-600" />
            Advanced Search Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="relative p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Location Group */}
            <div className="space-y-4 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Location</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Country</label>
                  <Select
                    value={searchFilters.country}
                    onValueChange={value => {
                      handleFilterChange('country', value);
                      setSelectedCountry(value);
                      setSelectedState('');
                      handleFilterChange('state', '');
                      handleFilterChange('city', '');
                    }}
                  >
                    <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryOptions.map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">State</label>
                  <Select
                    value={searchFilters.state}
                    onValueChange={value => {
                      handleFilterChange('state', value);
                      setSelectedState(value);
                      handleFilterChange('city', '');
                    }}
                    disabled={!selectedCountry}
                  >
                    <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectValue placeholder={selectedCountry ? "Select state" : "Select country first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {stateOptions.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">City</label>
                  <Select
                    value={searchFilters.city}
                    onValueChange={value => handleFilterChange('city', value)}
                    disabled={!selectedState}
                  >
                    <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectValue placeholder={selectedState ? "Select city" : "Select state first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {cityOptions.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Personal Details Group */}
            <div className="space-y-4 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Personal Details</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Age Range</label>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Min"
                      type="number"
                      value={searchFilters.ageMin}
                      onChange={(e) => handleFilterChange('ageMin', e.target.value)}
                      className="bg-white dark:bg-gray-800"
                    />
                    <Input
                      placeholder="Max"
                      type="number"
                      value={searchFilters.ageMax}
                      onChange={(e) => handleFilterChange('ageMax', e.target.value)}
                      className="bg-white dark:bg-gray-800"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Blood Group</label>
                  <Select value={searchFilters.bloodGroup} onValueChange={(value) => handleFilterChange('bloodGroup', value)}>
                    <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Medical & Support Group */}
            <div className="space-y-4 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Medical & Support</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Disability Status</label>
                  <Select value={searchFilters.disability} onValueChange={(value) => handleFilterChange('disability', value)}>
                    <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="Visual Impairment">Visual Impairment</SelectItem>
                      <SelectItem value="Hearing Impairment">Hearing Impairment</SelectItem>
                      <SelectItem value="Physical Disability">Physical Disability</SelectItem>
                      <SelectItem value="Learning Disability">Learning Disability</SelectItem>
                      <SelectItem value="Multiple Disabilities">Multiple Disabilities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Family Background Group */}
            <div className="space-y-4 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Family Background</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Parent Income</label>
                  <Select value={searchFilters.parentIncome} onValueChange={(value) => handleFilterChange('parentIncome', value)}>
                    <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectValue placeholder="Select income range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-25000">₹0 - ₹25,000</SelectItem>
                      <SelectItem value="25000-50000">₹25,000 - ₹50,000</SelectItem>
                      <SelectItem value="50000-100000">₹50,000 - ₹1,00,000</SelectItem>
                      <SelectItem value="100000+">₹1,00,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Parent Education</label>
                  <Select value={searchFilters.parentEducation} onValueChange={(value) => handleFilterChange('parentEducation', value)}>
                    <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectValue placeholder="Select education" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-school">High School</SelectItem>
                      <SelectItem value="graduate">Graduate</SelectItem>
                      <SelectItem value="post-graduate">Post Graduate</SelectItem>
                      <SelectItem value="doctorate">Doctorate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              onClick={handleSearch}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 h-11 rounded-full font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Profiles
            </Button>
            <Button 
              onClick={clearFilters}
              variant="outline"
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full h-11"
            >
              Clear All Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-transparent to-gray-100/50 dark:from-gray-800/50 dark:via-transparent dark:to-gray-900/50" />
        <CardHeader className="relative border-b border-gray-200 dark:border-gray-700 pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-green-600" />
              <span>Search Results</span>
            </div>
            <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 text-xs font-medium">
              {searchResults.length} profiles found
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative p-6">
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((profile) => (
                <Card
                  key={profile.id}
                  className="group relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/25 dark:hover:shadow-gray-900/50 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-transparent to-gray-100/50 dark:from-gray-800/50 dark:via-transparent dark:to-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Decorative Elements */}
                  <div className="absolute -right-12 -top-12 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-gradient-to-br from-green-400/10 to-teal-400/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100" />

                  <CardContent className="relative p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {profile.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {profile.age !== null ? `${profile.age} years` : 'Age N/A'} • {profile.gender}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`
                          px-2.5 py-0.5 text-xs font-medium
                          ${profile.bloodGroup.includes('+') 
                            ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800' 
                            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'}
                        `}
                      >
                        {profile.bloodGroup}
                      </Badge>
                    </div>

                    {/* Location Info */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span className="truncate">{profile.city}, {profile.country}</span>
                    </div>

                    {/* Disability Info */}
                    {profile.disability && profile.disability !== 'None' && (
                      <div className="px-3 py-2 rounded-lg bg-amber-50/50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
                        <p className="text-xs font-medium text-amber-800 dark:text-amber-300">{profile.disability}</p>
                      </div>
                    )}

                    {/* Action Button */}
                    <Button 
                      onClick={() => navigate(`/official/profile/${profile.id}`)}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-200 group"
                    >
                      <Eye className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                      View Complete Profile
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 mb-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No profiles found</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                Try adjusting your search filters to find more results or clear all filters to start over.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchView;