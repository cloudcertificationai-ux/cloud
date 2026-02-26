'use client'

import { useState } from 'react'
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
  GlobeAltIcon,
} from '@heroicons/react/24/outline'

const settingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required'),
  siteDescription: z.string().min(1, 'Site description is required'),
  contactEmail: z.string().email('Invalid email address'),
  supportEmail: z.string().email('Invalid email address'),
  maintenanceMode: z.boolean(),
  allowRegistration: z.boolean(),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  stripeEnabled: z.boolean(),
  stripePublicKey: z.string().optional(),
  paypalEnabled: z.boolean(),
  paypalClientId: z.string().optional(),
})

type SettingsFormData = z.infer<typeof settingsSchema>

const mockSettings: SettingsFormData = {
  siteName: 'Cloud Certification',
  siteDescription: 'Learn anywhere, anytime with our comprehensive online courses',
  contactEmail: 'contact@cloudcertification.com',
  supportEmail: 'support@cloudcertification.com',
  maintenanceMode: false,
  allowRegistration: true,
  emailNotifications: true,
  smsNotifications: false,
  stripeEnabled: true,
  stripePublicKey: 'pk_test_...',
  paypalEnabled: false,
  paypalClientId: '',
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: mockSettings,
  })

  const onSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true)
    try {
      // Here you would make an API call to update settings
      console.log('Updating settings:', data)
      toast.success('Settings updated successfully!')
    } catch (error) {
      toast.error('Failed to update settings')
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your platform configuration and preferences
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
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <form onSubmit={handleSubmit(onSubmit)}>
            {activeTab === 'general' && (
              <div className="card">
                <h2 className="text-lg font-medium text-gray-900 mb-6">General Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      {...register('siteName')}
                      className="input-field"
                    />
                    {errors.siteName && (
                      <p className="mt-1 text-sm text-red-600">{errors.siteName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Description
                    </label>
                    <textarea
                      {...register('siteDescription')}
                      rows={3}
                      className="input-field"
                    />
                    {errors.siteDescription && (
                      <p className="mt-1 text-sm text-red-600">{errors.siteDescription.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        {...register('contactEmail')}
                        className="input-field"
                      />
                      {errors.contactEmail && (
                        <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Support Email
                      </label>
                      <input
                        type="email"
                        {...register('supportEmail')}
                        className="input-field"
                      />
                      {errors.supportEmail && (
                        <p className="mt-1 text-sm text-red-600">{errors.supportEmail.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('maintenanceMode')}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Maintenance Mode
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('allowRegistration')}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Allow New User Registration
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="card">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Notification Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                      <p className="text-sm text-gray-500">Send notifications via email</p>
                    </div>
                    <input
                      type="checkbox"
                      {...register('emailNotifications')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">SMS Notifications</h3>
                      <p className="text-sm text-gray-500">Send notifications via SMS</p>
                    </div>
                    <input
                      type="checkbox"
                      {...register('smsNotifications')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="card">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Payment Gateways</h2>
                  
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Stripe</h3>
                          <p className="text-sm text-gray-500">Accept credit card payments</p>
                        </div>
                        <input
                          type="checkbox"
                          {...register('stripeEnabled')}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stripe Public Key
                        </label>
                        <input
                          type="text"
                          {...register('stripePublicKey')}
                          className="input-field"
                          placeholder="pk_test_..."
                        />
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">PayPal</h3>
                          <p className="text-sm text-gray-500">Accept PayPal payments</p>
                        </div>
                        <input
                          type="checkbox"
                          {...register('paypalEnabled')}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          PayPal Client ID
                        </label>
                        <input
                          type="text"
                          {...register('paypalClientId')}
                          className="input-field"
                          placeholder="Your PayPal Client ID"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="card">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Security Settings</h2>
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <ShieldCheckIcon className="h-5 w-5 text-yellow-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Security Features
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <ul className="list-disc list-inside space-y-1">
                            <li>Two-factor authentication enabled</li>
                            <li>Password strength requirements enforced</li>
                            <li>Session timeout after 24 hours</li>
                            <li>Failed login attempt monitoring</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="card">
                <h2 className="text-lg font-medium text-gray-900 mb-6">User Management</h2>
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                      <UserGroupIcon className="h-5 w-5 text-blue-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          User Statistics
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <ul className="space-y-1">
                            <li>Total Users: 12,543</li>
                            <li>Active Users (30 days): 8,934</li>
                            <li>New Registrations (7 days): 234</li>
                            <li>Admin Users: 5</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
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