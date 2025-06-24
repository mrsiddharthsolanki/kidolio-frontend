import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Baby, Heart, Users, Shield } from 'lucide-react';

const ChildSignUpMessage: React.FC = () => {
  return (
    <Card className="w-full shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl transform hover:scale-105 transition-all duration-500">
      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-lg">
          <Baby className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          Child Account Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="space-y-4">
          <div className="bg-green-50/80 dark:bg-green-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-800/50">
            <Heart className="w-12 h-12 mx-auto mb-4 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Safety First
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              For your child's safety and security, child accounts can only be created by verified parents or guardians.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50/80 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/50">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                Parent Control
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Complete oversight and management
              </p>
            </div>
            <div className="bg-purple-50/80 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/50">
              <Shield className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                Verified Access
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Secure authentication system
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            How to create a child account:
          </h4>
          <div className="text-left space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-1">
                1
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Have your parent or guardian create a parent account first
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-1">
              2
              </div>
              <p className="text-gray-600 dark:text-gray-300">
              Your parent can then add you as a child user from their dashboard by clicking the <span className="font-semibold text-green-700 dark:text-green-400">"Add Child"</span> button and following the instructions.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-1">
                3
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                You'll receive your secure login credentials to start learning!
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:scale-105 text-white font-semibold py-3 rounded-xl relative overflow-hidden group"
            onClick={() => window.location.href = '/signup'}
          >
            <span className="relative z-10">Help My Parent Sign Up</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </Button>
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Already have credentials from your parent?{' '}
            <a href="/signin" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Sign in here
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChildSignUpMessage;