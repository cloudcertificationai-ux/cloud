'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import {
  CogIcon,
  BellIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'

const settingsSchema = z.object({
  // General
  site_name: z.string().min(1, 'Site name is required'),
  site_description: z.string().min(1, 'Site description is required'),
  contact_email: z.string().email('Invalid email address'),
  support_email: z.string().email('Invalid email address'),
  maintenance_mode: z.boolean(),
  allow_registration: z.boolean(),

  // Notifications
  email_notifications: z.boolean(),
  sms_notifications: z.boolean(),

  // Stripe
  stripe_enabled: z.boolean(),
  stripe_publishable_key: z.string().optional(),
  stripe_secret_key: z.string().optional(),
  stripe_webhook_secret: z.string().optional(),

  // PayPal
  paypal_enabled: z.boolean(),
  paypal_client_id: z.string().optional(),
  paypal_client_secret: z.string().optional(),
  paypal_mode: z.enum(['sandbox', 'live']).optional(),

  // Razorpay
  razorpay_enabled: z.boolean(),
  razorpay_key_id: z.string().optional(),
  razorpay_key_secret: z.string().optional(),
  razorpay_webhook_secret: z.string().optional(),
})

type SettingsFormData = z.infer<typeof settingsSchema>

const defaultValues: SettingsFormData = {
  site_name: 'Cloud Certification',
  site_description: 'Learn anywhere, anytime with our comprehensive online courses',
  contact_email: 'contact@cloudcertification.com',
  support_email: 'support@cloudcertification.com',
  maintenance_mode: false,
  allow_registration: true,
  email_notifications: true,
  sms_notifications: false,
  stripe_enabled: false,
  stripe_publishable_key: '',
  stripe_secret_key: '',
  stripe_webhook_secret: '',
  paypal_enabled: false,
  paypal_client_id: '',
  paypal_client_secret: '',
  paypal_mode: 'sandbox',
  razorpay_enabled: false,
  razorpay_key_id: '',
  razorpay_key_secret: '',
  razorpay_webhook_secret: '',
}

interface SecretFieldProps {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  hint?: string
}

function SecretField({ label, placeholder, value, onChange, hint }: SecretFieldProps) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field pr-10"
          placeholder={placeholder}
        />
        <button
          type="button"
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          onClick={() => setShow(!show)}
        >
          {show ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      </div>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  )
}

interface GatewayStatusProps {
  enabled: boolean
  label: string
}

