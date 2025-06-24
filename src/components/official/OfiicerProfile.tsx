import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Mail, Phone, Briefcase, User, School, FileText, Image as ImageIcon, FileCheck2 } from 'lucide-react';
import { fetchOfficialProfile } from '@/lib/officialApi';

const fieldConfigs = [
	{
		key: 'firstName',
		label: 'First Name',
		icon: <User className="w-5 h-5 text-white" />,
		bg: 'from-blue-500 to-purple-500',
		gradient: true,
	},
	{
		key: 'lastName',
		label: 'Last Name',
		icon: <User className="w-5 h-5 text-white" />,
		bg: 'from-purple-500 to-violet-500',
		gradient: true,
	},
	{
		key: 'email',
		label: 'Professional Email',
		icon: <Mail className="w-5 h-5 text-white" />,
		bg: 'from-green-500 to-emerald-500',
		gradient: true,
	},
	{
		key: 'phone',
		label: 'Phone Number',
		icon: <Phone className="w-5 h-5 text-white" />,
		bg: 'from-pink-500 to-rose-500',
		gradient: true,
	},
	{
		key: 'institution',
		label: 'Company/School',
		icon: <School className="w-5 h-5 text-white" />,
		bg: 'from-yellow-500 to-amber-500',
		gradient: true,
	},
	{
		key: 'title',
		label: 'Professional Title',
		icon: <Briefcase className="w-5 h-5 text-white" />,
		bg: 'from-orange-500 to-red-500',
		gradient: true,
	},
	{
		key: 'licenseNumber',
		label: 'Teaching License Number',
		icon: <FileText className="w-5 h-5 text-white" />,
		bg: 'from-cyan-500 to-blue-500',
		gradient: true,
		help: 'This will be verified during the approval process.',
	},
];

const valueBgMap = {
	firstName: 'bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100',
	lastName: 'bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100',
	email: 'bg-green-200 dark:bg-green-900 text-green-900 dark:text-green-100',
	phone: 'bg-pink-200 dark:bg-pink-900 text-pink-900 dark:text-pink-100',
	institution: 'bg-yellow-600 dark:bg-yellow-800 text-white',
	title: 'bg-orange-200 dark:bg-orange-900 text-orange-900 dark:text-orange-100',
	licenseNumber: 'bg-cyan-200 dark:bg-cyan-900 text-cyan-900 dark:text-cyan-100',
};

interface OfficerProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  institution?: string;
  title?: string;
  licenseNumber?: string;
  profileImage?: string;
  proofOfCertificate?: string;
}

