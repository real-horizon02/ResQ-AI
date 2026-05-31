const resolveSOS = async (req, res) => {
  const { sosId } = req.body;

  await supabase
    .from('sos_request')
    .update({
      status: 'resolved',
      resolved_at: new Date()
    })
    .eq('id', sosId);

  res.json({ message: "SOS resolved" });
};

export default { resolveSOS };