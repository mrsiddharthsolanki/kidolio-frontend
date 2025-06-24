import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageCircle, ArrowLeft, ArrowRight, Info, Heart, Star, ChevronLeft, Filter, Search, MapPin, Calendar, Trophy, BookOpen, Send, UserCheck, UserX, Clock, User, MessageSquare, Phone, Video, Smile } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface MentorshipMatchProps {
  childId: string;
}

interface ChatMessage {
  id: number;
  sender: string;
  message: string;
  timestamp: string;
  isMe: boolean;
  type?: 'text' | 'emoji' | 'file';
}

interface Connection {
  id: number;
  name: string;
  photo: string;
  isOnline: boolean;
  lastSeen: string;
  unreadCount: number;
  lastMessage: string;
  chatHistory: ChatMessage[];
  rating?: number; // Add rating as optional
}

// Define Match interface
interface Match {
  id: number;
  name: string;
  age: number;
  interests: string[];
  careerGoal: string;
  location: string;
  photo: string;
  matchScore: number;
  commonInterests: string[];
  bio: string;
  achievements: string[];
  skills: string[];
  availability: string;
  responseTime: string;
  mentorshipStyle: string;
  languages: string[];
  isOnline: boolean;
  rating: number;
  totalSessions: number;
  verified: boolean;
  lastSeen: string;
}

// Move mockMatches above all uses
const mockMatches: Match[] = [
  {
    id: 1,
    name: 'Ananya Gupta',
    age: 16,
    interests: ['Coding', 'Chess', 'Mathematics', 'AI/ML'],
    careerGoal: 'Software Engineer',
    location: 'Delhi, India',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    matchScore: 95,
    commonInterests: ['Coding', 'Mathematics'],
    bio: 'Passionate about programming and problem-solving. Love participating in coding competitions and helping others learn. Currently working on AI projects.',
    achievements: ['National Math Olympiad Winner', 'Google Code-in Finalist', 'School Programming Club President'],
    skills: ['Python', 'JavaScript', 'React', 'Machine Learning'],
    availability: 'Weekends',
    responseTime: '< 2 hours',
    mentorshipStyle: 'Project-based learning',
    languages: ['English', 'Hindi'],
    isOnline: true,
    rating: 4.9,
    totalSessions: 45,
    verified: true,
    lastSeen: '2 hours ago'
  },
  {
    id: 2,
    name: 'Karan Mehta',
    age: 17,
    interests: ['Science', 'Photography', 'Environmental Studies', 'Chemistry'],
    careerGoal: 'Environmental Scientist',
    location: 'Mumbai, India',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    matchScore: 88,
    commonInterests: ['Science'],
    bio: 'Nature enthusiast with a keen interest in conservation. Enjoy capturing wildlife through photography and conducting science experiments.',
    achievements: ['Science Fair Champion 2024', 'Wildlife Photography Award', 'Environmental Club Leader'],
    skills: ['Research', 'Data Analysis', 'Photography', 'Lab Techniques'],
    availability: 'Evenings',
    responseTime: '< 4 hours',
    mentorshipStyle: 'Hands-on experiments',
    languages: ['English', 'Hindi', 'Gujarati'],
    isOnline: false,
    rating: 4.7,
    totalSessions: 32,
    verified: true,
    lastSeen: '1 day ago'
  },
  {
    id: 3,
    name: 'Riya Sharma',
    age: 15,
    interests: ['Art', 'Music', 'Creative Writing', 'Digital Design'],
    careerGoal: 'Graphic Designer',
    location: 'Bangalore, India',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    matchScore: 82,
    commonInterests: ['Art'],
    bio: 'Creative soul who loves expressing ideas through visual art and writing. Always eager to collaborate on creative projects and learn new techniques.',
    achievements: ['Young Artist of the Year', 'School Magazine Editor', 'Digital Art Competition Winner'],
    skills: ['Photoshop', 'Illustrator', 'Creative Writing', 'UI Design'],
    availability: 'Flexible',
    responseTime: '< 1 hour',
    mentorshipStyle: 'Creative collaboration',
    languages: ['English', 'Hindi'],
    isOnline: true,
    rating: 4.8,
    totalSessions: 28,
    verified: true,
    lastSeen: 'Just now'
  }
];

