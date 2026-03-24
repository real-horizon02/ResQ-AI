import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { Button } from '../components/ui/Button'
import { Shield, MapPin, Search, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { useToast } from '../components/ui/Toast'

interface Task {
  id: string
  title: string
  description: string
  severity: string
  status: string
  location_name?: string
  created_at: string
}

export default function VolunteerDashboard() {
  const { user } = useAuthStore()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchTasks()
    
    const channel = supabase
      .channel('volunteer_tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'volunteer_tasks' }, () => {
        fetchTasks()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('volunteer_tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setTasks(data)
    }
    setLoading(false)
  }

  const claimTask = async (id: string) => {
    if (!user) return
    const { error } = await supabase
      .from('volunteer_tasks')
      .update({ 
        status: 'claimed',
        assigned_to: user.id
      })
      .eq('id', id)
    
    if (error) toast('error', 'Error claiming task: ' + error.message)
  }

  const completeTask = async (id: string) => {
    const { error } = await supabase
      .from('volunteer_tasks')
      .update({ status: 'completed' })
      .eq('id', id)
    
    if (error) toast('error', 'Error completing task: ' + error.message)
  }

  return (
    <div className="min-h-screen bg-brand-dark/5 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-blue rounded-2xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-brand-dark uppercase tracking-wide">Volunteer Hub</h1>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Active Relief Missions</p>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-brand-dark uppercase">Available</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {tasks.length === 0 && !loading ? (
            <div className="bg-white p-12 rounded-3xl text-center border-2 border-dashed border-gray-100">
              <p className="text-gray-400 font-bold italic">No active missions in your area. Stay safe!</p>
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className={`bg-white rounded-3xl p-6 shadow-xl border-l-8 transition-all hover:scale-[1.01] ${
                task.severity === 'critical' ? 'border-red-500' : 'border-brand-blue'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-white ${
                        task.severity === 'critical' ? 'bg-red-500' : 'bg-brand-blue'
                      }`}>
                        {task.severity}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(task.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-brand-dark leading-tight">{task.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{task.description}</p>
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-brand-blue">
                        <MapPin className="w-3 h-3" /> Location Tagged
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {task.status === 'open' ? (
                      <Button className="rounded-xl px-6" onClick={() => claimTask(task.id)}>Claim Task</Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="bg-green-50 text-green-600 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-green-100">
                          <CheckCircle className="w-4 h-4" /> Claimed
                        </div>
                        <Button variant="outline" className="rounded-xl" onClick={() => completeTask(task.id)}>Resolve</Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
