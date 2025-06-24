import React from 'react';
import { Users, Baby, Shield } from 'lucide-react';
import { UserRole } from '../../contexts/AuthContext';

interface RoleSelectorProps {
  selectedRole: UserRole | null;
  onRoleSelect: (role: UserRole) => void;
  variant: 'signin' | 'signup';
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onRoleSelect, variant }) => {
  const roles = [
    {
      type: 'parent' as UserRole,
      icon: Users,
      title: 'Parent',
      description: 'Manage your family\'s learning journey with comprehensive controls and insights',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-400 hover:to-blue-500',
      borderColor: 'border-blue-500/30',
      bgColor: 'bg-blue-50/80 dark:bg-blue-900/20'
    },
    {
      type: 'child' as UserRole,
      icon: Baby,
      title: 'Child',
      description: 'Access safe, fun, and educational content designed just for you',
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-400 hover:to-green-500',
      borderColor: 'border-green-500/30',
      bgColor: 'bg-green-50/80 dark:bg-green-900/20'
    },
    {
      type: 'official' as UserRole,
      icon: Shield,
      title: 'Official',
      description: 'Connect with families and provide verified educational content and guidance',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-400 hover:to-purple-500',
      borderColor: 'border-purple-500/30',
      bgColor: 'bg-purple-50/80 dark:bg-purple-900/20'
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6 w-full max-w-4xl">
      {roles.map((role) => {
        const Icon = role.icon;
        return (
          <button
            key={role.type}
            onClick={() => onRoleSelect(role.type)}
            className={`group relative p-6 lg:p-8 rounded-2xl border-2 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${
              selectedRole === role.type
                ? `${role.borderColor} ${role.bgColor} shadow-2xl`
                : 'border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 hover:border-gray-300 dark:hover:border-gray-600'
            } backdrop-blur-xl shadow-xl hover:shadow-2xl`}
          >
            <div className="text-center space-y-4">
              <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${role.color} ${role.hoverColor} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {role.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base leading-relaxed">
                  {role.description}
                </p>
              </div>
            </div>

            {/* Subtle glow effect */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
          </button>
        );
      })}
    </div>
  );
};

export default RoleSelector;