const OfficerProfile: React.FC = () => {
	const { user } = useAuth();
	const [profile, setProfile] = useState<OfficerProfile | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchOfficialProfile().then(data => {
			setProfile(data);
			setLoading(false);
		});
	}, []);

	return (
		<Layout>
			<div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/50 to-indigo-50/50 dark:from-gray-900 dark:via-blue-900/25 dark:to-indigo-900/25 transition-all duration-1000 ease-in-out py-8">
				{/* Animated Background Elements */}
				<div className="fixed inset-0 pointer-events-none">
					<div 
						className="absolute w-[500px] h-[500px] bg-gradient-to-r from-blue-500/15 to-purple-500/15 dark:from-blue-400/8 dark:to-purple-400/8 rounded-full blur-3xl transition-all duration-1000 ease-out left-[5%] top-[15%]"
					/>
					<div 
						className="absolute w-80 h-80 bg-gradient-to-r from-green-500/15 to-blue-500/15 dark:from-green-400/8 dark:to-blue-400/8 rounded-full blur-3xl transition-all duration-1000 ease-out right-[5%] bottom-[15%]"
					/>
					<div 
						className="absolute w-64 h-64 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-400/5 dark:to-pink-400/5 rounded-full blur-3xl transition-all duration-1000 ease-out left-[50%] top-[50%]"
					/>
				</div>
				
				<div className="max-w-6xl mx-auto px-4">
					{/* Header */}
					<div className="text-center mb-12">
						<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
							Welcome to Your
							<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Official Dashboard</span>
						</h1>
						<p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
							Manage your professional profile and credentials in one place
						</p>
					</div>

					<Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl animate-fadeIn rounded-3xl overflow-hidden">
						<CardHeader className="border-b border-gray-200 dark:border-gray-800">
							<div className="flex items-center gap-4">									<div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
									<User className="w-6 h-6 text-white animate-pulse" />
								</div>
								<div>
									<span className="text-sm text-gray-500 dark:text-gray-400">Welcome Back,</span>
									<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
										<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
											Official Profile
										</span>
									</h1>
								</div>
							</div>
						</CardHeader>
					<CardContent className="p-6">
						{loading ? (
							<div className="flex items-center justify-center min-h-[400px]">
								<div className="text-center">
									<div className="relative w-20 h-20 mx-auto mb-6">
										<div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-800"></div>
										<div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
									</div>
									<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Loading your profile...</h3>
									<p className="text-gray-500 dark:text-gray-400">Just a moment while we gather your details ✨</p>
								</div>
							</div>
						) : (
							<div className="flex flex-col md:flex-row gap-8 items-start">
								{/* Profile Photo Section */}
								<div className="flex flex-col items-center gap-6 w-full md:w-1/3">
									<div className="group/avatar relative">
										<div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full opacity-20 group-hover/avatar:opacity-40 blur-xl transition-all duration-500"></div>
										<div className="relative">
											{profile?.profileImage ? (
												<img
													src={profile.profileImage}
													alt="Profile"
													className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-2xl ring-4 ring-blue-200/50 dark:ring-purple-700/50 group-hover/avatar:scale-105 group-hover/avatar:rotate-6 transition-all duration-700"
												/>
											) : (
												<div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-2xl ring-4 ring-blue-200/50 dark:ring-purple-700/50 group-hover/avatar:scale-105 transition-all duration-500">
													<User className="w-16 h-16 md:w-20 md:h-20 text-white drop-shadow-lg" />
												</div>
											)}
										</div>
										<div className="absolute -top-2 -right-2 flex items-center gap-1">
											<div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800">
												<FileCheck2 className="w-4 h-4 text-white" />
											</div>
										</div>
									</div>										<div className="text-center relative group/name">
											<h2 className="text-2xl font-bold mb-2">
												<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover/name:from-purple-600 group-hover/name:to-pink-600 transition-all duration-500">
													{profile?.firstName} {profile?.lastName}
												</span>
											</h2>
											<div className="relative inline-block">
												<div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-500/10 dark:to-purple-500/10 rounded-full blur-xl transition-all duration-500 opacity-0 group-hover/name:opacity-100"></div>
												<p className="relative text-sm font-medium px-4 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 text-blue-700 dark:text-blue-300">
													{profile?.title || 'Official'}
												</p>
											</div>
										</div>
									<div className="group/item flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-700/30 hover:bg-emerald-100/80 dark:hover:bg-emerald-800/30 hover:shadow-2xl hover:scale-[1.02] hover:-rotate-2 transition-all duration-500">
										<div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-xl group-hover/item:shadow-2xl group-hover/item:scale-110 group-hover/item:rotate-6 transition-all duration-500">
											<FileCheck2 className="w-6 h-6 text-white group-hover/item:animate-pulse" />
										</div>
										<div className="flex-1">
											<p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Proof of Certificate (PDF)</p>
											{profile?.proofOfCertificate ? (
												<a
													href={profile.proofOfCertificate}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold transition-colors duration-200"
												>
													<span>View Certificate</span>
													<FileText className="w-4 h-4 group-hover/item:animate-bounce" />
												</a>
											) : (
												<p className="text-gray-400 dark:text-gray-500 italic">No certificate uploaded</p>
											)}
										</div>
									</div>
								</div>
								{/* Info Fields Section */}
								<div className="flex-1 space-y-8">
									{/* Professional Information */}
									<div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-0 overflow-hidden">
										<div className="relative p-6 lg:p-8 space-y-6">
											{/* Contact Information */}
											<div>
												<div className="flex items-center gap-4 mb-6">
													<div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg hover:scale-110 hover:rotate-6 transition-all duration-500">
														<User className="w-6 h-6 text-white animate-pulse" />
													</div>
													<div>
														<h3 className="text-2xl font-bold text-gray-900 dark:text-white">Professional Information</h3>
														<p className="text-gray-600 dark:text-gray-400">Your contact and credential details</p>
													</div>
												</div>

												<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
													{fieldConfigs.map((field, idx) => (
														<div
															key={field.key}
															className="group/item flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-600/50 hover:bg-gray-50/80 dark:hover:bg-gray-700/80 hover:shadow-2xl hover:scale-[1.02] hover:-rotate-1 transition-all duration-500"
														>
															<div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${
																field.key === 'firstName' || field.key === 'lastName' ? 'from-blue-500 to-purple-500'
																: field.key === 'email' ? 'from-green-500 to-emerald-500'
																: field.key === 'phone' ? 'from-pink-500 to-rose-500'
																: field.key === 'institution' ? 'from-yellow-500 to-amber-500'
																: field.key === 'title' ? 'from-orange-500 to-red-500'
																: 'from-cyan-500 to-blue-500'
															} flex items-center justify-center shadow-xl group-hover/item:shadow-2xl group-hover/item:scale-110 group-hover/item:rotate-3 transition-all duration-500`}>
																<div className="w-6 h-6 text-white group-hover/item:animate-pulse">
																	{field.icon}
																</div>
															</div>
															<div className="flex-1">
																<div className="flex items-center gap-2 mb-1">
																	<p className="text-sm font-medium text-gray-500 dark:text-gray-400">{field.label}</p>
																	{field.help && (
																		<div className="relative group/tooltip">
																			<div className="cursor-help">
																				<div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300">?</div>
																			</div>
																			<div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200">
																				{field.help}
																				<div className="absolute -bottom-1 left-2 w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45"></div>
																			</div>
																		</div>
																	)}
																</div>
																{profile?.[field.key] ? (
																	<p className="text-lg font-bold text-gray-900 dark:text-white break-words group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors duration-300">
																		{profile[field.key]}
																	</p>
																) : (
																	<p className="text-gray-400 dark:text-gray-500 italic">Not provided</p>
																)}
															</div>
														</div>
													))}
												</div>
											</div>
										</div>

										{/* Floating Elements */}
										<div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
										<div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
									</div>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
				</div>
			</div>
		</Layout>
	);
};

export default OfficerProfile;