
@load policy/tuning/json-logs.zeek


redef Log::default_rotation_interval = 60secs;