import React, { useRef, useEffect, useState } from 'react';
import { Linkedin } from 'lucide-react';

// Rearranged team array for custom grid layout
const teamRows = [
	[
		{
			name: 'Sujal Shah',
			role: 'Frontend Engineer',
			img: './sujal.png',
			desc: 'Creates intuitive interfaces that connect families and officials.',
			linkedin: 'https://www.linkedin.com/in/sujal-shah-810457290 ',
		},
		{
			name: 'Jenil Trambadia',
			role: 'Team Lead - Backend Engineering',
			img: './jenil.png',
			desc: 'Leads backend development, ensuring secure and scalable systems.',
			linkedin: 'https://www.linkedin.com/in/jeniltrambadiya/',
		},
		{
			name: 'Krish Satasiya',
			role: 'Ui/UX Designer & Backend Support',
			img: './krish.png',
			desc: 'Designs user-friendly interfaces and supports backend systems.',
			linkedin: 'https://www.linkedin.com/in/satasiyakrish1/',
		},
	],
	[
		{
			name: 'Siddharth Solanki',
			role: 'Frontend Engineer',
			img: './siddharth.png',
			desc: 'Innovative developer crafting engaging family learning experiences.',
			linkedin: 'https://www.linkedin.com/in/siddharth-solanki-225439325/',
		},
		{
			name: 'Pranav Patel',
			role: 'Support & Testing Engineer',
			img: './WhatsApp Image 2025-06-21 at 19.24.53_8f5b7de3.jpg',
			desc: 'Ensures quality and reliability through rigorous testing and support.',
			linkedin: 'https://www.linkedin.com/in/pranav-patel-4709042a2/',
		},
	],
];

const badgeClass =
	'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg px-4 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/20 dark:border-gray-800/30';

// Card component with intersection observer and hover effect
const TeamCard = ({ member, delay = 0 }) => {
	const ref = useRef(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const observer = new window.IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.4 }
		);
		if (ref.current) observer.observe(ref.current);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			className={`relative flex flex-col items-center justify-start bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-xl px-10 pt-12 pb-8 text-center group min-w-[260px] max-w-[350px] w-full transition-all duration-500
			${visible ? 'card-success-in' : 'card-hidden'}
			`}
			style={{ animationDelay: visible ? `${delay}ms` : undefined, minHeight: '420px' }}
		>
			{/* Glow effect in corner on hover */}
			<span className="absolute top-2 right-2 w-8 h-8 rounded-full pointer-events-none opacity-0 group-hover:opacity-80 group-hover:scale-125 transition-all duration-300 bg-gradient-to-br from-blue-400/40 via-purple-400/40 to-pink-400/40 blur-xl z-10" />
			<div className="relative mb-4 z-20 flex flex-col items-center">
				<img
					src={member.img}
					alt={member.name}
					className="w-28 h-28 rounded-full object-cover border-4 border-blue-500/30 dark:border-blue-400/30 shadow-lg bg-white dark:bg-gray-800"
				/>
				<a
					href={member.linkedin}
					target="_blank"
					rel="noopener noreferrer"
					className="absolute bottom-1 right-1 bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full shadow-lg hover:scale-110 transition-transform duration-200 border-2 border-white dark:border-gray-900"
					aria-label="LinkedIn"
				>
					<Linkedin className="w-4 h-4 text-white" />
				</a>
			</div>
			<div className="flex flex-col items-center w-full">
				<div className="font-bold text-lg text-gray-900 dark:text-white mb-1 truncate w-full" style={{maxWidth:'180px'}}>
					{member.name}
				</div>
				<div
					className={`mb-3 ${badgeClass} w-fit mx-auto`}
					style={{ letterSpacing: '0.04em' }}
				>
					{member.role}
				</div>
			</div>
			<div className="text-gray-600 dark:text-gray-300 text-sm mb-2 mt-1 min-h-[48px] flex items-center justify-center w-full">
				{member.desc}
			</div>
		</div>
	);
};

const TeamSection = () => (
	<section
		id="team"
		className="py-20 lg:py-32 bg-white/90 dark:bg-gray-900/90 border-t border-gray-100/50 dark:border-gray-800/50 relative overflow-x-clip"
	>
		<div className="max-w-6xl mx-auto px-4 sm:px-6">
			<div className="text-center mb-14 lg:mb-20">
				<h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 dark:text-white mb-4">
					Meet the{' '}
					<span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
						Team Behind Kidolio
					</span>
				</h2>
				<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
					We’re a driven, purpose-led team committed to shaping the future of childhood development and secure family records all in one trusted platform.
				</p>
			</div>
			<div className="flex flex-col gap-10 items-center">
				{/* First row: 3 cards */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl mx-auto justify-items-center">
					{teamRows[0].map((member, idx) => (
						<TeamCard key={member.name} member={member} delay={idx * 120} />
					))}
				</div>
				{/* Second row: 2 cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-2xl mx-auto mt-4 justify-items-center">
					{teamRows[1].map((member, idx) => (
						<TeamCard key={member.name} member={member} delay={idx * 120} />
					))}
				</div>
			</div>
		</div>
		<style>{`
			.card-hidden { opacity: 0; transform: translateY(60px) scale(0.95); }
			.card-success-in { opacity: 1; transform: translateY(0) scale(1.04); box-shadow: 0 8px 32px 0 rgba(80,120,255,0.10), 0 1.5px 8px 0 rgba(120,80,255,0.08); transition: all 0.7s cubic-bezier(.7,0,.3,1); }
			.group:hover { z-index: 2; }
			.group:hover.card-success-in { box-shadow: 0 12px 36px 0 rgba(80,120,255,0.18), 0 2px 12px 0 rgba(120,80,255,0.12); transform: translateY(-16px) scale(1.07); border-color: #7c3aed; }
		`}</style>
	</section>
);

export default TeamSection;
