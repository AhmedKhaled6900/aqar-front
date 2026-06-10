import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useResendVerification } from '@/features/auth/useResendVerification'
import { useVerifyEmail } from '@/features/auth/useVerifyEmail'
import { getPostLoginPath } from '@/lib/auth-redirect'

export function VerifyEmailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const initialEmail = (location.state as { email?: string })?.email ?? ''
  const verifyMutation = useVerifyEmail()
  const resendMutation = useResendVerification()
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const data = await verifyMutation.mutateAsync({ email, code })
      navigate(getPostLoginPath(data.user))
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  const handleResend = async () => {
    setError('')
    try {
      const data = await resendMutation.mutateAsync(email)
      setMessage(data.message)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      <h2 className="text-center text-xl font-semibold">
        {t('auth.verifyEmail')}
      </h2>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="destructive">{error}</Alert>}

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

      <div>
        <Label>{t('auth.verifyCode')}</Label>
        <Input
          dir="ltr"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          maxLength={6}
          className="mt-1"
        />
      </div>

      <Button type="submit" className="w-full" disabled={verifyMutation.isPending}>
        {verifyMutation.isPending ? t('common.loading') : t('auth.verifyButton')}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={resendMutation.isPending || !email}
        onClick={handleResend}
      >
        {t('auth.resendCode')}
      </Button>
    </form>
  )
}
