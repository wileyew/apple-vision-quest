import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';

interface SocialAuthProps {
  mode: 'login' | 'signup';
}

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const DiscordIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export const SocialAuth = ({ mode }: SocialAuthProps) => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [discordLoading, setDiscordLoading] = useState(false);
  const [twitterLoading, setTwitterLoading] = useState(false);
  const { signInWithGoogle, signInWithGitHub, signInWithDiscord, signInWithTwitter } = useAuth();

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google auth error:', error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGitHubAuth = async () => {
    setGithubLoading(true);
    try {
      await signInWithGitHub();
    } catch (error) {
      console.error('GitHub auth error:', error);
    } finally {
      setGithubLoading(false);
    }
  };

  const handleDiscordAuth = async () => {
    setDiscordLoading(true);
    try {
      await signInWithDiscord();
    } catch (error) {
      console.error('Discord auth error:', error);
    } finally {
      setDiscordLoading(false);
    }
  };

  const handleTwitterAuth = async () => {
    setTwitterLoading(true);
    try {
      await signInWithTwitter();
    } catch (error) {
      console.error('Twitter auth error:', error);
    } finally {
      setTwitterLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or {mode === 'login' ? 'sign in' : 'sign up'} with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={handleGoogleAuth}
          disabled={googleLoading || githubLoading || discordLoading || twitterLoading}
          className="w-full"
        >
          {googleLoading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          <span className="ml-2">Google</span>
        </Button>

        <Button
          variant="outline"
          onClick={handleGitHubAuth}
          disabled={googleLoading || githubLoading || discordLoading || twitterLoading}
          className="w-full"
        >
          {githubLoading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          ) : (
            <Github className="w-4 h-4" />
          )}
          <span className="ml-2">GitHub</span>
        </Button>

        <Button
          variant="outline"
          onClick={handleDiscordAuth}
          disabled={googleLoading || githubLoading || discordLoading || twitterLoading}
          className="w-full"
        >
          {discordLoading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          ) : (
            <DiscordIcon />
          )}
          <span className="ml-2">Discord</span>
        </Button>

        <Button
          variant="outline"
          onClick={handleTwitterAuth}
          disabled={googleLoading || githubLoading || discordLoading || twitterLoading}
          className="w-full"
        >
          {twitterLoading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          ) : (
            <TwitterIcon />
          )}
          <span className="ml-2">Twitter</span>
        </Button>
      </div>
    </div>
  );
};