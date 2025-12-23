import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Helper function to sync Google profile data
    const syncGoogleProfile = async (user: User) => {
      if (user.app_metadata?.provider === 'google' || user.identities?.some(i => i.provider === 'google')) {
        const googleName = user.user_metadata?.full_name || user.user_metadata?.name;
        if (googleName) {
          // Update user metadata with display_name if not set
          if (!user.user_metadata?.display_name) {
            await supabase.auth.updateUser({
              data: { display_name: googleName }
            });
          }
          
          // Update profile in database
          setTimeout(async () => {
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('user_id', user.id)
              .single();
            
            if (!existingProfile) {
              // Create profile
              await supabase.from('profiles').insert({
                user_id: user.id,
                display_name: googleName,
              });
            } else if (!existingProfile.display_name) {
              // Update display_name if empty
              await supabase.from('profiles').update({
                display_name: googleName
              }).eq('user_id', user.id);
            }
          }, 0);
        }
      }
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Sync Google profile on sign in
        if (event === 'SIGNED_IN' && session?.user) {
          syncGoogleProfile(session.user);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Handle deep links for Capacitor (OAuth callback)
    if (Capacitor.isNativePlatform()) {
      App.addListener('appUrlOpen', async (event) => {
        const url = event.url;
        console.log('Capacitor appUrlOpen:', url);

        // Check if this is an OAuth callback with access token
        if (url.includes('#access_token=') || url.includes('?code=')) {
          try {
            // Extract the fragment/query from the URL and let Supabase handle it
            const hashIndex = url.indexOf('#');
            if (hashIndex !== -1) {
              const fragment = url.substring(hashIndex + 1);
              const params = new URLSearchParams(fragment);
              const accessToken = params.get('access_token');
              const refreshToken = params.get('refresh_token');
              
              if (accessToken && refreshToken) {
                const { data, error } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                });
                
                if (error) {
                  console.error('Error setting session from deep link:', error);
                } else {
                  console.log('Successfully authenticated from deep link!', data.session?.user?.email);
                }
              }
            }
          } catch (error) {
            console.error('Error handling OAuth deep link:', error);
          }
        }
      });
    }

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};