function GatewayStatus({ enabled, label }: GatewayStatusProps) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
      enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
    }`}>
      {enabled
        ? <CheckCircleIcon className="h-3 w-3" />
        : <XCircleIcon className="h-3 w-3" />}
      {enabled ? 'Active' : 'Inactive'}
    </span>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues,
  })

  const stripeEnabled = watch('stripe_enabled')
  const paypalEnabled = watch('paypal_enabled')
  const razorpayEnabled = watch('razorpay_enabled')

  // Load settings from DB
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings')
        if (!res.ok) throw new Error('Failed to load settings')
        const data = await res.json()
        const s = data.settings || {}
        reset({
          site_name: s.site_name || defaultValues.site_name,
          site_description: s.site_description || defaultValues.site_description,
          contact_email: s.contact_email || defaultValues.contact_email,
          support_email: s.support_email || defaultValues.support_email,
          maintenance_mode: s.maintenance_mode === 'true',
          allow_registration: s.allow_registration !== 'false',
          email_notifications: s.email_notifications !== 'false',
          sms_notifications: s.sms_notifications === 'true',
          stripe_enabled: s.stripe_enabled === 'true',
          stripe_publishable_key: s.stripe_publishable_key || '',
          stripe_secret_key: s.stripe_secret_key || '',
          stripe_webhook_secret: s.stripe_webhook_secret || '',
          paypal_enabled: s.paypal_enabled === 'true',
          paypal_client_id: s.paypal_client_id || '',
          paypal_client_secret: s.paypal_client_secret || '',
          paypal_mode: (s.paypal_mode as 'sandbox' | 'live') || 'sandbox',
          razorpay_enabled: s.razorpay_enabled === 'true',
          razorpay_key_id: s.razorpay_key_id || '',
          razorpay_key_secret: s.razorpay_key_secret || '',
          razorpay_webhook_secret: s.razorpay_webhook_secret || '',
        })
      } catch (error) {
        console.error('Failed to load settings:', error)
        toast.error('Failed to load settings')
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [reset])

  const onSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to save settings')
      }

      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save settings')
    } finally {
      setIsSubmitting(false)
    }
  }

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'payments', name: 'Payments', icon: CreditCardIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'users', name: 'User Management', icon: UserGroupIcon },
  ]

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your platform configuration and payment gateways
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="mr-3 h-5 w-5" />
                {tab.name}
                {tab.id === 'payments' && (
                  <span className="ml-auto flex gap-1">
                    {stripeEnabled && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                    {paypalEnabled && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                    {razorpayEnabled && <span className="w-2 h-2 rounded-full bg-indigo-500"></span>}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="card">
                <h2 className="text-lg font-medium text-gray-900 mb-6">General Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                    <input type="text" {...register('site_name')} className="input-field" />
                    {errors.site_name && <p className="mt-1 text-sm text-red-600">{errors.site_name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                    <textarea {...register('site_description')} rows={3} className="input-field" />
                    {errors.site_description && <p className="mt-1 text-sm text-red-600">{errors.site_description.message}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                      <input type="email" {...register('contact_email')} className="input-field" />
                      {errors.contact_email && <p className="mt-1 text-sm text-red-600">{errors.contact_email.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                      <input type="email" {...register('support_email')} className="input-field" />
                      {errors.support_email && <p className="mt-1 text-sm text-red-600">{errors.support_email.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" {...register('maintenance_mode')} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Maintenance Mode</span>
                        <p className="text-xs text-gray-500">Temporarily disable public access to the site</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" {...register('allow_registration')} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Allow New User Registration</span>
                        <p className="text-xs text-gray-500">Allow new users to sign up on the platform</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="card">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Notification Settings</h2>
                <div className="space-y-6">
                  <label className="flex items-center justify-between cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                      <p className="text-sm text-gray-500">Send notifications via email to users and admins</p>
                    </div>
                    <input type="checkbox" {...register('email_notifications')} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">SMS Notifications</h3>
                      <p className="text-sm text-gray-500">Send notifications via SMS (requires SMS provider)</p>
                    </div>
                    <input type="checkbox" {...register('sms_notifications')} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                  </label>
                </div>
              </div>
            )}

            {/* Payments */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Enable a payment gateway and add its credentials to start accepting payments.
                    At least one gateway must be active for paid courses. Changes take effect immediately on the website.
                  </p>
                </div>

                {/* Stripe */}
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <span className="text-indigo-600 font-bold text-sm">S</span>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">Stripe</h3>
                        <p className="text-sm text-gray-500">Credit/debit cards worldwide</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <GatewayStatus enabled={stripeEnabled} label="Stripe" />
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-sm text-gray-600">Enable</span>
                        <div className="relative">
                          <input type="checkbox" {...register('stripe_enabled')} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </div>
                      </label>
                    </div>
                  </div>
                  {stripeEnabled && (
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Publishable Key</label>
                        <input
                          type="text"
                          {...register('stripe_publishable_key')}
                          className="input-field font-mono text-sm"
                          placeholder="pk_live_... or pk_test_..."
                        />
                        <p className="mt-1 text-xs text-gray-500">Safe to expose publicly — used in the browser</p>
                      </div>
                      <SecretField
                        label="Secret Key"
                        placeholder="sk_live_... or sk_test_..."
                        value={watch('stripe_secret_key') || ''}
                        onChange={(v) => setValue('stripe_secret_key', v)}
                        hint="Keep secret — never expose this key publicly"
                      />
                      <SecretField
                        label="Webhook Secret"
                        placeholder="whsec_..."
                        value={watch('stripe_webhook_secret') || ''}
                        onChange={(v) => setValue('stripe_webhook_secret', v)}
                        hint="From Stripe Dashboard → Webhooks → your endpoint"
                      />
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">
                          <strong>Webhook URL:</strong>{' '}
                          <code className="bg-gray-200 px-1 rounded">
                            {typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host.replace('3001', '3000')}` : 'https://yoursite.com'}/api/webhooks/stripe
                          </code>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* PayPal */}
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">PP</span>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">PayPal</h3>
                        <p className="text-sm text-gray-500">PayPal balance, cards, and bank accounts</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <GatewayStatus enabled={paypalEnabled} label="PayPal" />
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-sm text-gray-600">Enable</span>
                        <div className="relative">
                          <input type="checkbox" {...register('paypal_enabled')} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </div>
                      </label>
                    </div>
                  </div>
                  {paypalEnabled && (
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                        <select {...register('paypal_mode')} className="input-field">
                          <option value="sandbox">Sandbox (Testing)</option>
                          <option value="live">Live (Production)</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">Use sandbox for testing, live for real payments</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
                        <input
                          type="text"
                          {...register('paypal_client_id')}
                          className="input-field font-mono text-sm"
                          placeholder="Your PayPal Client ID"
                        />
                        <p className="mt-1 text-xs text-gray-500">From PayPal Developer Dashboard → My Apps</p>
                      </div>
                      <SecretField
                        label="Client Secret"
                        placeholder="Your PayPal Client Secret"
                        value={watch('paypal_client_secret') || ''}
                        onChange={(v) => setValue('paypal_client_secret', v)}
                        hint="Keep secret — from PayPal Developer Dashboard"
                      />
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">
                          <strong>Webhook URL:</strong>{' '}
                          <code className="bg-gray-200 px-1 rounded">
                            {typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host.replace('3001', '3000')}` : 'https://yoursite.com'}/api/webhooks/paypal
                          </code>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Razorpay */}
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <span className="text-emerald-600 font-bold text-sm">RZ</span>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">Razorpay</h3>
                        <p className="text-sm text-gray-500">UPI, cards, netbanking, wallets (India)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <GatewayStatus enabled={razorpayEnabled} label="Razorpay" />
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-sm text-gray-600">Enable</span>
                        <div className="relative">
                          <input type="checkbox" {...register('razorpay_enabled')} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </div>
                      </label>
                    </div>
                  </div>
                  {razorpayEnabled && (
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Key ID</label>
                        <input
                          type="text"
                          {...register('razorpay_key_id')}
                          className="input-field font-mono text-sm"
                          placeholder="rzp_test_... or rzp_live_..."
                        />
                        <p className="mt-1 text-xs text-gray-500">From Razorpay Dashboard → Settings → API Keys</p>
                      </div>
                      <SecretField
                        label="Key Secret"
                        placeholder="Your Razorpay Key Secret"
                        value={watch('razorpay_key_secret') || ''}
                        onChange={(v) => setValue('razorpay_key_secret', v)}
                        hint="Keep secret — shown only once on Razorpay Dashboard"
                      />
                      <SecretField
                        label="Webhook Secret"
                        placeholder="Your Razorpay Webhook Secret"
                        value={watch('razorpay_webhook_secret') || ''}
                        onChange={(v) => setValue('razorpay_webhook_secret', v)}
                        hint="From Razorpay Dashboard → Settings → Webhooks"
                      />
                      <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                        <p className="text-xs text-gray-600">
                          <strong>Webhook URL:</strong>{' '}
                          <code className="bg-gray-200 px-1 rounded">
                            {typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host.replace('3001', '3000')}` : 'https://yoursite.com'}/api/webhooks/razorpay
                          </code>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Razorpay supports UPI, Cards, Net Banking, Wallets — ideal for Indian customers.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="card">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Security Settings</h2>
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <ShieldCheckIcon className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Active Security Features</h3>
                        <div className="mt-2 text-sm text-yellow-700 space-y-1">
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            <span>JWT-based admin authentication</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            <span>Password hashing with bcrypt</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            <span>Session timeout after 24 hours</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            <span>Failed login attempt monitoring</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            <span>API key authentication for inter-service calls</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            <span>Audit log for all admin actions</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-sm text-blue-800">
                      Payment credentials are stored encrypted in the database. Secret keys are masked in the UI.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* User Management */}
            {activeTab === 'users' && (
              <div className="card">
                <h2 className="text-lg font-medium text-gray-900 mb-6">User Management</h2>
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                      <UserGroupIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">User Configuration</h3>
                        <div className="mt-3 space-y-4">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" {...register('allow_registration')} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                            <div>
                              <span className="text-sm font-medium text-blue-900">Allow New Registrations</span>
                              <p className="text-xs text-blue-700">When disabled, only existing users can log in</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-3">Manage users from the Students section in the sidebar.</p>
                    <a href="/admin/students" className="text-sm text-primary-600 hover:underline font-medium">
                      Go to Students Management →
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
