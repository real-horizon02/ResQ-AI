import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { Button } from '../components/ui/Button'
import { User, Mail, Shield, Bell, Check } from 'lucide-react'
import { useToast } from '../components/ui/Toast'

export default function ProfileSetup() {
  const { user, profile, fetchProfile } = useAuthStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isVolunteer, setIsVolunteer] = useState(profile?.is_volunteer || false)
  const [skills, setSkills] = useState<string[]>(profile?.skills || [])

  const availableSkills = ['First Aid', 'Search & Rescue', 'Food Distribution', 'Transportation', 'Medical (Doctor/Nurse)']

  const handleSave = async () => {
    if (!user) return
    setLoading(true)
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_volunteer: isVolunteer,
        skills: skills,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (!error) {
      await fetchProfile()
      toast('success', 'Profile updated successfully!')
    }
    setLoading(false)
  }

  const toggleSkill = (skill: string) => {
    setSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-black text-brand-dark">Complete Profile</h1>
          <p className="text-gray-500 mt-2">Personalize your ResQ AI experience</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6">
          {/* Volunteer Status */}
          <div className="p-4 rounded-2xl border-2 transition-all cursor-pointer bg-blue-50/50 border-brand-blue"
               onClick={() => setIsVolunteer(!isVolunteer)}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isVolunteer ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-400'}`}>
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-brand-dark">Rescue Volunteer</p>
                <p className="text-xs text-gray-500">I want to help with rescue operations</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isVolunteer ? 'bg-brand-blue border-brand-blue' : 'border-gray-200'}`}>
                {isVolunteer && <Check className="w-4 h-4 text-white" />}
              </div>
            </div>
          </div>

          {isVolunteer && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Your Skills</p>
              <div className="flex flex-wrap gap-2">
                {availableSkills.map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      skills.includes(skill) 
                        ? 'bg-brand-blue text-white border-brand-blue' 
                        : 'bg-white text-gray-400 border-gray-200 hover:border-brand-blue'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button 
            className="w-full h-12 text-sm font-bold rounded-2xl" 
            onClick={handleSave}
            isLoading={loading}
          >
            Save Profile
          </Button>
        </div>
      </div>
    </div>
  )
}
