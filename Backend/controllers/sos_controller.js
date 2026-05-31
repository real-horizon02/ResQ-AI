import { supabase } from '../config/db.js';
import { findNearbyVolunteers } from '../NearByVolunteers.js';
import dotenv from 'dotenv';

dotenv.config();

export const getsos = async (req, res) => {
  try {
    const { data, error } = await supabase.from('sos_requests').select('*');
    if (error) {
      console.error('Error fetching SOS data:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching SOS data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createsos = async (req, res) => {
  try {
    const { name, latitude, longitude } = req.body;
    const { data, error } = await supabase.from('sos_requests').insert([
      { name, latitude, longitude, status: 'pending', created_at: new Date().toISOString() }
    ]).select();

    if (error) {
      console.error('Error creating SOS data:', error);
      return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating SOS data:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const updatesos = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { data, error } = await supabase.from('sos_requests').update({ status }).eq('id', id).select();

    if (error) {
      console.error('Error updating SOS data:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error updating SOS data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const approvesos = async (req, res) => {
  try {
    const { id } = req.body;

    const { data: sosData, error: sosError } = await supabase
      .from('sos_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (sosError || !sosData) {
      return res.status(404).json({ error: 'SOS request not found' });
    }

    const { data: updatedSOS, error: updateError } = await supabase
      .from('sos_requests')
      .update({ status: 'approved' })
      .eq('id', id)
      .select();

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update SOS status' });
    }

    const nearbyVolunteers = await findNearbyVolunteers(sosData.latitude, sosData.longitude, 5000);

    res.json({
      message: 'SOS approved',
      volunteersFound: nearbyVolunteers.length,
      sos: updatedSOS[0],
    });
  } catch (error) {
    console.error('Error approving SOS:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const deletesos = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('sos_requests').delete().eq('id', id).select();

    if (error) {
      console.error('Error deleting SOS data:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json({ message: 'SOS deleted', data });
  } catch (error) {
    console.error('Error deleting SOS data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default { getsos, createsos, updatesos, approvesos, deletesos };