import { useState } from 'react'
import { Download, Save, Volume2, VolumeX } from 'lucide-react'
import Button from '@/components/common/Button'
import api from '@/services/api'
import toast from 'react-hot-toast'
import { useSettingsStore } from '@/store/settingsStore'

export default function Settings() {
  const [isExporting, setIsExporting] = useState(false)
  const { soundEnabled, toggleSound, notificationsEnabled, toggleNotifications } = useSettingsStore()

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const { data } = await api.get('/user/export', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'streakforge_data.json')
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      toast.success('Data exported successfully!')
    } catch (error) {
      toast.error('Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="px-8 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display font-semibold text-2xl text-ash-100">Settings</h1>
        <p className="text-ash-400 text-sm mt-1">Manage your account preferences and data.</p>
      </div>

      <div className="space-y-6">
        {/* Preferences */}
        <section className="bg-base-900/60 backdrop-blur-xl border border-base-800/60 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-ash-100 mb-4">Preferences</h2>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-ash-200 font-medium">Sound Effects</p>
              <p className="text-ash-400 text-sm">Play sounds for success, level up, and notifications.</p>
            </div>
            <button
              onClick={toggleSound}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                soundEnabled ? 'bg-ember-500' : 'bg-base-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-ash-200 font-medium">Push Notifications</p>
              <p className="text-ash-400 text-sm">Receive reminders for pending targets and streak warnings.</p>
            </div>
            <button
              onClick={() => {
                const current = useSettingsStore.getState().notificationsEnabled
                if (!current && 'Notification' in window) {
                  Notification.requestPermission().then((perm) => {
                    if (perm === 'granted') {
                      toast.success('Push notifications enabled!')
                      toggleNotifications()
                    } else {
                      toast.error('Permission denied. Please enable in browser settings.')
                    }
                  })
                } else {
                  toggleNotifications()
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationsEnabled ? 'bg-ember-500' : 'bg-base-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </section>

        {/* Data Export */}
        <section className="bg-base-900/60 backdrop-blur-xl border border-base-800/60 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-ash-100 mb-2">Data Export</h2>
          <p className="text-ash-400 text-sm mb-4">
            Download a copy of all your targets, progress logs, and account history in JSON format.
          </p>
          <Button onClick={handleExportData} disabled={isExporting} variant="secondary" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export Data (JSON)'}
          </Button>
        </section>
        {/* Integrations */}
        <section className="bg-base-900/60 backdrop-blur-xl border border-base-800/60 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-ash-100 mb-4">Integrations & Reports</h2>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-ash-200 font-medium">Weekly Email Report</p>
              <p className="text-ash-400 text-sm">Receive a summary of your week's progress.</p>
            </div>
            <Button
              onClick={async () => {
                const toastId = toast.loading('Sending...')
                try {
                  const { data } = await api.post('/user/email-report')
                  toast.success(data.message, { id: toastId })
                } catch {
                  toast.error('Failed to send report', { id: toastId })
                }
              }}
              variant="secondary" 
              className="text-xs py-1.5"
            >
              Send Test
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-ash-200 font-medium">Google Calendar Sync</p>
              <p className="text-ash-400 text-sm">Automatically block out time for your targets.</p>
            </div>
            <Button
              onClick={async () => {
                toast.success('Successfully linked Google Calendar! (Mock)')
              }}
              variant="secondary" 
              className="text-xs py-1.5"
            >
              Connect
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
