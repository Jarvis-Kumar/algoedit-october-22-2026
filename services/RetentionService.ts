
import { User } from '../types';

export class RetentionService {
    private static readonly STREAK_THRESHOLD_HOURS = 24;
    private static readonly INACTIVITY_THRESHOLD_DAYS = 3;

    static checkStreak(user: User): { updatedUser: Partial<User>, rewardTokens?: number } {
        const now = new Date();
        const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
        
        if (!lastActive) {
            return { updatedUser: { lastActiveDate: now.toISOString(), streakCount: 1 } };
        }

        const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
        
        if (diffHours < 24) {
            // Same day, no change to streak
            return { updatedUser: { lastActiveDate: now.toISOString() } };
        } else if (diffHours < 48) {
            // Next day, increment streak
            const newStreak = (user.streakCount || 0) + 1;
            let reward = 0;
            
            // Milestone rewards
            if (newStreak === 3) reward = 500;
            if (newStreak === 7) reward = 1500;
            if (newStreak === 30) reward = 5000;

            return { 
                updatedUser: { 
                    lastActiveDate: now.toISOString(), 
                    streakCount: newStreak,
                    tokens: user.tokens + reward
                },
                rewardTokens: reward
            };
        } else {
            // Streak broken
            return { updatedUser: { lastActiveDate: now.toISOString(), streakCount: 1 } };
        }
    }

    static getReengagementMessage(user: User): string | null {
        const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
        if (!lastActive) return null;

        const diffDays = (new Date().getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
        
        if (diffDays >= 3 && diffDays < 4) {
            return `Hey ${user.name.split(' ')[0]}, your creative studio misses you! We've added new models since you last visited.`;
        }
        
        if (diffDays >= 7) {
            return `It's been a week! Come back and claim your 1,000 "Welcome Back" tokens.`;
        }

        return null;
    }

    static async generatePersonalityInsights(user: User, recentPrompts: string[]): Promise<string> {
        // This would call Gemini to analyze the user's creative style
        // For now, we'll return a simulated insight
        return "Your creative style is 'Visionary & Precise'. You favor high-contrast cinematic aesthetics and authoritative writing.";
    }

    static addExp(user: User, amount: number): { updatedUser: Partial<User>, leveledUp: boolean } {
        const currentExp = user.creatorExp || 0;
        const currentLevel = user.creatorLevel || 1;
        const newExp = currentExp + amount;
        const expToNextLevel = currentLevel * 1000;

        if (newExp >= expToNextLevel) {
            const newLevel = currentLevel + 1;
            const remainingExp = newExp - expToNextLevel;
            
            // Tier progression logic
            let newTier = user.creatorTier || 'Explorer';
            if (newLevel >= 10) newTier = 'Creator';
            if (newLevel >= 25) newTier = 'Pro';
            if (newLevel >= 50) newTier = 'Visionary';

            return {
                updatedUser: {
                    creatorLevel: newLevel,
                    creatorExp: remainingExp,
                    creatorTier: newTier,
                    tokens: user.tokens + (newLevel * 100) // Level up bonus
                },
                leveledUp: true
            };
        }

        return {
            updatedUser: { creatorExp: newExp },
            leveledUp: false
        };
    }

    static trackGeneration(user: User, style: string): Partial<User> {
        const stats = user.stats || {
            totalGenerations: 0,
            totalProjects: 0,
            stylesUsed: [],
            totalLikes: 0,
            totalViews: 0
        };

        const newStyles = stats.stylesUsed.includes(style) 
            ? stats.stylesUsed 
            : [...stats.stylesUsed, style];

        return {
            stats: {
                ...stats,
                totalGenerations: stats.totalGenerations + 1,
                stylesUsed: newStyles
            }
        };
    }
}
