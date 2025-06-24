import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Briefcase, Search, MapPin, Clock, DollarSign, GraduationCap, TrendingUp, Star, BookOpen, Target, Users, Award, ChevronRight, Filter, Calendar, Building, Globe, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Define types for Job and Course
interface Job {
  id: number;
  title: string;
  company: string;
  logo: string;
  urgency?: string;
  location: string;
  isRemote?: boolean;
  type: string;
  salary: string;
  posted: string;
  skills: string[];
  description: string;
  requirements: string[];
  experience: string;
  applicants: number;
}
interface Course {
  id: number;
  title: string;
  provider: string;
  thumbnail: string;
  hasPlacement?: boolean;
  duration: string;
  level: string;
  rating: number;
  students: number;
  skills: string[];
  description: string;
  price: string;
}

const CareerPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<number[]>([]);
  const [careerGoals, setCareerGoals] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredJobs, setFilteredJobs] = useState(jobs);
  const [filteredCourses, setFilteredCourses] = useState(courses);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch jobs and courses from backend on mount
  React.useEffect(() => {
    (async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const api = (await import('@/lib/api')).default;
        const [jobsRes, coursesRes] = await Promise.all([
          api.get('/job'),
          api.get('/course'),
        ]);
        setJobs(jobsRes.data);
        setCourses(coursesRes.data);
      } catch (error) {
        let msg = 'Failed to load opportunities.';
        if (error && typeof error === 'object' && 'response' in error && error.response?.data?.message) {
          msg = error.response.data.message;
        }
        setErrorMsg(msg);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const applyFilters = () => {
    const filtered = jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());
      const matchesType = !jobTypeFilter || job.type === jobTypeFilter;
      const matchesExperience = !experienceFilter || job.experience === experienceFilter;
      return matchesSearch && matchesLocation && matchesType && matchesExperience;
    });
    setFilteredJobs(filtered);
    toast({ title: "Filters Applied", description: `Found ${filtered.length} opportunities` });
  };

  const applyForJob = (jobId: number) => {
    if (!appliedJobs.includes(jobId)) {
      setAppliedJobs([...appliedJobs, jobId]);
      toast({ 
        title: "Application Submitted", 
        description: "Your application has been sent successfully!" 
      });
    } else {
      toast({ 
        title: "Already Applied", 
        description: "You have already applied for this position." 
      });
    }
  };

  const enrollInCourse = (courseId: number) => {
    if (!enrolledCourses.includes(courseId)) {
      setEnrolledCourses([...enrolledCourses, courseId]);
      toast({ 
        title: "Enrolled Successfully", 
        description: "You are now enrolled in this course!" 
      });
    } else {
      toast({ 
        title: "Already Enrolled", 
        description: "You are already enrolled in this course." 
      });
    }
  };

  const saveCareerGoals = () => {
    if (careerGoals.trim()) {
      toast({ 
        title: "Goals Saved", 
        description: "Your career goals have been updated successfully!" 
      });
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      toast({ 
        title: "Skill Added", 
        description: `${newSkill} has been added to your profile!` 
      });
      setNewSkill('');
    }
  };

  // In the main render, show loading and error states
  if (isLoading) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-center py-12">
        <CardContent>
          <div className="text-lg text-blue-600 font-semibold">Loading opportunities...</div>
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

  // Fallback for filteredSkills
  const filteredSkills = [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Briefcase className="w-6 h-6 text-purple-500" />
            Career Portal
            <Badge variant="secondary" className="ml-2">
              {filteredJobs.length} Opportunities
            </Badge>
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Explore career opportunities, learn new skills, and plan your future
          </p>
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Job Opportunities
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            My Skills
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Career Goals
          </TabsTrigger>
        </TabsList>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-6">
          {/* Search and Filters */}
          <Card className="hover-scale">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search jobs, companies, or skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={applyFilters} className="bg-purple-600 hover:bg-purple-700">
                    Search
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg animate-slide-in-right">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <Input
                      placeholder="City, State"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Job Type</label>
                    <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                        <SelectItem value="Training Program">Training Program</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Experience</label>
                    <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Levels</SelectItem>
                        <SelectItem value="Fresher">Fresher</SelectItem>
                        <SelectItem value="Entry Level">Entry Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Listings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover-scale transition-all duration-200 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Job Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img src={job.logo} alt={job.company} className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400">{job.company}</p>
                        </div>
                      </div>
                      {job.urgency === 'high' && (
                        <Badge variant="destructive" className="animate-pulse">
                          <Zap className="w-3 h-3 mr-1" />
                          Urgent
                        </Badge>
                      )}
                    </div>

                    {/* Job Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{job.location}</span>
                        {job.isRemote && <Badge variant="secondary">Remote</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-500" />
                        <span>{job.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span>{job.salary}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{job.posted}</span>
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill, index) => (
                          <Badge key={index} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
                      {job.description}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => applyForJob(job.id)}
                        className={appliedJobs.includes(job.id) ? "bg-green-600" : "bg-purple-600 hover:bg-purple-700"}
                        disabled={appliedJobs.includes(job.id)}
                      >
                        {appliedJobs.includes(job.id) ? 'Applied' : 'Apply Now'}
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" onClick={() => setSelectedJob(job)}>
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{selectedJob?.title} - {selectedJob?.company}</DialogTitle>
                          </DialogHeader>
                          {selectedJob && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <img src={selectedJob.logo} alt={selectedJob.company} className="w-16 h-16 rounded-lg" />
                                <div>
                                  <h3 className="font-bold text-xl">{selectedJob.title}</h3>
                                  <p className="text-gray-600">{selectedJob.company}</p>
                                  <div className="flex items-center gap-4 mt-2">
                                    <Badge>{selectedJob.type}</Badge>
                                    <Badge variant="outline">{selectedJob.experience}</Badge>
                                    <span className="text-sm text-gray-500">{selectedJob.applicants} applicants</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">Job Description</h4>
                                <p className="text-gray-700 dark:text-gray-300">{selectedJob.description}</p>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">Requirements</h4>
                                <ul className="list-disc list-inside space-y-1">
                                  {selectedJob.requirements.map((req: string, index: number) => (
                                    <li key={index} className="text-gray-700 dark:text-gray-300">{req}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">Required Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                  {selectedJob.skills.map((skill: string, index: number) => (
                                    <Badge key={index} variant="outline">{skill}</Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <Button 
                                onClick={() => applyForJob(selectedJob.id)} 
                                className="w-full"
                                disabled={appliedJobs.includes(selectedJob.id)}
                              >
                                {appliedJobs.includes(selectedJob.id) ? 'Already Applied' : 'Apply for this Job'}
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover-scale transition-all duration-200 hover:shadow-lg">
                <div className="relative">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover rounded-t-lg" />
                  {course.hasPlacement && (
                    <Badge className="absolute top-2 right-2 bg-green-600">
                      Placement Assured
                    </Badge>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{course.provider}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4 text-gray-500" />
                        <span>{course.level}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{course.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span>{course.students} students</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {course.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">{skill}</Badge>
                      ))}
                      {course.skills.length > 3 && (
                        <Badge variant="secondary" className="text-xs">+{course.skills.length - 3} more</Badge>
                      )}
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-bold text-purple-600">{course.price}</span>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedCourse(course)}>
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{selectedCourse?.title}</DialogTitle>
                            </DialogHeader>
                            {selectedCourse && (
                              <div className="space-y-4">
                                <img src={selectedCourse.thumbnail} alt={selectedCourse.title} className="w-full h-48 object-cover rounded-lg" />
                                <div>
                                  <h4 className="font-semibold mb-2">About this course</h4>
                                  <p className="text-gray-700 dark:text-gray-300">{selectedCourse.description}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">What you'll learn</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedCourse.skills.map((skill: string, index: number) => (
                                      <Badge key={index} variant="outline">{skill}</Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <span className="font-medium">Duration:</span> {selectedCourse.duration}
                                  </div>
                                  <div>
                                    <span className="font-medium">Level:</span> {selectedCourse.level}
                                  </div>
                                  <div>
                                    <span className="font-medium">Students:</span> {selectedCourse.students}
                                  </div>
                                  <div>
                                    <span className="font-medium">Rating:</span> {selectedCourse.rating}/5
                                  </div>
                                </div>
                                <Button 
                                  onClick={() => enrollInCourse(selectedCourse.id)} 
                                  className="w-full"
                                  disabled={enrolledCourses.includes(selectedCourse.id)}
                                >
                                  {enrolledCourses.includes(selectedCourse.id) ? 'Enrolled' : `Enroll for ${selectedCourse.price}`}
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button 
                          size="sm" 
                          onClick={() => enrollInCourse(course.id)}
                          className={enrolledCourses.includes(course.id) ? "bg-green-600" : "bg-purple-600 hover:bg-purple-700"}
                          disabled={enrolledCourses.includes(course.id)}
                        >
                          {enrolledCourses.includes(course.id) ? 'Enrolled' : 'Enroll'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                My Skills Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Skill */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a new skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={addSkill} className="bg-purple-600 hover:bg-purple-700">
                  <Award className="w-4 h-4 mr-2" />
                  Add Skill
                </Button>
              </div>

              {/* Skills Progress */}
              <div className="space-y-4">
                {filteredSkills.map((skill, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{skill.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">{skill.category}</Badge>
                      </div>
                      <span className="text-sm font-medium">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </div>
                ))}
              </div>

              {/* Skill Recommendations */}
              <div className="mt-8">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Recommended Skills to Learn
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Machine Learning', 'Cloud Computing', 'UI/UX Design', 'Data Visualization'].map((skill, index) => (
                    <Card key={index} className="p-4 hover-scale cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{skill}</span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">High demand skill</p>
                        </div>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Career Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                My Career Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="font-medium mb-2 block">Describe your career aspirations</label>
                  <Textarea
                    placeholder="What do you want to achieve in your career? What roles interest you? What industries do you want to work in?"
                    value={careerGoals}
                    onChange={(e) => setCareerGoals(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
                <Button onClick={saveCareerGoals} className="bg-purple-600 hover:bg-purple-700">
                  Save Goals
                </Button>
              </div>

              {/* Career Path Suggestions */}
              <div className="mt-8">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Suggested Career Paths
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Software Developer', growth: '+22%', salary: '₹6-12 LPA', skills: ['Programming', 'Problem Solving'] },
                    { title: 'Data Scientist', growth: '+31%', salary: '₹8-15 LPA', skills: ['Statistics', 'Python', 'ML'] },
                    { title: 'Digital Marketer', growth: '+18%', salary: '₹4-8 LPA', skills: ['Analytics', 'Creativity'] },
                    { title: 'UX Designer', growth: '+13%', salary: '₹5-10 LPA', skills: ['Design', 'User Research'] }
                  ].map((path, index) => (
                    <Card key={index} className="p-4 hover-scale">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold">{path.title}</h5>
                          <Badge className="bg-green-100 text-green-800">{path.growth} growth</Badge>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-3 h-3" />
                            {path.salary}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {path.skills.map((skill, skillIndex) => (
                              <Badge key={skillIndex} variant="outline" className="text-xs">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          Explore Path
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CareerPortal;
