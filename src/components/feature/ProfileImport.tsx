/**
 * Profile Import Component
 * Handles LinkedIn profile import with consent management
 */

import { useState } from 'react'
import { User, CheckCircle, AlertCircle, Loader2, Download, Eye, Shield } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Checkbox } from '../ui/checkbox'
import { linkedInService, ImportedProfile, LinkedInProfile } from '../../services/linkedinService'
import { useAuthStore } from '../../store/authStore'

interface ProfileImportProps {
  onImportComplete: (profile: ImportedProfile) => void
  onCancel: () => void
  className?: string
}

interface ConsentState {
  profileImport: boolean
  recruiterContact: boolean
  dataUsage: boolean
  marketingEmails: boolean
}

export default function ProfileImport({ 
  onImportComplete, 
  onCancel, 
  className = '' 
}: ProfileImportProps) {
  const { firebaseUser } = useAuthStore()
  const [isImporting, setIsImporting] = useState(false)
  const [linkedInProfile, setLinkedInProfile] = useState<LinkedInProfile | null>(null)
  const [consent, setConsent] = useState<ConsentState>({
    profileImport: true,
    recruiterContact: false,
    dataUsage: true,
    marketingEmails: false
  })
  const [step, setStep] = useState<'connect' | 'preview' | 'consent' | 'importing'>('connect')
  const [error, setError] = useState<string | null>(null)

  const handleLinkedInConnect = async () => {
    setIsImporting(true)
    setError(null)

    try {
      let profile: LinkedInProfile | null = null

      if (firebaseUser) {
        // Link LinkedIn to existing account
        profile = await linkedInService.linkWithLinkedIn(firebaseUser)
      } else {
        // Sign in with LinkedIn
        const result = await linkedInService.signInWithLinkedIn()
        profile = result.profile || null
      }

      if (profile) {
        setLinkedInProfile(profile)
        setStep('preview')
      } else {
        throw new Error('Failed to retrieve LinkedIn profile data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to LinkedIn')
    } finally {
      setIsImporting(false)
    }
  }

  const handlePreviewConfirm = () => {
    setStep('consent')
  }

  const handleConsentChange = (key: keyof ConsentState, value: boolean) => {
    setConsent(prev => ({ ...prev, [key]: value }))
  }

  const handleFinalImport = () => {
    if (!linkedInProfile) return

    setStep('importing')
    
    try {
      const importedProfile = linkedInService.transformToJobGenieProfile(
        linkedInProfile,
        consent
      )
      
      // Simulate processing time for better UX
      setTimeout(() => {
        onImportComplete(importedProfile)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import profile')
      setStep('consent')
    }
  }

  const renderConnectStep = () => (
    <Card className={className}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <User className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle>Import from LinkedIn</CardTitle>
        <CardDescription>
          Connect your LinkedIn profile to automatically fill your JobGenie profile with your 
          professional information, experience, and skills.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h4 className="flex items-center text-sm font-medium text-green-800">
            <CheckCircle className="mr-2 h-4 w-4" />
            What we'll import:
          </h4>
          <ul className="mt-2 space-y-1 text-sm text-green-700">
            <li>• Basic profile information (name, headline, location)</li>
            <li>• Work experience and job titles</li>
            <li>• Education background</li>
            <li>• Skills and endorsements</li>
            <li>• Professional summary</li>
          </ul>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="flex items-center text-sm font-medium text-blue-800">
            <Shield className="mr-2 h-4 w-4" />
            Your privacy matters:
          </h4>
          <ul className="mt-2 space-y-1 text-sm text-blue-700">
            <li>• We only access data you explicitly approve</li>
            <li>• Your LinkedIn credentials are never stored</li>
            <li>• You can review all data before importing</li>
            <li>• Full control over what gets shared with recruiters</li>
          </ul>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center text-sm font-medium text-red-800">
              <AlertCircle className="mr-2 h-4 w-4" />
              {error}
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <Button
            onClick={handleLinkedInConnect}
            disabled={isImporting}
            className="flex-1 bg-[#0077B5] hover:bg-[#005885]"
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Connect LinkedIn
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Skip for now
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderPreviewStep = () => (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Eye className="mr-2 h-5 w-5" />
          Preview Your Profile Data
        </CardTitle>
        <CardDescription>
          Review the information we found on your LinkedIn profile. You can edit this later.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {linkedInProfile && (
          <>
            <div className="rounded-lg border p-4">
              <h4 className="font-medium text-gray-900">Basic Information</h4>
              <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2">
                <div>
                  <span className="font-medium">Name:</span> {linkedInProfile.firstName} {linkedInProfile.lastName}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {linkedInProfile.emailAddress}
                </div>
                {linkedInProfile.headline && (
                  <div className="md:col-span-2">
                    <span className="font-medium">Headline:</span> {linkedInProfile.headline}
                  </div>
                )}
              </div>
            </div>

            {linkedInProfile.positions && linkedInProfile.positions.length > 0 && (
              <div className="rounded-lg border p-4">
                <h4 className="font-medium text-gray-900">Work Experience ({linkedInProfile.positions.length})</h4>
                <div className="mt-2 space-y-2">
                  {linkedInProfile.positions.slice(0, 3).map((position, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      <div className="font-medium">{position.title}</div>
                      <div>{position.companyName}</div>
                    </div>
                  ))}
                  {linkedInProfile.positions.length > 3 && (
                    <div className="text-sm text-gray-500">
                      +{linkedInProfile.positions.length - 3} more positions
                    </div>
                  )}
                </div>
              </div>
            )}

            {linkedInProfile.skills && linkedInProfile.skills.length > 0 && (
              <div className="rounded-lg border p-4">
                <h4 className="font-medium text-gray-900">Skills ({linkedInProfile.skills.length})</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {linkedInProfile.skills.slice(0, 8).map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                    >
                      {skill.name}
                    </span>
                  ))}
                  {linkedInProfile.skills.length > 8 && (
                    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700">
                      +{linkedInProfile.skills.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex space-x-3">
          <Button onClick={handlePreviewConfirm} className="flex-1">
            Looks good, continue
          </Button>
          <Button variant="outline" onClick={() => setStep('connect')}>
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderConsentStep = () => (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          Privacy & Consent Settings
        </CardTitle>
        <CardDescription>
          Control how your profile information is used and who can contact you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="profile-import"
              checked={consent.profileImport}
              onCheckedChange={(checked) => handleConsentChange('profileImport', checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="profile-import"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Import profile data (Required)
              </label>
              <p className="text-xs text-muted-foreground">
                Allow JobGenie to save your LinkedIn profile information to create your job seeker profile.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="recruiter-contact"
              checked={consent.recruiterContact}
              onCheckedChange={(checked) => handleConsentChange('recruiterContact', checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="recruiter-contact"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Allow recruiter contact
              </label>
              <p className="text-xs text-muted-foreground">
                Let recruiters view your profile and send you job opportunities. You can change this anytime.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="data-usage"
              checked={consent.dataUsage}
              onCheckedChange={(checked) => handleConsentChange('dataUsage', checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="data-usage"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Improve job matching (Required)
              </label>
              <p className="text-xs text-muted-foreground">
                Use your profile data to provide personalized job recommendations and improve match quality.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="marketing-emails"
              checked={consent.marketingEmails}
              onCheckedChange={(checked) => handleConsentChange('marketingEmails', checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="marketing-emails"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Marketing emails
              </label>
              <p className="text-xs text-muted-foreground">
                Receive updates about new features, career tips, and platform improvements.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs text-gray-600">
            By continuing, you agree to our{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>{' '}
            and{' '}
            <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>.
            You can modify these settings anytime in your account preferences.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center text-sm font-medium text-red-800">
              <AlertCircle className="mr-2 h-4 w-4" />
              {error}
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <Button
            onClick={handleFinalImport}
            disabled={!consent.profileImport || !consent.dataUsage}
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            Import Profile
          </Button>
          <Button variant="outline" onClick={() => setStep('preview')}>
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderImportingStep = () => (
    <Card className={className}>
      <CardContent className="py-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
        <h3 className="mb-2 text-lg font-medium">Importing Your Profile</h3>
        <p className="text-sm text-gray-600">
          We're setting up your JobGenie profile with your LinkedIn information...
        </p>
        <div className="mt-4 space-y-2 text-xs text-gray-500">
          <div>✓ Processing profile information</div>
          <div>✓ Importing work experience</div>
          <div>✓ Adding skills and education</div>
          <div className="animate-pulse">• Setting up job recommendations...</div>
        </div>
      </CardContent>
    </Card>
  )

  switch (step) {
    case 'connect':
      return renderConnectStep()
    case 'preview':
      return renderPreviewStep()
    case 'consent':
      return renderConsentStep()
    case 'importing':
      return renderImportingStep()
    default:
      return renderConnectStep()
  }
}
