import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          toast({
            title: "Welcome!",
            description: "You have been successfully signed in.",
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Goodbye!",
            description: "You have been successfully signed out.",
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    try {
      console.log('Starting signup process for:', email);
      console.log('Supabase client config:', {
        url: 'https://vwfjuypesbnnezdpfsul.supabase.co',
        hasKey: true,
      });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      console.log('Supabase signup response:', { data, error });

      if (error) {
        console.error('Supabase signup error:', error);
        
        // Handle specific error cases
        let userFriendlyMessage = error.message;
        if (error.message.includes('Invalid email')) {
          userFriendlyMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('Password')) {
          userFriendlyMessage = 'Password must be at least 6 characters long.';
        } else if (error.message.includes('rate limit')) {
          userFriendlyMessage = 'Too many signup attempts. Please wait a moment and try again.';
        } else if (error.message.includes('network')) {
          userFriendlyMessage = 'Network error. Please check your connection and try again.';
        }

        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: userFriendlyMessage,
        });
        return { error };
      }

      if (data.user && !data.session) {
        // User created but needs email confirmation
        console.log('User created, email confirmation required');
        toast({
          title: "Account created successfully!",
          description: "Please check your email and click the confirmation link to activate your account.",
        });
        return { error: null };
      }

      if (data.session) {
        // User created and automatically signed in (if email confirmation is disabled)
        console.log('User created and signed in automatically');
        toast({
          title: "Welcome!",
          description: "Your account has been created and you're now signed in.",
        });
        return { error: null };
      }

      console.log('Signup completed without user or session');
      return { error: null };
    } catch (error) {
      console.error('Unexpected signup error:', error);
      const authError = error as AuthError;
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: authError.message || "An unexpected error occurred. Please try again.",
      });
      return { error: authError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: error.message,
        });
      }

      return { error };
    } catch (error) {
      const authError = error as AuthError;
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: authError.message,
      });
      return { error: authError };
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google OAuth signin...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      console.log('Google OAuth response:', { data, error });

      if (error) {
        console.error('Google OAuth error:', error);
        toast({
          variant: "destructive",
          title: "Google sign in failed",
          description: error.message || "An error occurred during Google sign in",
        });
        return { error };
      }

      if (data.url) {
        // Redirect to Google OAuth
        window.location.href = data.url;
        return { error: null };
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected Google OAuth error:', error);
      const authError = error as AuthError;
      toast({
        variant: "destructive",
        title: "Google sign in failed",
        description: authError.message || "An unexpected error occurred. Please try again.",
      });
      return { error: authError };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: "There was an error signing you out.",
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};