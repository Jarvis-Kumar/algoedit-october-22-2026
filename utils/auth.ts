import { User } from '../types';

// A simple JWT decoder for demonstration purposes
export const decodeCredential = (credential: string): Omit<User, 'tokens' | 'walletBalanceUSD' | 'bonusesReceived'> => {
  try {
    const payload = credential.split('.')[1];
    const decodedPayload = atob(payload);
    const parsedPayload = JSON.parse(decodedPayload);
    
    return {
      name: parsedPayload.name,
      email: parsedPayload.email,
      picture: parsedPayload.picture,
    };
  } catch (error) {
    console.error("Failed to decode credential:", error);
    throw new Error("Invalid credential");
  }
};
