
import React, { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ContentService } from '../services/contentService';
import { Favorite, User } from '../types';
import { auth } from '../services/firebase';

interface FavoriteButtonProps {
    itemId: string;
    type: Favorite['type'];
    showLabel?: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ itemId, type, showLabel = false }) => {
    const [isFavorited, setIsFavorited] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const checkStatus = async () => {
            const user = auth.currentUser;
            if (user) {
                setUserId(user.uid);
                const favs = await ContentService.getFavorites(user.uid);
                setIsFavorited(favs.some(f => f.itemId === itemId && f.type === type));
            }
        };
        checkStatus();
    }, [itemId, type]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!userId) return;
        
        setIsPending(true);
        try {
            const added = await ContentService.toggleFavorite({ itemId, type });
            setIsFavorited(added);
        } catch (err) {
            console.error('Favorite toggle failed:', err);
        } finally {
            setIsPending(false);
        }
    };

    if (!userId) return null;

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${isFavorited ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white hover:border-white/20'}`}
        >
            <AnimatePresence mode="wait">
                {isPending ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                    >
                        <Loader2 className="animate-spin" size={14} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="heart"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileTap={{ scale: 1.4 }}
                    >
                        <Heart size={14} className={isFavorited ? 'fill-rose-500' : ''} />
                    </motion.div>
                )}
            </AnimatePresence>
            {showLabel && (
                <span className="text-[9px] font-black uppercase tracking-widest">
                    {isFavorited ? 'Neural_Saved' : 'Save_to_Node'}
                </span>
            )}
        </button>
    );
};

export default FavoriteButton;