const MentorshipMatch: React.FC<MentorshipMatchProps> = ({ childId }) => {
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [ageRange, setAgeRange] = useState([13, 18]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState<Connection | null>(null);
  const [message, setMessage] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>(mockMatches);
  const [activeTab, setActiveTab] = useState('discover');
  const [requests, setRequests] = useState([
    {
      id: 1,
      name: 'Alex Johnson',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      message: 'Wants to connect for Math tutoring',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      name: 'Sarah Chen',
      photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      message: 'Interested in coding collaboration',
      timestamp: '1 day ago'
    }
  ]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([
    {
      id: 1,
      name: 'Ananya Gupta',
      photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      isOnline: true,
      lastSeen: '2 hours ago',
      unreadCount: 0,
      lastMessage: '',
      chatHistory: [],
      rating: 4.9
    },
    {
      id: 2,
      name: 'Karan Mehta',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      isOnline: false,
      lastSeen: '1 day ago',
      unreadCount: 0,
      lastMessage: '',
      chatHistory: [],
      rating: 4.7
    }
  ]);

  // Fetch mentorship matches from backend on mount
  React.useEffect(() => {
    (async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const api = (await import('@/lib/api')).default;
        const res = await api.get('/mentorship/connections');
        setMatches(res.data);
      } catch (error: unknown) {
        let msg = 'Failed to load mentorship connections.';
        if (
          typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
        ) {
          msg = (error as { response: { data: { message: string } } }).response.data.message;
        }
        setErrorMsg(msg);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const currentMatch = filteredMatches[currentMatchIndex];

  const allInterests = ['Coding', 'Chess', 'Mathematics', 'Science', 'Art', 'Music', 'Photography', 'Writing', 'Sports', 'AI/ML'];

  const applyFilters = () => {
    const filtered = mockMatches.filter(match => {
      const matchesSearch = match.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           match.bio.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAge = match.age >= ageRange[0] && match.age <= ageRange[1];
      const matchesInterests = selectedInterests.length === 0 || 
                              selectedInterests.some(interest => match.interests.includes(interest));
      const matchesLocation = !locationFilter || match.location.toLowerCase().includes(locationFilter.toLowerCase());
      const matchesAvailability = !availabilityFilter || match.availability === availabilityFilter;
      const matchesOnline = !onlineOnly || match.isOnline;
      const matchesVerified = !verifiedOnly || match.verified;

      return matchesSearch && matchesAge && matchesInterests && matchesLocation && 
             matchesAvailability && matchesOnline && matchesVerified;
    });

    setFilteredMatches(filtered);
    setCurrentMatchIndex(0);
    setShowFilters(false);
    toast({ title: "Filters Applied", description: `Found ${filtered.length} matches` });
  };

  const handleNextMatch = () => {
    if (currentMatchIndex < filteredMatches.length - 1) {
      setCurrentMatchIndex(currentMatchIndex + 1);
    }
  };

  const handlePrevMatch = () => {
    if (currentMatchIndex > 0) {
      setCurrentMatchIndex(currentMatchIndex - 1);
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChatUser) return;
    
    const newMessage: ChatMessage = {
      id: Date.now(),
      sender: 'You',
      message: message.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    
    // Update the connection's chat history
    setConnections(prev => prev.map(conn => 
      conn.id === selectedChatUser.id 
        ? { 
            ...conn, 
            chatHistory: [...conn.chatHistory, newMessage],
            lastMessage: newMessage.message 
          }
        : conn
    ));
    
    // Update selected chat user
    setSelectedChatUser(prev => prev ? {
      ...prev,
      chatHistory: [...prev.chatHistory, newMessage],
      lastMessage: newMessage.message
    } : null);
    
    setMessage('');
    
    // Simulate mentor response
    setTimeout(() => {
      const responses = [
        "That's a great question! Let me think about the best way to explain this.",
        "I understand what you're going through. I had similar challenges when I was learning.",
        "Have you tried breaking down the problem into smaller parts?",
        "That's exactly the right approach! You're making great progress.",
        "Let me share a resource that might help you with this topic."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const response: ChatMessage = {
        id: Date.now() + 1,
        sender: selectedChatUser.name,
        message: randomResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false
      };
      
      setConnections(prev => prev.map(conn => 
        conn.id === selectedChatUser.id 
          ? { 
              ...conn, 
              chatHistory: [...conn.chatHistory, response],
              lastMessage: response.message 
            }
          : conn
      ));
      
      setSelectedChatUser(prev => prev ? {
        ...prev,
        chatHistory: [...prev.chatHistory, response],
        lastMessage: response.message
      } : null);
    }, 1000 + Math.random() * 2000);
    
    toast({ title: "Message Sent", description: `Your message has been sent to ${selectedChatUser.name}` });
  };

  const handleConnect = (match: Match) => {
    const isAlreadyConnected = connections.find(c => c.id === match.id);
    
    if (isAlreadyConnected) {
      // If already connected, start chat
      setSelectedChatUser(isAlreadyConnected);
      setShowChat(true);
      toast({ 
        title: "Opening Chat", 
        description: `Starting conversation with ${match.name}` 
      });
    } else {
      // Add new connection
      const newConnection: Connection = {
        id: match.id,
        name: match.name,
        photo: match.photo,
        isOnline: match.isOnline,
        lastSeen: match.lastSeen,
        unreadCount: 0,
        lastMessage: '',
        chatHistory: [
          {
            id: 1,
            sender: match.name,
            message: `Hi! I'm ${match.name}. I'm excited to help you with your learning journey. What would you like to work on together?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: false
          }
        ],
        rating: match.rating || 4.5 // Add rating if available
      };
      
      setConnections([...connections, newConnection]);
      setSelectedChatUser(newConnection);
      setShowChat(true);
      toast({ 
        title: "Connection Established", 
        description: `You are now connected with ${match.name}!` 
      });
    }
  };

  const handleAcceptRequest = (requestId: number) => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      setRequests(requests.filter(r => r.id !== requestId));
      setConnections([
        ...connections,
        {
          ...request,
          isOnline: true,
          rating: 4.5,
          unreadCount: 0,
          lastMessage: '',
          chatHistory: [],
          lastSeen: 'Online', // Add lastSeen to match Connection type
        }
      ]);
      toast({
        title: "Request Accepted",
        description: `You are now connected with ${request.name}` 
      });
    }
  };

  const handleDeclineRequest = (requestId: number) => {
    const request = requests.find(r => r.id === requestId);
    setRequests(requests.filter(r => r.id !== requestId));
    toast({ 
      title: "Request Declined", 
      description: `Request from ${request?.name} has been declined` 
    });
  };

  const startChat = (connection: Connection) => {
    setSelectedChatUser(connection);
    setShowChat(true);
    
    // Mark as read
    setConnections(prev => prev.map(conn => 
      conn.id === connection.id ? { ...conn, unreadCount: 0 } : conn
    ));
  };

  // In the main render, show loading and error states
  if (isLoading) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-center py-12">
        <CardContent>
          <div className="text-lg text-blue-600 font-semibold">Loading mentorship connections...</div>
        </CardContent>
      </Card>
    );
  }
  if (errorMsg) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-center py-12">
        <CardContent>
          <div className="text-lg text-red-600 font-semibold mb-4">{errorMsg}</div>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 animate-fade-in">
        <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-500" />
              Find Your Perfect Mentor
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Connect with peers and mentors who share your interests and goals</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="discover" className="animate-scale-in">Discover</TabsTrigger>
            <TabsTrigger value="my-connections" className="animate-scale-in">
              My Connections ({connections.length})
              {connections.some(c => c.unreadCount > 0) && (
                <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">
                  {connections.reduce((total, c) => total + c.unreadCount, 0)}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" className="animate-scale-in">Requests ({requests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6 animate-fade-in">
            {/* Search and Filters */}
            <Card className="hover-scale">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search mentors by name, skills, or interests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <Button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-105">
                      Search
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
                  >
                    <Filter className="w-4 h-4" />
                    Advanced Filters
                  </Button>
                </div>

                {showFilters && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4 animate-slide-in-right">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Age Range: {ageRange[0]} - {ageRange[1]}</Label>
                        <Slider
                          value={ageRange}
                          onValueChange={setAgeRange}
                          max={18}
                          min={10}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input
                          placeholder="City, State"
                          value={locationFilter}
                          onChange={(e) => setLocationFilter(e.target.value)}
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label>Availability</Label>
                        <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                          <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
                            <SelectValue placeholder="Select availability" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg z-50">
                            <SelectItem value="">Any time</SelectItem>
                            <SelectItem value="Weekends">Weekends</SelectItem>
                            <SelectItem value="Evenings">Evenings</SelectItem>
                            <SelectItem value="Flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Interests</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {allInterests.map(interest => (
                            <Badge
                              key={interest}
                              variant={selectedInterests.includes(interest) ? "default" : "outline"}
                              className="cursor-pointer transition-all duration-200 hover:scale-105"
                              onClick={() => {
                                setSelectedInterests(prev => 
                                  prev.includes(interest) 
                                    ? prev.filter(i => i !== interest)
                                    : [...prev, interest]
                                );
                              }}
                            >
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch checked={onlineOnly} onCheckedChange={setOnlineOnly} />
                        <Label>Online now only</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
                        <Label>Verified mentors only</Label>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-105">
                        Apply Filters
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setSearchTerm('');
                        setAgeRange([13, 18]);
                        setSelectedInterests([]);
                        setLocationFilter('');
                        setAvailabilityFilter('');
                        setOnlineOnly(false);
                        setVerifiedOnly(false);
                        setFilteredMatches(mockMatches);
                      }} className="transition-all duration-200 hover:scale-105">
                        Clear All
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Match Display */}
            {currentMatch && (
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-scale-in">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Profile Header */}
                    <div className="flex flex-col lg:flex-row items-center gap-6">
                      <div className="relative">
                        <img
                          src={currentMatch.photo}
                          alt={currentMatch.name}
                          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg transition-transform duration-200 hover:scale-105"
                        />
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                          <Heart className="w-3 h-3" />
                          {currentMatch.matchScore}%
                        </div>
                        {currentMatch.isOnline && (
                          <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                        )}
                        {currentMatch.verified && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white rounded-full p-1">
                            <UserCheck className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 text-center lg:text-left">
                        <div className="flex items-center gap-2 justify-center lg:justify-start mb-2">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {currentMatch.name}, {currentMatch.age}
                          </h3>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium">{currentMatch.rating}</span>
                            <span className="text-xs text-gray-500">({currentMatch.totalSessions} sessions)</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 justify-center lg:justify-start">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">{currentMatch.location}</span>
                            {currentMatch.isOnline && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 animate-pulse">Online</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 justify-center lg:justify-start">
                            <Trophy className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">Goal: {currentMatch.careerGoal}</span>
                          </div>
                          <div className="flex items-center gap-2 justify-center lg:justify-start">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              Available: {currentMatch.availability} • Responds in {currentMatch.responseTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 justify-center lg:justify-start">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              Last seen: {currentMatch.lastSeen}
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 mt-3">
                          {currentMatch.bio}
                        </p>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Interests & Skills
                        </h4>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Interests:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {currentMatch.interests.map((interest, index) => (
                                <Badge 
                                  key={index} 
                                  variant={currentMatch.commonInterests.includes(interest) ? 'default' : 'secondary'}
                                  className={`transition-all duration-200 hover:scale-105 ${currentMatch.commonInterests.includes(interest) ? 'bg-green-500 text-white animate-pulse' : ''}`}
                                >
                                  {interest}
                                  {currentMatch.commonInterests.includes(interest) && (
                                    <Star className="w-3 h-3 ml-1" />
                                  )}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Skills:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {currentMatch.skills.map((skill, index) => (
                                <Badge key={index} variant="outline" className="transition-all duration-200 hover:scale-105">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          Achievements
                        </h4>
                        <ul className="space-y-1">
                          {currentMatch.achievements.map((achievement, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                              <Star className="w-3 h-3 text-yellow-500" />
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Button 
                        onClick={() => handleConnect(currentMatch)}
                        className={`transition-all duration-200 hover:scale-105 ${
                          connections.find(c => c.id === currentMatch.id) 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {connections.find(c => c.id === currentMatch.id) ? 'Send Message' : 'Connect & Message'}
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="transition-all duration-200 hover:scale-105">
                            View Full Profile
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{currentMatch.name}'s Complete Profile</DialogTitle>
                            <DialogDescription>
                              Learn more about your potential mentor
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="text-center">
                              <img
                                src={currentMatch.photo}
                                alt={currentMatch.name}
                                className="w-24 h-24 rounded-full object-cover mx-auto mb-3"
                              />
                              <h3 className="font-bold text-lg">{currentMatch.name}, {currentMatch.age}</h3>
                              <p className="text-gray-600 dark:text-gray-400">{currentMatch.location}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">About</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{currentMatch.bio}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Mentorship Style</h4>
                              <p className="text-sm">{currentMatch.mentorshipStyle}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Languages</h4>
                              <div className="flex gap-2">
                                {currentMatch.languages.map((lang, index) => (
                                  <Badge key={index} variant="outline">{lang}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={handlePrevMatch}
                        disabled={currentMatchIndex === 0}
                        className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {currentMatchIndex + 1} of {filteredMatches.length} matches
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={handleNextMatch}
                        disabled={currentMatchIndex === filteredMatches.length - 1}
                        className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
                      >
                        Next
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my-connections" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>My Mentorship Connections</CardTitle>
              </CardHeader>
              <CardContent>
                {connections.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No connections yet</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Start connecting with mentors to see them here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {connections.map((connection) => (
                      <Card key={connection.id} className="hover-scale transition-all duration-200 cursor-pointer" onClick={() => startChat(connection)}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={connection.photo}
                                alt={connection.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              {connection.isOnline && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium truncate">{connection.name}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">{connection.lastSeen}</span>
                                  {connection.unreadCount > 0 && (
                                    <Badge variant="destructive" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                                      {connection.unreadCount}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {connection.lastMessage || 'Start a conversation...'}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                startChat(connection);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-105"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No pending requests</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Connection requests will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <div key={request.id} className="p-4 border rounded-lg transition-all duration-200 hover:shadow-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img 
                              src={request.photo} 
                              alt={request.name} 
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <h4 className="font-medium">{request.name}</h4>
                              <p className="text-sm text-gray-600">{request.message}</p>
                              <p className="text-xs text-gray-500">{request.timestamp}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-105"
                              onClick={() => handleAcceptRequest(request.id)}
                            >
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="transition-all duration-200 hover:scale-105"
                              onClick={() => handleDeclineRequest(request.id)}
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Chat Dialog */}
        <Dialog open={showChat} onOpenChange={setShowChat}>
          <DialogContent className="max-w-2xl max-h-[80vh] p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={selectedChatUser?.photo} 
                    alt={selectedChatUser?.name} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {selectedChatUser?.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    {selectedChatUser?.name}
                    {selectedChatUser?.isOnline && <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">Online</Badge>}
                  </div>
                  <p className="text-sm text-gray-500 font-normal">
                    {selectedChatUser?.isOnline ? 'Active now' : `Last seen ${selectedChatUser?.lastSeen}`}
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col h-96">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 bg-gray-50 dark:bg-gray-900/50 p-4 mx-6">
                {selectedChatUser?.chatHistory.map(msg => (
                  <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl transition-all duration-200 hover:scale-105 ${
                      msg.isMe 
                        ? 'bg-blue-600 text-white rounded-br-sm' 
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border rounded-bl-sm shadow-sm'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                      <p className={`text-xs mt-1 ${msg.isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t bg-white dark:bg-gray-800">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                      placeholder="Type your message... (Press Enter to send)"
                      className="min-h-[60px] max-h-32 resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      onClick={handleSendMessage} 
                      className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-105"
                      disabled={!message.trim()}
                      size="sm"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default MentorshipMatch;
