import { useEffect } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { SagaScriptLogoCompact } from '@/components/ui/sagascript-logo'

export default function AuthCallback() {
  const [, setLocation] = useLocation()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setLocation('/auth?error=' + encodeURIComponent(error.message))
          return
        }

        if (data.session) {
          // Successfully authenticated, redirect to dashboard
          setLocation('/')
        } else {
          // No session, redirect to auth
          setLocation('/auth')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setLocation('/auth?error=' + encodeURIComponent('Authentication failed'))
      }
    }

    handleAuthCallback()
  }, [setLocation])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <SagaScriptLogoCompact size={48} className="text-primary animate-pulse" />
          <div className="text-center space-y-2">
            <h2 className="text-xl font-serif">Completing sign in...</h2>
            <p className="text-muted-foreground">Please wait while we redirect you.</p>
          </div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}