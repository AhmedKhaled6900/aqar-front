import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStoreLogin } from '@/pages/auth/hooks/useStoreLogin'

export function LoginPage() {
  const { t } = useTranslation()
  const { login, isPending } = useStoreLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const result = await login(email, password)
    if (!result.success && !result.unverified && result.message) {
      setError(result.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-center text-xl font-semibold">{t('auth.login')}</h2>

      {error && <Alert variant="destructive">{error}</Alert>}

      <div>
        <Label htmlFor="email">{t('auth.email')}</Label>
        <Input
          id="email"
          type="email"
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="password">{t('auth.password')}</Label>
        <Input
          id="password"
          type="password"
          dir="ltr"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="mt-1"
        />
      </div>

      <div className="text-left text-sm">
        <Link to="/auth/forgot-password" className="text-main hover:underline">
          {t('auth.forgotPassword')}
        </Link>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? t('common.loading') : t('auth.loginButton')}
      </Button>

      <p className="text-center text-sm">
        {t('auth.noAccount')}{' '}
        <Link to="/auth/register" className="text-main hover:underline">
          {t('auth.register')}
        </Link>
      </p>
    </form>
  )
}
