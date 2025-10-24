import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useSupabaseAuth } from '@/contexts/supabase-auth'
import { SagaScriptLogoCompact } from '@/components/ui/sagascript-logo'

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [signInData, setSignInData] = useState({ email: '', password: '' })
  const [signUpData, setSignUpData] = useState({ email: '', password: '', displayName: '', confirmPassword: '' })
  const { signIn, signUp, signInWithGoogle } = useSupabaseAuth()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await signIn(signInData.email, signInData.password)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (signUpData.password !== signUpData.confirmPassword) {
      return
    }
    
    setIsLoading(true)
    
    try {
      await signUp(signUpData.email, signUpData.password, signUpData.displayName)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <SagaScriptLogoCompact size={48} className="text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-serif">Welcome to SagaScript</CardTitle>
            <CardDescription className="text-base">
              Your creative writing companion
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signInData.email}
                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <i className="ri-loader-line animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <i className="ri-login-box-line mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Display Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Your Name"
                    value={signUpData.displayName}
                    onChange={(e) => setSignUpData({ ...signUpData, displayName: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirm Password</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  {signUpData.password && signUpData.confirmPassword && signUpData.password !== signUpData.confirmPassword && (
                    <p className="text-sm text-destructive">Passwords do not match</p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || signUpData.password !== signUpData.confirmPassword}
                >
                  {isLoading ? (
                    <>
                      <i className="ri-loader-line animate-spin mr-2" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <i className="ri-user-add-line mr-2" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <i className="ri-loader-line animate-spin mr-2" />
              ) : (
                <i className="ri-google-fill mr-2 text-red-500" />
              )}
              Google
            </Button>
          </div>
        </CardContent>

        <CardFooter className="text-center">
          <p className="text-sm text-muted-foreground">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}