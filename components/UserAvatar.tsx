

import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';

interface UserAvatarProps {
    user: User;
    onSignOut: () => void;
}

const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[names.length - 1]) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
};

const avatarColors = [
    'bg-[#10161B] text-[#AFC3CF] border border-[#26313A]',
    'bg-[#151D24] text-white border border-[#415363]',
    'bg-[#0E1419] text-[#8DB8CC] border border-[#26313A]',
    'bg-gradient-to-br from-[#10161B] to-[#26313A] text-[#E8F0F4] border border-white/10'
];
const getRandomColor = (name: string) => avatarColors[name.length % avatarColors.length];

const UserAvatar: React.FC<UserAvatarProps> = ({ user, onSignOut }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                <span className="sr-only">Open user menu</span>
                <div className={`h-8 w-8 rounded-full ${getRandomColor(user.name)} flex items-center justify-center font-bold text-white text-xs`}>
                    {getInitials(user.name)}
                </div>
            </button>
            {isMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-sm font-semibold text-white truncate" title={user.name}>{user.name}</p>
                        <p className="text-xs text-gray-400 truncate" title={user.email}>{user.email}</p>
                    </div>
                    <div className="py-1">
                        <a href="#" onClick={(e) => { e.preventDefault(); onSignOut(); }} className="block px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-white">
                            Sign out
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserAvatar;
