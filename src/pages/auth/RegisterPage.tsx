import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import * as yup from 'yup'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRegister } from '@/features/auth/useRegister'

const schema = yup.object({
  name: yup.string().required(),
  email: yup.string().email().required(),
  phone: yup.string().required(),
  password: yup.string().min(8).required(),
  role: yup.string().oneOf(['CUSTOMER', 'OWNER', 'SERVICE_PROVIDER']).required(),
})

export function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const registerMutation = useRegister()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'CUSTOMER' as 'CUSTOMER' | 'OWNER' | 'SERVICE_PROVIDER',
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await schema.validate(form)
      await registerMutation.mutateAsync(form)
      navigate('/auth/verify-email', { state: { email: form.email } })
    } catch (err: unknown) {
      if (err instanceof yup.ValidationError) {
        setError(t('common.required'))
        return
      }
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-center text-xl font-semibold">{t('auth.register')}</h2>

      {error && <Alert variant="destructive">{error}</Alert>}

      <div>
        <Label>{t('auth.name')}</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label>{t('auth.email')}</Label>
        <Input
          type="email"
          dir="ltr"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label>{t('auth.phone')}</Label>
        <Input
          dir="ltr"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label>{t('auth.password')}</Label>
        <Input
          type="password"
          dir="ltr"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          minLength={8}
          className="mt-1"
        />
      </div>

      <div>
        <Label>{t('auth.role')}</Label>
        <select
          className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          value={form.role}
          onChange={(e) =>
            setForm({ ...form, role: e.target.value as typeof form.role })
          }
        >
          <option value="CUSTOMER">{t('auth.customer')}</option>
          <option value="OWNER">{t('auth.owner')}</option>
          <option value="SERVICE_PROVIDER">{t('auth.serviceProvider')}</option>
        </select>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending
          ? t('common.loading')
          : t('auth.registerButton')}
      </Button>

      <p className="text-center text-sm">
        {t('auth.hasAccount')}{' '}
        <Link to="/auth/login" className="text-main hover:underline">
          {t('auth.login')}
        </Link>
      </p>
    </form>
  )
}
