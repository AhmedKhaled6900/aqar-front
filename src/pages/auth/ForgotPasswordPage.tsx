import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForgotPassword } from '@/features/auth/useForgotPassword'
import { useResetPassword } from '@/features/auth/useResetPassword'

type Step = 'request' | 'reset'

export function ForgotPasswordPage() {
  const { t } = useTranslation()
  const forgotMutation = useForgotPassword()
  const resetMutation = useResetPassword()
  const [step, setStep] = useState<Step>('request')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const data = await forgotMutation.mutateAsync({ email })
      setMessage(data.message)
      setStep('reset')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const data = await resetMutation.mutateAsync({
        email,
        code,
        newPassword,
      })
      setMessage(data.message)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-center text-xl font-semibold">
        {step === 'request' ? t('auth.forgotTitle') : t('auth.resetTitle')}
      </h2>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="destructive">{error}</Alert>}

      {step === 'request' ? (
        <form onSubmit={handleRequest} className="space-y-4">
          <div>
            <Label>{t('auth.email')}</Label>
            <Input
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full" disabled={forgotMutation.isPending}>
            {t('auth.sendOtp')}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <Label>{t('auth.verifyCode')}</Label>
            <Input
              dir="ltr"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label>{t('auth.newPassword')}</Label>
            <Input
              type="password"
              dir="ltr"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full" disabled={resetMutation.isPending}>
            {t('auth.resetButton')}
          </Button>
        </form>
      )}

      <p className="text-center text-sm">
        <Link to="/auth/login" className="text-main hover:underline">
          {t('auth.login')}
        </Link>
      </p>
    </div>
  )
}
